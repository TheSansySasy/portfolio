// Minimal Chrome DevTools Protocol client over Node's built-in WebSocket.
// Shared by verify-effects.mjs and render-og.mjs. No dependencies.
//
// Every call that waits on the browser has a timeout, so a stuck navigation or
// evaluation fails with a named error instead of hanging the whole run.
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

export const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/**
 * Headless Chrome for the checks. WebGL defaults to SwiftShader, the software
 * renderer, which works everywhere but draws a physically based scene at a few
 * frames a second. `gpu: true` uses the machine's GPU through ANGLE instead.
 */
export function launchChrome({ port, userDataDir, windowSize = '1440,900', gpu = false }) {
  return spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      ...(gpu
        ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist']
        : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']),
      `--window-size=${windowSize}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
}

/** Rejects with a labelled error if `promise` has not settled within `ms`. */
export async function withTimeout(promise, ms, label) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} did not finish within ${Math.round(ms / 1000)}s`)),
      ms,
    )
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

export class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url)
    this.nextId = 0
    this.pending = new Map()
    this.listeners = new Set()
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

  send(method, params = {}, timeoutMs = 30_000) {
    const id = ++this.nextId
    const reply = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
    this.ws.send(JSON.stringify({ id, method, params }))
    return withTimeout(reply, timeoutMs, `CDP ${method}`)
  }

  /** Subscribes to protocol events; returns the unsubscribe function. */
  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  close() {
    try {
      this.ws.close()
    } catch {
      // already closed
    }
  }
}

export async function connect(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
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

/** Runs `body` as an async function in the page and returns its value. */
export async function evaluate(cdp, body, timeoutMs = 30_000) {
  const { result, exceptionDetails } = await cdp.send(
    'Runtime.evaluate',
    { expression: `(async () => { ${body} })()`, awaitPromise: true, returnByValue: true },
    timeoutMs,
  )
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  }
  return result.value
}

/** Navigates and waits for the load event, failing loudly instead of hanging. */
export async function navigate(cdp, url, timeoutMs = 30_000) {
  let unsubscribe
  const loaded = new Promise((resolve) => {
    unsubscribe = cdp.on((m) => {
      if (m.method === 'Page.loadEventFired') resolve()
    })
  })
  try {
    await cdp.send('Page.navigate', { url })
    await withTimeout(loaded, timeoutMs, `load of ${url}`)
  } finally {
    unsubscribe?.()
  }
}
