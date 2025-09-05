# Technical Architecture Documentation

## System Overview

The Form Renderer is a sophisticated dynamic form engine built with React, TypeScript, and shadcn/ui. It implements a declarative, rule-driven architecture that separates form definition from business logic through JSON schemas and JSONLogic expressions.

### Core Architecture Components

```
┌─────────────────────────────────────────────────────────┐
│                   FormRenderer                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Schema Parser                        │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Form Engine                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ Snapshot │  │  Rules   │  │  Dependency  │   │   │
│  │  │  State   │◄─┤  Engine  │◄─┤    Graph     │   │   │
│  │  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │            React Hook Form                        │   │
│  │         (Form State Management)                   │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │          UI Components (shadcn)                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Data Structures

### Form Schema

```typescript
interface FormSchema {
  id?: string;
  version: string;
  meta?: {
    title?: string;
    description?: string;
  };
  globals?: GlobalContext;
  sections: Section[];
  formRules?: Rule[];
  navigation?: NavigationConfig;
  submission?: SubmissionConfig;
}
```

### Form Snapshot

```typescript
interface FormSnapshot {
  schema: FormSchema;
  globals: GlobalContext;
  values: Record<string, any>;
  ui: FormUIState;
  errors: Record<string, string>;
  deps: DependencyGraph;
}
```

### Dependency Graph

```typescript
interface DependencyGraph {
  byField: Record<string, string[]>; // fieldId -> ruleIds
  rules: Record<string, {
    rule: Rule;
    reads: string[];
    writes: string[];
  }>;
}
```

## Core Engine Architecture

### 1. Snapshot Management

The system maintains an immutable snapshot of the complete form state:

```typescript
// Snapshot creation flow
function createSnapshot(schema: FormSchema, globals: GlobalContext): FormSnapshot {
  // 1. Build dependency graph from schema rules
  const deps = buildDependencyGraph(schema);
  
  // 2. Initialize form state
  const initialState = {
    schema,
    globals: { ...schema.globals, ...globals },
    values: generateDefaultValues(schema),
    ui: generateInitialUIState(schema),
    errors: {},
    deps
  };
  
  // 3. Evaluate all rules once to establish initial state
  return evaluateAllRules(initialState);
}
```

### 2. Rule Engine Implementation

The rule engine uses JSONLogic for declarative condition evaluation:

```typescript
interface Rule {
  id: string;
  when: JsonLogicExpression;
  then: EngineAction | EngineAction[];
  else?: EngineAction | EngineAction[];
}

type EngineAction = 
  | { type: "SHOW_SECTION"; target: string }
  | { type: "HIDE_SECTION"; target: string }
  | { type: "SHOW_FIELD"; target: string }
  | { type: "HIDE_FIELD"; target: string }
  | { type: "ENABLE"; target: string }
  | { type: "DISABLE"; target: string }
  | { type: "SET_VALUE"; target: string; value: any }
  | { type: "SET_OPTIONS"; target: string; value: Option[] }
  | { type: "SET_ERROR"; target: string; value: string }
  | { type: "CLEAR_ERROR"; target: string };
```

### 3. Dependency Graph Construction

```typescript
function buildDependencyGraph(schema: FormSchema): DependencyGraph {
  const graph: DependencyGraph = { byField: {}, rules: {} };
  
  // Process all rules in the schema
  const allRules = [
    ...extractSectionVisibilityRules(schema.sections),
    ...extractFieldRules(schema.sections),
    ...(schema.formRules || [])
  ];
  
  allRules.forEach(rule => {
    const reads = extractVariablePaths(rule.when);
    const writes = extractActionTargets(rule.then, rule.else);
    
    // Map field dependencies
    reads.forEach(fieldPath => {
      if (!fieldPath.startsWith('globals.')) {
        if (!graph.byField[fieldPath]) {
          graph.byField[fieldPath] = [];
        }
        graph.byField[fieldPath].push(rule.id);
      }
    });
    
    graph.rules[rule.id] = { rule, reads, writes };
  });
  
  // Detect and prevent cycles
  detectCycles(graph);
  
  return graph;
}
```

## State Update Flow

### Value Change Processing

```typescript
function updateSnapshot(
  snapshot: FormSnapshot, 
  fieldId: string, 
  newValue: any
): FormSnapshot {
  // 1. Create new snapshot with updated value
  const newSnapshot = {
    ...snapshot,
    values: { ...snapshot.values, [fieldId]: newValue }
  };
  
  // 2. Find rules affected by this field change
  const affectedRuleIds = snapshot.deps.byField[fieldId] || [];
  
  // 3. Topologically sort rules for proper evaluation order
  const sortedRuleIds = topologicalSort(affectedRuleIds, snapshot.deps);
  
  // 4. Evaluate affected rules and collect actions
  const actions: EngineAction[] = [];
  for (const ruleId of sortedRuleIds) {
    const ruleActions = evaluateRule(
      snapshot.deps.rules[ruleId].rule, 
      newSnapshot
    );
    actions.push(...ruleActions);
  }
  
  // 5. Apply actions to snapshot
  return applyActions(actions, newSnapshot);
}
```

### Action Application

```typescript
function applyActions(actions: EngineAction[], snapshot: FormSnapshot): FormSnapshot {
  let newSnapshot = cloneSnapshot(snapshot);
  
  for (const action of actions) {
    switch (action.type) {
      case "SHOW_FIELD":
        newSnapshot.ui.fields[action.target] = {
          ...newSnapshot.ui.fields[action.target],
          visible: true
        };
        break;
        
      case "HIDE_FIELD":
        newSnapshot.ui.fields[action.target] = {
          ...newSnapshot.ui.fields[action.target],
          visible: false
        };
        break;
        
      case "SET_VALUE":
        newSnapshot.values[action.target] = action.value;
        break;
        
      case "SET_OPTIONS":
        newSnapshot.ui.fields[action.target] = {
          ...newSnapshot.ui.fields[action.target],
          options: action.value
        };
        break;
        
      // ... other action types
    }
  }
  
  return newSnapshot;
}
```

## Component Architecture

### FormRenderer Structure

```typescript
function FormRenderer({ schema, globals, onSubmit }: FormRendererProps) {
  // 1. Form ID management
  const formId = useMemo(() => schema.id || generateFormId(), [schema.id]);
  
  // 2. Snapshot state management
  const [snapshot, setSnapshot] = useState(() => 
    createSnapshot(schema, globals || {})
  );
  
  // 3. React Hook Form integration
  const methods = useForm({
    defaultValues: snapshot.values,
    resolver: zodResolver(createValidationSchema(snapshot)),
    mode: "onChange"
  });
  
  // 4. Value change subscription
  const watchedValues = methods.watch();
  
  useEffect(() => {
    // Detect changes and update snapshot
    const changes = detectValueChanges(snapshot.values, watchedValues);
    if (changes.length > 0) {
      let newSnapshot = snapshot;
      for (const { fieldId, newValue } of changes) {
        newSnapshot = updateSnapshot(newSnapshot, fieldId, newValue);
      }
      setSnapshot(newSnapshot);
    }
  }, [watchedValues, snapshot]);
  
  // 5. Layout rendering
  return (
    <FormProvider {...methods}>
      {renderLayout(snapshot)}
    </FormProvider>
  );
}
```

### Field Rendering Pipeline

```typescript
function FieldRenderer({ field, snapshot }: FieldRendererProps) {
  const fieldUI = snapshot.ui.fields[field.id];
  const { control, formState } = useFormContext();
  
  // Visibility check
  if (!fieldUI?.visible) return null;
  
  // State derivation
  const isDisabled = fieldUI.disabled ?? field.disabled ?? false;
  const hasError = !!formState.errors[field.id];
  const fieldOptions = fieldUI.options || field.options;
  
  // Component selection and rendering
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: formField }) => (
        <FieldComponent
          {...formField}
          field={field}
          disabled={isDisabled}
          error={hasError}
          options={fieldOptions}
        />
      )}
    />
  );
}
```

## Validation System

### Dynamic Schema Generation

```typescript
function createValidationSchema(snapshot: FormSnapshot): ZodSchema {
  const shape: Record<string, ZodType> = {};
  
  for (const section of snapshot.schema.sections) {
    const sectionUI = snapshot.ui.sections[section.id];
    if (!sectionUI?.visible) continue;
    
    for (const field of section.fields || []) {
      const fieldUI = snapshot.ui.fields[field.id];
      if (!fieldUI?.visible) continue;
      
      // Build base field schema
      let fieldSchema = buildFieldZodSchema(field);
      
      // Apply conditional validators
      if (field.validators) {
        for (const validator of field.validators) {
          if (validator.when) {
            const shouldApply = evaluate(validator.when, {
              values: snapshot.values,
              globals: snapshot.globals
            });
            if (shouldApply) {
              fieldSchema = applyValidatorToSchema(fieldSchema, validator);
            }
          } else {
            fieldSchema = applyValidatorToSchema(fieldSchema, validator);
          }
        }
      }
      
      shape[field.id] = fieldSchema;
    }
  }
  
  return z.object(shape);
}
```

## Performance Optimizations

### 1. Selective Rule Evaluation

Only rules that depend on changed fields are evaluated:

```typescript
// Instead of evaluating all rules
const allRules = getAllRules(schema);
const actions = allRules.map(rule => evaluateRule(rule, snapshot));

// Only evaluate affected rules
const affectedRules = getAffectedRules(changedFieldId, dependencyGraph);
const actions = affectedRules.map(rule => evaluateRule(rule, snapshot));
```

### 2. Memoized Component Rendering

```typescript
const MemoizedFieldRenderer = memo(FieldRenderer, (prevProps, nextProps) => {
  const prevFieldUI = prevProps.snapshot.ui.fields[prevProps.field.id];
  const nextFieldUI = nextProps.snapshot.ui.fields[nextProps.field.id];
  
  return (
    prevFieldUI?.visible === nextFieldUI?.visible &&
    prevFieldUI?.disabled === nextFieldUI?.disabled &&
    shallowEqual(prevFieldUI?.options, nextFieldUI?.options)
  );
});
```

### 3. Efficient State Updates

```typescript
// Immutable updates with structural sharing
function updateFieldUI(snapshot: FormSnapshot, fieldId: string, updates: Partial<FieldUIState>): FormSnapshot {
  return {
    ...snapshot,
    ui: {
      ...snapshot.ui,
      fields: {
        ...snapshot.ui.fields,
        [fieldId]: {
          ...snapshot.ui.fields[fieldId],
          ...updates
        }
      }
    }
  };
}
```

## Advanced Features Implementation

### 1. Remote Options Loading

```typescript
function useRemoteOptions(config: RemoteOptionsConfig, dependencies: any[]) {
  return useQuery({
    queryKey: ['remote-options', config.url, dependencies],
    queryFn: async () => {
      const params = buildRequestParams(config, dependencies);
      const response = await fetch(config.url, { 
        method: 'POST',
        body: JSON.stringify(params)
      });
      const data = await response.json();
      return extractOptions(data, config.itemsPath, config.labelKey, config.valueKey);
    },
    enabled: dependencies.every(dep => dep != null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 2. Multi-Section Navigation

```typescript
function useNavigationState(schema: FormSchema, snapshot: FormSnapshot) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  const visibleSections = useMemo(() => 
    schema.sections.filter(section => 
      snapshot.ui.sections[section.id]?.visible !== false
    ), [schema.sections, snapshot.ui.sections]
  );
  
  const canGoNext = useCallback(async () => {
    if (!schema.navigation?.validateOnNext) return true;
    
    const currentSection = visibleSections[currentSectionIndex];
    const sectionFields = getSectionFieldIds(currentSection);
    const isValid = await trigger(sectionFields);
    
    return isValid || schema.navigation?.allowSkip === true;
  }, [currentSectionIndex, visibleSections, schema.navigation]);
  
  return {
    currentSectionIndex,
    setCurrentSectionIndex,
    visibleSections,
    canGoNext,
    canGoPrevious: currentSectionIndex > 0,
    isLastSection: currentSectionIndex === visibleSections.length - 1
  };
}
```

### 3. Form State Persistence

```typescript
interface FormStatePersistence {
  save(formId: string, snapshot: FormSnapshot): void;
  load(formId: string): FormSnapshot | null;
  clear(formId: string): void;
}

class LocalStoragePersistence implements FormStatePersistence {
  save(formId: string, snapshot: FormSnapshot): void {
    const key = `form-state-${formId}`;
    const serializable = {
      values: snapshot.values,
      ui: snapshot.ui,
      errors: snapshot.errors
    };
    localStorage.setItem(key, JSON.stringify(serializable));
  }
  
  load(formId: string): FormSnapshot | null {
    const key = `form-state-${formId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    return JSON.parse(stored);
  }
}
```

## Error Handling and Recovery

### 1. Rule Evaluation Safety

```typescript
function safeEvaluateRule(rule: Rule, context: EvaluationContext): EngineAction[] {
  try {
    const result = evaluate(rule.when, context);
    const actions = result ? 
      (Array.isArray(rule.then) ? rule.then : [rule.then]) :
      (rule.else ? (Array.isArray(rule.else) ? rule.else : [rule.else]) : []);
    
    return actions;
  } catch (error) {
    console.error(`Rule evaluation failed for rule ${rule.id}:`, error);
    
    // Return safe fallback actions
    return [];
  }
}
```

### 2. Cycle Detection

```typescript
function detectCycles(graph: DependencyGraph): void {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function visit(ruleId: string, path: string[] = []): void {
    if (recursionStack.has(ruleId)) {
      throw new CyclicDependencyError(
        `Cyclic dependency detected: ${path.join(' -> ')} -> ${ruleId}`
      );
    }
    
    if (visited.has(ruleId)) return;
    
    visited.add(ruleId);
    recursionStack.add(ruleId);
    
    const rule = graph.rules[ruleId];
    const writtenFields = rule.writes;
    
    for (const fieldId of writtenFields) {
      const dependentRules = graph.byField[fieldId] || [];
      for (const depRuleId of dependentRules) {
        visit(depRuleId, [...path, ruleId]);
      }
    }
    
    recursionStack.delete(ruleId);
  }
  
  for (const ruleId of Object.keys(graph.rules)) {
    visit(ruleId);
  }
}
```

## Testing Architecture

### 1. Snapshot Testing

```typescript
describe('FormEngine', () => {
  test('should create correct initial snapshot', () => {
    const schema = createTestSchema();
    const snapshot = createSnapshot(schema, {});
    
    expect(snapshot).toMatchSnapshot();
  });
  
  test('should update snapshot correctly on field change', () => {
    const initialSnapshot = createTestSnapshot();
    const updatedSnapshot = updateSnapshot(initialSnapshot, 'testField', 'newValue');
    
    expect(updatedSnapshot.values.testField).toBe('newValue');
    expect(updatedSnapshot).not.toBe(initialSnapshot); // Immutability check
  });
});
```

### 2. Rule Engine Testing

```typescript
describe('Rule Engine', () => {
  test('should evaluate visibility rules correctly', () => {
    const rule: Rule = {
      id: 'test-rule',
      when: { '==': [{ var: 'age' }, 18] },
      then: { type: 'SHOW_FIELD', target: 'adultField' }
    };
    
    const context = { values: { age: 18 }, globals: {} };
    const actions = evaluateRule(rule, context);
    
    expect(actions).toEqual([
      { type: 'SHOW_FIELD', target: 'adultField' }
    ]);
  });
});
```

## Configuration and Extensibility

### 1. Custom Field Types

```typescript
interface FieldTypeRegistry {
  register(type: string, component: ComponentType<FieldProps>): void;
  get(type: string): ComponentType<FieldProps> | undefined;
}

const fieldTypeRegistry: FieldTypeRegistry = {
  types: new Map(),
  
  register(type: string, component: ComponentType<FieldProps>) {
    this.types.set(type, component);
  },
  
  get(type: string) {
    return this.types.get(type);
  }
};

// Usage
fieldTypeRegistry.register('custom-slider', CustomSliderComponent);
```

### 2. Custom Validation Rules

```typescript
interface ValidatorRegistry {
  register(type: string, validator: ValidatorFunction): void;
  validate(type: string, value: any, config: any): ValidationResult;
}

type ValidatorFunction = (value: any, config: any) => ValidationResult;
type ValidationResult = { valid: boolean; message?: string };
```

This technical architecture documentation provides the detailed implementation view needed by developers working with the Form Renderer system, complementing the user-friendly documentation we updated earlier.