/**
 * Adapted from React Bits "Decrypted Text" by David Haz.
 * Source: https://reactbits.dev/text-animations/decrypted-text
 * Licence: MIT + Commons Clause, see ./LICENSE-react-bits.md. Vendored 2026-09-15.
 *
 * Local changes:
 * - Rewritten to mutate one text node on a timer instead of re-rendering React
 *   on every tick, which also drops the Motion dependency.
 * - The original hid its screen-reader copy with `visibility: hidden`, which
 *   removes it from the accessibility tree, so nothing was announced at all.
 *   Assistive tech now gets the real text.
 * - Reveals left to right once on load and replays on hover, in about sixteen
 *   steps rather than one per character, so it does not keep firing timers
 *   while the page is still loading. Spaces and separators never scramble, and
 *   the mono face keeps the width constant.
 * - Plain text under prefers-reduced-motion.
 */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>'
const NEVER_SCRAMBLE = new Set([' ', '·'])

function scramble(chars: string[], revealed: number): string {
  return chars
    .map((char, index) =>
      index < revealed || NEVER_SCRAMBLE.has(char)
        ? char
        : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    )
    .join('')
}

export function DecryptLine({
  text,
  className = '',
  stepMs = 45,
}: {
  text: string
  className?: string
  stepMs?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  // Scramble before the first paint, so the real text never flashes first.
  useLayoutEffect(() => {
    if (!reduced && ref.current) ref.current.textContent = scramble([...text], 0)
  }, [text, reduced])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.textContent = text
      return
    }

    const chars = [...text]
    const perStep = Math.max(1, Math.ceil(chars.length / 16))
    let timer = 0
    let revealed = 0

    const run = () => {
      if (timer) return
      revealed = 0
      timer = window.setInterval(() => {
        revealed += perStep
        if (revealed >= chars.length) {
          window.clearInterval(timer)
          timer = 0
          el.textContent = text
          return
        }
        el.textContent = scramble(chars, revealed)
      }, stepMs)
    }

    run()
    el.addEventListener('pointerenter', run)
    return () => {
      window.clearInterval(timer)
      el.removeEventListener('pointerenter', run)
      el.textContent = text
    }
  }, [text, stepMs, reduced])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  )
}
