export type SubHaulerFormData = {
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

export type SubHaulerRjsfFormData = {
  [K in keyof SubHaulerFormData]?: unknown
}
