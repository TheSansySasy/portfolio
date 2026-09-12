/** Swiss section header: `02 / ABOUT` sitting under a hairline rule. */
export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="mono-label text-muted">
        <span className="text-accent-text">{index}</span>
        <span className="px-2 opacity-40">/</span>
        {label}
      </p>
    </div>
  )
}
