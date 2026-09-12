import type { ReactNode } from 'react'
import { Container } from './Container'
import { SectionLabel } from './SectionLabel'

export function Section({
  id,
  index,
  label,
  heading,
  lede,
  children,
}: {
  id: string
  index: string
  label: string
  heading?: string
  lede?: string
  children?: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionLabel index={index} label={label} />
        <h2 id={`${id}-heading`} className="type-section mt-8 max-w-4xl">
          {heading ?? label}
        </h2>
        {lede ? <p className="type-lede mt-6 max-w-2xl text-muted">{lede}</p> : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  )
}
