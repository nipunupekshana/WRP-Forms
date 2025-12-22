import type { RJSFValidationError } from '@rjsf/utils'

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
