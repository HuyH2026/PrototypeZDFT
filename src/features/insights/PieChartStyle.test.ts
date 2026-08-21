import { describe, expect, it } from 'vitest'
import { DONUT_INNER_RADIUS_RATIO } from './ai-performances/CustomInsights'
import { INSIGHT_DONUT_INNER_RADIUS_RATIO } from './ai-performances/cards/InsightCard'
import { TRAFFIC_SPLIT_INNER_RADIUS_RATIO } from '../experiments/setup/results/TrafficSplitCard'

describe('pie chart styling', () => {
  it('uses a 19% ring on every pie and donut chart', () => {
    expect(DONUT_INNER_RADIUS_RATIO).toBe(0.81)
    expect(INSIGHT_DONUT_INNER_RADIUS_RATIO).toBe(0.81)
    expect(TRAFFIC_SPLIT_INNER_RADIUS_RATIO).toBe(0.81)
  })
})
