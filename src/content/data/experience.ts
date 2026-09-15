export type Role = {
  employer: string
  title: string
  period: string
  note?: string
  current?: boolean
  bullets: string[]
  tags: string[]
}

/**
 * First person, specific, drawn from the two resumes. Employers are named;
 * clients never are (PLAN.md decision 3).
 */
export const EXPERIENCE: Role[] = [
  {
    employer: 'EBT',
    title: 'Software Engineer (Python) & Technical Consultant',
    period: 'March 2026 — present',
    note: 'Remote',
    current: true,
    bullets: [
      'I built and operate an AI document platform in Python and FastAPI. It ingests documents from SharePoint, extracts structured data with Gemini Flash, and delivers the results into Dynamics 365 Business Central and SFTP endpoints for corporate clients. More than 26,000 documents have gone through it across five products this year.',
      'I wrote the per-client Business Central connectors, cloud OAuth2 and on-premises NTLM, and I persist per-document status, pages, rows and token usage to MySQL so that billing has something solid underneath it.',
      'I rebuilt the billing and consumption portal from scratch after auditing a vendor codebase and documenting thirteen defects, including SQL injection and middleware that was never wired up. It now does slab-based historical pricing, end-of-month invoice locking, admin and client roles, margin reporting and CSV export.',
      'I administer a two-node SQL Server Always On cluster on Azure. I traced a production Kerberos failure to a cluster resource group that had been left offline, then designed disk-threshold alerting and CPU-triggered failover.',
      'I deployed a retail ERP, point of sale plus warehouse management, on Ubuntu with PostgreSQL, Redis, Nginx and systemd, working around blocked outbound ports by moving SSH onto 443.',
    ],
    tags: ['Python', 'FastAPI', 'MySQL', 'Business Central', 'Azure', 'SQL Server', 'Gemini', 'Claude API'],
  },
  {
    employer: 'Runtime Solutions',
    title: 'DevOps Engineer',
    period: 'July 2025 — February 2026',
    bullets: [
      'I designed and ran Azure infrastructure across five database environments, and migrated workloads off GCP: SQL to Azure Managed SQL, MongoDB to Cosmos DB.',
      'I automated deployment pipelines with GitHub Actions, which cut deployment time by 60 percent and held 99.9 percent uptime.',
      'I configured Node and Next.js servers with PM2 autostart and restart procedures, cutting downtime by 80 percent, and wrote the documentation the team needed to maintain it.',
    ],
    tags: ['Azure', 'GitHub Actions', 'Cosmos DB', 'PM2', 'CI/CD'],
  },
  {
    employer: 'Tectura',
    title: 'Trainee, D365 Finance & Operations Consultant',
    period: 'September 2024 — May 2025',
    bullets: [
      'I completed the functional training programme, which covered how Dynamics 365 Finance and Operations works from the finance side, and earned Microsoft MB-310.',
      'The technical side I picked up afterwards on my own: X++ in a development VM, Git and Azure DevOps across project branches, and MB-500 to sit next.',
    ],
    tags: ['D365 F&O (functional)', 'MB-310', 'X++ (self-study)', 'Azure DevOps'],
  },
  {
    employer: 'EasyGov',
    title: 'Web Developer Intern',
    period: 'June — August 2023',
    bullets: [
      'I maintained applications and improved legacy websites in the product deployment and delivery team.',
    ],
    tags: ['JavaScript', 'Maintenance'],
  },
]

export const EDUCATION = {
  school: 'Jaypee University of Information Technology',
  degree: 'B.Tech, Computer Science & Engineering',
  period: 'September 2020 — June 2024',
  note: 'Specialisation in cloud computing. Core team member of the ACM student chapter.',
}
