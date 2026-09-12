import { DiagramFrame } from './DiagramFrame'

/** Usage becomes an invoice: slabs resolved at the document's own date, then locked. */
export function BillingFlow() {
  return (
    <DiagramFrame
      label="Billing flow"
      minWidth={680}
      caption="The resolver reads the slab that was in force on each row's own date, so a price change never rewrites a past month."
    >
      <svg
        viewBox="0 0 700 300"
        role="img"
        aria-label="Per-document usage rows feed a pricing resolver that picks the slab in force on each document's own date. Drafts accumulate through the month, then an end-of-month lock freezes the invoice. Clients see their own invoices; admins additionally see margin reports and CSV exports."
        className="h-auto w-full"
      >
        <g>
          <rect x="16" y="112" width="160" height="62" rx="6" className="fill-none stroke-line" />
          <text x="30" y="138" className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase">
            Usage rows
          </text>
          <text x="30" y="156" className="fill-current text-[11px] opacity-60">
            pages, rows, tokens
          </text>
        </g>

        <g>
          <rect x="248" y="112" width="180" height="62" rx="6" className="fill-none stroke-accent" />
          <text x="262" y="138" className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase">
            Slab resolver
          </text>
          <text x="262" y="156" className="fill-current text-[11px] opacity-60">
            priced at the row&apos;s date
          </text>
        </g>

        <g>
          <rect x="248" y="24" width="180" height="54" rx="6" className="fill-none stroke-line" />
          <text x="262" y="48" className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase">
            Slab history
          </text>
          <text x="262" y="66" className="fill-current text-[11px] opacity-60">
            effective-dated tiers
          </text>
        </g>

        <g>
          <rect x="500" y="112" width="184" height="62" rx="6" className="fill-none stroke-line" />
          <text x="514" y="138" className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase">
            Month-end lock
          </text>
          <text x="514" y="156" className="fill-current text-[11px] opacity-60">
            invoice becomes immutable
          </text>
        </g>

        <g>
          <rect x="500" y="212" width="184" height="54" rx="6" className="fill-none stroke-line" />
          <text x="514" y="236" className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase">
            Admin view
          </text>
          <text x="514" y="254" className="fill-current text-[11px] opacity-60">
            margin, CSV export
          </text>
        </g>

        <g>
          <rect x="248" y="212" width="180" height="54" rx="6" className="fill-none stroke-line" />
          <text x="262" y="236" className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase">
            Client view
          </text>
          <text x="262" y="254" className="fill-current text-[11px] opacity-60">
            own invoices only
          </text>
        </g>

        <g className="stroke-line" strokeWidth="1" fill="none">
          <path d="M176 143 L248 143" />
          <path d="M338 78 L338 112" />
          <path d="M428 143 L500 143" />
          <path d="M338 174 L338 212" strokeDasharray="4 4" />
          <path d="M592 174 L592 212" strokeDasharray="4 4" />
        </g>
      </svg>
    </DiagramFrame>
  )
}
