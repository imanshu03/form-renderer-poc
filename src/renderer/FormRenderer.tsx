import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormSchema,
  FormSnapshot,
  GlobalContext,
  Section,
} from "../types/schema";
import { createSnapshot, updateSnapshot, buildPayload } from "../engine/engine";
import { createFormSchema } from "../engine/validation";
import { SectionRenderer } from "./SectionRenderer";
import { SectionsNav } from "./SectionsNav";
import { SectionActions } from "./SectionActions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateFormId } from "../utils/generateId";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface FormRendererProps {
  schema: FormSchema;
  globals?: GlobalContext;
  onSubmit: (data: any) => void | Promise<void>;
  className?: string;
  title?: string;
  description?: string;
}

export function FormRenderer({
  schema,
  globals: propsGlobals,
  onSubmit,
  className,
  title,
  description,
}: FormRendererProps) {
  // Ensure schema has an ID (generate if not present)
  const formId = useMemo(() => {
    if (schema.id) {
      return schema.id;
    }
    // Generate and cache the ID for this schema instance
    const newId = generateFormId();
    // Note: In production, you might want to mutate the schema or handle this differently
    return newId;
  }, [schema]);

  // Merge schema globals with props globals (props take precedence)
  const mergedGlobals = useMemo(
    () => ({
      ...schema.globals,
      ...propsGlobals,
    }),
    [schema.globals, propsGlobals]
  );

  // Initialize form snapshot
  const [snapshot, setSnapshot] = useState<FormSnapshot>(() =>
    createSnapshot(schema, mergedGlobals)
  );

  // Track current section for navigation
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Get visible sections
  const visibleSections = useMemo(() => {
    return schema.sections.filter(
      (section) => snapshot.ui.sections[section.id]?.visible
    );
  }, [schema.sections, snapshot.ui.sections]);

  // Current section
  const currentSection = visibleSections[currentSectionIndex];

  // Create dynamic Zod schema
  const validationSchema = useMemo(() => {
    return createFormSchema(schema, snapshot);
  }, [schema, snapshot]);

  // Store initial values for reset functionality
  const initialValues = useMemo(() => snapshot.values, []);

  // Initialize react-hook-form
  const methods = useForm({
    defaultValues: snapshot.values,
    resolver: zodResolver(validationSchema),
    mode: "onChange",
  });

  const { watch, handleSubmit, setValue, trigger, formState, reset } = methods;

  // Watch all form values
  const watchedValues = watch();

  // Update snapshot when values change
  useEffect(() => {
    let newSnapshot = snapshot;

    // Check for changes and update snapshot
    Object.keys(watchedValues).forEach((fieldId) => {
      if (watchedValues[fieldId] !== snapshot.values[fieldId]) {
        newSnapshot = updateSnapshot(
          newSnapshot,
          fieldId,
          watchedValues[fieldId]
        );
      }
    });

    if (newSnapshot !== snapshot) {
      setSnapshot(newSnapshot);

      // Clear values for hidden fields if configured
      if (schema.submission?.stripHiddenFields) {
        Object.keys(newSnapshot.ui.fields).forEach((fieldId) => {
          if (!newSnapshot.ui.fields[fieldId].visible) {
            setValue(fieldId, undefined);
          }
        });
      }
    }
  }, [watchedValues, snapshot, setValue, schema.submission]);

  // Navigation handlers
  const canGoNext = useCallback(async () => {
    if (!currentSection) return false;

    // Validate current section if configured
    if (schema.navigation?.validateOnNext) {
      // Get all field IDs in current section
      const sectionFields = getSectionFieldIds(currentSection, schema);
      const isValid = await trigger(sectionFields);

      // If validation fails but allowSkip is enabled, still allow navigation
      if (!isValid && schema.navigation?.allowSkip) {
        return true;
      }

      return isValid;
    }

    return true;
  }, [currentSection, schema, trigger]);

  const handleNext = useCallback(async () => {
    if (await canGoNext()) {
      setCurrentSectionIndex((prev) =>
        Math.min(prev + 1, visibleSections.length - 1)
      );
    }
  }, [canGoNext, visibleSections.length]);

  const handlePrevious = useCallback(() => {
    setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSectionClick = useCallback(
    async (index: number) => {
      // If moving forward and validation is configured, run validation
      if (index > currentSectionIndex && schema.navigation?.validateOnNext) {
        // Always run validation to show errors
        const sectionFields = getSectionFieldIds(currentSection, schema);
        const isValid = await trigger(sectionFields);

        // If validation fails and allowSkip is disabled, prevent navigation
        if (!isValid && !schema.navigation?.allowSkip) {
          return;
        }
        // If validation fails but allowSkip is enabled, continue with navigation
        // The errors are already displayed by the trigger() call
      }

      setCurrentSectionIndex(index);
    },
    [currentSectionIndex, currentSection, schema, trigger]
  );

  // Reset handler
  const handleReset = useCallback(() => {
    // Reset to initial values
    reset(initialValues);

    // Reset the snapshot to initial state
    const newSnapshot = createSnapshot(schema, mergedGlobals);
    setSnapshot(newSnapshot);
  }, [reset, initialValues, schema, mergedGlobals]);

  // Submit handler - bypasses validation if allowSaveOnAll is enabled
  const handleFormSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // If allowSaveOnAll is enabled, bypass validation entirely
      if (schema.navigation?.allowSaveOnAll) {
        const formData = buildPayload(
          snapshot,
          schema.submission?.stripHiddenFields,
          schema.submission?.stripDisabledFields
        );

        // Apply custom transformation if provided
        const transformedData = schema.submission?.transformPayload
          ? schema.submission.transformPayload(formData)
          : formData;

        // Wrap the payload with form ID
        const finalPayload = {
          id: formId,
          formData: transformedData,
        };

        await onSubmit(finalPayload);
        return;
      }

      // Otherwise, use React Hook Form's validation
      return handleSubmit(async () => {
        const formData = buildPayload(
          snapshot,
          schema.submission?.stripHiddenFields,
          schema.submission?.stripDisabledFields
        );

        // Apply custom transformation if provided
        const transformedData = schema.submission?.transformPayload
          ? schema.submission.transformPayload(formData)
          : formData;

        // Wrap the payload with form ID
        const finalPayload = {
          id: formId,
          formData: transformedData,
        };

        await onSubmit(finalPayload);
      })(e);
    },
    [schema, snapshot, formId, onSubmit, handleSubmit]
  );

  // Render top action bar component
  const renderTopActionBar = () => (
    <div className="flex gap-2">
      {/* Reset button - first */}
      {schema.navigation?.allowReset && (
        <Button type="button" variant="outline" onClick={handleReset} size="sm">
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}

      {/* Save button - second */}
      <Button
        type={schema.navigation?.allowSaveOnAll ? "button" : "submit"}
        onClick={handleFormSubmit}
        disabled={!schema.navigation?.allowSaveOnAll && !formState.isValid}
        size="sm"
        variant="outline"
      >
        <Save className="h-4 w-4" />
      </Button>

      {/* Navigation buttons - for multi-section only */}
      {schema.navigation?.type !== "single" && schema.navigation && (
        <>
          {/* Previous button - third */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Next button - fourth */}
          <Button
            type="button"
            variant="outline"
            onClick={handleNext}
            disabled={currentSectionIndex >= visibleSections.length - 1}
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  // Layout based on navigation type
  const renderLayout = () => {
    if (schema.navigation?.type === "single" || !schema.navigation) {
      // Single page layout - render all visible sections
      return (
        <div className="space-y-8">
          {visibleSections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              schema={schema}
              snapshot={snapshot}
            />
          ))}
          {/* Bottom Action Bar - Text buttons */}
          <div className="flex justify-end">
            <SectionActions
              onSave={handleFormSubmit}
              onReset={handleReset}
              canSave={schema.navigation?.allowSaveOnAll || formState.isValid}
              isLastSection={true}
              isFirstSection={true}
              showNavigation={false}
              showReset={schema.navigation?.allowReset}
            />
          </div>
        </div>
      );
    }

    // Multi-section layout with navigation
    return (
      <div className="flex gap-6">
        {/* Left sidebar navigation */}
        <div className="min-w-64 max-w-[300px] flex-shrink-0">
          <SectionsNav
            sections={visibleSections}
            currentIndex={currentSectionIndex}
            onSectionClick={handleSectionClick}
            errors={formState.errors}
            navigationType={schema.navigation?.type || "tabs"}
          />
        </div>

        {/* Right content area */}
        <div className="flex-1">
          {currentSection && (
            <>
              <SectionRenderer
                section={currentSection}
                schema={schema}
                snapshot={snapshot}
              />
              {/* Bottom Action Bar - Text buttons */}
              <div className="mt-8">
                <SectionActions
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSave={handleFormSubmit}
                  onReset={handleReset}
                  canNext={currentSectionIndex < visibleSections.length - 1}
                  canPrevious={currentSectionIndex > 0}
                  canSave={
                    schema.navigation?.allowSaveOnAll || formState.isValid
                  }
                  isLastSection={
                    currentSectionIndex === visibleSections.length - 1
                  }
                  isFirstSection={currentSectionIndex === 0}
                  showReset={schema.navigation?.allowReset}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title || schema.meta?.title}</CardTitle>
            {(description || schema.meta?.description) && (
              <CardDescription className="mt-2">
                {description || schema.meta?.description}
              </CardDescription>
            )}
          </div>
          <div className="flex-shrink-0">{renderTopActionBar()}</div>
        </div>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit} className="w-full">
            {renderLayout()}
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

// Helper function to get field IDs from a section
function getSectionFieldIds(section: Section, schema: FormSchema): string[] {
  const fieldIds: string[] = [];

  if (section.fields) {
    fieldIds.push(...section.fields.map((f) => f.id));
  }

  if (section.rows) {
    section.rows.forEach((row) => {
      row.items.forEach((item) => {
        fieldIds.push(item.fieldId);
      });
    });
  }

  return [...new Set(fieldIds)];
}
