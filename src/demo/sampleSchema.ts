import { FormSchema } from "../types/schema";

export const sampleSchema: FormSchema = {
  id: "employee-onboarding-form",
  version: "1.0.0",
  meta: {
    title: "Employee Onboarding Form",
    description: "Complete employee information for onboarding",
  },
  globals: {
    companyName: "Acme Corp",
    department: "Engineering",
    country: "India",
    minAge: 18,
  },
  sections: [
    {
      id: "personal",
      label: "Personal Information",
      description: "Basic personal details",
      rows: [
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "firstName", colSpan: 1 },
            { fieldId: "lastName", colSpan: 1 },
          ],
        },
        {
          columns: 3,
          gap: 4,
          items: [
            { fieldId: "email", colSpan: 2 },
            { fieldId: "age", colSpan: 1 },
          ],
        },
        {
          columns: 1,
          items: [{ fieldId: "bio", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "firstName",
          type: "text",
          label: "First Name",
          placeholder: "Enter your first name",
          validators: [
            { type: "required", message: "First name is required" },
            {
              type: "minLength",
              value: 2,
              message: "Must be at least 2 characters",
            },
          ],
        },
        {
          id: "lastName",
          type: "text",
          label: "Last Name",
          placeholder: "Enter your last name",
          validators: [{ type: "required", message: "Last name is required" }],
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "you@example.com",
          helpText: "We'll use this for official communication",
          validators: [
            { type: "required", message: "Email is required" },
            { type: "email", message: "Please enter a valid email" },
          ],
        },
        {
          id: "age",
          type: "number",
          label: "Age",
          placeholder: "Your age",
          validators: [
            { type: "required", message: "Age is required" },
            {
              type: "min",
              value: 18,
              message: "Must be at least 18 years old",
            },
            { type: "max", value: 100, message: "Invalid age" },
          ],
        },
        {
          id: "bio",
          type: "textarea",
          label: "Brief Bio",
          placeholder: "Tell us about yourself...",
          helpText: "Optional: Share a brief introduction",
        },
      ],
    },
    {
      id: "employment",
      label: "Employment Details",
      description: "Job-related information",
      rows: [
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "position", colSpan: 1 },
            { fieldId: "department", colSpan: 1 },
          ],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "startDate", colSpan: 1 },
            { fieldId: "employmentType", colSpan: 1 },
          ],
        },
        {
          columns: 1,
          items: [{ fieldId: "remoteWork", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "position",
          type: "select",
          label: "Position",
          placeholder: "Select your position",
          validators: [{ type: "required", message: "Position is required" }],
          options: {
            source: "STATIC",
            options: [
              { label: "Software Engineer", value: "software_engineer" },
              {
                label: "Senior Software Engineer",
                value: "senior_software_engineer",
              },
              { label: "Staff Engineer", value: "staff_engineer" },
              { label: "Engineering Manager", value: "engineering_manager" },
              { label: "Product Manager", value: "product_manager" },
              { label: "Designer", value: "designer" },
            ],
          },
        },
        {
          id: "department",
          type: "text",
          label: "Department",
          defaultValue: "${globals.department}",
          readOnly: true,
          helpText: "Auto-filled from company settings",
        },
        {
          id: "startDate",
          type: "date",
          label: "Start Date",
          validators: [{ type: "required", message: "Start date is required" }],
        },
        {
          id: "employmentType",
          type: "radio",
          label: "Employment Type",
          validators: [
            { type: "required", message: "Please select employment type" },
          ],
          options: {
            source: "STATIC",
            options: [
              { label: "Full-time", value: "full_time" },
              { label: "Part-time", value: "part_time" },
              { label: "Contract", value: "contract" },
              { label: "Intern", value: "intern" },
            ],
          },
        },
        {
          id: "remoteWork",
          type: "switch",
          label: "Remote Work",
          defaultValue: false,
        },
      ],
    },
    {
      id: "identification",
      label: "Identification",
      description: "Government ID information",
      visibilityRule: {
        ">=": [{ var: "age" }, { var: "globals.minAge" }],
      },
      rows: [
        {
          columns: 2,
          gap: 4,
          items: [{ fieldId: "hasSSN", colSpan: 2 }],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "ssn", colSpan: 1 },
            { fieldId: "panNumber", colSpan: 1 },
          ],
        },
      ],
      fields: [
        {
          id: "hasSSN",
          type: "checkbox",
          label: "I have a Social Security Number",
          defaultValue: false,
        },
        {
          id: "ssn",
          type: "text",
          label: "Social Security Number",
          placeholder: "XXX-XX-XXXX",
          disabled: true,
          rules: [
            {
              id: "ssn_enable_rule",
              when: { "==": [{ var: "hasSSN" }, true] },
              then: { type: "ENABLE", target: "ssn" },
              else: { type: "DISABLE", target: "ssn" },
            },
          ],
          validators: [
            {
              type: "required",
              message: "SSN is required",
              when: { "==": [{ var: "hasSSN" }, true] },
            },
            {
              type: "regex",
              value: "^\\d{3}-\\d{2}-\\d{4}$",
              message: "Format: XXX-XX-XXXX",
              when: { "==": [{ var: "hasSSN" }, true] },
            },
          ],
        },
        {
          id: "panNumber",
          type: "text",
          label: "PAN Number",
          placeholder: "ABCDE1234F",
          helpText: "Required for tax purposes",
          disabled: true,
          rules: [
            {
              id: "pan_enable_rule",
              when: {
                and: [
                  { ">=": [{ var: "age" }, 18] },
                  { "!=": [{ var: "globals.country" }, "USA"] },
                ],
              },
              then: { type: "ENABLE", target: "panNumber" },
              else: { type: "DISABLE", target: "panNumber" },
            },
          ],
          validators: [
            {
              type: "regex",
              value: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
              message: "Invalid PAN format",
              when: {
                and: [
                  { ">=": [{ var: "age" }, 18] },
                  { "!=": [{ var: "globals.country" }, "USA"] },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: "preferences",
      label: "Preferences",
      description: "Your work preferences",
      rows: [
        {
          columns: 1,
          items: [{ fieldId: "skills", colSpan: 1 }],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "shirtSize", colSpan: 1 },
            { fieldId: "dietaryRestrictions", colSpan: 1 },
          ],
        },
        {
          columns: 1,
          items: [{ fieldId: "notes", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "skills",
          type: "multi-select",
          label: "Technical Skills",
          placeholder: "Select your skills",
          helpText: "Select all that apply",
          validators: [
            {
              type: "minLength",
              value: 1,
              message: "Select at least one skill",
            },
          ],
          options: {
            source: "STATIC",
            options: [
              { label: "JavaScript", value: "javascript" },
              { label: "TypeScript", value: "typescript" },
              { label: "React", value: "react" },
              { label: "Vue", value: "vue" },
              { label: "Angular", value: "angular" },
              { label: "Node.js", value: "nodejs" },
              { label: "Python", value: "python" },
              { label: "Java", value: "java" },
              { label: "Go", value: "go" },
              { label: "Rust", value: "rust" },
            ],
          },
        },
        {
          id: "shirtSize",
          type: "select",
          label: "T-Shirt Size",
          placeholder: "Select size",
          options: {
            source: "STATIC",
            options: [
              { label: "XS", value: "xs" },
              { label: "S", value: "s" },
              { label: "M", value: "m" },
              { label: "L", value: "l" },
              { label: "XL", value: "xl" },
              { label: "XXL", value: "xxl" },
            ],
          },
        },
        {
          id: "dietaryRestrictions",
          type: "text",
          label: "Dietary Restrictions",
          placeholder: "e.g., Vegetarian, Gluten-free",
          helpText: "Optional: For office events",
        },
        {
          id: "notes",
          type: "textarea",
          label: "Additional Notes",
          placeholder: "Any additional information you'd like to share...",
        },
      ],
    },
  ],
  formRules: [],
  navigation: {
    type: "tabs",
    validateOnNext: true,
    allowSkip: true,
    allowReset: true, // Enable reset functionality
  },
  submission: {
    stripHiddenFields: true,
    stripDisabledFields: true,
  },
};

// Example without ID (will be auto-generated)
export const sampleSchemaNoId: FormSchema = {
  version: "1.0.0",
  meta: {
    title: "Simple Contact Form",
    description: "A form without an explicit ID",
  },
  sections: [
    {
      id: "contact",
      label: "Contact Information",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Name",
          validators: [{ type: "required", message: "Name is required" }],
        },
        {
          id: "email",
          type: "email",
          label: "Email",
          validators: [{ type: "required", message: "Email is required" }],
        },
      ],
    },
  ],
};

// Example with remote options
export const sampleSchemaWithRemote: FormSchema = {
  ...sampleSchema,
  sections: [
    ...sampleSchema.sections.slice(0, 2),
    {
      id: "location",
      label: "Location",
      rows: [
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "country", colSpan: 1 },
            { fieldId: "state", colSpan: 1 },
          ],
        },
      ],
      fields: [
        {
          id: "country",
          type: "select",
          label: "Country",
          placeholder: "Select country",
          validators: [{ type: "required", message: "Country is required" }],
          options: {
            source: "REMOTE",
            url: "https://restcountries.com/v3.1/all",
            itemsPath: "",
            labelKey: "name.common",
            valueKey: "cca2",
          },
        },
        {
          id: "state",
          type: "select",
          label: "State/Province",
          placeholder: "Select state",
          validators: [{ type: "required", message: "State is required" }],
          options: {
            source: "REMOTE",
            url: "https://api.example.com/states/${country}",
            dependencies: ["country"],
            itemsPath: "data.states",
            labelKey: "name",
            valueKey: "code",
          },
        },
      ],
    },
    ...sampleSchema.sections.slice(2),
  ],
};
