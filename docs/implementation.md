# Rule & Layout Engine with shadcn Components + react-hook-form + zod

## 1. Create/verify project scaffolding

- Create branch: `feat/rule-layout-engine-shadcn-rhf`.
- Ensure deps: `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand` (optional for non-form UI), React Router (if multi-page), Tailwind already configured.
- Confirm shadcn components exist under `/src/components/*`.

## 2. Define schema & engine contracts (`src/types/schema.ts`)

- **JsonLogic** (ops: `==`, `!=`, `>`, `>=`, `<`, `<=`, `and`, `or`, `not`, `in`, `empty`, `contains`, `startsWith`, `endsWith`, `if`, plus `{ var: string }`).
- **Form schema** types:
  - `GlobalContext`: arbitrary key/values BE can send (global values).
  - `FieldBase`: `{ id, type, label?, helpText?, defaultValue?, disabled?, readOnly?, visibilityRule?, rules?, validators?, options? }`.
  - `SectionRowItem`: `{ fieldId, colSpan?, xs?, sm?, md?, lg?, xl? }`.
  - `SectionRow`: `{ id?, columns: number, gap?: number, items: SectionRowItem[] }`.
  - `Section`: `{ id, label?, visibilityRule?, disabled?, rows?: SectionRow[], fields?: FieldBase[] (legacy) }`.
  - `EngineAction`: `SHOW_SECTION | HIDE_SECTION | ENABLE | DISABLE | SET_VALUE | SET_OPTIONS | SET_ERROR | CLEAR_ERROR`.
  - `FormSchema`: `{ version, meta?, globals?: GlobalContext, sections, formRules?, navigation?, submission? }`.

## 3. Utilities

- `src/utils/deepGet.ts`: dot-path getter with fallback.
- `src/utils/deepSet.ts`: dot-path setter.
- `src/engine/placeholders.ts`: recursive `${path.to.value}` resolver across objects/arrays/strings. Must read from `globals` and current `formValues`.

## 4. JSONLogic evaluator (`src/engine/jsonlogic.ts`)

- `evaluate(expr, { data, globals, params })` (pure function).
- Implement all ops from section 2.
- Unit tests for each op.

## 5. Dependency graph (`src/engine/deps.ts`)

- Parse rules from sections, fields, and form-level.
- Build:
  - `byField: Record<fieldId, ruleIds[]>`
  - `rules: Record<ruleId, { when, then?, else?, __reads: string[] }>`
- Detect cycles.

## 6. Rule engine core (`src/engine/engine.ts`)

- Helpers:
  - `seedUI(schema)`
  - `initialValues(schema, globals)`
  - `evaluateRules(ruleIds, snapshot, params?) -> EngineAction[]`
  - `applyActions(actions, snapshot) -> snapshot'`
- Snapshot shape:

```ts
{
  schema, globals,
  values: Record<string, any>,
  ui: {
    sections: Record<string, { visible: boolean; disabled: boolean }>,
    fields:   Record<string, { visible: boolean; disabled: boolean }>
  },
  errors: Record<string, string | undefined>,
  deps
}
```

## 7. Validation layer (`src/engine/validation.ts`)

- `zodFromField(field): ZodTypeAny`.
- Build section/form schemas dynamically (only visible + enabled).
- Support custom validators via JsonLogic.
- Provide dynamic `zodResolver`.

## 8. Dynamic options for selects (`src/renderer/hooks/useRemoteOptions.ts`)

- For REMOTE source:
  - Resolve placeholders.
  - Debounce requests.
  - Fetch & map via `itemsPath`, `labelKey`, `valueKey`.
  - Cache + invalidate when dependencies change.
  - Store `optionsRuntime[fieldId]`.

## 9. React integration: orchestration (`src/renderer/FormRenderer.tsx`)

- Use `useForm({ values: initialValues, resolver })`.
- On `watch` changes:
  - Find affected rules.
  - Re-evaluate and update UI snapshot.
- Provide `buildPayload()` that strips hidden/disabled if configured.
- Pass `onSave(payload)`.

## 10. Field Renderer (`src/renderer/FieldRenderer.tsx`)

- Use shadcn components:
  - Input, Textarea, Select, Checkbox, Switch, RadioGroup, Popover/Command, Label/Button.
- Integrate with react-hook-form (`Controller` where needed).
- Respect visibility/disabled state.
- Show error/help text.

## 11. Section Renderer (`src/renderer/SectionRenderer.tsx`)

- Render rows → `div.grid` with `grid-cols-{columns}` and `gap-{gap}`.
- Each item → `col-span-{colSpan || 1}` with responsive classes.
- Use `FieldRenderer`.
- Legacy fallback if rows absent.

## 12. Left tabs & right form layout

- `SectionsNav.tsx`: left sidebar of visible sections.
- `SectionActions.tsx`: Prev/Next/Save navigation.
- Right panel: render active section with `SectionRenderer`.

## 13. Page shell (optional)

- `FormPage.tsx`: receives schema + globals.
- Resolves placeholders.
- Initializes deps + RHF.
- Layout: left nav, right section + actions.
- On Save: calls `onSubmit(buildPayload())`.

## 14. Sample schema (`src/demo/sampleSchema.ts`)

- With globals, multi-row sections (2-col, 3-col).
- Rule: `age >= 18` enables PAN.
- Section visibility rule.
- Validators (required, regex).
- One REMOTE select.

## 15. Rules + RHF lifecycle

- Subscribe to `watch()`.
- Evaluate rules & update UI snapshot.
- Clear values for hidden fields if `submission.stripHiddenFields`.
- Handle disabled fields in `buildPayload()`.

## 16. Validation integration

- Dynamic Zod schema includes only visible + enabled fields.
- Section navigation: block Next if section invalid via `trigger()`.

## 17. Tests

- Unit: utils, placeholders, jsonlogic, deps, engine.
- Component: FieldRenderer types, SectionRenderer layout, SectionsNav nav logic.

## 18. Final acceptance checklist

- Schema renders with rows/columns.
- Left tabs show only visible sections.
- Rules show/hide/enable/disable as expected.
- Globals usable in placeholders & rules.
- Zod + RHF validation works.
- Navigation (Prev/Next/Save) correct.
- Submit payload strips hidden/disabled if configured.
- All UI uses `/src/components/*` only.
