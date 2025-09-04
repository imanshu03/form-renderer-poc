// JSONLogic Types
export type JsonLogicVar = { var: string };
export type JsonLogicValue = string | number | boolean | null | JsonLogicVar;
export type JsonLogicArray = JsonLogicValue[];

export type JsonLogicOperator = 
  | '==' | '!=' | '>' | '>=' | '<' | '<='
  | 'and' | 'or' | 'not'
  | 'in' | 'empty' | 'contains' | 'startsWith' | 'endsWith'
  | 'if';

export type JsonLogicExpression = 
  | JsonLogicValue
  | { [op in JsonLogicOperator]?: any }
  | JsonLogicVar;

// Global Context
export type GlobalContext = Record<string, any>;

// Field Types
export type FieldType = 
  | 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'url'
  | 'select' | 'multi-select' | 'radio' | 'checkbox' | 'switch'
  | 'date' | 'datetime' | 'time'
  | 'file' | 'hidden';

// Option Source Types
export type StaticOption = {
  label: string;
  value: string | number;
};

export type RemoteOptionsConfig = {
  source: 'REMOTE';
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  itemsPath?: string; // Path to items array in response
  labelKey?: string;
  valueKey?: string;
  dependencies?: string[]; // Field IDs that trigger refetch
};

export type OptionsConfig = 
  | { source: 'STATIC'; options: StaticOption[] }
  | RemoteOptionsConfig;

// Validator Types
export type ValidatorType = 
  | 'required' | 'email' | 'url' | 'regex' | 'min' | 'max' 
  | 'minLength' | 'maxLength' | 'custom';

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

// Section Definition
export interface Section {
  id: string;
  label?: string;
  description?: string;
  visibilityRule?: JsonLogicExpression;
  disabled?: boolean;
  rows?: SectionRow[]; // New layout system
  fields?: FieldBase[]; // Legacy support
}

// Engine Actions
export type EngineActionType = 
  | 'SHOW_SECTION' | 'HIDE_SECTION'
  | 'SHOW_FIELD' | 'HIDE_FIELD'
  | 'ENABLE' | 'DISABLE'
  | 'SET_VALUE' | 'SET_OPTIONS'
  | 'SET_ERROR' | 'CLEAR_ERROR';

export interface EngineAction {
  type: EngineActionType;
  target: string; // Field or section ID
  value?: any;
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
  type: 'tabs' | 'stepper' | 'single';
  allowSkip?: boolean;
  validateOnNext?: boolean;
  allowReset?: boolean; // Enable reset functionality
}

// Submission Configuration
export interface SubmissionConfig {
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
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
  rules: Record<string, {
    rule: Rule;
    reads: string[]; // Fields this rule reads from
  }>;
}