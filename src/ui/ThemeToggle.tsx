import { useTheme, type Theme } from '../lib/theme'

const NEXT: Record<Theme, string> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const GLYPH: Record<Theme, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
}

export function ThemeToggle() {
  const { theme, cycle } = useTheme()
  const label = `Theme: ${theme}. Switch to ${NEXT[theme]}.`

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="mono-label rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent-text"
    >
      {GLYPH[theme]}
    </button>
  )
}
