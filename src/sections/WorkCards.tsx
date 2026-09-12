import { WORK } from '../content/data/work'
import { openDossier } from '../lib/useHashRoute'

export function WorkCards() {
  return (
    <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
      {WORK.map((item) => (
        <li key={item.slug} className="bg-bg">
          <button
            type="button"
            onClick={() => openDossier(item.slug)}
            className="group flex h-full w-full flex-col items-start gap-3 p-6 text-left transition-colors hover:bg-surface md:p-8"
          >
            <span className="mono-label text-muted">
              <span className="text-accent-text">{item.index}</span>
              <span className="px-2 opacity-40">/</span>
              {item.lens.join(' · ')}
            </span>
            <span className="font-display text-2xl leading-tight font-extrabold md:text-3xl">
              {item.title}
            </span>
            <span className="text-muted">{item.outcome}</span>
            <span className="mono-label mt-auto flex w-full items-center justify-between pt-4">
              <span className="text-accent-text opacity-0 transition-opacity group-hover:opacity-100">
                Open dossier
              </span>
              <span className="text-muted">{item.written ? 'Written' : 'Outline'}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
