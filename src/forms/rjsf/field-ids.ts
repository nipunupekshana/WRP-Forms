import type { RJSFValidationError } from '@rjsf/utils'

export const idToFieldKey = (id: string): string | null => {
  if (!id) return null
  if (id === 'root') return null
  // RJSF uses `root_<field>` ids; normalize to the schema field key.
  if (id.startsWith('root_')) return id.slice('root_'.length)
  return id
}

export const errorToFieldKey = (error: RJSFValidationError): string | null => {
  if (error.name === 'required') {
    const missing = (error.params as { missingProperty?: string } | undefined)?.missingProperty
    return missing ?? null
  }

  const property = error.property
  if (!property) return null
  // RJSF error paths come in as `.fieldName` for top-level fields.
  return property.replace(/^\./, '')
}
