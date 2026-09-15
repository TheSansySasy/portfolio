import { Fragment, type CSSProperties } from 'react'
import { useInView } from '../lib/useInView'

/**
 * Section headings rise word by word as they scroll in, each word out of its
 * own mask. The look follows React Bits "Split Text"
 * (https://reactbits.dev/text-animations/split-text); no code is copied. It is
 * plain spans and CSS transitions (.split-heading in globals.css), so it needs
 * no animation library, cannot flash before a script loads, and reads as one
 * ordinary sentence to screen readers. Static under reduced motion.
 */
export function SplitHeading({
  id,
  text,
  className = '',
}: {
  id: string
  text: string
  className?: string
}) {
  const [ref, inView] = useInView<HTMLHeadingElement>({
    once: true,
    rootMargin: '0px 0px -10% 0px',
  })
  const words = text.split(' ')

  return (
    <h2 ref={ref} id={id} className={`split-heading ${inView ? 'is-in' : ''} ${className}`}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          {index > 0 ? ' ' : null}
          <span className="split-mask">
            <span className="split-word" style={{ '--i': index } as CSSProperties}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </h2>
  )
}
