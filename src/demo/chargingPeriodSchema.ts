import { FormSchema } from "../types/schema";

export const chargingPeriodSchema: FormSchema = {
  id: "charging-period-form",
  version: "1.0.0",
  sections: [
    {
      id: "submission_period",
      label: "Simple, Comparable Charging - Parallel Illustration Period",
      rows: [
        {
          columns: 1,
          items: [{ fieldId: "submission_period", colSpan: 1 }],
        },
        {
          columns: 1,
          items: [{ fieldId: "disclosure_note", colSpan: 1 }],
        },
      ],
      fields: [
        {
          id: "submission_period",
          type: "radio",
          label:
            "Are you submitting this business on or before 22 August 2025 or on or after 26 August 2025?",
          validators: [
            { type: "required", message: "Please select a submission period" },
          ],
          defaultValue: "after_26_august_2025",
          options: {
            source: "STATIC",
            options: [
              {
                label: "on or before 22 August 2025",
                value: "before_22_august_2025",
              },
              {
                label: "on or after 26 August 2025",
                value: "after_26_august_2025",
              },
            ],
          },
          helpText:
            "The date you select will determine which charging structure applies to your business. Please refer to the communication from 30 June 2025 for more details.",
          tooltip: "Choose based on your business submission date",
        },
        {
          id: "disclosure_note",
          type: "info",
          content:
            "As per the communication on Monday 30 June 2025, you are required to disclose the upcoming changes to the St. James's Place charging structure under Simple, Comparable Charging to your client.",
          variant: "default",
        },
      ],
    },
    {
      id: "covering_letter",
      label: "Covering Letter",
      subsections: [
        {
          id: "basic_client_details",
          label: "Basic Client Details",
          defaultOpen: false,
          rows: [
            { columns: 1, items: [{ fieldId: "client_type", colSpan: 1 }] },
            {
              columns: 1,
              items: [{ fieldId: "joint_basis_report", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "client_1_name", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "covering_letter_salutation", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "address_disclaimer_info", colSpan: 1 }],
            },
            {
              columns: 2,
              items: [
                { fieldId: "addresse", colSpan: 1 },
                { fieldId: "address_line_1", colSpan: 1 },
              ],
            },
            {
              columns: 2,
              items: [
                { fieldId: "address_line_2", colSpan: 1 },
                { fieldId: "address_line_3", colSpan: 1 },
              ],
            },
            {
              columns: 3,
              items: [
                { fieldId: "town_city", colSpan: 1 },
                { fieldId: "country", colSpan: 1 },
                { fieldId: "postcode", colSpan: 1 },
              ],
            },
          ],
          fields: [
            {
              id: "client_type",
              label:
                "Are you providing advice to a Retail (Private) Client or Corporate Client?",
              type: "radio",
              options: {
                source: "STATIC",
                options: [
                  { label: "Retail Client", value: "retail_client" },
                  { label: "Corporate Client", value: "corporate_client" },
                  {
                    label: "Professional Client",
                    value: "professional_client",
                  },
                ],
              },
              defaultValue: "retail_client",
            },
            {
              id: "joint_basis_report",
              label: "Is this report to be written on a joint basis?",
              type: "radio",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              defaultValue: "no",
              tooltip:
                "Suitability Letters for a Pension (Retirement Account, Trustee Investment Account or SIPP) cannot be written on a joint basis. Therefore, please answer this question as No for pension recommendations.",
            },
            {
              id: "client_1_name",
              type: "text",
              label: "Client 1 Name",
              placeholder: "Enter client 1 name",
              validators: [
                { type: "required", message: "Client 1 name is required" },
              ],
              helpText:
                "Please enter the client's name as it will appear throughout the suitability letter e.g. Mr Smith or John",
            },
            {
              id: "covering_letter_salutation",
              type: "text",
              label: "Covering Letter Salutation",
              helpText:
                "Do not include the word 'Dear' otherwise the letter will show 'Dear Dear' e.g. John & Sarah",
            },
            {
              id: "address_disclaimer_info",
              type: "info",
              content:
                "This is the person(s) to whom you are addressing the letter e.g. Mr & Mrs John Smith",
              variant: "info",
            },
            {
              id: "addresse",
              type: "text",
              label: "Address",
              placeholder: "Enter address",
            },
            {
              id: "address_line_1",
              type: "text",
              label: "Address Line 1",
              placeholder: "Enter address line 1",
            },
            {
              id: "address_line_2",
              type: "text",
              label: "Address Line 2",
              placeholder: "Enter address line 2",
            },
            {
              id: "address_line_3",
              type: "text",
              label: "Address Line 3",
              placeholder: "Enter address line 3",
            },
            {
              id: "town_city",
              type: "text",
              label: "Town/City",
              placeholder: "Enter town/city",
            },
            {
              id: "country",
              type: "text",
              label: "Country",
              placeholder: "Enter country",
            },
            {
              id: "postcode",
              type: "text",
              label: "Postcode",
              placeholder: "Enter postcode",
            },
          ],
        },
        {
          id: "covering_letter_information",
          label: "Covering Letter Information",
          defaultOpen: false,
          rows: [
            {
              columns: 1,
              items: [
                { fieldId: "covering_letter_section_heading", colSpan: 1 },
              ],
            },
            {
              columns: 2,
              items: [
                { fieldId: "covering_letter_reference", colSpan: 1 },
                { fieldId: "covering_letter_heading", colSpan: 1 },
              ],
            },
            {
              columns: 2,
              items: [{ fieldId: "covering_letter_date", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "personalised_introduction", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "ongoing_advice_paragraph", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [
                { fieldId: "partner_details_section_heading", colSpan: 1 },
              ],
            },
            {
              columns: 2,
              items: [
                { fieldId: "partner_name", colSpan: 1 },
                { fieldId: "partner_position", colSpan: 1 },
              ],
            },
            {
              columns: 2,
              items: [{ fieldId: "partner_firm_name", colSpan: 1 }],
            },
            {
              columns: 2,
              items: [
                { fieldId: "include_partner_qualifications", colSpan: 1 },
                { fieldId: "include_digital_signature", colSpan: 1 },
              ],
            },
            {
              columns: 1,
              items: [{ fieldId: "partner_qualifications", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "digital_signature", colSpan: 1 }],
            },
          ],
          fields: [
            {
              id: "covering_letter_section_heading",
              type: "heading",
              label: "Covering letter",
            },
            {
              id: "covering_letter_reference",
              type: "text",
              label: "Letter reference",
              helpText:
                "The reference will appear at the top of the letter and can be used to identify the letter e.g. Our Ref: Smith01.",
            },
            {
              id: "covering_letter_heading",
              type: "text",
              label: "Letter heading",
              helpText:
                "We suggest mentioning the product and company within the title for clarity.",
              defaultValue: "RE:",
            },
            {
              id: "covering_letter_date",
              type: "date",
              label: "Letter date",
              tooltip:
                "You must use the calendar to input your date otherwise the date will be omitted from the letter. If you leave the entry blank it will omit the date from your letter.",
              helpText:
                "To complete the audit trail it’s vital that you always date your letter.",
              validators: [
                { type: "required", message: "Letter date is required" },
              ],
            },
            {
              id: "personalised_introduction",
              type: "textarea",
              label: "Personalised Introduction Paragraph (optional)",
              helpText:
                "This Free Text Box can be used to include a personal introduction to your Suitability Letter, which will appear immediately after confirmation of the date of your discussions with the client in the Covering Letter section of your Suitability Letter.",
            },
            {
              id: "ongoing_advice_paragraph",
              type: "textarea",
              label: "Ongoing Advice",
              helpText:
                "Complete the Sentence: A key element of financial planning is conducting regular reviews of your circumstances to ensure the course of action taken today remains appropriate, as it is likely your objectives and circumstances will change over time. As part of my ongoing service I will...",
              validators: [
                {
                  type: "required",
                  message: "Ongoing advice paragraph is required",
                },
              ],
            },
            {
              id: "partner_details_section_heading",
              type: "heading",
              label: "Partner Details",
            },
            {
              id: "partner_name",
              type: "text",
              label: "Partner Name",
              helpText:
                "This is the person responsible for the advice and appears as a letter sign off e.g. Miss J Doe.",
              tooltip:
                "Firms should ensure that the ‘adviser’ mentioned in the letter is qualified and licensed to give advice in this area of financial planning.",
            },
            {
              id: "partner_position",
              type: "text",
              label: "Position",
              helpText:
                "This is the advisory title of the person responsible for the advice within a firm e.g. Financial Adviser or Financial Consultant.",
              tooltip:
                "If the person has other roles such as say Director the advisory role title should be input.",
            },
            {
              id: "partner_firm_name",
              type: "text",
              label: "Partner Firm Name",
              helpText:
                "Partner Firm name can be updated by super users within 'YOUR COMPANY'.",
              defaultValue: "St. James's Place",
            },
            {
              id: "include_partner_qualifications",
              type: "radio",
              label: "Include Partner Qualifications?",
              defaultValue: "no",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              id: "partner_qualifications",
              type: "text",
              label: "Qualifications",
              visibilityRule: {
                "==": [{ var: "include_partner_qualifications" }, "yes"],
              },
            },
            {
              id: "include_digital_signature",
              type: "radio",
              label: "Include Digital Signature?",
              defaultValue: "no",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              id: "digital_signature",
              type: "file",
              label: "Digital Signature",
              placeholder: "PNG, JPEG, GIF (MAX. 10MB each)",
              multiple: false,
              accept: ".png,.jpg,.jpeg,.gif",
              visibilityRule: {
                "==": [{ var: "include_digital_signature" }, "yes"],
              },
            },
          ],
        },
        {
          id: "advice_basis",
          label: "Advice Basis",
          rows: [
            {
              columns: 1,
              items: [{ fieldId: "meeting_dates", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "advice_types", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [{ fieldId: "advice_types_warning", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [
                { fieldId: "other_areas_identified_but_covered", colSpan: 1 },
              ],
            },
            {
              columns: 2,
              items: [
                { fieldId: "other_areas_made_aware_of", colSpan: 1 },
                { fieldId: "reason_for_not_covering_other_areas", colSpan: 1 },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "extra_details_for_will_contact_you",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "extra_details_for_not_a_priority",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 2,
              items: [
                { fieldId: "inheritance_tax_liability_amount", colSpan: 1 },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId:
                    "extra_details_for_no_concern_regarding_potential_tax_liability",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [{ fieldId: "online_kiid_kid_provided", colSpan: 1 }],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "ran_income_sustainability_calculator",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "income_sustainability_run_type",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "mortgage_form_completed_with_client_presence",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 2,
              items: [
                {
                  fieldId: "mortgage_fee_charged_to_client",
                  colSpan: 1,
                },
                {
                  fieldId: "mortgage_fee_charged_to_client_amount",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "mortgage_extra_reasoning",
                  colSpan: 1,
                },
              ],
            },
          ],
          fields: [
            {
              id: "meeting_dates",
              type: "table",
              label: "Meeting Date(s)",
              helpText:
                "Please enter the date(s) of any meeting(s) with the client in respect of the recommendation being covered within this Suitability Letter.",
              minRows: 1,
              defaultRows: 1,
              addRowText: "Add Meeting Dates",
              showHeaders: false,
              columns: [
                {
                  id: "date",
                  label: "Meeting Date",
                  type: "date",
                  showRowIndex: true,
                  validators: [
                    { type: "required", message: "Meeting date is required" },
                  ],
                },
              ],
            },
            {
              id: "advice_types",
              type: "checkbox-group",
              label: "Advice Types",
              helpText:
                "You cannot prepare a Suitability Letter that combines a Retirement Planning recommendation with other advice. Please do not select any combination of multiple Advice Types that include Retirement Planning. A Suitability Letter to include Retirement Planning can only inlcude that type of advice.",
              validators: [
                {
                  type: "required",
                  message: "Please select at least one advice type",
                },
              ],
              options: {
                source: "STATIC",
                options: [
                  { label: "Retirement Planning", value: "retirement" },
                  { label: "Investment Planning", value: "investment" },
                  {
                    label: "Inheritance Tax Planning",
                    value: "inheritance_tax",
                  },
                  { label: "Protection Planning", value: "protection" },
                  { label: "Mortgage Planning", value: "mortgage" },
                  {
                    label: "Equity Release Planning",
                    value: "equity_release",
                  },
                  {
                    label: "Long-Term Care Planning",
                    value: "long_term_care",
                  },
                ],
              },
              rules: [
                {
                  id: "advice_types_rule1",
                  when: { in: ["retirement", { var: "advice_types" }] },
                  then: {
                    type: "SET_OPTIONS",
                    target: "advice_types",
                    value: [
                      { label: "Retirement Planning", value: "retirement" },
                    ],
                  },
                },
                {
                  id: "advice_types_rule2",
                  when: {
                    in: ["long_term_care", { var: "advice_types" }],
                  },
                  then: {
                    type: "SET_OPTIONS",
                    target: "advice_types",
                    value: [
                      { label: "Investment Planning", value: "investment" },
                      {
                        label: "Long-Term Care Planning",
                        value: "long_term_care",
                      },
                    ],
                  },
                },
                {
                  id: "advice_types_rule3",
                  when: {
                    and: [
                      {
                        not: {
                          in: ["retirement", { var: "advice_types" }],
                        },
                      },
                      {
                        not: {
                          in: ["long_term_care", { var: "advice_types" }],
                        },
                      },
                    ],
                  },
                  then: {
                    type: "SET_OPTIONS",
                    target: "advice_types",
                    value: [
                      { label: "Retirement Planning", value: "retirement" },
                      { label: "Investment Planning", value: "investment" },
                      {
                        label: "Inheritance Tax Planning",
                        value: "inheritance_tax",
                      },
                      { label: "Protection Planning", value: "protection" },
                      { label: "Mortgage Planning", value: "mortgage" },
                      {
                        label: "Equity Release Planning",
                        value: "equity_release",
                      },
                      {
                        label: "Long-Term Care Planning",
                        value: "long_term_care",
                      },
                    ],
                  },
                },
              ],
            },
            {
              id: "advice_types_warning",
              type: "info",
              content:
                "This letter should be used when the recommendation being made is being used to fund care fees. If the recommendation is for growth then the normal investment letter should be used.",
              variant: "warning",
              visibilityRule: {
                in: ["long_term_care", { var: "advice_types" }],
              },
            },
            {
              id: "other_areas_identified_but_covered",
              type: "radio",
              label:
                "Are there other areas of advice identified but not covered at this time?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              defaultValue: "no",
              visibilityRule: {
                ">=": [{ count: { var: "advice_types" } }, 1],
              },
            },
            {
              id: "other_areas_made_aware_of",
              type: "checkbox-group",
              label: "What other areas of advice I made you aware of?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Retirement Planning", value: "retirement" },
                  { label: "Investment Planning", value: "investment" },
                  {
                    label: "Inheritance Tax Planning",
                    value: "inheritance_tax",
                  },
                  { label: "Protection Planning", value: "protection" },
                  { label: "Mortgage Planning", value: "mortgage" },
                  {
                    label: "Equity Release Planning",
                    value: "equity_release",
                  },
                  {
                    label: "Long-Term Care Planning",
                    value: "long_term_care",
                  },
                ],
              },
              rules: [
                {
                  id: "other_areas_made_aware_of_rule1",
                  when: {
                    in: ["retirement", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "retirement",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "retirement",
                  },
                },
                {
                  id: "other_areas_made_aware_of_rule2",
                  when: {
                    in: ["investment", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "investment",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "investment",
                  },
                },
                {
                  id: "other_areas_made_aware_of_rule3",
                  when: {
                    in: ["inheritance_tax", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "inheritance_tax",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "inheritance_tax",
                  },
                },
                {
                  id: "other_areas_made_aware_of_rule4",
                  when: {
                    in: ["protection", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "protection",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "protection",
                  },
                },
                {
                  id: "other_areas_made_aware_of_rule5",
                  when: {
                    in: ["mortgage", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "mortgage",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "mortgage",
                  },
                },
                {
                  id: "other_areas_made_aware_of_rule6",
                  when: {
                    in: ["equity_release", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "equity_release",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "equity_release",
                  },
                },
                {
                  id: "other_areas_made_aware_of_rule7",
                  when: {
                    in: ["long_term_care", { var: "advice_types" }],
                  },
                  then: {
                    type: "DISABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "long_term_care",
                  },
                  else: {
                    type: "ENABLE_OPTION",
                    target: "other_areas_made_aware_of",
                    optionValue: "long_term_care",
                  },
                },
              ],
              visibilityRule: {
                "==": [{ var: "other_areas_identified_but_covered" }, "yes"],
              },
              validators: [
                {
                  type: "required",
                  message: "Please select at least one other area of advice",
                },
              ],
            },
            {
              id: "reason_for_not_covering_other_areas",
              type: "select",
              label: "Reason for not covering other areas",
              visibilityRule: {
                ">=": [{ count: { var: "other_areas_made_aware_of" } }, 1],
              },
              options: {
                source: "STATIC",
                options: [
                  {
                    label: "We agreed to review this separately",
                    value: "agreed_to_review_separately",
                  },
                  {
                    label: "I'll contact you regarding this.",
                    value: "will_contact_you",
                  },
                  {
                    label: "This was not a priority for you at this time.",
                    value: "not_a_priority",
                  },
                ],
              },
            },
            {
              id: "extra_details_for_will_contact_you",
              type: "textarea",
              label:
                "Complete the Sentence: I'll contact you regarding this...",
              visibilityRule: {
                "==": [
                  { var: "reason_for_not_covering_other_areas" },
                  "will_contact_you",
                ],
              },
            },
            {
              id: "extra_details_for_not_a_priority",
              type: "textarea",
              label:
                "Complete the Sentence: This was not a priority for you at this time...",
              visibilityRule: {
                "==": [
                  { var: "reason_for_not_covering_other_areas" },
                  "not_a_priority",
                ],
              },
            },
            {
              id: "inheritance_tax_liability_amount",
              type: "number",
              label: "Enter value of tax liability (£)",
              defaultValue: 0,
              visibilityRule: {
                in: ["inheritance_tax", { var: "other_areas_made_aware_of" }],
              },
              validators: [
                {
                  type: "min",
                  value: 1,
                  message:
                    "Inheritance Tax Liability Amount must be greater than 1",
                },
              ],
            },
            {
              id: "extra_details_for_no_concern_regarding_potential_tax_liability",
              type: "textarea",
              label:
                "Complete the Sentence: There is a potential Inheritance Tax liability of £${inheritance_tax_liability_amount} but this was not a concern because...",
              visibilityRule: {
                in: ["inheritance_tax", { var: "other_areas_made_aware_of" }],
              },
              rules: [
                {
                  id: "inheritance_tax_liability_amount_rule",
                  when: {
                    ">=": [{ var: "inheritance_tax_liability_amount" }, 1],
                  },
                  then: {
                    type: "ENABLE",
                    target:
                      "extra_details_for_no_concern_regarding_potential_tax_liability",
                  },
                  else: {
                    type: "DISABLE",
                    target:
                      "extra_details_for_no_concern_regarding_potential_tax_liability",
                  },
                },
              ],
            },
            {
              id: "online_kiid_kid_provided",
              type: "radio",
              label: "Did you provide an online KIID or KID?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              defaultValue: "no",
              visibilityRule: {
                or: [
                  {
                    in: ["investment", { var: "advice_types" }],
                  },
                  {
                    in: ["inheritance_tax", { var: "advice_types" }],
                  },
                ],
              },
            },
            {
              id: "ran_income_sustainability_calculator",
              type: "radio",
              label:
                "Have you run an Income Sustainability Calculator or Proprietary Cashflow Analysis?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              visibilityRule: {
                in: ["investment", { var: "advice_types" }],
              },
              helpText:
                "Please see page 317 of the Advice Framework for the scenarios in which a cashflow analysis is required.",
              validators: [
                { type: "required", message: "Please select an option" },
              ],
            },
            {
              id: "income_sustainability_run_type",
              type: "select",
              label: "Which type has been run?",
              options: {
                source: "STATIC",
                options: [
                  {
                    label: "Income Sustainability Calculator",
                    value: "income_sustainability_calculator",
                  },
                  {
                    label: "Proprietary Cashflow Analysis",
                    value: "proprietary_cashflow_analysis",
                  },
                  { label: "Both", value: "both" },
                ],
              },
              visibilityRule: {
                "==": [{ var: "ran_income_sustainability_calculator" }, "yes"],
              },
            },
            {
              id: "mortgage_form_completed_with_client_presence",
              type: "radio",
              label:
                "Was the application form for the mortgage completed with the client present?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              visibilityRule: {
                in: ["mortgage", { var: "advice_types" }],
              },
              defaultValue: "no",
            },
            {
              id: "mortgage_fee_charged_to_client",
              type: "radio",
              label: "Have you charged the client a fee?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              visibilityRule: {
                in: ["mortgage", { var: "advice_types" }],
              },
              defaultValue: "no",
            },
            {
              id: "mortgage_fee_charged_to_client_amount",
              type: "number",
              label: "Enter value of fee charged to client (£)",
              defaultValue: 0,
              visibilityRule: {
                "==": [{ var: "mortgage_fee_charged_to_client" }, "yes"],
              },
            },
            {
              id: "mortgage_extra_reasoning",
              type: "textarea",
              label:
                "Complete the Sentence: As agreed, I have charged a fee of £${mortgage_fee_charged_to_client_amount}, this is in respect of...",
              visibilityRule: {
                "==": [{ var: "mortgage_fee_charged_to_client" }, "yes"],
              },
            },
          ],
        },
        {
          id: "further_client_details",
          label: "Further Client Details",
          rows: [
            {
              columns: 2,
              items: [
                {
                  fieldId: "power_of_attorney_present",
                  colSpan: 1,
                },
                {
                  fieldId: "advising_power_of_attorney",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "upto_date_will",
                  colSpan: 1,
                },
              ],
            },
            {
              columns: 1,
              items: [
                {
                  fieldId: "upto_date_will_alert",
                  colSpan: 1,
                },
              ],
            },
          ],
          fields: [
            {
              id: "power_of_attorney_present",
              type: "radio",
              label: "Is there a Power of Attorney in place?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              defaultValue: "no",
              visibilityRule: {
                in: ["long_term_care", { var: "advice_types" }],
              },
              validators: [
                { type: "required", message: "Please select an option" },
              ],
            },
            {
              id: "advising_power_of_attorney",
              type: "radio",
              label: "Are we giving advice to the Power of Attorney?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
              defaultValue: "no",
              visibilityRule: {
                "==": [{ var: "power_of_attorney_present" }, "yes"],
              },
            },
            {
              id: "upto_date_will",
              type: "radio",
              label: "Does the client have an up-to-date Will?",
              options: {
                source: "STATIC",
                options: [
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ],
              },
            },
            {
              id: "upto_date_will_alert",
              type: "info",
              content:
                "You do not have an up-to-date Will so I recommended you seek legal advice to review your Will arrangements.",
              variant: "warning",
              visibilityRule: {
                "==": [{ var: "upto_date_will" }, "no"],
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
    allowSkip: false,
    allowReset: true,
    allowSaveOnAll: true,
  },
  submission: {
    stripHiddenFields: true,
    stripDisabledFields: true,
  },
};
