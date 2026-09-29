import { useEffect, useState } from 'react'

const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'] as const

/**
 * True once the visitor has moved, clicked, scrolled a wheel or pressed a key.
 * Heavy optional effects wait for it, so a page load on its own (a lab
 * measurement, a crawler, a tab opened in the background) never pays for them.
 */
export function useFirstInteraction(enabled = true): boolean {
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    if (!enabled || interacted) return
    const onEvent = () => setInteracted(true)
    for (const name of EVENTS) window.addEventListener(name, onEvent, { passive: true, once: true })
    return () => {
      for (const name of EVENTS) window.removeEventListener(name, onEvent)
    }
  }, [enabled, interacted])

  return interacted
}
