export type CodeLine = {
  code: string
  /** Margin note explaining why this line matters. */
  note?: string
}

/** Longest line that still fits beside a margin note at the dossier's width. */
const MARGIN_NOTE_FITS = 52

/**
 * Annotated code: the snippet on the left, the reasoning in the margin.
 * Deliberately unhighlighted; syntax colour would compete with the accent.
 * A block with longer lines puts each note under its line instead, so no
 * line needs its own sideways scrollbar.
 */
export function CodeBlock({
  title,
  language,
  lines,
}: {
  title: string
  language: string
  lines: CodeLine[]
}) {
  const stacked = lines.some((line) => line.code.length > MARGIN_NOTE_FITS)

  return (
    <figure className="overflow-hidden rounded-lg border border-line">
      <figcaption className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <span className="mono-label text-muted">{title}</span>
        <span className="mono-label text-accent-text">{language}</span>
      </figcaption>
      <div className="divide-y divide-line">
        {lines.map((line, index) => (
          <div
            key={`${index}-${line.code.slice(0, 12)}`}
            className={`grid grid-cols-1 gap-1 px-4 py-1.5 ${stacked ? '' : 'md:grid-cols-12 md:gap-4'}`}
          >
            <pre
              className={`overflow-x-auto font-mono text-[12.5px] leading-relaxed whitespace-pre ${stacked ? '' : 'md:col-span-7'}`}
            >
              <code>{line.code === '' ? ' ' : line.code}</code>
            </pre>
            {line.note ? (
              <p
                className={`text-[12.5px] text-muted ${stacked ? 'border-l border-accent pl-3' : 'md:col-span-5 md:text-right'}`}
              >
                {line.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </figure>
  )
}
