import { useEffect, useState } from 'react'

/** Desktop-class input: a precise pointer that can hover, on a wide viewport. */
export const FINE_POINTER_DESKTOP = '(pointer: fine) and (hover: hover) and (min-width: 768px)'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
