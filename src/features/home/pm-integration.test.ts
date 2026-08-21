import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createPmIssueLink,
  loadPmIntegration,
  persistPmIntegration,
  type PmIntegration,
} from './pm-integration'

const KEY = 'home-pm-integration-v1'

function stubStorage(stored?: string) {
  const map = new Map<string, string>(stored ? [[KEY, stored]] : [])
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: map.size,
  })
}

describe('pm-integration', () => {
  beforeEach(() => stubStorage())

  it('defaults to disconnected when nothing stored', () => {
    expect(loadPmIntegration()).toEqual({ connected: false, tool: null, linkedIssues: {} })
  })

  it('round-trips a connected state', () => {
    const s: PmIntegration = { connected: true, tool: 'jira', linkedIssues: {} }
    persistPmIntegration(s)
    expect(loadPmIntegration()).toEqual(s)
  })

  it('persists the created PM issue so the feed and detail page share its status', () => {
    const connected: PmIntegration = { connected: true, tool: 'jira', linkedIssues: {} }

    persistPmIntegration(createPmIssueLink(connected, 'o2'))

    expect(loadPmIntegration()).toEqual({
      connected: true,
      tool: 'jira',
      linkedIssues: { o2: { key: 'UNI-482', tool: 'jira' } },
    })
  })

  it('refuses to mint a link while disconnected, since a link has no tool to belong to', () => {
    const state: PmIntegration = { connected: false, tool: null, linkedIssues: {} }

    expect(createPmIssueLink(state, 'o2')).toBe(state)
  })

  it('falls back to a generic issue number for an opportunity it has no number for', () => {
    const connected: PmIntegration = { connected: true, tool: 'linear', linkedIssues: {} }

    expect(createPmIssueLink(connected, 'o9').linkedIssues.o9).toEqual({
      key: 'UNI-499',
      tool: 'linear',
    })
  })

  it('sanitizes an unknown tool to disconnected', () => {
    stubStorage(JSON.stringify({ connected: true, tool: 'bogus' }))
    expect(loadPmIntegration()).toEqual({ connected: false, tool: null, linkedIssues: {} })
  })

  it('treats connected:true with null tool as disconnected', () => {
    stubStorage(JSON.stringify({ connected: true, tool: null }))
    expect(loadPmIntegration()).toEqual({ connected: false, tool: null, linkedIssues: {} })
  })

  it('falls back to default on malformed JSON', () => {
    stubStorage('{bad json')
    expect(loadPmIntegration()).toEqual({ connected: false, tool: null, linkedIssues: {} })
  })

  it('drops corrupt linked issues and keeps the sound ones', () => {
    stubStorage(
      JSON.stringify({
        connected: true,
        tool: 'jira',
        linkedIssues: {
          o1: { key: 'UNI-481', tool: 'jira' },
          o2: { key: 'UNI-482', tool: 'bogus' },
          o3: { key: '', tool: 'jira' },
          o4: { tool: 'jira' },
          o5: 'UNI-485',
          o6: null,
        },
      }),
    )

    expect(loadPmIntegration()).toEqual({
      connected: true,
      tool: 'jira',
      linkedIssues: { o1: { key: 'UNI-481', tool: 'jira' } },
    })
  })

  it('ignores a linkedIssues value that is not a record', () => {
    stubStorage(JSON.stringify({ connected: true, tool: 'asana', linkedIssues: ['UNI-481'] }))
    expect(loadPmIntegration()).toEqual({ connected: true, tool: 'asana', linkedIssues: {} })
  })
})
