import { describe, expect, it } from 'vitest'
import type { ChannelKey } from '../channel-tabs'
import { USE_CASE_CHANNELS, USE_CASE_COLUMNS } from './use-cases-data'

const KEYS: ChannelKey[] = ['widget', 'voice', 'webcall', 'headless']

describe('use-cases-data', () => {
  it('gives every channel six cards and rows', () => {
    for (const k of KEYS) {
      expect(USE_CASE_CHANNELS[k].cards).toHaveLength(6)
      expect(USE_CASE_CHANNELS[k].rows.length).toBeGreaterThan(0)
    }
  })

  it('draws the six cards the frame names, in its order', () => {
    expect(USE_CASE_CHANNELS.widget.cards.map((c) => c.title)).toEqual([
      'Automated resolutions (AR)',
      'CSAT',
      'Quick feedback',
      'Sentiment',
      'Relevance',
      'Engagement',
    ])
  })

  it('names the eight columns the frame heads, at its widths', () => {
    expect(USE_CASE_COLUMNS.map((c) => c.label)).toEqual([
      'Use cases',
      'Activate',
      'Channel',
      'Type',
      'Conversations',
      'Deflections',
      'Deflection rate',
      'Avg. CSAT',
    ])
  })

  it("carries the frame's three use cases, its first row's figures verbatim", () => {
    const rows = USE_CASE_CHANNELS.widget.rows
    expect(rows.slice(0, 3).map((r) => r.name)).toEqual([
      'Knowledge Retrieval',
      'Fallback',
      'Service cancellation',
    ])
    expect(rows[0].conversations).toBe('3,000')
    expect(rows[0].deflections).toBe('2,500')
    // The frame writes 95% against 2,500 of 3,000, which is 83%.
    expect(rows[0].deflectionRate).toBe('83%')
    expect(rows[0].csat).toBe('3')
    expect(rows[0].type).toBe('Knowledge Retrieval')
  })

  it('carries the drawn activation states, including one off', () => {
    const rows = USE_CASE_CHANNELS.widget.rows
    expect(rows[0].activated).toBe(true)
    expect(rows[1].activated).toBe(true)
    expect(rows[2].activated).toBe(false)
    expect(rows.some((r) => !r.activated)).toBe(true)
  })

  it('never deflects more conversations than it has', () => {
    for (const k of KEYS) {
      for (const row of USE_CASE_CHANNELS[k].rows) {
        expect(row.deflectionCount).toBeLessThanOrEqual(row.conversationCount)
        expect(row.deflectionRate).toBe(
          `${Math.round((row.deflectionCount / row.conversationCount) * 100)}%`,
        )
      }
    }
  })

  it('labels each row with its own channel and a signed change per numeric cell', () => {
    expect(USE_CASE_CHANNELS.webcall.rows.every((r) => r.channel === 'Web Call')).toBe(true)
    for (const row of USE_CASE_CHANNELS.widget.rows) {
      expect(row.change.conversations).toMatch(/^[+-]/)
      expect(row.change.deflections).toMatch(/^[+-]/)
      expect(row.change.csat).toMatch(/^[+-]/)
    }
  })
})
