import type { Runbook } from '../content/data/runbooks'
import { ButtonLink } from './Button'

/** Download cards for the sanitised runbooks linked from a dossier. */
export function RunbookList({ items }: { items: readonly Runbook[] }) {
  return (
    <ul className="flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line">
      {items.map((runbook) => (
        <li
          key={runbook.slug}
          className="flex flex-col gap-4 bg-bg p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-lg leading-tight font-extrabold">{runbook.title}</p>
            <p className="mt-2 text-sm text-muted">{runbook.summary}</p>
            <p className="mono-label mt-3 text-muted">PDF · {runbook.pages} pages · client details removed</p>
          </div>
          <ButtonLink
            href={`/runbooks/${runbook.slug}.pdf`}
            download
            className="shrink-0"
            aria-label={`Download PDF: ${runbook.title}`}
          >
            Download PDF
          </ButtonLink>
        </li>
      ))}
    </ul>
  )
}
