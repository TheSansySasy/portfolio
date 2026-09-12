/** Shared content that the page, the nav and the styleguide all read. */

export const SITE = {
  name: 'Sanskar Rai',
  handle: 'SansySasy',
  domain: 'sansysasy.com',
  location: 'Delhi, India',
  timezone: 'UTC+5:30',
  github: 'https://github.com/TheSansySasy',
  repo: 'https://github.com/TheSansySasy/portfolio',
  // Filled in during Phase 2, once Sanskar sends the links.
  linkedin: null as string | null,
  credly: null as string | null,
  email: null as string | null,
} as const

export const ROLES = ['D365 F&O Consultant', 'Python Engineer', 'Azure & DevOps'] as const

/** Headline candidates. One gets chosen in Phase 2; all five render in the styleguide. */
export const HEADLINES = [
  'I build and run the systems behind the ERP.',
  'Dynamics 365 on top. Python and Azure underneath.',
  'I make ERPs talk to AI, and keep the servers up.',
  'From X++ to FastAPI to failover.',
  'ERP consultant who also runs the servers.',
] as const

export type SectionMeta = {
  id: string
  index: string
  label: string
  nav?: string
  heading: string
  lede: string
  /** What lands here in a later phase. Shown as a placeholder note until then. */
  arrives: string
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'about',
    index: '02',
    label: 'About',
    nav: 'About',
    heading: 'Two years of ERP, pipelines and servers.',
    lede: 'The path from a cloud-computing degree to running production SQL Server clusters and shipping an AI document platform.',
    arrives: 'Phase 2 copy, Phase 4 lanyard badge',
  },
  {
    id: 'experience',
    index: '03',
    label: 'Experience',
    nav: 'Experience',
    heading: 'Where I have worked.',
    lede: 'EBT, Runtime Solutions and Tectura, with the impact of each role in a few lines. This section is also the on-page resume.',
    arrives: 'Phase 2 timeline from the resumes',
  },
  {
    id: 'work',
    index: '04',
    label: 'Selected work',
    nav: 'Work',
    heading: 'Six things worth explaining.',
    lede: 'Each card opens a dossier: the problem, the architecture, what I built and what it changed. No client names, no screenshots.',
    arrives: 'Phase 2 first two dossiers, Phase 5a the rest',
  },
  {
    id: 'stack',
    index: '05',
    label: 'Stack',
    nav: 'Stack',
    heading: 'What I work with daily.',
    lede: 'Dynamics 365, Python, Azure, SQL Server, Linux and the agentic tooling I use to ship.',
    arrives: 'Phase 3 interactive stack sphere',
  },
  {
    id: 'ops',
    index: '06',
    label: 'Operations',
    nav: 'Ops',
    heading: 'I keep production up.',
    lede: 'A two-node Always On cluster, a Kerberos failure traced to an offline cluster resource, and the alerting designed after it.',
    arrives: 'Phase 4 failover simulation',
  },
  {
    id: 'numbers',
    index: '07',
    label: 'By the numbers',
    heading: 'The measurable part.',
    lede: '26,000 documents, five products, 99.9 percent uptime, 60 percent faster deploys, thirteen vendor defects found.',
    arrives: 'Phase 4 counters and heat map',
  },
  {
    id: 'certs',
    index: '08',
    label: 'Certifications',
    heading: 'Certified, and studying.',
    lede: 'Microsoft MB-310 earned, MB-500 in progress.',
    arrives: 'Phase 2, once the Credly link arrives',
  },
  {
    id: 'contact',
    index: '09',
    label: 'Contact',
    nav: 'Contact',
    heading: "Let's talk.",
    lede: 'Open to consulting engagements and engineering roles, remote from Delhi.',
    arrives: 'Phase 2 form, Phase 4 particle type',
  },
]

export const NAV_SECTIONS = SECTIONS.filter((section) => section.nav)
