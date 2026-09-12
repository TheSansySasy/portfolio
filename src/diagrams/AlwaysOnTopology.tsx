import { DiagramFrame } from './DiagramFrame'

/**
 * Static topology of the two-node availability group. Phase 4 turns this same
 * layout into the click-to-fail-over simulation.
 */
export function AlwaysOnTopology() {
  return (
    <DiagramFrame
      label="Always On topology"
      minWidth={620}
      caption="Clients never address a node directly. The listener follows the primary, so a failover is a routing change rather than a configuration change."
    >
      <svg
        viewBox="0 0 720 380"
        role="img"
        aria-label="Two-node SQL Server Always On availability group on Azure: clients reach a listener, which routes to the primary node, which commits synchronously to the secondary node. A file share witness holds the third quorum vote."
        className="h-auto w-full"
      >
        <g className="stroke-line" strokeWidth="1" fill="none">
          <rect x="12" y="60" width="696" height="308" rx="8" strokeDasharray="4 4" />
        </g>

        <text x="24" y="48" className="fill-current text-[11px] tracking-[0.14em] uppercase">
          <tspan className="font-mono">Azure virtual network</tspan>
        </text>

        {/* client */}
        <g>
          <rect x="286" y="84" width="148" height="44" rx="6" className="fill-none stroke-line" />
          <text
            x="360"
            y="111"
            textAnchor="middle"
            className="fill-current font-mono text-[12px] tracking-[0.1em] uppercase"
          >
            Clients
          </text>
        </g>

        {/* listener */}
        <g>
          <rect x="266" y="160" width="188" height="48" rx="6" className="fill-none stroke-accent" />
          <text
            x="360"
            y="182"
            textAnchor="middle"
            className="fill-current font-mono text-[12px] tracking-[0.1em] uppercase"
          >
            Listener
          </text>
          <text x="360" y="198" textAnchor="middle" className="fill-current font-mono text-[10px]">
            one name, always the primary
          </text>
        </g>

        {/* nodes */}
        <g>
          <rect x="48" y="248" width="252" height="96" rx="6" className="fill-none stroke-accent" />
          <text x="68" y="276" className="fill-current font-mono text-[11px] tracking-[0.14em] uppercase">
            Node 01 · primary
          </text>
          <text x="68" y="300" className="fill-current text-[13px]">
            Reads and writes
          </text>
          <text x="68" y="322" className="fill-current font-mono text-[10px]">
            Windows Server · WSFC
          </text>
        </g>

        <g>
          <rect x="420" y="248" width="252" height="96" rx="6" className="fill-none stroke-line" />
          <text x="440" y="276" className="fill-current font-mono text-[11px] tracking-[0.14em] uppercase">
            Node 02 · secondary
          </text>
          <text x="440" y="300" className="fill-current text-[13px]">
            Synchronous commit
          </text>
          <text x="440" y="322" className="fill-current font-mono text-[10px]">
            Windows Server · WSFC
          </text>
        </g>

        {/* connections */}
        <g className="stroke-line" strokeWidth="1">
          <path d="M360 128 L360 160" />
          <path d="M330 208 L174 248" />
          <path d="M390 208 L546 248" strokeDasharray="4 4" />
          <path d="M300 296 L420 296" />
        </g>

        <text x="360" y="290" textAnchor="middle" className="fill-current font-mono text-[10px]">
          replication
        </text>

        {/* quorum witness */}
        <g>
          <rect x="286" y="232" width="148" height="34" rx="6" className="fill-bg stroke-line" />
          <text
            x="360"
            y="254"
            textAnchor="middle"
            className="fill-current font-mono text-[10px] tracking-[0.1em] uppercase"
          >
            Witness · 3rd vote
          </text>
        </g>
      </svg>
    </DiagramFrame>
  )
}
