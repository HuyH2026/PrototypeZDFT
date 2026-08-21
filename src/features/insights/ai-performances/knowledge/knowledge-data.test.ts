import { describe, expect, it } from 'vitest'
import type { ChannelKey } from '../channel-tabs'
import {
  KNOWLEDGE_CHANNELS,
  KNOWLEDGE_COLUMNS,
  KNOWLEDGE_GAP_COLUMNS,
} from './knowledge-data'

const KEYS: ChannelKey[] = ['widget', 'voice', 'webcall', 'headless']

describe('knowledge-data', () => {
  it('gives every channel cards, rows and gap rows', () => {
    for (const k of KEYS) {
      expect(KNOWLEDGE_CHANNELS[k].cards).toHaveLength(5)
      expect(KNOWLEDGE_CHANNELS[k].rows).toHaveLength(4)
      expect(KNOWLEDGE_CHANNELS[k].gapRows).toHaveLength(5)
    }
  })

  it('draws the five cards the frame names, in its order', () => {
    expect(KNOWLEDGE_CHANNELS.widget.cards.map((c) => c.title)).toEqual([
      'Conversations with articles surfaced',
      'Automated resolutions (AR)',
      'Click rate',
      'CSAT',
      'Quick feedback',
    ])
  })

  it('sums each donut total from its own slices, so the stated share holds', () => {
    for (const k of KEYS) {
      for (const card of KNOWLEDGE_CHANNELS[k].cards) {
        if (card.kind !== 'donut' || !card.total) continue
        const sliceSum = card.slices.reduce((acc, s) => acc + s.value, 0)
        expect(card.total.count).toBe(sliceSum.toLocaleString())
        expect(card.center).toBe(
          `${Math.round((card.slices[0].value / sliceSum) * 100)}%`,
        )
      }
    }
  })

  it("carries the frame's own card figures on Widget", () => {
    const [surfaced, , clicks] = KNOWLEDGE_CHANNELS.widget.cards
    expect(surfaced.kind).toBe('donut')
    if (surfaced.kind !== 'donut') return
    expect(surfaced.total?.count).toBe('41,536')
    expect(surfaced.center).toBe('72%')
    expect(surfaced.slices.map((s) => s.count)).toEqual(['30,010', '11,526'])

    expect(clicks.kind).toBe('donut')
    if (clicks.kind !== 'donut') return
    expect(clicks.total?.count).toBe('94,130')
    expect(clicks.center).toBe('8%')
    expect(clicks.slices.map((s) => s.count)).toEqual(['7,530', '86,600'])
  })

  it("carries the frame's first row verbatim, with derived percentages", () => {
    const row = KNOWLEDGE_CHANNELS.widget.rows[0]
    expect(row.title).toBe('Withdrawing Funds from Your Investment Account')
    expect(row.conversations).toBe('9,898')
    expect(row.resolutions).toBe('8,390')
    // 8,390 of 9,898 is 85% — the frame's own figure.
    expect(row.resolutionsPct).toBe('85%')
    expect(row.surfaced).toBe('7,616 times surfaced')
    // The frame writes "500 (8%)" against 7,616 surfaced; 500 of 7,616 is 7%.
    expect(row.clicked).toBe('500 (7%) clicked')
    expect(row.csat).toBe('4.4')
    expect(row.integration).toBe('Salesforce')
    expect(row.channel).toBe('Widget')
    expect(row.quickFeedback).toBeNull()
    expect(row.relevance).toBe('Relevant')
    expect(row.engagementRate).toBe('99.4%')
    expect(row.topAgents).toEqual({ label: 'Transaction failed', more: 2 })
    expect(row.related).toHaveLength(2)
  })

  it('never claims more clicks than surfaces, or more resolutions than conversations', () => {
    for (const k of KEYS) {
      for (const row of KNOWLEDGE_CHANNELS[k].rows) {
        expect(row.resolutionCount).toBeLessThanOrEqual(row.conversationCount)
        if (row.clickCount !== null) {
          expect(row.clickCount).toBeLessThanOrEqual(row.surfaceCount)
        }
      }
    }
  })

  it('labels each row with its own channel and carries a change per numeric cell', () => {
    expect(KNOWLEDGE_CHANNELS.voice.rows.every((r) => r.channel === 'Voice')).toBe(true)
    expect(KNOWLEDGE_CHANNELS.webcall.rows.every((r) => r.channel === 'Web Call')).toBe(true)
    for (const row of KNOWLEDGE_CHANNELS.widget.rows) {
      expect(row.change.conversations).toMatch(/^[+-]/)
      expect(row.change.resolutions).toMatch(/^[+-]/)
    }
  })

  it('names thirteen columns and four gap columns', () => {
    expect(KNOWLEDGE_COLUMNS).toHaveLength(13)
    expect(KNOWLEDGE_COLUMNS.map((c) => c.label)).toEqual([
      'Title',
      'Conversations',
      'Resolutions',
      'Surface & clicks',
      'Avg. CSAT',
      'Integration',
      'Channel',
      'Quick feedback',
      'Relevance',
      'User engagement',
      'Engagement rate',
      'Top 3 surfaced agents',
      'Related articles',
    ])
    expect(KNOWLEDGE_GAP_COLUMNS.map((c) => c.label)).toEqual([
      'Missing topic',
      'Conversations affected',
      'Non-resolutions',
      'Suggested article',
    ])
  })

  it('leaves at least one row muted in every optional cell the frame draws n/a', () => {
    const rows = KNOWLEDGE_CHANNELS.widget.rows
    expect(rows.some((r) => r.integration === null)).toBe(true)
    expect(rows.some((r) => r.clicked === null)).toBe(true)
    expect(rows.some((r) => r.engagement === null)).toBe(true)
    expect(rows.some((r) => r.related.length === 0)).toBe(true)
  })
})
