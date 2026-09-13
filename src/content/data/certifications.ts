export type Certification = {
  code: string
  name: string
  status: 'earned' | 'in progress'
  detail: string
  /** Microsoft Learn credential share link, for the ones already earned. */
  url?: string
}

export const CERTIFICATIONS: Certification[] = [
  {
    code: 'MB-310',
    name: 'Dynamics 365 Finance Functional Consultant Associate',
    status: 'earned',
    detail: 'Microsoft Certified. General ledger, payables, receivables, fixed assets, budgeting.',
    url: 'https://learn.microsoft.com/api/credentials/share/en-us/SansySasy/13FD34AB8F098579?sharingId=9C4D67301DF784',
  },
  {
    code: 'MB-500',
    name: 'Dynamics 365 Finance and Operations Apps Developer Associate',
    status: 'in progress',
    detail:
      'Targeting November 2026, studying alongside hands-on X++ extension work: chain of command, event handlers, data entities and set-based operations.',
  },
]
