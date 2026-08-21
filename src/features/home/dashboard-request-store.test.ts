import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LAYOUT } from './dashboard-data'
import {
  applyDashboard,
  clearDashboardRequest,
  getDashboardRequest,
  previewDashboard,
  subscribeDashboardRequest,
} from './dashboard-request-store'

const view = { name: 'Custom Home', kind: 'grid' as const, role: null, layout: DEFAULT_LAYOUT }

afterEach(() => clearDashboardRequest())

describe('dashboard-request-store', () => {
  it('starts empty', () => {
    expect(getDashboardRequest()).toBeNull()
  })

  it('publishes a preview request and notifies subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeDashboardRequest(listener)

    previewDashboard({ prompt: 'show me cost', view })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(getDashboardRequest()).toEqual({ prompt: 'show me cost', view, intent: 'preview' })
    unsubscribe()
  })

  // Home reads this through useSyncExternalStore, which bails out of a rerender
  // when the snapshot is identical — returning a fresh object each call would
  // loop forever.
  it('returns a stable snapshot between changes', () => {
    previewDashboard({ prompt: 'show me cost', view })
    expect(getDashboardRequest()).toBe(getDashboardRequest())
  })

  it('promotes the pending request to apply, keeping prompt and view', () => {
    previewDashboard({ prompt: 'show me cost', view })
    applyDashboard()
    expect(getDashboardRequest()).toEqual({ prompt: 'show me cost', view, intent: 'apply' })
  })

  // Otherwise a stray Apply could commit a view out of nothing.
  it('ignores apply with nothing pending', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeDashboardRequest(listener)

    applyDashboard()

    expect(getDashboardRequest()).toBeNull()
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('clears the request and notifies', () => {
    previewDashboard({ prompt: 'show me cost', view })
    const listener = vi.fn()
    const unsubscribe = subscribeDashboardRequest(listener)

    clearDashboardRequest()

    expect(getDashboardRequest()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('does not notify when clearing an already-empty store', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeDashboardRequest(listener)

    clearDashboardRequest()

    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn()
    subscribeDashboardRequest(listener)()

    previewDashboard({ prompt: 'show me cost', view })

    expect(listener).not.toHaveBeenCalled()
  })
})
