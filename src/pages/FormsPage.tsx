import { useMemo, useState } from 'react'
import Form from '@rjsf/shadcn'
import type { RJSFSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'

type SubHaulerFormData = {
  companyName?: string
  checksMadeOutTo?: string
  ownerName?: string
  homePhone?: string
  cellPhone?: string
  email?: string

  contractExpires?: string

  w9Provided?: boolean

  autoInsuranceExpires?: string
  workersCompExpires?: string
  annualTruckInspectionExpires?: string

  emergencyContactName?: string
  emergencyContactPhone?: string

  yardRenter?: boolean
  trucksCount?: number
  trailersCount?: number
  driversCount?: number

  nevadaSecretaryOfStateBusinessId?: string
  nevadaSecretaryOfStateBusinessIdExp?: string

  dotNumber?: string
  nevadaConsumerUseTaxPermit?: string

  driversLicenseNumber?: string
  driversLicenseStateIssued?: string

  socialSecurityLast4?: string

  copyOfTruckRegistration?: boolean
}

export default function FormsPage() {
  const schema: RJSFSchema = useMemo(
    () => ({
      title: 'Sub-Hauler Requirements',
      type: 'object',
      required: ['companyName', 'ownerName', 'email'],
      properties: {
        companyName: { type: 'string', title: 'Company Name', minLength: 2 },
        checksMadeOutTo: { type: 'string', title: 'Checks made out to' },
        ownerName: { type: 'string', title: 'Owner Name', minLength: 2 },
        homePhone: {
          type: 'string',
          title: 'Home Phone No.',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },
        cellPhone: {
          type: 'string',
          title: 'Cell Phone No.',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },
        email: { type: 'string', title: 'Email', format: 'email' },

        contractExpires: {
          type: 'string',
          title: 'Werdco BC Signed Contract Expires',
          format: 'date',
        },

        w9Provided: { type: 'boolean', title: 'W-9 Provided' },

        autoInsuranceExpires: {
          type: 'string',
          title: 'Auto Ins. Certificate Expires',
          format: 'date',
        },
        workersCompExpires: {
          type: 'string',
          title: 'Workers Comp Ins. Certificate Expires',
          format: 'date',
        },
        annualTruckInspectionExpires: {
          type: 'string',
          title: "Annual Truck Inspection Expires (if pulling Werdco's trailers)",
          format: 'date',
        },

        emergencyContactName: {
          type: 'string',
          title: 'Emergency contact name',
        },
        emergencyContactPhone: {
          type: 'string',
          title: 'Emergency contact phone',
          pattern: String.raw`^[0-9+()\-\s]{7,}$`,
        },

        yardRenter: { type: 'boolean', title: 'Yard Renter (YES/NO)' },
        trucksCount: { type: 'integer', title: '# of Trucks', minimum: 0 },
        trailersCount: { type: 'integer', title: '# of Trailers', minimum: 0 },
        driversCount: { type: 'integer', title: '# of Drivers', minimum: 0 },

        nevadaSecretaryOfStateBusinessId: {
          type: 'string',
          title: 'Nevada Secretary of State Business ID #',
        },
        nevadaSecretaryOfStateBusinessIdExp: {
          type: 'string',
          title: 'Nevada Secretary of State Business ID Exp',
          format: 'date',
        },

        dotNumber: { type: 'string', title: 'DOT #' },
        nevadaConsumerUseTaxPermit: {
          type: 'string',
          title: 'State Of Nevada Consumer Use Tax Permit',
        },

        driversLicenseNumber: {
          type: 'string',
          title: "Driver's License #",
        },
        driversLicenseStateIssued: {
          type: 'string',
          title: 'State issued',
          minLength: 2,
          maxLength: 2,
        },

        socialSecurityLast4: {
          type: 'string',
          title: 'Social Security # (Last 4 Digits)',
          pattern: String.raw`^\d{4}$`,
        },

        copyOfTruckRegistration: {
          type: 'boolean',
          title: 'Copy Of Truck Registration',
        },
      },
    }),
    [],
  )

  const [formData, setFormData] = useState<SubHaulerFormData>({})

  return (
    <section>
      <h1>Forms</h1>
      <p>Sub-Hauler Requirements form (RJSF + Shadcn theme).</p>

      <Form
        schema={schema}
        validator={validator}
        formData={formData}
        onChange={(event) => setFormData((event.formData ?? {}) as SubHaulerFormData)}
        onSubmit={(event) => {
          console.log('Submitted form data:', event.formData)
        }}
      />
    </section>
  )
}
