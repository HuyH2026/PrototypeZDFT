import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  PIPELINE_STORAGE_KEY,
  loadPipelineState,
  resetPipelineStore,
  usePipelineStore,
} from './pipeline-store'

describe('pipeline-store', () => {
  beforeEach(() => {
    resetPipelineStore()
  })

  it('starts with nothing decided and the loop running', () => {
    const { result } = renderHook(() => usePipelineStore())
    expect(result.current.decisions).toEqual({})
    expect(result.current.paused).toBe(false)
  })

  it('records a decision and persists it', () => {
    const { result } = renderHook(() => usePipelineStore())
    act(() => result.current.decide('if4', 'approved'))
    expect(result.current.decisions).toEqual({ if4: 'approved' })
    expect(loadPipelineState().decisions).toEqual({ if4: 'approved' })
  })

  it('persists the experiment lifecycle through winner publication', () => {
    const { result } = renderHook(() => usePipelineStore())
    act(() => result.current.decide('if4', 'approved'))
    expect(result.current.decisions.if4).toBe('approved')
    act(() => result.current.decide('if4', 'winner-ready'))
    expect(result.current.decisions.if4).toBe('winner-ready')
    act(() => result.current.decide('if4', 'applied'))
    expect(result.current.decisions.if4).toBe('applied')
    expect(loadPipelineState().decisions.if4).toBe('applied')
  })

  it('reconsiders a rejection without disturbing other decisions', () => {
    const { result } = renderHook(() => usePipelineStore())
    act(() => result.current.decide('if4', 'rejected'))
    act(() => result.current.decide('if5', 'approved'))

    act(() => result.current.reconsider('if4'))

    expect(result.current.decisions).toEqual({ if5: 'approved' })
    expect(loadPipelineState().decisions).toEqual({ if5: 'approved' })
  })

  it('only clears rejected decisions when reconsidering', () => {
    const { result } = renderHook(() => usePipelineStore())
    act(() => result.current.decide('if4', 'applied'))

    act(() => result.current.reconsider('if4'))

    expect(result.current.decisions.if4).toBe('applied')
  })

  it('round-trips paused', () => {
    const { result } = renderHook(() => usePipelineStore())
    act(() => result.current.setPaused(true))
    expect(result.current.paused).toBe(true)
    expect(loadPipelineState().paused).toBe(true)
  })

  it('shares state across two separate consumers', () => {
    const a = renderHook(() => usePipelineStore())
    const b = renderHook(() => usePipelineStore())
    act(() => a.result.current.decide('if5', 'rejected'))
    expect(b.result.current.decisions.if5).toBe('rejected')
  })

  it('falls back to a clean state on a corrupt payload', () => {
    window.localStorage.setItem(PIPELINE_STORAGE_KEY, 'not json')
    expect(loadPipelineState()).toEqual({ decisions: {}, paused: false })
  })

  it('drops decision values it does not recognise', () => {
    window.localStorage.setItem(
      PIPELINE_STORAGE_KEY,
      JSON.stringify({
        decisions: {
          if3: 'maybe',
          if4: 'approved',
          if5: 'winner-ready',
          if6: 'applied',
        },
        paused: 'yes',
      }),
    )
    expect(loadPipelineState()).toEqual({
      decisions: { if4: 'approved', if5: 'winner-ready', if6: 'applied' },
      paused: false,
    })
  })
})
