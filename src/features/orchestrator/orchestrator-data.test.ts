import { describe, it, expect } from 'vitest'
import { METRICS, AUTOMATIONS } from './orchestrator-data'

describe('orchestrator-data', () => {
  it('defines exactly four metric cards in order', () => {
    expect(METRICS.map((m) => m.key)).toEqual([
      'runs', 'success', 'triggered', 'sentiment',
    ])
  })

  it('matches the Figma-exact headline metric values', () => {
    expect(METRICS.find((m) => m.key === 'runs')!.value).toBe('32,128')
    expect(METRICS.find((m) => m.key === 'success')!.value).toBe('98%')
    expect(METRICS.find((m) => m.key === 'triggered')!).toMatchObject({ value: '20,109', sub: '80%' })
    expect(METRICS.find((m) => m.key === 'sentiment')!).toMatchObject({ value: '69%', sentiment: true })
  })

  it('marks Success rate with an upward delta', () => {
    const success = METRICS.find((m) => m.key === 'success')!
    expect(success).toMatchObject({ delta: '10%', trend: 'up' })
  })

  it('defines the three Figma automations in order', () => {
    expect(AUTOMATIONS.map((a) => a.name)).toEqual([
      'Call users with issues', 'Refund request', 'Send discount code',
    ])
  })

  it('gives Refund request a null success rate and off state', () => {
    const refund = AUTOMATIONS.find((a) => a.name === 'Refund request')!
    expect(refund.successRate).toBeNull()
    expect(refund.on).toBe(false)
  })

  it('authors each automation with a positive run count and primary node', () => {
    for (const a of AUTOMATIONS) {
      expect(a.runs).toBeGreaterThan(0)
      expect(a.primaryNode.length).toBeGreaterThan(0)
      expect(a.extraNodes).toBeGreaterThanOrEqual(0)
    }
  })
})
