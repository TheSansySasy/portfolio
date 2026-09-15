import type { ReactNode } from 'react'
import { Reveal } from '../effects/Reveal'
import { SplitHeading } from '../effects/SplitHeading'
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
        <SplitHeading
          id={`${id}-heading`}
          text={heading ?? label}
          className="type-section mt-8 max-w-4xl"
        />
        {lede ? (
          <Reveal className="mt-6">
            <p className="type-lede max-w-2xl text-muted">{lede}</p>
          </Reveal>
        ) : null}
        {children ? <Reveal className="mt-10">{children}</Reveal> : null}
      </Container>
    </section>
  )
}
