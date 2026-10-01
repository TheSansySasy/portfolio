export type Runbook = {
  slug: string
  title: string
  summary: string
  pages: number
}

/**
 * Runbooks Sanskar wrote while doing the work, sanitised: no client name,
 * address, account, identifier or screenshot. Sources are in /runbooks, and
 * `node scripts/render-runbooks.mjs` renders them to /public/runbooks.
 */
export const RUNBOOKS = {
  copilot: {
    slug: 'copilot-enablement-fo',
    title: 'Enabling Microsoft Copilot in Finance and Operations',
    summary:
      'The process record from the rollout: Power Platform apps and tenant settings, Feature management, and how the sidecar was verified live.',
    pages: 4,
  },
  ppacUde: {
    slug: 'ppac-ude-deployment',
    title: 'Finance and Operations on PPAC, with the Unified Developer Experience',
    summary:
      'Provisioning an environment through the Power Platform admin center, including the PowerShell path that works for the India region, then connecting Visual Studio to it.',
    pages: 10,
  },
  appServiceScaling: {
    slug: 'app-service-scale-up-down',
    title: 'Automated scale up and down of an App Service plan',
    summary:
      'Azure Automation runbooks with a managed identity, triggered by Azure Monitor alerts, with a retry for scale-downs that Azure queues.',
    pages: 4,
  },
} as const satisfies Record<string, Runbook>
