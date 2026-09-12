import { SECTION_META } from '../content/data/site'
import { STACK } from '../content/data/stack'
import { Section } from '../ui/Section'

/**
 * Phase 2 renders the stack as a grouped list, which is also the accessible
 * fallback that stays in the DOM once Phase 3 adds the draggable sphere.
 */
export function Stack() {
  return (
    <Section {...SECTION_META.stack}>
      <div className="flex flex-col gap-10">
        {STACK.map((group) => (
          <div key={group.group} className="border-t border-line pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
              <h3 className="mono-label text-accent-text md:col-span-3">{group.group}</h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:col-span-9">
                {group.items.map((item) => (
                  <div key={item.name}>
                    <dt className="font-medium">{item.name}</dt>
                    <dd className="text-sm text-muted">{item.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
