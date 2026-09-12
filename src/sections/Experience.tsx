import { EDUCATION, EXPERIENCE } from '../content/data/experience'
import { SECTION_META } from '../content/data/site'
import { Chip } from '../ui/Chip'
import { Section } from '../ui/Section'

export function Experience() {
  return (
    <Section {...SECTION_META.experience}>
      <ol className="flex flex-col">
        {EXPERIENCE.map((role) => (
          <li key={role.employer} className="border-t border-line py-8 first:border-t-0 first:pt-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-4">
                <h3 className="font-display text-2xl font-extrabold">
                  {role.employer}
                  {role.current ? (
                    <span className="mono-label ml-3 align-middle text-accent-text">Current</span>
                  ) : null}
                </h3>
                <p className="mt-2 text-muted">{role.title}</p>
                <p className="mono-label mt-3 text-muted">
                  {role.period}
                  {role.note ? ` · ${role.note}` : ''}
                </p>
              </div>
              <div className="md:col-span-8">
                <ul className="flex flex-col gap-4">
                  {role.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 24)} className="flex gap-4">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {role.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 border-t border-line pt-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <h3 className="font-display text-2xl font-extrabold">Education</h3>
            <p className="mono-label mt-3 text-muted">{EDUCATION.period}</p>
          </div>
          <div className="md:col-span-8">
            <p>{EDUCATION.school}</p>
            <p className="mt-1 text-muted">{EDUCATION.degree}</p>
            <p className="mt-3 text-muted">{EDUCATION.note}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
