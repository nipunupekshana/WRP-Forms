import { useCallback, useState } from 'react'
import { generateForm } from '@rjsf/shadcn'
import type { FormContextType, RJSFSchema, RJSFValidationError } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { errorToFieldKey } from '../forms/rjsf/field-ids'
import SignatureField from '../forms/rjsf/SignatureField'
// import { CRAFT_TRADES } from '../forms/workforce/constants'
import { workforceChecklistSchema } from '../forms/workforce/schema'
import type {
  // WorkforceChecklistFormData,
  // WorkforceChecklistRow,
  WorkforceChecklistRjsfFormData,
} from '../forms/workforce/types'
import { WorkforceResponsesTableField } from '../forms/workforce/WorkforceResponsesTableField'
import { transformWorkforceErrors } from '../forms/workforce/validation'

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
// const initialResponses: WorkforceChecklistRow[] = CRAFT_TRADES.map((craft) => ({ craft }))
const uiSchema = {
  'ui:options': { label: false },
  contractorName: {
    'ui:placeholder': 'e.g. ABC Construction LLC',
  },
  signedNameTitle: {
    'ui:placeholder': 'e.g. Jane Smith, Project Manager',
  },
  responses: {
    'ui:field': 'workforceResponsesTable',
  },
  signature: {
    'ui:field': 'signatureField',
  },
}

export default function WorkforceChecklistPage() {
  // const [formData, setFormData] = useState<WorkforceChecklistFormData>({
  //   responses: initialResponses,
  // })

  const [submitAttempted, setSubmitAttempted] = useState(false)

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

    const el = document.getElementById(`root_${key}`)
    if (!el) return
    el.focus()
    el.scrollIntoView({ block: 'center' })
  }, [])

  // const handleChange = useCallback(
  //   (event: { formData?: unknown }) => {
  //     const nextData = (event.formData ?? {}) as WorkforceChecklistFormData
  //     setFormData(nextData)
  //   },
  //   [],
  // )

  const handleSubmit = useCallback(
    (event: { formData?: unknown }) => {
      setSubmitAttempted(true)
      console.log('Submitted workforce checklist:', event.formData)
    },
    [],
  )

  const handleError = useCallback(() => {
    setSubmitAttempted(true)
  }, [])

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
        // formData={formData}
        formContext={{ submitAttempted }}
        experimental_defaultFormStateBehavior={{ constAsDefaults: 'skipOneOf' }}
        noHtml5Validate
        showErrorList={false}
        transformErrors={transformWorkforceErrors}
        focusOnFirstError={focusOnError}
        fields={{
          workforceResponsesTable: WorkforceResponsesTableField,
          signatureField: SignatureField,
        }}
        // onChange={handleChange}
        onSubmit={handleSubmit}
        onError={handleError}
      />
    </section>
  )
}
