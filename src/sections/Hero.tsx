import { HEADLINE, ROLES, SITE, SUBHEAD } from '../content/data/site'
import { DecryptLine } from '../effects/DecryptLine'
import { PressureName } from '../effects/PressureName'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { ResumeLinks } from '../ui/ResumeLinks'

const HIGHLIGHTS = [
  { value: '26,000+', label: 'documents processed' },
  { value: '99.9%', label: 'uptime held' },
  { value: 'MB-310', label: 'Microsoft certified' },
]

/**
 * The name responds to the pointer (Text Pressure) and the role line decrypts
 * once on load. Both render as ordinary text first, and stay that way under
 * reduced motion or on touch screens.
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

        <PressureName id="hero-heading" text={SITE.name} className="mt-10" />

        <p className="mono-label mt-6 text-accent-text">
          <DecryptLine text={ROLES.join('  ·  ')} />
        </p>

        <p className="type-lede mt-8 max-w-3xl font-display text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-[-0.02em]">
          {HEADLINE}
        </p>
        <p className="mt-5 max-w-2xl text-muted">{SUBHEAD}</p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href="#work" variant="solid">
            See the work
          </ButtonLink>
          <ResumeLinks />
        </div>

        <dl className="mt-16 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.label}>
              <dt className="mono-label text-muted">{item.label}</dt>
              <dd className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
