import type { ReactNode } from 'react'
import { DiagramFrame } from './DiagramFrame'

export type FlowBox = {
  /** Needed only when two boxes share a title. */
  id?: string
  x: number
  y: number
  w: number
  h?: number
  title: string
  sub?: string
  /** Drawn in the accent: the part of the diagram the dossier is about. */
  accent?: boolean
  dashed?: boolean
}

export type FlowLink = { d: string; dashed?: boolean; accent?: boolean }
export type FlowNote = { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }
export type FlowGroup = { x: number; y: number; w: number; h: number; label: string }

/**
 * The house style of the dossier diagrams, as data: labelled boxes, plain
 * connecting lines, small mono notes and dashed containers. Every diagram
 * carries a full sentence description for screen readers, since the drawing
 * itself is decorative to them.
 */
export function FlowDiagram({
  label,
  caption,
  description,
  width = 700,
  height,
  minWidth = 680,
  groups = [],
  boxes,
  links = [],
  notes = [],
}: {
  label: string
  caption: ReactNode
  description: string
  width?: number
  height: number
  minWidth?: number
  groups?: FlowGroup[]
  boxes: FlowBox[]
  links?: FlowLink[]
  notes?: FlowNote[]
}) {
  return (
    <DiagramFrame label={label} minWidth={minWidth} caption={caption}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description} className="h-auto w-full">
        {groups.map((group) => (
          <g key={group.label}>
            <rect
              x={group.x}
              y={group.y}
              width={group.w}
              height={group.h}
              rx="8"
              strokeDasharray="4 4"
              className="fill-none stroke-line"
            />
            <text
              x={group.x + 12}
              y={group.y - 10}
              className="fill-current font-mono text-[11px] tracking-[0.14em] uppercase"
            >
              {group.label}
            </text>
          </g>
        ))}

        <g fill="none" strokeWidth="1">
          {links.map((link) => (
            <path
              key={link.d}
              d={link.d}
              strokeDasharray={link.dashed ? '4 4' : undefined}
              className={link.accent ? 'stroke-accent' : 'stroke-line'}
            />
          ))}
        </g>

        {boxes.map((box) => (
          <g key={box.id ?? box.title}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h ?? 56}
              rx="6"
              strokeDasharray={box.dashed ? '5 4' : undefined}
              className={`fill-bg ${box.accent ? 'stroke-accent' : 'stroke-line'}`}
            />
            <text
              x={box.x + 14}
              y={box.y + 25}
              className="fill-current font-mono text-[11px] tracking-[0.1em] uppercase"
            >
              {box.title}
            </text>
            {box.sub ? (
              <text x={box.x + 14} y={box.y + 43} className="fill-current text-[11px] opacity-60">
                {box.sub}
              </text>
            ) : null}
          </g>
        ))}

        {notes.map((note) => (
          <text
            key={`${note.x}-${note.y}`}
            x={note.x}
            y={note.y}
            textAnchor={note.anchor ?? 'start'}
            className="fill-current font-mono text-[10px]"
          >
            {note.text}
          </text>
        ))}
      </svg>
    </DiagramFrame>
  )
}
