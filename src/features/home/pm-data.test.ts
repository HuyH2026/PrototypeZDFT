import { describe, it, expect } from 'vitest'
import { PM_DATA, PM_NOW, type LifecycleStageKey } from './pm-data'

describe('pm-data', () => {
  it('has five KPI cards including ARR at risk and ARR asking', () => {
    expect(PM_DATA.kpis).toHaveLength(5)
    const labels = PM_DATA.kpis.map((k) => k.label)
    expect(labels).toContain('ARR at risk')
    expect(labels).toContain('ARR asking')
  })

  it('lifecycle has the four stages in Detected→Shipped order', () => {
    const keys = PM_DATA.lifecycle.map((s) => s.key)
    expect(keys).toEqual(['detected', 'planned', 'in-dev', 'shipped'] as LifecycleStageKey[])
    expect(PM_DATA.lifecycle.every((s) => s.amountValue > 0 && s.recCount > 0)).toBe(true)
  })

  it('every spotlight item declares at least one filter tab and a valid stage', () => {
    const stages = new Set<LifecycleStageKey>(['detected', 'planned', 'in-dev', 'shipped'])
    expect(PM_DATA.spotlight.length).toBeGreaterThan(0)
    for (const item of PM_DATA.spotlight) {
      expect(item.filters.length).toBeGreaterThan(0)
      expect(stages.has(item.stage)).toBe(true)
    }
  })

  it('each spotlight tab has at least one item', () => {
    for (const tab of ['trending', 'at-risk', 'asking'] as const) {
      expect(PM_DATA.spotlight.some((i) => i.filters.includes(tab))).toBe(true)
    }
  })

  it('opportunities are well-formed with impact 0-100 and firstSeen before PM_NOW', () => {
    expect(PM_DATA.opportunities.length).toBeGreaterThan(0)
    for (const o of PM_DATA.opportunities) {
      expect(o.impact).toBeGreaterThanOrEqual(0)
      expect(o.impact).toBeLessThanOrEqual(100)
      expect(o.firstSeen).toBeLessThanOrEqual(PM_NOW)
      expect(['request', 'bug']).toContain(o.type)
      expect(['asking', 'at-risk']).toContain(o.revenueState)
      expect(o.volumeTrend.length).toBeGreaterThan(0)
    }
  })

  it('includes the SAML SSO opportunity from the design', () => {
    const saml = PM_DATA.opportunities.find((o) => o.title.includes('SAML SSO'))
    expect(saml).toBeDefined()
    expect(saml!.impact).toBe(88)
    expect(saml!.revenue).toBe('$610K')
  })
})
