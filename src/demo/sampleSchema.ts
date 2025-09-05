import { FormSchema } from "../types/schema";

export const sampleSchema: FormSchema = {
  id: "employee-onboarding-form",
  version: "1.0.0",
  meta: {
    title: "Employee Onboarding Form",
    description: "Complete employee information for onboarding",
  },
  globals: {
    companyName: "Acme Corp",
    department: "Engineering",
    country: "India",
    minAge: 18,
  },
  sections: [
    {
      id: "personal",
      label: "Personal Information",
      description: "Basic personal details",
      rows: [
        {
          columns: 1,
          items: [{ fieldId: "welcomeInfo", colSpan: 1 }],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "firstName", colSpan: 1 },
            { fieldId: "lastName", colSpan: 1 },
          ],
        },
        {
          columns: 3,
          gap: 4,
          items: [
            { fieldId: "email", colSpan: 2 },
            { fieldId: "age", colSpan: 1 },
          ],
        },
        {
          columns: 1,
          items: [{ fieldId: "bio", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "welcomeInfo",
          type: "info",
          label: "Welcome to Acme Corp",
          content: "Please fill out your personal information below. This information will be used for your employee profile and official documentation. All fields marked with an asterisk (*) are required.",
          variant: "info",
        },
        {
          id: "firstName",
          type: "text",
          label: "First Name",
          placeholder: "Enter your first name",
          validators: [
            { type: "required", message: "First name is required" },
            {
              type: "minLength",
              value: 2,
              message: "Must be at least 2 characters",
            },
          ],
          tooltip: {
            helpfulHint: "Enter your legal first name",
            helpText: "This should match the name on your government-issued ID. Middle names should not be included here."
          },
        },
        {
          id: "lastName",
          type: "text",
          label: "Last Name",
          placeholder: "Enter your last name",
          validators: [{ type: "required", message: "Last name is required" }],
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "you@example.com",
          helpText: "We'll use this for official communication",
          validators: [
            { type: "required", message: "Email is required" },
            { type: "email", message: "Please enter a valid email" },
          ],
          tooltip: {
            helpfulHint: "Use your work email address if you have one"
          },
        },
        {
          id: "age",
          type: "number",
          label: "Age",
          placeholder: "Your age",
          validators: [
            { type: "required", message: "Age is required" },
            {
              type: "min",
              value: 18,
              message: "Must be at least 18 years old",
            },
            { type: "max", value: 100, message: "Invalid age" },
          ],
        },
        {
          id: "bio",
          type: "textarea",
          label: "Brief Bio",
          placeholder: "Tell us about yourself...",
          helpText: "Optional: Share a brief introduction",
        },
      ],
    },
    {
      id: "employment",
      label: "Employment Details",
      description: "Job-related information",
      rows: [
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "position", colSpan: 1 },
            { fieldId: "department", colSpan: 1 },
          ],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "startDate", colSpan: 1 },
            { fieldId: "employmentType", colSpan: 1 },
          ],
        },
        {
          columns: 1,
          items: [{ fieldId: "remoteWork", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "position",
          type: "select",
          label: "Position",
          placeholder: "Select your position",
          validators: [{ type: "required", message: "Position is required" }],
          options: {
            source: "STATIC",
            options: [
              { label: "Software Engineer", value: "software_engineer" },
              {
                label: "Senior Software Engineer",
                value: "senior_software_engineer",
              },
              { label: "Staff Engineer", value: "staff_engineer" },
              { label: "Engineering Manager", value: "engineering_manager" },
              { label: "Product Manager", value: "product_manager" },
              { label: "Designer", value: "designer" },
            ],
          },
        },
        {
          id: "department",
          type: "text",
          label: "Department",
          defaultValue: "${globals.department}",
          readOnly: true,
          helpText: "Auto-filled from company settings",
        },
        {
          id: "startDate",
          type: "date",
          label: "Start Date",
          validators: [{ type: "required", message: "Start date is required" }],
        },
        {
          id: "employmentType",
          type: "radio",
          label: "Employment Type",
          validators: [
            { type: "required", message: "Please select employment type" },
          ],
          options: {
            source: "STATIC",
            options: [
              { label: "Full-time", value: "full_time" },
              { label: "Part-time", value: "part_time" },
              { label: "Contract", value: "contract" },
              { label: "Intern", value: "intern" },
            ],
          },
        },
        {
          id: "remoteWork",
          type: "switch",
          label: "Remote Work",
          defaultValue: false,
        },
      ],
    },
    {
      id: "identification",
      label: "Identification",
      description: "Government ID information",
      visibilityRule: {
        ">=": [{ var: "age" }, { var: "globals.minAge" }],
      },
      rows: [
        {
          columns: 1,
          items: [{ fieldId: "identificationInfo", colSpan: 1 }],
        },
        {
          columns: 2,
          gap: 4,
          items: [{ fieldId: "hasSSN", colSpan: 2 }],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "ssn", colSpan: 1 },
            { fieldId: "panNumber", colSpan: 1 },
          ],
        },
      ],
      fields: [
        {
          id: "identificationInfo",
          type: "info",
          label: "Important Notice",
          content: "This section requires government-issued identification information. Please ensure all information is accurate and matches your official documents. Providing false information may result in delays in your onboarding process.",
          variant: "warning",
        },
        {
          id: "hasSSN",
          type: "checkbox",
          label: "I have a Social Security Number",
          defaultValue: false,
        },
        {
          id: "ssn",
          type: "text",
          label: "Social Security Number",
          placeholder: "XXX-XX-XXXX",
          disabled: true,
          rules: [
            {
              id: "ssn_enable_rule",
              when: { "==": [{ var: "hasSSN" }, true] },
              then: { type: "ENABLE", target: "ssn" },
              else: { type: "DISABLE", target: "ssn" },
            },
          ],
          validators: [
            {
              type: "required",
              message: "SSN is required",
              when: { "==": [{ var: "hasSSN" }, true] },
            },
            {
              type: "regex",
              value: "^\\d{3}-\\d{2}-\\d{4}$",
              message: "Format: XXX-XX-XXXX",
              when: { "==": [{ var: "hasSSN" }, true] },
            },
          ],
        },
        {
          id: "panNumber",
          type: "text",
          label: "PAN Number",
          placeholder: "ABCDE1234F",
          helpText: "Required for tax purposes",
          disabled: true,
          rules: [
            {
              id: "pan_enable_rule",
              when: {
                and: [
                  { ">=": [{ var: "age" }, 18] },
                  { "!=": [{ var: "globals.country" }, "USA"] },
                ],
              },
              then: { type: "ENABLE", target: "panNumber" },
              else: { type: "DISABLE", target: "panNumber" },
            },
          ],
          validators: [
            {
              type: "regex",
              value: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
              message: "Invalid PAN format",
              when: {
                and: [
                  { ">=": [{ var: "age" }, 18] },
                  { "!=": [{ var: "globals.country" }, "USA"] },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: "preferences",
      label: "Preferences",
      description: "Your work preferences",
      rows: [
        {
          columns: 1,
          items: [{ fieldId: "skills", colSpan: 1 }],
        },
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "shirtSize", colSpan: 1 },
            { fieldId: "dietaryRestrictions", colSpan: 1 },
          ],
        },
        {
          columns: 1,
          items: [{ fieldId: "notes", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "skills",
          type: "multi-select",
          label: "Technical Skills",
          placeholder: "Select your skills",
          helpText: "Select all that apply",
          validators: [
            {
              type: "minLength",
              value: 1,
              message: "Select at least one skill",
            },
          ],
          options: {
            source: "STATIC",
            options: [
              { label: "JavaScript", value: "javascript" },
              { label: "TypeScript", value: "typescript" },
              { label: "React", value: "react" },
              { label: "Vue", value: "vue" },
              { label: "Angular", value: "angular" },
              { label: "Node.js", value: "nodejs" },
              { label: "Python", value: "python" },
              { label: "Java", value: "java" },
              { label: "Go", value: "go" },
              { label: "Rust", value: "rust" },
            ],
          },
        },
        {
          id: "shirtSize",
          type: "select",
          label: "T-Shirt Size",
          placeholder: "Select size",
          options: {
            source: "STATIC",
            options: [
              { label: "XS", value: "xs" },
              { label: "S", value: "s" },
              { label: "M", value: "m" },
              { label: "L", value: "l" },
              { label: "XL", value: "xl" },
              { label: "XXL", value: "xxl" },
            ],
          },
        },
        {
          id: "dietaryRestrictions",
          type: "text",
          label: "Dietary Restrictions",
          placeholder: "e.g., Vegetarian, Gluten-free",
          helpText: "Optional: For office events",
        },
        {
          id: "notes",
          type: "textarea",
          label: "Additional Notes",
          placeholder: "Any additional information you'd like to share...",
        },
      ],
    },
    {
      id: "preferences_settings",
      label: "Preferences & Settings",
      description: "Configure your workplace preferences",
      // This section will only contain subsections (no direct fields)
      subsections: [
        {
          id: "workspace",
          label: "Workspace Preferences",
          description: "Customize your work environment",
          defaultOpen: true, // This accordion will be open by default
          rows: [
            {
              columns: 2,
              gap: 4,
              items: [
                { fieldId: "preferredOS", colSpan: 1 },
                { fieldId: "monitorSetup", colSpan: 1 },
              ],
            },
            {
              columns: 1,
              items: [{ fieldId: "workspaceNotes", colSpan: 1 }],
            },
          ],
          fields: [
            {
              id: "preferredOS",
              type: "select",
              label: "Preferred Operating System",
              placeholder: "Select OS",
              options: {
                source: "STATIC",
                options: [
                  { label: "macOS", value: "macos" },
                  { label: "Windows", value: "windows" },
                  { label: "Linux", value: "linux" },
                ],
              },
            },
            {
              id: "monitorSetup",
              type: "select",
              label: "Monitor Setup",
              placeholder: "Select setup",
              options: {
                source: "STATIC",
                options: [
                  { label: "Single Monitor", value: "single" },
                  { label: "Dual Monitor", value: "dual" },
                  { label: "Triple Monitor", value: "triple" },
                  { label: "Ultrawide", value: "ultrawide" },
                ],
              },
            },
            {
              id: "workspaceNotes",
              type: "textarea",
              label: "Workspace Notes",
              placeholder: "Any specific workspace requirements...",
              helpText: "Optional: Ergonomic needs, desk setup, etc.",
            },
          ],
        },
        {
          id: "communication",
          label: "Communication Preferences",
          description: "How you prefer to communicate and receive updates",
          defaultOpen: false, // This accordion will be closed by default
          rows: [
            {
              columns: 1,
              gap: 4,
              items: [
                { fieldId: "preferredCommunication", colSpan: 1 },
                { fieldId: "meetingPreference", colSpan: 1 },
                { fieldId: "notificationSettings", colSpan: 1 },
              ],
            },
          ],
          fields: [
            {
              id: "preferredCommunication",
              type: "multi-select",
              label: "Preferred Communication Channels",
              placeholder: "Select channels",
              helpText: "Select all that apply",
              options: {
                source: "STATIC",
                options: [
                  { label: "Slack", value: "slack" },
                  { label: "Email", value: "email" },
                  { label: "Microsoft Teams", value: "teams" },
                  { label: "Phone", value: "phone" },
                  { label: "Video Call", value: "video" },
                ],
              },
            },
            {
              id: "meetingPreference",
              type: "select",
              label: "Meeting Preference",
              placeholder: "Select preference",
              options: {
                source: "STATIC",
                options: [
                  { label: "In-person when possible", value: "in_person" },
                  { label: "Video calls preferred", value: "video_preferred" },
                  { label: "Audio calls preferred", value: "audio_preferred" },
                  { label: "Async communication preferred", value: "async" },
                ],
              },
            },
            {
              id: "notificationSettings",
              type: "select",
              label: "Notification Frequency",
              placeholder: "Select frequency",
              options: {
                source: "STATIC",
                options: [
                  { label: "Real-time", value: "realtime" },
                  { label: "Hourly digest", value: "hourly" },
                  { label: "Daily digest", value: "daily" },
                  { label: "Weekly digest", value: "weekly" },
                ],
              },
            },
          ],
        },
        {
          id: "benefits",
          label: "Benefits & Perks",
          description: "Select your preferred benefits and company perks",
          defaultOpen: false,
          rows: [
            {
              columns: 2,
              gap: 4,
              items: [
                { fieldId: "healthPlan", colSpan: 1 },
                { fieldId: "retirementPlan", colSpan: 1 },
              ],
            },
            {
              columns: 1,
              items: [{ fieldId: "additionalBenefits", colSpan: 1 }],
            },
          ],
          fields: [
            {
              id: "healthPlan",
              type: "select",
              label: "Health Insurance Plan",
              placeholder: "Select plan",
              options: {
                source: "STATIC",
                options: [
                  { label: "Basic Plan", value: "basic" },
                  { label: "Standard Plan", value: "standard" },
                  { label: "Premium Plan", value: "premium" },
                  { label: "Family Plan", value: "family" },
                ],
              },
            },
            {
              id: "retirementPlan",
              type: "select",
              label: "Retirement Plan",
              placeholder: "Select plan",
              options: {
                source: "STATIC",
                options: [
                  { label: "401(k) - 3% Match", value: "401k_3" },
                  { label: "401(k) - 6% Match", value: "401k_6" },
                  { label: "Roth IRA", value: "roth_ira" },
                  { label: "No retirement plan", value: "none" },
                ],
              },
            },
            {
              id: "additionalBenefits",
              type: "multi-select",
              label: "Additional Benefits",
              placeholder: "Select benefits",
              helpText: "Select all that apply",
              options: {
                source: "STATIC",
                options: [
                  { label: "Gym Membership", value: "gym" },
                  { label: "Transit Pass", value: "transit" },
                  { label: "Learning Budget", value: "learning" },
                  { label: "Flexible PTO", value: "flexible_pto" },
                  { label: "Remote Work Stipend", value: "remote_stipend" },
                  { label: "Mental Health Support", value: "mental_health" },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  formRules: [],
  navigation: {
    type: "tabs",
    validateOnNext: true,
    allowSkip: true,
    allowReset: true, // Enable reset functionality
    allowSaveOnAll: true, // Allow saving even with validation errors
  },
  submission: {
    stripHiddenFields: true,
    stripDisabledFields: true,
  },
};

// Example without ID (will be auto-generated)
export const sampleSchemaNoId: FormSchema = {
  version: "1.0.0",
  meta: {
    title: "Simple Contact Form",
    description: "A form without an explicit ID",
  },
  sections: [
    {
      id: "contact",
      label: "Contact Information",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Name",
          validators: [{ type: "required", message: "Name is required" }],
        },
        {
          id: "email",
          type: "email",
          label: "Email",
          validators: [{ type: "required", message: "Email is required" }],
        },
      ],
    },
  ],
};

// Example with remote options
export const sampleSchemaWithRemote: FormSchema = {
  ...sampleSchema,
  sections: [
    ...sampleSchema.sections.slice(0, 2),
    {
      id: "location",
      label: "Location",
      rows: [
        {
          columns: 2,
          gap: 4,
          items: [
            { fieldId: "country", colSpan: 1 },
            { fieldId: "state", colSpan: 1 },
          ],
        },
      ],
      fields: [
        {
          id: "country",
          type: "select",
          label: "Country",
          placeholder: "Select country",
          validators: [{ type: "required", message: "Country is required" }],
          options: {
            source: "REMOTE",
            url: "https://restcountries.com/v3.1/all",
            itemsPath: "",
            labelKey: "name.common",
            valueKey: "cca2",
          },
        },
        {
          id: "state",
          type: "select",
          label: "State/Province",
          placeholder: "Select state",
          validators: [{ type: "required", message: "State is required" }],
          options: {
            source: "REMOTE",
            url: "https://api.example.com/states/${country}",
            dependencies: ["country"],
            itemsPath: "data.states",
            labelKey: "name",
            valueKey: "code",
          },
        },
      ],
    },
    ...sampleSchema.sections.slice(2),
  ],
};
