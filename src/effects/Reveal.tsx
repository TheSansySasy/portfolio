import type { ReactNode } from 'react'
import { useInView } from '../lib/useInView'

/**
 * The quiet reveal every section body uses: a 12px rise and a fade, once.
 * Content is hidden only after the app has marked the document ready, and
 * never under reduced motion (see .reveal in globals.css).
 */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: true, rootMargin: '0px 0px -8% 0px' })

  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  )
}
