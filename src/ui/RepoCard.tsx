import type { Repo } from '../content/data/repos'
import { ButtonLink } from './Button'
import { Chip } from './Chip'

/** A public showcase repository, linked from the dossier it belongs to. */
export function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-base font-semibold">{repo.name}</p>
        <p className="mt-2 text-sm text-muted">{repo.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {repo.contents.map((entry) => (
            <Chip key={entry}>{entry}</Chip>
          ))}
        </div>
        <p className="mono-label mt-3 text-muted">
          A reference implementation, written from scratch. No employer code.
        </p>
      </div>
      <ButtonLink href={repo.url} className="shrink-0" aria-label={`View on GitHub: ${repo.name}`}>
        View on GitHub
      </ButtonLink>
    </div>
  )
}
