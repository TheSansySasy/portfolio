import { SECTION_META } from '../content/data/site'
import { Section } from '../ui/Section'
import { WorkCards } from './WorkCards'

export function Work() {
  return (
    <Section {...SECTION_META.work}>
      <WorkCards />
    </Section>
  )
}
