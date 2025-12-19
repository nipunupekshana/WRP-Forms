import type { RJSFValidationError } from '@rjsf/utils'
import { workforceChecklistSchema } from './schema'

export const validateWorkforceField = (key: string, value: unknown): string[] => {
  // Lightweight field-level validation to power live errors without full AJV runs.
  const propertySchema = (workforceChecklistSchema.properties as Record<string, unknown> | undefined)?.[
    key
  ] as
    | {
        minLength?: number
        maxLength?: number
        pattern?: string
      }
    | undefined

  if (!propertySchema) return []

  const requiredList = workforceChecklistSchema.required ?? []
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

export const transformWorkforceErrors = (errors: RJSFValidationError[]) => {
  return errors.map((error) => {
    if (error.name === 'required') return { ...error, message: 'This field is required.' }
    return error
  })
}
