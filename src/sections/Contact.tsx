import { CONTACT, SECTION_META, SITE } from '../content/data/site'
import { ButtonLink } from '../ui/Button'
import { CopyButton } from '../ui/CopyButton'
import { ResumeCards } from '../ui/ResumeLinks'
import { Section } from '../ui/Section'

export function Contact() {
  return (
    <Section {...SECTION_META.contact}>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <p className="type-lede">{CONTACT.availability}</p>
          <p className="mt-4 text-muted">{CONTACT.responseNote}</p>

          <div className="mt-10 border-t border-line pt-6">
            <p className="mono-label text-muted">Email</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${SITE.email}`}
                className="font-display text-xl font-extrabold break-all transition-colors hover:text-accent-text md:text-2xl"
              >
                {SITE.email}
              </a>
              <CopyButton value={SITE.email} label="Copy address" />
            </div>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="mono-label text-muted">Elsewhere</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <ButtonLink href={SITE.github}>GitHub · @{SITE.handle}</ButtonLink>
              {SITE.linkedin ? <ButtonLink href={SITE.linkedin}>LinkedIn</ButtonLink> : null}
              <ButtonLink href={SITE.repo}>Source of this site</ButtonLink>
            </div>
          </div>
        </div>

        <div className="md:col-span-5">
          <p className="mono-label text-muted">Resume</p>
          <div className="mt-3">
            <ResumeCards />
          </div>
          <p className="mono-label mt-4 text-muted">
            Same person, two emphases. Take whichever matches the role.
          </p>
        </div>
      </div>
    </Section>
  )
}
