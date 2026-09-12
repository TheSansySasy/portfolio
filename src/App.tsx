import { SECTIONS } from './content/data/site'
import { WORK, type WorkCard } from './content/data/work'
import { closeDossier, dossierSlug, useHashRoute } from './lib/useHashRoute'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Nav } from './sections/Nav'
import { WorkCards } from './sections/WorkCards'
import { Chip } from './ui/Chip'
import { Section } from './ui/Section'
import { Sheet } from './ui/Sheet'

/** Placeholder body for a dossier. Real write-ups land in Phase 2 and Phase 5a. */
function DossierBody({ item }: { item: WorkCard }) {
  const outline = [
    'Context and constraints',
    'The problem',
    'Architecture diagram',
    'What I built',
    'Annotated code',
    'Outcome in numbers',
    'What I would do differently',
  ]

  return (
    <div className="mx-auto w-full max-w-3xl px-gutter py-12">
      <p className="mono-label text-muted">
        <span className="text-accent-text">{item.index}</span>
        <span className="px-2 opacity-40">/</span>
        {item.lens.join(' · ')}
      </p>
      <h2 className="type-section mt-6">{item.title}</h2>
      <p className="type-lede mt-6 text-muted">{item.outcome}</p>

      <div className="mt-10 border-t border-line pt-8">
        <p className="mono-label text-muted">This dossier will contain</p>
        <ol className="mt-4 flex flex-col gap-3">
          {outline.map((step, i) => (
            <li key={step} className="flex gap-4 border-b border-line pb-3">
              <span className="mono-label text-accent-text">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mono-label mt-8 text-muted">
          The overlay, deep link and focus handling are live. Words arrive in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const hash = useHashRoute()
  const slug = dossierSlug(hash)
  const dossier = WORK.find((item) => item.slug === slug) ?? null

  return (
    <>
      <a
        href="#top"
        className="mono-label sr-only rounded-full border border-line bg-bg px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <Nav />

      <main>
        <Hero />
        {SECTIONS.map((section) => (
          <Section
            key={section.id}
            id={section.id}
            index={section.index}
            label={section.label}
            heading={section.heading}
            lede={section.lede}
          >
            {section.id === 'work' ? <WorkCards /> : null}
            <p className="mono-label mt-8 text-muted">
              <Chip>Arrives: {section.arrives}</Chip>
            </p>
          </Section>
        ))}
      </main>

      <Footer />

      <Sheet
        open={dossier !== null}
        onClose={closeDossier}
        title={dossier ? `Work / ${dossier.index}` : 'Work'}
      >
        {dossier ? <DossierBody item={dossier} /> : null}
      </Sheet>
    </>
  )
}
