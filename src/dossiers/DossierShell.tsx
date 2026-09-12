import type { ReactNode } from 'react'
import type { WorkCard } from '../content/data/work'
import { Chip } from '../ui/Chip'

export function DossierShell({ item, children }: { item: WorkCard; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-gutter py-12">
      <p className="mono-label text-muted">
        <span className="text-accent-text">{item.index}</span>
        <span className="px-2 opacity-40">/</span>
        {item.lens.join(' · ')}
      </p>
      <h2 className="type-section mt-6">{item.title}</h2>
      <p className="type-lede mt-6 text-muted">{item.outcome}</p>
      <div className="mt-12 flex flex-col gap-12">{children}</div>
    </article>
  )
}

export function DossierBlock({
  label,
  heading,
  children,
}: {
  label: string
  heading?: string
  children: ReactNode
}) {
  return (
    <section>
      <p className="mono-label border-t border-line pt-3 text-accent-text">{label}</p>
      {heading ? <h3 className="mt-4 font-display text-2xl font-extrabold">{heading}</h3> : null}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function DossierList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((entry) => (
        <li key={entry.slice(0, 28)} className="flex gap-4">
          <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
          <span>{entry}</span>
        </li>
      ))}
    </ul>
  )
}

export function DossierMetrics({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
      {items.map((metric) => (
        <div key={metric.label} className="bg-bg p-5">
          <dd className="font-display text-3xl leading-none font-extrabold">{metric.value}</dd>
          <dt className="mono-label mt-2 text-muted">{metric.label}</dt>
        </div>
      ))}
    </dl>
  )
}

export function DossierStack({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((entry) => (
        <Chip key={entry}>{entry}</Chip>
      ))}
    </div>
  )
}
