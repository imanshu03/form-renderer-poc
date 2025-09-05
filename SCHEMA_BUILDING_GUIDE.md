# Form Schema Building Guide

This guide provides comprehensive instructions for building form schemas for the Form Renderer system. Use this as a reference for creating schemas from natural language requirements.

## Schema Structure Overview

Every form schema follows this basic structure:

```json
{
  "id": "unique-form-identifier",
  "version": "1.0.0",
  "meta": {
    "title": "Form Title",
    "description": "Form description"
  },
  "globals": {
    "key": "value"
  },
  "sections": [],
  "formRules": [],
  "navigation": {
    "type": "single|tabs|stepper",
    "validateOnNext": true,
    "allowSkip": false,
    "allowReset": true,
    "allowSaveOnAll": false
  }
}
```

## Core Schema Rules

### 1. Required Properties
- `version`: Always include, use semantic versioning
- `sections`: Must contain at least one section
- Each section must have an `id` and `fields` array
- Each field must have `id` and `type`

### 2. ID Naming Conventions
- Use camelCase for field and section IDs
- Be descriptive: `firstName` not `fn`
- Avoid spaces and special characters
- Keep IDs unique across the entire form

### 3. Field Types Available
```
Standard: text, email, number, textarea, password
Selection: select, multi-select, radio, checkbox, switch
Date/Time: date, time, datetime
Files: file
Advanced: table, info, heading, hidden
```

## Section Definition

### Basic Section
```json
{
  "id": "personalInfo",
  "label": "Personal Information", 
  "description": "Please provide your basic details",
  "fields": []
}
```

### Section with Layout Rows
```json
{
  "id": "contactDetails",
  "label": "Contact Details",
  "rows": [
    {
      "columns": 2,
      "gap": 4,
      "items": [
        { "fieldId": "firstName", "colSpan": 1 },
        { "fieldId": "lastName", "colSpan": 1 }
      ]
    },
    {
      "columns": 1,
      "items": [
        { "fieldId": "email", "colSpan": 1 }
      ]
    }
  ],
  "fields": []
}
```

### Section with Visibility Rule
```json
{
  "id": "businessInfo",
  "label": "Business Information",
  "visibilityRule": {
    "==": [{"var": "accountType"}, "business"]
  },
  "fields": []
}
```

## Field Definitions by Type

### Text Field
```json
{
  "id": "firstName",
  "type": "text",
  "label": "First Name",
  "placeholder": "Enter your first name",
  "validators": [
    {
      "type": "required",
      "message": "First name is required"
    },
    {
      "type": "minLength",
      "value": 2,
      "message": "First name must be at least 2 characters"
    }
  ]
}
```

### Email Field
```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",
  "placeholder": "your@email.com",
  "validators": [
    {
      "type": "required",
      "message": "Email is required"
    },
    {
      "type": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

### Number Field
```json
{
  "id": "age",
  "type": "number",
  "label": "Age",
  "placeholder": "Enter your age",
  "validators": [
    {
      "type": "required",
      "message": "Age is required"
    },
    {
      "type": "min",
      "value": 18,
      "message": "Must be at least 18 years old"
    },
    {
      "type": "max",
      "value": 120,
      "message": "Please enter a valid age"
    }
  ]
}
```

### Select Field (Dropdown)
```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "placeholder": "Select your country",
  "options": {
    "source": "STATIC",
    "options": [
      {"label": "United States", "value": "US"},
      {"label": "Canada", "value": "CA"},
      {"label": "United Kingdom", "value": "UK"}
    ]
  },
  "validators": [
    {
      "type": "required",
      "message": "Please select a country"
    }
  ]
}
```

### Remote Select Field
```json
{
  "id": "state",
  "type": "select",
  "label": "State/Province",
  "placeholder": "Select state",
  "options": {
    "source": "REMOTE",
    "url": "/api/states",
    "dependencies": ["country"],
    "itemsPath": "data.states",
    "labelKey": "name",
    "valueKey": "code"
  }
}
```

### Multi-Select Field
```json
{
  "id": "interests",
  "type": "multi-select",
  "label": "Interests",
  "placeholder": "Select your interests",
  "options": {
    "source": "STATIC",
    "options": [
      {"label": "Technology", "value": "tech"},
      {"label": "Sports", "value": "sports"},
      {"label": "Music", "value": "music"},
      {"label": "Travel", "value": "travel"}
    ]
  }
}
```

### Radio Field
```json
{
  "id": "accountType",
  "type": "radio",
  "label": "Account Type",
  "options": {
    "source": "STATIC",
    "options": [
      {"label": "Personal", "value": "personal"},
      {"label": "Business", "value": "business"}
    ]
  },
  "validators": [
    {
      "type": "required",
      "message": "Please select an account type"
    }
  ]
}
```

### Checkbox Field
```json
{
  "id": "terms",
  "type": "checkbox",
  "label": "I agree to the terms and conditions",
  "validators": [
    {
      "type": "required",
      "message": "You must accept the terms and conditions"
    }
  ]
}
```

### Switch Field
```json
{
  "id": "notifications",
  "type": "switch",
  "label": "Enable notifications",
  "defaultValue": true
}
```

### Date Field
```json
{
  "id": "birthDate",
  "type": "date",
  "label": "Date of Birth",
  "validators": [
    {
      "type": "required",
      "message": "Date of birth is required"
    }
  ]
}
```

### File Upload Field
```json
{
  "id": "resume",
  "type": "file",
  "label": "Resume",
  "placeholder": "Upload your resume (PDF, DOC, DOCX)",
  "accept": ".pdf,.doc,.docx",
  "multiple": false
}
```

### Multiple File Upload
```json
{
  "id": "documents",
  "type": "file",
  "label": "Supporting Documents",
  "placeholder": "Upload documents",
  "accept": ".pdf,.jpg,.png",
  "multiple": true
}
```

### Textarea Field
```json
{
  "id": "comments",
  "type": "textarea",
  "label": "Additional Comments",
  "placeholder": "Please share any additional information...",
  "validators": [
    {
      "type": "maxLength",
      "value": 500,
      "message": "Comments cannot exceed 500 characters"
    }
  ]
}
```

### Info Field (Display Only)
```json
{
  "id": "importantNotice",
  "type": "info",
  "content": "Please ensure all information is accurate before submitting.",
  "variant": "warning"
}
```

### Heading Field
```json
{
  "id": "sectionHeading",
  "type": "heading",
  "label": "Contact Information",
  "headingLevel": "h3"
}
```

### Table Field
```json
{
  "id": "contacts",
  "type": "table",
  "label": "Emergency Contacts",
  "minRows": 1,
  "maxRows": 5,
  "defaultRows": 2,
  "addRowText": "Add Contact",
  "columns": [
    {
      "id": "name",
      "label": "Name",
      "type": "text",
      "width": "200px",
      "validators": [{"type": "required", "message": "Name is required"}]
    },
    {
      "id": "relationship",
      "label": "Relationship",
      "type": "select",
      "width": "150px",
      "options": {
        "source": "STATIC",
        "options": [
          {"label": "Spouse", "value": "spouse"},
          {"label": "Parent", "value": "parent"},
          {"label": "Sibling", "value": "sibling"},
          {"label": "Friend", "value": "friend"}
        ]
      }
    },
    {
      "id": "phone",
      "label": "Phone",
      "type": "text",
      "width": "120px"
    },
    {
      "id": "primary",
      "label": "Primary",
      "type": "checkbox",
      "width": "80px"
    }
  ]
}
```

### Hidden Field
```json
{
  "id": "userId",
  "type": "hidden",
  "defaultValue": "${globals.currentUserId}"
}
```

## Validation Rules

### Available Validator Types
```json
{
  "type": "required",
  "message": "This field is required"
}

{
  "type": "minLength",
  "value": 3,
  "message": "Minimum 3 characters required"
}

{
  "type": "maxLength", 
  "value": 50,
  "message": "Maximum 50 characters allowed"
}

{
  "type": "min",
  "value": 18,
  "message": "Must be at least 18"
}

{
  "type": "max",
  "value": 100,
  "message": "Cannot exceed 100"
}

{
  "type": "email",
  "message": "Please enter a valid email address"
}

{
  "type": "url",
  "message": "Please enter a valid URL"
}

{
  "type": "regex",
  "value": "^[A-Z0-9]{5,10}$",
  "message": "Must be 5-10 uppercase alphanumeric characters"
}
```

### Conditional Validation
```json
{
  "type": "required",
  "message": "Social Security Number is required for US residents",
  "when": {
    "==": [{"var": "country"}, "US"]
  }
}
```

## Rules and Logic

### JSONLogic Operators
```
Comparison: ==, !=, >, >=, <, <=
Logical: and, or, !
Arrays: in, count (length), empty
String: contains, startsWith, endsWith
Math: +, -, *, /, %
Conditional: if
Variables: var (field reference)
```

### Variable References
```json
{"var": "fieldId"}              // Field value
{"var": "globals.companyName"}  // Global variable
{"var": "params.userId"}        // Parameter
```

### Field Visibility Rules

**Simple condition:**
```json
{
  "id": "driverLicense",
  "type": "text",
  "label": "Driver's License",
  "visibilityRule": {
    ">=": [{"var": "age"}, 16]
  }
}
```

**Array length condition:**
```json
{
  "id": "additionalInfo",
  "type": "textarea",
  "label": "Additional Information",
  "visibilityRule": {
    ">=": [{"count": {"var": "selectedOptions"}}, 3]
  }
}
```

**Show field when array is not empty:**
```json
{
  "id": "reviewSelectedItems",
  "type": "info",
  "content": "Please review your selected items below",
  "visibilityRule": {
    ">": [{"count": {"var": "selectedItems"}}, 0]
  }
}
```

### Section Visibility Rules
```json
{
  "id": "businessSection",
  "label": "Business Information",
  "visibilityRule": {
    "==": [{"var": "accountType"}, "business"]
  }
}
```

### Form-Level Rules
```json
{
  "formRules": [
    {
      "id": "enablePanField",
      "when": {
        "and": [
          {">=": [{"var": "age"}, 18]},
          {"!=": [{"var": "country"}, "US"]}
        ]
      },
      "then": {
        "type": "ENABLE",
        "target": "panNumber"
      },
      "else": {
        "type": "DISABLE",
        "target": "panNumber"
      }
    }
  ]
}
```

### Complex Rules with Multiple Actions
```json
{
  "id": "businessAccountRule",
  "when": {
    "==": [{"var": "accountType"}, "business"]
  },
  "then": [
    {"type": "SHOW_SECTION", "target": "businessInfo"},
    {"type": "SET_VALUE", "target": "accountCategory", "value": "corporate"},
    {"type": "ENABLE", "target": "vatNumber"}
  ],
  "else": [
    {"type": "HIDE_SECTION", "target": "businessInfo"},
    {"type": "SET_VALUE", "target": "accountCategory", "value": "individual"}
  ]
}
```

## Navigation Configuration

### Single Page Form
```json
{
  "navigation": {
    "type": "single",
    "allowReset": true,
    "allowSaveOnAll": false
  }
}
```

### Multi-Section with Tabs
```json
{
  "navigation": {
    "type": "tabs",
    "validateOnNext": false,
    "allowReset": true,
    "allowSaveOnAll": true
  }
}
```

### Step-by-Step Navigation
```json
{
  "navigation": {
    "type": "stepper",
    "validateOnNext": true,
    "allowSkip": false,
    "allowReset": true,
    "allowSaveOnAll": false
  }
}
```

### Navigation with Validation Skip
```json
{
  "navigation": {
    "type": "stepper",
    "validateOnNext": true,
    "allowSkip": true,
    "allowReset": true,
    "allowSaveOnAll": true
  }
}
```

## Global Variables

### Schema Globals
```json
{
  "globals": {
    "companyName": "Acme Corporation",
    "currentYear": 2024,
    "minAge": 18,
    "supportEmail": "support@acme.com",
    "countries": ["US", "CA", "UK", "AU"]
  }
}
```

### Using Globals in Fields
```json
{
  "id": "companyField",
  "type": "text",
  "label": "Company Name",
  "defaultValue": "${globals.companyName}"
}
```

### Template Substitution in Labels, Placeholders, and Help Text

You can use `${fieldName}` syntax in field labels, placeholders, and helpText to dynamically insert values from other form fields:

```json
{
  "id": "client_name",
  "type": "text",
  "label": "Client Name",
  "validators": [
    {
      "type": "required",
      "message": "Client name is required"
    }
  ]
},
{
  "id": "inheritance_tax_liability_amount",
  "type": "number", 
  "label": "Enter value of tax liability (£)",
  "helpText": "This amount will be referenced in other fields for ${client_name}",
  "validators": [
    {
      "type": "min",
      "value": 0,
      "message": "Amount must be greater than 0"
    }
  ]
},
{
  "id": "tax_explanation",
  "type": "textarea",
  "label": "Complete the Sentence: There is a potential Inheritance Tax liability of £${inheritance_tax_liability_amount} but this was not a concern because...",
  "placeholder": "Explain why the £${inheritance_tax_liability_amount} liability is not a concern for ${client_name}",
  "helpText": "Provide detailed explanation for ${client_name} regarding the £${inheritance_tax_liability_amount} inheritance tax liability and why it's not a concern at this time."
}
```

**Template Substitution Features:**
- **Real-time Updates**: Labels, placeholders, and help text update automatically as users type
- **Field Values**: Access any form field value using `${fieldName}`
- **Globals**: Access global variables using `${globals.variableName}`
- **Number Formatting**: Number values are automatically converted to strings
- **Fallback**: If a field is empty or undefined, the placeholder text remains as-is

**Supported Fields:**
- **label**: Dynamic field labels that change based on form data
- **placeholder**: Contextual placeholder text with user-entered values
- **helpText**: Dynamic help text that provides personalized guidance

**Example Use Cases:**
- Dynamic labels that reference other field values
- Contextual help text that includes user-entered data  
- Personalized placeholders with client names or amounts
- Confirmation messages with calculated values
- Progress indicators showing completion status
- Instructions that adapt based on previous selections

### Using Globals in Rules
```json
{
  "when": {
    ">=": [{"var": "age"}, {"var": "globals.minAge"}]
  }
}
```

## Complete Example Schemas

### Simple Contact Form
```json
{
  "id": "contactForm",
  "version": "1.0.0",
  "meta": {
    "title": "Contact Us",
    "description": "Get in touch with our team"
  },
  "navigation": {
    "type": "single",
    "allowReset": true
  },
  "sections": [
    {
      "id": "contact",
      "label": "Contact Information",
      "rows": [
        {
          "columns": 2,
          "items": [
            {"fieldId": "firstName", "colSpan": 1},
            {"fieldId": "lastName", "colSpan": 1}
          ]
        },
        {
          "columns": 1,
          "items": [
            {"fieldId": "email", "colSpan": 1},
            {"fieldId": "message", "colSpan": 1}
          ]
        }
      ],
      "fields": [
        {
          "id": "firstName",
          "type": "text",
          "label": "First Name",
          "validators": [{"type": "required"}]
        },
        {
          "id": "lastName", 
          "type": "text",
          "label": "Last Name",
          "validators": [{"type": "required"}]
        },
        {
          "id": "email",
          "type": "email", 
          "label": "Email Address",
          "validators": [{"type": "required"}, {"type": "email"}]
        },
        {
          "id": "message",
          "type": "textarea",
          "label": "Message",
          "validators": [{"type": "required"}]
        }
      ]
    }
  ]
}
```

### Multi-Section Registration Form
```json
{
  "id": "userRegistration",
  "version": "1.0.0",
  "meta": {
    "title": "User Registration",
    "description": "Create your account"
  },
  "navigation": {
    "type": "stepper",
    "validateOnNext": true,
    "allowSkip": false,
    "allowReset": true
  },
  "sections": [
    {
      "id": "personalInfo",
      "label": "Personal Information",
      "fields": [
        {
          "id": "firstName",
          "type": "text", 
          "label": "First Name",
          "validators": [{"type": "required"}]
        },
        {
          "id": "lastName",
          "type": "text",
          "label": "Last Name", 
          "validators": [{"type": "required"}]
        },
        {
          "id": "email",
          "type": "email",
          "label": "Email Address",
          "validators": [{"type": "required"}, {"type": "email"}]
        },
        {
          "id": "accountType",
          "type": "radio",
          "label": "Account Type",
          "options": {
            "source": "STATIC",
            "options": [
              {"label": "Personal", "value": "personal"},
              {"label": "Business", "value": "business"}
            ]
          },
          "validators": [{"type": "required"}]
        }
      ]
    },
    {
      "id": "businessInfo",
      "label": "Business Information",
      "visibilityRule": {
        "==": [{"var": "accountType"}, "business"]
      },
      "fields": [
        {
          "id": "companyName",
          "type": "text",
          "label": "Company Name",
          "validators": [{"type": "required"}]
        },
        {
          "id": "vatNumber",
          "type": "text",
          "label": "VAT Number",
          "validators": [
            {
              "type": "required",
              "message": "VAT number is required for business accounts"
            }
          ]
        }
      ]
    },
    {
      "id": "preferences", 
      "label": "Preferences",
      "fields": [
        {
          "id": "newsletter",
          "type": "checkbox",
          "label": "Subscribe to newsletter"
        },
        {
          "id": "notifications",
          "type": "switch",
          "label": "Enable notifications",
          "defaultValue": true
        }
      ]
    }
  ]
}
```

## Schema Building Guidelines for AI Agents

### When Creating Schemas from Natural Language:

1. **Identify Form Structure**
   - Extract sections from logical groupings
   - Determine if multi-section navigation is needed
   - Identify conditional fields and sections

2. **Map Field Requirements**
   - Convert requirements to appropriate field types
   - Add validation rules based on constraints
   - Set up options for selection fields

3. **Establish Relationships**
   - Create rules for show/hide logic
   - Set up dependencies between fields
   - Configure conditional validation

4. **Configure Navigation**
   - Choose appropriate navigation type
   - Set validation requirements
   - Configure save/reset options

5. **Add Helpful Elements**
   - Include info fields for guidance
   - Add tooltips for complex fields
   - Use appropriate field labels and placeholders

### Common Patterns to Recognize:

- **"If X then show Y"** → Visibility rules
- **"Required for business accounts"** → Conditional validation
- **"Choose from list"** → Select/radio fields  
- **"Multiple selections"** → Multi-select/checkbox
- **"Upload documents"** → File fields
- **"Contact list/table"** → Table fields
- **"Step by step"** → Stepper navigation
- **"All on one page"** → Single navigation

### Default Behaviors:
- Always include form ID and version
- Set validateOnNext: true for steppers
- Add required validation where indicated
- Use descriptive field IDs and labels
- Include helpful placeholder text
- Set reasonable field constraints