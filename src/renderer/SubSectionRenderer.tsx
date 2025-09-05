import React from "react";
import {
  SubSection,
  FormSchema,
  FormSnapshot,
  FieldBase,
} from "../types/schema";
import { FieldRenderer } from "./FieldRenderer";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface SubSectionRendererProps {
  subsection: SubSection;
  schema: FormSchema;
  snapshot: FormSnapshot;
  className?: string;
  defaultOpenValues?: string[]; // IDs of subsections that should be open by default
}

export function SubSectionRenderer({
  subsection,
  schema,
  snapshot,
  className,
  defaultOpenValues = [],
}: SubSectionRendererProps) {
  const subsectionUI = snapshot.ui.sections[`subsection_${subsection.id}`];

  // Don't render if subsection is hidden
  if (!subsectionUI?.visible) {
    return null;
  }

  // Get all fields for this subsection
  const fieldsMap = new Map<string, FieldBase>();
  if (subsection.fields) {
    subsection.fields.forEach((field) => {
      fieldsMap.set(field.id, field);
    });
  }

  // Helper function to check if a row has any visible fields
  const isRowVisible = (row: any) => {
    return row.items.some((item: any) => {
      const field = fieldsMap.get(item.fieldId);
      if (!field) return false;
      
      // Check if this field is visible in the UI state
      const fieldUI = snapshot.ui.fields[field.id];
      return fieldUI?.visible !== false;
    });
  };

  // Render content based on layout type
  const renderSubsectionContent = () => {
    // Modern rows-based layout
    if (subsection.rows && subsection.rows.length > 0) {
      return (
        <div className="space-y-8">
          {subsection.rows
            .filter(row => isRowVisible(row)) // Only render rows with visible fields
            .map((row, rowIndex) => {
              const gridCols = `grid-cols-${row.columns}`;
              const gapClass = row.gap ? `gap-${row.gap}` : "gap-4";

              return (
                <div
                  key={row.id || rowIndex}
                  className={cn("grid", gridCols, gapClass)}
                >
                  {row.items.map((item, itemIndex) => {
                    const field = fieldsMap.get(item.fieldId);

                    if (!field) {
                      console.warn(
                        `Field ${item.fieldId} not found in subsection ${subsection.id}`
                      );
                      return null;
                    }

                    // Build responsive classes
                    const colSpanClasses = [];

                    // Default col-span
                    if (item.colSpan) {
                      colSpanClasses.push(`col-span-${item.colSpan}`);
                    } else {
                      colSpanClasses.push("col-span-1");
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
                        <FieldRenderer field={field} snapshot={snapshot} />
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
    if (subsection.fields && subsection.fields.length > 0) {
      return (
        <div className="space-y-4">
          {subsection.fields.map((field) => (
            <FieldRenderer key={field.id} field={field} snapshot={snapshot} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-sm text-muted-foreground">
        No fields defined for this subsection
      </div>
    );
  };

  const isDisabled = subsectionUI?.disabled;

  return (
    <AccordionItem
      value={subsection.id}
      className={cn(
        "border border-border rounded-lg",
        isDisabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-t-lg">
        <div className="flex flex-col items-start">
          <span className="font-medium text-left">{subsection.label}</span>
          {subsection.description && (
            <span className="text-sm text-muted-foreground text-left mt-1">
              {subsection.description}
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        {renderSubsectionContent()}
      </AccordionContent>
    </AccordionItem>
  );
}

// Wrapper component for multiple subsections
export interface SubSectionsRendererProps {
  subsections: SubSection[];
  schema: FormSchema;
  snapshot: FormSnapshot;
  className?: string;
  type?: "single" | "multiple"; // Allow single or multiple accordion items open
}

export function SubSectionsRenderer({
  subsections,
  schema,
  snapshot,
  className,
  type = "multiple",
}: SubSectionsRendererProps) {
  // Get default open values from subsections
  const defaultOpenValues = subsections
    .filter((subsection) => subsection.defaultOpen)
    .map((subsection) => subsection.id);

  // Filter visible subsections
  const visibleSubsections = subsections.filter(
    (subsection) =>
      snapshot.ui.sections[`subsection_${subsection.id}`]?.visible !== false
  );

  if (visibleSubsections.length === 0) {
    return null;
  }

  // For multiple type, defaultValue should be an array
  // For single type, defaultValue should be a string
  const defaultValue =
    type === "multiple"
      ? defaultOpenValues
      : defaultOpenValues.length > 0
      ? defaultOpenValues[0]
      : undefined;

  if (type === "single") {
    return (
      <Accordion
        type="single"
        defaultValue={
          typeof defaultValue === "string" ? defaultValue : undefined
        }
        className={cn("space-y-2", className)}
        collapsible
      >
        {visibleSubsections.map((subsection) => (
          <SubSectionRenderer
            key={subsection.id}
            subsection={subsection}
            schema={schema}
            snapshot={snapshot}
            defaultOpenValues={defaultOpenValues}
          />
        ))}
      </Accordion>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={Array.isArray(defaultValue) ? defaultValue : []}
      className={cn("space-y-2", className)}
    >
      {visibleSubsections.map((subsection) => (
        <SubSectionRenderer
          key={subsection.id}
          subsection={subsection}
          schema={schema}
          snapshot={snapshot}
          defaultOpenValues={defaultOpenValues}
        />
      ))}
    </Accordion>
  );
}
