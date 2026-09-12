import { OPS, SECTION_META } from '../content/data/site'
import { AlwaysOnTopology } from '../diagrams/AlwaysOnTopology'
import { Section } from '../ui/Section'

export function Ops() {
  return (
    <Section {...SECTION_META.ops}>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <AlwaysOnTopology />
        </div>
        <div className="md:col-span-5">
          <h3 className="mono-label text-accent-text">The Kerberos morning</h3>
          <div className="mt-4 flex flex-col gap-4">
            {OPS.story.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-8 border-t border-line">
            {OPS.facts.map((fact) => (
              <div key={fact.label} className="border-b border-line py-3">
                <dt className="mono-label text-muted">{fact.label}</dt>
                <dd className="mt-1 text-sm">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}
