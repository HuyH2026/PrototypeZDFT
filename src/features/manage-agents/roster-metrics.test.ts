import { describe, it, expect } from 'vitest'
import { SEED_AGENTS, type RosterAgent } from './roster-data'
import {
  arPercent,
  conversationTotal,
  escalationPercent,
  formatCount,
  segments,
} from './roster-metrics'

const BRAND_NAMES: Record<string, string> = {
  uber: 'Uber',
  'uber-eats': 'Uber Eats',
  'uber-freight': 'Uber Freight',
  'uber-health': 'Uber Health',
}
const brandName = (id: string) => BRAND_NAMES[id] ?? id

const FRESH: RosterAgent = {
  id: 'new-agent-8',
  brandId: 'uber',
  name: 'New Agent',
  channels: ['Email'],
  health: null,
  ar: null,
  conversations: null,
  insightCount: 0,
}

describe('roster-metrics', () => {
  it('totals conversations across the roster, ignoring agents with no data', () => {
    expect(conversationTotal(SEED_AGENTS)).toBe(34744)
    expect(conversationTotal([...SEED_AGENTS, FRESH])).toBe(34744)
  })

  it('weights AR by conversations', () => {
    expect(arPercent(SEED_AGENTS)).toBe(84)
    expect(escalationPercent(SEED_AGENTS)).toBe(16)
    expect(arPercent(SEED_AGENTS.filter((a) => a.brandId === 'uber'))).toBe(82)
  })

  it('returns null when nothing has data', () => {
    expect(arPercent([FRESH])).toBeNull()
    expect(escalationPercent([FRESH])).toBeNull()
    expect(conversationTotal([FRESH])).toBe(0)
  })

  it('groups conversation segments by brand, largest first', () => {
    const rows = segments(SEED_AGENTS, { groupBy: 'brand', metric: 'conversations', brandName })
    expect(rows.map((r) => r.label)).toEqual([
      'Uber',
      'Uber Eats',
      'Uber Health',
      'Uber Freight',
    ])
    expect(rows[0]).toMatchObject({ value: 15520 })
    expect(rows[0].color).not.toBe(rows[1].color)
  })

  it('groups by agent when a single brand is in scope', () => {
    const uber = SEED_AGENTS.filter((a) => a.brandId === 'uber')
    const rows = segments(uber, { groupBy: 'agent', metric: 'ar', brandName })
    expect(rows.map((r) => r.label)).toEqual(['Uber Rider Trip', 'Driver Earnings'])
    expect(rows.map((r) => r.value)).toEqual([84, 79])
  })

  it('formats counts with thousands separators', () => {
    expect(formatCount(34744)).toBe('34,744')
  })
})
