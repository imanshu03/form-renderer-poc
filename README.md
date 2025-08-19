# Form Renderer POC

## Grid layout

Sections may define a `layout` to arrange fields in a grid. The `columns` value controls how many grid columns are available, and each field can specify a `span` to occupy multiple columns.

```json
{
  "sections": [
    {
      "id": "contact",
      "title": "Contact Information",
      "layout": { "columns": 2 },
      "fields": [
        { "id": "first", "type": "text", "label": "First name", "span": 1 },
        { "id": "last", "type": "text", "label": "Last name", "span": 1 },
        { "id": "email", "type": "text", "label": "Email", "span": 2 }
      ]
    }
  ]
}
```

If `layout` or `span` are omitted they default to `1`.
