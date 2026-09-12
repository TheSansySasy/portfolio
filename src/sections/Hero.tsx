import { HEADLINES, ROLES, SITE } from '../content/data/site'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'

/**
 * Phase 1 hero: the real type scale and layout, no effects yet.
 * Phase 3 swaps the name for Text Pressure and the role line for Decrypted Text.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="pt-16 pb-20 md:pt-24 md:pb-28">
      <Container>
        <div className="border-t border-line pt-3">
          <p className="mono-label text-muted">
            <span className="text-accent-text">01</span>
            <span className="px-2 opacity-40">/</span>
            {SITE.location} · Available remote
          </p>
        </div>

        <h1 id="hero-heading" className="type-hero mt-10 font-display">
          {SITE.name}
        </h1>

        <p className="mono-label mt-6 text-accent-text">{ROLES.join('  ·  ')}</p>

        <p className="type-lede mt-8 max-w-2xl">{HEADLINES[0]}</p>
        <p className="mono-label mt-3 text-muted">
          Headline is provisional. Five candidates live in the styleguide.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href="#work" variant="solid">
            See the work
          </ButtonLink>
          <ButtonLink href="#contact">Get in touch</ButtonLink>
        </div>

        <dl className="mt-16 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {[
            ['26,000+', 'documents processed'],
            ['99.9%', 'uptime maintained'],
            ['MB-310', 'Microsoft certified'],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="mono-label text-muted">{label}</dt>
              <dd className="mt-2 font-display text-3xl font-extrabold md:text-4xl">{value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
