import { describe, expect, it } from 'vitest'
import { STAT_CARDS } from './ai-performances-data'

describe('STAT_CARDS', () => {
  it('every card has a non-empty insight headline', () => {
    for (const card of STAT_CARDS) {
      expect(card.insight.headline.length).toBeGreaterThan(0)
    }
  })

  it('has the twelve cards in the Agent Overview content design', () => {
    expect(STAT_CARDS).toHaveLength(12)
    expect(STAT_CARDS.map((card) => card.title)).toContain('Automated resolutions (AR)')
    expect(STAT_CARDS.map((card) => card.title)).toContain('Escalations')
  })
})
