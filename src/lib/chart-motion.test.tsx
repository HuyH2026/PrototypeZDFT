import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { CHART_DURATION, useChartMotion, useReducedMotion } from './chart-motion'

// A minimal matchMedia stand-in. jsdom's own implementation always reports
// `matches: false`, so the reduced-motion branch is only reachable with a stub.
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>()
  const list = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => list),
  )
  return { list, fire: (next: boolean) => ((list.matches = next), listeners.forEach((fn) => fn())) }
}

function Probe({ begin = 0 }: { begin?: number }) {
  const motion = useChartMotion(begin)
  return <span data-testid="probe">{JSON.stringify(motion)}</span>
}

function ReducedProbe() {
  return <span data-testid="probe">{String(useReducedMotion())}</span>
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useChartMotion', () => {
  it('animates on the app’s slowest duration by default', () => {
    render(<Probe />)
    expect(JSON.parse(screen.getByTestId('probe').textContent!)).toEqual({
      isAnimationActive: true,
      animationDuration: CHART_DURATION,
      animationEasing: 'ease-out',
      animationBegin: 0,
    })
  })

  it('turns a stagger index into a delay', () => {
    render(<Probe begin={2} />)
    expect(JSON.parse(screen.getByTestId('probe').textContent!).animationBegin).toBe(180)
  })

  // recharts animates SVG attributes from script, so the CSS reduced-motion block
  // cannot reach it — the preference has to switch the animation off here.
  it('switches the animation off, stagger and all, under reduced motion', () => {
    stubMatchMedia(true)
    render(<Probe begin={3} />)
    const motion = JSON.parse(screen.getByTestId('probe').textContent!)
    expect(motion.isAnimationActive).toBe(false)
    expect(motion.animationBegin).toBe(0)
  })

  it('survives an environment without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    render(<Probe />)
    expect(JSON.parse(screen.getByTestId('probe').textContent!).isAnimationActive).toBe(true)
  })
})

describe('useReducedMotion', () => {
  // The OS setting is a toggle, not a page-load constant.
  it('follows the preference changing while the page is open', () => {
    const { fire } = stubMatchMedia(false)
    render(<ReducedProbe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('false')

    act(() => fire(true))
    expect(screen.getByTestId('probe')).toHaveTextContent('true')
  })
})
