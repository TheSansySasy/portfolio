export type Repo = {
  name: string
  url: string
  summary: string
  /** What is in it, as short mono tags. */
  contents: string[]
}

/**
 * Public showcase repositories. Both are clean-room reference
 * implementations: written from scratch to show a pattern, with no employer
 * code, client data or credentials, and each says so in its README.
 */
export const REPOS = {
  docflow: {
    name: 'docflow-extract',
    url: 'https://github.com/TheSansySasy/docflow-extract',
    summary:
      'The pattern from this dossier as a small FastAPI service: extraction into a schema with Gemini or Claude, checks before delivery, and one table recording every document\'s pages, rows, tokens and cost.',
    contents: ['Python', 'FastAPI', 'Tests', 'CI'],
  },
  sqlAg: {
    name: 'azure-sql-ag-runbook',
    url: 'https://github.com/TheSansySasy/azure-sql-ag-runbook',
    summary:
      'The cluster as Bicep, the build and failover procedures, the scripts for disk thresholds and CPU-triggered failover, and the Kerberos troubleshooting guide from this dossier.',
    contents: ['Bicep', 'PowerShell', 'Runbooks', 'CI'],
  },
} as const satisfies Record<string, Repo>
