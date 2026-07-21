import { describe, it, expect } from 'vitest'
import { computeHealthView, parseMetricValue, formatMetricValue, scoreToState } from './health-aggregate'
import { DATA } from './dashboard-data'
import type { ChannelKey } from './dashboard-data'

const ALL: Set<ChannelKey> = new Set(['messaging', 'email', 'voice', 'headless'])

describe('health-aggregate', () => {
  it('bypasses aggregation when all four channels are selected', () => {
    const view = computeHealthView(DATA.platform, ALL)
    expect(view.score).toBe(DATA.platform.score)          // 94
    expect(view.trend).toBe(DATA.platform.trend)          // same reference
    expect(view.metrics).toBe(DATA.platform.metrics)      // same reference
    expect(view.aiSummary).toBe(DATA.platform.aiSummary)  // hand-written summary
  })

  it('volume-weights the score for a subset', () => {
    // messaging(97, share 58) + email(93, share 24): 0.7073*97 + 0.2927*93 = 95.83
    const view = computeHealthView(DATA.platform, new Set<ChannelKey>(['messaging', 'email']))
    expect(view.score).toBe(96)
    expect(view.healthState).toBe('good')
  })

  it('volume-weights and reformats a percent metric', () => {
    // resolution messaging 86 / email 79 → 0.7073*86 + 0.2927*79 = 83.95 → "84%"
    const view = computeHealthView(DATA.platform, new Set<ChannelKey>(['messaging', 'email']))
    const res = view.metrics.find((m) => m.key === 'res')!
    expect(res.value).toBe('84%')
    expect(res.up).toBe(true)   // both deltas positive
    expect(res.good).toBe(true) // resolution: goodWhenUp
  })

  it('returns a single channel’s own numbers when only it is selected', () => {
    const view = computeHealthView(DATA.platform, new Set<ChannelKey>(['voice']))
    expect(view.score).toBe(82)
    expect(view.healthState).toBe('attention')
    const res = view.metrics.find((m) => m.key === 'res')!
    expect(res.value).toBe('71%')  // voice resolution
  })

  it('parses and reformats each value unit', () => {
    expect(parseMetricValue('82%', 'percent')).toBe(82)
    expect(formatMetricValue(83.95, 'percent')).toBe('84%')
    expect(parseMetricValue('4.6', 'score')).toBe(4.6)
    expect(formatMetricValue(4.55, 'score')).toBe('4.6')
    expect(parseMetricValue('1m 48s', 'duration')).toBe(108)
    expect(formatMetricValue(108, 'duration')).toBe('1m 48s')
    expect(formatMetricValue(125, 'duration')).toBe('2m 05s')
  })

  it('maps aggregated score to a health state', () => {
    expect(scoreToState(94)).toBe('good')
    expect(scoreToState(82)).toBe('attention')
    expect(scoreToState(60)).toBe('critical')
  })
})
