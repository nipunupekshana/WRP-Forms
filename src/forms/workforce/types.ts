export type WorkforceAnswerYesNo = 'yes' | 'no'
export type WorkforceAnswerYesNoNa = WorkforceAnswerYesNo | 'na'

export type WorkforceChecklistRow = {
  craft: string
  moreThan3Employees?: WorkforceAnswerYesNoNa
  anticipateWaivers?: WorkforceAnswerYesNo
}

export type WorkforceChecklistFormData = {
  contractNo?: string
  contractorName?: string
  signedNameTitle?: string
  signedDate?: string
  signature?: string
  responses?: WorkforceChecklistRow[]
}

export type WorkforceChecklistRjsfFormData = {
  [K in keyof WorkforceChecklistFormData]?: unknown
}
