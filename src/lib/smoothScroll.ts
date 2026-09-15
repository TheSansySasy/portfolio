import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis: Lenis | null = null

/**
 * Smooth wheel scrolling at a low strength, for mouse and trackpad users only.
 * Lenis smooths the wheel and nothing else, so on a touch screen it would run a
 * frame loop and a resize observer for no visible benefit; there, and under
 * reduced motion, it never starts and in-page links jump natively. Where it
 * runs, links to plain section ids scroll smoothly and move focus the way a
 * native jump would, so the skip link and keyboard users keep working; dossier
 * hashes are left to the router. Returns a cleanup function.
 */
export function startSmoothScroll(): () => void {
  const wheelUser = window.matchMedia('(pointer: fine) and (hover: hover)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!wheelUser || reduced) return () => {}

  lenis = new Lenis({ lerp: 0.12, smoothWheel: true, autoRaf: true })

  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const link = (event.target as Element | null)?.closest('a[href^="#"]')
    const hash = link?.getAttribute('href') ?? ''
    if (!/^#[A-Za-z][\w-]*$/.test(hash)) return

    const target = document.getElementById(hash.slice(1))
    if (!target || !lenis) return

    event.preventDefault()
    window.history.pushState(null, '', hash)
    // No offset: Lenis already honours scroll-margin-top, so the sections'
    // scroll-mt-24 clears the sticky nav. Passing an offset as well landed links
    // 192px down. force: a link in the mobile menu is clicked while paused.
    //
    // Sections below the fold skip layout until they approach the viewport
    // (content-visibility in globals.css), so the first estimate of where a
    // section starts can be off. Once the scroll arrives, check the target and
    // correct, at most twice.
    const land = (attempt: number) => {
      lenis?.scrollTo(hash === '#top' ? 0 : target, {
        force: true,
        ...(attempt > 0 ? { duration: 0.35 } : {}),
        onComplete: () => {
          if (hash === '#top' || attempt >= 2) return
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
          if (Math.abs(target.getBoundingClientRect().top - margin) > 2) land(attempt + 1)
        },
      })
    }
    land(0)
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  document.addEventListener('click', onClick)
  return () => {
    document.removeEventListener('click', onClick)
    lenis?.destroy()
    lenis = null
  }
}

/** Called by overlays, whose own panel scrolls natively. */
export function pauseSmoothScroll(): void {
  lenis?.stop()
}

export function resumeSmoothScroll(): void {
  lenis?.start()
}
