import { useMemo, useState } from 'react'
import Form from '@rjsf/core'
import type { RJSFSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'

type ExampleFormData = {
  fullName?: string
  email?: string
  agreeToTerms?: boolean
}

export default function FormsPage() {
  const schema: RJSFSchema = useMemo(
    () => ({
      title: 'Example Form',
      type: 'object',
      required: ['fullName', 'email'],
      properties: {
        fullName: { type: 'string', title: 'Full name', minLength: 2 },
        email: { type: 'string', title: 'Email', format: 'email' },
        agreeToTerms: { type: 'boolean', title: 'Agree to terms' },
      },
    }),
    [],
  )

  const [formData, setFormData] = useState<ExampleFormData>({
    fullName: '',
    email: '',
    agreeToTerms: false,
  })

  return (
    <section>
      <h1>Forms</h1>
      <p>A minimal page showing the existing RJSF dependencies.</p>

      <Form
        schema={schema}
        validator={validator}
        formData={formData}
        onChange={(event) => setFormData(event.formData ?? {})}
        onSubmit={(event) => {
          // eslint-disable-next-line no-console
          console.log('Submitted form data:', event.formData)
        }}
      />
    </section>
  )
}
