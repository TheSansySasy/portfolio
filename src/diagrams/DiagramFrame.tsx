import type { ReactNode } from 'react'

/**
 * Diagrams keep a minimum width and scroll sideways instead of shrinking their
 * labels into illegibility on narrow screens. The frame is focusable so the
 * scroll works from the keyboard, and each diagram's aria-label carries the
 * same information in words.
 */
export function DiagramFrame({
  label,
  caption,
  minWidth = 620,
  children,
}: {
  label: string
  caption: ReactNode
  minWidth?: number
  children: ReactNode
}) {
  return (
    <figure>
      <div
        role="region"
        aria-label={`${label} diagram, scrolls sideways on narrow screens`}
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-line p-4"
      >
        <div style={{ minWidth: `${minWidth}px` }}>{children}</div>
      </div>
      <figcaption className="mono-label mt-4 text-muted">{caption}</figcaption>
    </figure>
  )
}
