import { NUMBERS } from '../content/data/numbers'
import { SECTION_META } from '../content/data/site'
import { CountUp } from '../effects/CountUp'
import { MagnetField } from '../effects/MagnetField'
import { Section } from '../ui/Section'

export function Numbers() {
  return (
    <Section {...SECTION_META.numbers}>
      {/* Magnet Lines sits in its own band so it never runs behind the figures. */}
      <div className="mb-8 h-36 overflow-hidden rounded-lg border border-line text-muted md:h-44">
        <MagnetField rows={5} columns={24} className="opacity-50" />
      </div>

      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((metric) => (
          <li key={metric.label} className="bg-bg p-6">
            <p className="font-display text-4xl leading-none font-extrabold">
              <CountUp value={metric.value} />
            </p>
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
