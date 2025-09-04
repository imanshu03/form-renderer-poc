import React from 'react';
import { Section } from '../types/schema';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';

export interface SectionsNavProps {
  sections: Section[];
  currentIndex: number;
  onSectionClick: (index: number) => void;
  errors?: FieldErrors;
  navigationType?: 'tabs' | 'stepper';
  className?: string;
}

export function SectionsNav({
  sections,
  currentIndex,
  onSectionClick,
  errors = {},
  navigationType = 'tabs',
  className,
}: SectionsNavProps) {
  // Check if a section has errors
  const sectionHasErrors = (section: Section): boolean => {
    if (!section.fields) return false;
    
    return section.fields.some(field => !!errors[field.id]);
  };

  // Check if a section is complete (visited and no errors)
  const isSectionComplete = (index: number): boolean => {
    return index < currentIndex && !sectionHasErrors(sections[index]);
  };

  if (navigationType === 'stepper') {
    return (
      <div className={cn('space-y-2', className)}>
        {sections.map((section, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = isSectionComplete(index);
          const hasErrors = sectionHasErrors(section);
          const isClickable = index <= currentIndex || isComplete;

          return (
            <Button
              key={section.id}
              variant={isCurrent ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                !isClickable && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => isClickable && onSectionClick(index)}
              disabled={!isClickable}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : hasErrors ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Circle className={cn(
                      'h-5 w-5',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    Step {index + 1}
                  </span>
                  <span className={cn(
                    'text-xs',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {section.label || `Section ${index + 1}`}
                  </span>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    );
  }

  // Default tabs navigation
  return (
    <Tabs
      value={String(currentIndex)}
      className={className}
      orientation="vertical"
    >
      <TabsList className="flex-col h-auto w-full">
        {sections.map((section, index) => {
          const hasErrors = sectionHasErrors(section);
          const isComplete = isSectionComplete(index);

          return (
            <TabsTrigger
              key={section.id}
              value={String(index)}
              onClick={() => onSectionClick(index)}
              className={cn(
                'w-full justify-start px-4 py-3',
                hasErrors && 'text-destructive'
              )}
            >
              <div className="flex items-center gap-2 w-full">
                {isComplete && (
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                )}
                {hasErrors && (
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <span className="text-left">
                  {section.label || `Section ${index + 1}`}
                </span>
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}