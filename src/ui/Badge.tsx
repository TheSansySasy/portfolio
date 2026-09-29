import { SITE } from '../content/data/site'
import { Monogram } from './Monogram'

/**
 * The ID badge as a flat card. It is the About column everywhere the lanyard
 * does not run (touch screens, narrow windows, reduced motion, no WebGL), the
 * placeholder while the lanyard loads, and what screen readers read once it
 * has. The lanyard's front face (effects/lanyard/badgeArt.ts) draws this same
 * layout.
 */
export function Badge() {
  return (
    <div className="w-full max-w-xs">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <Monogram variant="grid" className="h-4 text-text" />
          <span className="mono-label text-muted">ID · 01</span>
        </div>
        <p className="mt-10 font-display text-3xl leading-none font-extrabold">
          Sanskar
          <br />
          Rai
        </p>
        <p className="mono-label mt-4 text-accent-text">@{SITE.handle}</p>
        <div className="mt-6 border-t border-line pt-4">
          <p className="mono-label text-muted">Python · Cloud · D365 integration</p>
          <p className="mono-label mt-2 text-muted">MB-310 certified</p>
        </div>
      </div>
      <div className="mx-auto mt-3 h-px w-2/3 bg-line" />
      <p className="mono-label mt-3 text-center text-muted">{SITE.location}</p>
    </div>
  )
}
