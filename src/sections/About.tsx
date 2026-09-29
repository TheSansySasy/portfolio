import { ABOUT, SECTION_META, SITE } from '../content/data/site'
import { LanyardBadge } from '../effects/lanyard/LanyardBadge'
import { Reveal } from '../effects/Reveal'
import { SplitHeading } from '../effects/SplitHeading'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'

export function About() {
  const meta = SECTION_META.about

  return (
    <section id={meta.id} aria-labelledby="about-heading" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionLabel index={meta.index} label={meta.label} />
        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SplitHeading id="about-heading" text={meta.heading} className="type-section" />
            <Reveal className="mt-8 flex max-w-2xl flex-col gap-5">
              {ABOUT.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
              <p className="mono-label mt-3 text-muted">
                {SITE.location} · {SITE.timezone} · Remote
              </p>
            </Reveal>
          </div>
          <Reveal className="md:col-span-5">
            <LanyardBadge />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
