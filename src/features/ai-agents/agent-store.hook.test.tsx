import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAgentStore } from './agent-store'

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
  beforeEach(() => vi.unstubAllGlobals())

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
        name: 'Refund helper', channel: 'widget', universalBrand: false,
        tags: [], triggeredWhen: 'user wants a refund', trainingPhrases: ['refund'],
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
        name: 'Persisted', channel: 'widget', universalBrand: false,
        tags: [], triggeredWhen: '', trainingPhrases: [],
      })
    })
    first.unmount()
    const second = renderHook(() => useAgentStore())
    expect(second.result.current.getAgent(id)?.name).toBe('Persisted')
  })
})
