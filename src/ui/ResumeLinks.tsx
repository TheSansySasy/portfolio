import { RESUMES } from '../content/data/site'
import { ButtonLink } from './Button'

/** Two tracks, because the two halves of the work are hired for separately. */
export function ResumeLinks({ variant = 'outline' }: { variant?: 'solid' | 'outline' }) {
  return (
    <div className="flex flex-wrap gap-3">
      {RESUMES.map((resume, index) => (
        <ButtonLink
          key={resume.file}
          href={resume.file}
          download
          variant={index === 0 && variant === 'solid' ? 'solid' : 'outline'}
        >
          {resume.track}
        </ButtonLink>
      ))}
    </div>
  )
}

export function ResumeCards() {
  return (
    <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
      {RESUMES.map((resume) => (
        <li key={resume.file} className="bg-bg p-6">
          <p className="mono-label text-accent-text">{resume.track}</p>
          <p className="mt-3 text-muted">{resume.detail}</p>
          <a
            href={resume.file}
            download
            className="mono-label mt-4 inline-block border-b border-line pb-0.5 transition-colors hover:border-accent hover:text-accent-text"
          >
            Download PDF
          </a>
        </li>
      ))}
    </ul>
  )
}
