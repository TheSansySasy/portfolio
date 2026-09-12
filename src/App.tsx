import { SITE } from './content/data/site'
import { WORK } from './content/data/work'
import { DossierBody } from './dossiers/DossierBody'
import { DossierShell } from './dossiers/DossierShell'
import { closeDossier, dossierSlug, useHashRoute } from './lib/useHashRoute'
import { About } from './sections/About'
import { Certifications } from './sections/Certifications'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Nav } from './sections/Nav'
import { Numbers } from './sections/Numbers'
import { Ops } from './sections/Ops'
import { Stack } from './sections/Stack'
import { Work } from './sections/Work'
import { Sheet } from './ui/Sheet'

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
        <About />
        <Experience />
        <Work />
        <Stack />
        <Ops />
        <Numbers />
        <Certifications />
        <Contact />
      </main>

      <Footer />

      <Sheet
        open={dossier !== null}
        onClose={closeDossier}
        title={dossier ? `${SITE.name} · Work ${dossier.index}` : 'Work'}
      >
        {dossier ? (
          <DossierShell item={dossier}>
            <DossierBody slug={dossier.slug} />
          </DossierShell>
        ) : null}
      </Sheet>
    </>
  )
}
