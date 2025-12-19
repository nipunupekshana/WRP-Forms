import type { RJSFSchema } from '@rjsf/utils'
import { CRAFT_TRADES } from './constants'

export const workforceChecklistSchema: RJSFSchema = {
  title: 'Project Workforce Checklist',
  description: 'For compliance with the Nevada Apprenticeship Utilization Act, 2019.',
  type: 'object',
  required: ['contactNo', 'contractorName', 'responses'],
  properties: {
    contactNo: {
      type: 'string',
      title: 'Contact No.',
      pattern: String.raw`^[0-9+()\-\s]{7,}$`,
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
  },
}
