import { Action, Expression, RuleSchema, ValueRef } from '@/types/form-schema';

export interface RuleEngineHelpers {
  getValue: (field: string) => any;
  context: Record<string, any>;
  setFieldVisibility: (id: string, value: boolean) => void;
  setFieldEnabled: (id: string, value: boolean) => void;
  setSectionVisibility: (id: string, value: boolean) => void;
  setSectionEnabled: (id: string, value: boolean) => void;
  setValue: (field: string, value: any) => void;
}

export function runRules(rules: RuleSchema[] | undefined, helpers: RuleEngineHelpers) {
  if (!rules) return;
  for (const rule of rules) {
    if (evaluateExpression(rule.condition, helpers)) {
      for (const action of rule.actions) {
        executeAction(action, helpers);
      }
    }
  }
}

function evaluateExpression(expr: Expression, helpers: RuleEngineHelpers): boolean {
  const left = resolveValueRef(expr.left, helpers);
  const right = resolveValueRef(expr.right, helpers);
  switch (expr.operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'gt':
      return left > right;
    case 'lt':
      return left < right;
    case 'includes':
      return Array.isArray(left) ? left.includes(right) : false;
    default:
      return false;
  }
}

function resolveValueRef(ref: ValueRef, helpers: RuleEngineHelpers): any {
  switch (ref.type) {
    case 'field':
      return helpers.getValue(ref.value as string);
    case 'context':
      return getByPath(helpers.context, ref.value as string);
    case 'literal':
    default:
      return ref.value;
  }
}

function executeAction(action: Action, h: RuleEngineHelpers) {
  const { targetType, targetId, effect, value } = action;
  if (targetType === 'field') {
    switch (effect) {
      case 'show':
        h.setFieldVisibility(targetId, true);
        break;
      case 'hide':
        h.setFieldVisibility(targetId, false);
        break;
      case 'enable':
        h.setFieldEnabled(targetId, true);
        break;
      case 'disable':
        h.setFieldEnabled(targetId, false);
        break;
      case 'setValue':
        h.setValue(targetId, value);
        break;
    }
  } else if (targetType === 'section') {
    switch (effect) {
      case 'show':
        h.setSectionVisibility(targetId, true);
        break;
      case 'hide':
        h.setSectionVisibility(targetId, false);
        break;
      case 'enable':
        h.setSectionEnabled(targetId, true);
        break;
      case 'disable':
        h.setSectionEnabled(targetId, false);
        break;
    }
  }
}

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}
