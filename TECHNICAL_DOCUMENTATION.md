# Form Renderer POC - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Data Flow](#data-flow)
4. [Schema Structure](#schema-structure)
5. [Rule Engine](#rule-engine)
6. [Dependency Graph](#dependency-graph)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Validation System](#validation-system)
10. [Advanced Features](#advanced-features)

---

## Architecture Overview

The Form Renderer is a sophisticated, rule-driven dynamic form system built with React, TypeScript, and shadcn/ui components. It implements a declarative approach where forms are defined through JSON schemas and behaviors are controlled through JSONLogic rules.

### Key Design Principles

1. **Declarative Configuration**: Forms are defined through schemas, not code
2. **Reactive Rule Engine**: Real-time evaluation of visibility, enable/disable, and validation rules
3. **Immutable State Management**: All state changes create new snapshots
4. **Type Safety**: Full TypeScript coverage with strict typing
5. **Component Modularity**: Clear separation of concerns between engine, renderer, and UI

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FormRenderer                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Schema + Globals                     │   │
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

---

## Core Concepts

### 1. Form Schema
The schema is the single source of truth for form structure, validation, and behavior.

```typescript
interface FormSchema {
  id?: string;              // Unique identifier (auto-generated if not provided)
  version: string;          // Schema version for migration support
  meta?: {                  // Metadata about the form
    title?: string;
    description?: string;
  };
  globals?: GlobalContext;  // Global variables accessible in rules
  sections: Section[];      // Form sections with fields
  formRules?: Rule[];       // Form-level rules
  navigation?: NavigationConfig;  // Navigation behavior
  submission?: SubmissionConfig;  // Submission configuration
}
```

### 2. Form Snapshot
A snapshot represents the complete state of the form at any point in time.

```typescript
interface FormSnapshot {
  schema: FormSchema;       // Reference to the schema
  globals: GlobalContext;   // Merged globals (schema + props)
  values: Record<string, any>;  // Current field values
  ui: FormUIState;         // UI state for sections and fields
  errors: Record<string, string>;  // Validation errors
  deps: DependencyGraph;   // Rule dependencies
}
```

### 3. Dependency Graph
Maps relationships between fields and rules for efficient evaluation.

```typescript
interface DependencyGraph {
  byField: Record<string, string[]>;  // field ID -> rule IDs that depend on it
  rules: Record<string, {              // rule ID -> rule details
    rule: Rule;
    reads: string[];  // fields this rule reads from
  }>;
}
```

---

## Data Flow

### Initial Rendering Flow

1. **Schema Loading**
   ```
   FormRenderer receives schema → 
   Generate/use form ID → 
   Merge globals (schema + props)
   ```

2. **Snapshot Creation**
   ```typescript
   createSnapshot(schema, globals) {
     1. Build dependency graph from schema
     2. Initialize UI state (all sections/fields visible)
     3. Generate initial values (defaults or empty)
     4. Create initial snapshot
     5. Evaluate ALL rules once
     6. Apply resulting actions to snapshot
     7. Return final initial snapshot
   }
   ```

3. **Form Initialization**
   ```
   Initialize React Hook Form with snapshot.values →
   Create Zod validation schema →
   Render UI components based on snapshot.ui
   ```

### Value Change Flow

When a user changes a field value:

```typescript
// 1. React Hook Form detects change
watch() triggers useEffect

// 2. Update snapshot
updateSnapshot(snapshot, fieldId, newValue) {
  // Update value in snapshot
  newSnapshot.values[fieldId] = newValue
  
  // Find affected rules
  affectedRuleIds = deps.byField[fieldId]
  
  // Evaluate only affected rules
  actions = evaluateRules(affectedRuleIds, newSnapshot)
  
  // Apply actions (SHOW/HIDE, ENABLE/DISABLE, SET_VALUE, etc.)
  return applyActions(actions, newSnapshot)
}

// 3. React re-renders affected components
// Components check snapshot.ui for their state
```

---

## Schema Structure

### Section Definition

```typescript
interface Section {
  id: string;
  label?: string;
  description?: string;
  visibilityRule?: JsonLogicExpression;  // When to show section
  disabled?: boolean;
  rows?: SectionRow[];    // Layout definition
  fields?: FieldBase[];   // Field definitions
}
```

### Field Definition

```typescript
interface FieldBase {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  disabled?: boolean;
  readOnly?: boolean;
  visibilityRule?: JsonLogicExpression;
  rules?: Rule[];         // Field-specific rules
  validators?: Validator[];  // Validation rules
  options?: FieldOptions;    // For select/radio fields
}
```

### Layout System

The layout uses a responsive grid system:

```typescript
interface SectionRow {
  id?: string;
  columns: number;        // Grid columns (1-12)
  gap?: number;          // Gap between items
  items: RowItem[];      // Fields in this row
}

interface RowItem {
  fieldId: string;       // Reference to field
  colSpan?: number;      // Columns to span
  // Responsive overrides
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}
```

---

## Rule Engine

### JSONLogic Implementation

The rule engine uses JSONLogic for declarative condition evaluation:

```typescript
// Example rule structure
{
  id: "pan_enable_rule",
  when: {
    "and": [
      { ">=": [{ "var": "age" }, 18] },
      { "!=": [{ "var": "globals.country" }, "USA"] }
    ]
  },
  then: { type: "ENABLE", target: "panNumber" },
  else: { type: "DISABLE", target: "panNumber" }
}
```

### Variable Resolution

Variables are resolved from three contexts:

1. **Field Values**: `{ "var": "fieldId" }` → `snapshot.values.fieldId`
2. **Globals**: `{ "var": "globals.key" }` → `snapshot.globals.key`
3. **Parameters**: `{ "var": "params.key" }` → Runtime parameters

### Evaluation Process

```typescript
evaluate(expression, context) {
  // 1. Handle primitives
  if (isPrimitive(expression)) return expression
  
  // 2. Handle variable references
  if (expression.var) {
    // Check prefix for context
    if (expression.var.startsWith('globals.')) {
      return getFromGlobals(expression.var)
    }
    // Default to field values
    return getFromValues(expression.var)
  }
  
  // 3. Handle operators
  switch(operator) {
    case '==': return left === right
    case '>=': return left >= right
    case 'and': return all conditions true
    // ... etc
  }
}
```

### Action Types

```typescript
type EngineAction = 
  | { type: 'SHOW_SECTION', target: string }
  | { type: 'HIDE_SECTION', target: string }
  | { type: 'SHOW_FIELD', target: string }
  | { type: 'HIDE_FIELD', target: string }
  | { type: 'ENABLE', target: string }
  | { type: 'DISABLE', target: string }
  | { type: 'SET_VALUE', target: string, value: any }
  | { type: 'SET_OPTIONS', target: string, value: Option[] }
  | { type: 'SET_ERROR', target: string, value: string }
  | { type: 'CLEAR_ERROR', target: string }
```

---

## Dependency Graph

### Building the Graph

The dependency graph is built during initialization:

```typescript
buildDependencyGraph(schema) {
  const graph = { byField: {}, rules: {} }
  
  // 1. Process section visibility rules
  sections.forEach(section => {
    if (section.visibilityRule) {
      // Create synthetic rule
      const ruleId = `section_${section.id}_visibility`
      const reads = extractVariablePaths(section.visibilityRule)
      
      // Map dependencies
      reads.forEach(fieldPath => {
        if (!fieldPath.startsWith('globals.')) {
          graph.byField[fieldPath].push(ruleId)
        }
      })
    }
  })
  
  // 2. Process field rules
  // Similar process for field visibility and custom rules
  
  // 3. Detect cycles
  detectCycles(graph)
  
  return graph
}
```

### Dependency Resolution

When a field changes, the graph efficiently finds all affected rules:

```typescript
getRulesForField(fieldId, deps) {
  return deps.byField[fieldId] || []
}
```

### Topological Sorting

Rules are sorted to ensure proper evaluation order:

```typescript
sortRulesForEvaluation(ruleIds, deps) {
  // Build write dependencies
  const writesTo = findWriteDependencies(ruleIds, deps)
  
  // Topological sort
  const sorted = []
  const visited = new Set()
  
  function visit(ruleId) {
    if (visited.has(ruleId)) return
    
    // Visit dependencies first
    const dependencies = findDependencies(ruleId)
    dependencies.forEach(visit)
    
    visited.add(ruleId)
    sorted.push(ruleId)
  }
  
  ruleIds.forEach(visit)
  return sorted
}
```

---

## Component Architecture

### FormRenderer Component

The main orchestrator component:

```typescript
function FormRenderer({ schema, globals, onSubmit }) {
  // 1. Form ID management
  const formId = useMemo(() => 
    schema.id || generateFormId(), [schema]
  )
  
  // 2. Globals merging
  const mergedGlobals = useMemo(() => ({
    ...schema.globals,
    ...globals  // Props override schema
  }), [schema.globals, globals])
  
  // 3. Snapshot state
  const [snapshot, setSnapshot] = useState(() =>
    createSnapshot(schema, mergedGlobals)
  )
  
  // 4. React Hook Form integration
  const methods = useForm({
    defaultValues: snapshot.values,
    resolver: zodResolver(validationSchema),
    mode: 'onChange'
  })
  
  // 5. Value change handling
  useEffect(() => {
    // Update snapshot when form values change
    const newSnapshot = updateSnapshot(snapshot, changes)
    setSnapshot(newSnapshot)
  }, [watchedValues])
  
  // 6. Render layout based on navigation type
  return <FormProvider {...methods}>
    {renderLayout()}
  </FormProvider>
}
```

### SectionRenderer Component

Renders a section with its layout:

```typescript
function SectionRenderer({ section, snapshot }) {
  const sectionUI = snapshot.ui.sections[section.id]
  
  // Check visibility
  if (!sectionUI?.visible) return null
  
  // Render rows layout
  return (
    <Card className={sectionUI.disabled && 'opacity-50'}>
      {section.rows.map(row => (
        <div className={`grid grid-cols-${row.columns}`}>
          {row.items.map(item => (
            <div className={`col-span-${item.colSpan}`}>
              <FieldRenderer field={field} snapshot={snapshot} />
            </div>
          ))}
        </div>
      ))}
    </Card>
  )
}
```

### FieldRenderer Component

Renders individual fields with proper state:

```typescript
function FieldRenderer({ field, snapshot }) {
  const fieldUI = snapshot.ui.fields[field.id]
  const { control } = useFormContext()
  
  // Check visibility
  if (!fieldUI?.visible) return null
  
  // Determine disabled state (UI state takes precedence)
  const isDisabled = fieldUI.disabled !== undefined 
    ? fieldUI.disabled 
    : field.disabled
  
  // Render appropriate component
  switch(field.type) {
    case 'text':
      return <Controller
        name={field.id}
        control={control}
        render={({ field: formField }) => (
          <Input {...formField} disabled={isDisabled} />
        )}
      />
    // ... other field types
  }
}
```

---

## State Management

### Snapshot Immutability

All state changes create new snapshots:

```typescript
function applyActions(actions, snapshot) {
  // Clone snapshot
  const newSnapshot = {
    ...snapshot,
    values: { ...snapshot.values },
    ui: {
      sections: { ...snapshot.ui.sections },
      fields: { ...snapshot.ui.fields }
    }
  }
  
  // Apply each action
  actions.forEach(action => {
    switch(action.type) {
      case 'ENABLE':
        newSnapshot.ui.fields[action.target] = {
          ...newSnapshot.ui.fields[action.target],
          disabled: false
        }
        break
      // ... other actions
    }
  })
  
  return newSnapshot
}
```

### React Hook Form Integration

The system uses React Hook Form for:
- Form value management
- Field registration
- Validation triggering
- Submit handling

```typescript
// Field registration through Controller
<Controller
  name={field.id}
  control={control}
  render={({ field: formField }) => <Component {...formField} />}
/>
```

### State Synchronization

Three states are kept in sync:
1. **Snapshot State**: Complete form state including UI
2. **React Hook Form State**: Form values and validation
3. **Component State**: Individual component states

---

## Validation System

### Dynamic Zod Schema Generation

Validation schemas are generated dynamically based on current state:

```typescript
function createFormSchema(schema, snapshot) {
  const shape = {}
  
  schema.sections.forEach(section => {
    const sectionUI = snapshot.ui.sections[section.id]
    if (!sectionUI?.visible) return
    
    section.fields.forEach(field => {
      const fieldUI = snapshot.ui.fields[field.id]
      if (!fieldUI?.visible) return
      
      // Build field validation
      let fieldSchema = buildFieldSchema(field)
      
      // Apply conditional validators
      field.validators?.forEach(validator => {
        if (validator.when) {
          const shouldApply = evaluate(validator.when, snapshot)
          if (shouldApply) {
            fieldSchema = applyValidator(fieldSchema, validator)
          }
        }
      })
      
      shape[field.id] = fieldSchema
    })
  })
  
  return z.object(shape)
}
```

### Validator Types

```typescript
type ValidatorType = 
  | 'required'
  | 'minLength' | 'maxLength'
  | 'min' | 'max'
  | 'email' | 'url'
  | 'regex'
  | 'custom'

interface Validator {
  type: ValidatorType
  value?: any
  message?: string
  when?: JsonLogicExpression  // Conditional validation
}
```

---

## Advanced Features

### 1. Form ID Management

Every form has a unique ID for tracking:

```typescript
// Auto-generation if not provided
const formId = schema.id || generateFormId()

// Submission includes form ID
onSubmit({
  id: formId,
  formData: payload
})
```

### 2. Reset Functionality

Complete form reset to initial state:

```typescript
const handleReset = () => {
  // Reset React Hook Form
  reset(initialValues)
  
  // Recreate snapshot (re-evaluates all rules)
  const newSnapshot = createSnapshot(schema, globals)
  setSnapshot(newSnapshot)
}
```

### 3. Multi-Section Navigation

Supports different navigation patterns:
- **Tabs**: All sections visible in sidebar
- **Stepper**: Sequential progression
- **Single**: All sections on one page

```typescript
interface NavigationConfig {
  type: 'tabs' | 'stepper' | 'single'
  validateOnNext?: boolean    // Validate before navigation
  allowSkip?: boolean         // Allow skipping sections
  allowReset?: boolean        // Show reset button
}
```

### 4. Remote Options Loading

Dynamic option loading for select fields:

```typescript
interface RemoteOptions {
  source: 'REMOTE'
  url: string                 // API endpoint
  dependencies?: string[]     // Fields that trigger reload
  itemsPath?: string         // Path to items in response
  labelKey: string           // Property for label
  valueKey: string           // Property for value
}

// Usage with React Query
function useRemoteOptions({ config, formValues, enabled }) {
  return useQuery({
    queryKey: ['options', config.url, dependencies],
    queryFn: () => fetchOptions(config, formValues),
    enabled: enabled && !!config.url
  })
}
```

### 5. Globals System

Global variables accessible in rules and templates:

```typescript
// Schema globals
schema.globals = {
  companyName: "Acme Corp",
  minAge: 18
}

// Override via props
<FormRenderer globals={{ minAge: 21 }} />

// Access in rules
{ ">=": [{ "var": "age" }, { "var": "globals.minAge" }] }

// Template substitution
defaultValue: "${globals.companyName}"
```

### 6. Dependency-Free Rule Evaluation

Rules are evaluated efficiently based on dependencies:

```typescript
// Only rules affected by 'age' field are evaluated
updateSnapshot(snapshot, 'age', 25)
// → finds rules: ['section_identification_visibility', 'pan_enable_rule']
// → evaluates only these rules
// → applies resulting actions
```

### 7. Cycle Detection

Prevents infinite loops in rule evaluation:

```typescript
function detectCycles(rules) {
  const visited = new Set()
  const stack = new Set()
  
  function visit(ruleId, path = []) {
    if (stack.has(ruleId)) {
      // Found cycle
      throw new Error(`Cycle detected: ${path.join(' → ')}`)
    }
    // ... traversal logic
  }
}
```

---

## Performance Optimizations

### 1. Memoization
- Schema processing with `useMemo`
- Validation schema generation
- Visible sections filtering

### 2. Selective Re-rendering
- Only affected components re-render on state change
- Section/Field visibility checks prevent unnecessary renders

### 3. Efficient Rule Evaluation
- Dependency graph ensures minimal rule evaluation
- Topological sorting prevents redundant evaluations

### 4. Lazy Component Loading
- Fields only render when visible
- Sections mount/unmount based on visibility

---

## Error Handling

### Rule Evaluation Errors
```typescript
try {
  const result = evaluate(rule.when, context)
} catch (error) {
  console.error(`Rule evaluation failed: ${rule.id}`, error)
  // Fail safe - don't apply action
  return false
}
```

### Circular Dependency Detection
```typescript
if (detectCycles(dependencyGraph)) {
  throw new Error('Circular dependency detected in rules')
}
```

### Validation Error Display
```typescript
const error = formState.errors[field.id]
if (error) {
  return <span className="text-destructive">{error.message}</span>
}
```

---

## Security Considerations

1. **JSONLogic Sandboxing**: Rules can only access predefined variables
2. **Input Sanitization**: All user inputs are validated before processing
3. **XSS Prevention**: React's built-in XSS protection
4. **Schema Validation**: Schemas should be validated server-side

---

## Future Enhancements

1. **Rule Debugging**: Visual rule evaluation debugger
2. **Schema Versioning**: Migration support for schema changes
3. **Custom Components**: Plugin system for custom field types
4. **Async Rules**: Support for async rule evaluation
5. **Partial State Persistence**: Save/restore form progress
6. **Collaborative Editing**: Multi-user form editing support

---

## Conclusion

This form renderer implements a sophisticated, production-ready dynamic form system with:
- Complete type safety
- Efficient rule evaluation
- Flexible layout system
- Comprehensive validation
- Clean separation of concerns

The architecture ensures maintainability, extensibility, and performance while providing a developer-friendly API for complex form requirements.