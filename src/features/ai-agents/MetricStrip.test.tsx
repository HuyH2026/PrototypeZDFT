import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetricStrip } from './MetricStrip'
import type { Metric } from './agent-builder-data'

function metric(key: string): Metric {
  return { key, label: key, value: '1', delta: '1%', trend: 'up', good: true }
}

describe('MetricStrip', () => {
  it('lays out five metrics in a single row of five', () => {
    render(<MetricStrip metrics={Array.from({ length: 5 }, (_, i) => metric(`m${i}`))} />)
    expect(screen.getByTestId('metric-strip')).toHaveClass('grid-cols-5')
  })

  it('wraps eight metrics into two rows of four', () => {
    render(<MetricStrip metrics={Array.from({ length: 8 }, (_, i) => metric(`m${i}`))} />)
    expect(screen.getByTestId('metric-strip')).toHaveClass('grid-cols-4')
  })
})
