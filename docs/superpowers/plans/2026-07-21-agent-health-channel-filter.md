# Agent-health channel filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a multi-select channel filter to the Home dashboard's "Overall agent health" card so the whole card (score, health-state pill, trend sparkline, four metric tiles, AI summary) re-scopes to the selected channels via honest volume-weighted aggregation.

**Architecture:** Add per-channel health (`channelHealth`) and a per-metric polarity flag (`goodWhenUp`) to the mock data. Extract the aggregation math into a pure, unit-tested helper (`health-aggregate.ts`). Wire a local `Set<ChannelKey>` filter into `AgentHealthCard`, which calls the helper and binds every part of the card to the result. All-four-selected bypasses aggregation and renders today's card verbatim.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4, Vitest + React Testing Library, lucide-react, recharts.

## Global Constraints

- TypeScript strict mode; keep new code fully typed. Do NOT bump TypeScript (pinned 5.9).
- Use existing inline palette constants in `HomeScreen.tsx` (`INK`, `INK_SOFT`, `MUTED`, `BORDER`, `BLUE`, `GREEN`, `AMBER`, `RED`, `PURPLE`). No new hues.
- No new dependencies. Mock/presentational only — no backend.
- All-four-channels-selected is the default and MUST render byte-for-byte as today (bypass the aggregation path; use the existing top-level `score`, `healthState`, `trend`, and per-metric `value`/`delta`/`up`/`good` verbatim).
- Minimum one channel selected: unchecking the last remaining channel is a no-op.
- Delta aggregation is an approximation (deltas are not strictly additive) — mark it with a code comment.
- `channelHealth[c].share` is the single source of volume weight for both header and metric aggregation.
- Reliable gates: `pnpm test`, `pnpm typecheck`, `pnpm build`. (`pnpm lint` is known-broken upstream — do not rely on it.)
- `Level` is a single value (`'platform'`) — there is one `LevelData` object to update.

---

## File Structure

- `src/features/home/dashboard-data.ts` — add `ChannelHealth` type + `channelHealth` field on `LevelData`; add `goodWhenUp` to `HealthMetric`; populate both.
- `src/features/home/health-aggregate.ts` — **new.** Pure aggregation: `computeHealthView(data, selected)` + value/delta parse/format helpers + `scoreToState`.
- `src/features/home/health-aggregate.test.ts` — **new.** Unit tests for the helper.
- `src/features/home/HomeScreen.tsx` — filter pills + scoped caption in `AgentHealthCard`; bind card to `computeHealthView`; dim unselected channels in `MetricTile` popover.
- `src/features/home/HomeScreen.test.tsx` — component tests for the filter behavior.

---

### Task 1: Extend the mock data model with per-channel health and metric polarity

**Files:**
- Modify: `src/features/home/dashboard-data.ts` (type `HealthMetric` ~28-37; type `LevelData` ~39-93; `DATA.platform` ~107-239)

**Interfaces:**
- Consumes: existing `ChannelKey`, `HealthMetric`, `LevelData`.
- Produces: `ChannelHealth = { score: number; trend: number[]; share: number }`; `LevelData.channelHealth: Record<ChannelKey, ChannelHealth>`; `HealthMetric.goodWhenUp: boolean`. Consumed by `health-aggregate.ts` (Task 2).

- [ ] **Step 1: Add the `goodWhenUp` field to `HealthMetric`**

In `src/features/home/dashboard-data.ts`, in the `HealthMetric` type, add after `good: boolean`:

```ts
  // true when a rising value is good (resolution, CSAT); false when a falling
  // value is good (escalations, avg handle time). Drives good/up after aggregation.
  goodWhenUp: boolean
```

- [ ] **Step 2: Add the `ChannelHealth` type and `channelHealth` field**

Above `export type LevelData`, add:

```ts
// Per-channel-family health, so the agent-health card can re-scope to a subset
// of channels. `share` is the % of total volume and the single source of the
// volume weight used for all aggregation (header + metric tiles).
export type ChannelHealth = { score: number; trend: number[]; share: number }
```

Inside `LevelData`, add after `trend: number[]`:

```ts
  channelHealth: Record<ChannelKey, ChannelHealth>
```

- [ ] **Step 3: Set `goodWhenUp` on each metric in `DATA.platform.metrics`**

Add `goodWhenUp: true,` to the `res` (Resolution rate) and `csat` (CSAT) metric objects (on the same line as the other flags, e.g. after `good: true,`). Add `goodWhenUp: false,` to the `esc` (Escalations) and `aht` (Avg handle time) metric objects.

- [ ] **Step 4: Populate `channelHealth` on `DATA.platform`**

Add this field to `DATA.platform` (e.g. immediately after the `trend: [...]` line):

```ts
    channelHealth: {
      messaging: { score: 97, share: 58, trend: [80, 82, 81, 86, 88, 90, 93, 94, 96, 97] },
      email: { score: 93, share: 24, trend: [72, 75, 74, 80, 79, 85, 88, 90, 91, 93] },
      voice: { score: 82, share: 14, trend: [60, 64, 62, 68, 66, 72, 76, 78, 80, 82] },
      headless: { score: 95, share: 4, trend: [85, 88, 86, 90, 89, 92, 94, 93, 95, 95] },
    },
```

(Volume-weighted average of the scores is ~94, matching the top-level `score: 94`; the default view bypasses aggregation and uses `score` directly, so exact match is not required.)

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no type errors).

- [ ] **Step 6: Commit**

```bash
git add src/features/home/dashboard-data.ts
git commit -m "feat: add per-channel health and metric polarity to dashboard data"
```

---

### Task 2: Pure aggregation helper + unit tests

**Files:**
- Create: `src/features/home/health-aggregate.ts`
- Test: `src/features/home/health-aggregate.test.ts`

**Interfaces:**
- Consumes: `LevelData`, `HealthMetric`, `ChannelKey`, `HealthState` from `./dashboard-data` (Task 1).
- Produces:
  - `type HealthView = { score: number; healthState: HealthState; trend: number[]; metrics: HealthMetric[]; aiSummary: string }`
  - `function computeHealthView(data: LevelData, selected: Set<ChannelKey>): HealthView`
  - `const CHANNEL_ORDER: ChannelKey[]`, `const CHANNEL_LABEL: Record<ChannelKey, string>`
  Consumed by `AgentHealthCard` (Task 3).

- [ ] **Step 1: Write the failing unit test**

Create `src/features/home/health-aggregate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeHealthView, parseMetricValue, formatMetricValue, scoreToState } from './health-aggregate'
import { DATA } from './dashboard-data'
import type { ChannelKey } from './dashboard-data'

const ALL: Set<ChannelKey> = new Set(['messaging', 'email', 'voice', 'headless'])

describe('health-aggregate', () => {
  it('bypasses aggregation when all four channels are selected', () => {
    const view = computeHealthView(DATA.platform, ALL)
    expect(view.score).toBe(DATA.platform.score)          // 94
    expect(view.trend).toBe(DATA.platform.trend)          // same reference
    expect(view.metrics).toBe(DATA.platform.metrics)      // same reference
    expect(view.aiSummary).toBe(DATA.platform.aiSummary)  // hand-written summary
  })

  it('volume-weights the score for a subset', () => {
    // messaging(97, share 58) + email(93, share 24): 0.7073*97 + 0.2927*93 = 95.83
    const view = computeHealthView(DATA.platform, new Set<ChannelKey>(['messaging', 'email']))
    expect(view.score).toBe(96)
    expect(view.healthState).toBe('good')
  })

  it('volume-weights and reformats a percent metric', () => {
    // resolution messaging 86 / email 79 → 0.7073*86 + 0.2927*79 = 83.95 → "84%"
    const view = computeHealthView(DATA.platform, new Set<ChannelKey>(['messaging', 'email']))
    const res = view.metrics.find((m) => m.key === 'res')!
    expect(res.value).toBe('84%')
    expect(res.up).toBe(true)   // both deltas positive
    expect(res.good).toBe(true) // resolution: goodWhenUp
  })

  it('returns a single channel’s own numbers when only it is selected', () => {
    const view = computeHealthView(DATA.platform, new Set<ChannelKey>(['voice']))
    expect(view.score).toBe(82)
    expect(view.healthState).toBe('attention')
    const res = view.metrics.find((m) => m.key === 'res')!
    expect(res.value).toBe('71%')  // voice resolution
  })

  it('parses and reformats each value unit', () => {
    expect(parseMetricValue('82%', 'percent')).toBe(82)
    expect(formatMetricValue(83.95, 'percent')).toBe('84%')
    expect(parseMetricValue('4.6', 'score')).toBe(4.6)
    expect(formatMetricValue(4.55, 'score')).toBe('4.6')
    expect(parseMetricValue('1m 48s', 'duration')).toBe(108)
    expect(formatMetricValue(108, 'duration')).toBe('1m 48s')
    expect(formatMetricValue(125, 'duration')).toBe('2m 05s')
  })

  it('maps aggregated score to a health state', () => {
    expect(scoreToState(94)).toBe('good')
    expect(scoreToState(82)).toBe('attention')
    expect(scoreToState(60)).toBe('critical')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run health-aggregate`
Expected: FAIL — module `./health-aggregate` not found.

- [ ] **Step 3: Implement the helper**

Create `src/features/home/health-aggregate.ts`:

```ts
import type { ChannelKey, HealthMetric, HealthState, LevelData } from './dashboard-data'

// The four channel families in canonical display order.
export const CHANNEL_ORDER: ChannelKey[] = ['messaging', 'email', 'voice', 'headless']
export const CHANNEL_LABEL: Record<ChannelKey, string> = {
  messaging: 'Messaging',
  email: 'Email',
  voice: 'Voice',
  headless: 'Headless',
}

export type MetricUnit = 'percent' | 'score' | 'duration'

// The aggregated card view for the currently-selected channels.
export type HealthView = {
  score: number
  healthState: HealthState
  trend: number[]
  metrics: HealthMetric[]
  aiSummary: string
}

// A metric's byChannel values share one unit; infer it from the value shape.
export function metricUnit(value: string): MetricUnit {
  if (value.includes('%')) return 'percent'
  if (value.includes('m') || value.trim().endsWith('s')) return 'duration'
  return 'score'
}

// "82%" -> 82, "4.6" -> 4.6, "1m 48s" -> 108 (seconds).
export function parseMetricValue(value: string, unit: MetricUnit): number {
  if (unit === 'duration') {
    const m = /(?:(\d+)m)?\s*(?:(\d+)s)?/.exec(value.trim())
    const mins = m?.[1] ? Number(m[1]) : 0
    const secs = m?.[2] ? Number(m[2]) : 0
    return mins * 60 + secs
  }
  return parseFloat(value)
}

export function formatMetricValue(n: number, unit: MetricUnit): string {
  if (unit === 'percent') return `${Math.round(n)}%`
  if (unit === 'score') return n.toFixed(1)
  const total = Math.round(n)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}m ${String(secs).padStart(2, '0')}s`
}

// Delta strings: "+3.1%", "+0.2", "-9s". Parse to a signed number in the
// metric's unit (percent points, score points, or seconds).
export function parseMetricDelta(delta: string, unit: MetricUnit): number {
  if (unit === 'duration') return parseFloat(delta) // "-9s" -> -9
  return parseFloat(delta)
}

export function formatMetricDelta(n: number, unit: MetricUnit): string {
  const sign = n >= 0 ? '+' : '-'
  const abs = Math.abs(n)
  if (unit === 'percent') return `${sign}${abs.toFixed(1)}%`
  if (unit === 'score') return `${sign}${abs.toFixed(1)}`
  return `${sign}${Math.round(abs)}s`
}

export function scoreToState(score: number): HealthState {
  if (score >= 90) return 'good'
  if (score >= 75) return 'attention'
  return 'critical'
}

// Normalized volume weights over the selected channels (sum to 1).
function weightsFor(data: LevelData, selected: Set<ChannelKey>): Map<ChannelKey, number> {
  const keys = CHANNEL_ORDER.filter((k) => selected.has(k))
  const total = keys.reduce((s, k) => s + data.channelHealth[k].share, 0)
  return new Map(keys.map((k) => [k, data.channelHealth[k].share / total]))
}

function aggregateMetric(metric: HealthMetric, weights: Map<ChannelKey, number>): HealthMetric {
  const unit = metricUnit(metric.value)
  const byKey = new Map(metric.byChannel.map((c) => [c.key, c]))
  let valueSum = 0
  // NOTE: delta aggregation is a volume-weighted approximation — deltas are not
  // strictly additive, but this reads honestly for a mock dashboard.
  let deltaSum = 0
  for (const [k, w] of weights) {
    const c = byKey.get(k)
    if (!c) continue
    valueSum += w * parseMetricValue(c.value, unit)
    deltaSum += w * parseMetricDelta(c.delta, unit)
  }
  const up = deltaSum > 0
  const good = metric.goodWhenUp ? up : !up
  return {
    ...metric,
    value: formatMetricValue(valueSum, unit),
    delta: formatMetricDelta(deltaSum, unit),
    up,
    good,
  }
}

// Deterministic one-line summary for a filtered subset (no hand-written prose).
function summarize(selected: Set<ChannelKey>, metrics: HealthMetric[]): string {
  const labels = CHANNEL_ORDER.filter((k) => selected.has(k)).map((k) => CHANNEL_LABEL[k])
  const laggard = metrics.find((m) => !m.good)
  if (laggard) {
    return `Filtered to ${labels.join(', ')} — ${laggard.label.toLowerCase()} is the weak spot at ${laggard.value}.`
  }
  return `Filtered to ${labels.join(', ')} — all tracked metrics are healthy.`
}

// Returns the card view for the selected channels. When all four are selected,
// returns the top-level (hand-authored) values verbatim so the default view
// never drifts from today's card.
export function computeHealthView(data: LevelData, selected: Set<ChannelKey>): HealthView {
  if (selected.size >= CHANNEL_ORDER.length) {
    return {
      score: data.score,
      healthState: data.healthState,
      trend: data.trend,
      metrics: data.metrics,
      aiSummary: data.aiSummary,
    }
  }
  const weights = weightsFor(data, selected)
  const score = Math.round(
    [...weights].reduce((s, [k, w]) => s + w * data.channelHealth[k].score, 0),
  )
  const trend = data.trend.map((_, i) =>
    Math.round([...weights].reduce((s, [k, w]) => s + w * data.channelHealth[k].trend[i], 0)),
  )
  const metrics = data.metrics.map((m) => aggregateMetric(m, weights))
  return { score, healthState: scoreToState(score), trend, metrics, aiSummary: summarize(selected, metrics) }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run health-aggregate`
Expected: PASS (all cases).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/home/health-aggregate.ts src/features/home/health-aggregate.test.ts
git commit -m "feat: add volume-weighted agent-health aggregation helper"
```

---

### Task 3: Wire the channel filter into `AgentHealthCard` + component tests

**Files:**
- Modify: `src/features/home/HomeScreen.tsx` (`MetricTile` ~114-172; `AgentHealthCard` ~174-214)
- Test: `src/features/home/HomeScreen.test.tsx`

**Interfaces:**
- Consumes: `computeHealthView`, `CHANNEL_ORDER`, `CHANNEL_LABEL` (Task 2); `CHANNEL_FAMILY_ICON`, palette constants, `HEALTH_STATE_META` (existing).
- Produces: rendered output only.

- [ ] **Step 1: Write the failing component tests**

In `src/features/home/HomeScreen.test.tsx`, add these tests inside the `describe('HomeScreen', ...)` block (e.g. after the existing "shows the AI short summary" test at ~95):

```tsx
  // The channel filter lives in the agent-health card; scope queries to it.
  function healthCard(): HTMLElement {
    const title = screen.getByText('Overall agent health')
    const card = title.closest('div.rounded-2xl')
    if (!card) throw new Error('agent-health card not found')
    return card as HTMLElement
  }

  it('defaults to all four channels selected with the platform score', () => {
    render(<HomeScreen />)
    const card = within(healthCard())
    const boxes = card.getAllByRole('checkbox')
    expect(boxes).toHaveLength(4)
    expect(boxes.every((b) => b.getAttribute('aria-checked') === 'true')).toBe(true)
    expect(card.getByText('94')).toBeInTheDocument()
    // No "Filtered" caption when everything is selected.
    expect(card.queryByText(/^Filtered/)).not.toBeInTheDocument()
  })

  it('re-scopes the card to a single channel', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const card = within(healthCard())
    // Uncheck all but Voice.
    await user.click(card.getByRole('checkbox', { name: /messaging/i }))
    await user.click(card.getByRole('checkbox', { name: /email/i }))
    await user.click(card.getByRole('checkbox', { name: /headless/i }))
    expect(card.getByText('82')).toBeInTheDocument()       // voice score
    expect(card.getByText(/^Filtered/)).toBeInTheDocument() // scoped caption
  })

  it('does not allow unchecking the last channel', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const card = within(healthCard())
    await user.click(card.getByRole('checkbox', { name: /messaging/i }))
    await user.click(card.getByRole('checkbox', { name: /email/i }))
    await user.click(card.getByRole('checkbox', { name: /headless/i }))
    const voice = card.getByRole('checkbox', { name: /voice/i })
    expect(voice.getAttribute('aria-checked')).toBe('true')
    await user.click(voice) // no-op: last remaining channel
    expect(voice.getAttribute('aria-checked')).toBe('true')
  })
```

Ensure `within` is imported (it already is: `import { render, screen, within } from '@testing-library/react'`).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run HomeScreen`
Expected: FAIL — no checkboxes in the agent-health card yet.

- [ ] **Step 3: Add the filter state, pills, and aggregated binding to `AgentHealthCard`**

In `src/features/home/HomeScreen.tsx`, update the import from `./dashboard-data` to include nothing new (types already imported), and add a new import line after it:

```tsx
import { computeHealthView, CHANNEL_ORDER, CHANNEL_LABEL } from './health-aggregate'
```

Replace the `AgentHealthCard` function body so it derives the view from a selection set. The full replacement:

```tsx
function AgentHealthCard({ data }: { data: LevelData }) {
  const [selected, setSelected] = useState<Set<ChannelKey>>(
    () => new Set(CHANNEL_ORDER),
  )
  const view = useMemo(() => computeHealthView(data, selected), [data, selected])
  const chart = useMemo(() => view.trend.map((v, i) => ({ i, v })), [view.trend])
  const state = HEALTH_STATE_META[view.healthState]
  const allSelected = selected.size >= CHANNEL_ORDER.length

  function toggle(key: ChannelKey) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev // keep at least one channel
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader icon={<Activity size={18} color={INK} strokeWidth={2} />} title="Overall agent health" action={<LinkButton label="Open Insights" />} />
      {/* Channel filter — the whole card re-scopes to the selected channels. */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {CHANNEL_ORDER.map((key) => {
          const on = selected.has(key)
          const Icon = CHANNEL_FAMILY_ICON[key]
          return (
            <button
              key={key}
              role="checkbox"
              aria-checked={on}
              aria-label={CHANNEL_LABEL[key]}
              onClick={() => toggle(key)}
              className="flex h-7 items-center gap-1.5 rounded-full border border-solid px-2.5 outline-none transition-colors"
              style={{
                borderColor: on ? INK : BORDER,
                backgroundColor: on ? `${INK}0d` : '#fff',
              }}
            >
              <Icon size={13} color={on ? INK : MUTED} />
              <span className="text-[12px] font-semibold" style={{ color: on ? INK : MUTED }}>
                {CHANNEL_LABEL[key]}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex items-stretch gap-6">
        <div className="flex w-[168px] shrink-0 flex-col justify-center">
          <div className="flex items-end gap-1.5">
            <span className="text-[44px] font-medium leading-[44px]" style={{ color: INK }}>{view.score}</span>
            <span className="mb-1.5 text-[16px] font-normal" style={{ color: MUTED }}>/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="flex h-[22px] items-center gap-1 rounded-full px-2" style={{ backgroundColor: `${state.color}18` }}>
              <state.Icon size={13} color={state.color} />
              <span className="text-[12px] font-semibold" style={{ color: state.color }}>{state.label}</span>
            </span>
          </div>
          {!allSelected && (
            <p className="mt-2 text-[11px] font-normal" style={{ color: MUTED }}>
              Filtered · {CHANNEL_ORDER.filter((k) => selected.has(k)).map((k) => CHANNEL_LABEL[k]).join(', ')}
            </p>
          )}
          <div className="mt-3 -mx-0.5 h-[44px]">
            <Sparkline data={chart} color={state.color} gradientId="healthFill" />
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3">
          {view.metrics.map((m) => (
            <MetricTile key={m.key} metric={m} selected={selected} />
          ))}
        </div>
      </div>
      {/* AI short summary */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-solid p-3.5" style={{ borderColor: `${PURPLE}33`, backgroundColor: `${PURPLE}0a` }}>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${PURPLE}16` }}>
          <Sparkles size={13} color={PURPLE} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4px]" style={{ color: PURPLE }}>AI summary</p>
          <p className="mt-0.5 text-[12px] font-normal leading-[17px]" style={{ color: INK_SOFT }}>{view.aiSummary}</p>
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 4: Dim unselected channels in the `MetricTile` popover**

In `src/features/home/HomeScreen.tsx`, change the `MetricTile` signature to accept the selection, and dim rows for channels not in it. Update the signature:

```tsx
function MetricTile({ metric, selected }: { metric: HealthMetric; selected?: Set<ChannelKey> }) {
```

Inside the `metric.byChannel.map((c) => { ... })` callback, compute a dim flag right after `const Icon = CHANNEL_FAMILY_ICON[c.key]`:

```tsx
            const dim = selected ? !selected.has(c.key) : false
```

and apply it to the row wrapper `div` (the `<div key={c.key}>`), giving it reduced opacity when dimmed:

```tsx
              <div key={c.key} style={{ opacity: dim ? 0.4 : 1 }}>
```

(Leave the rest of the popover markup unchanged.)

- [ ] **Step 5: Run the component tests**

Run: `npx vitest run HomeScreen`
Expected: PASS (new tests + all existing agent-health tests, including "shows the AI short summary" / "no action needed right now" — still true because the default is all-selected → verbatim `aiSummary`).

- [ ] **Step 6: Full test suite, typecheck, build**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/home/HomeScreen.tsx src/features/home/HomeScreen.test.tsx
git commit -m "feat: channel filter on the agent-health card"
```

---

## Self-Review

- **Spec coverage:** multi-select model + all-on default (Task 3 state seed) ✓; min-one guard (Task 3 `toggle`) ✓; volume-weighted score/trend/value (Task 2) ✓; delta approximation flagged (Task 2 comment) ✓; polarity via `goodWhenUp` (Task 1 + Task 2) ✓; health-state thresholds (Task 2 `scoreToState`) ✓; all-selected bypass (Task 2 + verbatim summary) ✓; derived AI summary for subsets (Task 2 `summarize`) ✓; `channelHealth` + `share` single source (Task 1) ✓; filter pills + scoped caption + dimmed popover (Task 3) ✓; unit + component tests ✓.
- **Placeholder scan:** no TBD/TODO; all code shown in full.
- **Type consistency:** `HealthView`, `computeHealthView`, `CHANNEL_ORDER`, `CHANNEL_LABEL`, `parseMetricValue`, `formatMetricValue`, `scoreToState` defined in Task 2 match their use in Task 2's tests and Task 3's card. `ChannelHealth`, `channelHealth`, `goodWhenUp` defined in Task 1 match Task 2's consumption. `MetricTile`'s new `selected?` prop matches Task 3's call site.
- **Note:** `pnpm test -- HomeScreen` may not forward the name filter; use `npx vitest run HomeScreen` / `npx vitest run health-aggregate` as written.
