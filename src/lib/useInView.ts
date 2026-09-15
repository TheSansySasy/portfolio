import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Observes one element. With `once`, it latches true on first entry and stops
 * observing, which is what reveals and lazy mounts want.
 */
export function useInView<T extends Element>({
  rootMargin = '0px',
  threshold = 0,
  once = false,
}: { rootMargin?: string; threshold?: number; once?: boolean } = {}): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null)
  // Without IntersectionObserver there is nothing to wait for: start revealed.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return [ref, inView]
}
