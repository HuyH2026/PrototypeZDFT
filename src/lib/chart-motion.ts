// Shared entrance motion for the recharts marks (`Line`, `Area`, `Bar`, `Pie`).
//
// recharts animates SVG attributes from script, so the CSS reduced-motion block
// in theme.css cannot reach it — the preference has to be read here and turned
// into `isAnimationActive`. Duration and easing mirror the CSS tokens (--dur-slow
// / --ease-soft is not expressible in recharts' easing enum, so 'ease-out' is the
// closest of the four it accepts) so a chart arriving next to a card feels like
// one movement rather than two.
import { useEffect, useState } from 'react'

/** --dur-slow. Charts get the longest of the four speeds: they are the largest
 *  thing that moves, and a chart that snaps into place reads as a glitch. */
export const CHART_DURATION = 620

export type ChartMotion = {
  isAnimationActive: boolean
  animationDuration: number
  animationEasing: 'ease-out'
  /** Stagger, for a group of marks that should arrive in order. */
  animationBegin: number
}

const QUERY = '(prefers-reduced-motion: reduce)'

function prefersReduced(): boolean {
  // Guarded: jsdom and older browsers may not implement matchMedia.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

/** Tracks the reduced-motion preference, including a change made while the page
 *  is open (the OS setting is a toggle, not a page-load constant). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReduced)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(QUERY)
    const onChange = () => setReduced(list.matches)
    // Safari < 14 only has the deprecated listener API; both are optional here
    // because jsdom's MediaQueryList has historically shipped neither.
    list.addEventListener?.('change', onChange)
    return () => list.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

/**
 * Props to spread onto a recharts mark: `<Line {...useChartMotion()} />`.
 *
 * `begin` staggers a mark within a group (in mark-order, not milliseconds).
 */
export function useChartMotion(begin = 0): ChartMotion {
  const reduced = useReducedMotion()
  return {
    isAnimationActive: !reduced,
    animationDuration: CHART_DURATION,
    animationEasing: 'ease-out',
    animationBegin: reduced ? 0 : begin * 90,
  }
}
