import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { SEED_AGENTS, type RosterAgent } from './roster-data'
import { ROSTER_STORAGE_KEY, resetRoster, useAgentRoster } from './agent-roster-store'

describe('agent-roster-store', () => {
  function stubStorage() {
    const map = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
      clear: () => map.clear(),
      key: () => null,
      length: map.size,
    })
  }

  beforeEach(() => {
    stubStorage()
    resetRoster()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('seeds the Uber roster', () => {
    const { result } = renderHook(() => useAgentRoster())
    expect(result.current.agents).toHaveLength(SEED_AGENTS.length)
    expect(result.current.agents.map((a) => a.name)).toContain('Uber Rider Trip')
  })

  it('creates an agent with no metrics yet and returns its id', () => {
    const { result } = renderHook(() => useAgentRoster())
    let id = ''
    act(() => {
      id = result.current.createAgent({
        brandId: 'uber',
        name: 'Rider Refunds',
        channels: ['Email'],
      })
    })
    expect(id).toMatch(/^rider-refunds-\d+$/)
    const created = result.current.agents.find((a) => a.id === id)
    expect(created).toMatchObject({
      brandId: 'uber',
      name: 'Rider Refunds',
      channels: ['Email'],
      health: null,
      ar: null,
      conversations: null,
      insightCount: 0,
    })
  })

  it('renames an agent and replaces its channels, keeping its metrics', () => {
    const { result } = renderHook(() => useAgentRoster())
    act(() =>
      result.current.updateAgent('freight-shipper', {
        name: 'Shipper Escalations',
        channels: ['Email', 'API'],
      }),
    )
    expect(result.current.agents.find((a) => a.id === 'freight-shipper')).toMatchObject({
      name: 'Shipper Escalations',
      channels: ['Email', 'API'],
      // Editing name and channels must not blank the metrics the row shows.
      health: 'needs-attention',
      ar: 71,
      conversations: 1484,
      insightCount: 4,
    })
  })

  it('leaves the roster untouched when updating an id that is gone', () => {
    const { result } = renderHook(() => useAgentRoster())
    const before = result.current.agents
    act(() => result.current.updateAgent('no-such-agent', { name: 'Ghost', channels: ['Email'] }))
    expect(result.current.agents).toBe(before)
  })

  it('persists an update to localStorage', () => {
    const { result } = renderHook(() => useAgentRoster())
    act(() =>
      result.current.updateAgent('freight-shipper', {
        name: 'Shipper Escalations',
        channels: ['Email'],
      }),
    )
    const stored = JSON.parse(
      window.localStorage.getItem(ROSTER_STORAGE_KEY) as string,
    ) as RosterAgent[]
    expect(stored.find((a) => a.id === 'freight-shipper')).toMatchObject({
      name: 'Shipper Escalations',
      channels: ['Email'],
    })
  })

  it('deletes an agent', () => {
    const { result } = renderHook(() => useAgentRoster())
    act(() => result.current.deleteAgent('freight-shipper'))
    expect(result.current.agents.map((a) => a.id)).not.toContain('freight-shipper')
    expect(result.current.agents).toHaveLength(SEED_AGENTS.length - 1)
  })

  it('persists mutations to localStorage', () => {
    const { result } = renderHook(() => useAgentRoster())
    act(() => result.current.deleteAgent('freight-shipper'))
    const raw = window.localStorage.getItem(ROSTER_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw as string)).toHaveLength(SEED_AGENTS.length - 1)
  })

  // The store never resets itself (emptying the roster is a real state), so a
  // partially-shaped stored agent that got through the guard would white-screen
  // /agent-setup on every load with no in-app way out: the table dereferences
  // health, ar, and conversations unguarded.
  it('rejects a partial-shape stored agent and keeps the well-formed ones', async () => {
    window.localStorage.setItem(
      ROSTER_STORAGE_KEY,
      JSON.stringify([
        SEED_AGENTS[0],
        // id/brandId/name/channels present, every metric field missing.
        { id: 'half-agent-1', brandId: 'uber', name: 'Half Agent', channels: ['Email'] },
      ]),
    )
    // The roster is read once, at module init, so this reloads the module.
    vi.resetModules()
    const fresh = await import('./agent-roster-store')
    const { result } = renderHook(() => fresh.useAgentRoster())

    expect(result.current.agents.map((a) => a.name)).toEqual([SEED_AGENTS[0].name])
    expect(result.current.agents.map((a) => a.id)).not.toContain('half-agent-1')
  })

  it('falls back to the seed when the stored payload is not JSON', async () => {
    window.localStorage.setItem(ROSTER_STORAGE_KEY, '{not json')
    vi.resetModules()
    const fresh = await import('./agent-roster-store')
    const { result } = renderHook(() => fresh.useAgentRoster())
    expect(result.current.agents).toHaveLength(SEED_AGENTS.length)
  })

  it('survives a throwing localStorage', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const { result } = renderHook(() => useAgentRoster())
    act(() => result.current.deleteAgent('freight-shipper'))
    expect(result.current.agents).toHaveLength(SEED_AGENTS.length - 1)
  })
})
