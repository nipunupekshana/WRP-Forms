export type WorkforceAnswerYesNo = 'yes' | 'no'
export type WorkforceAnswerYesNoNa = WorkforceAnswerYesNo | 'na'

export type WorkforceChecklistRow = {
  craft: string
  moreThan3Employees?: WorkforceAnswerYesNoNa
  anticipateWaivers?: WorkforceAnswerYesNo
}

export type WorkforceChecklistFormData = {
  contactNo?: string
  contractorName?: string
  responses?: WorkforceChecklistRow[]
}

export type WorkforceChecklistRjsfFormData = {
  [K in keyof WorkforceChecklistFormData]?: unknown
}
