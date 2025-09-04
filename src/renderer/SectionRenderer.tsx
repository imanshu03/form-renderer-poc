import React from 'react';
import { Section, FormSchema, FormSnapshot, FieldBase } from '../types/schema';
import { FieldRenderer } from './FieldRenderer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface SectionRendererProps {
  section: Section;
  schema: FormSchema;
  snapshot: FormSnapshot;
  className?: string;
}

export function SectionRenderer({
  section,
  schema,
  snapshot,
  className,
}: SectionRendererProps) {
  const sectionUI = snapshot.ui.sections[section.id];

  // Don't render if section is hidden
  if (!sectionUI?.visible) {
    return null;
  }

  // Get all fields for this section
  const fieldsMap = new Map<string, FieldBase>();
  if (section.fields) {
    section.fields.forEach(field => {
      fieldsMap.set(field.id, field);
    });
  }

  // Render content based on layout type
  const renderContent = () => {
    // Modern rows-based layout
    if (section.rows && section.rows.length > 0) {
      return (
        <div className="space-y-4">
          {section.rows.map((row, rowIndex) => {
            const gridCols = `grid-cols-${row.columns}`;
            const gapClass = row.gap ? `gap-${row.gap}` : 'gap-4';

            return (
              <div
                key={row.id || rowIndex}
                className={cn(
                  'grid',
                  gridCols,
                  gapClass
                )}
              >
                {row.items.map((item, itemIndex) => {
                  const field = fieldsMap.get(item.fieldId);
                  
                  if (!field) {
                    console.warn(`Field ${item.fieldId} not found in section ${section.id}`);
                    return null;
                  }

                  // Build responsive classes
                  const colSpanClasses = [];
                  
                  // Default col-span
                  if (item.colSpan) {
                    colSpanClasses.push(`col-span-${item.colSpan}`);
                  } else {
                    colSpanClasses.push('col-span-1');
                  }

                  // Responsive col-spans
                  if (item.xs) colSpanClasses.push(`xs:col-span-${item.xs}`);
                  if (item.sm) colSpanClasses.push(`sm:col-span-${item.sm}`);
                  if (item.md) colSpanClasses.push(`md:col-span-${item.md}`);
                  if (item.lg) colSpanClasses.push(`lg:col-span-${item.lg}`);
                  if (item.xl) colSpanClasses.push(`xl:col-span-${item.xl}`);

                  return (
                    <div
                      key={`${item.fieldId}-${itemIndex}`}
                      className={cn(...colSpanClasses)}
                    >
                      <FieldRenderer
                        field={field}
                        snapshot={snapshot}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }

    // Legacy fields array layout (fallback)
    if (section.fields && section.fields.length > 0) {
      return (
        <div className="space-y-4">
          {section.fields.map(field => (
            <FieldRenderer
              key={field.id}
              field={field}
              snapshot={snapshot}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="text-sm text-muted-foreground">
        No fields defined for this section
      </div>
    );
  };

  const isDisabled = sectionUI?.disabled;

  return (
    <Card 
      className={cn(
        className,
        isDisabled && 'opacity-50 pointer-events-none'
      )}
    >
      {(section.label || section.description) && (
        <CardHeader>
          {section.label && <CardTitle>{section.label}</CardTitle>}
          {section.description && (
            <CardDescription>{section.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={!section.label && !section.description ? 'pt-6' : ''}>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

/**
 * Utility component for generating Tailwind grid classes
 * This ensures the classes are present in the build
 */
export function GridClassGenerator() {
  return (
    <div className="hidden">
      {/* Grid columns */}
      <div className="grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6" />
      <div className="grid-cols-7 grid-cols-8 grid-cols-9 grid-cols-10 grid-cols-11 grid-cols-12" />
      
      {/* Col spans */}
      <div className="col-span-1 col-span-2 col-span-3 col-span-4 col-span-5 col-span-6" />
      <div className="col-span-7 col-span-8 col-span-9 col-span-10 col-span-11 col-span-12" />
      
      {/* Responsive col spans */}
      <div className="xs:col-span-1 xs:col-span-2 xs:col-span-3 xs:col-span-4 xs:col-span-5 xs:col-span-6" />
      <div className="sm:col-span-1 sm:col-span-2 sm:col-span-3 sm:col-span-4 sm:col-span-5 sm:col-span-6" />
      <div className="md:col-span-1 md:col-span-2 md:col-span-3 md:col-span-4 md:col-span-5 md:col-span-6" />
      <div className="lg:col-span-1 lg:col-span-2 lg:col-span-3 lg:col-span-4 lg:col-span-5 lg:col-span-6" />
      <div className="xl:col-span-1 xl:col-span-2 xl:col-span-3 xl:col-span-4 xl:col-span-5 xl:col-span-6" />
      
      {/* Gaps */}
      <div className="gap-0 gap-1 gap-2 gap-3 gap-4 gap-5 gap-6 gap-7 gap-8" />
    </div>
  );
}