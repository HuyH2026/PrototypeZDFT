import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandProvider, useBrands } from '@/app/brand-context'
import { useBriefingMemory } from './use-briefing-memory'

// A harness that surfaces the hook's return so tests can read/act on it.
function Harness({ onReady }: { onReady: (api: ReturnType<typeof useBriefingMemory>) => void }) {
  const api = useBriefingMemory()
  onReady(api)
  return <div data-testid="ids">{api.findings.map((f) => f.id).join(',')}</div>
}

function BrandToggle() {
  const { setCurrentBrand } = useBrands()
  return (
    <button type="button" onClick={() => setCurrentBrand('uber-eats')}>
      switch-brand
    </button>
  )
}

function renderHook() {
  let latest: ReturnType<typeof useBriefingMemory> | undefined
  const utils = render(
    <BrandProvider>
      <Harness onReady={(api) => (latest = api)} />
      <BrandToggle />
    </BrandProvider>,
  )
  return { ...utils, get: () => latest! }
}

// Install a minimal in-memory localStorage stub per test (jsdom does not provide
// localStorage by default). A fresh Map per beforeEach gives per-test isolation.
function stubStorage() {
  const map = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  })
}

describe('useBriefingMemory', () => {
  beforeEach(() => stubStorage())
  afterEach(() => vi.unstubAllGlobals())
  it('surfaces the seeded findings on first visit', () => {
    const { get } = renderHook()
    expect(get().findings.length).toBeGreaterThan(0)
  })

  it('permanently removes a dismissed finding across remounts', () => {
    const first = renderHook()
    const id = first.get().findings[0].id
    act(() => first.get().dismiss(id))
    expect(first.get().findings.map((f) => f.id)).not.toContain(id)
    first.unmount()

    const second = renderHook()
    expect(second.get().findings.map((f) => f.id)).not.toContain(id)
  })

  it('keeps dismissals scoped per brand', () => {
    const { get, getByText, unmount } = renderHook()
    const id = get().findings[0].id
    act(() => get().dismiss(id))
    act(() => getByText('switch-brand').click())
    // Uber Eats has its own memory, so the finding dismissed under All brands is present.
    expect(get().findings.map((f) => f.id)).toContain(id)
    unmount()
  })

  it('degrades gracefully when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(() => renderHook()).not.toThrow()
  })
})
