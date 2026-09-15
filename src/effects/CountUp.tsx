import { useEffect, useRef } from 'react'
import { useInView } from '../lib/useInView'
import { useReducedMotion } from '../lib/useReducedMotion'

type Figure = {
  prefix: string
  target: number
  decimals: number
  grouped: boolean
  suffix: string
}

/** Splits "26,000+" into its prefix, number and suffix; null if there is no number. */
function parseFigure(value: string): Figure | null {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value)
  if (!match) return null
  const [, prefix, number, suffix] = match
  return {
    prefix,
    target: Number(number.replace(/,/g, '')),
    decimals: number.includes('.') ? number.split('.')[1].length : 0,
    grouped: number.includes(','),
    suffix,
  }
}

function formatFigure(figure: Figure, amount: number): string {
  const body = figure.grouped
    ? amount.toLocaleString('en-US', {
        minimumFractionDigits: figure.decimals,
        maximumFractionDigits: figure.decimals,
      })
    : amount.toFixed(figure.decimals)
  return `${figure.prefix}${body}${figure.suffix}`
}

const DURATION_MS = 1400

/**
 * Counts a figure up from zero once it scrolls into view, keeping its format.
 * The final value is laid out invisibly underneath, so the width never changes
 * while it counts, and screen readers only ever hear the real figure.
 */
export function CountUp({ value, className = '' }: { value: string; className?: string }) {
  const reduced = useReducedMotion()
  const figure = parseFigure(value)
  const animate = !reduced && figure !== null
  const [ref, inView] = useInView<HTMLSpanElement>({ once: true, threshold: 0.6 })
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = displayRef.current
    const parsed = parseFigure(value)
    if (!el || !animate || !inView || !parsed) return

    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS)
      if (progress < 1) {
        const eased = 1 - Math.pow(1 - progress, 3)
        el.textContent = formatFigure(parsed, parsed.target * eased)
        frame = requestAnimationFrame(step)
      } else {
        el.textContent = value
      }
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [animate, inView, value])

  return (
    <span ref={ref} className={`relative inline-block tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="invisible">
        {value}
      </span>
      <span ref={displayRef} aria-hidden="true" className="absolute inset-0">
        {animate && figure ? formatFigure(figure, 0) : value}
      </span>
    </span>
  )
}
