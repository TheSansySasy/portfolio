import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { SECTION_META } from '../content/data/site'
import { STACK } from '../content/data/stack'
import { useInView } from '../lib/useInView'
import { FINE_POINTER_DESKTOP, useMediaQuery } from '../lib/useMediaQuery'
import { useReducedMotion } from '../lib/useReducedMotion'
import { Section } from '../ui/Section'

// WebGL and gl-matrix load only when the section approaches, and only on desktop.
const StackSphere = lazy(() => import('../effects/StackSphere'))

function SpherePlaceholder() {
  return <div aria-hidden="true" className="h-[34rem] w-full rounded-lg border border-line" />
}

/**
 * The sphere is the section's signature on desktop. The grouped list below it
 * is always rendered: it is the whole content for touch screens, reduced
 * motion and browsers without WebGL 2, and what screen readers use everywhere.
 */
export function Stack() {
  const reduced = useReducedMotion()
  const desktop = useMediaQuery(FINE_POINTER_DESKTOP)
  const [unsupported, setUnsupported] = useState(false)
  const onUnsupported = useCallback(() => setUnsupported(true), [])
  const [nearRef, near] = useInView<HTMLDivElement>({ once: true, rootMargin: '600px 0px' })

  const items = useMemo(
    () =>
      STACK.flatMap((group) =>
        group.items.map((item) => ({ title: item.name, note: item.note, group: group.group })),
      ),
    [],
  )
  const showSphere = desktop && !reduced && !unsupported

  return (
    <Section {...SECTION_META.stack}>
      {showSphere ? (
        <div ref={nearRef} className="mb-12">
          {near ? (
            <Suspense fallback={<SpherePlaceholder />}>
              <StackSphere items={items} onUnsupported={onUnsupported} />
            </Suspense>
          ) : (
            <SpherePlaceholder />
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-10">
        {STACK.map((group) => (
          <div key={group.group} className="border-t border-line pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
              <h3 className="mono-label text-accent-text md:col-span-3">{group.group}</h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:col-span-9">
                {group.items.map((item) => (
                  <div key={item.name}>
                    <dt className="font-medium">{item.name}</dt>
                    <dd className="text-sm text-muted">{item.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
