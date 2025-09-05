import React, { useEffect, useMemo } from "react";
import { useFormContext, Controller, FieldError } from "react-hook-form";
import {
  FieldBase,
  FormSnapshot,
  StaticOption,
  TableColumn,
} from "../types/schema";
import { useRemoteOptions } from "./hooks/useRemoteOptions";
import { resolvePlaceholders } from "../engine/placeholders";
import { cn } from "@/lib/utils";

// Import shadcn components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Upload,
  X,
  FileIcon,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface FieldRendererProps {
  field: FieldBase;
  snapshot: FormSnapshot;
  className?: string;
}

export function FieldRenderer({
  field,
  snapshot,
  className,
}: FieldRendererProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const fieldUI = snapshot.ui.fields[field.id];
  const formValues = watch();

  // Resolve placeholders in field labels, placeholders, and helpText using current form values
  // @ts-ignore
  const resolvedField = useMemo(() => {
    const context = {
      values: formValues,
      globals: snapshot.globals,
    };

    return {
      ...field,
      label: field.label
        ? resolvePlaceholders(field.label, context)
        : field.label,
      placeholder: field.placeholder
        ? resolvePlaceholders(field.placeholder, context)
        : field.placeholder,
      helpText: field.helpText
        ? resolvePlaceholders(field.helpText, context)
        : field.helpText,
    };
  }, [field, formValues, snapshot.globals]);

  // Handle remote options
  const remoteOptions =
    field.options?.source === "REMOTE"
      ? useRemoteOptions({
          config: field.options,
          formValues: formValues,
          globals: snapshot.globals,
          enabled: fieldUI?.visible && !fieldUI?.disabled,
        })
      : null;

  // Get options (static or remote)
  const options: StaticOption[] =
    field.options?.source === "STATIC"
      ? field.options.options
      : remoteOptions?.options || fieldUI?.options || [];

  // Don't render if field is hidden
  if (!fieldUI?.visible) {
    return null;
  }

  // UI state takes precedence over field definition
  const isDisabled =
    fieldUI?.disabled !== undefined ? fieldUI.disabled : field.disabled;
  const isReadOnly = field.readOnly;
  const error = errors[field.id] as FieldError | undefined;

  // Render field based on type
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "url":
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type={field.type}
                placeholder={resolvedField.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                className={cn(error && "border-destructive")}
              />
            )}
          />
        );

      case "number":
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Input
                {...formField}
                type="number"
                placeholder={resolvedField.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : Number(e.target.value);
                  formField.onChange(value);
                }}
                value={formField.value === null ? "" : String(formField.value)}
                className={cn(error && "border-destructive")}
              />
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Textarea
                {...formField}
                placeholder={resolvedField.placeholder}
                disabled={isDisabled}
                readOnly={isReadOnly}
                className={cn(error && "border-destructive")}
                rows={4}
              />
            )}
          />
        );

      case "checkbox":
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
                {resolvedField.label && (
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {resolvedField.label}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case "checkbox-group":
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => {
              const selectedValues = formField.value || [];

              // Use dynamic options from UI state if available, otherwise fall back to static options
              const checkboxOptions = fieldUI?.options || options;

              // Clean up selected values to only include currently available options
              const availableValues = checkboxOptions.map((opt) => opt.value);
              const cleanedValues = selectedValues.filter((value: any) =>
                availableValues.includes(value)
              );

              // Use useEffect to update the form value after render to avoid React warning
              useEffect(() => {
                if (cleanedValues.length !== selectedValues.length) {
                  formField.onChange(cleanedValues);
                }
              }, [checkboxOptions, selectedValues.length]);

              return (
                <div className="space-y-3">
                  {checkboxOptions.map((option) => {
                    const isChecked = cleanedValues.includes(option.value);

                    const handleOptionChange = (checked: boolean) => {
                      let newValues;
                      if (checked) {
                        newValues = [...cleanedValues, option.value];
                      } else {
                        newValues = cleanedValues.filter(
                          (val: any) => val !== option.value
                        );
                      }
                      formField.onChange(newValues);
                    };

                    return (
                      <div
                        key={String(option.value)}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={handleOptionChange}
                          disabled={isDisabled}
                          id={`${field.id}-${option.value}`}
                        />
                        <Label
                          htmlFor={`${field.id}-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
        );

      case "switch":
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
                {resolvedField.label && (
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {resolvedField.label}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case "radio":
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
                  <div
                    key={String(option.value)}
                    className="flex items-center space-x-2"
                  >
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

      case "select":
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => (
              <Select
                value={String(formField.value || "")}
                onValueChange={formField.onChange}
                disabled={isDisabled || remoteOptions?.loading}
              >
                <SelectTrigger className={cn(error && "border-destructive")}>
                  <SelectValue
                    placeholder={
                      resolvedField.placeholder || "Select an option"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {remoteOptions?.loading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : remoteOptions?.error ? (
                    <div className="p-2 text-sm text-destructive">
                      {remoteOptions.error}
                    </div>
                  ) : options.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No options available
                    </div>
                  ) : (
                    options.map((option) => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        );

      case "multi-select":
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
                        "w-full justify-between",
                        !selectedValues.length && "text-muted-foreground",
                        error && "border-destructive"
                      )}
                      disabled={isDisabled || remoteOptions?.loading}
                    >
                      {selectedValues.length > 0
                        ? `${selectedValues.length} selected`
                        : resolvedField.placeholder || "Select options"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search options..." />
                      <CommandEmpty>No options found.</CommandEmpty>
                      <CommandGroup>
                        {remoteOptions?.loading ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Loading...
                          </div>
                        ) : remoteOptions?.error ? (
                          <div className="p-2 text-sm text-destructive">
                            {remoteOptions.error}
                          </div>
                        ) : (
                          options.map((option) => {
                            const isSelected = selectedValues.includes(
                              option.value
                            );

                            return (
                              <CommandItem
                                key={String(option.value)}
                                onSelect={() => {
                                  const newValue = isSelected
                                    ? selectedValues.filter(
                                        (v: any) => v !== option.value
                                      )
                                    : [...selectedValues, option.value];
                                  formField.onChange(newValue);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
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

      case "date":
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
                      "w-full justify-start text-left font-normal",
                      !formField.value && "text-muted-foreground",
                      error && "border-destructive"
                    )}
                    disabled={isDisabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formField.value ? (
                      format(new Date(formField.value), "PPP")
                    ) : (
                      <span>{resolvedField.placeholder || "Pick a date"}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formField.value ? new Date(formField.value) : undefined
                    }
                    onSelect={(date) => {
                      formField.onChange(date ? date.toISOString() : "");
                    }}
                    disabled={isDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        );

      case "hidden":
        return (
          <Controller
            name={field.id}
            control={control}
            render={() => <input type="hidden" />}
          />
        );

      case "info":
        const getVariantIcon = () => {
          switch (field.variant) {
            case "warning":
              return <AlertTriangle className="h-4 w-4" />;
            case "destructive":
              return <AlertCircle className="h-4 w-4" />;
            case "info":
              return <Info className="h-4 w-4" />;
            default:
              return <Info className="h-4 w-4" />;
          }
        };

        const alertVariant =
          field.variant === "destructive" ? "destructive" : "default";

        return (
          <Alert
            variant={alertVariant}
            className={cn(
              field.variant === "warning" &&
                "border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:stroke-yellow-800",
              field.variant === "info" &&
                "border-blue-200 bg-blue-50 text-blue-800 [&>svg]:stroke-blue-800",
              field.variant === "destructive" &&
                "border-destructive bg-destructive/10 text-destructive [&>svg]:stroke-destructive"
            )}
          >
            {getVariantIcon()}
            {resolvedField.label && (
              <AlertTitle>{resolvedField.label}</AlertTitle>
            )}
            <AlertDescription>
              {field.markdown ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: field.content || "" }}
                />
              ) : (
                <span>{field.content}</span>
              )}
            </AlertDescription>
          </Alert>
        );

      case "heading":
        const HeadingTag = (field.headingLevel ||
          "h6") as keyof JSX.IntrinsicElements;
        const headingClasses = cn(
          "font-semibold text-foreground",
          {
            h1: "text-4xl",
            h2: "text-3xl",
            h3: "text-2xl",
            h4: "text-xl",
            h5: "text-lg",
            h6: "text-base",
          }[field.headingLevel || "h6"]
        );

        return (
          <HeadingTag
            className={cn(
              "border-b border-muted-foreground pb-2",
              headingClasses
            )}
          >
            {resolvedField.label}
          </HeadingTag>
        );

      case "file":
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => {
              const isMultiple = field.multiple || false;
              const files = isMultiple
                ? formField.value || []
                : formField.value;

              const handleFileChange = (
                e: React.ChangeEvent<HTMLInputElement>
              ) => {
                const selectedFiles = Array.from(e.target.files || []);
                if (selectedFiles.length > 0) {
                  // For now, we'll store file objects directly
                  // In production, you might want to convert to base64 or upload to a server
                  if (isMultiple) {
                    const currentFiles = Array.isArray(files) ? files : [];
                    formField.onChange([...currentFiles, ...selectedFiles]);
                  } else {
                    formField.onChange(selectedFiles[0]);
                  }
                }
              };

              const removeFile = (indexToRemove: number | "single") => {
                if (indexToRemove === "single") {
                  formField.onChange(null);
                } else if (Array.isArray(files)) {
                  const newFiles = files.filter(
                    (_: any, index: number) => index !== indexToRemove
                  );
                  formField.onChange(newFiles);
                }
              };

              const renderFileList = () => {
                if (isMultiple && Array.isArray(files) && files.length > 0) {
                  return (
                    <div className="space-y-2">
                      {files.map((file: File, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)}KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                } else if (!isMultiple && formField.value) {
                  const file = formField.value as File;
                  return (
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)}KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("single")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div className="space-y-3">
                  {renderFileList()}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={field.id}
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        "hover:bg-muted/50 hover:border-primary/50",
                        isDisabled && "opacity-50 cursor-not-allowed",
                        error && "border-destructive"
                      )}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resolvedField.placeholder ||
                            "PDF, DOC, DOCX, PNG, JPG (MAX. 10MB)"}
                        </p>
                      </div>
                      <input
                        id={field.id}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isDisabled}
                        multiple={isMultiple}
                        accept={field.accept || undefined}
                      />
                    </label>
                  </div>
                </div>
              );
            }}
          />
        );

      case "table":
        if (!field.columns || field.columns.length === 0) {
          return (
            <div className="text-sm text-muted-foreground">
              No columns defined for table field
            </div>
          );
        }

        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: formField }) => {
              const tableData = formField.value || [];
              const minRows = field.minRows || 1;
              const maxRows = field.maxRows || 10;

              const addRow = () => {
                if (tableData.length < maxRows) {
                  const newRow: Record<string, any> = {};
                  field.columns?.forEach((col) => {
                    newRow[col.id] = col.defaultValue || "";
                  });
                  formField.onChange([...tableData, newRow]);
                }
              };

              const deleteRow = (indexToDelete: number) => {
                if (tableData.length > minRows) {
                  const newData = tableData.filter(
                    (_: any, index: number) => index !== indexToDelete
                  );
                  formField.onChange(newData);
                }
              };

              const updateCell = (
                rowIndex: number,
                columnId: string,
                value: any
              ) => {
                const newData = [...tableData];
                newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
                formField.onChange(newData);
              };

              const renderCellInput = (
                column: TableColumn,
                rowIndex: number,
                value: any
              ) => {
                const cellId = `${field.id}_${rowIndex}_${column.id}`;

                // Create a mock field from column definition for reusing existing field logic
                const mockField: FieldBase = {
                  id: cellId,
                  type: column.type,
                  label: column.label,
                  placeholder: column.placeholder,
                  disabled: column.disabled,
                  readOnly: column.readOnly,
                  validators: column.validators,
                  options: column.options,
                  defaultValue: column.defaultValue,
                };

                const mockFieldUI = {
                  visible: true,
                  disabled: column.disabled || false,
                  error: undefined,
                  options:
                    column.options?.source === "STATIC"
                      ? column.options.options
                      : undefined,
                };

                const handleCellChange = (newValue: any) => {
                  updateCell(rowIndex, column.id, newValue);
                };

                // Get placeholder with optional row index
                const getPlaceholder = () => {
                  if (column.showRowIndex) {
                    const baseLabel = getColumnLabel(column, rowIndex);
                    return column.placeholder || baseLabel;
                  }
                  return column.placeholder;
                };

                // Reuse the main field rendering logic but with table-specific sizing
                switch (column.type) {
                  case "text":
                  case "email":
                  case "tel":
                  case "url":
                    return (
                      <Input
                        type={column.type}
                        value={value || ""}
                        onChange={(e) => handleCellChange(e.target.value)}
                        placeholder={getPlaceholder()}
                        disabled={column.disabled}
                        readOnly={column.readOnly}
                        className="h-8 text-sm"
                        aria-label={
                          column.showRowIndex
                            ? getColumnLabel(column, rowIndex)
                            : column.label
                        }
                      />
                    );

                  case "number":
                    return (
                      <Input
                        type="number"
                        value={
                          value === null || value === undefined
                            ? ""
                            : String(value)
                        }
                        onChange={(e) => {
                          const numValue =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                          handleCellChange(numValue);
                        }}
                        placeholder={getPlaceholder()}
                        disabled={column.disabled}
                        readOnly={column.readOnly}
                        className="h-8 text-sm"
                        aria-label={
                          column.showRowIndex
                            ? getColumnLabel(column, rowIndex)
                            : column.label
                        }
                      />
                    );

                  case "select":
                    const selectOptions =
                      column.options?.source === "STATIC"
                        ? column.options.options
                        : [];
                    return (
                      <Select
                        value={String(value || "")}
                        onValueChange={(newValue) => handleCellChange(newValue)}
                        disabled={column.disabled}
                      >
                        <SelectTrigger
                          className="h-8 text-sm"
                          aria-label={
                            column.showRowIndex
                              ? getColumnLabel(column, rowIndex)
                              : column.label
                          }
                        >
                          <SelectValue placeholder={getPlaceholder()} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectOptions.map((option) => (
                            <SelectItem
                              key={String(option.value)}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );

                  case "checkbox":
                    return (
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={value || false}
                          onCheckedChange={(checked) =>
                            handleCellChange(checked)
                          }
                          disabled={column.disabled}
                          aria-label={
                            column.showRowIndex
                              ? getColumnLabel(column, rowIndex)
                              : column.label
                          }
                        />
                      </div>
                    );

                  case "date":
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-8 w-full justify-start text-left font-normal text-sm",
                              !value && "text-muted-foreground"
                            )}
                            disabled={column.disabled}
                            aria-label={
                              column.showRowIndex
                                ? getColumnLabel(column, rowIndex)
                                : column.label
                            }
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {value ? (
                              format(new Date(value), "PPP")
                            ) : (
                              <span>{getPlaceholder() || "Pick a date"}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={value ? new Date(value) : undefined}
                            onSelect={(date) => {
                              handleCellChange(date ? date.toISOString() : "");
                            }}
                            disabled={column.disabled}
                          />
                        </PopoverContent>
                      </Popover>
                    );

                  default:
                    return (
                      <Input
                        value={value || ""}
                        onChange={(e) => handleCellChange(e.target.value)}
                        placeholder={getPlaceholder()}
                        disabled={column.disabled}
                        readOnly={column.readOnly}
                        className="h-8 text-sm"
                        aria-label={
                          column.showRowIndex
                            ? getColumnLabel(column, rowIndex)
                            : column.label
                        }
                      />
                    );
                }
              };

              // Helper to get column label with optional row index
              const getColumnLabel = (
                column: TableColumn,
                rowIndex?: number
              ) => {
                if (column.showRowIndex && rowIndex !== undefined) {
                  return `${column.label} (Row ${rowIndex + 1})`;
                }
                return column.label;
              };

              const showHeaders = field.showHeaders !== false; // Default to true

              return (
                <div className="space-y-4">
                  <div className="border rounded-lg">
                    <Table>
                      {showHeaders && (
                        <TableHeader>
                          <TableRow>
                            {field.columns?.map((column) => (
                              <TableHead
                                key={column.id}
                                style={{ width: column.width }}
                              >
                                {column.label}
                              </TableHead>
                            ))}
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                      )}
                      <TableBody>
                        {tableData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={field.columns?.length || 0 + 1}
                              className="text-center text-muted-foreground"
                            >
                              No rows added yet. Click "Add Row" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          tableData.map(
                            (row: Record<string, any>, rowIndex: number) => (
                              <TableRow key={rowIndex}>
                                {field.columns?.map((column) => (
                                  <TableCell key={column.id}>
                                    {renderCellInput(
                                      column,
                                      rowIndex,
                                      row[column.id]
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteRow(rowIndex)}
                                    disabled={
                                      tableData.length <= minRows || isDisabled
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRow}
                    disabled={tableData.length >= maxRows || isDisabled}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {field.addRowText || "Add Row"}
                  </Button>
                </div>
              );
            }}
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

  // For checkbox, switch, info, and heading fields, label is rendered inline
  const showLabel =
    resolvedField.label &&
    field.type !== "checkbox" &&
    field.type !== "switch" &&
    field.type !== "info" &&
    field.type !== "heading";

  // Helper component for rendering tooltip
  const renderTooltip = () => {
    if (!field.tooltip) {
      return null;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-normal text-xs text-black">{field.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        {showLabel && (
          <Label htmlFor={field.id} className="flex items-center">
            <span>
              {resolvedField.label}
              {field.validators?.some((v) => v.type === "required") && (
                <span className="text-destructive ml-1">*</span>
              )}
            </span>
            {renderTooltip()}
          </Label>
        )}

        {renderField()}

        {resolvedField.helpText && !error && (
          <p className="text-sm text-muted-foreground">
            {resolvedField.helpText}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error.message || "This field is invalid"}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
