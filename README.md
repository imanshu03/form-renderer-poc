# Form Renderer POC

A dynamic form rendering engine with JSONLogic rules, responsive layouts, and shadcn/ui components.

## Features

### Core Capabilities
- **Dynamic Form Rendering**: Generate forms from JSON schema definitions
- **JSONLogic Rule Engine**: Powerful conditional logic for field visibility, enable/disable states, and validation
- **Responsive Grid Layouts**: Flexible row/column configuration with responsive breakpoints
- **Multi-Section Navigation**: Support for tabs and stepper navigation patterns
- **Conditional Validation**: Dynamic validation rules with Zod based on field states
- **Remote Data Fetching**: Load select options from APIs with dependency tracking
- **Placeholder Resolution**: Template variables with globals and form values
- **React Hook Form Integration**: Robust form state management
- **shadcn/ui Components**: Beautiful, accessible UI components

## Architecture

### Directory Structure
```
src/
├── engine/               # Core rule engine
│   ├── jsonlogic.ts     # JSONLogic evaluator
│   ├── deps.ts          # Dependency graph builder
│   ├── engine.ts        # Rule engine core
│   ├── validation.ts    # Dynamic Zod validation
│   └── placeholders.ts  # Template resolution
├── renderer/            # React components
│   ├── FormRenderer.tsx # Main form component
│   ├── FieldRenderer.tsx # Field rendering logic
│   ├── SectionRenderer.tsx # Section layout
│   ├── SectionsNav.tsx  # Navigation tabs/stepper
│   ├── SectionActions.tsx # Previous/Next/Save buttons
│   └── hooks/
│       └── useRemoteOptions.ts # Remote data fetching
├── types/
│   └── schema.ts        # TypeScript interfaces
├── utils/
│   ├── deepGet.ts       # Dot-path getter
│   └── deepSet.ts       # Dot-path setter
└── demo/
    └── sampleSchema.ts  # Example schemas
```

## Schema Structure

### Form Schema
```typescript
{
  version: string,
  meta: { title, description },
  globals: { /* global variables */ },
  sections: Section[],
  formRules: Rule[],
  navigation: { type, validateOnNext },
  submission: { stripHiddenFields, stripDisabledFields }
}
```

### Section with Grid Layout
```typescript
{
  id: string,
  label: string,
  rows: [
    {
      columns: 2,  // Number of columns
      gap: 4,      // Tailwind gap scale
      items: [
        { fieldId: 'firstName', colSpan: 1 },
        { fieldId: 'lastName', colSpan: 1 }
      ]
    }
  ],
  fields: FieldBase[]
}
```

### JSONLogic Rules
```typescript
{
  id: string,
  when: { '>=': [{ var: 'age' }, 18] },
  then: { type: 'SHOW_FIELD', target: 'ssn' },
  else: { type: 'HIDE_FIELD', target: 'ssn' }
}
```

## Usage

```typescript
import { FormRenderer } from './renderer/FormRenderer';
import { formSchema } from './schemas/mySchema';

function App() {
  const handleSubmit = async (data) => {
    console.log('Form data:', data);
    // Submit to API
  };

  const globals = {
    companyName: 'Acme Corp',
    country: 'USA'
  };

  return (
    <FormRenderer
      schema={formSchema}
      globals={globals}
      onSubmit={handleSubmit}
    />
  );
}
```

## Field Types Supported

- Text inputs: `text`, `email`, `tel`, `url`, `textarea`
- Numeric: `number`
- Selection: `select`, `multi-select`, `radio`, `checkbox`, `switch`
- Date/Time: `date`, `datetime`, `time`
- Other: `file`, `hidden`

## JSONLogic Operators

- Comparison: `==`, `!=`, `>`, `>=`, `<`, `<=`
- Logical: `and`, `or`, `not`
- String/Array: `in`, `empty`, `contains`, `startsWith`, `endsWith`
- Conditional: `if`
- Variables: `{ var: 'fieldId' }` or `{ var: 'globals.property' }`

## Engine Actions

- `SHOW_SECTION` / `HIDE_SECTION`
- `SHOW_FIELD` / `HIDE_FIELD`
- `ENABLE` / `DISABLE`
- `SET_VALUE`
- `SET_OPTIONS`
- `SET_ERROR` / `CLEAR_ERROR`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Example Rules

### Age-based Section Visibility
```javascript
{
  visibilityRule: {
    '>=': [{ var: 'age' }, { var: 'globals.minAge' }]
  }
}
```

### Conditional Field Enable
```javascript
{
  id: 'pan_enable_rule',
  when: {
    'and': [
      { '>=': [{ var: 'age' }, 18] },
      { '!=': [{ var: 'globals.country' }, 'USA'] }
    ]
  },
  then: { type: 'ENABLE', target: 'panNumber' }
}
```

### Dynamic Validation
```javascript
{
  validators: [{
    type: 'required',
    message: 'SSN is required',
    when: { '==': [{ var: 'hasSSN' }, true] }
  }]
}
```

## Remote Options

Configure select fields to fetch options from APIs:

```javascript
{
  options: {
    source: 'REMOTE',
    url: 'https://api.example.com/states/${country}',
    dependencies: ['country'],  // Refetch when country changes
    itemsPath: 'data.states',   // Path to array in response
    labelKey: 'name',
    valueKey: 'code'
  }
}
```

## Testing

The implementation includes a comprehensive demo with:
- Multi-section employee onboarding form
- Various field types and layouts
- Conditional logic examples
- Validation scenarios
- Remote data fetching simulation

Access the demo at `http://localhost:5174` after running `npm run dev`.