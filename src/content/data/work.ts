export type Lens = 'D365' | 'Engineering' | 'Cloud'

export type WorkCard = {
  slug: string
  index: string
  title: string
  outcome: string
  lens: Lens[]
  /** False until the dossier is written; the card says so rather than pretending. */
  written: boolean
}

export const WORK: WorkCard[] = [
  {
    slug: 'ai-document-platform',
    index: '01',
    title: 'AI document digitization platform',
    outcome: '26,000+ documents across five products',
    lens: ['Engineering', 'D365'],
    written: true,
  },
  {
    slug: 'billing-portal',
    index: '02',
    title: 'Rebuilding a billing and consumption portal',
    outcome: '13 defects found in the vendor code, including SQL injection',
    lens: ['Engineering'],
    written: true,
  },
  {
    slug: 'sql-always-on-azure',
    index: '03',
    title: 'SQL Server Always On, and a Kerberos failure',
    outcome: 'Root cause traced to an offline cluster resource group',
    lens: ['Cloud'],
    written: false,
  },
  {
    slug: 'retail-erp-deployment',
    index: '04',
    title: 'Deploying a retail ERP on a locked-down VPS',
    outcome: 'Shipped despite blocked outbound ports',
    lens: ['Cloud'],
    written: false,
  },
  {
    slug: 'gcp-to-azure-migration',
    index: '05',
    title: 'GCP to Azure migration and CI/CD',
    outcome: '60% faster deploys, 99.9% uptime',
    lens: ['Cloud'],
    written: false,
  },
  {
    slug: 'd365-fo-extensions',
    index: '06',
    title: 'Learning F&O development, and a Copilot rollout',
    outcome: 'Thirteen modules of extensions on my own time; Copilot enabled on a client environment',
    lens: ['D365'],
    written: false,
  },
]
