import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react'
import { SITE } from '../../content/data/site'
import { useFirstInteraction } from '../../lib/useFirstInteraction'
import { useInView } from '../../lib/useInView'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useThemeTokens } from '../../lib/useThemeTokens'
import { Badge } from '../../ui/Badge'
import { loadBadgeFonts } from './badgeArt'

/**
 * The lanyard needs room to swing and a mouse to grab it, so it runs only on
 * fine-pointer screens at least 1024px wide with motion allowed and WebGL 2.
 * three.js and the Rapier physics engine are a large download, so the chunk is
 * fetched only once the visitor has interacted with the page and About is
 * within a screen or so: a bare page load, Lighthouse's included, never
 * requests it. Until the card has drawn its first frame, and anywhere it does
 * not run, the static badge is the column.
 */
export const LANYARD_QUERY = '(pointer: fine) and (hover: hover) and (min-width: 1024px)'

const Lanyard = lazy(() =>
  Promise.all([import('./Lanyard'), loadBadgeFonts()]).then(([module]) => module),
)

let webgl2: boolean | undefined

/** Probed once per page, and only when the lanyard is due, since it creates a context. */
function supportsWebGL2(): boolean {
  if (webgl2 === undefined) {
    try {
      webgl2 = !!document.createElement('canvas').getContext('webgl2')
    } catch {
      webgl2 = false
    }
  }
  return webgl2
}

/** Any failure inside the 3D scene (WebGL, the physics WASM, the model) falls back to the badge. */
class Fallback extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function LanyardBadge() {
  const wide = useMediaQuery(LANYARD_QUERY)
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  // Reserved from the first render, so the column never changes height when
  // the lanyard arrives.
  const wanted = wide && !reduced && webgl2 !== false && !failed

  const [nearRef, near] = useInView<HTMLDivElement>({ once: true, rootMargin: '600px 0px' })
  const [screenRef, onScreen] = useInView<HTMLDivElement>({ rootMargin: '100px 0px' })
  const interacted = useFirstInteraction(wanted)
  const tokens = useThemeTokens()
  const due = wanted && near && interacted

  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setFailed(true), [])
  const load = due && tokens !== null && supportsWebGL2()
  const live = load && ready

  return (
    <div ref={nearRef} className="w-full">
      <div ref={screenRef} className={`relative ${wanted ? 'lanyard-slot' : ''}`}>
        <div className={`flex justify-start md:justify-end ${live ? 'sr-only' : ''}`}>
          <Badge />
        </div>
        {load ? (
          <div
            data-lanyard={live ? 'live' : 'loading'}
            className={`lanyard-canvas transition-opacity duration-500 ${live ? 'opacity-100' : 'opacity-0'}`}
          >
            <Fallback onError={onError}>
              <Suspense fallback={null}>
                <Lanyard
                  tokens={tokens}
                  url={SITE.linkedin || SITE.github}
                  visible={onScreen}
                  onReady={onReady}
                />
              </Suspense>
            </Fallback>
          </div>
        ) : null}
        {live ? (
          <p
            aria-hidden="true"
            className="mono-label pointer-events-none absolute inset-x-0 bottom-0 text-center text-muted"
          >
            Drag to swing · click to flip
          </p>
        ) : null}
      </div>
    </div>
  )
}
