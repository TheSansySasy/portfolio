import { ABOUT, SECTION_META, SITE } from '../content/data/site'
import { Container } from '../ui/Container'
import { Monogram } from '../ui/Monogram'
import { SectionLabel } from '../ui/SectionLabel'

/**
 * The badge is a static card in Phase 2. Phase 4 hangs this same face on a
 * physics lanyard, with the roundel monogram on the back.
 */
function Badge() {
  return (
    <div className="w-full max-w-xs">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <Monogram variant="grid" className="h-4 text-text" />
          <span className="mono-label text-muted">ID · 01</span>
        </div>
        <p className="mt-10 font-display text-3xl leading-none font-extrabold">
          Sanskar
          <br />
          Rai
        </p>
        <p className="mono-label mt-4 text-accent-text">@{SITE.handle}</p>
        <div className="mt-6 border-t border-line pt-4">
          <p className="mono-label text-muted">Python · Cloud · D365 integration</p>
          <p className="mono-label mt-2 text-muted">MB-310 certified</p>
        </div>
      </div>
      <div className="mx-auto mt-3 h-px w-2/3 bg-line" />
      <p className="mono-label mt-3 text-center text-muted">{SITE.location}</p>
    </div>
  )
}

export function About() {
  const meta = SECTION_META.about

  return (
    <section id={meta.id} aria-labelledby="about-heading" className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionLabel index={meta.index} label={meta.label} />
        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <h2 id="about-heading" className="type-section">
              {meta.heading}
            </h2>
            <div className="mt-8 flex max-w-2xl flex-col gap-5">
              {ABOUT.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <p className="mono-label mt-8 text-muted">
              {SITE.location} · {SITE.timezone} · Remote
            </p>
          </div>
          <div className="flex justify-start md:col-span-5 md:justify-end">
            <Badge />
          </div>
        </div>
      </Container>
    </section>
  )
}
