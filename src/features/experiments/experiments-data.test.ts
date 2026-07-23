import { describe, it, expect } from 'vitest'
import {
  METRICS,
  EXPERIMENTS,
  SETUP_VARIANTS,
  SUMMARY_VARIANTS,
  RECOMMENDATION,
  WINNER_METRICS,
  CHANNEL_OPTIONS,
  TIME_ZONE,
  DEFAULT_TEST_NAME,
  DEFAULT_TEST_DESCRIPTION,
} from './experiments-data'

describe('experiments-data', () => {
  it('has four metrics including CSAT with a green accent', () => {
    expect(METRICS).toHaveLength(4)
    expect(METRICS.map((m) => m.label)).toEqual([
      'Total Tests',
      'Total conversations',
      'Resolutions',
      'CSAT',
    ])
    const resolutions = METRICS.find((m) => m.label === 'Resolutions')
    expect(resolutions?.value).toBe('41,312')
    expect(resolutions?.sub).toBe('80%')
    expect(METRICS.find((m) => m.label === 'CSAT')?.accent).toBe('green')
  })

  it('has five experiments with valid splits summing near 100', () => {
    expect(EXPERIMENTS).toHaveLength(5)
    expect(EXPERIMENTS.map((e) => e.name)).toContain('Abandoned Cart Recovery')
    for (const e of EXPERIMENTS) {
      expect(e.splits.length).toBeGreaterThanOrEqual(2)
      expect(e.splits.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(99)
    }
  })
})

describe('A/B Test Setup data', () => {
  it('seeds Control and Variant A with correct badge colors and traffic', () => {
    expect(SETUP_VARIANTS).toHaveLength(2)
    const [control, variantA] = SETUP_VARIANTS
    expect(control.badge).toBe('Control')
    expect(control.badgeColor).toBe('#01567a')
    expect(control.traffic).toBe(50)
    expect(variantA.badge).toBe('Variant A')
    expect(variantA.badgeColor).toBe('#e05c34')
    expect(variantA.traffic).toBe(50)
  })

  it('provides summary variants and a recommendation', () => {
    expect(SUMMARY_VARIANTS.map((v) => v.title)).toEqual([
      'Manual login',
      'Fully automated login assistance',
    ])
    expect(RECOMMENDATION.title).toBe('Test duration: 2 weeks')
  })

  it('provides winner metrics, channel options, timezone, and defaults', () => {
    expect(WINNER_METRICS).toEqual(['Deflection', 'Sentiment'])
    expect(CHANNEL_OPTIONS).toContain('Widget')
    expect(TIME_ZONE).toBe('Pacific time GTM -8, Los Angeles')
    expect(DEFAULT_TEST_NAME).toBe('Login fix method comparison')
    expect(DEFAULT_TEST_DESCRIPTION.length).toBeGreaterThan(0)
  })
})
