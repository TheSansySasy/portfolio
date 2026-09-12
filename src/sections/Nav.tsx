import { useState } from 'react'
import { NAV_SECTIONS, SITE } from '../content/data/site'
import { useActiveSection } from '../lib/useActiveSection'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { Monogram } from '../ui/Monogram'
import { Sheet } from '../ui/Sheet'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_IDS = NAV_SECTIONS.map((section) => section.id)

export function Nav() {
  const active = useActiveSection(NAV_IDS)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-glass backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3" aria-label={`${SITE.name}, back to top`}>
          <Monogram variant="grid" className="h-3.5 text-text" title={SITE.name} />
          <span className="sr-only">{SITE.name}</span>
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={active === section.id ? 'true' : undefined}
                  className={`mono-label transition-colors hover:text-text ${
                    active === section.id ? 'text-accent-text' : 'text-muted'
                  }`}
                >
                  {section.nav}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SITE.github}
            className="mono-label hidden text-muted transition-colors hover:text-accent-text sm:block"
          >
            @{SITE.handle}
          </a>
          <ThemeToggle />
          <ButtonLink href="#contact" className="hidden sm:inline-flex">
            Get in touch
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="mono-label rounded-full border border-line px-3 py-1.5 text-muted md:hidden"
          >
            Menu
          </button>
        </div>
      </Container>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav aria-label="Sections" className="px-gutter py-10">
          <ul className="flex flex-col gap-6">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="type-section block font-display"
                >
                  {section.nav}
                </a>
              </li>
            ))}
            <li>
              <a
                href={SITE.github}
                onClick={() => setMenuOpen(false)}
                className="mono-label text-accent-text"
              >
                @{SITE.handle}
              </a>
            </li>
          </ul>
        </nav>
      </Sheet>
    </header>
  )
}
