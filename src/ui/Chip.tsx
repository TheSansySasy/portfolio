import type { ReactNode } from 'react'

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="mono-label inline-flex items-center rounded-full border border-line px-3 py-1 text-muted">
      {children}
    </span>
  )
}
