import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateForm } from '@rjsf/shadcn'
import { RadioGroup, RadioGroupItem } from '@rjsf/shadcn/lib/components/ui/radio-group.js'
import type {
  ErrorSchema,
  FieldErrors,
  FieldProps,
  FormContextType,
  RJSFSchema,
  RJSFValidationError,
} from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'

const CRAFT_TRADES = [
  'Air Balance Technician',
  'Alarm Installer (see also Electrician)',
  'Boilermaker',
  'Bricklayer (can also include tile setter, terrazzo workers and marble masons)',
  'Carpenter (can also include cement masons, floor coverer, millwright and pile driver (non-equipment), plasterers and terrazzo workers)',
  'Electrician (includes communication technician, line, neon sign and wireman; can also include alarm installer)',
  'Elevator Constructor',
  'Glazier (see also Painters and Allied Trades)',
  'Hod Carrier (see also Laborers) (includes brick-mason tender and plaster tender)',
  'Iron Worker (can also include fence erectors (steel/iron))',
  'Laborer (includes asbestos abatement, fence erector (non-steel/iron), flag person, highway striping and traffic barrier erector; can also include cement masons, hod carrier, brick mason tender and plaster tender)',
  'Lubrication and Service Engineer',
  'Mason (can also include cement mason, plasterer, tile setter, terrazzo workers and marble masons)',
  'Millwright (see also carpenter)',
  'Operating Engineer (can also include equipment greaser, piledriver, soils and material tester, steel fabricator/erector (without equipment), surveyor (non-licensed) and well driller)',
  'Painters and Allied Trades (can also include glaziers, floor coverers and tapers)',
  'Plumber/Pipefitter',
  'Refrigeration',
  'Roofer (not sheet metal)',
  'Sheet Metal Worker (can also include air balance technician)',
  'Sprinkler Fitter',
  'Truck Driver',
  'Well Driller (see also Operating Engineer)',
] as const

type WorkforceAnswerYesNo = 'yes' | 'no'
type WorkforceAnswerYesNoNa = WorkforceAnswerYesNo | 'na'

type WorkforceChecklistRow = {
  craft: string
  moreThan3Employees?: WorkforceAnswerYesNoNa
  anticipateWaivers?: WorkforceAnswerYesNo
}

type WorkforceChecklistFormData = {
  contactNo?: string
  contractorName?: string
  responses?: WorkforceChecklistRow[]
}

type WorkforceChecklistRjsfFormData = {
  [K in keyof WorkforceChecklistFormData]?: unknown
}

type WorkforceFormContext = FormContextType & {
  submitAttempted?: boolean
}

function WorkforceResponsesTableField(
  props: Readonly<FieldProps<WorkforceChecklistRjsfFormData, RJSFSchema, WorkforceFormContext>>,
) {
  const { formData, onChange, disabled, readonly, fieldPathId, registry } = props
  const fieldPath = fieldPathId.path
  const fieldId = fieldPathId.$id

  const rows = useMemo<WorkforceChecklistRow[]>(() => 
    Array.isArray(formData)
      ? (formData as unknown as WorkforceChecklistRow[])
      : [],
    [formData],
  )

  const submitAttempted = Boolean(registry.formContext?.submitAttempted)
  const isDisabled = Boolean(disabled || readonly)

  const setRowValue = useCallback(
    <K extends keyof WorkforceChecklistRow>(
      rowIndex: number,
      key: K,
      value: WorkforceChecklistRow[K],
    ) => {
      const next = rows.map((row, idx) => {
        if (idx !== rowIndex) return row
        return {
          ...row,
          [key]: value,
        }
      })
      onChange(next as WorkforceChecklistRjsfFormData, fieldPath, undefined, fieldId)
    },
    [fieldId, fieldPath, onChange, rows],
  )

  const groupBaseId = (rowIndex: number, key: keyof WorkforceChecklistRow) =>
    `workforce-responses-${rowIndex}-${String(key)}`

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-205 w-full border-collapse text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                Craft / Trade
              </th>
              <th scope="col" colSpan={3} className="border-b px-3 py-2 text-center font-medium">
                More than 3 Employees Anticipated?
              </th>
              <th scope="col" colSpan={2} className="border-b px-3 py-2 text-center font-medium">
                Anticipate Needing Waivers?
              </th>
            </tr>
            <tr className="bg-muted/40">
              <th scope="col" className="border-b px-3 py-2" />
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                Yes
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                No
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                N/A
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                Yes
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                No
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {CRAFT_TRADES.map((craft, idx) => {
              const row = rows[idx] ?? { craft }
              const moreThan3Errors =
                submitAttempted && !row.moreThan3Employees ? ['This field is required.'] : []
              const waiverErrors =
                submitAttempted && !row.anticipateWaivers ? ['This field is required.'] : []

              return (
                <Fragment key={craft}>
                  <tr className="hover:bg-muted/30">
                    <th scope="row" className="max-w-130 px-3 py-2 text-left font-normal">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground">{idx + 1}.</span>
                        <span className="text-foreground">{craft}</span>
                      </div>
                    </th>

                    <td colSpan={3} className="px-3 py-2 align-middle">
                      <RadioGroup
                        value={row.moreThan3Employees ?? ''}
                        onValueChange={(value) =>
                          setRowValue(idx, 'moreThan3Employees', value as WorkforceAnswerYesNoNa)
                        }
                        disabled={isDisabled}
                        name={groupBaseId(idx, 'moreThan3Employees')}
                        aria-label={`More than 3 employees anticipated for ${craft}`}
                        aria-invalid={submitAttempted && moreThan3Errors.length ? true : undefined}
                        className="grid grid-cols-3 items-center justify-items-center gap-2"
                      >
                        {(['yes', 'no', 'na'] as const).map((option) => {
                          const id = `${groupBaseId(idx, 'moreThan3Employees')}-${option}`
                          return (
                            <RadioGroupItem
                              key={option}
                              id={id}
                              value={option}
                              className={
                                submitAttempted && moreThan3Errors.length
                                  ? 'ring-1 ring-destructive/40 ring-offset-2 ring-offset-background'
                                  : undefined
                              }
                            />
                          )
                        })}
                      </RadioGroup>
                    </td>

                    <td colSpan={2} className="px-3 py-2 align-middle">
                      <RadioGroup
                        value={row.anticipateWaivers ?? ''}
                        onValueChange={(value) =>
                          setRowValue(idx, 'anticipateWaivers', value as WorkforceAnswerYesNo)
                        }
                        disabled={isDisabled}
                        name={groupBaseId(idx, 'anticipateWaivers')}
                        aria-label={`Anticipate needing waivers for ${craft}`}
                        aria-invalid={submitAttempted && waiverErrors.length ? true : undefined}
                        className="grid grid-cols-2 items-center justify-items-center gap-2"
                      >
                        {(['yes', 'no'] as const).map((option) => {
                          const id = `${groupBaseId(idx, 'anticipateWaivers')}-${option}`
                          return (
                            <RadioGroupItem
                              key={option}
                              id={id}
                              value={option}
                              className={
                                submitAttempted && waiverErrors.length
                                  ? 'ring-1 ring-destructive/40 ring-offset-2 ring-offset-background'
                                  : undefined
                              }
                            />
                          )
                        })}
                      </RadioGroup>
                    </td>
                  </tr>

                  {submitAttempted && (moreThan3Errors.length || waiverErrors.length) ? (
                    <tr className="bg-destructive/5">
                      <td className="px-3 py-2" />
                      <td colSpan={3} className="px-3 py-2 text-center align-middle">
                        {moreThan3Errors.length ? (
                          <p className="mx-auto inline-block text-xs text-destructive" role="alert">
                            {moreThan3Errors[0]}
                          </p>
                        ) : null}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-center align-middle">
                        {waiverErrors.length ? (
                          <p className="mx-auto inline-block text-xs text-destructive" role="alert">
                            {waiverErrors[0]}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function WorkforceChecklistPage() {
  const Form = useMemo(() => generateForm<WorkforceChecklistRjsfFormData, RJSFSchema, WorkforceFormContext>(), [])
  const rjsfValidator = useMemo(() => customizeValidator<WorkforceChecklistRjsfFormData>(), [])

  const schema: RJSFSchema = useMemo(
    () => ({
      title: 'Project Workforce Checklist',
      description: 'For compliance with the Nevada Apprenticeship Utilization Act, 2019.',
      type: 'object',
      required: ['contactNo', 'contractorName', 'responses'],
      properties: {
        contactNo: {
          type: 'string',
          title: 'Contact No.',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },
        contractorName: {
          type: 'string',
          title: 'Contractor/Subcontractor',
          minLength: 2,
        },
        responses: {
          type: 'array',
          title: 'Workforce Checklist',
          minItems: CRAFT_TRADES.length,
          maxItems: CRAFT_TRADES.length,
          items: {
            type: 'object',
            required: ['moreThan3Employees', 'anticipateWaivers'],
            properties: {
              craft: { type: 'string', title: 'Craft / Trade' },
              moreThan3Employees: {
                type: 'string',
                title: 'More than 3 Employees Anticipated?',
                oneOf: [
                  { const: 'yes', title: 'Yes' },
                  { const: 'no', title: 'No' },
                  { const: 'na', title: 'N/A' },
                ],
              },
              anticipateWaivers: {
                type: 'string',
                title: 'Anticipate Needing Waivers?',
                oneOf: [
                  { const: 'yes', title: 'Yes' },
                  { const: 'no', title: 'No' },
                ],
              },
            },
          },
        },
      },
    }),
    [],
  )

  const uiSchema = useMemo(
    () => ({
      'ui:options': { label: false },
      contractorName: {
        'ui:placeholder': 'e.g. ABC Construction LLC',
      },
      responses: {
        'ui:field': 'workforceResponsesTable',
      },
    }),
    [],
  )

  const initialResponses = useMemo<WorkforceChecklistRow[]>(
    () => CRAFT_TRADES.map((craft) => ({ craft })),
    [],
  )

  const [formData, setFormData] = useState<WorkforceChecklistFormData>({
    responses: initialResponses,
  })

  const [activeField, setActiveField] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const validateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestValidationRef = useRef<{ key: string; value: unknown } | null>(null)
  const VALIDATION_DEBOUNCE_MS = 200

  const cancelPendingValidation = useCallback(() => {
    if (validateDebounceRef.current) {
      clearTimeout(validateDebounceRef.current)
      validateDebounceRef.current = null
    }
    latestValidationRef.current = null
  }, [])

  useEffect(() => cancelPendingValidation, [cancelPendingValidation])

  const LIVE_VALIDATE_FIELDS = useMemo(() => new Set(['contactNo', 'contractorName']), [])

  const idToFieldKey = (id: string): string | null => {
    if (!id) return null
    if (id === 'root') return null
    if (id.startsWith('root_')) return id.slice('root_'.length)
    return id
  }

  const errorToFieldKey = (error: RJSFValidationError): string | null => {
    if (error.name === 'required') {
      const missing = (error.params as { missingProperty?: string } | undefined)?.missingProperty
      return missing ?? null
    }
    const property = error.property
    if (!property) return null
    return property.replace(/^\./, '')
  }

  const validateField = (key: string, value: unknown): string[] => {
    if (!LIVE_VALIDATE_FIELDS.has(key)) return []

    const propertySchema = (schema.properties as Record<string, unknown> | undefined)?.[key] as
      | {
          type?: string
          minLength?: number
          maxLength?: number
          pattern?: string
          format?: string
        }
      | undefined

    if (!propertySchema) return []

    const requiredList = schema.required ?? []
    const isRequired = requiredList.includes(key)

    const messages: string[] = []
    const isEmpty = value === undefined || value === null || value === ''

    if (isRequired && isEmpty) {
      messages.push('This field is required.')
      return messages
    }

    if (isEmpty) return messages

    const stringValue = String(value)

    if (typeof propertySchema.minLength === 'number' && stringValue.length < propertySchema.minLength) {
      messages.push(`Must be at least ${propertySchema.minLength} characters.`)
    }

    if (typeof propertySchema.maxLength === 'number' && stringValue.length > propertySchema.maxLength) {
      messages.push(`Must be at most ${propertySchema.maxLength} characters.`)
    }

    if (typeof propertySchema.pattern === 'string') {
      try {
        const re = new RegExp(propertySchema.pattern)
        if (!re.test(stringValue)) {
          messages.push('Enter a valid phone number.')
        }
      } catch {
        // ignore invalid regex patterns
      }
    }

    return messages
  }

  const scheduleValidateField = (key: string, value: unknown) => {
    if (submitAttempted) return
    if (!LIVE_VALIDATE_FIELDS.has(key)) return

    latestValidationRef.current = { key, value }

    if (validateDebounceRef.current) {
      clearTimeout(validateDebounceRef.current)
    }

    validateDebounceRef.current = setTimeout(() => {
      const latest = latestValidationRef.current
      if (!latest) return
      const messages = validateField(latest.key, latest.value)
      setFieldErrors((prev) => ({ ...prev, [latest.key]: messages }))
    }, VALIDATION_DEBOUNCE_MS)
  }

  const focusOnError = useCallback((error: RJSFValidationError) => {
    const property = error.property?.replace(/^\./, '') ?? ''
    if (property.startsWith('responses')) {
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
    setTouchedFields((prev) => new Set(prev).add(key))

    const el = document.getElementById(`root_${key}`)
    if (!el) return
    el.focus()
    el.scrollIntoView({ block: 'center' })
  }, [])

  const transformErrors = (errors: RJSFValidationError[]) => {
    return errors.map((error) => {
      if (error.name === 'required') return { ...error, message: 'This field is required.' }
      return error
    })
  }

  const extraErrors = useMemo<ErrorSchema<WorkforceChecklistRjsfFormData> | undefined>(() => {
    if (submitAttempted) return undefined

    const result: ErrorSchema<WorkforceChecklistRjsfFormData> = {}
    const resultByKey = result as unknown as Record<keyof WorkforceChecklistRjsfFormData, FieldErrors>

    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (!messages.length) continue
      if (key !== activeField && !touchedFields.has(key)) continue
      if (!LIVE_VALIDATE_FIELDS.has(key)) continue

      resultByKey[key as keyof WorkforceChecklistRjsfFormData] = { __errors: messages }
    }

    return Object.keys(result).length ? result : undefined
  }, [activeField, fieldErrors, submitAttempted, touchedFields, LIVE_VALIDATE_FIELDS])

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{schema.title}</h1>
        <p className="text-sm text-muted-foreground">{schema.description}</p>
      </header>

      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={rjsfValidator}
        formData={formData}
        formContext={{ submitAttempted }}
        experimental_defaultFormStateBehavior={{ constAsDefaults: 'skipOneOf' }}
        noHtml5Validate
        showErrorList={false}
        liveValidate={submitAttempted ? 'onChange' : false}
        transformErrors={transformErrors}
        extraErrors={extraErrors}
        focusOnFirstError={focusOnError}
        fields={{
          workforceResponsesTable: WorkforceResponsesTableField,
        }}
        onChange={(event, id) => {
          const nextData = (event.formData ?? {}) as WorkforceChecklistFormData
          setFormData(nextData)

          const key = idToFieldKey(id ?? '')
          if (!key) return
          if (!LIVE_VALIDATE_FIELDS.has(key)) return

          setActiveField(key)
          setTouchedFields((prev) => new Set(prev).add(key))

          scheduleValidateField(key, (nextData as Record<string, unknown>)[key])
        }}
        onFocus={(id) => {
          const key = idToFieldKey(id)
          if (!key) return
          if (!LIVE_VALIDATE_FIELDS.has(key)) return
          setActiveField(key)
          setTouchedFields((prev) => new Set(prev).add(key))
        }}
        onBlur={(id) => {
          const key = idToFieldKey(id)
          setActiveField((current) => (current === key ? null : current))

          if (!key) return
          if (!LIVE_VALIDATE_FIELDS.has(key)) return

          setTouchedFields((prev) => new Set(prev).add(key))

          const currentValue = (formData as Record<string, unknown>)[key]
          const messages = validateField(key, currentValue)
          setFieldErrors((prev) => ({ ...prev, [key]: messages }))
        }}
        onSubmit={(event) => {
          cancelPendingValidation()
          setSubmitAttempted(true)
          setFieldErrors({})
          console.log('Submitted workforce checklist:', event.formData)
        }}
        onError={() => {
          cancelPendingValidation()
          setSubmitAttempted(true)
          setFieldErrors({})
        }}
      />
    </section>
  )
}
