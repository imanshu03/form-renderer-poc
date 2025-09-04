import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormSchema,
  FormSnapshot,
  GlobalContext,
  Section,
} from '../types/schema';
import {
  createSnapshot,
  updateSnapshot,
  buildPayload,
} from '../engine/engine';
import { createFormSchema } from '../engine/validation';
import { SectionRenderer } from './SectionRenderer';
import { SectionsNav } from './SectionsNav';
import { SectionActions } from './SectionActions';
import { cn } from '@/lib/utils';
import { generateFormId } from '../utils/generateId';

export interface FormRendererProps {
  schema: FormSchema;
  globals?: GlobalContext;
  onSubmit: (data: any) => void | Promise<void>;
  className?: string;
}

export function FormRenderer({
  schema,
  globals: propsGlobals,
  onSubmit,
  className,
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
  const mergedGlobals = useMemo(() => ({
    ...schema.globals,
    ...propsGlobals,
  }), [schema.globals, propsGlobals]);
  
  // Initialize form snapshot
  const [snapshot, setSnapshot] = useState<FormSnapshot>(() =>
    createSnapshot(schema, mergedGlobals)
  );

  // Track current section for navigation
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Get visible sections
  const visibleSections = useMemo(() => {
    return schema.sections.filter(
      section => snapshot.ui.sections[section.id]?.visible
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
    mode: 'onChange',
  });

  const { watch, handleSubmit, setValue, trigger, formState, reset } = methods;

  // Watch all form values
  const watchedValues = watch();

  // Update snapshot when values change
  useEffect(() => {
    let newSnapshot = snapshot;
    
    // Check for changes and update snapshot
    Object.keys(watchedValues).forEach(fieldId => {
      if (watchedValues[fieldId] !== snapshot.values[fieldId]) {
        newSnapshot = updateSnapshot(newSnapshot, fieldId, watchedValues[fieldId]);
      }
    });

    if (newSnapshot !== snapshot) {
      setSnapshot(newSnapshot);

      // Clear values for hidden fields if configured
      if (schema.submission?.stripHiddenFields) {
        Object.keys(newSnapshot.ui.fields).forEach(fieldId => {
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
      return isValid;
    }

    return true;
  }, [currentSection, schema, trigger]);

  const handleNext = useCallback(async () => {
    if (await canGoNext()) {
      setCurrentSectionIndex(prev => 
        Math.min(prev + 1, visibleSections.length - 1)
      );
    }
  }, [canGoNext, visibleSections.length]);

  const handlePrevious = useCallback(() => {
    setCurrentSectionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSectionClick = useCallback(async (index: number) => {
    // If moving forward, validate current section first
    if (index > currentSectionIndex && schema.navigation?.validateOnNext) {
      if (!(await canGoNext())) {
        return;
      }
    }

    setCurrentSectionIndex(index);
  }, [currentSectionIndex, schema.navigation, canGoNext]);

  // Reset handler
  const handleReset = useCallback(() => {
    // Reset to initial values
    reset(initialValues);
    
    // Reset the snapshot to initial state
    const newSnapshot = createSnapshot(schema, mergedGlobals);
    setSnapshot(newSnapshot);
  }, [reset, initialValues, schema, mergedGlobals]);

  // Submit handler
  const handleFormSubmit = handleSubmit(async () => {
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
  });

  // Layout based on navigation type
  const renderLayout = () => {
    if (schema.navigation?.type === 'single' || !schema.navigation) {
      // Single page layout - render all visible sections
      return (
        <div className="space-y-8">
          {visibleSections.map(section => (
            <SectionRenderer
              key={section.id}
              section={section}
              schema={schema}
              snapshot={snapshot}
            />
          ))}
          <div className="flex justify-end">
            <SectionActions
              onSave={handleFormSubmit}
              onReset={handleReset}
              canSave={formState.isValid}
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
        <div className="w-64 flex-shrink-0">
          <SectionsNav
            sections={visibleSections}
            currentIndex={currentSectionIndex}
            onSectionClick={handleSectionClick}
            errors={formState.errors}
            navigationType={schema.navigation?.type || 'tabs'}
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
              <div className="mt-8">
                <SectionActions
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSave={handleFormSubmit}
                  onReset={handleReset}
                  canNext={currentSectionIndex < visibleSections.length - 1}
                  canPrevious={currentSectionIndex > 0}
                  canSave={formState.isValid}
                  isLastSection={currentSectionIndex === visibleSections.length - 1}
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
    <FormProvider {...methods}>
      <form 
        onSubmit={handleFormSubmit}
        className={cn('w-full', className)}
      >
        {renderLayout()}
      </form>
    </FormProvider>
  );
}

// Helper function to get field IDs from a section
function getSectionFieldIds(section: Section, schema: FormSchema): string[] {
  const fieldIds: string[] = [];

  if (section.fields) {
    fieldIds.push(...section.fields.map(f => f.id));
  }

  if (section.rows) {
    section.rows.forEach(row => {
      row.items.forEach(item => {
        fieldIds.push(item.fieldId);
      });
    });
  }

  return [...new Set(fieldIds)];
}