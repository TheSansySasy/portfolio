/**
 * Pointer-following glow, adapted from React Bits "Spotlight Card" by David Haz.
 * Source: https://reactbits.dev/components/spotlight-card
 * Licence: MIT + Commons Clause, see ./LICENSE-react-bits.md. Vendored 2026-09-15.
 *
 * Local changes: the glow is a CSS pseudo-element placed by two custom
 * properties (.spotlight in globals.css) rather than React state, so moving the
 * pointer never re-renders. It takes the theme accent, also shows on keyboard
 * focus, and is switched off under reduced motion.
 */
import type { PointerEvent } from 'react'

export function trackSpotlight(event: PointerEvent<HTMLElement>): void {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--sx', `${event.clientX - rect.left}px`)
  el.style.setProperty('--sy', `${event.clientY - rect.top}px`)
}
