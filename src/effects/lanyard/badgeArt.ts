/**
 * The lanyard badge's artwork, drawn on 2D canvases from the theme tokens, so
 * both themes get a matching card and no image files ship with the site.
 *
 * Faces are drawn in card units: 716 x 1000, one unit per thousandth of the
 * model's own scale, so the face is exactly the card's shape. FACE_MAPS turns
 * card units into atlas pixels for each face. The coefficients are fitted from
 * card.glb's UVs (front and back max error under 0.0003): the front sits in the
 * left half of the atlas, the back in the right half, both upright. The atlas
 * is 1536 x 1423 rather than square so a card unit is the same size across and
 * down, and nothing drawn here is stretched on the model.
 *
 * The styleguide renders these same functions flat, for design review.
 */
import { encode } from 'uqr'
import type { ThemeTokens } from '../../lib/useThemeTokens'

export const FACE_W = 716
export const FACE_H = 1000
export const ATLAS_W = 1536
export const ATLAS_H = 1423

type FaceMap = { a: number; d: number; e: number; f: number }

/** u = a * X + e, v = d * Y + f, with X and Y in card units from the top left. */
const FACE_MAPS: Record<'front' | 'back', FaceMap> = {
  front: { a: 0.0006954, d: 0.0007507, e: 0.00088, f: 0.00428 },
  back: { a: 0.000696, d: 0.000755, e: 0.50146, f: 0.00229 },
}

const INK = '#0a0a0b'
const MARGIN = 56
const DISPLAY = '"Archivo Variable", Archivo, system-ui, sans-serif'
const MONO = '"JetBrains Mono Variable", ui-monospace, monospace'

// Modular 5x5 S and R, the same bitmaps as ui/Monogram.tsx.
const S_ROWS = ['11111', '10000', '11111', '00001', '11111']
const R_ROWS = ['11110', '10010', '11110', '10100', '10010']

/** Fonts the artwork needs. Canvas text silently falls back if these are not ready. */
export function loadBadgeFonts(): Promise<unknown> {
  return Promise.all([
    document.fonts.load(`800 100px ${DISPLAY}`, 'SANSKAR RAI'),
    document.fonts.load(`500 24px ${MONO}`, '@SansySasy'),
    document.fonts.load(`800 24px ${MONO}`, 'SANSYSASY'),
  ]).catch(() => undefined)
}

function parseHex(hex: string): number[] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const digits = m[1].length === 3 ? [...m[1]].map((d) => d + d).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16))
}

/**
 * On the light card, thin grey type fades into the white under texture
 * filtering and the room's light, so its labels are drawn darker (70% of the
 * way from muted to text) and heavier. The dark card keeps the muted token.
 */
function labelInk(tokens: ThemeTokens): { color: string; bold: boolean } {
  const surface = parseHex(tokens.surface)
  const light = surface ? (surface[0] + surface[1] + surface[2]) / 3 > 128 : false
  const text = parseHex(tokens.text)
  const muted = parseHex(tokens.muted)
  if (!light || !text || !muted) return { color: tokens.muted, bold: false }
  const mixed = muted.map((channel, i) => Math.round(channel * 0.3 + text[i] * 0.7))
  return { color: `rgb(${mixed.join(', ')})`, bold: true }
}

function mono(ctx: CanvasRenderingContext2D, size: number, weight = 500) {
  ctx.font = `${weight} ${size}px ${MONO}`
  ctx.letterSpacing = `${(size * 0.14).toFixed(1)}px`
}

function display(ctx: CanvasRenderingContext2D, size: number) {
  ctx.font = `800 ${size}px ${DISPLAY}`
  ctx.letterSpacing = `${(-size * 0.02).toFixed(1)}px`
}

function gridMark(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number) {
  const draw = (rows: string[], offset: number) =>
    rows.forEach((row, ry) =>
      [...row].forEach((bit, rx) => {
        if (bit === '1') {
          ctx.fillRect(x + (rx + offset) * cell + cell * 0.06, y + ry * cell + cell * 0.06, cell * 0.88, cell * 0.88)
        }
      }),
    )
  draw(S_ROWS, 0)
  draw(R_ROWS, 6)
}

/** The slot the clamp passes through, top centre on both faces. */
function slot(ctx: CanvasRenderingContext2D, tokens: ThemeTokens) {
  ctx.fillStyle = tokens.bg
  ctx.strokeStyle = tokens.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(FACE_W / 2 - 62, 44, 124, 30, 15)
  ctx.fill()
  ctx.stroke()
}

/** Holographic foil stripe with a micro-print, like the security band on a pass. */
function foilBand(ctx: CanvasRenderingContext2D, y: number, height: number) {
  const gradient = ctx.createLinearGradient(MARGIN, y, FACE_W - MARGIN, y + height)
  gradient.addColorStop(0, '#c9ccd6')
  gradient.addColorStop(0.35, '#eef0f4')
  gradient.addColorStop(0.65, '#b8bcc8')
  gradient.addColorStop(1, '#e4e6ec')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(MARGIN, y, FACE_W - MARGIN * 2, height, 8)
  ctx.fill()

  ctx.save()
  ctx.clip()
  ctx.fillStyle = 'rgba(10, 10, 11, 0.32)'
  mono(ctx, 13, 700)
  ctx.textBaseline = 'middle'
  const line = 'SANSKAR RAI · SANSYSASY · '.repeat(4)
  for (let row = 0; row < 3; row++) {
    ctx.fillText(line, MARGIN + 10 - row * 38, y + height * ((row + 1) / 4))
  }
  ctx.restore()
}

function fitSize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number) {
  display(ctx, 100)
  const width = ctx.measureText(text).width
  return Math.min(maxSize, (maxWidth / width) * 100)
}

export const FOIL_FRONT = { y: 858, height: 78 }
export const ROUNDEL = { x: FACE_W / 2, y: 318, outer: 196, inner: 118 }

export function drawFront(ctx: CanvasRenderingContext2D, tokens: ThemeTokens) {
  ctx.fillStyle = tokens.surface
  ctx.fillRect(0, 0, FACE_W, FACE_H)
  slot(ctx, tokens)

  ctx.fillStyle = tokens.text
  gridMark(ctx, MARGIN, 128, 7.4)
  const label = labelInk(tokens)
  ctx.fillStyle = label.color
  mono(ctx, 25, label.bold ? 800 : 500)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('ID · 01', FACE_W - MARGIN + 3, 163)
  ctx.textAlign = 'left'

  const size = fitSize(ctx, 'SANSKAR', FACE_W - MARGIN * 2, 150)
  display(ctx, size)
  ctx.fillStyle = tokens.text
  ctx.fillText('SANSKAR', MARGIN - 4, 430)
  ctx.fillText('RAI', MARGIN - 4, 430 + size * 0.92)

  mono(ctx, 34, label.bold ? 800 : 600)
  ctx.fillStyle = tokens.accentText
  ctx.fillText('@SANSYSASY', MARGIN, 430 + size * 0.92 + 86)

  ctx.fillStyle = tokens.line
  ctx.fillRect(MARGIN, 700, FACE_W - MARGIN * 2, 3)
  mono(ctx, 24, label.bold ? 800 : 600)
  ctx.fillStyle = label.color
  ctx.fillText('PYTHON · CLOUD · D365 INTEGRATION', MARGIN, 752)
  ctx.fillText('MB-310 CERTIFIED', MARGIN, 796)

  foilBand(ctx, FOIL_FRONT.y, FOIL_FRONT.height)
}

function roundel(ctx: CanvasRenderingContext2D, tokens: ThemeTokens) {
  const { x, y, outer, inner } = ROUNDEL
  ctx.strokeStyle = tokens.text
  ctx.lineWidth = 4
  for (const r of [outer, inner]) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  display(ctx, 116)
  ctx.letterSpacing = '-6px'
  ctx.fillStyle = tokens.text
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('SR', x, y + 42)

  // Ring text, one glyph at a time around the band between the circles.
  mono(ctx, 22, 700)
  ctx.letterSpacing = '0px'
  ctx.fillStyle = labelInk(tokens).color
  ctx.textBaseline = 'middle'
  const text = 'SANSKAR RAI · SANSYSASY · SANSKAR RAI · SANSYSASY · '
  const radius = (outer + inner) / 2
  const step = (Math.PI * 2) / text.length
  ;[...text].forEach((char, index) => {
    const angle = -Math.PI / 2 + index * step
    ctx.save()
    ctx.translate(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius)
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

export const QR_PANEL = { x: 218, y: 586, size: 280 }

function qrCode(ctx: CanvasRenderingContext2D, url: string) {
  const qr = encode(url, { ecc: 'M', border: 0 })
  const { x, y, size } = QR_PANEL
  // Dark modules on a light panel in both themes: many scanners cannot read an
  // inverted code. The panel keeps a two-module quiet zone.
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, 12)
  ctx.fill()
  const cell = size / (qr.size + 4)
  ctx.fillStyle = INK
  qr.data.forEach((row, ry) =>
    row.forEach((dark, rx) => {
      if (dark) ctx.fillRect(x + (rx + 2) * cell, y + (ry + 2) * cell, cell + 0.4, cell + 0.4)
    }),
  )
}

export function drawBack(ctx: CanvasRenderingContext2D, tokens: ThemeTokens, url: string) {
  ctx.fillStyle = tokens.surface
  ctx.fillRect(0, 0, FACE_W, FACE_H)
  slot(ctx, tokens)
  roundel(ctx, tokens)
  qrCode(ctx, url)

  const label = labelInk(tokens)
  mono(ctx, 23, label.bold ? 800 : 600)
  ctx.fillStyle = label.color
  ctx.textAlign = 'center'
  ctx.fillText('LINKEDIN · SCAN TO CONNECT', FACE_W / 2, 922)
  ctx.textAlign = 'left'
}

/**
 * The foil as material data, in the same atlas layout: red is iridescence,
 * green roughness and blue metalness, read linearly by the material. Card
 * stock is matte and dielectric; the foil stripe and the roundel ring are
 * polished metal with a thin-film sheen.
 */
function drawSurfaceFace(ctx: CanvasRenderingContext2D, face: 'front' | 'back') {
  ctx.fillStyle = 'rgb(0, 190, 0)'
  ctx.fillRect(0, 0, FACE_W, FACE_H)
  ctx.fillStyle = 'rgb(255, 70, 255)'
  if (face === 'front') {
    ctx.beginPath()
    ctx.roundRect(MARGIN, FOIL_FRONT.y, FACE_W - MARGIN * 2, FOIL_FRONT.height, 8)
    ctx.fill()
  } else {
    const { x, y, outer, inner } = ROUNDEL
    ctx.beginPath()
    ctx.arc(x, y, outer + 2, 0, Math.PI * 2)
    ctx.arc(x, y, inner - 2, 0, Math.PI * 2, true)
    ctx.fill()
  }
}

function paintFace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  face: 'front' | 'back',
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const map = FACE_MAPS[face]
  ctx.save()
  ctx.setTransform(map.a * width, 0, 0, map.d * height, map.e * width, map.f * height)
  draw(ctx)
  ctx.restore()
}

function atlasCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/** Colour atlas for the card: both faces, plus edges in the surface colour. */
export function paintCardAtlas(tokens: ThemeTokens, url: string): HTMLCanvasElement {
  const canvas = atlasCanvas(ATLAS_W, ATLAS_H)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = tokens.surface
  ctx.fillRect(0, 0, ATLAS_W, ATLAS_H)
  paintFace(ctx, ATLAS_W, ATLAS_H, 'front', (c) => drawFront(c, tokens))
  paintFace(ctx, ATLAS_W, ATLAS_H, 'back', (c) => drawBack(c, tokens, url))
  return canvas
}

/** Material atlas (iridescence, roughness, metalness) at half resolution. */
export function paintSurfaceAtlas(): HTMLCanvasElement {
  const width = ATLAS_W / 2
  const height = Math.round(ATLAS_H / 2)
  const canvas = atlasCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = 'rgb(0, 190, 0)'
  ctx.fillRect(0, 0, width, height)
  paintFace(ctx, width, height, 'front', (c) => drawSurfaceFace(c, 'front'))
  paintFace(ctx, width, height, 'back', (c) => drawSurfaceFace(c, 'back'))
  return canvas
}

export const STRAP_W = 1024
export const STRAP_H = 128

/** One repeat of the strap print: the handle and the name on the accent colour. */
export function drawStrap(ctx: CanvasRenderingContext2D, tokens: ThemeTokens) {
  ctx.fillStyle = tokens.accent
  ctx.fillRect(0, 0, STRAP_W, STRAP_H)
  ctx.fillStyle = INK
  mono(ctx, 46, 700)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const square = 12
  ctx.fillText('SANSYSASY', STRAP_W * 0.25, STRAP_H / 2 + 2)
  ctx.fillText('SANSKAR RAI', STRAP_W * 0.75, STRAP_H / 2 + 2)
  for (const x of [0, STRAP_W / 2]) ctx.fillRect(x - square / 2, STRAP_H / 2 - square / 2, square, square)
  ctx.fillRect(STRAP_W - square / 2, STRAP_H / 2 - square / 2, square, square)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

export function paintStrap(tokens: ThemeTokens): HTMLCanvasElement {
  const canvas = atlasCanvas(STRAP_W, STRAP_H)
  const ctx = canvas.getContext('2d')
  if (ctx) drawStrap(ctx, tokens)
  return canvas
}
