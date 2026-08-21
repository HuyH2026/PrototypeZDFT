import { describe, expect, it } from 'vitest'
import { BRIEFING_CATALOG, selectBriefings, type BriefingFinding } from './briefing-data'

const F = (over: Partial<BriefingFinding>): BriefingFinding => ({
  id: 'x',
  scope: 'ai-performances',
  metric: 'Metric',
  headline: 'Headline',
  deltaPct: 20,
  threshold: 10,
  priority: 1,
  evidence: { observation: 'obs' },
  ...over,
})

const EMPTY = { dismissed: [], seen: {} }

describe('selectBriefings', () => {
  it('drops findings below their threshold (by magnitude, ignoring sign)', () => {
    const catalog = [F({ id: 'a', deltaPct: 5, threshold: 10 }), F({ id: 'b', deltaPct: -20, threshold: 10 })]
    const out = selectBriefings(catalog, EMPTY, 0, 3)
    expect(out.map((f) => f.id)).toEqual(['b'])
  })

  it('permanently excludes dismissed findings', () => {
    const catalog = [F({ id: 'a' }), F({ id: 'b' })]
    const out = selectBriefings(catalog, { dismissed: ['a'], seen: {} }, 99, 3)
    expect(out.map((f) => f.id)).toEqual(['b'])
  })

  it('excludes findings seen within the cooldown window', () => {
    const catalog = [F({ id: 'a' })]
    const out = selectBriefings(catalog, { dismissed: [], seen: { a: 5 } }, 6, 3)
    expect(out).toHaveLength(0)
  })

  it('resurfaces findings whose seen entry is older than the cooldown', () => {
    const catalog = [F({ id: 'a' })]
    const out = selectBriefings(catalog, { dismissed: [], seen: { a: 5 } }, 9, 3)
    expect(out.map((f) => f.id)).toEqual(['a'])
  })

  it('ranks by priority desc, then by absolute delta desc', () => {
    const catalog = [
      F({ id: 'lowPrio', priority: 1, deltaPct: 50 }),
      F({ id: 'hiPrioSmall', priority: 5, deltaPct: 12 }),
      F({ id: 'hiPrioBig', priority: 5, deltaPct: -40 }),
    ]
    const out = selectBriefings(catalog, EMPTY, 0, 3)
    expect(out.map((f) => f.id)).toEqual(['hiPrioBig', 'hiPrioSmall', 'lowPrio'])
  })

  it('caps the result at three findings', () => {
    const catalog = ['a', 'b', 'c', 'd'].map((id, i) => F({ id, priority: 10 - i }))
    expect(selectBriefings(catalog, EMPTY, 0, 3)).toHaveLength(3)
  })

  it('returns empty when everything is gated', () => {
    const catalog = [F({ id: 'a', deltaPct: 1, threshold: 10 })]
    expect(selectBriefings(catalog, EMPTY, 0, 3)).toEqual([])
  })

  it('ships a catalog of three findings, the first being the reopens finding', () => {
    expect(BRIEFING_CATALOG).toHaveLength(3)
    const reopens = BRIEFING_CATALOG.find((f) => f.id === 'reopens')
    expect(reopens?.scope).toBe('ai-performance-reopens')
    expect(reopens?.evidence.suspectedDriver).toBeTruthy()
  })
})
