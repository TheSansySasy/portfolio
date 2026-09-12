import { DiagramFrame } from './DiagramFrame'

/** SharePoint to Business Central, with every document's status and cost recorded. */
export function DocPipeline() {
  const boxes = [
    { x: 16, y: 56, w: 150, h: 58, title: 'SharePoint', sub: 'client drop folders' },
    { x: 16, y: 168, w: 150, h: 58, title: 'Ingest worker', sub: 'per-client isolation' },
    { x: 246, y: 168, w: 168, h: 58, title: 'Gemini Flash', sub: 'structured extraction' },
    { x: 246, y: 56, w: 168, h: 58, title: 'Validation', sub: 'schema and totals' },
    { x: 494, y: 56, w: 190, h: 58, title: 'Business Central', sub: 'OAuth2 or NTLM' },
    { x: 494, y: 144, w: 190, h: 58, title: 'SFTP delivery', sub: 'for non-BC clients' },
    { x: 494, y: 232, w: 190, h: 58, title: 'MySQL', sub: 'status, pages, rows, tokens' },
    { x: 246, y: 288, w: 168, h: 58, title: 'Billing portal', sub: 'slab pricing, invoices' },
  ]

  return (
    <DiagramFrame
      label="Document pipeline"
      minWidth={680}
      caption="Delivery and metering are separate paths on purpose. A delivery can succeed while a client is still being billed correctly for the pages and tokens it consumed."
    >
      <svg
        viewBox="0 0 700 372"
        role="img"
        aria-label="Documents arrive from SharePoint into a per-client ingest worker, are extracted by Gemini Flash, validated, then delivered to Dynamics 365 Business Central over OAuth2 or NTLM, or to SFTP. Every document's status, page count, row count and token usage is written to MySQL, which the billing portal reads."
        className="h-auto w-full"
      >
        {boxes.map((box) => (
          <g key={box.title}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx="6"
              className={`fill-none ${
                box.title === 'Gemini Flash' || box.title === 'Business Central'
                  ? 'stroke-accent'
                  : 'stroke-line'
              }`}
            />
            <text
              x={box.x + 14}
              y={box.y + 26}
              className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase"
            >
              {box.title}
            </text>
            <text x={box.x + 14} y={box.y + 44} className="fill-current text-[11px] opacity-60">
              {box.sub}
            </text>
          </g>
        ))}

        <g className="stroke-line" strokeWidth="1" fill="none">
          <path d="M91 114 L91 168" />
          <path d="M166 197 L246 197" />
          <path d="M330 168 L330 114" />
          <path d="M414 85 L494 85" />
          <path d="M414 96 L494 165" />
          <path d="M414 110 L494 250" strokeDasharray="4 4" />
          <path d="M494 261 L414 305" strokeDasharray="4 4" />
        </g>

        <text x="176" y="190" className="fill-current font-mono text-[10px]">
          extract
        </text>
        <text x="340" y="140" className="fill-current font-mono text-[10px]">
          verify
        </text>
        <text x="424" y="78" className="fill-current font-mono text-[10px]">
          deliver
        </text>
        <text x="424" y="300" className="fill-current font-mono text-[10px]">
          meter
        </text>
      </svg>
    </DiagramFrame>
  )
}
