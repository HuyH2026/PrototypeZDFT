# CX Journey Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/insights/cx-journey` stub with the full mock CX Journey → Overview screen: one long scrollable page with a conversation-flow Sankey, an agents breakdown table, and 8 trend bar-charts with a functional Weekly/Monthly/Quarterly toggle.

**Architecture:** A new `src/features/insights/cx-journey/` folder. `CxJourneyView.tsx` is the page shell that owns the `granularity` state and composes three section components off a single mock-data module (`cx-journey-data.ts`). Charts use recharts (already a dependency), each wrapped in a self-measuring container so recharts never renders at zero size (mirrors the existing `Sparkline` pattern in `HomeScreen.tsx`).

**Tech Stack:** React 18 + TypeScript (strict), React Router v7, recharts 2.15.2 (`BarChart`, `Sankey`), Tailwind v4 semantic tokens, lucide-react icons, Vitest + React Testing Library.

## Global Constraints

- **Path alias:** `@` → `src/`. Do NOT add `baseUrl` to `tsconfig.json`.
- **TypeScript strict mode** — all new code fully typed.
- **No `font-['SF_Pro_*']`** arbitrary font-family classes.
- Use semantic token classes (`text-ink`, `text-ink-muted`, `border-surface-border`) rather than raw hex for text/borders; chart series colors are inline hex (matching `HomeScreen.tsx`: `BLUE '#1f73b7'`, `GREEN '#0f8a5f'`, `AMBER '#c8792b'`, `RED '#c8402f'`).
- All data is mocked — no backend.
- The root page element keeps `data-testid="view-cx-journey"` (preserves the existing test contract).
- The Overview/Topics/Automations strip is decorative (no routing). Date pill, audience dropdown, and Channel breakdown toggle are presentational. Only Weekly/Monthly/Quarterly is functional.
- Gates: `pnpm typecheck`, `pnpm test`, `pnpm build` (lint is known-broken per CLAUDE.md).
- Tests: recharts `ResponsiveContainer` measures 0×0 in jsdom — never assert SVG geometry; assert titles, labels, and toggle state only. `ResizeObserver` is already stubbed in `src/test/setup.ts`.

---

## File Structure

- Create: `src/features/insights/cx-journey/cx-journey-data.ts` — all mock data + types.
- Create: `src/features/insights/cx-journey/FilterRow.tsx` — shared presentational filter controls.
- Create: `src/features/insights/cx-journey/ConversationFlowSection.tsx` — section 1 (stat card + Sankey).
- Create: `src/features/insights/cx-journey/AgentsBreakdownTable.tsx` — section 2 (table).
- Create: `src/features/insights/cx-journey/TrendChartCard.tsx` — one bar-chart card.
- Create: `src/features/insights/cx-journey/TrendsSection.tsx` — section 3 (toggle + chart grid).
- Create: `src/features/insights/cx-journey/CxJourneyView.tsx` — page shell (owns `granularity`).
- Create: `src/features/insights/cx-journey/CxJourneyView.test.tsx` — page test.
- Delete: `src/features/insights/CxJourneyView.tsx` — old stub.
- Modify: `src/routes.tsx` — repoint the `cx-journey` import to the new path.

---

### Task 1: Mock data module

**Files:**
- Create: `src/features/insights/cx-journey/cx-journey-data.ts`
- Test: `src/features/insights/cx-journey/cx-journey-data.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Granularity = 'weekly' | 'monthly' | 'quarterly'`
  - `type FlowStat = { label: string; value: string; pct?: string }`
  - `const FLOW_HEADER: FlowStat[]`
  - `type FlowNode = { name: string; value: string; pct?: string }`
  - `type FlowLink = { source: number; target: number; value: number; color: string }`
  - `const FLOW_SANKEY: { nodes: FlowNode[]; links: FlowLink[] }`
  - `type SubStat = { emphasis: string; label: string }`
  - `type AgentCell = { primary: string; csat?: string; subs: SubStat[] }`
  - `type AgentRow = { agent: string; conversations: AgentCell; handled: AgentCell; resolved: AgentCell; efficiency: AgentCell }`
  - `const AGENT_ROWS: AgentRow[]`
  - `type ChartUnit = 'percent' | 'currency' | 'minutes' | 'hours' | 'count'`
  - `type TrendDatum = { bucket: string; value: number; value2?: number }`
  - `type TrendChart = { key: string; title: string; unit: ChartUnit; hasInfo?: boolean; stacked?: boolean; data: Record<Granularity, TrendDatum[]> }`
  - `const TREND_CHARTS: TrendChart[]`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/insights/cx-journey/cx-journey-data.test.ts
import { describe, expect, it } from 'vitest'
import { AGENT_ROWS, FLOW_HEADER, FLOW_SANKEY, TREND_CHARTS } from './cx-journey-data'

describe('cx-journey-data', () => {
  it('exposes three flow header stats', () => {
    expect(FLOW_HEADER.map((s) => s.value)).toEqual(['550,000', '530,000', '453,000'])
  })

  it('has 8 sankey nodes and links wired to valid node indices', () => {
    expect(FLOW_SANKEY.nodes).toHaveLength(8)
    for (const link of FLOW_SANKEY.links) {
      expect(link.source).toBeGreaterThanOrEqual(0)
      expect(link.source).toBeLessThan(FLOW_SANKEY.nodes.length)
      expect(link.target).toBeGreaterThanOrEqual(0)
      expect(link.target).toBeLessThan(FLOW_SANKEY.nodes.length)
    }
  })

  it('has three agent rows in order', () => {
    expect(AGENT_ROWS.map((r) => r.agent)).toEqual(['AI + Human', 'AI', 'Human'])
  })

  it('has 8 trend charts, each with data for all three granularities', () => {
    expect(TREND_CHARTS).toHaveLength(8)
    for (const chart of TREND_CHARTS) {
      expect(chart.data.weekly.length).toBeGreaterThan(0)
      expect(chart.data.monthly.length).toBeGreaterThan(0)
      expect(chart.data.quarterly.length).toBeGreaterThan(0)
    }
  })

  it('marks the total-conversations chart as stacked', () => {
    const stacked = TREND_CHARTS.filter((c) => c.stacked)
    expect(stacked).toHaveLength(1)
    expect(stacked[0].key).toBe('total-conversations')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- cx-journey-data`
Expected: FAIL — cannot resolve `./cx-journey-data`.

- [ ] **Step 3: Write the data module**

```ts
// src/features/insights/cx-journey/cx-journey-data.ts
// Mock data + types for the CX Journey → Overview screen. All values are
// illustrative (no backend). Numbers match the Figma design where legible.

export type Granularity = 'weekly' | 'monthly' | 'quarterly'

// Chart series colors (mirrors HomeScreen.tsx).
export const BLUE = '#1f73b7'
export const TEAL = '#158a80'
export const AMBER = '#c8792b'
export const RED = '#c8402f'
export const GREY = '#8b8e89'

// --- Section 1: conversation flow -----------------------------------------
export type FlowStat = { label: string; value: string; pct?: string }

export const FLOW_HEADER: FlowStat[] = [
  { label: 'Total conversation', value: '550,000' },
  { label: 'Handled', value: '530,000', pct: '83%' },
  { label: 'Resolved', value: '453,000', pct: '90%' },
]

export type FlowNode = { name: string; value: string; pct?: string }
export type FlowLink = { source: number; target: number; value: number; color: string }

// Node indices:
// 0 Total conversations | 1 AI handled | 2 Human handled | 3 Not handled
// 4 AI resolved | 5 Human resolved | 6 Not resolved | 7 Total cost
export const FLOW_SANKEY: { nodes: FlowNode[]; links: FlowLink[] } = {
  nodes: [
    { name: 'Total conversations', value: '550,000', pct: '100%' },
    { name: 'AI handled', value: '234,800', pct: '55%' },
    { name: 'Human handled', value: '221,720', pct: '35%' },
    { name: 'Not handled', value: '55,000', pct: '10%' },
    { name: 'AI resolved', value: '205,000', pct: '40%' },
    { name: 'Human resolved', value: '218,000', pct: '50%' },
    { name: 'Not resolved', value: '13,475', pct: '10%' },
    { name: 'Total cost', value: '$2.3M' },
  ],
  links: [
    { source: 0, target: 1, value: 234800, color: BLUE },
    { source: 0, target: 2, value: 221720, color: BLUE },
    { source: 0, target: 3, value: 55000, color: GREY },
    { source: 1, target: 4, value: 205000, color: TEAL },
    { source: 2, target: 5, value: 218000, color: AMBER },
    { source: 1, target: 6, value: 13475, color: RED },
    { source: 4, target: 7, value: 205000, color: TEAL },
    { source: 5, target: 7, value: 218000, color: TEAL },
  ],
}

// --- Section 2: agents breakdown ------------------------------------------
export type SubStat = { emphasis: string; label: string }
export type AgentCell = { primary: string; csat?: string; subs: SubStat[] }
export type AgentRow = {
  agent: string
  conversations: AgentCell
  handled: AgentCell
  resolved: AgentCell
  efficiency: AgentCell
}

export const AGENT_ROWS: AgentRow[] = [
  {
    agent: 'AI + Human',
    conversations: {
      primary: '550,000',
      subs: [
        { emphasis: '85%', label: 'total eligible (450,000)' },
        { emphasis: '15%', label: 'total not eligible (150,000)' },
      ],
    },
    handled: {
      primary: '530,000',
      subs: [
        { emphasis: '83%', label: 'of eligible' },
        { emphasis: '60%', label: 'Handled by AI' },
        { emphasis: '40%', label: 'Handled by human' },
      ],
    },
    resolved: {
      primary: '453,000',
      subs: [
        { emphasis: '90%', label: 'of handled' },
        { emphasis: '40%', label: 'Resolved by AI' },
        { emphasis: '50%', label: 'Resolved by human' },
        { emphasis: '10%', label: 'Not resolved' },
      ],
    },
    efficiency: {
      primary: '$2.3M',
      csat: '4.5',
      subs: [
        { emphasis: '$200K', label: 'AI total cost' },
        { emphasis: '$810k', label: 'Human total cost' },
        { emphasis: '87%', label: 'Positive Avg. sentiment' },
      ],
    },
  },
  {
    agent: 'AI',
    conversations: {
      primary: '300,000',
      subs: [
        { emphasis: '58%', label: 'total conversations' },
        { emphasis: '87%', label: 'eligible' },
        { emphasis: '13%', label: 'not eligible' },
      ],
    },
    handled: {
      primary: '234,800',
      subs: [
        { emphasis: '87%', label: 'of ai eligible' },
        { emphasis: '80%', label: 'deflected' },
        { emphasis: '20%', label: 'handoff to human' },
      ],
    },
    resolved: {
      primary: '205,000',
      subs: [
        { emphasis: '80%', label: 'of ai handled' },
        { emphasis: '60%', label: 'First interaction resolution' },
        { emphasis: '1 sec.', label: 'Avg. time to first response' },
        { emphasis: '3', label: 'Avg. interactions' },
      ],
    },
    efficiency: {
      primary: '$205K',
      csat: '4.3',
      subs: [
        { emphasis: '40%', label: 'of total conversations' },
        { emphasis: '92%', label: 'Positive Avg. sentiment' },
        { emphasis: '2 min.', label: 'Avg. full resolution time' },
        { emphasis: '$1', label: 'cost per resolution' },
      ],
    },
  },
  {
    agent: 'Human',
    conversations: {
      primary: '250,000',
      subs: [
        { emphasis: '42%', label: 'total conversations' },
        { emphasis: '90%', label: 'eligible' },
        { emphasis: '10%', label: 'not eligible' },
      ],
    },
    handled: {
      primary: '221,720',
      subs: [
        { emphasis: '90%', label: 'of human eligible' },
        { emphasis: '90%', label: 'resolved' },
        { emphasis: '10%', label: 'from AI handoff' },
        { emphasis: '15%', label: 'not resolved' },
      ],
    },
    resolved: {
      primary: '218,000',
      subs: [
        { emphasis: '94%', label: 'of human handled' },
        { emphasis: '80%', label: 'First contact resolution' },
        { emphasis: '30 min.', label: 'Avg. time to first response' },
        { emphasis: '3', label: 'Avg. replies' },
      ],
    },
    efficiency: {
      primary: '$2.1M',
      csat: '4.7',
      subs: [
        { emphasis: '50%', label: 'of total conversation' },
        { emphasis: '84%', label: 'Positive Avg. sentiment' },
        { emphasis: '2.5 hrs', label: 'Avg. full resolution time' },
        { emphasis: '$8.5', label: 'cost per resolution' },
      ],
    },
  },
]

// --- Section 3: trends -----------------------------------------------------
export type ChartUnit = 'percent' | 'currency' | 'minutes' | 'hours' | 'count'
export type TrendDatum = { bucket: string; value: number; value2?: number }
export type TrendChart = {
  key: string
  title: string
  unit: ChartUnit
  hasInfo?: boolean
  stacked?: boolean
  data: Record<Granularity, TrendDatum[]>
}

const WEEKLY = ['Nov 13', 'Nov 20', 'Nov 27', 'Dec 4']
const MONTHLY = ['Sep', 'Oct', 'Nov', 'Dec']
const QUARTERLY = ['Q1', 'Q2', 'Q3', 'Q4']

// Build a chart's three-granularity dataset from three value arrays (+ optional
// second series for the stacked chart). Keeps the mock data terse but typed.
function series(
  weekly: number[],
  monthly: number[],
  quarterly: number[],
  weekly2?: number[],
  monthly2?: number[],
  quarterly2?: number[],
): Record<Granularity, TrendDatum[]> {
  const zip = (buckets: string[], v: number[], v2?: number[]): TrendDatum[] =>
    buckets.map((bucket, i) => ({ bucket, value: v[i], ...(v2 ? { value2: v2[i] } : {}) }))
  return {
    weekly: zip(WEEKLY, weekly, weekly2),
    monthly: zip(MONTHLY, monthly, monthly2),
    quarterly: zip(QUARTERLY, quarterly, quarterly2),
  }
}

export const TREND_CHARTS: TrendChart[] = [
  {
    key: 'total-conversations',
    title: 'Total conversations',
    unit: 'count',
    stacked: true,
    data: series(
      [520000, 610000, 430000, 500000],
      [480000, 560000, 590000, 550000],
      [1.4e6, 1.6e6, 1.5e6, 1.55e6],
      [90000, 120000, 70000, 95000],
      [80000, 100000, 110000, 95000],
      [260000, 300000, 280000, 290000],
    ),
  },
  {
    key: 'resolution-rate',
    title: 'Resolution rate',
    unit: 'percent',
    data: series([95, 100, 72, 78], [80, 90, 95, 90], [82, 88, 90, 91]),
  },
  {
    key: 'total-resolution-cost',
    title: 'Total resolution cost',
    unit: 'currency',
    data: series([620000, 1e6, 500000, 560000], [700000, 820000, 900000, 860000], [2.1e6, 2.4e6, 2.3e6, 2.35e6]),
  },
  {
    key: 'first-contact-resolution-rate',
    title: 'First contact resolution rate',
    unit: 'percent',
    hasInfo: true,
    data: series([70, 78, 52, 60], [58, 66, 72, 68], [60, 65, 70, 71]),
  },
  {
    key: 'avg-first-resolution-time',
    title: 'Avg. first resolution time',
    unit: 'minutes',
    hasInfo: true,
    data: series([30, 45, 22, 33], [28, 34, 40, 36], [30, 33, 38, 35]),
  },
  {
    key: 'avg-reply-time',
    title: 'Avg. reply time',
    unit: 'minutes',
    hasInfo: true,
    data: series([9, 15, 5, 8], [8, 11, 13, 12], [9, 10, 12, 11]),
  },
  {
    key: 'avg-full-resolutions-time',
    title: 'Avg. full resolutions time',
    unit: 'hours',
    hasInfo: true,
    data: series([9, 15, 5, 8], [8, 11, 13, 12], [9, 10, 12, 11]),
  },
  {
    key: 'sentiment',
    title: 'Sentiment',
    unit: 'percent',
    hasInfo: true,
    data: series([95, 100, 72, 78], [80, 90, 95, 90], [82, 88, 90, 91]),
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- cx-journey-data`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/insights/cx-journey/cx-journey-data.ts src/features/insights/cx-journey/cx-journey-data.test.ts
git commit -m "feat: CX Journey mock data module"
```

---

### Task 2: Shared filter row

**Files:**
- Create: `src/features/insights/cx-journey/FilterRow.tsx`

**Interfaces:**
- Consumes: nothing (presentational).
- Produces: `function FilterRow(props: { title: string; audience?: string; children?: React.ReactNode }): JSX.Element` — renders the section title on the left and the date pill + audience dropdown + channel-breakdown toggle on the right. `children` renders after the toggle (used by TrendsSection for the granularity toggle). `audience` defaults to `'All (AI + Human)'`.

- [ ] **Step 1: Write the component**

```tsx
// src/features/insights/cx-journey/FilterRow.tsx
// Presentational filter controls shared by the flow and trends sections. The
// date range, audience dropdown, and channel-breakdown toggle are static (no
// backend); only the granularity toggle passed via `children` is interactive.
import { Calendar, ChevronDown } from 'lucide-react'

type FilterRowProps = {
  title: string
  audience?: string
  children?: React.ReactNode
}

function Pill({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-[13px] text-ink"
    >
      {icon}
      <span>{label}</span>
      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
    </button>
  )
}

export function FilterRow({ title, audience = 'All (AI + Human)', children }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Pill icon={<Calendar className="h-3.5 w-3.5 text-ink-muted" />} label="Nov 7, 2025 – Dec 6, 2025" />
        <Pill label={audience} />
        <label className="flex items-center gap-1.5 text-[13px] text-ink-muted">
          <span className="inline-block h-3.5 w-3.5 rounded-full border border-surface-border" />
          Channel breakdown
        </label>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/cx-journey/FilterRow.tsx
git commit -m "feat: CX Journey shared filter row"
```

---

### Task 3: Conversation flow section (Sankey)

**Files:**
- Create: `src/features/insights/cx-journey/ConversationFlowSection.tsx`

**Interfaces:**
- Consumes: `FLOW_HEADER`, `FLOW_SANKEY`, color constants from `cx-journey-data`; `FilterRow`.
- Produces: `function ConversationFlowSection(): JSX.Element`.

**Notes on recharts Sankey:** `Sankey` needs an explicit `width`/`height` (no `ResponsiveContainer` needed if we measure the container ourselves, matching the `Sparkline` pattern). Pass `data={{ nodes, links }}` where nodes are `{ name }` and links are `{ source, target, value }`. Use a custom `link` renderer to color ribbons and a custom `node` renderer to draw the labels (`name`, `value`, `pct`). Guard against zero-size render.

- [ ] **Step 1: Write the component**

```tsx
// src/features/insights/cx-journey/ConversationFlowSection.tsx
import { useEffect, useRef, useState } from 'react'
import { Layer, Rectangle, Sankey } from 'recharts'
import { FLOW_HEADER, FLOW_SANKEY } from './cx-journey-data'
import { FilterRow } from './FilterRow'

// recharts Sankey requires explicit pixel dimensions; measure the container and
// only render once we have a real size (avoids zero-size warnings in tests).
function useMeasured() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, size }
}

// Colored ribbon between two nodes.
function FlowLink(props: any) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index } = props
  const color = FLOW_SANKEY.links[index]?.color ?? '#9aa0a6'
  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={color}
      strokeWidth={linkWidth}
      strokeOpacity={0.35}
    />
  )
}

// Node bar + label (name / value / pct) drawn to the right or left of the bar.
function FlowNode(props: any) {
  const { x, y, width, height, index, containerWidth } = props
  const node = FLOW_SANKEY.nodes[index]
  const isRightHalf = x + width / 2 > containerWidth / 2
  const labelX = isRightHalf ? x - 6 : x + width + 6
  const anchor = isRightHalf ? 'end' : 'start'
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={height} fill="#293239" fillOpacity={0.85} />
      <text x={labelX} y={y + height / 2 - 6} textAnchor={anchor} fontSize={11} fill="#8b8e89">
        {node?.name}
        {node?.pct ? ` ${node.pct}` : ''}
      </text>
      <text x={labelX} y={y + height / 2 + 9} textAnchor={anchor} fontSize={13} fontWeight={600} fill="#2f3130">
        {node?.value}
      </text>
    </Layer>
  )
}

export function ConversationFlowSection() {
  const { ref, size } = useMeasured()
  return (
    <section className="flex flex-col gap-4">
      <FilterRow title="Total conversations (AI + Human)" />
      <div className="rounded-2xl bg-app-backdrop p-6">
        <div className="mb-6 flex flex-wrap gap-x-20 gap-y-4">
          {FLOW_HEADER.map((stat) => (
            <div key={stat.label}>
              <p className="text-[13px] text-ink-muted">{stat.label}</p>
              <p className="text-[28px] font-semibold text-ink">
                {stat.value}
                {stat.pct ? <span className="ml-1 text-ink-muted">({stat.pct})</span> : null}
              </p>
            </div>
          ))}
        </div>
        <div ref={ref} className="h-[220px] w-full">
          {size.width > 0 && size.height > 0 && (
            <Sankey
              width={size.width}
              height={size.height}
              data={{
                nodes: FLOW_SANKEY.nodes.map((n) => ({ name: n.name })),
                links: FLOW_SANKEY.links.map((l) => ({ source: l.source, target: l.target, value: l.value })),
              }}
              node={<FlowNode />}
              link={<FlowLink />}
              nodePadding={28}
              margin={{ top: 10, bottom: 10, left: 90, right: 90 }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/cx-journey/ConversationFlowSection.tsx
git commit -m "feat: CX Journey conversation flow section with Sankey"
```

---

### Task 4: Agents breakdown table

**Files:**
- Create: `src/features/insights/cx-journey/AgentsBreakdownTable.tsx`

**Interfaces:**
- Consumes: `AGENT_ROWS`, `AgentCell` from `cx-journey-data`.
- Produces: `function AgentsBreakdownTable(): JSX.Element`.

- [ ] **Step 1: Write the component**

```tsx
// src/features/insights/cx-journey/AgentsBreakdownTable.tsx
import { AGENT_ROWS, type AgentCell } from './cx-journey-data'

const COLS = ['Conversations', 'Handled', 'Resolved', 'Agent efficiency & CSAT']

function MetricCell({ cell }: { cell: AgentCell }) {
  return (
    <td className="px-4 py-6 align-top">
      <div className="flex items-baseline gap-3">
        <span className="text-[24px] font-semibold text-ink">{cell.primary}</span>
        {cell.csat ? <span className="text-[20px] font-semibold text-[#0f8a5f]">{cell.csat}</span> : null}
      </div>
      <div className="mt-2 space-y-0.5">
        {cell.subs.map((sub, i) => (
          <p key={i} className="text-[12px] text-ink-muted">
            <span className="font-semibold text-ink">{sub.emphasis}</span> {sub.label}
          </p>
        ))}
      </div>
    </td>
  )
}

export function AgentsBreakdownTable() {
  return (
    <section className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-surface-border">
            <th className="px-4 py-3 text-left text-[12px] font-medium text-ink-muted">Agents</th>
            {COLS.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-[12px] font-medium text-ink-muted">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AGENT_ROWS.map((row) => (
            <tr key={row.agent} className="border-b border-surface-border">
              <td className="px-4 py-6 align-top text-[18px] font-semibold text-ink">{row.agent}</td>
              <MetricCell cell={row.conversations} />
              <MetricCell cell={row.handled} />
              <MetricCell cell={row.resolved} />
              <MetricCell cell={row.efficiency} />
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/cx-journey/AgentsBreakdownTable.tsx
git commit -m "feat: CX Journey agents breakdown table"
```

---

### Task 5: Trend chart card

**Files:**
- Create: `src/features/insights/cx-journey/TrendChartCard.tsx`

**Interfaces:**
- Consumes: `TrendChart`, `Granularity`, `BLUE`, `RED` from `cx-journey-data`.
- Produces: `function TrendChartCard(props: { chart: TrendChart; granularity: Granularity }): JSX.Element`.

**Notes:** Use `ResponsiveContainer` from recharts for the bar chart (it works with the `ResizeObserver` stub in tests; the container renders at 0×0 in jsdom, which recharts tolerates for `ResponsiveContainer`). Format the Y axis by `unit` via a `tickFormatter`.

- [ ] **Step 1: Write the component**

```tsx
// src/features/insights/cx-journey/TrendChartCard.tsx
import { Info } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { BLUE, RED, type ChartUnit, type Granularity, type TrendChart } from './cx-journey-data'

function formatTick(unit: ChartUnit, v: number): string {
  switch (unit) {
    case 'percent':
      return `${v}%`
    case 'currency':
      return v >= 1e6 ? `$${v / 1e6}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${v}`
    case 'minutes':
      return `${v}min`
    case 'hours':
      return `${v}hr`
    case 'count':
      return v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : `${v}`
  }
}

export function TrendChartCard({ chart, granularity }: { chart: TrendChart; granularity: Granularity }) {
  const data = chart.data[granularity]
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <p className="text-[13px] font-semibold text-ink">{chart.title}</p>
        {chart.hasInfo ? <Info className="h-3.5 w-3.5 text-ink-muted" /> : null}
      </div>
      {chart.stacked ? (
        <div className="mb-2 flex items-center gap-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: BLUE }} /> Eligible
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: RED }} /> Not eligible
          </span>
        </div>
      ) : null}
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barSize={18}>
            <CartesianGrid vertical={false} stroke="#ececef" />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8b8e89' }} />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8b8e89' }}
              tickFormatter={(v) => formatTick(chart.unit, v as number)}
            />
            <Bar dataKey="value" stackId="a" fill={BLUE} radius={chart.stacked ? [0, 0, 0, 0] : [3, 3, 0, 0]} />
            {chart.stacked ? <Bar dataKey="value2" stackId="a" fill={RED} radius={[3, 3, 0, 0]} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/cx-journey/TrendChartCard.tsx
git commit -m "feat: CX Journey trend chart card"
```

---

### Task 6: Trends section (grid + granularity toggle)

**Files:**
- Create: `src/features/insights/cx-journey/TrendsSection.tsx`

**Interfaces:**
- Consumes: `TREND_CHARTS`, `Granularity` from `cx-journey-data`; `FilterRow`; `TrendChartCard`.
- Produces: `function TrendsSection(props: { granularity: Granularity; onGranularityChange: (g: Granularity) => void }): JSX.Element`.

- [ ] **Step 1: Write the component**

```tsx
// src/features/insights/cx-journey/TrendsSection.tsx
import { type Granularity, TREND_CHARTS } from './cx-journey-data'
import { FilterRow } from './FilterRow'
import { TrendChartCard } from './TrendChartCard'

const OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

function GranularityToggle({
  value,
  onChange,
}: {
  value: Granularity
  onChange: (g: Granularity) => void
}) {
  return (
    <div className="flex rounded-lg border border-surface-border bg-white p-0.5" role="tablist">
      {OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? 'rounded-md bg-app-backdrop px-3 py-1 text-[13px] font-medium text-ink'
                : 'rounded-md px-3 py-1 text-[13px] text-ink-muted'
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function TrendsSection({
  granularity,
  onGranularityChange,
}: {
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <FilterRow title="Trends (AI + Human)">
        <GranularityToggle value={granularity} onChange={onGranularityChange} />
      </FilterRow>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TREND_CHARTS.map((chart) => (
          <TrendChartCard key={chart.key} chart={chart} granularity={granularity} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/cx-journey/TrendsSection.tsx
git commit -m "feat: CX Journey trends section with granularity toggle"
```

---

### Task 7: Page shell + route rewire + test + delete old stub

**Files:**
- Create: `src/features/insights/cx-journey/CxJourneyView.tsx`
- Create: `src/features/insights/cx-journey/CxJourneyView.test.tsx`
- Delete: `src/features/insights/CxJourneyView.tsx`
- Modify: `src/routes.tsx` (repoint the `CxJourneyView` import)

**Interfaces:**
- Consumes: `Granularity` from `cx-journey-data`; `ConversationFlowSection`, `AgentsBreakdownTable`, `TrendsSection`.
- Produces: `function CxJourneyView(): JSX.Element` (default-less named export, matching the old stub's named export so the route import only changes its path).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/insights/cx-journey/CxJourneyView.test.tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CxJourneyView } from './CxJourneyView'

describe('CxJourneyView', () => {
  it('renders the three section headings', () => {
    render(<CxJourneyView />)
    const view = within(screen.getByTestId('view-cx-journey'))
    expect(view.getByText('Total conversations (AI + Human)')).toBeInTheDocument()
    expect(view.getByText('Agent efficiency & CSAT')).toBeInTheDocument()
    expect(view.getByText('Trends (AI + Human)')).toBeInTheDocument()
  })

  it('renders the three agent row labels', () => {
    render(<CxJourneyView />)
    const view = within(screen.getByTestId('view-cx-journey'))
    expect(view.getByText('AI + Human')).toBeInTheDocument()
    expect(view.getByRole('cell', { name: 'AI' })).toBeInTheDocument()
    expect(view.getByRole('cell', { name: 'Human' })).toBeInTheDocument()
  })

  it('lets the user switch the trends granularity', async () => {
    const user = userEvent.setup()
    render(<CxJourneyView />)
    const view = within(screen.getByTestId('view-cx-journey'))
    const weekly = view.getByRole('tab', { name: 'Weekly' })
    const monthly = view.getByRole('tab', { name: 'Monthly' })
    expect(weekly).toHaveAttribute('aria-selected', 'true')
    await user.click(monthly)
    expect(monthly).toHaveAttribute('aria-selected', 'true')
    expect(weekly).toHaveAttribute('aria-selected', 'false')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- CxJourneyView`
Expected: FAIL — cannot resolve `./CxJourneyView`.

- [ ] **Step 3: Write the page shell**

```tsx
// src/features/insights/cx-journey/CxJourneyView.tsx
// CX Journey → Overview: one long scrollable mock page. The Overview/Topics/
// Automations strip is decorative (no routing); only the trends granularity
// toggle is interactive.
import { useState } from 'react'
import { AgentsBreakdownTable } from './AgentsBreakdownTable'
import { ConversationFlowSection } from './ConversationFlowSection'
import { type Granularity } from './cx-journey-data'
import { TrendsSection } from './TrendsSection'

const TABS = ['Overview', 'Topics', 'Automations']

export function CxJourneyView() {
  const [granularity, setGranularity] = useState<Granularity>('weekly')
  return (
    <div data-testid="view-cx-journey" className="h-full overflow-y-auto px-8 py-6">
      <div className="mb-6 flex items-center gap-6 border-b border-surface-border">
        <h1 className="pb-3 text-[20px] font-semibold text-ink">CX Journey</h1>
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className={
              i === 0
                ? '-mb-px border-b-2 border-ink pb-3 text-[14px] font-medium text-ink'
                : 'pb-3 text-[14px] text-ink-muted'
            }
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-12">
        <ConversationFlowSection />
        <AgentsBreakdownTable />
        <TrendsSection granularity={granularity} onGranularityChange={setGranularity} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Repoint the route import**

In `src/routes.tsx`, change the CxJourneyView import path from the old stub to the new folder. Find:

```tsx
import { CxJourneyView } from '@/features/insights/CxJourneyView'
```

Replace with:

```tsx
import { CxJourneyView } from '@/features/insights/cx-journey/CxJourneyView'
```

(If the existing import uses a relative path or different form, preserve that form and only change the module path to `.../insights/cx-journey/CxJourneyView`.)

- [ ] **Step 5: Delete the old stub**

```bash
git rm src/features/insights/CxJourneyView.tsx
```

- [ ] **Step 6: Run the full test + typecheck + build gates**

Run: `pnpm test -- CxJourneyView`
Expected: PASS (3 tests).

Run: `pnpm test`
Expected: PASS (all suites, including the existing `InsightsScreen.test.tsx`).

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm build`
Expected: succeeds (`tsc -b && vite build`).

- [ ] **Step 7: Commit**

```bash
git add src/features/insights/cx-journey/CxJourneyView.tsx src/features/insights/cx-journey/CxJourneyView.test.tsx src/routes.tsx
git commit -m "feat: CX Journey Overview page shell + route rewire"
```

---

## Self-Review

**Spec coverage:**
- Page header + decorative tab strip → Task 7. ✓
- Section 1 (filter row, stat card, Sankey) → Tasks 2, 3. ✓
- Section 2 (agents table with all sub-stats) → Tasks 1, 4. ✓
- Section 3 (filter row, functional granularity toggle, 8 bar charts) → Tasks 1, 5, 6. ✓
- Mock data model → Task 1. ✓
- Presentational filters / functional toggle only → Tasks 2 (static), 6 (toggle). ✓
- Test plan (headings, row labels, toggle) → Task 7. ✓
- `data-testid="view-cx-journey"` preserved → Task 7. ✓
- Route rewire + old stub deletion → Task 7. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. ✓

**Type consistency:** `Granularity`, `AgentCell`, `TrendChart`, `ChartUnit`, `FlowNode`/`FlowLink`, color constants defined in Task 1 and consumed with the same names in Tasks 3–7. `CxJourneyView` is a named export in both the old stub and Task 7, so the route change is import-path only. ✓

**Note on `getByRole('cell', { name: 'AI' })`:** the agent column renders the label as the row's first `<td>`; `'AI'` and `'Human'` are exact cell-name matches, avoiding collision with `'AI + Human'` (different exact name) and the many `AI`-containing sub-stat strings (which live in other cells). If exact-name matching proves flaky, fall back to scoping by row via `getAllByRole('row')`.
