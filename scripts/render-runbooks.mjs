// Renders the runbooks in runbooks/*.md to PDFs in public/runbooks/.
//   node scripts/render-runbooks.mjs
// Markdown in, typeset A4 out, through headless Chrome's print-to-PDF, with the
// site's fonts embedded. The PDFs are committed, so the Cloudflare build needs
// no Chrome. Re-run after editing a runbook.
//
// The sources are public along with the rest of this repository: they must
// hold no client name, address, account, identifier or screenshot.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { marked } from 'marked'
import { connect, evaluate, launchChrome } from './lib/cdp.mjs'

const ROOT = join(import.meta.dirname, '..')
const SOURCE = join(ROOT, 'runbooks')
const OUT = join(ROOT, 'public', 'runbooks')
const PORT = 9336
mkdirSync(OUT, { recursive: true })

const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(join(ROOT, 'node_modules', '@fontsource-variable', pkg, 'files', file)).toString('base64')}`

// The modular grid monogram, as in src/ui/Monogram.tsx.
const S_ROWS = ['11111', '10000', '11111', '00001', '11111']
const R_ROWS = ['11110', '10010', '11110', '10100', '10010']
const monogram = [...S_ROWS.map((row, y) => [row, y, 0]), ...R_ROWS.map((row, y) => [row, y, 6])]
  .flatMap(([row, y, offset]) =>
    [...row].map((bit, x) => (bit === '1' ? `<rect x="${x + offset + 0.06}" y="${y + 0.06}" width="0.88" height="0.88"/>` : '')),
  )
  .join('')

/** Splits the leading `--- key: value ---` block from the Markdown body. */
function parse(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source)
  if (!match) throw new Error('runbook is missing its front matter')
  const meta = Object.fromEntries(
    match[1].split(/\r?\n/).map((line) => {
      const at = line.indexOf(':')
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
    }),
  )
  for (const key of ['title', 'subtitle', 'slug']) if (!meta[key]) throw new Error(`front matter needs "${key}"`)
  return { meta, body: match[2] }
}

const STYLE = `
@font-face { font-family: Archivo; font-weight: 100 900; src: url(${font('archivo', 'archivo-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: Inter; font-weight: 100 900; src: url(${font('inter', 'inter-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mono; font-weight: 100 800; src: url(${font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}) format('woff2'); }
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
html { font: 9.6pt/1.5 Inter, system-ui, sans-serif; color: #111; }
body { margin: 0; }
header { border-bottom: 1px solid #d9d7d0; padding-bottom: 14pt; margin-bottom: 16pt; }
header svg { height: 15pt; width: auto; fill: #111; }
header .by { float: right; font: 500 7pt Mono; letter-spacing: 0.14em; text-transform: uppercase; color: #5f5f5a; margin-top: 4pt; }
h1 { font: 800 23pt/1.02 Archivo; letter-spacing: -0.02em; margin: 16pt 0 6pt; }
.subtitle { font: 600 7.4pt Mono; letter-spacing: 0.14em; text-transform: uppercase; color: #bd3e0c; margin: 0; }
h2 { font: 800 13.5pt/1.1 Archivo; letter-spacing: -0.01em; margin: 20pt 0 6pt; padding-top: 9pt; border-top: 1px solid #d9d7d0; break-after: avoid; }
h3 { font: 700 10.4pt/1.2 Archivo; margin: 13pt 0 4pt; break-after: avoid; }
header + h2 { border-top: 0; padding-top: 0; margin-top: 0; }
p { margin: 0 0 7pt; }
ul, ol { margin: 0 0 8pt; padding-left: 15pt; }
li { margin-bottom: 2.5pt; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 8.6pt; break-inside: avoid; }
th { font: 600 6.6pt Mono; letter-spacing: 0.12em; text-transform: uppercase; color: #5f5f5a; text-align: left; border-bottom: 1px solid #111; padding: 4pt 6pt 4pt 0; }
td { border-bottom: 1px solid #d9d7d0; padding: 4pt 6pt 4pt 0; vertical-align: top; }
code { font: 8pt Mono; background: #f1efe9; padding: 0.5pt 2.5pt; border-radius: 2pt; }
pre { font: 7.5pt/1.5 Mono; background: #f6f5f1; border: 1px solid #d9d7d0; border-radius: 4pt; padding: 8pt 9pt; margin: 6pt 0 10pt; white-space: pre-wrap; overflow-wrap: anywhere; }
pre code { background: none; padding: 0; font: inherit; }
blockquote { margin: 7pt 0 9pt; padding: 6pt 10pt; border-left: 2.5pt solid #ea5f18; background: #f6f5f1; break-inside: avoid; }
blockquote p { margin: 0; }
strong { font-weight: 650; }
`

function page({ meta, body }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${meta.title}</title><style>${STYLE}</style></head><body>
<header>
  <svg viewBox="0 0 11 5" role="img" aria-label="SR">${monogram}</svg>
  <span class="by">Sanskar Rai · sansysasy.com</span>
  <h1>${meta.title}</h1>
  <p class="subtitle">${meta.subtitle}</p>
</header>
${marked.parse(body)}
</body></html>`
}

const FOOTER = `<div style="width:100%; font-size:7px; font-family:monospace; color:#777; padding:0 16mm; display:flex; justify-content:space-between;">
  <span>Sanskar Rai · sansysasy.com</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`

const chrome = launchChrome({ port: PORT, userDataDir: join(tmpdir(), 'portfolio-runbooks-profile') })
let cdp
try {
  cdp = await connect(PORT)
  await cdp.send('Page.enable')
  const { frameTree } = await cdp.send('Page.getFrameTree')

  for (const file of readdirSync(SOURCE).filter((name) => name.endsWith('.md')).sort()) {
    const runbook = parse(readFileSync(join(SOURCE, file), 'utf8'))
    await cdp.send('Page.setDocumentContent', { frameId: frameTree.frame.id, html: page(runbook) })
    await evaluate(cdp, `await document.fonts.ready; return true`)
    await sleep(150)
    const { data } = await cdp.send('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: FOOTER,
    })
    const pdf = Buffer.from(data, 'base64')
    writeFileSync(join(OUT, `${runbook.meta.slug}.pdf`), pdf)
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length
    console.log(`${runbook.meta.slug}.pdf  ${pages} pages  ${Math.round(pdf.length / 1024)} KB`)
  }
} finally {
  cdp?.close()
  chrome.kill()
}
