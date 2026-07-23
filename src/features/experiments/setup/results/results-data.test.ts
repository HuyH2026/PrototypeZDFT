import { describe, it, expect } from 'vitest'
import {
  EXPERIMENT_DETAILS,
  DEFAULT_EXPERIMENT_DETAIL,
  getExperimentDetail,
} from './results-data'
import { EXPERIMENTS } from '../../experiments-data'

describe('experiment details', () => {
  it('has a detail for every table experiment id', () => {
    for (const e of EXPERIMENTS) {
      expect(EXPERIMENT_DETAILS[e.id]).toBeDefined()
    }
  })

  it('each detail is internally consistent', () => {
    for (const d of Object.values(EXPERIMENT_DETAILS)) {
      const sum = d.trafficSplit.reduce((n, s) => n + s.value, 0)
      expect(sum).toBe(d.trafficSplitTotal)
      expect(d.metricCards.length).toBeGreaterThanOrEqual(1)
      expect(d.winnerVariants.some((v) => v.isWinner)).toBe(true)
    }
  })

  it('getExperimentDetail falls back to the default for unknown/empty id', () => {
    expect(getExperimentDetail(null)).toBe(DEFAULT_EXPERIMENT_DETAIL)
    expect(getExperimentDetail('nope')).toBe(DEFAULT_EXPERIMENT_DETAIL)
    expect(getExperimentDetail('e2')).toBe(EXPERIMENT_DETAILS.e2)
  })
})
