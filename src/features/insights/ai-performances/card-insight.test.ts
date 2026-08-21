import { describe, expect, it } from 'vitest'
import { cardTone, insightRows } from './card-insight'
import type { StatCard } from './ai-performances-data'

const attentionCard: StatCard = {
  title: 'Resolution rate',
  value: '89%',
  delta: { label: '+12%', up: true },
  rows: [
    { value: '90%', delta: { label: '-2%', up: false } },
    { value: '88%', delta: { label: '+6%', up: true } },
    { value: '91%', delta: { label: '+2%', up: true } },
  ],
  insight: {
    headline: 'Test insight',
  },
}

const improvedCard: StatCard = {
  title: 'Realized savings',
  value: '$740K',
  delta: { label: '+32%', up: true },
  rows: [
    { value: '$375K', delta: { label: '+17%', up: true } },
    { value: '$150K', delta: { label: '+4%', up: true } },
    { value: '$175K', delta: { label: '+10%', up: true } },
  ],
  insight: {
    headline: 'Test insight',
  },
}

const naRowCard: StatCard = {
  title: 'CSAT',
  value: '4.3',
  delta: { label: '+9%', up: true },
  rows: [
    { value: '4.6', delta: { label: '+10%', up: true } },
    { value: 'n/a' },
    { value: '4.2', delta: { label: '+2%', up: true } },
  ],
  insight: {
    headline: 'Test insight',
  },
}

describe('cardTone', () => {
  it('is attention when a channel row is down, even if the headline is up', () => {
    expect(cardTone(attentionCard)).toBe('attention')
  })

  it('is improved when every delta is up', () => {
    expect(cardTone(improvedCard)).toBe('improved')
  })
})

describe('insightRows', () => {
  it('returns only the down row for an attention card, keyed by channel label', () => {
    const rows = insightRows(attentionCard)
    expect(rows).toEqual([{ label: 'Widget', value: '90%', delta: { label: '-2%', up: false } }])
  })

  it('returns the Overall row plus every up row for an improved card', () => {
    const rows = insightRows(improvedCard)
    expect(rows).toEqual([
      { label: 'Overall', value: '$740K', delta: { label: '+32%', up: true } },
      { label: 'Widget', value: '$375K', delta: { label: '+17%', up: true } },
      { label: 'Email', value: '$150K', delta: { label: '+4%', up: true } },
      { label: 'Voice', value: '$175K', delta: { label: '+10%', up: true } },
    ])
  })

  it('skips rows with no delta', () => {
    const rows = insightRows(naRowCard)
    expect(rows.find((r) => r.label === 'Email')).toBeUndefined()
  })
})
