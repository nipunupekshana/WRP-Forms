import { useCallback } from 'react'
import { generateForm } from '@rjsf/shadcn'
import type { RJSFValidationError } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { errorToFieldKey } from '../forms/rjsf/field-ids'
import { subHaulerSchema } from '../forms/subHauler/schema'
import type { 
  // SubHaulerFormData,
   SubHaulerRjsfFormData } from '../forms/subHauler/types'
import { transformSubHaulerErrors } from '../forms/subHauler/validation'

// Create the themed Form and validator once to avoid re-instantiating on each render.
const Form = generateForm<SubHaulerRjsfFormData>()
const rjsfValidator = customizeValidator<SubHaulerRjsfFormData>()

export default function FormsPage() {
  // const [formData, setFormData] = useState<SubHaulerFormData>({})

  const focusOnError = useCallback(
    (error: RJSFValidationError) => {
      const key = errorToFieldKey(error)
      if (!key) return

      // Align focus to the errored field so the user sees the issue.
      const el = document.getElementById(`root_${key}`)
      if (!el) return
      el.focus()
      el.scrollIntoView({ block: 'center' })
    },
    [],
  )

  // const handleChange = useCallback(
  //   (event: { formData?: unknown }) => {
  //     const nextData = (event.formData ?? {}) as SubHaulerFormData
  //     setFormData(nextData)
  //   },
  //   [],
  // )

  const handleSubmit = useCallback(
    (event: { formData?: unknown }) => {
      console.log('Submitted form data:', event.formData)
    },
    [],
  )

  return (
    <section>
      <Form
        schema={subHaulerSchema}
        validator={rjsfValidator}
        // formData={formData}
        noHtml5Validate
        showErrorList={false}
        transformErrors={transformSubHaulerErrors}
        focusOnFirstError={focusOnError}
        // onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
