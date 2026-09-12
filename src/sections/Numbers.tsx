import { NUMBERS } from '../content/data/numbers'
import { SECTION_META } from '../content/data/site'
import { Section } from '../ui/Section'

export function Numbers() {
  return (
    <Section {...SECTION_META.numbers}>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((metric) => (
          <li key={metric.label} className="bg-bg p-6">
            <p className="font-display text-4xl leading-none font-extrabold">{metric.value}</p>
            <p className="mono-label mt-3 text-accent-text">{metric.label}</p>
            <p className="mt-2 text-sm text-muted">{metric.note}</p>
          </li>
        ))}
      </ul>
      <p className="mono-label mt-6 text-muted">
        Every figure here also appears on the resume. Nothing rounded up.
      </p>
    </Section>
  )
}
