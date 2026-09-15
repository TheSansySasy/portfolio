import { SITE } from '../content/data/site'
import { Container } from '../ui/Container'
import { Monogram } from '../ui/Monogram'

export function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <Container className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <Monogram variant="grid" className="h-3 text-muted" title={SITE.name} />
          <p className="mono-label text-muted">
            Built with Vite and React. Set in Archivo, Inter and JetBrains Mono.
          </p>
          <p className="mono-label text-muted">
            {SITE.location} · {SITE.timezone}
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li>
            <a href={SITE.github} className="mono-label text-muted hover:text-accent-text">
              @{SITE.handle}
            </a>
          </li>
          <li>
            <a href={SITE.linkedin} className="mono-label text-muted hover:text-accent-text">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={SITE.repo} className="mono-label text-muted hover:text-accent-text">
              View source
            </a>
          </li>
          <li>
            <span className="mono-label text-muted">© {new Date().getFullYear()} {SITE.name}</span>
          </li>
        </ul>
      </Container>
    </footer>
  )
}
