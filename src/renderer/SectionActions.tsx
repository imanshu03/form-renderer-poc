import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionActionsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  canNext?: boolean;
  canPrevious?: boolean;
  canSave?: boolean;
  canReset?: boolean;
  isLastSection?: boolean;
  isFirstSection?: boolean;
  showNavigation?: boolean;
  showReset?: boolean;
  className?: string;
}

export function SectionActions({
  onNext,
  onPrevious,
  onSave,
  onReset,
  canNext = false,
  canPrevious = false,
  canSave = true,
  canReset = true,
  isLastSection = false,
  isFirstSection = false,
  showNavigation = true,
  showReset = false,
  className,
}: SectionActionsProps) {
  return (
    <div className={cn('flex justify-between items-center', className)}>
      {/* Left side - Previous and Reset buttons */}
      <div className="flex gap-2">
        {showNavigation && !isFirstSection && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
        {showReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={!canReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Next/Save buttons */}
      <div className="flex gap-2 ml-auto">
        {showNavigation && !isLastSection && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {(isLastSection || !showNavigation) && (
          <Button
            type="submit"
            onClick={onSave}
            disabled={!canSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </div>
    </div>
  );
}