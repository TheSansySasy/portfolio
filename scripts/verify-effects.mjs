// Headless verification of the Phase 3 effects, driven over the Chrome DevTools
// Protocol with Node's built-in WebSocket. No dependencies.
//   pnpm build && pnpm preview        (serves dist on :4173)
//   node scripts/verify-effects.mjs [outDir] [baseUrl]
// Chrome comes from CHROME_PATH, defaulting to the standard Windows install.
// Writes report.json and screenshots to outDir, by default the OS temp folder.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const OUT = process.argv[2] ?? join(tmpdir(), 'portfolio-verify')
const BASE = process.argv[3] ?? 'http://localhost:4173/'
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333
mkdirSync(OUT, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${join(OUT, 'chrome-profile')}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
const killTimer = setTimeout(() => {
  console.error('TIMEOUT after 240s')
  chrome.kill()
  process.exit(2)
}, 240_000)

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url)
    this.nextId = 0
    this.pending = new Map()
    this.listeners = []
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve
      this.ws.onerror = reject
    })
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      } else if (msg.method) {
        for (const fn of this.listeners) fn(msg)
      }
    }
  }
  send(method, params = {}) {
    const id = ++this.nextId
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }
  on(fn) {
    this.listeners.push(fn)
  }
}

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = targets.find((t) => t.type === 'page')
      if (page) {
        const cdp = new Cdp(page.webSocketDebuggerUrl)
        await cdp.open()
        return cdp
      }
    } catch {
      // Chrome still starting
    }
    await sleep(250)
  }
  throw new Error('Could not reach headless Chrome')
}

const report = {}
const errors = []

async function evaluate(cdp, body) {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression: `(async () => { ${body} })()`,
    awaitPromise: true,
    returnByValue: true,
  })
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  }
  return result.value
}

async function shot(cdp, name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
}

async function load(cdp, url) {
  const loaded = new Promise((resolve) =>
    cdp.on((m) => {
      if (m.method === 'Page.loadEventFired') resolve()
    }),
  )
  await cdp.send('Page.navigate', { url })
  await loaded
  await sleep(700)
}

async function media(cdp, scheme, motion) {
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: scheme },
      { name: 'prefers-reduced-motion', value: motion },
    ],
  })
}

const HERO_ROW = `document.querySelector('.pressure-row')`
const ROLE = `document.querySelector('#top p.mono-label.text-accent-text span[aria-hidden]')`
const FINE = `matchMedia('(pointer: fine) and (hover: hover) and (min-width: 768px)').matches`

let cdp
try {
  cdp = await connect()
  cdp.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails
      errors.push(`exception: ${d.exception?.description ?? d.text}`)
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(`console: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`)
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      errors.push(`log: ${m.params.entry.text} ${m.params.entry.url ?? ''}`)
    }
  })
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')

  // ---- Desktop, dark ------------------------------------------------------
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await media(cdp, 'dark', 'no-preference')
  await load(cdp, BASE)
  await sleep(2600)

  report.desktopHero = await evaluate(
    cdp,
    `const row = ${HERO_ROW}; const role = ${ROLE};
     return {
       fontPx: getComputedStyle(row).fontSize,
       restOverflowPx: row.scrollWidth - row.clientWidth,
       roleSettledOnRealText: role.textContent === role.previousElementSibling.textContent,
       lenisActive: document.documentElement.classList.contains('lenis'),
       fineDesktop: ${FINE},
       webgl2: !!document.createElement('canvas').getContext('webgl2'),
       heroFontFamily: getComputedStyle(document.querySelector('.pressure-name')).fontFamily,
       pressureFontLoaded: [...document.fonts].some(f => f.family.replace(/["']/g, '') === 'Archivo Pressure' && f.status === 'loaded'),
       widthFontRequested: performance.getEntriesByType('resource').some(e => e.name.includes('archivo-latin-wdth')),
     }`,
  )
  await shot(cdp, '01-desktop-dark-hero')

  const rowBox = await evaluate(
    cdp,
    `const r = ${HERO_ROW}.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }`,
  )
  report.desktopPressure = {}
  for (const [label, fx] of [
    ['left', 0.08],
    ['centre', 0.5],
    ['right', 0.92],
  ]) {
    const x = rowBox.x + rowBox.w * fx
    const y = rowBox.y + rowBox.h / 2
    for (let i = 0; i < 6; i++) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + i, y })
      await sleep(30)
    }
    await sleep(1000)
    report.desktopPressure[label] = await evaluate(
      cdp,
      `const row = ${HERO_ROW}; const chars = [...row.querySelectorAll('.pressure-char')]; const r = row.getBoundingClientRect();
       return {
         overflowPx: row.scrollWidth - row.clientWidth,
         rightEdgePastColumnPx: Math.round(Math.max(...chars.map(c => c.getBoundingClientRect().right)) - r.right),
         weights: chars.map(c => (c.style.fontVariationSettings.match(/["']wght["'] (\\d+)/) || [])[1]).join(' '),
       }`,
    )
    if (label === 'centre') await shot(cdp, '02-desktop-dark-hero-pressed-centre')
  }
  await evaluate(
    cdp,
    `document.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: null })); return true`,
  )
  await sleep(1600)
  report.desktopPressureAfterPointerLeaves = await evaluate(
    cdp,
    `return [...document.querySelectorAll('.pressure-char')].map(c => (c.style.fontVariationSettings.match(/["']wght["'] (\\d+)/) || [])[1]).join(' ')`,
  )

  const pageHeight = await evaluate(cdp, `return document.documentElement.scrollHeight`)
  for (let y = 0; y < pageHeight; y += 600) {
    await evaluate(cdp, `window.scrollTo(0, ${y}); return true`)
    await sleep(350)
  }
  await sleep(1300)
  report.desktopReveals = await evaluate(
    cdp,
    `return {
       headingsStillWaiting: [...document.querySelectorAll('.split-heading')].filter(h => !h.classList.contains('is-in')).map(h => h.id),
       revealsStillWaiting: [...document.querySelectorAll('.reveal')].filter(r => !r.classList.contains('is-in')).length,
       totalReveals: document.querySelectorAll('.reveal').length,
     }`,
  )

  await evaluate(cdp, `document.getElementById('stack').scrollIntoView({ block: 'start' }); return true`)
  await sleep(3200)
  report.desktopSphere = await evaluate(
    cdp,
    `const canvas = document.querySelector('#stack canvas'); const gl = canvas && canvas.getContext('webgl2');
     return {
       mounted: !!canvas,
       contextAlive: gl ? !gl.isContextLost() : null,
       backingPx: canvas ? [canvas.width, canvas.height] : null,
       overlay: canvas ? [...canvas.parentElement.querySelectorAll('p')].map(p => p.textContent) : null,
       listItems: document.querySelectorAll('#stack dt').length,
     }`,
  )
  await shot(cdp, '03-desktop-dark-stack')

  const centre = await evaluate(
    cdp,
    `const c = document.querySelector('#stack canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }`,
  )
  if (centre) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: centre.x,
      y: centre.y,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    })
    for (let i = 1; i <= 14; i++) {
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: centre.x - i * 20,
        y: centre.y + i * 5,
        button: 'left',
        buttons: 1,
      })
      await sleep(16)
    }
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: centre.x - 280,
      y: centre.y + 70,
      button: 'left',
      buttons: 0,
      clickCount: 1,
    })
    await sleep(2600)
    report.desktopSphereAfterDrag = await evaluate(
      cdp,
      `return [...document.querySelector('#stack canvas').parentElement.querySelectorAll('p')].map(p => p.textContent)`,
    )
    await shot(cdp, '04-desktop-dark-stack-after-drag')
  }

  await evaluate(cdp, `document.getElementById('numbers').scrollIntoView({ block: 'start' }); return true`)
  await sleep(2400)
  report.desktopFigures = await evaluate(
    cdp,
    `return [...document.querySelectorAll('#numbers li span.tabular-nums')].map(s => {
       const shown = s.querySelector('span.absolute').textContent; const real = s.querySelector('.sr-only').textContent;
       return shown === real ? real : 'MISMATCH ' + shown + ' vs ' + real })`,
  )
  const band = await evaluate(
    cdp,
    `const r = document.querySelector('#numbers .magnet-line').parentElement.getBoundingClientRect(); return { x: r.left + r.width * 0.3, y: r.top + r.height / 2 }`,
  )
  for (let i = 0; i < 6; i++) {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: band.x + i * 12, y: band.y })
    await sleep(40)
  }
  await sleep(300)
  report.desktopMagnet = await evaluate(
    cdp,
    `const lines = [...document.querySelectorAll('#numbers .magnet-line')];
     return { lines: lines.length, distinctAngles: new Set(lines.map(l => l.style.getPropertyValue('--rotate'))).size }`,
  )
  await shot(cdp, '05-desktop-dark-numbers')

  // Dossier overlay: smooth scroll must pause, and the wheel must scroll the panel.
  await evaluate(cdp, `location.hash = '#work/ai-document-platform'; return true`)
  await sleep(700)
  const beforeWheel = await evaluate(
    cdp,
    `const d = document.querySelector('[role=dialog]');
     return { open: !!d, lenisPrevent: d ? d.hasAttribute('data-lenis-prevent') : null, lenisStopped: document.documentElement.classList.contains('lenis-stopped'), pageScrollY: Math.round(scrollY) }`,
  )
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 720,
    y: 500,
    deltaX: 0,
    deltaY: 900,
  })
  await sleep(700)
  const afterWheel = await evaluate(
    cdp,
    `const d = document.querySelector('[role=dialog]'); return { panelScrollTop: Math.round(d.scrollTop), pageScrollY: Math.round(scrollY) }`,
  )
  await evaluate(
    cdp,
    `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true`,
  )
  await sleep(600)
  const afterClose = await evaluate(
    cdp,
    `return { open: !!document.querySelector('[role=dialog]'), lenisStopped: document.documentElement.classList.contains('lenis-stopped') }`,
  )
  report.desktopDossier = { beforeWheel, afterWheel, afterClose }

  // In-page link: smooth scroll lands under the nav and moves focus.
  await evaluate(cdp, `window.scrollTo(0, 0); return true`)
  await sleep(600)
  await evaluate(cdp, `document.querySelector('header a[href="#contact"]').click(); return true`)
  await sleep(2400)
  report.desktopAnchor = await evaluate(
    cdp,
    `const t = document.getElementById('contact');
     return { hash: location.hash, contactTopPx: Math.round(t.getBoundingClientRect().top), focusMovedToSection: document.activeElement === t }`,
  )

  // ---- Desktop, light ------------------------------------------------------
  await evaluate(cdp, `document.documentElement.dataset.theme = 'light'; window.scrollTo(0, 0); return true`)
  await sleep(900)
  await shot(cdp, '06-desktop-light-hero')
  await evaluate(cdp, `document.getElementById('stack').scrollIntoView({ block: 'start' }); return true`)
  await sleep(2000)
  await shot(cdp, '07-desktop-light-stack')
  report.desktopLightSphere = await evaluate(
    cdp,
    `const canvas = document.querySelector('#stack canvas'); const gl = canvas && canvas.getContext('webgl2');
     return { mounted: !!canvas, contextAlive: gl ? !gl.isContextLost() : null }`,
  )

  // ---- Deep link straight into a section -----------------------------------
  // The query string forces a full load; a hash-only change would not fire one.
  await evaluate(cdp, `document.documentElement.removeAttribute('data-theme'); return true`)
  await load(cdp, `${BASE}?deeplink=1#contact`)
  await sleep(1500)
  report.deepLink = await evaluate(
    cdp,
    `const t = document.getElementById('contact');
     return {
       sectionsMounted: document.querySelectorAll('main > section').length,
       contactTopPx: t ? Math.round(t.getBoundingClientRect().top) : null,
       navActive: document.querySelector('header nav [aria-current="true"]')?.textContent ?? null,
       footer: !!document.querySelector('footer'),
     }`,
  )

  // ---- Progressive mount on a plain load ------------------------------------
  await load(cdp, `${BASE}?plain=1`)
  await sleep(1200)
  report.progressiveMount = await evaluate(
    cdp,
    `return { sectionsMounted: document.querySelectorAll('main > section').length, footer: !!document.querySelector('footer'), navLinks: document.querySelectorAll('header nav a').length }`,
  )

  // ---- Reduced motion ------------------------------------------------------
  await evaluate(cdp, `document.documentElement.removeAttribute('data-theme'); return true`)
  // Leave the page before changing the emulated preference, so the next
  // document is styled with reduced motion from its very first frame.
  await load(cdp, 'about:blank')
  await media(cdp, 'dark', 'reduce')
  const widthFontRequests = []
  await cdp.send('Network.enable')
  cdp.on((m) => {
    if (m.method === 'Network.requestWillBeSent' && m.params.request.url.includes('wdth')) {
      const init = m.params.initiator ?? {}
      widthFontRequests.push({
        document: m.params.documentURL,
        type: m.params.type,
        initiator: init.type,
        from: init.url ?? init.stack?.callFrames?.[0]?.url ?? null,
      })
    }
  })
  await load(cdp, `${BASE}?reduced=1`)
  await sleep(900)
  report.reducedMotionWidthFontRequests = [...widthFontRequests]
  report.reducedMotion = await evaluate(
    cdp,
    `const lower = document.querySelector('#numbers .reveal'); const word = document.querySelector('#numbers .split-word'); const role = ${ROLE};
     return {
       lowerRevealOpacity: getComputedStyle(lower).opacity,
       headingWordTranslate: getComputedStyle(word).translate,
       roleText: role.textContent,
       lenisActive: document.documentElement.classList.contains('lenis'),
       sphereMounted: !!document.querySelector('#stack canvas'),
       firstFigureShown: document.querySelector('#numbers li span.tabular-nums span.absolute').textContent,
       heroLetter: getComputedStyle(document.querySelector('.pressure-char')).fontVariationSettings,
       widthFontRequested: performance.getEntriesByType('resource').some(e => e.name.includes('wdth')),
       matchesReduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
       heroFontFamily: getComputedStyle(document.querySelector('.pressure-name')).fontFamily,
       pressureFaceStatus: [...document.fonts].filter(f => f.family.replace(/["']/g, '') === 'Archivo Pressure').map(f => f.status).join(','),
     }`,
  )

  // ---- Mobile, touch ------------------------------------------------------
  // Emulate on a blank page, so the phone document never sees a desktop frame.
  // Navigating straight from the desktop page reported the width font as
  // loaded on a phone, which clean loads (Lighthouse's included) never do.
  await load(cdp, 'about:blank')
  await media(cdp, 'dark', 'no-preference')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  const mobileRequestsFrom = widthFontRequests.length
  await load(cdp, `${BASE}?mobile=1`)
  await sleep(1600)
  report.mobile = await evaluate(
    cdp,
    `const row = ${HERO_ROW};
     return {
       fontPx: getComputedStyle(row).fontSize,
       heroRestOverflowPx: row.scrollWidth - row.clientWidth,
       pageSidewaysOverflowPx: document.documentElement.scrollWidth - innerWidth,
       fineDesktop: ${FINE},
       sphereMounted: !!document.querySelector('#stack canvas'),
       stackListItems: document.querySelectorAll('#stack dt').length,
       widthFontRequested: performance.getEntriesByType('resource').some(e => e.name.includes('wdth')),
       weightFontRequested: performance.getEntriesByType('resource').some(e => e.name.includes('archivo-latin-wght')),
     }`,
  )
  report.mobileWidthFontRequests = widthFontRequests.slice(mobileRequestsFrom)
  await shot(cdp, '08-mobile-dark-hero')
} catch (error) {
  report.fatal = String(error?.stack ?? error)
} finally {
  report.consoleErrors = errors
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  clearTimeout(killTimer)
  try {
    cdp?.ws.close()
  } catch {
    // already closed
  }
  chrome.kill()
}
