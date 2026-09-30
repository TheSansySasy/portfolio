import { useEffect, useRef } from 'react'
import { SITE } from '../../content/data/site'
import { useThemeTokens, type ThemeTokens } from '../../lib/useThemeTokens'
import { drawBack, drawFront, drawStrap, FACE_H, FACE_W, loadBadgeFonts, STRAP_H, STRAP_W } from './badgeArt'

type Art = 'front' | 'back' | 'strap'

const SIZES: Record<Art, { w: number; h: number; scale: number }> = {
  front: { w: FACE_W, h: FACE_H, scale: 0.5 },
  back: { w: FACE_W, h: FACE_H, scale: 0.5 },
  strap: { w: STRAP_W, h: STRAP_H, scale: 0.5 },
}

function draw(ctx: CanvasRenderingContext2D, art: Art, tokens: ThemeTokens) {
  if (art === 'front') drawFront(ctx, tokens)
  else if (art === 'back') drawBack(ctx, tokens, SITE.linkedin || SITE.github)
  else drawStrap(ctx, tokens)
}

function ArtCanvas({ art, tokens, label }: { art: Art; tokens: ThemeTokens; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { w, h, scale } = SIZES[art]

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let cancelled = false
    void loadBadgeFonts().then(() => {
      if (cancelled) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * scale * dpr)
      canvas.height = Math.round(h * scale * dpr)
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)
      draw(ctx, art, tokens)
    })
    return () => {
      cancelled = true
    }
  }, [art, tokens, w, h, scale])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className="h-auto max-w-full rounded-lg border border-line"
      style={{ width: w * scale }}
    />
  )
}

/**
 * The lanyard's artwork laid flat for design review: both faces and the strap
 * print, drawn by the same functions the 3D card uses, in the active theme.
 */
export function BadgeArtPreview() {
  const tokens = useThemeTokens()
  if (!tokens) return null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-8">
        <figure className="flex flex-col gap-3">
          <ArtCanvas art="front" tokens={tokens} label="Badge front" />
          <figcaption className="mono-label text-muted">Front · foil stripe at the foot</figcaption>
        </figure>
        <figure className="flex flex-col gap-3">
          <ArtCanvas art="back" tokens={tokens} label="Badge back with a QR code to LinkedIn" />
          <figcaption className="mono-label text-muted">Back · foil roundel, QR to LinkedIn</figcaption>
        </figure>
      </div>
      <figure className="flex flex-col gap-3">
        <ArtCanvas art="strap" tokens={tokens} label="Strap print" />
        <figcaption className="mono-label text-muted">Strap · one repeat of the print</figcaption>
      </figure>
    </div>
  )
}
