import { AiDocumentPlatform } from './AiDocumentPlatform'
import { BillingPortal } from './BillingPortal'
import { DossierBlock, DossierList } from './DossierShell'

/** Outline shown for the four dossiers still to be written in Phase 5a. */
function Pending() {
  return (
    <DossierBlock label="In progress" heading="This one is not written yet">
      <p>
        The overlay, the deep link and the card are real; the write-up is not. Two dossiers are
        finished so far, and the remaining four follow the same structure.
      </p>
      <DossierList
        items={[
          'Context and constraints, with clients anonymised.',
          'The problem, stated plainly.',
          'An architecture diagram drawn for this site rather than screenshotted.',
          'What I built, and the annotated code that carries the idea.',
          'The outcome in numbers, and what I would do differently.',
        ]}
      />
    </DossierBlock>
  )
}

export function DossierBody({ slug }: { slug: string }) {
  if (slug === 'ai-document-platform') return <AiDocumentPlatform />
  if (slug === 'billing-portal') return <BillingPortal />
  return <Pending />
}
