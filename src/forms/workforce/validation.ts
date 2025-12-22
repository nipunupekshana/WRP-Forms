import type { RJSFValidationError } from '@rjsf/utils'

export const transformWorkforceErrors = (errors: RJSFValidationError[]) => {
  return errors.map((error) => {
    if (error.name === 'required') return { ...error, message: 'This field is required.' }
    return error
  })
}
