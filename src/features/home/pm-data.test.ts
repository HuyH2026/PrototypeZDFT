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

  it('each spotlight tab is a non-empty curated list', () => {
    expect(PM_DATA.spotlight.trending.length).toBeGreaterThan(0)
    expect(PM_DATA.spotlight.atRisk.length).toBeGreaterThan(0)
    expect(PM_DATA.spotlight.asking.length).toBeGreaterThan(0)
  })

  it('trending rows carry a valid lifecycle stage and a trend %', () => {
    const stages = new Set<LifecycleStageKey>(['detected', 'planned', 'in-dev', 'shipped'])
    for (const item of PM_DATA.spotlight.trending) {
      expect(stages.has(item.stage)).toBe(true)
      expect(item.trendPct).toMatch(/%$/)
    }
  })

  it('at-risk rows carry a bug/gap tag and a revenue amount', () => {
    for (const item of PM_DATA.spotlight.atRisk) {
      expect(['bug', 'gap']).toContain(item.tag)
      expect(item.amount).toMatch(/^\$/)
    }
  })

  it('asking rows carry a valid lifecycle stage and a revenue amount', () => {
    const stages = new Set<LifecycleStageKey>(['detected', 'planned', 'in-dev', 'shipped'])
    for (const item of PM_DATA.spotlight.asking) {
      expect(stages.has(item.stage)).toBe(true)
      expect(item.amount).toMatch(/^\$/)
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
