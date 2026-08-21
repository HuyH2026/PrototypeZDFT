import { describe, it, expect } from 'vitest'
import { deriveRoleData } from './role-data'
import { DATA } from './dashboard-data'

const base = DATA.platform

describe('deriveRoleData', () => {
  it('returns the base object unchanged for the null (Default) role', () => {
    expect(deriveRoleData(base, null)).toBe(base)
  })

  it('orders health metrics per role (ops leads with resolution then escalations)', () => {
    const d = deriveRoleData(base, 'ops')
    expect(d.metrics.map((m) => m.key)).toEqual(['res', 'esc', 'aht', 'csat'])
  })

  it('orders health metrics per role (exec leads with CSAT)', () => {
    const d = deriveRoleData(base, 'exec')
    expect(d.metrics[0].key).toBe('csat')
  })

  it('preserves all metrics (reorder only, never drops)', () => {
    const d = deriveRoleData(base, 'cs')
    expect(new Set(d.metrics.map((m) => m.key))).toEqual(
      new Set(base.metrics.map((m) => m.key)),
    )
    expect(d.metrics.length).toBe(base.metrics.length)
  })

  it('swaps the health narrative per role', () => {
    const ops = deriveRoleData(base, 'ops').healthDigest
    expect(ops.narrative).not.toBe(base.healthDigest.narrative)
    expect(deriveRoleData(base, 'exec').healthDigest.narrative).not.toBe(ops.narrative)
    // The verdict is not role-tailored — only the prose is.
    expect(ops.verdict).toBe(base.healthDigest.verdict)
  })

  it('does not mutate the base data', () => {
    const before = base.metrics.map((m) => m.key)
    deriveRoleData(base, 'ops')
    expect(base.metrics.map((m) => m.key)).toEqual(before)
  })

  it('is deterministic — same input yields same output', () => {
    expect(deriveRoleData(base, 'knowledge')).toEqual(deriveRoleData(base, 'knowledge'))
  })
})
