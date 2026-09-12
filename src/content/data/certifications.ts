export type Certification = {
  code: string
  name: string
  status: 'earned' | 'in progress'
  detail: string
  /** Credly badge URL, added once Sanskar sends it. */
  url?: string
}

export const CERTIFICATIONS: Certification[] = [
  {
    code: 'MB-310',
    name: 'Dynamics 365 Finance Functional Consultant Associate',
    status: 'earned',
    detail: 'Microsoft Certified. General ledger, payables, receivables, fixed assets, budgeting.',
  },
  {
    code: 'MB-500',
    name: 'Dynamics 365 Finance and Operations Apps Developer Associate',
    status: 'in progress',
    detail: 'Studying alongside hands-on X++ extension work.',
  },
]
