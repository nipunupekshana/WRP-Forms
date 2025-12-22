import { Fragment, useCallback, useMemo } from 'react'
import { RadioGroup, RadioGroupItem } from '@rjsf/shadcn/lib/components/ui/radio-group.js'
import type { FieldProps, FormContextType, RJSFSchema } from '@rjsf/utils'
import { CRAFT_TRADES } from './constants'
import type {
  WorkforceAnswerYesNo,
  WorkforceAnswerYesNoNa,
  WorkforceChecklistRow,
  WorkforceChecklistRjsfFormData,
} from './types'

type WorkforceFormContext = FormContextType & {
  submitAttempted?: boolean
}

export function WorkforceResponsesTableField(
  props: Readonly<FieldProps<WorkforceChecklistRjsfFormData, RJSFSchema, WorkforceFormContext>>,
) {
  const { formData, onChange, disabled, readonly, fieldPathId, registry } = props
  const fieldPath = fieldPathId.path
  const fieldId = fieldPathId.$id

  const rows = useMemo<WorkforceChecklistRow[]>(
    () => (Array.isArray(formData) ? (formData as WorkforceChecklistRow[]) : []),
    [formData],
  )
  const normalizedRows = useMemo<WorkforceChecklistRow[]>(
    () =>
      CRAFT_TRADES.map((craft, idx) => ({
        ...rows[idx],
        craft,
      })),
    [rows],
  )

  const submitAttempted = Boolean(registry.formContext?.submitAttempted)
  const isDisabled = Boolean(disabled || readonly)

  const setRowValue = useCallback(
    <K extends keyof WorkforceChecklistRow>(
      rowIndex: number,
      key: K,
      value: WorkforceChecklistRow[K],
    ) => {
      // Update one row while keeping the array shape stable for RJSF.
      const next = normalizedRows.map((row, idx) => {
        if (idx !== rowIndex) return row
        return {
          ...row,
          [key]: value,
        }
      })
      onChange(next as WorkforceChecklistRjsfFormData, fieldPath, undefined, fieldId)
    },
    [fieldId, fieldPath, normalizedRows, onChange],
  )

  const groupBaseId = (rowIndex: number, key: keyof WorkforceChecklistRow) =>
    `workforce-responses-${rowIndex}-${String(key)}`

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-205 w-full border-collapse text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th scope="col" className="border-b px-3 py-2 text-left font-medium">
                Craft / Trade
              </th>
              <th scope="col" colSpan={3} className="border-b px-3 py-2 text-center font-medium">
                More than 3 Employees Anticipated?
              </th>
              <th scope="col" colSpan={2} className="border-b px-3 py-2 text-center font-medium">
                Anticipate Needing Waivers?
              </th>
            </tr>
            <tr className="bg-muted/40">
              <th scope="col" className="border-b px-3 py-2" />
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                Yes
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                No
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                N/A
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                Yes
              </th>
              <th scope="col" className="border-b px-3 py-2 text-center font-medium">
                No
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {CRAFT_TRADES.map((craft, idx) => {
              const row = normalizedRows[idx]
              const moreThan3Errors =
                submitAttempted && !row.moreThan3Employees ? ['This field is required.'] : []
              const waiverErrors =
                submitAttempted && !row.anticipateWaivers ? ['This field is required.'] : []

              return (
                <Fragment key={craft}>
                  <tr className="hover:bg-muted/30">
                    <th scope="row" className="max-w-130 px-3 py-2 text-left font-normal">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground">{idx + 1}.</span>
                        <span className="text-foreground">{craft}</span>
                      </div>
                    </th>

                    <td colSpan={3} className="px-3 py-2 align-middle">
                      <RadioGroup
                        value={row.moreThan3Employees ?? ''}
                        onValueChange={(value) =>
                          setRowValue(idx, 'moreThan3Employees', value as WorkforceAnswerYesNoNa)
                        }
                        disabled={isDisabled}
                        name={groupBaseId(idx, 'moreThan3Employees')}
                        aria-label={`More than 3 employees anticipated for ${craft}`}
                        aria-invalid={submitAttempted && moreThan3Errors.length ? true : undefined}
                        className="grid grid-cols-3 items-center justify-items-center gap-2"
                      >
                        {(['yes', 'no', 'na'] as const).map((option) => {
                          const id = `${groupBaseId(idx, 'moreThan3Employees')}-${option}`
                          return (
                            <RadioGroupItem
                              key={option}
                              id={id}
                              value={option}
                              className={
                                submitAttempted && moreThan3Errors.length
                                  ? 'ring-1 ring-destructive/40 ring-offset-2 ring-offset-background'
                                  : undefined
                              }
                            />
                          )
                        })}
                      </RadioGroup>
                    </td>

                    <td colSpan={2} className="px-3 py-2 align-middle">
                      <RadioGroup
                        value={row.anticipateWaivers ?? ''}
                        onValueChange={(value) =>
                          setRowValue(idx, 'anticipateWaivers', value as WorkforceAnswerYesNo)
                        }
                        disabled={isDisabled}
                        name={groupBaseId(idx, 'anticipateWaivers')}
                        aria-label={`Anticipate needing waivers for ${craft}`}
                        aria-invalid={submitAttempted && waiverErrors.length ? true : undefined}
                        className="grid grid-cols-2 items-center justify-items-center gap-2"
                      >
                        {(['yes', 'no'] as const).map((option) => {
                          const id = `${groupBaseId(idx, 'anticipateWaivers')}-${option}`
                          return (
                            <RadioGroupItem
                              key={option}
                              id={id}
                              value={option}
                              className={
                                submitAttempted && waiverErrors.length
                                  ? 'ring-1 ring-destructive/40 ring-offset-2 ring-offset-background'
                                  : undefined
                              }
                            />
                          )
                        })}
                      </RadioGroup>
                    </td>
                  </tr>

                  {submitAttempted && (moreThan3Errors.length || waiverErrors.length) ? (
                    <tr className="bg-destructive/5">
                      <td className="px-3 py-2" />
                      <td colSpan={3} className="px-3 py-2 text-center align-middle">
                        {moreThan3Errors.length ? (
                          <p className="mx-auto inline-block text-xs text-destructive" role="alert">
                            {moreThan3Errors[0]}
                          </p>
                        ) : null}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-center align-middle">
                        {waiverErrors.length ? (
                          <p className="mx-auto inline-block text-xs text-destructive" role="alert">
                            {waiverErrors[0]}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
