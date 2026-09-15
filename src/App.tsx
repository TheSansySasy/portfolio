import { startTransition, useEffect, useState } from 'react'
import { SITE } from './content/data/site'
import { WORK } from './content/data/work'
import { DossierBody } from './dossiers/DossierBody'
import { DossierShell } from './dossiers/DossierShell'
import { startSmoothScroll } from './lib/smoothScroll'
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
  useEffect(() => startSmoothScroll(), [])

  // The nav and hero render at once; everything below the fold mounts right
  // after, in a transition, which React renders in small interruptible slices
  // instead of one long task. Measured on mobile, that initial render was the
  // largest long task the effects added. A URL that arrives with a hash renders
  // everything immediately, so the browser's anchor scroll and dossier links
  // find their targets.
  const [restReady, setRestReady] = useState(() => window.location.hash !== '')
  useEffect(() => {
    if (restReady) return
    const timer = window.setTimeout(() => startTransition(() => setRestReady(true)), 0)
    return () => window.clearTimeout(timer)
  }, [restReady])

  // React's first render is scheduled, not synchronous, so it can finish after
  // the browser has already given up on scrolling to a URL's hash. Measured: a
  // cold load of /#contact stayed at the top. Land on the section explicitly
  // once it exists. Sections below the fold start with estimated heights
  // (content-visibility), so re-check for a few frames as they render.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!/^[A-Za-z][\w-]*$/.test(id)) return
    const target = document.getElementById(id)
    if (!target) return

    target.scrollIntoView({ block: 'start' })
    let frames = 0
    let frame = 0
    const settle = () => {
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
      if (Math.abs(target.getBoundingClientRect().top - margin) > 2) {
        target.scrollIntoView({ block: 'start' })
      }
      frames += 1
      if (frames < 4) frame = requestAnimationFrame(settle)
    }
    frame = requestAnimationFrame(settle)
    return () => cancelAnimationFrame(frame)
  }, [])

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

      <Nav sectionsReady={restReady} />

      <main>
        <Hero />
        {restReady ? (
          <>
            <About />
            <Experience />
            <Work />
            <Stack />
            <Ops />
            <Numbers />
            <Certifications />
            <Contact />
          </>
        ) : null}
      </main>

      {restReady ? <Footer /> : null}

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
