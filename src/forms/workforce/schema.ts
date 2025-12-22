import type { RJSFSchema } from '@rjsf/utils'
import { CRAFT_TRADES } from './constants'

export const workforceChecklistSchema: RJSFSchema = {
  title: 'Project Workforce Checklist',
  description: 'For compliance with the Nevada Apprenticeship Utilization Act, 2019.',
  type: 'object',
  required: ['contractNo', 'contractorName', 'responses', 'signature', 'signedDate', 'signedNameTitle'],
  properties: {
    contractNo: {
      type: 'string',
      title: 'Contract No.',
    },
    contractorName: {
      type: 'string',
      title: 'Contractor/Subcontractor',
      minLength: 2,
    },
    responses: {
      type: 'array',
      title: 'Workforce Checklist',
      minItems: CRAFT_TRADES.length,
      maxItems: CRAFT_TRADES.length,
      items: {
        type: 'object',
        required: ['moreThan3Employees', 'anticipateWaivers'],
        properties: {
          craft: { type: 'string', title: 'Craft / Trade' },
          moreThan3Employees: {
            type: 'string',
            title: 'More than 3 Employees Anticipated?',
            oneOf: [
              { const: 'yes', title: 'Yes' },
              { const: 'no', title: 'No' },
              { const: 'na', title: 'N/A' },
            ],
          },
          anticipateWaivers: {
            type: 'string',
            title: 'Anticipate Needing Waivers?',
            oneOf: [
              { const: 'yes', title: 'Yes' },
              { const: 'no', title: 'No' },
            ],
          },
        },
      },
    },
    signature: {
      type: 'string',
      title: 'Signed',
      description:
        'I affirm I am fully authorized to sign on behalf of the contractor/subcontractor listed above, and that the information provided is true and correct to the best of my knowledge. Additionally, I acknowledge any changes to the anticipated workforce, which may have an impact on compliance with the Nevada Apprenticeship Utilization Act, 2019, will require the submittal of a revised form within five (5) calendar days of the change.',
    },
    signedDate: {
      type: 'string',
      title: 'Date',
      format: 'date',
    },
    signedNameTitle: {
      type: 'string',
      title: 'Name and Title',
      minLength: 2,
    },
  },
}
