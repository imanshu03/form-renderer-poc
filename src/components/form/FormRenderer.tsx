import { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useFormStore } from '@/store/formStore';
import { SectionRenderer } from './SectionRenderer';
import { Button } from '@/components/ui/button';
import { runRules } from '@/lib/rule-engine';
import { RuleSchema, FieldSchema } from '@/types/form-schema';
import { FormDevTool } from '../devtools/FormDevTool';

export function FormRenderer() {
  const {
    schema,
    currentSectionIndex,
    setCurrentSection,
    visibleSections,
    enabledSections,
    setFieldVisibility,
    setFieldEnabled,
    setSectionVisibility,
    setSectionEnabled,
    contextValues,
  } = useFormStore();

  const form = useForm({
    defaultValues: useMemo(() => {
      const values: Record<string, any> = {};
      schema?.sections.forEach((s) =>
        s.fields.forEach((f) => (values[f.id] = f.defaultValue ?? ''))
      );
      return values;
    }, [schema]),
  });

  const helpers = {
    getValue: (field: string) => form.getValues(field),
    context: contextValues,
    setFieldVisibility,
    setFieldEnabled,
    setSectionVisibility,
    setSectionEnabled,
    setValue: form.setValue,
  };

  // run load rules
  useEffect(() => {
    if (!schema) return;
    schema.sections.forEach((sec) => {
      runRules(filterRules(sec.rules, 'load'), helpers);
      sec.fields.forEach((f) => runRules(filterRules(f.rules, 'load'), helpers));
    });
  }, [schema]);

  // watch for change rules
  useEffect(() => {
    if (!schema) return;
    const fieldMap: Record<string, FieldSchema> = {};
    schema.sections.forEach((s) => s.fields.forEach((f) => (fieldMap[f.id] = f)));
    const subscription = form.watch((_, info) => {
      const name = info.name as string;
      const field = fieldMap[name];
      if (field) {
        runRules(filterRules(field.rules, 'change'), helpers);
      }
    });
    return () => subscription.unsubscribe();
  }, [schema, form.watch]);

  if (!schema) return null;

  const currentSection = schema.sections[currentSectionIndex];

  const visibleSectionIndices = useMemo(
    () =>
      schema.sections
        .map((sec, idx) => ({ sec, idx }))
        .filter(({ sec }) => visibleSections[sec.id]),
    [schema, visibleSections]
  );

  const currentVisibleIndex = visibleSectionIndices.findIndex(
    ({ idx }) => idx === currentSectionIndex
  );

  const isFirstSection = currentVisibleIndex === 0;
  const isLastSection =
    currentVisibleIndex === visibleSectionIndices.length - 1;

  const nextSectionIndex = visibleSectionIndices[currentVisibleIndex + 1]?.idx;
  const prevSectionIndex = visibleSectionIndices[currentVisibleIndex - 1]?.idx;

  const [isSectionValid, setIsSectionValid] = useState(false);

  useEffect(() => {
    form
      .trigger(currentSection.fields.map((f) => f.id))
      .then(setIsSectionValid);
  }, [currentSection, form]);

  useEffect(() => {
    const subscription = form.watch((_, info) => {
      const name = info.name as string;
      if (currentSection.fields.some((f) => f.id === name)) {
        form
          .trigger(currentSection.fields.map((f) => f.id))
          .then(setIsSectionValid);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, currentSection, form]);

  const onSubmit = (values: any) => {
    schema.sections.forEach((sec) =>
      runRules(filterRules(sec.rules, 'submit'), helpers)
    );
    schema.sections.forEach((sec) =>
      sec.fields.forEach((f) => runRules(filterRules(f.rules, 'submit'), helpers))
    );
    console.log('submit', values);
  };

  return (
    <div className="flex h-full">
      <nav className="w-64 border-r p-4 space-y-2">
        {schema.sections.map((sec, idx) =>
          visibleSections[sec.id] ? (
            <Button
              variant={idx === currentSectionIndex ? 'default' : 'ghost'}
              key={sec.id}
              className="w-full justify-start"
              onClick={() => setCurrentSection(idx)}
              disabled={!enabledSections[sec.id]}
            >
              {sec.title}
            </Button>
          ) : null
        )}
      </nav>
      <div className="flex-1 p-6 overflow-y-auto">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SectionRenderer section={currentSection} />
            <div className="flex justify-end gap-2 pt-4">
              {!isFirstSection && (
                <Button
                  type="button"
                  onClick={() =>
                    prevSectionIndex !== undefined &&
                    setCurrentSection(prevSectionIndex)
                  }
                  variant="secondary"
                >
                  Previous
                </Button>
              )}
              {!isLastSection && (
                <Button
                  type="button"
                  onClick={() =>
                    nextSectionIndex !== undefined &&
                    setCurrentSection(nextSectionIndex)
                  }
                  disabled={!isSectionValid}
                >
                  Next
                </Button>
              )}
              {isLastSection && <Button type="submit">Save</Button>}
            </div>
          </form>
          <FormDevTool />
        </FormProvider>
      </div>
    </div>
  );
}

function filterRules(rules: RuleSchema[] | undefined, event: string) {
  return rules?.filter((r) => r.event === event);
}
