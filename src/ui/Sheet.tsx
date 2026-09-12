import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen overlay used by the dossiers and the mobile nav: its own scroll,
 * trapped focus, the page behind locked, Escape and backdrop both close it.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    restoreFocusTo.current = document.activeElement as HTMLElement | null
    panel?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreFocusTo.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  // Portalled to <body>: the nav's backdrop-filter creates a containing block,
  // so a fixed overlay rendered inside it would be clipped to the nav height.
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#0a0a0b]/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="absolute inset-0 overflow-y-auto overscroll-contain bg-bg outline-none md:inset-6 md:rounded-lg md:border md:border-line"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-glass px-gutter py-4 backdrop-blur-md">
          <p className="mono-label text-muted">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="mono-label rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent-text"
          >
            Close esc
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
