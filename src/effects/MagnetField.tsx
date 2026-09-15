/**
 * Adapted from React Bits "Magnet Lines" by David Haz.
 * Source: https://reactbits.dev/animations/magnet-lines
 * Licence: MIT + Commons Clause, see ./LICENSE-react-bits.md. Vendored 2026-09-15.
 *
 * Local changes:
 * - Responds only while the field is on screen, and at most once per frame.
 * - Reads every line's position before rotating any of them, instead of
 *   interleaving a layout read with a style write for each line.
 * - Lines take currentColor, so the theme colours them with no props.
 * - Decorative and hidden from assistive tech; static under reduced motion.
 */
import { useEffect, useRef, type CSSProperties } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

export function MagnetField({
  rows = 6,
  columns = 20,
  baseAngle = -10,
  className = '',
}: {
  rows?: number
  columns?: number
  baseAngle?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const field = ref.current
    if (!field || reduced) return

    const lines = Array.from(field.children) as HTMLElement[]
    const pointer = { x: 0, y: 0, seen: false }
    let frame = 0
    let visible = false

    const paint = () => {
      frame = 0
      if (!visible || !pointer.seen) return

      const centers = lines.map((line) => {
        const rect = line.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      })
      lines.forEach((line, index) => {
        const { x, y } = centers[index]
        const angle = (Math.atan2(pointer.y - y, pointer.x - x) * 180) / Math.PI
        line.style.setProperty('--rotate', `${angle}deg`)
      })
    }

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.seen = true
      if (!frame && visible) frame = requestAnimationFrame(paint)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })

    observer.observe(field)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [rows, columns, reduced])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`grid h-full w-full place-items-center ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: rows * columns }, (_, index) => (
        <span
          key={index}
          className="magnet-line"
          style={{ '--rotate': `${baseAngle}deg` } as CSSProperties}
        />
      ))}
    </div>
  )
}
