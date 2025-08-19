export interface FormSchema {
  sections: SectionSchema[];
}

export interface SectionSchema {
  id: string;
  title: string;
  visible?: boolean;
  enabled?: boolean;
  fields: FieldSchema[];
  rules?: RuleSchema[];
}

export interface FieldSchema {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: OptionSchema[];
  defaultValue?: any;
  visible?: boolean;
  enabled?: boolean;
  rules?: RuleSchema[];
}

export interface OptionSchema {
  label: string;
  value: string | number;
}

export interface RuleSchema {
  event: 'load' | 'change' | 'submit';
  condition: Expression;
  actions: Action[];
}

export interface Expression {
  left: ValueRef;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'includes';
  right: ValueRef;
}

export type ValueRef =
  | { type: 'field'; value: string }
  | { type: 'context'; value: string }
  | { type: 'literal'; value: any };

export interface Action {
  targetType: 'field' | 'section';
  targetId: string;
  effect: 'show' | 'hide' | 'enable' | 'disable' | 'setValue';
  value?: any;
}
