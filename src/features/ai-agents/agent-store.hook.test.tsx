import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { resetAgentStore, useAgentStore } from './agent-store'

function mockStorage() {
  const map = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  })
  return map
}

describe('useAgentStore', () => {
  // Module state now outlives a single test (the store is shared by two
  // subtrees), so each test starts from the seed explicitly.
  beforeEach(() => {
    vi.unstubAllGlobals()
    resetAgentStore()
  })

  it('seeds agents and finds one by id', () => {
    mockStorage()
    const { result } = renderHook(() => useAgentStore())
    expect(result.current.getAgent('w3')?.name).toBe('Service cancellation')
  })

  it('creates a new agent and returns its id', () => {
    mockStorage()
    const { result } = renderHook(() => useAgentStore())
    let id = ''
    act(() => {
      id = result.current.createAgent({
        name: 'Refund helper',
        channel: 'widget',
        allSegments: true,
        tags: [],
        customerRequest: 'user wants a refund',
        triggerPhrases: ['refund'],
      })
    })
    expect(result.current.getAgent(id)?.name).toBe('Refund helper')
  })

  it('toggles an agent on/off', () => {
    mockStorage()
    const { result } = renderHook(() => useAgentStore())
    const before = result.current.getAgent('w1')!.on
    act(() => result.current.toggleAgent('w1'))
    expect(result.current.getAgent('w1')!.on).toBe(!before)
  })

  it('persists created agents across a remount', () => {
    mockStorage()
    const first = renderHook(() => useAgentStore())
    let id = ''
    act(() => {
      id = first.result.current.createAgent({
        name: 'Persisted',
        channel: 'widget',
        allSegments: true,
        tags: [],
        customerRequest: '',
        triggerPhrases: [],
      })
    })
    first.unmount()
    const second = renderHook(() => useAgentStore())
    expect(second.result.current.getAgent(id)?.name).toBe('Persisted')
  })

  it('shares one agent list across two separate hook consumers', () => {
    mockStorage()
    resetAgentStore()
    const a = renderHook(() => useAgentStore())
    const b = renderHook(() => useAgentStore())
    let id = ''
    act(() => {
      id = a.result.current.createAgent({
        name: 'Plan agent', channel: 'widget', allSegments: true,
        tags: [], customerRequest: '', triggerPhrases: [],
      })
    })
    expect(b.result.current.getAgent(id)?.name).toBe('Plan agent')
  })

  it('creates an agent with a supplied policy, blocks and off state', () => {
    mockStorage()
    resetAgentStore()
    const { result } = renderHook(() => useAgentStore())
    let id = ''
    act(() => {
      id = result.current.createAgent({
        name: 'Service Cancellation', channel: 'widget', allSegments: true,
        tags: ['Cancellation'], customerRequest: 'customer wants to cancel', triggerPhrases: [],
        policy: { title: 'AI policy', segments: [{ kind: 'prose', id: 'p1', text: 'Reveal form below.' }] },
        blocks: [{ id: 'b1', stepType: 'form', title: 'Cancellation reason', collapsed: true }],
        on: false,
      })
    })
    const agent = result.current.getAgent(id)!
    expect(agent.on).toBe(false)
    expect(agent.policy.segments[0]).toMatchObject({ text: 'Reveal form below.' })
    expect(agent.blocks).toHaveLength(1)
  })

  it('still defaults a created agent to on with an empty starter policy', () => {
    mockStorage()
    resetAgentStore()
    const { result } = renderHook(() => useAgentStore())
    let id = ''
    act(() => {
      id = result.current.createAgent({
        name: 'Plain', channel: 'voice', allSegments: true,
        tags: [], customerRequest: '', triggerPhrases: [],
      })
    })
    expect(result.current.getAgent(id)).toMatchObject({ on: true, blocks: [] })
    expect(result.current.getAgent(id)!.policy.segments).toHaveLength(1)
  })
})
