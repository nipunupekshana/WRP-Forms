import { useCallback, useState } from 'react'
import { generateForm } from '@rjsf/shadcn'
import type { RJSFValidationError } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { idToFieldKey, errorToFieldKey } from '../forms/rjsf/field-ids'
import { useLiveFieldValidation } from '../forms/rjsf/useLiveFieldValidation'
import { subHaulerSchema } from '../forms/subHauler/schema'
import type { SubHaulerFormData, SubHaulerRjsfFormData } from '../forms/subHauler/types'
import {
  transformSubHaulerErrors,
  validateSubHaulerField,
} from '../forms/subHauler/validation'

// Create the themed Form and validator once to avoid re-instantiating on each render.
const Form = generateForm<SubHaulerRjsfFormData>()
const rjsfValidator = customizeValidator<SubHaulerRjsfFormData>()

export default function FormsPage() {

  const [formData, setFormData] = useState<SubHaulerFormData>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const {
    extraErrors,
    cancelPendingValidation,
    markTouched,
    setActiveField,
    setFieldErrors,
    scheduleValidateField,
    validateFieldNow,
  } = useLiveFieldValidation<SubHaulerRjsfFormData>({
    isSubmitted: hasSubmitted,
    validateField: validateSubHaulerField,
  })

  const focusOnError = useCallback(
    (error: RJSFValidationError) => {
      const key = errorToFieldKey(error)
      if (!key) return

      setActiveField(key)
      markTouched(key)

      // Align focus to the errored field so the user sees the issue.
      const el = document.getElementById(`root_${key}`)
      if (!el) return
      el.focus()
      el.scrollIntoView({ block: 'center' })
    },
    [markTouched, setActiveField],
  )

  const handleChange = useCallback(
    (event: { formData?: unknown }, id?: string) => {
      const nextData = (event.formData ?? {}) as SubHaulerFormData
      setFormData(nextData)
      setHasSubmitted(false)

      const key = idToFieldKey(id ?? '')
      if (!key) return

      setActiveField(key)
      markTouched(key)

      scheduleValidateField(key, (nextData as Record<string, unknown>)[key])
    },
    [markTouched, scheduleValidateField, setActiveField],
  )

  const handleFocus = useCallback(
    (id: string) => {
      const key = idToFieldKey(id)
      setActiveField(key)
      if (!key) return
      markTouched(key)
    },
    [markTouched, setActiveField],
  )

  const handleBlur = useCallback(
    (id: string) => {
      const key = idToFieldKey(id)
      setActiveField((current) => (current === key ? null : current))

      if (!key) return
      markTouched(key)

      const currentValue = (formData as Record<string, unknown>)[key]
      validateFieldNow(key, currentValue)
    },
    [formData, markTouched, setActiveField, validateFieldNow],
  )

  const handleSubmit = useCallback(
    (event: { formData?: unknown }) => {
      cancelPendingValidation()
      setHasSubmitted(true)
      setFieldErrors({})
      console.log('Submitted form data:', event.formData)
    },
    [cancelPendingValidation, setFieldErrors],
  )

  const handleError = useCallback(() => {
    // Prevent duplicate error messages: RJSF will show AJV errors on submit failure.
    // Our per-field extraErrors are only for while-typing feedback.
    cancelPendingValidation()
    setHasSubmitted(true)
    setFieldErrors({})
  }, [cancelPendingValidation, setFieldErrors])

  return (
    <section>
      <Form
        schema={subHaulerSchema}
        validator={rjsfValidator}
        formData={formData}
        noHtml5Validate
        showErrorList={false}
        transformErrors={transformSubHaulerErrors}
        extraErrors={extraErrors}
        focusOnFirstError={focusOnError}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmit={handleSubmit}
        onError={handleError}
      />
    </section>
  )
}
