// Headless verification of the site's effects, driven over the Chrome DevTools
// Protocol with Node's built-in WebSocket. No dependencies.
//   pnpm build && pnpm preview        (serves dist on :4173)
//   node scripts/verify-effects.mjs [outDir] [baseUrl]
// Chrome comes from CHROME_PATH, defaulting to the standard Windows install.
// Writes report.json and screenshots to outDir, by default the OS temp folder.
//
// Every navigation, evaluation and protocol call has its own timeout, and the
// overall guard (VERIFY_TIMEOUT_MS, default 8 minutes) writes a partial report
// naming the stage it stopped in. A stuck step can no longer end a run silently.
//
// WebGL runs on the machine's GPU. SwiftShader, the software fallback, draws
// the lanyard's physically based card at a few frames a second, which slows
// its simulation to a crawl; set VERIFY_SWIFTSHADER=1 to use it anyway.
// Draw calls (WebGL) and fills (2D canvas) are counted from page start, which
// is how the checks tell that an effect's loop has stopped at rest.
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { connect, evaluate, launchChrome, navigate } from './lib/cdp.mjs'

const OUT = process.argv[2] ?? join(tmpdir(), 'portfolio-verify')
const BASE = process.argv[3] ?? 'http://localhost:4173/'
const PORT = 9333
const GUARD_MS = Number(process.env.VERIFY_TIMEOUT_MS ?? 480_000)
mkdirSync(OUT, { recursive: true })

const report = {}
const errors = []
let stage = 'starting Chrome'

function writeReport() {
  report.consoleErrors = errors
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2))
}

const chrome = launchChrome({
  port: PORT,
  userDataDir: join(OUT, 'chrome-profile'),
  gpu: process.env.VERIFY_SWIFTSHADER !== '1',
})
const guard = setTimeout(() => {
  report.fatal = `overall guard of ${Math.round(GUARD_MS / 1000)}s ran out during: ${stage}`
  writeReport()
  console.error(report.fatal)
  chrome.kill()
  process.exit(2)
}, GUARD_MS)

async function shot(cdp, name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
}

async function load(cdp, url) {
  await navigate(cdp, url)
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

// Injected before any page script: counts WebGL draw calls and 2D fills.
const COUNTERS = `(() => {
  window.__draws = 0
  window.__fills = 0
  for (const C of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
    if (!C) continue
    for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      const original = C.prototype[name]
      if (original) C.prototype[name] = function (...args) { window.__draws++; return original.apply(this, args) }
    }
  }
  const fill = CanvasRenderingContext2D.prototype.fill
  CanvasRenderingContext2D.prototype.fill = function (...args) { window.__fills++; return fill.apply(this, args) }
})()`

/** Waits until a page counter stops changing for a full second; returns seconds waited, or null. */
async function waitForQuiet(cdp, counter, limitMs) {
  const started = Date.now()
  let last = await evaluate(cdp, `return window.${counter}`)
  let quietSince = Date.now()
  while (Date.now() - started < limitMs) {
    await sleep(250)
    const now = await evaluate(cdp, `return window.${counter}`)
    if (now !== last) {
      last = now
      quietSince = Date.now()
    } else if (Date.now() - quietSince >= 1000) {
      return Math.round((Date.now() - started) / 100) / 10
    }
  }
  return null
}

/** Sets a React-controlled input or select the way typing would. */
function setField(id, value) {
  return `const el = document.getElementById('${id}');
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, '${value}');
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));`
}

// Where the Phase 4 effects must not run (reduced motion, phones): each piece's
// static form is what shows.
const PHASE4_FALLBACKS = `
  lanyardSlot: !!document.querySelector('#about .lanyard-slot'),
  lanyardCanvas: !!document.querySelector('[data-lanyard]'),
  staticBadgeVisible: !!document.querySelector('#about .rounded-xl') && !document.querySelector('#about .sr-only'),
  particleCanvas: !!document.querySelector('#contact-heading canvas'),
  contactHeadingColour: getComputedStyle(document.querySelector('#contact-heading .split-word')).color,
  failoverSim: !!document.querySelector('#ops [aria-live="polite"]'),
  failoverPulsesShown: [...document.querySelectorAll('#ops .sim-pulse')].filter(p => getComputedStyle(p).display !== 'none').length,
  heatMapDays: document.querySelectorAll('#numbers svg[aria-label^="Heat map"] rect').length,`

const LANYARD_CHUNK =`performance.getEntriesByType('resource').some(e => /\\/Lanyard-[^/]*\\.js/.test(e.name))`

const HERO_ROW = `document.querySelector('.pressure-row')`
const ROLE = `document.querySelector('#top p.mono-label.text-accent-text span[aria-hidden]')`
const FINE = `matchMedia('(pointer: fine) and (hover: hover) and (min-width: 768px)').matches`

let cdp
try {
  stage = 'connecting to Chrome'
  cdp = await connect(PORT)
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
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: COUNTERS })

  // ---- Desktop, dark ------------------------------------------------------
  stage = 'desktop dark: loading'
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await media(cdp, 'dark', 'no-preference')
  await load(cdp, BASE)
  await sleep(2600)

  stage = 'desktop dark: hero'
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
       lanyardChunkBeforeAnyInput: ${LANYARD_CHUNK},
     }`,
  )
  await shot(cdp, '01-desktop-dark-hero')

  stage = 'desktop dark: hero pressure'
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

  stage = 'desktop dark: scrolling the page'
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

  stage = 'desktop dark: stack sphere'
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

  stage = 'desktop dark: numbers'
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

  stage = 'desktop dark: heat map'
  report.desktopHeatMap = await evaluate(
    cdp,
    `const svg = document.querySelector('#numbers svg[aria-label^="Heat map"]');
     const cells = svg ? [...svg.querySelectorAll('rect')] : [];
     return {
       present: !!svg,
       days: cells.length,
       levels: new Set(cells.map(c => c.getAttribute('class'))).size,
       filled: cells.filter(c => getComputedStyle(c).fill !== 'none' && getComputedStyle(c).fill !== 'rgb(0, 0, 0)').length,
       labelSaysIllustrative: svg ? /illustrative/.test(svg.getAttribute('aria-label')) : false,
     }`,
  )
  await evaluate(cdp, `document.querySelector('#numbers svg[aria-label^="Heat map"]').scrollIntoView({ block: 'center' }); return true`)
  await sleep(500)
  await shot(cdp, '05b-desktop-dark-heat-map')

  // ---- Failover simulation ----------------------------------------------------
  stage = 'desktop dark: failover simulation'
  await evaluate(cdp, `document.getElementById('ops').scrollIntoView({ block: 'start' }); return true`)
  await sleep(900)
  const OPS_STATE = `const live = document.querySelector('#ops [aria-live="polite"]');
    const svg = document.querySelector('#ops svg[role="img"]');
    const texts = [...svg.querySelectorAll('text')].map(t => t.textContent);
    return {
      status: live.textContent,
      listener: texts.find(t => t.startsWith('routes to') || t.startsWith('waiting')),
      nodes: texts.filter(t => t.startsWith('Node 0')),
      quorum: texts.includes('2 of 3 votes: quorum held'),
      buttons: [...document.querySelectorAll('#ops button')].map(b => b.textContent + (b.disabled ? ' (disabled)' : '')),
      pulses: svg.querySelectorAll('.sim-pulse').length,
    }`
  const click = (label) =>
    evaluate(cdp, `[...document.querySelectorAll('#ops button')].find(b => b.textContent === ${JSON.stringify(label)}).click(); return true`)
  const failover = { initial: await evaluate(cdp, OPS_STATE) }
  await click('Fail the primary')
  await sleep(300)
  failover.detecting = await evaluate(cdp, OPS_STATE)
  await shot(cdp, '05c-desktop-dark-failover-detecting')
  await sleep(1800)
  failover.electing = await evaluate(cdp, OPS_STATE)
  await sleep(1300)
  failover.failedOver = await evaluate(cdp, OPS_STATE)
  await shot(cdp, '05d-desktop-dark-failover-done')
  await click('Bring node 01 back')
  await sleep(300)
  failover.resyncing = await evaluate(cdp, OPS_STATE)
  await sleep(1900)
  failover.rejoined = await evaluate(cdp, OPS_STATE)
  await click('Planned failover')
  await sleep(1500)
  failover.planned = await evaluate(cdp, OPS_STATE)
  await click('Reset')
  await sleep(200)
  failover.reset = await evaluate(cdp, OPS_STATE)
  report.desktopFailover = failover

  // ---- About lanyard ----------------------------------------------------------
  // The hero checks above moved the mouse, which counts as interaction, and the
  // page scroll passed About, so the chunk should be loading or loaded by now.
  stage = 'desktop dark: lanyard'
  await evaluate(cdp, `document.getElementById('about').scrollIntoView({ block: 'start' }); return true`)
  const slotBefore = await evaluate(cdp, `return Math.round(document.querySelector('#about .lanyard-slot')?.getBoundingClientRect().height ?? -1)`)
  let lanyardState = 'none'
  for (let i = 0; i < 60 && lanyardState !== 'live'; i++) {
    await sleep(250)
    lanyardState = await evaluate(cdp, `return document.querySelector('[data-lanyard]')?.dataset.lanyard ?? 'none'`)
  }
  const restSeconds = await waitForQuiet(cdp, '__draws', 20_000)
  const lanyard = await evaluate(
    cdp,
    `const wrap = document.querySelector('[data-lanyard]'); const canvas = wrap?.querySelector('canvas'); const r = canvas?.getBoundingClientRect();
     return {
       state: wrap?.dataset.lanyard ?? 'none',
       canvasPx: r ? [Math.round(r.width), Math.round(r.height)] : null,
       canvasHidden: canvas ? canvas.closest('[aria-hidden="true"]') !== null || canvas.getAttribute('aria-hidden') === 'true' : null,
       staticBadgeKeptForScreenReaders: !!document.querySelector('#about .sr-only') && /Sanskar/.test(document.querySelector('#about .sr-only').textContent),
       slotHeightAfter: Math.round(document.querySelector('#about .lanyard-slot').getBoundingClientRect().height),
       chunkAndModel: performance.getEntriesByType('resource').filter(e => /Lanyard-|card-.*\\.glb/.test(e.name)).map(e => e.name.split('/').pop()),
     }`,
  )
  lanyard.slotHeightBefore = slotBefore
  lanyard.secondsToRest = restSeconds
  await shot(cdp, '05e-desktop-dark-lanyard')

  const box = await evaluate(cdp, `const r = document.querySelector('[data-lanyard] canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }`)
  // The card's centre hangs about two thirds of the way down the canvas.
  const grab = { x: box.x + box.w / 2, y: box.y + box.h * 0.66 }
  const drawsBeforeDrag = await evaluate(cdp, `return window.__draws`)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: grab.x, y: grab.y })
  await sleep(100)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: grab.x, y: grab.y, button: 'left', buttons: 1, clickCount: 1 })
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: grab.x - i * 12, y: grab.y - i * 6, button: 'left', buttons: 1 })
    await sleep(16)
  }
  lanyard.cursorWhileHeld = await evaluate(cdp, `return document.body.style.cursor`)
  await shot(cdp, '05f-desktop-dark-lanyard-held')
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: grab.x - 120, y: grab.y - 60, button: 'left', buttons: 0, clickCount: 1 })
  lanyard.drawsDuringDrag = (await evaluate(cdp, `return window.__draws`)) - drawsBeforeDrag
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 200, y: grab.y })
  lanyard.secondsToRestAfterDrag = await waitForQuiet(cdp, '__draws', 20_000)
  lanyard.cursorAfter = await evaluate(cdp, `return document.body.style.cursor`)
  report.desktopLanyard = lanyard

  // ---- Contact particle heading ------------------------------------------------
  stage = 'desktop dark: particle heading'
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1400, y: 880 })
  await evaluate(cdp, `document.getElementById('contact').scrollIntoView({ block: 'start' }); return true`)
  await sleep(2500)
  const INK =`const c = document.querySelector('#contact-heading canvas.particle-canvas'); if (!c) return null;
    const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height); let ink = 0, sig = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) { ink++; sig = (sig + i * 31) % 1000000007 }
    return { ink, sig }`
  const particles = await evaluate(
    cdp,
    `const h = document.getElementById('contact-heading'); const word = h.querySelector('.split-word');
     return {
       live: h.dataset.particles === 'live',
       canvas: !!h.querySelector('canvas.particle-canvas[aria-hidden="true"]'),
       wordColour: getComputedStyle(word).color,
       accessibleText: h.textContent,
     }`,
  )
  particles.rest = await evaluate(cdp, INK)
  const headingBox = await evaluate(cdp, `const r = document.querySelector('#contact-heading .split-word').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }`)
  for (let i = 0; i < 8; i++) {
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: headingBox.x - 40 + i * 10, y: headingBox.y })
    await sleep(30)
  }
  await sleep(120)
  particles.disturbed = await evaluate(cdp, INK)
  await shot(cdp, '05g-desktop-dark-particles-disturbed')
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1400, y: 880 })
  particles.secondsToRest = await waitForQuiet(cdp, '__fills', 10_000)
  particles.home = await evaluate(cdp, INK)
  particles.returnedHome = particles.home?.sig === particles.rest?.sig
  report.desktopParticles = particles
  await shot(cdp, '05h-desktop-dark-contact')

  // Dossier overlay: smooth scroll must pause, and the wheel must scroll the panel.
  stage = 'desktop dark: dossier overlay'
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

  // Token cost calculator: defaults, then a changed volume.
  stage = 'desktop dark: token calculator'
  const TOKEN_OUT = `const o = document.querySelector('[role=dialog] output[for^="tok-docs"]');
    return o ? [...o.querySelectorAll('span.font-display')].map(s => s.textContent) : null`
  const tokenCalc = { defaults: await evaluate(cdp, TOKEN_OUT) }
  await evaluate(cdp, `${setField('tok-docs', '10000')} return true`)
  await sleep(150)
  tokenCalc.tenThousandDocs = await evaluate(cdp, TOKEN_OUT)
  await evaluate(cdp, `document.getElementById('tok-docs').closest('.rounded-lg').scrollIntoView({ block: 'center' }); return true`)
  await sleep(300)
  await shot(cdp, '06a-desktop-dark-token-calc')
  report.desktopTokenCalc = tokenCalc

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

  // Slab pricing calculator: the month picks the slab, the volume picks the tier.
  stage = 'desktop dark: slab calculator'
  await evaluate(cdp, `location.hash = '#work/billing-portal'; return true`)
  await sleep(800)
  const SLAB_OUT = `const o = document.querySelector('[role=dialog] output[for="slab-month slab-pages"]');
    return o ? { total: o.querySelector('span.font-display').textContent, lines: [...o.querySelectorAll('span.text-sm')].map(s => s.textContent) } : null`
  const slabCalc = { defaults: await evaluate(cdp, SLAB_OUT) }
  await evaluate(cdp, `${setField('slab-pages', '12000')} return true`)
  await sleep(150)
  slabCalc.april12000 = await evaluate(cdp, SLAB_OUT)
  await evaluate(cdp, `${setField('slab-month', '2026-06')} return true`)
  await sleep(150)
  slabCalc.june12000 = await evaluate(cdp, SLAB_OUT)
  await evaluate(cdp, `${setField('slab-month', '2026-09')} return true`)
  await sleep(150)
  slabCalc.september12000 = await evaluate(cdp, SLAB_OUT)
  await evaluate(cdp, `document.getElementById('slab-pages').closest('.rounded-lg').scrollIntoView({ block: 'center' }); return true`)
  await sleep(300)
  await shot(cdp, '06b-desktop-dark-slab-calc')
  report.desktopSlabCalc = slabCalc
  await evaluate(
    cdp,
    `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true`,
  )
  await sleep(600)

  // In-page link: smooth scroll lands under the nav and moves focus.
  stage = 'desktop dark: in-page link'
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
  stage = 'desktop light'
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
  // The badge redraws its textures for the theme, renders, then rests again.
  await evaluate(cdp, `document.getElementById('about').scrollIntoView({ block: 'start' }); return true`)
  await waitForQuiet(cdp, '__draws', 15_000)
  await shot(cdp, '07b-desktop-light-lanyard')
  await evaluate(cdp, `document.getElementById('ops').scrollIntoView({ block: 'start' }); return true`)
  await sleep(900)
  await shot(cdp, '07c-desktop-light-ops')
  await evaluate(cdp, `document.getElementById('numbers').scrollIntoView({ block: 'end' }); return true`)
  await sleep(1200)
  await shot(cdp, '07d-desktop-light-heat-map')
  await evaluate(cdp, `document.getElementById('contact').scrollIntoView({ block: 'start' }); return true`)
  await sleep(1500)
  report.desktopLightParticles = await evaluate(
    cdp,
    `const h = document.getElementById('contact-heading'); return { live: h.dataset.particles === 'live' }`,
  )
  await shot(cdp, '07e-desktop-light-contact')

  // ---- Deep link straight into a section -----------------------------------
  // The query string forces a full load; a hash-only change would not fire one.
  stage = 'deep link'
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
  stage = 'progressive mount'
  await load(cdp, `${BASE}?plain=1`)
  await sleep(1200)
  report.progressiveMount = await evaluate(
    cdp,
    `return {
       sectionsMounted: document.querySelectorAll('main > section').length,
       footer: !!document.querySelector('footer'),
       navLinks: document.querySelectorAll('header nav a').length,
       lanyardChunkWithoutInput: ${LANYARD_CHUNK},
       lanyardSlotReserved: Math.round(document.querySelector('#about .lanyard-slot')?.getBoundingClientRect().height ?? -1),
     }`,
  )

  // ---- Reduced motion ------------------------------------------------------
  // Leave the page before changing the emulated preference, so the next
  // document is styled with reduced motion from its very first frame.
  stage = 'reduced motion'
  await evaluate(cdp, `document.documentElement.removeAttribute('data-theme'); return true`)
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
       ${PHASE4_FALLBACKS}
     }`,
  )
  // Interact, then give a lazy chunk time to arrive if the gate were wrong.
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 300, y: 300 })
  await evaluate(cdp, `document.getElementById('about').scrollIntoView({ block: 'start' }); return true`)
  await sleep(1500)
  report.reducedMotionLanyardAfterInput = await evaluate(cdp, `return { chunk: ${LANYARD_CHUNK}, canvas: !!document.querySelector('[data-lanyard]') }`)

  // ---- Mobile, touch ------------------------------------------------------
  // Emulate on a blank page, so the phone document never sees a desktop frame.
  // Navigating straight from the desktop page reported the width font as
  // loaded on a phone, which clean loads (Lighthouse's included) never do.
  stage = 'mobile'
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
       ${PHASE4_FALLBACKS}
     }`,
  )
  report.mobileWidthFontRequests = widthFontRequests.slice(mobileRequestsFrom)
  await shot(cdp, '08-mobile-dark-hero')
  stage = 'done'
} catch (error) {
  report.fatal = `${stage}: ${String(error?.stack ?? error)}`
} finally {
  writeReport()
  console.log(JSON.stringify(report, null, 2))
  clearTimeout(guard)
  cdp?.close()
  chrome.kill()
}
