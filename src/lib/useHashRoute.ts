import { useEffect, useState } from 'react'

/** True once the visitor has navigated in-page, so Escape can use history.back(). */
let navigatedInPage = false

export function useHashRoute(): string {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  )

  useEffect(() => {
    const onChange = () => {
      navigatedInPage = true
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash
}

/** `#work/ai-document-platform` becomes `ai-document-platform`; anything else is null. */
export function dossierSlug(hash: string): string | null {
  const match = /^#work\/([a-z0-9][a-z0-9-]*)$/.exec(hash)
  return match ? match[1] : null
}

export function openDossier(slug: string): void {
  window.location.hash = `#work/${slug}`
}

/**
 * Prefer going back, so the close button and the browser back button behave the
 * same way. On a cold load straight into a dossier there is no history entry to
 * return to, so fall back to the work section.
 */
export function closeDossier(): void {
  if (navigatedInPage) window.history.back()
  else window.location.hash = '#work'
}
