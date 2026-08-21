import { describe, it, expect } from 'vitest'
import { LOG_TABS, AUDIT_ENTRIES, ERROR_ENTRIES, API_ERROR_ENTRIES } from './log-data'
import { detailForConversationId } from '@/features/insights/ai-performances/conversations/conversations-data'

describe('log-data', () => {
  it('exposes the three tabs in order', () => {
    expect(LOG_TABS).toEqual(['Change Logs', 'Error Logs', 'API errors'])
  })

  it('has non-empty audit and error entries with unique ids', () => {
    expect(AUDIT_ENTRIES.length).toBeGreaterThan(0)
    expect(ERROR_ENTRIES.length).toBeGreaterThan(0)
    expect(API_ERROR_ENTRIES.length).toBeGreaterThan(0)
    const auditIds = AUDIT_ENTRIES.map((e) => e.id)
    const errorIds = ERROR_ENTRIES.map((e) => e.id)
    const apiErrorIds = API_ERROR_ENTRIES.map((e) => e.id)
    expect(new Set(auditIds).size).toBe(auditIds.length)
    expect(new Set(errorIds).size).toBe(errorIds.length)
    expect(new Set(apiErrorIds).size).toBe(apiErrorIds.length)
  })

  it('only uses allowed severities', () => {
    const allowed = new Set(['High', 'Medium', 'Low'])
    for (const e of ERROR_ENTRIES) expect(allowed.has(e.severity)).toBe(true)
  })

  it('matches the designed Change Logs and Error Logs row counts', () => {
    expect(AUDIT_ENTRIES).toHaveLength(14)
    expect(ERROR_ENTRIES).toHaveLength(4)
  })

  it('links every error and API error row to a conversation the drawer can open', () => {
    for (const e of [...ERROR_ENTRIES, ...API_ERROR_ENTRIES]) {
      expect(detailForConversationId(e.conversationId), e.id).toBeDefined()
    }
  })
})
