import type { RJSFValidationError } from '@rjsf/utils'
import { subHaulerSchema } from './schema'

export const validateSubHaulerField = (key: string, value: unknown): string[] => {
  // Lightweight field-level validation to power live errors without full AJV runs.
  const propertySchema = (subHaulerSchema.properties as Record<string, unknown> | undefined)?.[
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

  const requiredList = subHaulerSchema.required ?? []
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
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
    if (!emailOk) messages.push('Enter a valid email address.')
  }

  if (propertySchema.format === 'date') {
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

export const transformSubHaulerErrors = (errors: RJSFValidationError[]) => {
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
