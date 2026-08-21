import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { maxIdSuffix } from '@/lib/id-seq'
import type { Brand, BrandMark } from '@/types'

type BrandContextValue = {
  brands: Brand[]
  // null IS the "All brands" selection — there is no separate sentinel. The
  // top-bar switcher and the Manage agents brand filter both read and write
  // this one field, so they can never disagree.
  currentBrand: Brand | null
  // The top-bar AgentSwitcher's selection. It lives beside currentBrand rather
  // than in the roster store so that setCurrentBrand can clear it without this
  // file importing from features/ — setCurrentAgent is handed the brandId by its
  // caller, so brand context never needs to know the roster exists.
  currentAgentId: string | null
  setCurrentBrand: (id: string | null) => void
  setCurrentAgent: (agent: { id: string; brandId: string }) => void
  addBrand: (name: string, channels: string[]) => Brand
}

const BrandContext = createContext<BrandContextValue | null>(null)

// The Uber worked example: one account, brands split on product line. Module-local
// on purpose: git-sync-store.ts seeds a deliberate *subset* of these ids, so
// importing this list there would change which brands open connected.
const INITIAL_BRANDS: Brand[] = [
  {
    id: 'uber',
    name: 'Uber',
    mark: { label: 'Uber', bg: '#131313' },
    channels: ['Web Widget', 'Email', 'Inbound Voice', 'API', 'Web Call'],
  },
  {
    id: 'uber-eats',
    name: 'Uber Eats',
    mark: { label: 'Uber Eats', bg: '#0f8a5f' },
    channels: ['WhatsApp', 'Facebook Messenger', 'Inbound Voice', 'Web Widget', 'Email', 'API'],
  },
  {
    id: 'uber-freight',
    name: 'Uber Freight',
    mark: { label: 'Freight', bg: '#724be8' },
    channels: ['Web Widget', 'Email', 'Slack'],
  },
  {
    id: 'uber-health',
    name: 'Uber Health',
    mark: { label: 'Health', bg: '#c8402f' },
    channels: ['Inbound Voice', 'Email'],
  },
]

// Rotated deterministically by brand count, so a created brand's chip colour is
// stable across renders without Math.random.
const MARK_COLORS = ['#2f3130', '#1f73b7', '#0f8a5f', '#724be8', '#c8402f', '#be297b']

function markFor(name: string, index: number): BrandMark {
  return {
    label: name.length <= 10 ? name : name.split(/\s+/)[0],
    bg: MARK_COLORS[index % MARK_COLORS.length],
  }
}

// Brands persist for the same reason the roster does (see agent-roster-store.ts):
// a brand created in the wizard and its agent are one act, and if only the roster
// survived a refresh the agent would be left pointing at a brand nothing answers
// to — the table would group it under its raw slug, the header switcher could not
// list it, and the page filter could never select it. Bump the key's version when
// INITIAL_BRANDS changes: a session that has already written its list never sees
// new seeds.
export const BRANDS_STORAGE_KEY = 'brand-context-v1'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isBrand(value: unknown): value is Brand {
  if (typeof value !== 'object' || value === null) return false
  const brand = value as Partial<Brand>
  const mark: unknown = brand.mark
  if (typeof mark !== 'object' || mark === null) return false
  const { label, bg } = mark as Partial<BrandMark>
  return (
    typeof brand.id === 'string' &&
    typeof brand.name === 'string' &&
    typeof label === 'string' &&
    typeof bg === 'string' &&
    isStringArray(brand.channels)
  )
}

function loadBrands(): Brand[] {
  try {
    const raw = window.localStorage?.getItem(BRANDS_STORAGE_KEY)
    if (raw === null || raw === undefined) return INITIAL_BRANDS
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_BRANDS
    const brands = parsed.filter(isBrand)
    // Unlike the roster, an empty list is NOT a real state here: nothing deletes a
    // brand, so an empty (or wholly malformed) payload can only be corruption, and
    // honouring it would leave every stored agent orphaned.
    return brands.length > 0 ? brands : INITIAL_BRANDS
  } catch {
    return INITIAL_BRANDS
  }
}

function persistBrands(brands: Brand[]): void {
  try {
    window.localStorage?.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands))
  } catch {
    // Storage unavailable or full — the in-memory brands are still correct.
  }
}

let seq = 0

// Resumes above the highest suffix already in the list, so a reloaded provider
// cannot re-mint an id it handed out before the refresh (the module counter
// restarts at 0; the persisted brands do not).
function nextSeq(brands: Brand[]): number {
  seq = Math.max(seq, maxIdSuffix(brands.map((brand) => brand.id))) + 1
  return seq
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(loadBrands)
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null)
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null)

  const currentBrand = useMemo(
    () => brands.find((brand) => brand.id === currentBrandId) ?? null,
    [brands, currentBrandId],
  )

  // Changing the brand always drops the agent: keeping it would let the top bar
  // name an agent from a brand the Manage agents table is no longer showing.
  // AgentSwitcher re-derives a display agent from the new scope instead.
  const setCurrentBrand = useCallback((id: string | null) => {
    setCurrentBrandId(id)
    setCurrentAgentId(null)
  }, [])

  const setCurrentAgent = useCallback((agent: { id: string; brandId: string }) => {
    setCurrentBrandId(agent.brandId)
    setCurrentAgentId(agent.id)
  }, [])

  const addBrand = useCallback(
    (name: string, channels: string[]) => {
      const n = nextSeq(brands)
      const brand: Brand = {
        id: `${name.toLowerCase().replace(/\s+/g, '-')}-${n}`,
        name,
        mark: markFor(name, n),
        channels,
      }
      setBrands((prev) => [...prev, brand])
      setCurrentBrandId(brand.id)
      setCurrentAgentId(null)
      return brand
    },
    [brands],
  )

  useEffect(() => {
    persistBrands(brands)
  }, [brands])

  const value = useMemo<BrandContextValue>(
    () => ({ brands, currentBrand, currentAgentId, setCurrentBrand, setCurrentAgent, addBrand }),
    [brands, currentBrand, currentAgentId, setCurrentBrand, setCurrentAgent, addBrand],
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrands() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrands must be used within BrandProvider')
  return ctx
}

// The only place All brands is flattened to a string, for consumers that key
// storage by scope (git sync, briefing memory). Never store this in context.
export function brandScopeKey(currentBrand: Brand | null): string {
  return currentBrand?.id ?? 'all-brands'
}
