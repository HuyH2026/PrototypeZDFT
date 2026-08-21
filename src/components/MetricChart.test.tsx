import { render } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { MetricChart } from './MetricChart'

describe('MetricChart', () => {
  beforeEach(() => {
    // Mock ResizeObserver to simulate observed sizing so Recharts renders the chart
    const mockResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      private callback: ResizeObserverCallback

      observe(element: Element) {
        // Simulate a resize with realistic dimensions
        const entry = {
          target: element,
          contentRect: { width: 400, height: 240 },
        } as unknown as ResizeObserverEntry
        this.callback([entry], this)
      }

      unobserve() {}
      disconnect() {}
    }

    globalThis.ResizeObserver = mockResizeObserver
  })

  afterEach(() => {
    // Restore the no-op version from setup.ts
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('renders an svg for the given series without crashing', () => {
    const { container } = render(
      <MetricChart
        series={[
          { x: 'Jul 1', value: 10 },
          { x: 'Jul 14', value: 20 },
          { x: 'Jul 28', value: 47 },
        ]}
      />,
    )
    // recharts ResponsiveContainer mounts a wrapper div even at zero size.
    expect(container.querySelector('.recharts-responsive-container')).toBeTruthy()
  })

  it('renders a tooltip wrapper for hover', () => {
    const { container } = render(
      <MetricChart
        series={[
          { x: 'Jul 1', value: 10 },
          { x: 'Jul 28', value: 47 },
        ]}
      />,
    )
    expect(container.querySelector('.recharts-tooltip-wrapper')).toBeTruthy()
  })
})
