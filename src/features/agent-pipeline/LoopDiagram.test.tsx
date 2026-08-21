import { render, screen, within } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CYCLES, LANES, LOOP, TOTAL_CYCLES } from './pipeline-data'
import { LoopDiagram, TICKER_STEP_MS } from './LoopDiagram'

const COUNTS = { deployed: 4, testing: 2, held: 2, 'rolled-back': 1 } as const

function renderDiagram(overrides: Partial<Parameters<typeof LoopDiagram>[0]> = {}) {
  const { container, unmount } = render(
    <LoopDiagram
      loop={LOOP}
      cycle={CYCLES[0]}
      counts={{ ...COUNTS }}
      paused={false}
      totalCycles={TOTAL_CYCLES}
      managedCount={15}
      memoryTried={6}
      memoryRuledOut={4}
      {...overrides}
    />,
  )
  return Object.assign(within(screen.getByTestId('loop-diagram')), { container, unmount })
}

describe('LoopDiagram', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('names the three stages of the loop', () => {
    const view = renderDiagram()
    expect(view.getByText('SCHEDULE')).toBeInTheDocument()
    expect(view.getByText('MEMORY')).toBeInTheDocument()
    expect(view.getByText('OPERATOR')).toBeInTheDocument()
  })

  it('draws all four lanes with the counts it was given', () => {
    const view = renderDiagram()
    for (const lane of LANES) {
      const row = within(view.getByTestId(`lane-${lane}`))
      expect(row.getByTestId('lane-count')).toHaveTextContent(String(COUNTS[lane]))
    }
    expect(view.getByTestId('lane-deployed')).toHaveTextContent('Applied')
    expect(view.getByTestId('lane-held')).toHaveTextContent('Pending asks')
  })

  it('draws the return edge, so the diagram reads as a loop', () => {
    const view = renderDiagram()
    expect(view.getByTestId('loop-return-edge')).toHaveTextContent('learns')
  })

  it('reports the derived fleet size, not an authored one', () => {
    const view = renderDiagram({ managedCount: 22 })
    expect(view.getByText('LIVE AGENTS')).toBeInTheDocument()
    expect(view.getByTestId('stat-managed')).toHaveTextContent('22')
  })

  it('opens the ticker on the cycle’s first journal line and advances', () => {
    const view = renderDiagram()
    expect(view.getByTestId('loop-ticker-label')).toHaveTextContent(
      `CYCLE #${CYCLES[0].ordinal} · CLOSE RECORD`,
    )
    expect(view.getByTestId('loop-ticker')).toHaveAccessibleName(
      `Cycle ${CYCLES[0].ordinal} close-record journal entry`,
    )
    expect(view.getByTestId('loop-ticker')).toHaveTextContent(CYCLES[0].journal[0])
    act(() => {
      vi.advanceTimersByTime(TICKER_STEP_MS)
    })
    expect(view.getByTestId('loop-ticker')).toHaveTextContent(CYCLES[0].journal[1])
  })

  it('restarts the ticker when a different cycle is selected', () => {
    const { rerender } = render(
      <LoopDiagram
        loop={LOOP}
        cycle={CYCLES[0]}
        counts={{ ...COUNTS }}
        paused={false}
        totalCycles={TOTAL_CYCLES}
        managedCount={15}
        memoryTried={6}
        memoryRuledOut={4}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(TICKER_STEP_MS)
    })
    rerender(
      <LoopDiagram
        loop={LOOP}
        cycle={CYCLES[1]}
        counts={{ ...COUNTS }}
        paused={false}
        totalCycles={TOTAL_CYCLES}
        managedCount={15}
        memoryTried={6}
        memoryRuledOut={4}
      />,
    )
    expect(screen.getByTestId('loop-ticker')).toHaveTextContent(CYCLES[1].journal[0])
  })

  it('stops and says so when the loop is paused', () => {
    const view = renderDiagram({ paused: true })
    expect(view.getByTestId('loop-diagram-root')).toHaveAttribute('data-loop-state', 'paused')
    expect(view.getByTestId('loop-ticker-label')).toHaveTextContent('LOOP STATUS')
    expect(view.getByTestId('loop-ticker')).toHaveTextContent(
      'No new diagnostic passes or actions will run while paused. Resume the loop to continue.',
    )
    act(() => {
      vi.advanceTimersByTime(TICKER_STEP_MS * 3)
    })
    expect(view.getByTestId('loop-ticker')).toHaveTextContent(
      'No new diagnostic passes or actions will run while paused. Resume the loop to continue.',
    )
  })

  it('frames the running loop as mixed authority', () => {
    const view = renderDiagram()
    expect(view.getByText('OUTER LOOP · MIXED AUTHORITY')).toBeInTheDocument()
    expect(view.queryByText(/OUTER LOOP · AUTONOMOUS/i)).not.toBeInTheDocument()
    expect(view.getByTestId('loop-diagram-root')).toHaveAttribute('data-loop-state', 'autonomous')
  })

  it('labels the MEMORY node with the numbers it was given, not a signal count', () => {
    const view = renderDiagram({ memoryTried: 9, memoryRuledOut: 5 })
    expect(view.getByText('9 remembered · 5 ruled out')).toBeInTheDocument()
  })

  it('stops every wire’s travelling dots while paused', () => {
    const running = renderDiagram({ paused: false })
    expect(running.container.querySelectorAll('.animate-loop-wire').length).toBeGreaterThan(0)
    running.unmount()

    const paused = renderDiagram({ paused: true })
    expect(paused.container.querySelectorAll('.animate-loop-wire')).toHaveLength(0)
  })
})
