// One-shot "has this scrolled into view yet?" for entrance animations.
//
// The Agent Overview is a ~3,600px scroll. A mount animation on a card two
// screens down has finished long before anyone sees it, so the animation may as
// well not exist. This defers it until the element is actually on screen, and
// then latches — an element that re-animates every time it scrolls past reads as
// a page that cannot settle.
//
// It fails *visible*: without IntersectionObserver (jsdom, older browsers)
// `inView` starts true, so callers animate on mount as they did before rather
// than hiding content that will never be revealed.
import { useEffect, useRef, useState } from 'react'

const SUPPORTED = typeof IntersectionObserver !== 'undefined'

export function useInView<T extends Element = HTMLDivElement>(
  // A little negative margin so the reveal begins just before the element clears
  // the fold, rather than after it has already been read.
  rootMargin = '0px 0px -10% 0px',
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(!SUPPORTED)

  useEffect(() => {
    if (!SUPPORTED || inView) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return { ref, inView }
}
