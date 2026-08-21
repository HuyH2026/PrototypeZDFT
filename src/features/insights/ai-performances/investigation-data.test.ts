import { describe, expect, it } from 'vitest'
import { BRIEFING_CATALOG } from './briefing-data'
import {
  METRIC_INVESTIGATIONS,
  investigationById,
  findingIdForCard,
  CARD_TITLE_BY_FINDING,
  toConversationSeed,
  toStatCardConversationSeed,
} from './investigation-data'
import type { StatCard } from './ai-performances-data'

describe('investigation-data', () => {
  it('has one investigation per briefing finding, with matching scope', () => {
    for (const finding of BRIEFING_CATALOG) {
      const inv = investigationById(finding.id)
      expect(inv, `investigation for ${finding.id}`).toBeDefined()
      expect(inv!.scope).toBe(finding.scope)
    }
    expect(METRIC_INVESTIGATIONS).toHaveLength(BRIEFING_CATALOG.length)
  })

  it('investigationById returns undefined for an unknown id', () => {
    expect(investigationById('nope')).toBeUndefined()
  })

  it('every investigation has non-empty chart series and evidence', () => {
    for (const inv of METRIC_INVESTIGATIONS) {
      expect(inv.series.length).toBeGreaterThan(1)
      expect(inv.observed.bullets.length).toBeGreaterThan(0)
      expect(inv.observed.evidenceCount).toMatch(/\d/)
    }
  })

  it('findingIdForCard maps finding card titles and nothing else', () => {
    expect(findingIdForCard('Tickets reopened')).toBe('reopens')
    expect(findingIdForCard('CSAT')).toBe('csat')
    expect(findingIdForCard('Escalations to a human')).toBe('escalations')
    expect(findingIdForCard('Resolution rate')).toBeUndefined()
    expect(findingIdForCard('Realized savings')).toBeUndefined()
  })

  it('CARD_TITLE_BY_FINDING is the inverse of findingIdForCard', () => {
    for (const [findingId, title] of Object.entries(CARD_TITLE_BY_FINDING)) {
      expect(findingIdForCard(title)).toBe(findingId)
    }
  })

  it('toConversationSeed builds a seed message with chart + list attachments and standard recommendations', () => {
    for (const inv of METRIC_INVESTIGATIONS) {
      const seed = toConversationSeed(inv)
      expect(seed.title).toBe(inv.title)
      expect(seed.messages).toHaveLength(1)
      const [msg] = seed.messages
      expect(msg.role).toBe('assistant')
      expect(msg.text).toBe(inv.observed.summary)
      expect(msg.attachments).toHaveLength(2)
      expect(msg.attachments![0]).toEqual({
        type: 'chart',
        title: inv.title,
        series: inv.series,
        annotation: inv.annotation,
        peak: inv.peak,
      })
      expect(msg.attachments![1]).toEqual({
        type: 'list',
        title: 'What we found',
        items: inv.observed.bullets,
        footnote: inv.observed.evidenceCount,
      })
      expect(msg.recommendations).toEqual([
        'Explain this change',
        'Break down by intent',
        'Compare agents',
      ])
    }
  })

  it('toConversationSeed.responses covers all round-1 chip labels with breakdown data wired to inv.breakdownByIntent/Agent, and round-2 replies wired to inv.fixActions/exampleConversations', () => {
    for (const inv of METRIC_INVESTIGATIONS) {
      const seed = toConversationSeed(inv)
      expect(Object.keys(seed.responses ?? {})).toEqual(
        expect.arrayContaining(['Explain this change', 'Break down by intent', 'Compare agents']),
      )
      const byIntent = seed.responses!['Break down by intent']
      expect(byIntent.attachments).toEqual([
        { type: 'breakdown', title: 'By intent', rows: inv.breakdownByIntent },
      ])
      expect(byIntent.recommendations).toBeUndefined()

      const byAgent = seed.responses!['Compare agents']
      expect(byAgent.attachments).toEqual([
        { type: 'breakdown', title: 'By agent', rows: inv.breakdownByAgent },
      ])
      expect(byAgent.recommendations).toBeUndefined()

      const explain = seed.responses!['Explain this change']
      expect(explain.recommendations).toEqual(['What should I fix first?', 'Show example conversations'])

      const fixFirst = seed.responses!['What should I fix first?']
      expect(fixFirst.attachments).toEqual([
        { type: 'actions', title: 'Recommended fixes', items: inv.fixActions },
      ])
      expect(fixFirst.recommendations).toBeUndefined()

      const examples = seed.responses!['Show example conversations']
      expect(examples.attachments).toEqual([
        { type: 'list', title: 'Example conversations', items: inv.exampleConversations },
      ])
      expect(examples.recommendations).toBeUndefined()
    }
  })

  it('every investigation has non-empty breakdownByIntent, breakdownByAgent, fixActions, and exampleConversations', () => {
    for (const inv of METRIC_INVESTIGATIONS) {
      expect(inv.breakdownByIntent.length).toBeGreaterThan(0)
      expect(inv.breakdownByAgent.length).toBeGreaterThan(0)
      expect(inv.fixActions.length).toBeGreaterThan(0)
      expect(inv.exampleConversations.length).toBeGreaterThan(0)
      for (const row of [...inv.breakdownByIntent, ...inv.breakdownByAgent]) {
        expect(row.label.length).toBeGreaterThan(0)
        expect(row.value.length).toBeGreaterThan(0)
      }
      for (const action of inv.fixActions) {
        expect(action.text.length).toBeGreaterThan(0)
        expect(action.tag.length).toBeGreaterThan(0)
      }
      for (const line of inv.exampleConversations) {
        expect(line.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('toStatCardConversationSeed', () => {
  const card: StatCard = {
    title: 'Resolution rate',
    value: '89%',
    delta: { label: '+12%', up: true },
    rows: [
      { value: '90%', delta: { label: '-2%', up: false } },
      { value: '88%', delta: { label: '+6%', up: true } },
      { value: '91%', delta: { label: '+2%', up: true } },
    ],
    insight: {
      headline: 'Widget resolution rate dipped while Email and Voice improved.',
      detail: 'Widget still carries the largest share of conversations.',
    },
  }

  it('builds a single assistant message with the headline, detail, and a list attachment of the rows', () => {
    const seed = toStatCardConversationSeed(card, 'attention', [
      { label: 'Widget', value: '90%', delta: { label: '-2%', up: false } },
    ])

    expect(seed.title).toBe('Resolution rate')
    expect(seed.messages).toHaveLength(1)
    const [message] = seed.messages
    expect(message.role).toBe('assistant')
    expect(message.text).toContain('Widget resolution rate dipped while Email and Voice improved.')
    expect(message.text).toContain('Widget still carries the largest share of conversations.')
    expect(message.attachments).toHaveLength(1)
    expect(message.attachments![0]).toMatchObject({ type: 'list', title: 'What changed' })
    expect((message.attachments![0] as { items: string[] }).items).toEqual(['Widget: 90% (-2%)'])
  })

  it('has no chart attachment and no responses map', () => {
    const seed = toStatCardConversationSeed(card, 'attention', [
      { label: 'Widget', value: '90%', delta: { label: '-2%', up: false } },
    ])
    expect(seed.messages[0].attachments!.some((a) => a.type === 'chart')).toBe(false)
    expect(seed.responses).toBeUndefined()
  })
})
