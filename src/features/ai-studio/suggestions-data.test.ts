import { describe, expect, it } from 'vitest'
import { TOPIC_SUGGESTIONS } from './suggestions-data'

describe('TOPIC_SUGGESTIONS', () => {
  it('has three suggestions, each fully populated', () => {
    expect(TOPIC_SUGGESTIONS).toHaveLength(3)
    for (const s of TOPIC_SUGGESTIONS) {
      expect(s.id).toBeTruthy()
      expect(s.title).toBeTruthy()
      expect(s.cta).toBeTruthy()
      expect(s.bullets.length).toBeGreaterThan(0)
    }
  })

  it('leads with the verbatim Figma "Create New Ticket" card', () => {
    const first = TOPIC_SUGGESTIONS[0]
    expect(first.id).toBe('create-new-ticket-leak')
    expect(first.title).toBe('Fix "Create New Ticket" leak')
    expect(first.cta).toBe('Show me the tickets')
    expect(first.bullets).toEqual([
      '3,653 unresolved conversations',
      'only 7% resolutions',
      '~$54,795 in recoverable savings',
      'CSAT at 3.91 (your lowest of the high-volume topics)',
    ])
  })

  it('has unique ids', () => {
    const ids = TOPIC_SUGGESTIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
