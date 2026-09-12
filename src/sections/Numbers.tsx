import { NUMBERS } from '../content/data/numbers'
import { SECTION_META } from '../content/data/site'
import { Section } from '../ui/Section'

export function Numbers() {
  return (
    <Section {...SECTION_META.numbers}>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((metric) => (
          <div key={metric.label} className="bg-bg p-6">
            <dd className="font-display text-4xl leading-none font-extrabold">{metric.value}</dd>
            <dt className="mono-label mt-3 text-accent-text">{metric.label}</dt>
            <p className="mt-2 text-sm text-muted">{metric.note}</p>
          </div>
        ))}
      </dl>
      <p className="mono-label mt-6 text-muted">
        Every figure here also appears on the resume. Nothing rounded up.
      </p>
    </Section>
  )
}
