# WRP Forms POC

This is a small proof of concept that shows how to build form-driven screens with
React JSON Schema Form (RJSF) using the shadcn theme. The goal is to demonstrate
schema-first forms, custom fields, and validation behavior rather than a
production-ready app.

## What this demonstrates

- RJSF + shadcn integration using `@rjsf/shadcn`.
- A workforce checklist form built from JSON schema.
- A custom table field for row-based responses.
- Live, field-level validation with debounced feedback.
- Custom error handling and focus behavior for table rows.

## Key locations

- `src/pages/WorkforceChecklistPage.tsx` - RJSF setup, schema wiring, validation, and submit handling.
- `src/forms/subHauler/schema.ts` - JSON schema for the Sub-Hauler form.
- `src/forms/workforce/schema.ts` - JSON schema for the workforce checklist.
- `src/forms/workforce/WorkforceResponsesTableField.tsx` - custom table field UI.
- `src/forms/workforce/validation.ts` - custom validation and error transforms.
- `src/forms/rjsf/useLiveFieldValidation.ts` - reusable live validation hook.

## Running locally

```bash
pnpm install
pnpm dev
```

Then open the app and visit `/sub-hauler-form` or `/workforce-checklist`.

## Notes

- This is a POC to illustrate RJSF + shadcn usage patterns, not a finished product.
