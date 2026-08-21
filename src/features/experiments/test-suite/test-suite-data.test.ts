import { describe, it, expect } from 'vitest'
import {
  PASS_RATE_GOOD_FLOOR,
  RUN_STATS,
  TEST_CASES,
  TEST_RUNS,
  TEST_SUITE_STATS,
} from './test-suite-data'

describe('test-suite-data', () => {
  it('carries the three stat cards from the frame', () => {
    expect(TEST_SUITE_STATS.map((s) => s.label)).toEqual([
      'Pass Rate',
      'Passing Runs',
      'Agent Coverage',
    ])
  })

  it('keeps every meter percentage in range and every ratio consistent', () => {
    for (const s of TEST_SUITE_STATS) {
      if (s.kind === 'meter') {
        expect(s.percent).toBeGreaterThanOrEqual(0)
        expect(s.percent).toBeLessThanOrEqual(100)
      } else {
        // A passing count above the total would render a nonsense ratio.
        expect(s.passing).toBeLessThanOrEqual(s.total)
      }
    }
  })

  it('gives every test case a unique id and an in-range pass rate', () => {
    expect(new Set(TEST_CASES.map((t) => t.id)).size).toBe(TEST_CASES.length)
    for (const t of TEST_CASES) {
      expect(t.passRate).toBeGreaterThanOrEqual(0)
      expect(t.passRate).toBeLessThanOrEqual(100)
    }
  })

  it('spans both sides of the pass-rate floor, so both tints are exercised', () => {
    expect(TEST_CASES.some((t) => t.passRate >= PASS_RATE_GOOD_FLOOR)).toBe(true)
    expect(TEST_CASES.some((t) => t.passRate < PASS_RATE_GOOD_FLOOR)).toBe(true)
  })

  it('covers both last-run outcomes', () => {
    expect(new Set(TEST_CASES.map((t) => t.lastRun.status))).toEqual(new Set(['passed', 'failed']))
  })

  it('carries the populated run metrics and history from the current frame', () => {
    expect(RUN_STATS.map((s) => s.value)).toEqual(['114', '72', '42'])
    expect(TEST_RUNS).toHaveLength(6)
    expect(new Set(TEST_RUNS.map((run) => run.result))).toEqual(
      new Set(['in-progress', 'passed', 'failed']),
    )
  })
})
