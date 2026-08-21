// React hook owning all persistence and side effects for the arrival briefing.
// The pure selector (./briefing-data) decides WHAT to show; this hook decides
// what to REMEMBER: dismissals are permanent, merely-seen findings expire after a
// cooldown, and memory is keyed per brand. localStorage access is guarded so jsdom
// (and any environment without it) degrades gracefully.
import { useCallback, useEffect, useState } from 'react'
import { brandScopeKey, useBrands } from '@/app/brand-context'
import {
  BRIEFING_CATALOG,
  COOLDOWN,
  selectBriefings,
  type BriefingFinding,
} from './briefing-data'

type StoredMemory = { dismissed: string[]; seen: Record<string, number>; views: number }

const EMPTY: StoredMemory = { dismissed: [], seen: {}, views: 0 }
const keyFor = (brand: string) => `ai-briefing-memory-v1:${brand}`

function read(brand: string): StoredMemory {
  try {
    const raw = window.localStorage?.getItem(keyFor(brand))
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<StoredMemory>
    return {
      dismissed: parsed.dismissed ?? [],
      seen: parsed.seen ?? {},
      views: parsed.views ?? 0,
    }
  } catch {
    return { ...EMPTY }
  }
}

function write(brand: string, memory: StoredMemory): void {
  try {
    window.localStorage?.setItem(keyFor(brand), JSON.stringify(memory))
  } catch {
    // ignore — presentational mock, storage is best-effort
  }
}

// Compute the findings to show for this visit AND the memory to persist. The
// shown findings are stamped "seen" at the incremented view clock; because the
// returned `findings` is this pre-stamp snapshot, stamping never suppresses the
// rows being rendered on the same visit.
function visit(memory: StoredMemory): { findings: BriefingFinding[]; next: StoredMemory } {
  const findings = selectBriefings(BRIEFING_CATALOG, memory, memory.views, COOLDOWN)
  const views = memory.views + 1
  const seen = { ...memory.seen }
  for (const f of findings) seen[f.id] = views
  return { findings, next: { ...memory, seen, views } }
}

export function useBriefingMemory(): {
  findings: BriefingFinding[]
  dismiss: (id: string) => void
} {
  const { currentBrand } = useBrands()
  // 'all-brands' is its own memory bucket, so the unfiltered view does not share
  // dismissals with any single brand.
  const brandKey = brandScopeKey(currentBrand)
  // `findings` is a snapshot taken once per brand on mount; it is NOT re-derived
  // from `memory` on every change (that would let the "seen" stamp hide the very
  // rows we just rendered). Dismiss mutates the snapshot directly.
  const [state, setState] = useState<{ brand: string; findings: BriefingFinding[] }>(() => {
    const { findings, next } = visit(read(brandKey))
    write(brandKey, next)
    return { brand: brandKey, findings }
  })

  // On brand change, recompute the snapshot for the new brand and persist its stamp.
  useEffect(() => {
    if (state.brand === brandKey) return
    const { findings, next } = visit(read(brandKey))
    write(brandKey, next)
    setState({ brand: brandKey, findings })
  }, [brandKey, state.brand])

  const dismiss = useCallback(
    (id: string) => {
      const mem = read(brandKey)
      if (!mem.dismissed.includes(id)) {
        write(brandKey, { ...mem, dismissed: [...mem.dismissed, id] })
      }
      setState((prev) => ({ ...prev, findings: prev.findings.filter((f) => f.id !== id) }))
    },
    [brandKey],
  )

  return { findings: state.findings, dismiss }
}
