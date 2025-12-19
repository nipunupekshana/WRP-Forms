import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateForm } from '@rjsf/shadcn'
import type { ErrorSchema, FieldErrors, RJSFSchema, RJSFValidationError } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'

type SubHaulerFormData = {
  companyName?: string
  checksMadeOutTo?: string
  ownerName?: string
  homePhone?: string
  cellPhone?: string
  email?: string

  contractExpires?: string

  w9Provided?: boolean

  autoInsuranceExpires?: string
  workersCompExpires?: string
  annualTruckInspectionExpires?: string

  emergencyContactName?: string
  emergencyContactPhone?: string

  yardRenter?: boolean
  trucksCount?: number
  trailersCount?: number
  driversCount?: number

  nevadaSecretaryOfStateBusinessId?: string
  nevadaSecretaryOfStateBusinessIdExp?: string

  dotNumber?: string
  nevadaConsumerUseTaxPermit?: string

  driversLicenseNumber?: string
  driversLicenseStateIssued?: string

  socialSecurityLast4?: string

  copyOfTruckRegistration?: boolean
}

type SubHaulerRjsfFormData = {
  [K in keyof SubHaulerFormData]?: unknown
}

export default function FormsPage() {
  const Form = useMemo(() => generateForm<SubHaulerRjsfFormData>(), [])
  const rjsfValidator = useMemo(() => customizeValidator<SubHaulerRjsfFormData>(), [])

  const schema: RJSFSchema = useMemo(
    () => ({
      title: 'Sub-Hauler Requirements',
      description:
        'Please complete the following form to ensure compliance with Werdco BC requirements.',
      type: 'object',
      required: ['companyName', 'ownerName', 'email'],
      properties: {
        companyName: { type: 'string', title: 'Company Name', minLength: 2 },
        checksMadeOutTo: { type: 'string', title: 'Checks made out to' },
        ownerName: { type: 'string', title: 'Owner Name', minLength: 2 },
        homePhone: {
          type: 'string',
          title: 'Home Phone No.',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },
        cellPhone: {
          type: 'string',
          title: 'Cell Phone No.',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },
        email: { type: 'string', title: 'Email', format: 'email' },

        contractExpires: {
          type: 'string',
          title: 'Werdco BC Signed Contract Expires',
          format: 'date',
        },

        w9Provided: { type: 'boolean', title: 'W-9 Provided' },

        autoInsuranceExpires: {
          type: 'string',
          title: 'Auto Ins. Certificate Expires',
          format: 'date',
        },
        workersCompExpires: {
          type: 'string',
          title: 'Workers Comp Ins. Certificate Expires',
          format: 'date',
        },
        annualTruckInspectionExpires: {
          type: 'string',
          title: "Annual Truck Inspection Expires (if pulling Werdco's trailers)",
          format: 'date',
        },

        emergencyContactName: {
          type: 'string',
          title: 'Emergency contact name',
        },
        emergencyContactPhone: {
          type: 'string',
          title: 'Emergency contact phone',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },

        yardRenter: { type: 'boolean', title: 'Yard Renter (YES/NO)' },
        trucksCount: { type: 'integer', title: '# of Trucks', minimum: 0 },
        trailersCount: { type: 'integer', title: '# of Trailers', minimum: 0 },
        driversCount: { type: 'integer', title: '# of Drivers', minimum: 0 },

        nevadaSecretaryOfStateBusinessId: {
          type: 'string',
          title: 'Nevada Secretary of State Business ID #',
        },
        nevadaSecretaryOfStateBusinessIdExp: {
          type: 'string',
          title: 'Nevada Secretary of State Business ID Exp',
          format: 'date',
        },

        dotNumber: { type: 'string', title: 'DOT #' },
        nevadaConsumerUseTaxPermit: {
          type: 'string',
          title: 'State Of Nevada Consumer Use Tax Permit',
        },

        driversLicenseNumber: {
          type: 'string',
          title: "Driver's License #",
        },
        driversLicenseStateIssued: {
          type: 'string',
          title: 'State issued',
          minLength: 2,
          maxLength: 2,
        },

        socialSecurityLast4: {
          type: 'string',
          title: 'Social Security # (Last 4 Digits)',
          pattern: String.raw`^\d{4}$`,
        },

        copyOfTruckRegistration: {
          type: 'boolean',
          title: 'Copy Of Truck Registration',
        },
      },
    }),
    [],
  )

  const [formData, setFormData] = useState<SubHaulerFormData>({})

  const [activeField, setActiveField] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

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

  useEffect(() => {
    return () => {
      cancelPendingValidation()
    }
  }, [cancelPendingValidation])

  const idToFieldKey = (id: string): string | null => {
    if (!id) return null
    if (id === 'root') return null
    if (id.startsWith('root_')) return id.slice('root_'.length)
    return id
  }

  const errorToFieldKey = (error: RJSFValidationError): string | null => {
    if (error.name === 'required') {
      const missing = (error.params as { missingProperty?: string } | undefined)
        ?.missingProperty
      return missing ?? null
    }

    const property = error.property
    if (!property) return null
    return property.replace(/^\./, '')
  }

  const validateField = (key: string, value: unknown): string[] => {
    const propertySchema = (schema.properties as Record<string, unknown> | undefined)?.[
      key
    ] as
      | {
          type?: string
          minLength?: number
          maxLength?: number
          pattern?: string
          format?: string
          minimum?: number
        }
      | undefined

    if (!propertySchema) return []

    const requiredList = (schema.required) ?? []
    const isRequired = requiredList.includes(key)

    const messages: string[] = []

    const isEmpty = value === undefined || value === null || value === ''
    if (isRequired && isEmpty) {
      messages.push('This field is required.')
      return messages
    }

    if (isEmpty) return messages

    if (propertySchema.type === 'integer' || propertySchema.type === 'number') {
      const numericValue = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(numericValue)) {
        messages.push('Enter a valid number.')
        return messages
      }

      if (propertySchema.type === 'integer' && !Number.isInteger(numericValue)) {
        messages.push('Enter a whole number.')
        return messages
      }

      if (typeof propertySchema.minimum === 'number' && numericValue < propertySchema.minimum) {
        messages.push(`Must be ${propertySchema.minimum} or greater.`)
      }

      return messages
    }

    const stringValue = String(value)

    if (typeof propertySchema.minLength === 'number' && stringValue.length < propertySchema.minLength) {
      messages.push(`Must be at least ${propertySchema.minLength} characters.`)
    }

    if (typeof propertySchema.maxLength === 'number' && stringValue.length > propertySchema.maxLength) {
      messages.push(`Must be at most ${propertySchema.maxLength} characters.`)
    }

    if (propertySchema.format === 'email') {
      // Lightweight email check (AJV will still enforce on submit)
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
      if (!emailOk) messages.push('Enter a valid email address.')
    }

    if (propertySchema.format === 'date') {
      // Expect yyyy-mm-dd (AJV will still enforce on submit)
      const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
      if (!dateOk) {
        messages.push('Enter a valid date.')
      }
    }

    if (typeof propertySchema.pattern === 'string') {
      try {
        const re = new RegExp(propertySchema.pattern)
        if (!re.test(stringValue)) {
          if (key.endsWith('Phone')) {
            messages.push('Enter a valid phone number.')
          } else if (key === 'socialSecurityLast4') {
            messages.push('Enter the last 4 digits (e.g. 1234).')
          } else {
            messages.push('Enter a valid value.')
          }
        }
      } catch {
        // Ignore invalid regex patterns
      }
    }

    return messages
  }

  const scheduleValidateField = (key: string, value: unknown) => {
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

  const focusOnError = useCallback(
    (error: RJSFValidationError) => {
      const key = errorToFieldKey(error)
      if (!key) return

      setActiveField(key)
      setTouchedFields((prev) => {
        const next = new Set(prev)
        next.add(key)
        return next
      })

      const el = document.getElementById(`root_${key}`)
      if (!el) return
      el.focus()
      el.scrollIntoView({ block: 'center' })
    },
    [],
  )

  const transformErrors = (errors: RJSFValidationError[]) => {
    return errors.map((error) => {
      switch (error.name) {
        case 'required':
          return { ...error, message: 'This field is required.' }
        case 'format':
          if (error.params?.format === 'email') {
            return { ...error, message: 'Enter a valid email address.' }
          }
          if (error.params?.format === 'date') {
            return { ...error, message: 'Enter a valid date.' }
          }
          return { ...error, message: 'Enter a valid value.' }
        case 'minLength':
          return {
            ...error,
            message: `Must be at least ${error.params?.limit} characters.`,
          }
        case 'maxLength':
          return {
            ...error,
            message: `Must be at most ${error.params?.limit} characters.`,
          }
        case 'minimum':
          return {
            ...error,
            message: `Must be ${error.params?.limit} or greater.`,
          }
        case 'pattern': {
          if (error.property?.endsWith('Phone')) {
            return {
              ...error,
              message: 'Enter a valid phone number.',
            }
          }
          if (error.property?.endsWith('socialSecurityLast4')) {
            return {
              ...error,
              message: 'Enter the last 4 digits (e.g. 1234).',
            }
          }
          return { ...error, message: 'Enter a valid value.' }
        }
        default:
          return error
      }
    })
  }

  const extraErrors = useMemo<ErrorSchema<SubHaulerRjsfFormData> | undefined>(() => {
    const isSchemaFieldKey = (key: string): key is keyof SubHaulerRjsfFormData => {
      return Boolean((schema.properties as Record<string, unknown> | undefined)?.[key])
    }

    if (hasSubmitted) return undefined

    const result: ErrorSchema<SubHaulerRjsfFormData> = {}
    const resultByKey =
      result as unknown as Record<keyof SubHaulerRjsfFormData, FieldErrors>

    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (!messages.length) continue
      if (key !== activeField && !touchedFields.has(key)) continue

      if (!isSchemaFieldKey(key)) continue
      resultByKey[key] = {
        __errors: messages,
      }
    }

    return Object.keys(result).length ? result : undefined
  }, [activeField, fieldErrors, hasSubmitted, schema, touchedFields])

  return (
    <section>
      <Form
        schema={schema}
        validator={rjsfValidator}
        formData={formData}
        noHtml5Validate
        showErrorList={false}
        transformErrors={transformErrors}
        extraErrors={extraErrors}
        focusOnFirstError={focusOnError}
        onChange={(event, id) => {
          const nextData = (event.formData ?? {}) as SubHaulerFormData
          setFormData(nextData)
          setHasSubmitted(false)

          const key = idToFieldKey(id ?? '')
          if (!key) return

          setActiveField(key)
          setTouchedFields((prev) => {
            const next = new Set(prev)
            next.add(key)
            return next
          })

          scheduleValidateField(key, (nextData as Record<string, unknown>)[key])
        }}
        onFocus={(id) => {
          const key = idToFieldKey(id)
          setActiveField(key)
          if (!key) return
          setTouchedFields((prev) => {
            const next = new Set(prev)
            next.add(key)
            return next
          })
        }}
        onBlur={(id) => {
          const key = idToFieldKey(id)
          setActiveField((current) => (current === key ? null : current))

          if (!key) return
          setTouchedFields((prev) => {
            const next = new Set(prev)
            next.add(key)
            return next
          })

          const currentValue = (formData as Record<string, unknown>)[key]
          const messages = validateField(key, currentValue)
          setFieldErrors((prev) => ({ ...prev, [key]: messages }))
        }}
        onSubmit={(event) => {
          cancelPendingValidation()
          setHasSubmitted(true)
          setFieldErrors({})
          console.log('Submitted form data:', event.formData)
        }}
        onError={() => {
          // Prevent duplicate error messages: RJSF will show AJV errors on submit failure.
          // Our per-field extraErrors are only for while-typing feedback.
          cancelPendingValidation()
          setHasSubmitted(true)
          setFieldErrors({})
        }}
      />
    </section>
  )
}
