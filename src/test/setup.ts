import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// jsdom does not implement ResizeObserver, which recharts-based widgets use to
// measure their container. Provide a no-op stub so components that observe size
// can mount in tests (real browsers supply the API natively).
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Node 26 exposes a built-in `localStorage` global that is `undefined` unless the
// process was started with --localstorage-file, and under vitest's jsdom
// environment that global shadows jsdom's own Storage. So `window.localStorage`
// reads as undefined on Node 26 while CI (Node 22) gets a working Storage.
//
// That divergence is not cosmetic: all 27 localStorage-backed modules guard access
// with `?.`, so on Node 26 every read returns undefined and every write silently
// no-ops. Persistence tests then pass locally without exercising persistence at
// all, and only fail in CI — which is exactly how the briefing-memory order
// dependency in AiPerformancesView.test.tsx reached main. Install an in-memory
// Storage when the environment lacks one so local and CI behave identically.
function createMemoryStorage(): Storage {
  const entries = new Map<string, string>()
  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => (entries.has(key) ? (entries.get(key) as string) : null),
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
    setItem: (key: string, value: string) => {
      entries.set(String(key), String(value))
    },
  } as Storage
}

function hasWorkingStorage(): boolean {
  try {
    return !!window.localStorage
  } catch {
    return false
  }
}

if (typeof window !== 'undefined' && !hasWorkingStorage()) {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  })
}

// Persisted stores otherwise leak across tests in a file: the store a test writes
// is still there when the next one mounts. Several stores are view-count or
// cooldown sensitive, so that leakage makes tests order-dependent — passing alone
// and failing in a suite, or vice versa. Start every test from empty storage.
beforeEach(() => {
  try {
    window.localStorage?.clear()
  } catch {
    // ignore — a storage implementation that cannot clear is already inert
  }
})
