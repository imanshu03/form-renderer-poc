import { z, ZodTypeAny, ZodError } from "zod";
import {
  FieldBase,
  Validator,
  FormSnapshot,
  Section,
  FormSchema,
} from "../types/schema";
import { evaluate } from "./jsonlogic";

/**
 * Creates a Zod schema from a field definition
 */
export function zodFromField(
  field: FieldBase,
  snapshot?: FormSnapshot
): ZodTypeAny {
  let schema: ZodTypeAny;

  // Base schema based on field type
  switch (field.type) {
    case "text":
    case "textarea":
    case "tel":
    case "url":
    case "email":
    case "hidden":
      schema = z.string();
      break;

    case "number":
      schema = z.number().nullable();
      break;

    case "checkbox":
    case "switch":
      schema = z.boolean();
      break;

    case "select":
    case "radio":
      schema = z.union([z.string(), z.number()]);
      break;

    case "multi-select":
    case "checkbox-group":
      schema = z.array(z.union([z.string(), z.number()]));
      break;

    case "date":
    case "datetime":
    case "time":
      schema = z.string(); // ISO date strings
      break;

    case "file":
      schema = z.any(); // File handling varies
      break;

    case "info":
      schema = z.any().optional(); // Info fields are informational only
      break;

    case "heading":
      schema = z.any().optional(); // Heading fields are display only
      break;

    case "table":
      schema = z.array(z.record(z.any())); // Array of row objects
      break;

    default:
      schema = z.any();
  }

  // Apply validators
  if (field.validators) {
    field.validators.forEach((validator) => {
      // Check conditional validation
      if (validator.when && snapshot) {
        const context = {
          data: snapshot.values,
          globals: snapshot.globals,
        };

        if (!evaluate(validator.when, context)) {
          return; // Skip this validator
        }
      }

      schema = applyValidator(schema, validator, field.type);
    });
  }

  return schema;
}

/**
 * Applies a validator to a Zod schema
 */
function applyValidator(
  schema: ZodTypeAny,
  validator: Validator,
  fieldType: string
): ZodTypeAny {
  const message = validator.message;

  switch (validator.type) {
    case "required":
      if (fieldType === "checkbox" || fieldType === "switch") {
        return (schema as z.ZodBoolean).refine((val) => val === true, {
          message: message || "This field is required",
        });
      }
      if (fieldType === "multi-select" || fieldType === "checkbox-group") {
        return (schema as z.ZodArray<any>).min(
          1,
          message || "Please select at least one option"
        );
      }
      if (fieldType === "number") {
        return schema.refine((val) => val !== null && val !== undefined, {
          message: message || "This field is required",
        });
      }
      if (fieldType === "select" || fieldType === "radio") {
        return schema.refine((val) => val !== null && val !== undefined && val !== "", {
          message: message || "This field is required",
        });
      }
      if (fieldType === "date" || fieldType === "datetime" || fieldType === "time") {
        return schema.refine((val) => val !== null && val !== undefined && val !== "", {
          message: message || "This field is required",
        });
      }
      return (schema as z.ZodString).min(
        1,
        message || "This field is required"
      );

    case "email":
      return (schema as z.ZodString).email(message || "Invalid email address");

    case "url":
      return (schema as z.ZodString).url(message || "Invalid URL");

    case "regex":
      if (validator.value) {
        const regex = new RegExp(validator.value);
        return (schema as z.ZodString).regex(
          regex,
          message || "Invalid format"
        );
      }
      return schema;

    case "min":
      if (validator.value !== undefined) {
        if (fieldType === "number") {
          return schema.refine(
            (val) =>
              val !== null && val !== undefined && val >= validator.value!,
            {
              message: message || `Value must be at least ${validator.value}`,
            }
          );
        }
        return (schema as z.ZodString).min(validator.value, message);
      }
      return schema;

    case "max":
      if (validator.value !== undefined) {
        if (fieldType === "number") {
          return schema.refine(
            (val) =>
              val !== null && val !== undefined && val <= validator.value!,
            {
              message: message || `Value must be at most ${validator.value}`,
            }
          );
        }
        return (schema as z.ZodString).max(validator.value, message);
      }
      return schema;

    case "minLength":
      if (validator.value !== undefined) {
        if (fieldType === "multi-select" || fieldType === "checkbox-group") {
          return (schema as z.ZodArray<any>).min(validator.value, message);
        }
        return (schema as z.ZodString).min(validator.value, message);
      }
      return schema;

    case "maxLength":
      if (validator.value !== undefined) {
        if (fieldType === "multi-select" || fieldType === "checkbox-group") {
          return (schema as z.ZodArray<any>).max(validator.value, message);
        }
        return (schema as z.ZodString).max(validator.value, message);
      }
      return schema;

    case "custom":
      // Custom validation via JsonLogic
      if (validator.value) {
        return schema.refine(
          (val) => {
            // Evaluate custom JsonLogic expression
            const context = { data: { value: val } };
            return evaluate(validator.value, context);
          },
          { message: message || "Validation failed" }
        );
      }
      return schema;

    default:
      return schema;
  }
}

/**
 * Creates a dynamic Zod schema for a section
 */
export function createSectionSchema(
  section: Section,
  schema: FormSchema,
  snapshot: FormSnapshot
): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {};

  // Get all fields in the section
  const fields = getAllFieldsFromSection(section, schema);

  fields.forEach((field) => {
    const fieldUI = snapshot.ui.fields[field.id];

    // Only include visible and enabled fields in validation
    if (fieldUI && fieldUI.visible && !fieldUI.disabled) {
      shape[field.id] = zodFromField(field, snapshot);
    } else {
      // Optional for hidden/disabled fields
      shape[field.id] = z.any().optional();
    }
  });

  return z.object(shape);
}

/**
 * Creates a dynamic Zod schema for the entire form
 */
export function createFormSchema(
  formSchema: FormSchema,
  snapshot: FormSnapshot
): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {};

  formSchema.sections.forEach((section) => {
    const sectionUI = snapshot.ui.sections[section.id];

    // Only validate visible sections
    if (sectionUI && sectionUI.visible) {
      const fields = getAllFieldsFromSection(section, formSchema);

      fields.forEach((field) => {
        const fieldUI = snapshot.ui.fields[field.id];

        // Only include visible and enabled fields
        if (fieldUI && fieldUI.visible && !fieldUI.disabled) {
          shape[field.id] = zodFromField(field, snapshot);
        } else {
          shape[field.id] = z.any().optional();
        }
      });
    }
  });

  return z.object(shape);
}

/**
 * Validates a single field value
 */
export function validateField(
  field: FieldBase,
  value: any,
  snapshot?: FormSnapshot
): { success: boolean; error?: string } {
  try {
    const schema = zodFromField(field, snapshot);
    schema.parse(value);
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return {
      success: false,
      error: "Validation failed",
    };
  }
}

/**
 * Validates all fields in a section
 */
export function validateSection(
  section: Section,
  formSchema: FormSchema,
  values: Record<string, any>,
  snapshot: FormSnapshot
): { success: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const sectionSchema = createSectionSchema(section, formSchema, snapshot);

  try {
    sectionSchema.parse(values);
    return { success: true, errors };
  } catch (error) {
    if (error instanceof ZodError) {
      error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          errors[String(err.path[0])] = err.message;
        }
      });
    }
    return { success: false, errors };
  }
}

/**
 * Helper to get all fields from a section
 */
function getAllFieldsFromSection(
  section: Section,
  schema: FormSchema
): FieldBase[] {
  const fields: FieldBase[] = [];
  const fieldMap = new Map<string, FieldBase>();

  // Collect fields from the section
  if (section.fields) {
    section.fields.forEach((field) => {
      fieldMap.set(field.id, field);
    });
  }

  // For rows-based layout
  if (section.rows) {
    section.rows.forEach((row) => {
      row.items.forEach((item) => {
        const field = fieldMap.get(item.fieldId);
        if (field && !fields.find((f) => f.id === field.id)) {
          fields.push(field);
        }
      });
    });
  }

  // Add remaining fields not in rows
  fieldMap.forEach((field) => {
    if (!fields.find((f) => f.id === field.id)) {
      fields.push(field);
    }
  });

  return fields;
}
