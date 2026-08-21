import { describe, expect, it } from 'vitest'
import {
  AO_CSAT_TEAL_THRESHOLD,
  AO_TOPIC_CARDS,
  AO_TOPIC_COLUMNS,
  AO_TOPIC_GROUPS,
  AO_TOPICS_NOTE,
  groupHasGap,
  nonResolutions,
} from './ao-topics-data'

describe('ao-topics-data', () => {
  it('draws the six cards the frame names, retitled where it retitles them', () => {
    expect(AO_TOPIC_CARDS.map((c) => c.title)).toEqual([
      'Conversations with Topics',
      'CSAT',
      'Quick feedback',
      'Sentiment',
      'Relevance for chats with Topics',
      'User engagement for chat with Topics',
    ])
  })

  it("splits the frame's 45,000 conversations into resolved and not resolved", () => {
    const [card] = AO_TOPIC_CARDS
    expect(card.kind).toBe('stacked')
    if (card.kind !== 'stacked') return
    expect(card.value).toBe('45,000')
    expect(card.segments.map((s) => [s.label, s.count, s.pct])).toEqual([
      ['Resolved', '36,000', '80%'],
      ['Not resolved', '9,000', '20%'],
    ])
  })

  it('names the six columns the frame heads', () => {
    expect(AO_TOPIC_COLUMNS.map((c) => c.label)).toEqual([
      'Topics (115)',
      'Chats',
      'Resolutions',
      'Non-resolutions',
      'Avg. CSAT',
      'Top 3 surfaced use cases',
    ])
  })

  it("carries the frame's four categories, counts and figures", () => {
    expect(AO_TOPIC_GROUPS.map((g) => [g.label, g.count, g.chats, g.resolutions, g.csat])).toEqual([
      ['Account Management', 20, 20183, 11783, '4.2'],
      ['Financial Transactions', 21, 17269, 11817, '4.4'],
      ['Customer Service', 9, 5704, 528, '3.7'],
      ['Subscription Services', 11, 4458, 3548, '4.2'],
    ])
  })

  it('derives non-resolutions, reproducing the frame wherever the frame reconciles', () => {
    const [accounts, financial, service, subscriptions] = AO_TOPIC_GROUPS
    // The frame's own figures for these two.
    expect(nonResolutions(financial)).toBe(5452)
    expect(nonResolutions(subscriptions)).toBe(910)
    // These two the frame draws inconsistently with its own chats/resolutions.
    expect(nonResolutions(accounts)).toBe(8400)
    expect(nonResolutions(service)).toBe(5176)
  })

  it('keeps every listed child inside its group totals', () => {
    for (const group of AO_TOPIC_GROUPS) {
      expect(group.children).toHaveLength(3)
      const chats = group.children.reduce((acc, c) => acc + c.chats, 0)
      const resolutions = group.children.reduce((acc, c) => acc + c.resolutions, 0)
      expect(chats).toBeLessThanOrEqual(group.chats)
      expect(resolutions).toBeLessThanOrEqual(group.resolutions)
      for (const child of group.children) {
        expect(child.resolutions).toBeLessThanOrEqual(child.chats)
      }
    }
  })

  it('has one category with no gap child, so Gaps only has something to drop', () => {
    expect(AO_TOPIC_GROUPS.filter(groupHasGap)).toHaveLength(3)
    expect(AO_TOPIC_GROUPS.filter((g) => !groupHasGap(g)).map((g) => g.label)).toEqual([
      'Subscription Services',
    ])
  })

  it('puts one category below the CSAT teal threshold, as the frame draws it', () => {
    expect(AO_CSAT_TEAL_THRESHOLD).toBe(4)
    const below = AO_TOPIC_GROUPS.filter((g) => Number(g.csat) < AO_CSAT_TEAL_THRESHOLD)
    expect(below.map((g) => g.label)).toEqual(['Customer Service'])
  })

  it('carries the note about the classification threshold', () => {
    expect(AO_TOPICS_NOTE).toContain('Topics created for 64% of chats')
    expect(AO_TOPICS_NOTE).toContain('sufficient dialogue length')
  })
})
