import React from 'react';
import { useFormContext, Controller, FieldError } from 'react-hook-form';
import { FieldBase, FormSnapshot, StaticOption } from '../types/schema';
import { useRemoteOptions } from './hooks/useRemoteOptions';
import { cn } from '@/lib/utils';

// Import shadcn components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check } from 'lucide-react';

export interface FieldRendererProps {
  field: FieldBase;
  snapshot: FormSnapshot;
  className?: string;
}

export function FieldRenderer({ field, snapshot, className }: FieldRendererProps) {
  const { control, formState: { errors }, watch } = useFormContext();
  const fieldUI = snapshot.ui.fields[field.id];
  
  // Handle remote options
  const remoteOptions = field.options?.source === 'REMOTE' 
    ? useRemoteOptions({
        config: field.options,
        formValues: watch(),
        globals: snapshot.globals,
        enabled: fieldUI?.visible && !fieldUI?.disabled,
      })
    : null;

  // Get options (static or remote)
  const options: StaticOption[] = 
    field.options?.source === 'STATIC' 
      ? field.options.options 
      : remoteOptions?.options || fieldUI?.options || [];

  // Don't render if field is hidden
  if (!fieldUI?.visible) {
    return null;
  }

  // UI state takes precedence over field definition
  const isDisabled = fieldUI?.disabled !== undefined ? fieldUI.disabled : field.disabled;
  const isReadOnly = field.readOnly;
  const error = errors[field.id] as FieldError | undefined;

  // Render field based on type
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type={field.type}
                placeholder={field.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type="number"
                placeholder={field.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : Number(e.target.value);
                  formField.onChange(value);
                }}
                value={formField.value === null ? '' : String(formField.value)}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Textarea
                {...formField}
                placeholder={field.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                className={cn(error && 'border-destructive')}
                rows={4}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={isDisabled}
                  id={field.id}
                />
                {field.label && (
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {field.label}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case 'switch':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={isDisabled}
                  id={field.id}
                />
                {field.label && (
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {field.label}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <RadioGroup
                value={String(formField.value)}
                onValueChange={formField.onChange}
                disabled={isDisabled}
              >
                {options.map((option) => (
                  <div key={String(option.value)} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={String(option.value)}
                      id={`${field.id}-${option.value}`}
                    />
                    <Label
                      htmlFor={`${field.id}-${option.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Select
                value={String(formField.value || '')}
                onValueChange={formField.onChange}
                disabled={isDisabled || remoteOptions?.loading}
              >
                <SelectTrigger className={cn(error && 'border-destructive')}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {remoteOptions?.loading ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                  ) : remoteOptions?.error ? (
                    <div className="p-2 text-sm text-destructive">{remoteOptions.error}</div>
                  ) : options.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No options available</div>
                  ) : (
                    options.map((option) => (
                      <SelectItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'multi-select':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => {
              const selectedValues = formField.value || [];
              
              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        !selectedValues.length && 'text-muted-foreground',
                        error && 'border-destructive'
                      )}
                      disabled={isDisabled || remoteOptions?.loading}
                    >
                      {selectedValues.length > 0
                        ? `${selectedValues.length} selected`
                        : field.placeholder || 'Select options'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search options..." />
                      <CommandEmpty>No options found.</CommandEmpty>
                      <CommandGroup>
                        {remoteOptions?.loading ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                        ) : remoteOptions?.error ? (
                          <div className="p-2 text-sm text-destructive">{remoteOptions.error}</div>
                        ) : (
                          options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            
                            return (
                              <CommandItem
                                key={String(option.value)}
                                onSelect={() => {
                                  const newValue = isSelected
                                    ? selectedValues.filter((v: any) => v !== option.value)
                                    : [...selectedValues, option.value];
                                  formField.onChange(newValue);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            );
                          })
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formField.value && 'text-muted-foreground',
                      error && 'border-destructive'
                    )}
                    disabled={isDisabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formField.value ? (
                      format(new Date(formField.value), 'PPP')
                    ) : (
                      <span>{field.placeholder || 'Pick a date'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formField.value ? new Date(formField.value) : undefined}
                    onSelect={(date) => {
                      formField.onChange(date ? date.toISOString() : '');
                    }}
                    disabled={isDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        );

      case 'hidden':
        return (
          <Controller
            name={field.id}
            control={control}
            render={() => <input type="hidden" />}
          />
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  // For checkbox and switch, label is rendered inline
  const showLabel = field.label && field.type !== 'checkbox' && field.type !== 'switch';

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <Label htmlFor={field.id}>
          {field.label}
          {field.validators?.some(v => v.type === 'required') && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      )}
      
      {renderField()}
      
      {field.helpText && !error && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">
          {error.message || 'This field is invalid'}
        </p>
      )}
    </div>
  );
}