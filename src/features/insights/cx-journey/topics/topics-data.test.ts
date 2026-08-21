import { describe, expect, it } from 'vitest'
import {
  COACHING_BARS,
  sentimentBand,
  TOP_MOVERS,
  TOPIC_COLORS,
  TOPIC_ROWS,
  TOPIC_STATS,
  TREEMAP_TOPICS,
} from './topics-data'

describe('topics-data', () => {
  it('exposes five top-mover rows', () => {
    expect(TOP_MOVERS).toHaveLength(5)
    expect(TOP_MOVERS[0].topic).toBe('Website Link Errors')
  })

  it('exposes five coaching bars with positive volumes', () => {
    expect(COACHING_BARS).toHaveLength(5)
    for (const bar of COACHING_BARS) expect(bar.volume).toBeGreaterThan(0)
  })

  it('exposes the eight overview metrics from the updated Topics design', () => {
    expect(TOPIC_STATS).toHaveLength(8)
    expect(TOPIC_STATS.map((stat) => [stat.title, stat.value])).toEqual([
      ['Total tickets', '46,943'],
      ['Excluded tickets', '8,004'],
      ['Categorized tickets', '35,594'],
      ['First contact resolution', '75%'],
      ['Avg. first resolution time', '24 hrs'],
      ['Avg. full resolution time', '29.9 hrs'],
      ['Sentiment', '50%'],
      ['Agent reply time', '11.7 hrs'],
    ])
    expect(TOPIC_STATS.filter((s) => s.sentiment)).toHaveLength(1)
  })

  it('has unique ids across every level of the topic tree', () => {
    const ids: string[] = []
    for (const row of TOPIC_ROWS) {
      ids.push(row.id)
      for (const sub of row.children) {
        ids.push(sub.id)
        for (const leaf of sub.children) ids.push(leaf.id)
      }
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps each parent count in sync with its children length', () => {
    for (const row of TOPIC_ROWS) {
      expect(row.count).toBeGreaterThan(0)
      for (const sub of row.children) {
        expect(sub.count).toBe(sub.children.length)
      }
    }
  })

  it('bands sentiment scores into green / amber / red', () => {
    expect(sentimentBand(75).label).toBe('good')
    expect(sentimentBand(50).label).toBe('ok')
    expect(sentimentBand(30).label).toBe('bad')
  })

  it('gives every top-level row a color and the full tooltip metric set', () => {
    for (const row of TOPIC_ROWS) {
      expect(row.color).toMatch(/^#/)
      expect(row.avgFirstResTime).toBeTruthy()
      expect(row.avgFullResTime).toBeTruthy()
      expect(row.agentReplyTime).toBeTruthy()
      expect(row.agentReplies).toBeTruthy()
      expect(row.csat).toBeTruthy()
    }
  })

  it('gives every sub-topic and leaf the full tooltip metric set', () => {
    for (const row of TOPIC_ROWS) {
      for (const sub of row.children) {
        expect(sub.avgFirstResTime).toBeTruthy()
        expect(sub.agentReplies).toBeTruthy()
        for (const leaf of sub.children) {
          expect(leaf.avgFirstResTime).toBeTruthy()
          expect(leaf.agentReplies).toBeTruthy()
        }
      }
    }
  })

  it('exposes at least as many palette colors as top-level rows', () => {
    expect(TOPIC_COLORS.length).toBeGreaterThanOrEqual(TOPIC_ROWS.length)
  })

  it('keeps treemap volumes aligned with their displayed percentages', () => {
    const billing = TREEMAP_TOPICS.find((topic) => topic.id === 'billing')
    expect(billing).toBeDefined()
    const sharedTotal = billing!.tickets / (Number.parseFloat(billing!.ticketsPct) / 100)

    for (const topic of TREEMAP_TOPICS) {
      const expectedVolume = Math.round((sharedTotal * Number.parseFloat(topic.ticketsPct)) / 100)
      expect(topic.tickets).toBeCloseTo(expectedVolume, 0)
    }
  })

  it('uses a complete 100% partition for the top-level treemap', () => {
    const totalPercentage = TREEMAP_TOPICS.reduce(
      (sum, topic) => sum + Number.parseFloat(topic.ticketsPct),
      0,
    )
    expect(totalPercentage).toBeCloseTo(100, 5)
  })
})
