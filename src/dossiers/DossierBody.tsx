import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'

// Each dossier is its own chunk: they are read one at a time, only after a
// card is opened, so none of them belongs in the page's first download.
const DOSSIERS: Record<string, LazyExoticComponent<ComponentType>> = {
  'ai-document-platform': lazy(() => import('./AiDocumentPlatform').then((m) => ({ default: m.AiDocumentPlatform }))),
  'billing-portal': lazy(() => import('./BillingPortal').then((m) => ({ default: m.BillingPortal }))),
  'sql-always-on-azure': lazy(() => import('./SqlAlwaysOn').then((m) => ({ default: m.SqlAlwaysOn }))),
  'retail-erp-deployment': lazy(() =>
    import('./RetailErpDeployment').then((m) => ({ default: m.RetailErpDeployment })),
  ),
  'gcp-to-azure-migration': lazy(() => import('./GcpToAzure').then((m) => ({ default: m.GcpToAzure }))),
  'd365-fo-extensions': lazy(() => import('./D365Extensions').then((m) => ({ default: m.D365Extensions }))),
}

export function DossierBody({ slug }: { slug: string }) {
  const Body = DOSSIERS[slug]
  if (!Body) return null
  return (
    <Suspense fallback={<p className="mono-label text-muted">Loading the write-up…</p>}>
      <Body />
    </Suspense>
  )
}
