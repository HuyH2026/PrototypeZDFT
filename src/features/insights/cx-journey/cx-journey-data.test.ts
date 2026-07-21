import { describe, expect, it } from 'vitest'
import { AGENT_ROWS, FLOW_HEADER, FLOW_SANKEY, TREND_CHARTS } from './cx-journey-data'

describe('cx-journey-data', () => {
  it('exposes three flow header stats', () => {
    expect(FLOW_HEADER.map((s) => s.value)).toEqual(['550,000', '530,000', '453,000'])
  })

  it('has 8 sankey nodes and links wired to valid node indices', () => {
    expect(FLOW_SANKEY.nodes).toHaveLength(8)
    for (const link of FLOW_SANKEY.links) {
      expect(link.source).toBeGreaterThanOrEqual(0)
      expect(link.source).toBeLessThan(FLOW_SANKEY.nodes.length)
      expect(link.target).toBeGreaterThanOrEqual(0)
      expect(link.target).toBeLessThan(FLOW_SANKEY.nodes.length)
    }
  })

  it('has three agent rows in order', () => {
    expect(AGENT_ROWS.map((r) => r.agent)).toEqual(['AI + Human', 'AI', 'Human'])
  })

  it('has 8 trend charts, each with data for all three granularities', () => {
    expect(TREND_CHARTS).toHaveLength(8)
    for (const chart of TREND_CHARTS) {
      expect(chart.data.weekly.length).toBeGreaterThan(0)
      expect(chart.data.monthly.length).toBeGreaterThan(0)
      expect(chart.data.quarterly.length).toBeGreaterThan(0)
    }
  })

  it('marks the total-conversations chart as stacked', () => {
    const stacked = TREND_CHARTS.filter((c) => c.stacked)
    expect(stacked).toHaveLength(1)
    expect(stacked[0].key).toBe('total-conversations')
  })
})
