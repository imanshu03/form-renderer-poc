// JSONLogic Types
export type JsonLogicVar = { var: string };
export type JsonLogicValue = string | number | boolean | null | JsonLogicVar;
export type JsonLogicArray = JsonLogicValue[];

export type JsonLogicOperator =
  | "=="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "and"
  | "or"
  | "not"
  | "in"
  | "empty"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "count"
  | "if";

export type JsonLogicExpression =
  | JsonLogicValue
  | { [op in JsonLogicOperator]?: any }
  | JsonLogicVar;

// Global Context
export type GlobalContext = Record<string, any>;

// Field Types
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "select"
  | "multi-select"
  | "radio"
  | "checkbox"
  | "checkbox-group"
  | "switch"
  | "date"
  | "datetime"
  | "time"
  | "file"
  | "hidden"
  | "info"
  | "heading"
  | "table";

// Option Source Types
export type StaticOption = {
  label: string;
  value: string | number;
};

export type RemoteOptionsConfig = {
  source: "REMOTE";
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: any;
  itemsPath?: string; // Path to items array in response
  labelKey?: string;
  valueKey?: string;
  dependencies?: string[]; // Field IDs that trigger refetch
};

export type OptionsConfig =
  | { source: "STATIC"; options: StaticOption[] }
  | RemoteOptionsConfig;

// Table Column Configuration
export interface TableColumn {
  id: string;
  label: string;
  type: Exclude<FieldType, "table" | "info" | "heading">; // Table columns can't contain tables, info, or headings
  placeholder?: string;
  width?: string; // CSS width value (e.g., "200px", "20%", "1fr")
  validators?: Validator[];
  options?: OptionsConfig; // For select/radio/checkbox columns
  defaultValue?: any;
  disabled?: boolean;
  readOnly?: boolean;
  showRowIndex?: boolean; // Show row index in label (e.g., "Name (Row 1)")
}

// Validator Types
export type ValidatorType =
  | "required"
  | "email"
  | "url"
  | "regex"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "custom";

export type Validator = {
  type: ValidatorType;
  value?: any;
  message?: string;
  when?: JsonLogicExpression; // Conditional validation
};

// Field Definition
export interface FieldBase {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  disabled?: boolean;
  readOnly?: boolean;
  visibilityRule?: JsonLogicExpression;
  rules?: Rule[]; // Field-level rules
  validators?: Validator[];
  options?: OptionsConfig; // For select/radio/checkbox fields
  // Info field specific properties
  content?: string; // For 'info' type - the informative text content
  variant?: "default" | "info" | "warning" | "destructive"; // Visual styling variant
  markdown?: boolean; // Whether to render content as markdown
  // Tooltip properties
  tooltip?: string;
  // Heading field specific properties
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; // For 'heading' type
  // File field specific properties
  multiple?: boolean; // For 'file' type - whether to allow multiple files
  accept?: string; // For 'file' type - file type restrictions (e.g., ".pdf,.doc,.docx")
  // Table field specific properties
  columns?: TableColumn[]; // For 'table' type - column definitions
  minRows?: number; // For 'table' type - minimum number of rows
  maxRows?: number; // For 'table' type - maximum number of rows
  defaultRows?: number; // For 'table' type - number of rows to show by default when empty
  addRowText?: string; // For 'table' type - text for add row button
  showHeaders?: boolean; // For 'table' type - whether to show column headers (default: true)
}

// Layout Types
export interface SectionRowItem {
  fieldId: string;
  colSpan?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface SectionRow {
  id?: string;
  columns: number; // Base number of columns
  gap?: number; // Gap between columns (Tailwind scale)
  items: SectionRowItem[];
}

// SubSection Definition (accordion-style subsections within a section)
export interface SubSection {
  id: string;
  label: string;
  description?: string;
  visibilityRule?: JsonLogicExpression;
  disabled?: boolean;
  defaultOpen?: boolean; // Whether accordion is open by default
  rows?: SectionRow[]; // Layout for fields within subsection
  fields?: FieldBase[]; // Fields within subsection
}

// Section Definition
export interface Section {
  id: string;
  label?: string;
  description?: string;
  visibilityRule?: JsonLogicExpression;
  disabled?: boolean;
  rows?: SectionRow[]; // New layout system
  fields?: FieldBase[]; // Legacy support
  subsections?: SubSection[]; // Accordion-style subsections
}

// Engine Actions
export type EngineActionType =
  | "SHOW_SECTION"
  | "HIDE_SECTION"
  | "SHOW_FIELD"
  | "HIDE_FIELD"
  | "ENABLE"
  | "DISABLE"
  | "SET_VALUE"
  | "SET_OPTIONS"
  | "SET_ERROR"
  | "CLEAR_ERROR"
  | "DISABLE_OPTION"
  | "ENABLE_OPTION";

export interface EngineAction {
  type: EngineActionType;
  target: string; // Field or section ID
  value?: any;
  optionValue?: string; // For DISABLE_OPTION/ENABLE_OPTION actions
}

// Rule Definition
export interface Rule {
  id: string;
  when: JsonLogicExpression;
  then?: EngineAction | EngineAction[];
  else?: EngineAction | EngineAction[];
}

// Navigation Configuration
export interface NavigationConfig {
  type: "tabs" | "stepper" | "single";
  allowSkip?: boolean;
  validateOnNext?: boolean;
  allowReset?: boolean; // Enable reset functionality
  allowSaveOnAll?: boolean; // Allow saving regardless of form validation state
}

// Submission Configuration
export interface SubmissionConfig {
  endpoint?: string;
  method?: "POST" | "PUT" | "PATCH";
  headers?: Record<string, string>;
  stripHiddenFields?: boolean;
  stripDisabledFields?: boolean;
  transformPayload?: (data: any) => any;
}

// Form Schema
export interface FormSchema {
  id?: string; // Unique identifier for the form
  version: string;
  meta?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
  globals?: GlobalContext;
  sections: Section[];
  formRules?: Rule[]; // Form-level rules
  navigation?: NavigationConfig;
  submission?: SubmissionConfig;
}

// Runtime State Types
export interface FieldUIState {
  visible: boolean;
  disabled: boolean;
  error?: string;
  options?: StaticOption[]; // Runtime options for dynamic selects
  disabledOptions?: string[]; // Array of option values that should be disabled
}

export interface SectionUIState {
  visible: boolean;
  disabled: boolean;
}

export interface FormUIState {
  sections: Record<string, SectionUIState>;
  fields: Record<string, FieldUIState>;
}

export interface FormSnapshot {
  schema: FormSchema;
  globals: GlobalContext;
  values: Record<string, any>;
  ui: FormUIState;
  errors: Record<string, string | undefined>;
  deps?: DependencyGraph;
}

// Dependency Graph Types
export interface DependencyGraph {
  byField: Record<string, string[]>; // fieldId -> ruleIds
  rules: Record<
    string,
    {
      rule: Rule;
      reads: string[]; // Fields this rule reads from
    }
  >;
}
