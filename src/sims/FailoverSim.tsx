import { useCallback, useEffect, useRef, useState } from 'react'
import { DiagramFrame } from '../diagrams/DiagramFrame'
import { Button } from '../ui/Button'

/**
 * A two-node SQL Server Always On availability group you can break. Fail the
 * primary and watch the cluster wait out the heartbeat, keep quorum with the
 * witness, promote the secondary and move the listener; bring the node back and
 * it rejoins as a secondary that has to catch up. The behaviour is general
 * Always On behaviour, not a replay of any client's cluster.
 *
 * Every state change is announced in a polite live region, the controls are
 * ordinary buttons, and under reduced motion the pulses stop but the sequence
 * still plays.
 */

type NodeId = 1 | 2
type Phase = 'steady' | 'detecting' | 'electing' | 'switching' | 'resyncing'
type Sim = { primary: NodeId; down: NodeId | null; phase: Phase }

const START: Sim = { primary: 1, down: null, phase: 'steady' }
const DETECT_MS = 1600
const ELECT_MS = 1200
const SWITCH_MS = 1200
const RESYNC_MS = 1800

// Layout: two nodes either side of a centre lane that holds the replication
// link and the witness.
const NODE_W = 220
const NODE_X: Record<NodeId, number> = { 1: 48, 2: 452 }

const other = (n: NodeId): NodeId => (n === 1 ? 2 : 1)
const nodeName = (n: NodeId) => `Node 0${n}`

function describe(sim: Sim): string {
  const p = nodeName(sim.primary)
  const s = nodeName(other(sim.primary))
  switch (sim.phase) {
    case 'detecting':
      return `${p} stopped answering. The cluster waits out the heartbeat timeout first, so a brief network blip never triggers a failover.`
    case 'electing':
      return `${s} and the witness still hold two of the three votes, so the cluster keeps quorum and promotes ${s}.`
    case 'switching':
      return `Planned failover: ${p} finishes its in-flight commits, confirms ${s} is in sync, then hands over.`
    case 'resyncing':
      return `${s} is back as a secondary and catching up on what it missed. Until it has, it is not a safe failover target.`
    case 'steady':
      return sim.down
        ? `${p} is primary and the listener moved with it, so clients reconnect to the same name. Synchronous commit means nothing already committed was lost. ${nodeName(sim.down)} is still offline.`
        : `${p} is primary and commits synchronously to ${s}. The listener sends every client to ${p}.`
  }
}

function NodeBox({ id, sim, x }: { id: NodeId; sim: Sim; x: number }) {
  const isDown = sim.down === id
  const isPrimary = sim.primary === id && !isDown
  const promoting = sim.phase === 'electing' && sim.primary !== id
  const catchingUp = sim.phase === 'resyncing' && sim.primary !== id
  const role = isDown ? 'Offline' : isPrimary ? 'Primary' : catchingUp ? 'Catching up' : 'Secondary'
  const detail = isDown
    ? 'No heartbeat'
    : isPrimary
      ? 'Reads and writes'
      : catchingUp
        ? 'Replaying missed changes'
        : 'Synchronous commit'
  const dim = isDown ? 'opacity-45' : ''

  return (
    <g>
      <rect
        x={x}
        y={262}
        width={NODE_W}
        height={96}
        rx={6}
        strokeWidth={isPrimary || promoting ? 1.5 : 1}
        strokeDasharray={isDown ? '5 5' : undefined}
        className={`fill-none ${isPrimary || promoting ? 'stroke-accent' : 'stroke-line'}`}
      />
      <text
        x={x + 20}
        y={290}
        className={`fill-current font-mono text-[11px] tracking-[0.14em] uppercase ${dim}`}
      >
        {`Node 0${id} · ${role}`}
      </text>
      <text x={x + 20} y={314} className={`fill-current text-[13px] ${dim}`}>
        {detail}
      </text>
      <text x={x + 20} y={338} className="fill-current font-mono text-[10px] opacity-60">
        Windows Server · WSFC
      </text>
      <circle
        cx={x + NODE_W - 22}
        cy={284}
        r={5}
        className={isDown ? 'fill-none stroke-line' : 'fill-accent'}
      />
      {isDown ? null : (
        <circle cx={x + NODE_W - 22} cy={284} r={5} className="sim-pulse fill-none stroke-accent" />
      )}
    </g>
  )
}

export function FailoverSim() {
  const [sim, setSim] = useState<Sim>(START)
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }, [])
  useEffect(() => clearTimers, [clearTimers])

  const later = (ms: number, next: (current: Sim) => Sim) => {
    timers.current.push(window.setTimeout(() => setSim(next), ms))
  }

  const failPrimary = () => {
    const failed = sim.primary
    setSim({ ...sim, down: failed, phase: 'detecting' })
    later(DETECT_MS, (current) => ({ ...current, phase: 'electing' }))
    later(DETECT_MS + ELECT_MS, (current) => ({ ...current, primary: other(failed), phase: 'steady' }))
  }

  const bringBack = () => {
    setSim({ ...sim, down: null, phase: 'resyncing' })
    later(RESYNC_MS, (current) => ({ ...current, phase: 'steady' }))
  }

  const plannedFailover = () => {
    const from = sim.primary
    setSim({ ...sim, phase: 'switching' })
    later(SWITCH_MS, (current) => ({ ...current, primary: other(from), phase: 'steady' }))
  }

  const reset = () => {
    clearTimers()
    setSim(START)
  }

  const busy = sim.phase !== 'steady'
  const routedTo: NodeId | null =
    sim.phase === 'detecting' || sim.phase === 'electing' ? null : sim.primary
  const replicating = sim.down === null
  const electing = sim.phase === 'electing'
  const status = describe(sim)
  const summary = `Always On availability group. ${nodeName(sim.primary)} is ${
    sim.phase === 'detecting' ? 'failing' : 'primary'
  }${sim.down ? `, ${nodeName(sim.down)} is offline` : ''}.`

  return (
    <div>
      <DiagramFrame
        label="Failover simulation"
        minWidth={620}
        caption="Clients never address a node directly. The listener follows the primary, so a failover is a routing change rather than a configuration change."
      >
        <svg viewBox="0 0 720 400" role="img" aria-label={summary} className="h-auto w-full">
          <rect
            x={12}
            y={60}
            width={696}
            height={328}
            rx={8}
            strokeDasharray="4 4"
            className="fill-none stroke-line"
          />
          <text x={24} y={48} className="fill-current font-mono text-[11px] tracking-[0.14em] uppercase">
            Azure virtual network
          </text>

          <rect x={286} y={84} width={148} height={44} rx={6} className="fill-none stroke-line" />
          <text
            x={360}
            y={111}
            textAnchor="middle"
            className="fill-current font-mono text-[12px] tracking-[0.1em] uppercase"
          >
            Clients
          </text>
          <path d="M360 128 L360 160" className="stroke-line" />

          <rect
            x={266}
            y={160}
            width={188}
            height={48}
            rx={6}
            className={`fill-none ${routedTo ? 'stroke-accent' : 'stroke-line'}`}
          />
          <text
            x={360}
            y={182}
            textAnchor="middle"
            className="fill-current font-mono text-[12px] tracking-[0.1em] uppercase"
          >
            Listener
          </text>
          <text x={360} y={198} textAnchor="middle" className="fill-current font-mono text-[10px]">
            {routedTo ? `routes to node 0${routedTo}` : 'waiting for a primary'}
          </text>

          {([1, 2] as const).map((id) => (
            <path
              key={id}
              d={id === 1 ? 'M330 208 L158 262' : 'M390 208 L562 262'}
              strokeDasharray={routedTo === id ? undefined : '4 4'}
              className={routedTo === id ? 'stroke-accent' : 'stroke-line'}
              strokeWidth={routedTo === id ? 1.5 : 1}
            />
          ))}

          <NodeBox id={1} sim={sim} x={NODE_X[1]} />
          <NodeBox id={2} sim={sim} x={NODE_X[2]} />

          <path
            d="M268 292 L452 292"
            strokeDasharray={replicating ? undefined : '3 5'}
            className={
              replicating
                ? `stroke-accent sim-flow ${sim.primary === 2 ? 'sim-flow-reverse' : ''}`
                : 'stroke-line'
            }
          />
          <text x={360} y={284} textAnchor="middle" className="fill-current font-mono text-[10px]">
            {!replicating ? 'no replica' : sim.phase === 'resyncing' ? 'catching up' : 'sync commit'}
          </text>

          <rect
            x={305}
            y={316}
            width={110}
            height={34}
            rx={6}
            strokeWidth={electing ? 1.5 : 1}
            className={`fill-bg ${electing ? 'stroke-accent' : 'stroke-line'}`}
          />
          <text
            x={360}
            y={337}
            textAnchor="middle"
            className="fill-current font-mono text-[10px] tracking-[0.1em] uppercase"
          >
            Witness · vote 3
          </text>
          {electing ? (
            <text x={360} y={370} textAnchor="middle" className="fill-accent-text font-mono text-[10px]">
              2 of 3 votes: quorum held
            </text>
          ) : null}
        </svg>
      </DiagramFrame>

      <div className="mt-5 flex flex-wrap gap-3">
        {sim.down ? (
          <Button onClick={bringBack} disabled={busy} variant="solid">
            {`Bring ${nodeName(sim.down).toLowerCase()} back`}
          </Button>
        ) : (
          <Button onClick={failPrimary} disabled={busy} variant="solid">
            Fail the primary
          </Button>
        )}
        <Button onClick={plannedFailover} disabled={busy || sim.down !== null}>
          Planned failover
        </Button>
        <Button onClick={reset} disabled={sim === START} variant="ghost">
          Reset
        </Button>
      </div>

      <p aria-live="polite" className="mt-5 min-h-[4.5rem] border-l-2 border-accent pl-4 text-sm">
        {status}
      </p>
    </div>
  )
}
