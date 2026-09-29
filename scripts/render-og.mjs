// Renders the Open Graph card to public/og.png with headless Chrome.
//   node scripts/render-og.mjs
// The card is plain HTML built here, with the site's fonts embedded as data
// URIs (a file:// page cannot load fonts from disk), in the dark theme's
// tokens. Re-run it after changing the name, the role line or the palette.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { setTimeout as sleep } from 'node:timers/promises'
import { connect, evaluate, launchChrome } from './lib/cdp.mjs'

const ROOT = join(import.meta.dirname, '..')
const OUT = join(ROOT, 'public', 'og.png')
const PORT = 9335
const W = 1200
const H = 630

const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(join(ROOT, 'node_modules', '@fontsource-variable', pkg, 'files', file)).toString('base64')}`

// Dark theme tokens, from src/styles/globals.css.
const T = {
  bg: '#0a0a0b',
  line: '#262629',
  text: '#f2f2f0',
  muted: '#9b9b9b',
  accentText: '#ff8a5b',
  thermal: ['#1b1f8a', '#7a1fa2', '#c2189a', '#ff6f37', '#ffd166'],
}

// The modular grid monogram, as in src/ui/Monogram.tsx.
const S_ROWS = ['11111', '10000', '11111', '00001', '11111']
const R_ROWS = ['11110', '10010', '11110', '10100', '10010']
const monogram = [...S_ROWS.map((row, y) => [row, y, 0]), ...R_ROWS.map((row, y) => [row, y, 6])]
  .flatMap(([row, y, offset]) =>
    [...row].map((bit, x) => (bit === '1' ? `<rect x="${x + offset + 0.06}" y="${y + 0.06}" width="0.88" height="0.88"/>` : '')),
  )
  .join('')

// A strip of the heat map's squares along the foot, weekdays heavy and
// weekends light, climbing left to right. Seeded, so the card never changes.
let seed = 26000
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const COLS = 60
const ROWS = 7
const CELL = 14
const GAP = 4
const strip = []
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const weekend = r >= 5
    const ramp = 0.35 + (c / COLS) * 0.75
    const v = (weekend ? 0.15 : 1) * ramp * (0.55 + random() * 0.7)
    const level = Math.max(0, Math.min(4, Math.floor(v * 4.2)))
    strip.push(`<rect x="${c * (CELL + GAP)}" y="${r * (CELL + GAP)}" width="${CELL}" height="${CELL}" rx="2.5" fill="${T.thermal[level]}"/>`)
  }
}
const stripWidth = COLS * (CELL + GAP) - GAP
const stripHeight = ROWS * (CELL + GAP) - GAP

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; font-weight: 100 900; src: url(${font('archivo', 'archivo-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mono; font-weight: 100 800; src: url(${font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; background: ${T.bg}; color: ${T.text}; overflow: hidden; }
.card { position: relative; width: ${W}px; height: ${H}px; padding: 64px 72px; }
.top { display: flex; justify-content: space-between; align-items: center; }
.label { font: 500 18px Mono; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.muted}; }
h1 { margin-top: 70px; font: 800 132px/0.9 Archivo; letter-spacing: -0.03em; text-transform: uppercase; }
.role { margin-top: 34px; font: 600 23px Mono; letter-spacing: 0.12em; text-transform: uppercase; color: ${T.accentText}; }
.strip { position: absolute; left: 72px; bottom: 64px; opacity: 0.9; }
.handle { position: absolute; right: 72px; bottom: 64px; text-align: right; }
.rule { position: absolute; left: 72px; right: 72px; top: 118px; height: 1px; background: ${T.line}; }
</style></head><body><div class="card">
  <div class="top">
    <svg viewBox="0 0 11 5" width="88" height="40" fill="${T.text}">${monogram}</svg>
    <span class="label">sansysasy.com</span>
  </div>
  <div class="rule"></div>
  <h1>Sanskar Rai</h1>
  <p class="role">Python Engineer · Cloud &amp; DevOps · Dynamics 365 Integration</p>
  <svg class="strip" width="${Math.round(stripWidth * 0.62)}" height="${Math.round(stripHeight * 0.62)}" viewBox="0 0 ${stripWidth} ${stripHeight}">${strip.join('')}</svg>
  <div class="handle"><p class="label">@SansySasy</p><p class="label" style="margin-top:10px">Remote · Delhi</p></div>
</div></body></html>`

const chrome = launchChrome({ port: PORT, userDataDir: join(tmpdir(), 'portfolio-og-profile'), windowSize: `${W},${H}` })
let cdp
try {
  cdp = await connect(PORT)
  await cdp.send('Page.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  const { frameTree } = await cdp.send('Page.getFrameTree')
  await cdp.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html })
  await evaluate(cdp, `await document.fonts.ready; return document.fonts.check('800 132px Archivo') && document.fonts.check('600 23px Mono')`)
  await sleep(200)
  const fits = await evaluate(cdp, `const h = document.querySelector('h1'); const r = document.querySelector('.role');
    return { name: h.scrollWidth <= ${W - 144}, role: r.scrollWidth <= ${W - 144} && r.getClientRects().length === 1 }`)
  if (!fits.name || !fits.role) throw new Error(`text does not fit: ${JSON.stringify(fits)}`)
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })
  writeFileSync(OUT, Buffer.from(data, 'base64'))
  console.log(`wrote ${OUT}`)
} finally {
  cdp?.close()
  chrome.kill()
}
