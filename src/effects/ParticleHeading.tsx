/**
 * The Contact heading as particles. Custom, written for this site in the
 * spirit of particle typography; no React Bits code is used.
 *
 * The real <h2> never leaves the DOM. It renders exactly like SplitHeading, and
 * on a fine-pointer desktop with motion allowed a canvas over it samples the
 * heading's own rendered words into small squares (the monogram's grid unit).
 * Only once the canvas has drawn does the DOM text turn transparent, so a
 * failed script or font leaves an ordinary heading. The squares rise into the
 * words when the section scrolls in, scatter from the pointer and spring home.
 *
 * The animation loop runs only while the heading is on screen and something is
 * moving; at rest it stops. Decorative, aria-hidden, DPR capped at 2, and
 * hidden in forced-colours mode.
 */
import { useEffect, useRef } from 'react'
import { FINE_POINTER_DESKTOP, useMediaQuery } from '../lib/useMediaQuery'
import { useInView } from '../lib/useInView'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useThemeTokens } from '../lib/useThemeTokens'
import { SplitWords } from './SplitHeading'

const GAP = 3 // sample step, CSS px
const SIZE = 2 // particle square, CSS px
const BLEED = 48 // canvas margin past the heading, so scattered squares are not clipped
const RADIUS = 72
const PUSH = 5
const SPRING = 0.07
const DAMPING = 0.84

type Field = {
  count: number
  homeX: Float32Array
  homeY: Float32Array
  x: Float32Array
  y: Float32Array
  vx: Float32Array
  vy: Float32Array
}

/** Draws each word where the browser laid it out and keeps the inked cells. */
function sampleWords(heading: HTMLElement, width: number, height: number): Field | null {
  const scratch = document.createElement('canvas')
  scratch.width = width
  scratch.height = height
  const ctx = scratch.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const style = getComputedStyle(heading)
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#000'

  for (const word of heading.querySelectorAll<HTMLElement>('.split-word')) {
    const text = word.textContent ?? ''
    const metrics = ctx.measureText(text)
    const ascent = metrics.fontBoundingBoxAscent
    const content = ascent + metrics.fontBoundingBoxDescent
    // offsetTop ignores the rise transform, so this is the settled position.
    // The glyphs' content area sits centred in the inline-block's line box.
    const baseline = word.offsetTop + (word.offsetHeight - content) / 2 + ascent
    ctx.fillText(text, BLEED + word.offsetLeft, BLEED + baseline)
  }

  const { data } = ctx.getImageData(0, 0, width, height)
  const xs: number[] = []
  const ys: number[] = []
  for (let y = 0; y < height; y += GAP) {
    for (let x = 0; x < width; x += GAP) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        xs.push(x)
        ys.push(y)
      }
    }
  }

  const count = xs.length
  return {
    count,
    homeX: Float32Array.from(xs),
    homeY: Float32Array.from(ys),
    x: Float32Array.from(xs),
    y: Float32Array.from(ys),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
  }
}

export function ParticleHeading({
  id,
  text,
  className = '',
}: {
  id: string
  text: string
  className?: string
}) {
  const fine = useMediaQuery(FINE_POINTER_DESKTOP)
  const reduced = useReducedMotion()
  const tokens = useThemeTokens()
  const enabled = fine && !reduced
  const [ref, inView] = useInView<HTMLHeadingElement>({
    once: true,
    rootMargin: '0px 0px -10% 0px',
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Survives theme changes and resizes, so the entrance plays once per visit.
  const entered = useRef(false)

  useEffect(() => {
    const heading = ref.current
    const canvas = canvasRef.current
    if (!enabled || !tokens || !heading || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let field: Field | null = null
    let width = 0
    let height = 0
    let frame = 0
    let visible = false
    let disposed = false
    const pointer = { x: -1e4, y: -1e4 }

    const draw = () => {
      if (!field) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const r2 = RADIUS * RADIUS
      ctx.fillStyle = tokens.text
      ctx.beginPath()
      for (let i = 0; i < field.count; i++) {
        const dx = field.x[i] - pointer.x
        const dy = field.y[i] - pointer.y
        if (dx * dx + dy * dy >= r2) ctx.rect(field.x[i], field.y[i], SIZE, SIZE)
      }
      ctx.fill()
      ctx.fillStyle = tokens.accent
      ctx.beginPath()
      for (let i = 0; i < field.count; i++) {
        const dx = field.x[i] - pointer.x
        const dy = field.y[i] - pointer.y
        if (dx * dx + dy * dy < r2) ctx.rect(field.x[i], field.y[i], SIZE, SIZE)
      }
      ctx.fill()
    }

    const step = () => {
      frame = 0
      if (!field || !visible) return
      const r2 = RADIUS * RADIUS
      let motion = 0
      for (let i = 0; i < field.count; i++) {
        const dx = field.x[i] - pointer.x
        const dy = field.y[i] - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1
          const force = (1 - d / RADIUS) * PUSH
          field.vx[i] += (dx / d) * force
          field.vy[i] += (dy / d) * force
        }
        field.vx[i] = (field.vx[i] + (field.homeX[i] - field.x[i]) * SPRING) * DAMPING
        field.vy[i] = (field.vy[i] + (field.homeY[i] - field.y[i]) * SPRING) * DAMPING
        field.x[i] += field.vx[i]
        field.y[i] += field.vy[i]
        motion +=
          Math.abs(field.vx[i]) +
          Math.abs(field.vy[i]) +
          Math.abs(field.homeX[i] - field.x[i]) +
          Math.abs(field.homeY[i] - field.y[i])
      }
      draw()
      if (motion > field.count * 0.02) {
        frame = requestAnimationFrame(step)
      } else {
        field.x.set(field.homeX)
        field.y.set(field.homeY)
        field.vx.fill(0)
        field.vy.fill(0)
        draw()
      }
    }

    const wake = () => {
      if (!frame && visible && field) frame = requestAnimationFrame(step)
    }

    const scatter = () => {
      if (!field) return
      for (let i = 0; i < field.count; i++) {
        field.x[i] = field.homeX[i] + (Math.random() - 0.5) * 40
        field.y[i] = field.homeY[i] + 36 + Math.random() * 90
      }
    }

    const build = async () => {
      const style = getComputedStyle(heading)
      try {
        await document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, text)
      } catch {
        // Fall through and sample whatever face is available.
      }
      if (disposed) return
      width = Math.ceil(heading.offsetWidth + BLEED * 2)
      height = Math.ceil(heading.offsetHeight + BLEED * 2)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      field = sampleWords(heading, width, height)
      if (!field || field.count === 0) return

      // Rise in on first arrival; appear settled if the heading is already on
      // screen, as after a deep link, rather than exploding in place.
      if (!entered.current && !visible) scatter()
      else entered.current = true
      draw()
      heading.dataset.particles = 'live'
      wake()
    }

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      if (pointer.x > -RADIUS && pointer.y > -RADIUS && pointer.x < width + RADIUS && pointer.y < height + RADIUS) wake()
    }
    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return
      pointer.x = -1e4
      pointer.y = -1e4
      wake()
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        entered.current = true
        wake()
      } else {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })
    let resizeFrame = 0
    let firstResize = true
    const resize = new ResizeObserver(() => {
      if (firstResize) {
        firstResize = false
        return
      }
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => void build())
    })

    visibility.observe(heading)
    resize.observe(heading)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    void build()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      visibility.disconnect()
      resize.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
      delete heading.dataset.particles
    }
  }, [enabled, tokens, text, ref])

  return (
    <h2
      ref={ref}
      id={id}
      className={`split-heading relative ${inView ? 'is-in' : ''} ${className}`}
    >
      <SplitWords text={text} />
      {enabled ? <canvas ref={canvasRef} aria-hidden="true" className="particle-canvas" /> : null}
    </h2>
  )
}
