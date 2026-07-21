# Top intents brand breakdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each "Top intents" row click-to-expand into a fixed VIP/Premium/Vendor customer-tier breakdown showing `share% · N tickets` with a proportional bar.

**Architecture:** Authored mock data on each intent (`tickets` total + `byBrand[]`); `IntentsCard` becomes an accordion (one open row at a time) via local `useState<string | null>`. No aggregation math — all numbers are authored. Presentational + mock only.

**Tech Stack:** React 19, TypeScript (strict, pinned 5.9), Tailwind v4, Vitest + React Testing Library.

## Global Constraints

- **No backend.** All data is mocked in `src/features/home/dashboard-data.ts`.
- **TypeScript strict**; keep new code fully typed. Do NOT bump TypeScript (pinned 5.9).
- **Reliable gates:** `npx tsc --noEmit`, `npx vitest run`, `npx vite build`. `pnpm lint` is broken upstream — do not rely on it.
- **Palette:** reuse existing inline constants in `HomeScreen.tsx` (`INK`, `MUTED`, `BORDER`, `BLUE`, `PURPLE`, `AMBER`, `GREEN`). Do NOT introduce new hex or `font-[...]` classes.
- **Tier set is fixed and ordered** `['vip', 'premium', 'vendor']` in every `byBrand` array; labels `VIP`, `Premium`, `Vendor`.
- **One authored source per number.** `byBrand[].tickets` are authored consistently with `round(share/100 × intent.tickets)` — not derived at runtime. `byBrand[].share` values sum to 100 per intent.
- **Accordion:** exactly one intent panel open at a time; clicking the open row collapses it. Collapsed is the default and must render identically to today's card.

---

### Task 1: Data model + mock brand data

**Files:**
- Modify: `src/features/home/dashboard-data.ts`

**Interfaces:**
- Consumes: existing `LevelData`, `DATA.platform.intents`.
- Produces: `BrandKey`, `IntentBrandDatum` (exported types); each `intents[]` entry gains `tickets: number` and `byBrand: IntentBrandDatum[]`.

- [ ] **Step 1: Add the tier types**

Add near the other exported types (e.g. just after `ChannelHealth`), verbatim:

```ts
// Fixed customer tiers every top-intent breaks down into. `share` is the tier's
// % within a single intent (the three sum to 100); `tickets` is that tier's slice
// of the intent's own `tickets` total, authored as round(share/100 * intent.tickets).
export type BrandKey = 'vip' | 'premium' | 'vendor'
export type IntentBrandDatum = { key: BrandKey; label: string; share: number; tickets: number }
```

- [ ] **Step 2: Extend the `intents` field type on `LevelData`**

Find this line in the `LevelData` type:

```ts
  intents: { id: string; name: string; share: number }[]
```

Replace it with:

```ts
  intents: { id: string; name: string; share: number; tickets: number; byBrand: IntentBrandDatum[] }[]
```

- [ ] **Step 3: Populate the mock intents with tickets + byBrand**

Find the `intents:` array inside `DATA.platform` (currently four objects `in1`–`in4`) and replace the whole array with the following. Tier shares sum to 100 per intent; each tier's `tickets` = `round(share/100 * intent.tickets)`:

```ts
    intents: [
      {
        id: 'in1', name: 'Order status', share: 34, tickets: 4200,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 15, tickets: 630 },
          { key: 'premium', label: 'Premium', share: 25, tickets: 1050 },
          { key: 'vendor', label: 'Vendor', share: 60, tickets: 2520 },
        ],
      },
      {
        id: 'in2', name: 'Refund request', share: 22, tickets: 2720,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 55, tickets: 1496 },
          { key: 'premium', label: 'Premium', share: 30, tickets: 816 },
          { key: 'vendor', label: 'Vendor', share: 15, tickets: 408 },
        ],
      },
      {
        id: 'in3', name: 'Account access', share: 18, tickets: 2220,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 30, tickets: 666 },
          { key: 'premium', label: 'Premium', share: 45, tickets: 999 },
          { key: 'vendor', label: 'Vendor', share: 25, tickets: 555 },
        ],
      },
      {
        id: 'in4', name: 'Product info', share: 14, tickets: 1600,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 20, tickets: 320 },
          { key: 'premium', label: 'Premium', share: 30, tickets: 480 },
          { key: 'vendor', label: 'Vendor', share: 50, tickets: 800 },
        ],
      },
    ],
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean (no errors). If `HomeScreen.tsx` errors because it reads a now-missing field, that is expected only if it referenced fields that still exist — it should NOT, since we only added fields. A clean pass confirms the data change is self-contained.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/dashboard-data.ts
git commit -m "feat: add per-brand tier breakdown to Top intents mock data"
```

---

### Task 2: IntentsCard accordion rendering + tests

**Files:**
- Modify: `src/features/home/HomeScreen.tsx` (the `IntentsCard` function, ~line 582)
- Test: `src/features/home/HomeScreen.test.tsx`

**Interfaces:**
- Consumes: `LevelData.intents[]` with `tickets` and `byBrand` (from Task 1), the `BrandKey`/`IntentBrandDatum` types, existing palette constants, `ChevronDown` (already imported from lucide-react).
- Produces: no new exports (internal component change).

- [ ] **Step 1: Write the failing tests**

Add this block to `src/features/home/HomeScreen.test.tsx` (inside the existing top-level `describe`, alongside the other card tests). It reuses the file's existing imports (`render`, `screen`, `within`, `userEvent`).

```tsx
// The brand breakdown lives in the Top intents card; scope queries to it.
function intentsCard(): HTMLElement {
  const title = screen.getByText('Top intents')
  const card = title.closest('div.rounded-2xl')
  if (!card) throw new Error('Top intents card not found')
  return card as HTMLElement
}

describe('Top intents brand breakdown', () => {
  it('renders every intent collapsed by default', () => {
    render(<HomeScreen />)
    const card = within(intentsCard())
    // No tier labels visible until a row is expanded.
    expect(card.queryByText('VIP')).not.toBeInTheDocument()
    expect(card.queryByText('Vendor')).not.toBeInTheDocument()
    // Every intent row is a collapsed toggle.
    const rows = card.getAllByRole('button', { expanded: false })
    expect(rows.length).toBeGreaterThanOrEqual(4)
  })

  it('expands an intent to reveal its VIP/Premium/Vendor breakdown', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const card = within(intentsCard())
    await user.click(card.getByRole('button', { name: /order status/i }))
    expect(card.getByText('VIP')).toBeInTheDocument()
    expect(card.getByText('Premium')).toBeInTheDocument()
    expect(card.getByText('Vendor')).toBeInTheDocument()
    // Order status → Vendor is 60% · 2,520 tickets.
    expect(card.getByText(/60% · 2,520 tickets/)).toBeInTheDocument()
    expect(card.getByRole('button', { name: /order status/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps only one intent open at a time (accordion)', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const card = within(intentsCard())
    await user.click(card.getByRole('button', { name: /order status/i }))
    await user.click(card.getByRole('button', { name: /refund request/i }))
    expect(card.getByRole('button', { name: /order status/i })).toHaveAttribute('aria-expanded', 'false')
    expect(card.getByRole('button', { name: /refund request/i })).toHaveAttribute('aria-expanded', 'true')
    // Exactly one panel open.
    expect(card.getAllByRole('button', { expanded: true })).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run HomeScreen`
Expected: the three new tests FAIL (intent rows are not buttons / no tier labels). Existing tests still pass.

- [ ] **Step 3: Rewrite `IntentsCard` as an accordion**

Replace the entire `IntentsCard` function (currently at ~line 582) with:

```tsx
// Per-tier fill colors for the intent brand breakdown (VIP / Premium / Vendor).
const BRAND_COLORS: Record<BrandKey, string> = {
  vip: PURPLE,
  premium: BLUE,
  vendor: AMBER,
}

function IntentsCard({ data }: { data: LevelData }) {
  // Accordion: at most one intent expanded at a time (its id, or null).
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <Card>
      <CardHeader icon={<ListChecks size={18} color={INK} strokeWidth={2} />} title="Top intents" action={<LinkButton label="Insights" />} />
      <div className="flex flex-col gap-3">
        {data.intents.map((it, idx) => {
          const open = openId === it.id
          const panelId = `intent-brands-${it.id}`
          return (
            <div key={it.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : it.id)}
                className="w-full text-left outline-none"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <p className="text-[13px] font-normal" style={{ color: INK }}>{it.name}</p>
                    <ChevronDown
                      size={13}
                      color={MUTED}
                      className="transition-transform"
                      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                      aria-hidden
                    />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: INK }}>{it.share}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: '#efeeec' }}>
                  <div className="h-full rounded-full" style={{ width: `${it.share}%`, backgroundColor: INTENT_COLORS[idx % INTENT_COLORS.length] }} />
                </div>
              </button>
              {open && (
                <div
                  id={panelId}
                  role="region"
                  aria-label={`${it.name} by brand`}
                  className="mt-2.5 flex flex-col gap-2.5 rounded-xl border border-solid p-3 pt-2.5"
                  style={{ borderColor: BORDER, backgroundColor: '#faf9f8' }}
                >
                  {it.byBrand.map((b) => (
                    <div key={b.key}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[b.key] }} />
                          <span className="text-[12px] font-normal" style={{ color: INK }}>{b.label}</span>
                        </div>
                        <span className="text-[11px] font-normal" style={{ color: MUTED }}>
                          {b.share}% · {b.tickets.toLocaleString('en-US')} tickets
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: '#efeeec' }}>
                        <div className="h-full rounded-full" style={{ width: `${b.share}%`, backgroundColor: BRAND_COLORS[b.key] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
```

- [ ] **Step 4: Add the `BrandKey` import**

In the `dashboard-data` import block at the top of `HomeScreen.tsx`, add `type BrandKey` to the existing type list:

```ts
import {
  type LevelData, type HealthState, type HealthMetric, type ChannelKey, type BrandKey,
  type WidgetId, type ColumnKey, type Layout,
  DATA, DEFAULT_LAYOUT,
} from './dashboard-data'
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run HomeScreen`
Expected: all tests PASS (the three new ones plus the existing suite).

- [ ] **Step 6: Full gates**

Run: `npx tsc --noEmit` → clean; `npx vitest run` → all pass; `npx vite build` → succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/features/home/HomeScreen.tsx src/features/home/HomeScreen.test.tsx
git commit -m "feat: expand Top intents rows into VIP/Premium/Vendor breakdown"
```

---

## Self-Review

- **Spec coverage:** click-to-expand (Task 2 Step 3, `<button aria-expanded>`), accordion one-at-a-time (`useState<string|null>`, tests in Step 1), VIP/Premium/Vendor fixed order (Task 1 data), `share% · N tickets` with thousands separator (`toLocaleString('en-US')`), proportional bar = within-intent share, authored tickets not derived (Task 1 Step 3), a11y (`aria-expanded`/`aria-controls`/`role=region`/`aria-label`, decorative chevron), scoped tests (`intentsCard()` helper). All covered.
- **Placeholder scan:** none — all steps carry real code and commands.
- **Type consistency:** `BrandKey`/`IntentBrandDatum` defined in Task 1, imported and used in Task 2; `byBrand`/`tickets` field names match between data and render; `BRAND_COLORS` keyed by `BrandKey`.
