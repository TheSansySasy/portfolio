export type Metric = {
  value: string
  label: string
  note: string
}

/** Only figures that already appear on the public resumes (PLAN.md decision 3). */
export const NUMBERS: Metric[] = [
  {
    value: '26,000+',
    label: 'documents processed',
    note: 'Across five products in 2026, production and UAT',
  },
  {
    value: '5',
    label: 'products in production',
    note: 'Each with its own client connector and delivery path',
  },
  {
    value: '99.9%',
    label: 'uptime held',
    note: 'Across the environments I automated at Runtime Solutions',
  },
  {
    value: '60%',
    label: 'faster deployments',
    note: 'After moving deploys to GitHub Actions pipelines',
  },
  {
    value: '80%',
    label: 'less downtime',
    note: 'From PM2 autostart and documented restart procedures',
  },
  {
    value: '13',
    label: 'defects found in vendor code',
    note: 'Including SQL injection and middleware that was never wired up',
  },
  {
    value: '13',
    label: 'F&O modules built',
    note: 'Table and form extensions, chain of command, data entities',
  },
  {
    value: '2',
    label: 'node SQL Server cluster',
    note: 'Always On availability group on Windows failover clustering',
  },
]
