import { BillingFlow } from '../diagrams/BillingFlow'
import { CodeBlock } from '../ui/CodeBlock'
import { DossierBlock, DossierList, DossierMetrics, DossierStack } from './DossierShell'

export function BillingPortal() {
  return (
    <>
      <DossierBlock label="Context">
        <p>
          The document platform needed a portal where clients could see what they had consumed and
          what it cost. One already existed, written by a vendor. I was asked to extend it, read it
          first, and recommended replacing it.
        </p>
      </DossierBlock>

      <DossierBlock label="The audit">
        <p>
          I went through the vendor codebase and wrote up thirteen defects before proposing
          anything. Two mattered more than the rest.
        </p>
        <DossierList
          items={[
            'SQL injection: user input reached queries through string construction rather than parameters.',
            'Authentication middleware existed in the codebase but was never actually wired into the request path, so protected routes were not protected.',
            'Pricing was applied at the current rate, which meant reprinting an old invoice could produce a different number than the client had already paid.',
          ]}
        />
        <p>
          The third one is the reason a rewrite was the honest recommendation. A billing system that
          cannot reproduce last quarter is not repairable by patching.
        </p>
      </DossierBlock>

      <DossierBlock label="Architecture">
        <BillingFlow />
      </DossierBlock>

      <DossierBlock label="What I built">
        <DossierList
          items={[
            'A replacement portal in FastAPI, Jinja2 and MySQL, with Chart.js for consumption trends.',
            "Slab-based pricing resolved against each usage row's own date, so historical invoices stay reproducible after a price change.",
            'End-of-month invoice locking: once a period closes, its numbers are immutable and later corrections become explicit adjustments.',
            'Separate admin and client roles, with clients scoped to their own data and admins additionally seeing margin reporting and CSV export.',
            'Session handling on JWTs in HttpOnly cookies, and parameterised queries throughout.',
            "A bot-training module powered by the Claude API, so support answers come from the product's own documentation.",
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Annotated code" heading="Pricing has to be a function of time">
        <p>
          The whole rewrite turns on one idea: a rate is only valid for a date range, and a row is
          priced by its own date rather than by today.
        </p>
        <CodeBlock
          title="slab resolution, simplified"
          language="sql"
          lines={[
            { code: 'SELECT s.unit_price', note: 'One row out: the rate that applied back then' },
            { code: '  FROM pricing_slab AS s' },
            { code: ' WHERE s.client_id   = :client_id' },
            { code: '   AND s.product_id  = :product_id' },
            {
              code: '   AND s.effective_from <= :usage_date',
              note: 'The slab must already have started',
            },
            {
              code: '   AND (s.effective_to IS NULL OR s.effective_to >= :usage_date)',
              note: 'Open-ended slabs stay current; closed ones retire cleanly',
            },
            {
              code: '   AND :quantity BETWEEN s.tier_from AND s.tier_to',
              note: 'Volume tier, resolved inside the dated slab',
            },
            { code: ' ORDER BY s.effective_from DESC' },
            { code: ' LIMIT 1;', note: 'Latest slab that was in force, never the newest overall' },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Outcome">
        <DossierMetrics
          items={[
            { value: '13', label: 'defects documented' },
            { value: '0', label: 'string-built queries' },
            { value: '1', label: 'source of billing truth' },
          ]}
        />
        <p>
          Invoices reproduce, roles hold, and the numbers the client sees are the numbers the
          platform recorded. It was built spec-first, in phases, with Claude Code.
        </p>
      </DossierBlock>

      <DossierBlock label="Stack">
        <DossierStack
          items={['Python', 'FastAPI', 'Jinja2', 'MySQL', 'Chart.js', 'JWT', 'Claude API']}
        />
      </DossierBlock>

      <DossierBlock label="What I would do differently">
        <DossierList
          items={[
            'Write the invoice-reproduction test before the pricing engine. It is the requirement that defines the whole design, so it should have been the first assertion in the suite.',
            'Model adjustments as first-class entries from day one, rather than adding them once locking made them necessary.',
          ]}
        />
      </DossierBlock>
    </>
  )
}
