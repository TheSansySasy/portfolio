import { useEffect, useState } from 'react'

export type ThemeTokens = {
  bg: string
  surface: string
  line: string
  text: string
  muted: string
  accent: string
  accentText: string
}

function readTokens(): ThemeTokens {
  // Custom properties compute with their var() references resolved, so these
  // come back as the active theme's literal colours.
  const style = getComputedStyle(document.documentElement)
  const get = (name: string) => style.getPropertyValue(name).trim()
  return {
    bg: get('--bg'),
    surface: get('--surface'),
    line: get('--line'),
    text: get('--text'),
    muted: get('--muted'),
    accent: get('--accent'),
    accentText: get('--accent-text'),
  }
}

function sameTokens(a: ThemeTokens, b: ThemeTokens): boolean {
  return (Object.keys(a) as (keyof ThemeTokens)[]).every((key) => a[key] === b[key])
}

/**
 * The active theme's colours as strings, for anything drawn on a canvas or in
 * WebGL, where CSS variables cannot reach. Updates when the visitor toggles the
 * theme or the system preference changes.
 */
export function useThemeTokens(): ThemeTokens | null {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null)

  useEffect(() => {
    const update = () =>
      setTokens((previous) => {
        const next = readTokens()
        return previous && sameTokens(previous, next) ? previous : next
      })

    update()
    const attributeWatcher = new MutationObserver(update)
    attributeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    const system = window.matchMedia('(prefers-color-scheme: dark)')
    system.addEventListener('change', update)

    return () => {
      attributeWatcher.disconnect()
      system.removeEventListener('change', update)
    }
  }, [])

  return tokens
}
