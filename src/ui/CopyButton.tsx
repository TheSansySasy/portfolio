import { useEffect, useState } from 'react'

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!copied && !failed) return
    const timer = setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [copied, failed])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard can be blocked; the address is selectable next to this button.
      setFailed(true)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mono-label rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent-text"
    >
      <span aria-live="polite">{copied ? 'Copied' : failed ? 'Copy failed' : label}</span>
    </button>
  )
}
