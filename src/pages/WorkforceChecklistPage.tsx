import { useCallback, useState } from 'react'
import { generateForm } from '@rjsf/shadcn'
import type { FormContextType, RJSFSchema, RJSFValidationError } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { idToFieldKey, errorToFieldKey } from '../forms/rjsf/field-ids'
import { useLiveFieldValidation } from '../forms/rjsf/useLiveFieldValidation'
import { CRAFT_TRADES } from '../forms/workforce/constants'
import { workforceChecklistSchema } from '../forms/workforce/schema'
import type {
  WorkforceChecklistFormData,
  WorkforceChecklistRow,
  WorkforceChecklistRjsfFormData,
} from '../forms/workforce/types'
import { WorkforceResponsesTableField } from '../forms/workforce/WorkforceResponsesTableField'
import {
  transformWorkforceErrors,
  validateWorkforceField,
} from '../forms/workforce/validation'

type WorkforceFormContext = FormContextType & {
  submitAttempted?: boolean
}

// Create the themed Form and validator once to avoid re-instantiating on each render.
const Form = generateForm<
  WorkforceChecklistRjsfFormData,
  RJSFSchema,
  WorkforceFormContext
>()
const rjsfValidator = customizeValidator<WorkforceChecklistRjsfFormData>()
const LIVE_VALIDATE_FIELDS = new Set(['contactNo', 'contractorName'])
const initialResponses: WorkforceChecklistRow[] = CRAFT_TRADES.map((craft) => ({ craft }))
const uiSchema = {
  'ui:options': { label: false },
  contractorName: {
    'ui:placeholder': 'e.g. ABC Construction LLC',
  },
  responses: {
    'ui:field': 'workforceResponsesTable',
  },
}

export default function WorkforceChecklistPage() {
  const [formData, setFormData] = useState<WorkforceChecklistFormData>({
    responses: initialResponses,
  })

  const [submitAttempted, setSubmitAttempted] = useState(false)

  const {
    extraErrors,
    cancelPendingValidation,
    markTouched,
    setActiveField,
    setFieldErrors,
    scheduleValidateField,
    validateFieldNow,
  } = useLiveFieldValidation<WorkforceChecklistRjsfFormData>({
    isSubmitted: submitAttempted,
    validateField: validateWorkforceField,
    isFieldEligible: (key) => LIVE_VALIDATE_FIELDS.has(key),
  })

  const focusOnError = useCallback((error: RJSFValidationError) => {
    const property = error.property?.replace(/^\./, '') ?? ''
    if (property.startsWith('responses')) {
      // Table errors point to `responses.<index>.<field>`; focus the first radio in that row.
      const match = new RegExp(/^responses\.(\d+)(?:\.(moreThan3Employees|anticipateWaivers))?$/).exec(property)
      const idx = match ? Number(match[1]) : Number.NaN
      const requiredField =
        (error.name === 'required'
          ? (error.params as { missingProperty?: string } | undefined)?.missingProperty
          : undefined) ?? undefined
      const field = (match?.[2] ?? requiredField) as
        | 'moreThan3Employees'
        | 'anticipateWaivers'
        | undefined

      if (Number.isFinite(idx) && field) {
        const el = document.getElementById(`workforce-responses-${idx}-${field}-yes`)
        if (el) {
          el.focus()
          el.scrollIntoView({ block: 'center' })
        }
      }
      return
    }

    const key = errorToFieldKey(error)
    if (!key) return

    setActiveField(key)
    markTouched(key)

    const el = document.getElementById(`root_${key}`)
    if (!el) return
    el.focus()
    el.scrollIntoView({ block: 'center' })
  }, [markTouched, setActiveField])

  const handleChange = useCallback(
    (event: { formData?: unknown }, id?: string) => {
      const nextData = (event.formData ?? {}) as WorkforceChecklistFormData
      setFormData(nextData)

      const key = idToFieldKey(id ?? '')
      if (!key) return
      if (!LIVE_VALIDATE_FIELDS.has(key)) return

      setActiveField(key)
      markTouched(key)

      scheduleValidateField(key, (nextData as Record<string, unknown>)[key])
    },
    [markTouched, scheduleValidateField, setActiveField],
  )

  const handleFocus = useCallback(
    (id: string) => {
      const key = idToFieldKey(id)
      if (!key) return
      if (!LIVE_VALIDATE_FIELDS.has(key)) return
      setActiveField(key)
      markTouched(key)
    },
    [markTouched, setActiveField],
  )

  const handleBlur = useCallback(
    (id: string) => {
      const key = idToFieldKey(id)
      setActiveField((current) => (current === key ? null : current))

      if (!key) return
      if (!LIVE_VALIDATE_FIELDS.has(key)) return

      markTouched(key)

      const currentValue = (formData as Record<string, unknown>)[key]
      validateFieldNow(key, currentValue)
    },
    [formData, markTouched, setActiveField, validateFieldNow],
  )

  const handleSubmit = useCallback(
    (event: { formData?: unknown }) => {
      cancelPendingValidation()
      setSubmitAttempted(true)
      setFieldErrors({})
      console.log('Submitted workforce checklist:', event.formData)
    },
    [cancelPendingValidation, setFieldErrors],
  )

  const handleError = useCallback(() => {
    cancelPendingValidation()
    setSubmitAttempted(true)
    setFieldErrors({})
  }, [cancelPendingValidation, setFieldErrors])

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{workforceChecklistSchema.title}</h1>
        <p className="text-sm text-muted-foreground">{workforceChecklistSchema.description}</p>
      </header>

      <Form
        schema={workforceChecklistSchema}
        uiSchema={uiSchema}
        validator={rjsfValidator}
        formData={formData}
        formContext={{ submitAttempted }}
        experimental_defaultFormStateBehavior={{ constAsDefaults: 'skipOneOf' }}
        noHtml5Validate
        showErrorList={false}
        liveValidate={submitAttempted ? 'onChange' : false}
        transformErrors={transformWorkforceErrors}
        extraErrors={extraErrors}
        focusOnFirstError={focusOnError}
        fields={{
          workforceResponsesTable: WorkforceResponsesTableField,
        }}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmit={handleSubmit}
        onError={handleError}
      />
    </section>
  )
}
