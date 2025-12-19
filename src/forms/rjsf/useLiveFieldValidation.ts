import { useCallback, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { ErrorSchema, FieldErrors } from '@rjsf/utils'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback'

type LiveFieldValidationOptions = {
  isSubmitted: boolean
  validateField: (key: string, value: unknown) => string[]
  isFieldEligible?: (key: string) => boolean
  isSchemaFieldKey?: (key: string) => boolean
  debounceMs?: number
  skipWhenSubmitted?: boolean
}

type LiveFieldValidationResult<T> = {
  activeField: string | null
  extraErrors: ErrorSchema<T> | undefined
  setActiveField: Dispatch<SetStateAction<string | null>>
  markTouched: (key: string) => void
  setFieldErrors: (value: Record<string, string[]>) => void
  scheduleValidateField: (key: string, value: unknown) => void
  validateFieldNow: (key: string, value: unknown) => void
  cancelPendingValidation: () => void
}

export const useLiveFieldValidation = <T = unknown>(
  options: LiveFieldValidationOptions,
): LiveFieldValidationResult<T> => {
  const {
    isSubmitted,
    validateField,
    isFieldEligible = () => true,
    isSchemaFieldKey = () => true,
    debounceMs = 200,
    skipWhenSubmitted = true,
  } = options

  const [activeField, setActiveField] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const { schedule: scheduleDebouncedValidation, cancel: cancelPendingValidation } =
    useDebouncedCallback(
      (key: string, value: unknown) => {
        const messages = validateField(key, value)
        setFieldErrors((prev) => ({ ...prev, [key]: messages }))
      },
      debounceMs,
    )

  const markTouched = useCallback((key: string) => {
    setTouchedFields((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const scheduleValidateField = useCallback(
    (key: string, value: unknown) => {
      if (skipWhenSubmitted && isSubmitted) return
      if (!isFieldEligible(key)) return

      // Debounce per-field validation to avoid noisy keystroke validation.
      scheduleDebouncedValidation(key, value)
    },
    [isFieldEligible, isSubmitted, scheduleDebouncedValidation, skipWhenSubmitted],
  )

  const validateFieldNow = useCallback(
    (key: string, value: unknown) => {
      if (skipWhenSubmitted && isSubmitted) return
      if (!isFieldEligible(key)) return

      const messages = validateField(key, value)
      setFieldErrors((prev) => ({ ...prev, [key]: messages }))
    },
    [isFieldEligible, isSubmitted, skipWhenSubmitted, validateField],
  )

  const extraErrors = useMemo<ErrorSchema<T> | undefined>(() => {
    if (isSubmitted) return undefined

    const result: ErrorSchema<T> = {}
    const resultByKey = result as unknown as Record<string, FieldErrors>

    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (!messages.length) continue
      if (!isFieldEligible(key)) continue
      // Only show "live" errors for the active or already-touched fields.
      if (key !== activeField && !touchedFields.has(key)) continue
      if (!isSchemaFieldKey(key)) continue

      resultByKey[key] = {
        __errors: messages,
      }
    }

    return Object.keys(result).length ? result : undefined
  }, [activeField, fieldErrors, isFieldEligible, isSchemaFieldKey, isSubmitted, touchedFields])

  return {
    activeField,
    extraErrors,
    setActiveField,
    markTouched,
    setFieldErrors,
    scheduleValidateField,
    validateFieldNow,
    cancelPendingValidation,
  }
}
