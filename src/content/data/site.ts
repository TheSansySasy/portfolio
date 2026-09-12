/** Shared content that the page, the nav and the styleguide all read. */

export const SITE = {
  name: 'Sanskar Rai',
  handle: 'SansySasy',
  domain: 'sansysasy.com',
  url: 'https://sansysasy.com',
  role: 'D365 F&O consultant, Python engineer, Azure and operations',
  location: 'Delhi, India',
  timezone: 'UTC+5:30',
  github: 'https://github.com/TheSansySasy',
  repo: 'https://github.com/TheSansySasy/portfolio',
  /** Public on the resumes already. Replaced by hello@sansysasy.com at launch. */
  email: 'sanskarrai@hotmail.com',
  // Added once Sanskar sends the links.
  linkedin: null as string | null,
  credly: null as string | null,
} as const

export const RESUMES = [
  {
    track: 'D365 track',
    detail: 'Dynamics 365 F&O, X++, environment administration',
    file: '/resume/SanskarRai-D365-2026.pdf',
  },
  {
    track: 'Python track',
    detail: 'Python backend, AI pipelines, Azure and DevOps',
    file: '/resume/SanskarRai-Python-2026.pdf',
  },
] as const

export const ROLES = ['D365 F&O Consultant', 'Python Engineer', 'Azure & DevOps'] as const

/** Headline candidates. The first is live; the rest stay for reference. */
export const HEADLINES = [
  'I build and run the systems behind the ERP.',
  'Dynamics 365 on top. Python and Azure underneath.',
  'I make ERPs talk to AI, and keep the servers up.',
  'From X++ to FastAPI to failover.',
  'ERP consultant who also runs the servers.',
] as const

export const HEADLINE = HEADLINES[0]

export const SUBHEAD =
  'Dynamics 365 on top, Python pipelines in the middle, Azure and SQL Server underneath. Two years of building both halves and keeping them running.'

export const ABOUT: string[] = [
  'I studied computer science at Jaypee University with a cloud specialisation, then went straight into Dynamics 365. Tectura trained me on Finance and Operations, I earned MB-310, and I started writing X++ in a development VM.',
  'At Runtime Solutions I moved from consulting into infrastructure: Azure environments, a migration off GCP, and deployment pipelines that cut release time by more than half.',
  'Now at EBT I do both halves. I build the AI document platform in Python, wire it into Business Central, and keep the SQL Server cluster underneath it alive. The parts I like most are where the ERP meets the infrastructure: a Kerberos error that turns out to be an offline cluster resource, a billing engine that has to price history correctly, a vendor codebase that needs auditing before anyone can trust it.',
  'SansySasy was my gamer tag. It stuck, so it is my handle everywhere now.',
]

export const OPS = {
  story: [
    'A production login started failing with a Kerberos error, KRB_AP_ERR_MODIFIED. The obvious suspects are a duplicate service principal name or a stale machine account password, and neither was the problem.',
    'The cluster had a Cluster-Aware Updating resource group sitting offline. Bringing it back and correcting the account state fixed authentication, and the availability group stayed healthy throughout.',
    'Afterwards I designed the alerting I wished had existed: disk thresholds that warn before a volume fills, and CPU-triggered failover so the listener moves before the primary node becomes unusable.',
  ],
  facts: [
    { label: 'Topology', value: 'Two-node Always On availability group on Windows failover clustering' },
    { label: 'Platform', value: 'Azure virtual machines, Windows Server, Azure SQL alongside' },
    { label: 'Monitoring', value: 'Grafana, Prometheus and Zabbix, with disk and CPU alerting' },
    { label: 'Recovery', value: 'Designed failover paths, documented runbooks, tested restores' },
  ],
} as const

export const CONTACT = {
  availability: 'Open to consulting engagements and engineering roles, remote from Delhi.',
  responseNote: 'I read everything that arrives and reply to anything specific.',
} as const

export type SectionMeta = {
  id: string
  index: string
  label: string
  nav?: string
  heading: string
  lede?: string
}

export const SECTION_META: Record<string, SectionMeta> = {
  about: {
    id: 'about',
    index: '02',
    label: 'About',
    nav: 'About',
    heading: 'Two years of ERP, pipelines and servers.',
  },
  experience: {
    id: 'experience',
    index: '03',
    label: 'Experience',
    nav: 'Experience',
    heading: 'Where I have worked.',
    lede: 'The short version is on this page. The full version is in either resume, depending on which half of the job you are hiring for.',
  },
  work: {
    id: 'work',
    index: '04',
    label: 'Selected work',
    nav: 'Work',
    heading: 'Six things worth explaining.',
    lede: 'Each one opens a dossier: the problem, the architecture, what I built, what changed. No client names, no screenshots.',
  },
  stack: {
    id: 'stack',
    index: '05',
    label: 'Stack',
    nav: 'Stack',
    heading: 'What I work with daily.',
    lede: 'Tools I have used in production, not a list of everything I have read about.',
  },
  ops: {
    id: 'ops',
    index: '06',
    label: 'Operations',
    nav: 'Ops',
    heading: 'I keep production up.',
    lede: 'Consulting gets you the design. Someone still has to be there when authentication breaks on a Tuesday.',
  },
  numbers: {
    id: 'numbers',
    index: '07',
    label: 'By the numbers',
    heading: 'The measurable part.',
  },
  certs: {
    id: 'certs',
    index: '08',
    label: 'Certifications',
    heading: 'Certified, and studying.',
  },
  contact: {
    id: 'contact',
    index: '09',
    label: 'Contact',
    nav: 'Contact',
    heading: "Let's talk.",
  },
}

export const SECTION_ORDER = [
  'about',
  'experience',
  'work',
  'stack',
  'ops',
  'numbers',
  'certs',
  'contact',
] as const

export const NAV_SECTIONS = SECTION_ORDER.map((id) => SECTION_META[id]).filter(
  (section) => section.nav,
)
