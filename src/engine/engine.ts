import {
  FormSchema,
  FormSnapshot,
  FormUIState,
  EngineAction,
  GlobalContext,
  FieldBase,
  Section,
  Rule,
  StaticOption,
} from '../types/schema';
import { buildDependencyGraph, getRulesForField, sortRulesForEvaluation } from './deps';
import { evaluate } from './jsonlogic';
import { deepSet } from '../utils/deepSet';

/**
 * Initializes the UI state from the schema
 */
export function seedUI(schema: FormSchema): FormUIState {
  const ui: FormUIState = {
    sections: {},
    fields: {},
  };

  schema.sections.forEach(section => {
    // Initialize section UI state
    ui.sections[section.id] = {
      visible: true,
      disabled: section.disabled || false,
    };

    // Initialize field UI states
    const fields = getAllFieldsFromSection(section, schema);
    fields.forEach(field => {
      ui.fields[field.id] = {
        visible: true,
        disabled: field.disabled || false,
        error: undefined,
        options: field.options?.source === 'STATIC' ? field.options.options : undefined,
      };
    });
  });

  return ui;
}

/**
 * Generates initial form values from schema
 */
export function initialValues(
  schema: FormSchema,
  globals?: GlobalContext
): Record<string, any> {
  const values: Record<string, any> = {};

  schema.sections.forEach(section => {
    const fields = getAllFieldsFromSection(section, schema);
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        // Process template strings for globals
        let value = field.defaultValue;
        if (typeof value === 'string' && value.includes('${globals.')) {
          const globalsContext = globals || schema.globals || {};
          value = value.replace(/\$\{globals\.(\w+)\}/g, (_, key) => {
            return globalsContext[key] || '';
          });
        }
        values[field.id] = value;
      } else {
        // Set appropriate default based on field type
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            values[field.id] = false;
            break;
          case 'multi-select':
            values[field.id] = [];
            break;
          case 'number':
            values[field.id] = null;
            break;
          default:
            values[field.id] = '';
        }
      }
    });
  });

  return values;
}

/**
 * Evaluates rules and returns actions to apply
 */
export function evaluateRules(
  ruleIds: string[],
  snapshot: FormSnapshot,
  params?: Record<string, any>
): EngineAction[] {
  const actions: EngineAction[] = [];
  const { deps, values, globals } = snapshot;

  if (!deps) return actions;

  // Sort rules for proper evaluation order
  const sortedRuleIds = sortRulesForEvaluation(ruleIds, deps);

  sortedRuleIds.forEach(ruleId => {
    const ruleData = deps.rules[ruleId];
    if (!ruleData) return;

    const { rule } = ruleData;
    const context = {
      data: values,
      globals,
      params,
    };

    // Evaluate the condition
    const conditionResult = evaluate(rule.when, context);

    // Collect actions based on condition result
    if (conditionResult) {
      if (rule.then) {
        const thenActions = Array.isArray(rule.then) ? rule.then : [rule.then];
        actions.push(...thenActions);
      }
    } else {
      if (rule.else) {
        const elseActions = Array.isArray(rule.else) ? rule.else : [rule.else];
        actions.push(...elseActions);
      }
    }
  });

  return actions;
}

/**
 * Applies engine actions to the snapshot
 */
export function applyActions(
  actions: EngineAction[],
  snapshot: FormSnapshot
): FormSnapshot {
  // Clone the snapshot to avoid mutations
  const newSnapshot: FormSnapshot = {
    ...snapshot,
    values: { ...snapshot.values },
    ui: {
      sections: { ...snapshot.ui.sections },
      fields: { ...snapshot.ui.fields },
    },
    errors: { ...snapshot.errors },
  };

  actions.forEach(action => {
    switch (action.type) {
      case 'SHOW_SECTION':
        if (newSnapshot.ui.sections[action.target]) {
          newSnapshot.ui.sections[action.target] = {
            ...newSnapshot.ui.sections[action.target],
            visible: true,
          };
        }
        break;

      case 'HIDE_SECTION':
        if (newSnapshot.ui.sections[action.target]) {
          newSnapshot.ui.sections[action.target] = {
            ...newSnapshot.ui.sections[action.target],
            visible: false,
          };
        }
        break;

      case 'SHOW_FIELD':
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            visible: true,
          };
        }
        break;

      case 'HIDE_FIELD':
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            visible: false,
          };
        }
        break;

      case 'ENABLE':
        // Can target both sections and fields
        if (newSnapshot.ui.sections[action.target]) {
          newSnapshot.ui.sections[action.target] = {
            ...newSnapshot.ui.sections[action.target],
            disabled: false,
          };
        }
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            disabled: false,
          };
        }
        break;

      case 'DISABLE':
        // Can target both sections and fields
        if (newSnapshot.ui.sections[action.target]) {
          newSnapshot.ui.sections[action.target] = {
            ...newSnapshot.ui.sections[action.target],
            disabled: true,
          };
        }
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            disabled: true,
          };
        }
        break;

      case 'SET_VALUE':
        newSnapshot.values[action.target] = action.value;
        break;

      case 'SET_OPTIONS':
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            options: action.value as StaticOption[],
          };
        }
        break;

      case 'SET_ERROR':
        newSnapshot.errors[action.target] = action.value;
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            error: action.value,
          };
        }
        break;

      case 'CLEAR_ERROR':
        delete newSnapshot.errors[action.target];
        if (newSnapshot.ui.fields[action.target]) {
          newSnapshot.ui.fields[action.target] = {
            ...newSnapshot.ui.fields[action.target],
            error: undefined,
          };
        }
        break;
    }
  });

  return newSnapshot;
}

/**
 * Creates an initial snapshot from schema
 */
export function createSnapshot(
  schema: FormSchema,
  globals?: GlobalContext
): FormSnapshot {
  const deps = buildDependencyGraph(schema);
  const ui = seedUI(schema);
  const values = initialValues(schema, globals);

  const snapshot: FormSnapshot = {
    schema,
    globals: globals || {},
    values,
    ui,
    errors: {},
    deps,
  };

  // Evaluate initial visibility and other rules
  const allRuleIds = Object.keys(deps.rules);
  const actions = evaluateRules(allRuleIds, snapshot);
  
  return applyActions(actions, snapshot);
}

/**
 * Updates snapshot when field values change
 */
export function updateSnapshot(
  snapshot: FormSnapshot,
  fieldId: string,
  value: any
): FormSnapshot {
  // Update the value
  let newSnapshot = {
    ...snapshot,
    values: {
      ...snapshot.values,
      [fieldId]: value,
    },
  };

  // Find and evaluate affected rules
  if (snapshot.deps) {
    const affectedRuleIds = getRulesForField(fieldId, snapshot.deps);
    const actions = evaluateRules(affectedRuleIds, newSnapshot);
    newSnapshot = applyActions(actions, newSnapshot);
  }

  return newSnapshot;
}

/**
 * Helper to get all fields from a section
 */
function getAllFieldsFromSection(section: Section, schema: FormSchema): FieldBase[] {
  const fields: FieldBase[] = [];
  const fieldMap = new Map<string, FieldBase>();

  // First, collect all fields from the section's fields array
  if (section.fields) {
    section.fields.forEach(field => {
      fieldMap.set(field.id, field);
    });
  }

  // For rows-based layout, we need to maintain field definitions
  // In a real implementation, fields would be defined at the schema level
  // and referenced in rows. For now, we'll use the fields array.
  if (section.rows) {
    section.rows.forEach(row => {
      row.items.forEach(item => {
        const field = fieldMap.get(item.fieldId);
        if (field && !fields.find(f => f.id === field.id)) {
          fields.push(field);
        }
      });
    });
  }

  // Add any fields not in rows (legacy support)
  fieldMap.forEach(field => {
    if (!fields.find(f => f.id === field.id)) {
      fields.push(field);
    }
  });

  return fields;
}

/**
 * Builds form submission payload
 */
export function buildPayload(
  snapshot: FormSnapshot,
  stripHidden = false,
  stripDisabled = false
): Record<string, any> {
  const payload: Record<string, any> = {};

  Object.keys(snapshot.values).forEach(fieldId => {
    const fieldUI = snapshot.ui.fields[fieldId];
    
    // Skip hidden fields if configured
    if (stripHidden && fieldUI && !fieldUI.visible) {
      return;
    }
    
    // Skip disabled fields if configured
    if (stripDisabled && fieldUI && fieldUI.disabled) {
      return;
    }
    
    payload[fieldId] = snapshot.values[fieldId];
  });

  return payload;
}