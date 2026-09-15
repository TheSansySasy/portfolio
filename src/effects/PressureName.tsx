/**
 * Adapted from React Bits "Text Pressure" by David Haz, itself ported from a
 * CodePen by Juan Fuentes.
 * Source: https://reactbits.dev/text-animations/text-pressure
 * Licence: MIT + Commons Clause, see ./LICENSE-react-bits.md. Vendored 2026-09-15.
 *
 * Local changes:
 * - Sized in CSS with container units (.pressure-name in globals.css) instead
 *   of a debounced JavaScript measure, so the hero never paints small and then
 *   jumps, and the largest paint is not held back.
 * - Drives the self-hosted Archivo width and weight axes instead of loading
 *   Roboto Flex from Google Fonts. Archivo has no italic axis, so that mode is gone.
 * - Runs only for a fine pointer near the hero, stops once the letters settle,
 *   and relaxes back to the static heading when the pointer leaves.
 * - Reads every letter's position before writing any style, so a frame costs
 *   one layout rather than one per letter.
 * - Screen readers get the name as words, not as eleven separate letters.
 * - Static under prefers-reduced-motion.
 */
import { useEffect, useRef } from 'react'
import { FINE_POINTER_DESKTOP } from '../lib/useMediaQuery'
import { useReducedMotion } from '../lib/useReducedMotion'

type Axes = { wght: number; wdth: number }

/** The static heading, and where every letter returns to. */
const REST: Axes = { wght: 800, wdth: 100 }
/** Letters furthest from the pointer, still inside the hero. */
const FAR: Axes = { wght: 320, wdth: 72 }
/** The letter directly under the pointer. */
const NEAR: Axes = { wght: 900, wdth: 125 }
const EASE = 0.16
/** How far outside the hero section the pointer still presses the letters. */
const ZONE_PADDING = 80

export function PressureName({
  text,
  id,
  className = '',
}: {
  text: string
  id?: string
  className?: string
}) {
  const rowRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const chars = [...text]

  useEffect(() => {
    const row = rowRef.current
    if (!row || reduced || !window.matchMedia(FINE_POINTER_DESKTOP).matches) return

    const letters = Array.from(row.querySelectorAll<HTMLSpanElement>('.pressure-char'))
    const state: Axes[] = letters.map(() => ({ ...REST }))
    const zone = row.closest('section') ?? row
    const pointer = { x: 0, y: 0, present: false }
    let frame = 0
    let visible = true

    const tick = () => {
      frame = 0
      const zoneRect = zone.getBoundingClientRect()
      const near =
        pointer.present &&
        pointer.x >= zoneRect.left - ZONE_PADDING &&
        pointer.x <= zoneRect.right + ZONE_PADDING &&
        pointer.y >= zoneRect.top - ZONE_PADDING &&
        pointer.y <= zoneRect.bottom + ZONE_PADDING
      const maxDistance = Math.max(1, row.getBoundingClientRect().width / 2)

      // Read every position first...
      const centers = letters.map((letter) => {
        const rect = letter.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      })

      let settling = false
      centers.forEach((center, index) => {
        let target = REST
        if (near) {
          const distance = Math.hypot(pointer.x - center.x, pointer.y - center.y)
          const pressure = Math.max(0, 1 - distance / maxDistance)
          target = {
            wght: FAR.wght + (NEAR.wght - FAR.wght) * pressure,
            wdth: FAR.wdth + (NEAR.wdth - FAR.wdth) * pressure,
          }
        }
        const current = state[index]
        current.wght += (target.wght - current.wght) * EASE
        current.wdth += (target.wdth - current.wdth) * EASE
        if (Math.abs(target.wght - current.wght) > 1 || Math.abs(target.wdth - current.wdth) > 0.2) {
          settling = true
        }
      })

      // ...then write, so the frame triggers a single layout.
      letters.forEach((letter, index) => {
        const { wght, wdth } = state[index]
        letter.style.fontVariationSettings = `'wght' ${wght.toFixed(0)}, 'wdth' ${wdth.toFixed(1)}`
      })

      if (settling) schedule()
    }

    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.present = true
      schedule()
    }
    const onLeaveWindow = (event: MouseEvent) => {
      if (event.relatedTarget) return
      pointer.present = false
      schedule()
    }
    const onScroll = () => {
      if (pointer.present) schedule()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
    })

    observer.observe(row)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onLeaveWindow)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onLeaveWindow)
      window.removeEventListener('scroll', onScroll)
      letters.forEach((letter) => {
        letter.style.fontVariationSettings = ''
      })
    }
  }, [reduced, text])

  return (
    <h1 id={id} className={`pressure-name ${className}`}>
      <span className="sr-only">{text}</span>
      <span ref={rowRef} aria-hidden="true" className="pressure-row">
        {chars.map((char, index) =>
          char === ' ' ? (
            <span key={`${index}-space`} className="pressure-space" />
          ) : (
            <span key={`${index}-${char}`} className="pressure-char">
              {char}
            </span>
          ),
        )}
      </span>
    </h1>
  )
}
