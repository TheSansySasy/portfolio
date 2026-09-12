export type CodeLine = {
  code: string
  /** Margin note explaining why this line matters. */
  note?: string
}

/**
 * Annotated code: the snippet on the left, the reasoning in the margin.
 * Deliberately unhighlighted; syntax colour would compete with the accent.
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
            className="grid grid-cols-1 gap-1 px-4 py-1.5 md:grid-cols-12 md:gap-4"
          >
            <pre className="overflow-x-auto font-mono text-[12.5px] leading-relaxed whitespace-pre md:col-span-7">
              <code>{line.code === '' ? ' ' : line.code}</code>
            </pre>
            {line.note ? (
              <p className="text-[12.5px] text-muted md:col-span-5 md:text-right">{line.note}</p>
            ) : null}
          </div>
        ))}
      </div>
    </figure>
  )
}
