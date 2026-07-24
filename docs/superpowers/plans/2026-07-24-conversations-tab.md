# AI Performance — Conversations tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill in the AI Performance → **Conversations** page tab with an interactive, channel-scoped mock (card grid + conversation table), matching Figma `215-8805`.

**Architecture:** A new self-contained sub-feature folder `src/features/insights/ai-performances/conversations/` (mirroring the `cx-journey/topics/` pattern): typed mock data → three presentational card archetypes → a table component → a `ConversationsView` container owning local state. `AiPerformancesView` renders it for the `Conversations` tab; `Knowledge`/`Intents` keep "Coming soon".

**Tech Stack:** React 19 + TypeScript (strict), Tailwind v4, recharts (donuts, same measured-container pattern as `CustomInsights`), lucide-react icons. Vitest + React Testing Library.

## Global Constraints

- **No backend.** All data mocked in `conversations-data.ts`. State is local `useState`.
- **Reuse the chart palette** `C1`–`C8`, `INK`, `GREY` from `../ai-performances-data` — do not redefine hexes that already exist there.
- **Semantic tokens** (`text-ink`, `text-ink-muted`, `border-surface-border`, `bg-white`, `bg-nav-active`) over raw hex; one-off Figma hexes inline are tolerated where they match the design, consistent with neighboring AI Performances files. No arbitrary `font-['…']` classes.
- **Deterministic only** — no `Date.now()`/`Math.random()`. Mock rows carry literal timestamp strings.
- **Initial channel is `headless`** (the reference frame shows Headless selected).
- **Path alias** `@` → `src/`. TypeScript strict; keep new code fully typed.
- **Run tests** with `npx vitest run --exclude '**/.claude/**'` (sibling-worktree crawl guard). `pnpm`/`npx` both fine; `pnpm lint` is known-broken on TS7 — do not run it.
- Card archetypes are chosen by a discriminated union `kind` field; the grid must not branch on channel identity.

---

### Task 1: Mock data & types (`conversations-data.ts`)

**Files:**
- Create: `src/features/insights/ai-performances/conversations/conversations-data.ts`
- Test: `src/features/insights/ai-performances/conversations/conversations-data.test.ts`

**Interfaces:**
- Consumes: `C1`–`C8`, `INK`, `GREY` from `src/features/insights/ai-performances/ai-performances-data.ts`.
- Produces:
  - `type ChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'`
  - `CONV_CHANNEL_TABS: { id: ChannelKey; label: string }[]`
  - `type BarSegment = { label: string; count: string; pct: string; color: string }`
  - `type StackedBarCard = { kind: 'stacked'; title: string; value: string; segments: BarSegment[] }`
  - `type DonutSlice = { name: string; count: string; value: number; color: string }`
  - `type DonutCardData = { kind: 'donut'; title: string; center: string; centerLabel: string; slices: DonutSlice[] }`
  - `type RankRow = { label: string; value: number; count: string }`
  - `type RankedBarCard = { kind: 'ranked'; title: string; total: string; color: string; rows: RankRow[] }`
  - `type ConvCard = StackedBarCard | DonutCardData | RankedBarCard`
  - `type ConvColumnId = 'timestamp' | 'automated' | 'source' | 'client' | 'agents' | 'transcript'`
  - `type ConvColumn = { id: ConvColumnId; label: string }`
  - `type SourceKind = 'human' | 'a2a' | 'mcp'`
  - `type ConvRow = { id: string; timestamp: string; automated: boolean; source: SourceKind; client: string; agents: string; transcript: string[]; hasGap: boolean }`
  - `type ChannelData = { cards: ConvCard[]; columns: ConvColumn[]; rows: ConvRow[]; dateRange: string; convHeader: string }`
  - `CHANNELS: Record<ChannelKey, ChannelData>`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/insights/ai-performances/conversations/conversations-data.test.ts
import { describe, expect, it } from 'vitest'
import { CHANNELS, CONV_CHANNEL_TABS, type ChannelKey } from './conversations-data'

const KEYS: ChannelKey[] = ['widget', 'voice', 'webcall', 'headless']

describe('conversations-data', () => {
  it('exposes a tab per channel key', () => {
    expect(CONV_CHANNEL_TABS.map((t) => t.id)).toEqual(KEYS)
  })

  it('every channel has non-empty cards, columns and rows', () => {
    for (const k of KEYS) {
      expect(CHANNELS[k].cards.length).toBeGreaterThan(0)
      expect(CHANNELS[k].columns.length).toBeGreaterThan(0)
      expect(CHANNELS[k].rows.length).toBeGreaterThan(0)
    }
  })

  it('headless carries the three A2A cards and a Source column', () => {
    const titles = CHANNELS.headless.cards.map((c) => c.title)
    expect(titles).toContain('Conversation source')
    expect(titles).toContain('Top A2A solve agents')
    expect(titles).toContain('Top A2A calling clients')
    expect(CHANNELS.headless.columns.map((c) => c.id)).toContain('source')
    expect(CHANNELS.headless.cards.filter((c) => c.kind === 'ranked')).toHaveLength(2)
  })

  it('non-headless channels omit A2A cards and the Source/client columns', () => {
    for (const k of ['widget', 'voice', 'webcall'] as ChannelKey[]) {
      const titles = CHANNELS[k].cards.map((c) => c.title)
      expect(titles).not.toContain('Top A2A solve agents')
      expect(titles).not.toContain('Top A2A calling clients')
      const cols = CHANNELS[k].columns.map((c) => c.id)
      expect(cols).not.toContain('source')
      expect(cols).not.toContain('client')
    }
  })

  it('all channels share the six generic card titles', () => {
    const shared = ['Total conversations', 'Deflections', 'Resolutions', 'Sentiment', 'Relevance', 'Engagement']
    for (const k of KEYS) {
      const titles = CHANNELS[k].cards.map((c) => c.title)
      for (const s of shared) expect(titles).toContain(s)
    }
  })

  it('headless has at least one gap row and one non-gap row', () => {
    const rows = CHANNELS.headless.rows
    expect(rows.some((r) => r.hasGap)).toBe(true)
    expect(rows.some((r) => !r.hasGap)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/insights/ai-performances/conversations/conversations-data.test.ts --exclude '**/.claude/**'`
Expected: FAIL — cannot resolve `./conversations-data`.

- [ ] **Step 3: Write the implementation**

Create `conversations-data.ts` with the exact content below. Values mirror the Figma frame (Headless numbers are read from the design; substitute-channel numbers are illustrative variants).

```ts
// Mock data + types for the Insights → AI Performance → Conversations tab.
// Frontend-only; no backend. The tab is channel-scoped: each ChannelKey maps to
// its own card set, table columns and rows. The reference frame (Figma 215-8805)
// shows the Headless channel, whose cards/columns are A2A-specific; the other
// channels share the six generic cards and fill the A2A slots with
// channel-appropriate cards (per the design spec).
import { C1, C2, C3, C4, C5, C6, C7 } from '../ai-performances-data'

export type ChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'

export const CONV_CHANNEL_TABS: { id: ChannelKey; label: string }[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'voice', label: 'Voice' },
  { id: 'webcall', label: 'Web Call' },
  { id: 'headless', label: 'Headless' },
]

// --- Card archetypes (discriminated on `kind`) -----------------------------
export type BarSegment = { label: string; count: string; pct: string; color: string }
export type StackedBarCard = { kind: 'stacked'; title: string; value: string; segments: BarSegment[] }

export type DonutSlice = { name: string; count: string; value: number; color: string }
export type DonutCardData = {
  kind: 'donut'
  title: string
  center: string
  centerLabel: string
  slices: DonutSlice[]
}

export type RankRow = { label: string; value: number; count: string }
export type RankedBarCard = { kind: 'ranked'; title: string; total: string; color: string; rows: RankRow[] }

export type ConvCard = StackedBarCard | DonutCardData | RankedBarCard

// --- Table -----------------------------------------------------------------
export type ConvColumnId = 'timestamp' | 'automated' | 'source' | 'client' | 'agents' | 'transcript'
export type ConvColumn = { id: ConvColumnId; label: string }
export type SourceKind = 'human' | 'a2a' | 'mcp'
export type ConvRow = {
  id: string
  timestamp: string
  automated: boolean
  source: SourceKind
  client: string
  agents: string
  transcript: string[]
  hasGap: boolean
}

export type ChannelData = {
  cards: ConvCard[]
  columns: ConvColumn[]
  rows: ConvRow[]
  dateRange: string
  convHeader: string
}

// Chip tints for the Source column (brand-ish, no token — see channel colors).
export const SOURCE_META: Record<SourceKind, { label: string; fg: string; bg: string }> = {
  human: { label: 'Human', fg: '#8a5a00', bg: '#fdf1d6' },
  a2a: { label: 'A2A', fg: '#a3216f', bg: '#fbe4f1' },
  mcp: { label: 'MCP', fg: '#0f7b8f', bg: '#daf1f5' },
}

// The six cards shared by every channel. Numbers vary a little per channel via a
// factory so the four tabs don't render byte-identical grids.
function sharedCards(scale: number): ConvCard[] {
  const n = (base: number) => Math.round(base * scale)
  const total = n(45000)
  const automated = n(36000)
  const deflected = n(28800)
  return [
    {
      kind: 'stacked',
      title: 'Total conversations',
      value: total.toLocaleString(),
      segments: [
        { label: 'Automated', count: automated.toLocaleString(), pct: '80%', color: C5 },
        { label: 'Non automated', count: (total - automated).toLocaleString(), pct: '20%', color: '#b9bec7' },
      ],
    },
    {
      kind: 'stacked',
      title: 'Deflections',
      value: `${deflected.toLocaleString()} (80%)`,
      segments: [
        { label: 'deflected', count: deflected.toLocaleString(), pct: '80%', color: C1 },
        { label: 'not deflected', count: (total - deflected - n(9000)).toLocaleString(), pct: '20%', color: C2 },
      ],
    },
    {
      kind: 'donut',
      title: 'Resolutions',
      center: '80%',
      centerLabel: '',
      slices: [
        { name: 'verified', count: n(17280).toLocaleString(), value: 80, color: C7 },
        { name: 'contained', count: n(11520).toLocaleString(), value: 20, color: '#8fd3c8' },
      ],
    },
    {
      kind: 'donut',
      title: 'Sentiment',
      center: '80%',
      centerLabel: '',
      slices: [
        { name: 'positive', count: n(964).toLocaleString(), value: 80, color: C7 },
        { name: 'neutral', count: n(200).toLocaleString(), value: 8, color: '#8fd3c8' },
        { name: 'negative', count: n(737).toLocaleString(), value: 12, color: C2 },
      ],
    },
    {
      kind: 'donut',
      title: 'Relevance',
      center: '75%',
      centerLabel: 'relevant calls',
      slices: [
        { name: 'relevant', count: n(6000).toLocaleString(), value: 75, color: C3 },
        { name: 'somewhat relevant', count: n(1000).toLocaleString(), value: 13, color: '#7fb3e8' },
        { name: 'irrelevant', count: n(1000).toLocaleString(), value: 12, color: C2 },
      ],
    },
    {
      kind: 'donut',
      title: 'Engagement',
      center: '75%',
      centerLabel: '',
      slices: [
        { name: 'yes', count: n(6000).toLocaleString(), value: 75, color: C3 },
        { name: 'no', count: n(2000).toLocaleString(), value: 25, color: C2 },
      ],
    },
  ]
}

// The three A2A-specific cards (Headless only), filling grid slots 4–6.
const HEADLESS_A2A_CARDS: ConvCard[] = [
  {
    kind: 'donut',
    title: 'Conversation source',
    center: '60%',
    centerLabel: 'human',
    slices: [
      { name: 'human', count: '964', value: 60, color: C4 },
      { name: 'agent (A2A)', count: '650', value: 27, color: C6 },
      { name: 'MCP', count: '439', value: 13, color: C5 },
    ],
  },
  {
    kind: 'ranked',
    title: 'Top A2A solve agents',
    total: '5,064',
    color: C6,
    rows: [
      { label: 'Access & Identity', value: 3654, count: '3,654' },
      { label: 'Refund request', value: 554, count: '554' },
      { label: 'Booking agent', value: 424, count: '424' },
      { label: 'Developer support', value: 277, count: '277' },
      { label: 'Knowledge', value: 155, count: '155' },
    ],
  },
  {
    kind: 'ranked',
    title: 'Top A2A calling clients',
    total: '5,064',
    color: C5,
    rows: [
      { label: 'Revenue Copilot', value: 3654, count: '3,654' },
      { label: 'Acme Orchestrator', value: 554, count: '554' },
      { label: 'OpenClaw', value: 424, count: '424' },
      { label: 'Partner Triage Bot', value: 277, count: '277' },
      { label: 'Booking Bot', value: 155, count: '155' },
    ],
  },
]

// The three substitute cards for Widget / Voice / Web Call (same grid slots).
function substituteCards(topIntentLabel: string): ConvCard[] {
  return [
    {
      kind: 'donut',
      title: 'CSAT',
      center: '4.3',
      centerLabel: 'avg. rating',
      slices: [
        { name: 'promoters', count: '3,120', value: 70, color: C7 },
        { name: 'passives', count: '820', value: 18, color: '#8fd3c8' },
        { name: 'detractors', count: '540', value: 12, color: C2 },
      ],
    },
    {
      kind: 'ranked',
      title: 'Top intents',
      total: '5,064',
      color: C3,
      rows: [
        { label: topIntentLabel, value: 3654, count: '3,654' },
        { label: 'Refund request', value: 554, count: '554' },
        { label: 'Update profile', value: 424, count: '424' },
        { label: 'Track order', value: 277, count: '277' },
        { label: 'Cancel plan', value: 155, count: '155' },
      ],
    },
    {
      kind: 'stacked',
      title: 'Avg. response time',
      value: '1.3 sec',
      segments: [
        { label: 'under 2s', count: '38,400', pct: '85%', color: C1 },
        { label: 'over 2s', count: '6,600', pct: '15%', color: C4 },
      ],
    },
  ]
}

const HEADLESS_COLUMNS: ConvColumn[] = [
  { id: 'timestamp', label: 'Timestamp' },
  { id: 'automated', label: 'Automated' },
  { id: 'source', label: 'Source' },
  { id: 'client', label: 'Calling client' },
  { id: 'agents', label: 'Detected agents' },
  { id: 'transcript', label: 'Conversations (10,000)' },
]

const SIMPLE_COLUMNS: ConvColumn[] = [
  { id: 'timestamp', label: 'Timestamp' },
  { id: 'automated', label: 'Automated' },
  { id: 'agents', label: 'Detected agents' },
  { id: 'transcript', label: 'Conversations (10,000)' },
]

const HEADLESS_ROWS: ConvRow[] = [
  {
    id: 'c-1',
    timestamp: 'Jun 1, 2026, 11:59 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Fallback + 2',
    transcript: [
      'Chatbot: Hi! How can I help you today?',
      'User: Abnormal bank statement',
      'Chatbot: Detected Intent: (Reopen your account)…',
    ],
    hasGap: true,
  },
  {
    id: 'c-2',
    timestamp: 'Jun 1, 2026, 11:57 PM',
    automated: true,
    source: 'a2a',
    client: 'OpenClaw',
    agents: 'Booking',
    transcript: [
      'OpenClaw: Delegation token verified · acting for',
      'Jane R. · scope: book_travel · max $500 · exp 2h',
      'Solve Headless: flight: DL428 · SFO→JFK · Fri 9:15a…',
    ],
    hasGap: false,
  },
  {
    id: 'c-3',
    timestamp: 'Jun 1, 2026, 11:44 PM',
    automated: true,
    source: 'mcp',
    client: 'Claude Desktop',
    agents: 'Knowledge',
    transcript: [
      'Claude Desktop: tool call → solve.search(query:',
      '"SAML SSO setup steps")',
      'Solve Headless: article: Setting up SAML SSO · co…',
    ],
    hasGap: true,
  },
  {
    id: 'c-4',
    timestamp: 'Jun 1, 2026, 11:31 PM',
    automated: false,
    source: 'a2a',
    client: 'Partner Triage Bot',
    agents: 'Fallback',
    transcript: [
      'Partner Triage Bot: escalation · priority high',
      'User: My integration keeps timing out on webhooks',
      'Solve Headless: no matching policy — routed to human',
    ],
    hasGap: true,
  },
  {
    id: 'c-5',
    timestamp: 'Jun 1, 2026, 11:20 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Refund request',
    transcript: [
      'Chatbot: Hi! How can I help you today?',
      'User: I want a refund for order 88213',
      'Solve Headless: refund initiated · $42.00 · 3–5 days',
    ],
    hasGap: false,
  },
]

// Non-headless rows reuse the same transcripts minus the A2A-only fields.
const SIMPLE_ROWS: ConvRow[] = HEADLESS_ROWS.map((r, i) => ({
  ...r,
  id: `s-${i + 1}`,
  source: 'human',
  client: 'n/a',
}))

export const CHANNELS: Record<ChannelKey, ChannelData> = {
  headless: {
    cards: [...sharedCards(1).slice(0, 2), ...HEADLESS_A2A_CARDS, ...sharedCards(1).slice(2)],
    columns: HEADLESS_COLUMNS,
    rows: HEADLESS_ROWS,
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (10,000)',
  },
  widget: {
    cards: [...sharedCards(1.4).slice(0, 2), ...substituteCards('View bank statement'), ...sharedCards(1.4).slice(2)],
    columns: SIMPLE_COLUMNS,
    rows: SIMPLE_ROWS,
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (32,000)',
  },
  voice: {
    cards: [...sharedCards(0.6).slice(0, 2), ...substituteCards('Billing question'), ...sharedCards(0.6).slice(2)],
    columns: SIMPLE_COLUMNS,
    rows: SIMPLE_ROWS,
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (12,000)',
  },
  webcall: {
    cards: [...sharedCards(0.3).slice(0, 2), ...substituteCards('Technical support'), ...sharedCards(0.3).slice(2)],
    columns: SIMPLE_COLUMNS,
    rows: SIMPLE_ROWS,
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (6,000)',
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/insights/ai-performances/conversations/conversations-data.test.ts --exclude '**/.claude/**'`
Expected: PASS (6 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/insights/ai-performances/conversations/conversations-data.ts src/features/insights/ai-performances/conversations/conversations-data.test.ts
git commit -m "feat(insights): Conversations tab mock data + types"
```

---

### Task 2: Card archetypes (`ConversationCards.tsx`)

**Files:**
- Create: `src/features/insights/ai-performances/conversations/ConversationCards.tsx`

**Interfaces:**
- Consumes: `ConvCard`, `StackedBarCard`, `DonutCardData`, `RankedBarCard` and `INK`/`GREY` (via data) from Task 1; the measured-container recharts pattern from `../CustomInsights`.
- Produces: `export function ConversationCard({ card }: { card: ConvCard }): JSX.Element` — dispatches on `card.kind`.

- [ ] **Step 1: Write the implementation**

No standalone unit test — these are presentational and covered by `ConversationsView.test.tsx` in Task 4. Create the file:

```tsx
// The three card archetypes for the Conversations tab, dispatched by `kind`:
// a stacked-bar card (headline + two-segment bar + legend), a donut card
// (recharts donut + left legend + centered value), and a ranked-bar card
// (total + horizontal bars). The donut uses the same measured-container pattern
// as CustomInsights (recharts paints a zero-width sliver until it has a size).
import { useEffect, useRef, useState } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import { INK } from '../ai-performances-data'
import type { ConvCard, DonutCardData, RankedBarCard, StackedBarCard } from './conversations-data'

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

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-5">
      <h3 className="mb-4 flex items-center gap-1.5 text-[15px] font-medium text-ink">
        {title}
        <span className="text-[12px] text-ink-muted">ⓘ</span>
      </h3>
      {children}
    </div>
  )
}

function StackedBar({ card }: { card: StackedBarCard }) {
  return (
    <>
      <p className="text-[32px] font-semibold leading-none text-ink">{card.value}</p>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
        {card.segments.map((s) => (
          <span key={s.label} style={{ width: s.pct, background: s.color }} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {card.segments.map((s) => (
          <div key={s.label} className="flex items-center text-[13px]">
            <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            <span className="ml-2 text-ink-muted">{s.label}</span>
            <span className="ml-auto font-medium text-ink">{s.count}</span>
            <span className="ml-8 w-8 text-right text-ink-muted">{s.pct}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Donut({ card }: { card: DonutCardData }) {
  const { ref, size } = useMeasured()
  const outer = Math.min(size.width, size.height) / 2 - 4
  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-[120px] flex-col gap-2.5">
        {card.slices.map((s) => (
          <div key={s.name} className="text-[13px]">
            <span className="font-semibold text-ink">{s.count}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-ink-muted">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
              {s.name}
            </span>
          </div>
        ))}
      </div>
      <div ref={ref} className="relative h-[150px] flex-1">
        {size.width > 0 && size.height > 0 && (
          <PieChart width={size.width} height={size.height}>
            <Pie
              data={card.slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={outer * 0.7}
              outerRadius={outer}
              paddingAngle={1}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {card.slices.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-semibold" style={{ color: INK }}>
            {card.center}
          </span>
          {card.centerLabel ? <span className="text-[12px] text-ink-muted">{card.centerLabel}</span> : null}
        </div>
      </div>
    </div>
  )
}

function RankedBars({ card }: { card: RankedBarCard }) {
  const max = Math.max(...card.rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-ink-muted">Total responses</span>
        <span className="font-semibold text-ink">{card.total}</span>
      </div>
      {card.rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[140px_1fr_auto] items-center gap-3 text-[13px]">
          <span className="truncate text-right text-ink-muted">{r.label}</span>
          <span className="h-4 rounded-[4px]" style={{ width: `${(r.value / max) * 100}%`, background: card.color }} />
          <span className="text-ink-muted">{r.count}</span>
        </div>
      ))}
    </div>
  )
}

export function ConversationCard({ card }: { card: ConvCard }) {
  return (
    <CardShell title={card.title}>
      {card.kind === 'stacked' && <StackedBar card={card} />}
      {card.kind === 'donut' && <Donut card={card} />}
      {card.kind === 'ranked' && <RankedBars card={card} />}
    </CardShell>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/ai-performances/conversations/ConversationCards.tsx
git commit -m "feat(insights): Conversations card archetypes"
```

---

### Task 3: Conversation table (`ConversationTable.tsx`)

**Files:**
- Create: `src/features/insights/ai-performances/conversations/ConversationTable.tsx`

**Interfaces:**
- Consumes: `ConvColumn`, `ConvRow`, `SourceKind`, `SOURCE_META` from Task 1.
- Produces: `export function ConversationTable({ columns, rows, gapsOnly, onGapsOnlyChange }: { columns: ConvColumn[]; rows: ConvRow[]; gapsOnly: boolean; onGapsOnlyChange: (v: boolean) => void }): JSX.Element`

- [ ] **Step 1: Write the implementation**

The `gapsOnly` filter lives here so the toolbar checkbox and the filtered rows are colocated; the parent owns the state (lifted for testability). Create the file:

```tsx
// The conversation table for the Conversations tab: a toolbar (search, date,
// filters, "Gaps only" toggle, icon actions) over channel-dependent columns and
// rows. Only the "Gaps only" checkbox is interactive (filters to rows flagged
// hasGap); search / date / filters / icon buttons are decorative, matching the
// sibling AI Performances views.
import { Columns3, Download, Menu, Search } from 'lucide-react'
import { DatePill } from '../SectionHeader'
import { type ConvColumn, type ConvRow, SOURCE_META, type SourceKind } from './conversations-data'

function SourceChip({ source }: { source: SourceKind }) {
  const meta = SOURCE_META[source]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ color: meta.fg, background: meta.bg }}
    >
      {meta.label}
    </span>
  )
}

function AgentChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-2 py-0.5 text-[12px] text-ink">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f8a4f]" />
      {label}
    </span>
  )
}

function Cell({ col, row }: { col: ConvColumn; row: ConvRow }) {
  switch (col.id) {
    case 'timestamp':
      return <span className="text-ink-muted">{row.timestamp}</span>
    case 'automated':
      return <span className="text-ink">{row.automated ? 'Yes' : 'No'}</span>
    case 'source':
      return <SourceChip source={row.source} />
    case 'client':
      return <span className={row.client === 'n/a' ? 'text-ink-muted' : 'text-ink'}>{row.client}</span>
    case 'agents':
      return <AgentChip label={row.agents} />
    case 'transcript':
      return (
        <div className="flex flex-col text-[13px] leading-snug text-ink">
          {row.transcript.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      )
  }
}

export function ConversationTable({
  columns,
  rows,
  gapsOnly,
  onGapsOnlyChange,
}: {
  columns: ConvColumn[]
  rows: ConvRow[]
  gapsOnly: boolean
  onGapsOnlyChange: (v: boolean) => void
}) {
  const visible = gapsOnly ? rows.filter((r) => r.hasGap) : rows
  return (
    <div className="rounded-2xl border border-surface-border bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
        <div className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-[13px] text-ink-muted">
          <Search className="h-3.5 w-3.5" />
          Search by conversation ID
        </div>
        <DatePill label="May 2, 2026 – Jun 1, 2026" />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[13px] font-medium text-[#01567A]"
        >
          All filters
        </button>
        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={gapsOnly}
            onChange={(e) => onGapsOnlyChange(e.target.checked)}
            className="h-4 w-4 accent-[#01567A]"
          />
          Gaps only
        </label>
        <div className="ml-auto flex items-center gap-3 text-[#01567A]">
          <button type="button" aria-label="Download"><Download className="h-4 w-4" /></button>
          <button type="button" aria-label="List view"><Menu className="h-4 w-4" /></button>
          <button type="button" aria-label="Columns"><Columns3 className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((c) => (
              <th key={c.id} className="px-4 py-3 font-medium text-ink-muted">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id} className="border-b border-surface-border last:border-0 align-top">
              {columns.map((c) => (
                <td key={c.id} className="px-4 py-4">
                  <Cell col={c} row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/insights/ai-performances/conversations/ConversationTable.tsx
git commit -m "feat(insights): Conversations table + source/agent chips"
```

---

### Task 4: View container + wire into AiPerformancesView

**Files:**
- Create: `src/features/insights/ai-performances/conversations/ConversationsView.tsx`
- Create: `src/features/insights/ai-performances/conversations/ConversationsView.test.tsx`
- Modify: `src/features/insights/AiPerformancesView.tsx`

**Interfaces:**
- Consumes: `CHANNELS`, `CONV_CHANNEL_TABS`, `ChannelKey` (Task 1); `ConversationCard` (Task 2); `ConversationTable` (Task 3).
- Produces: `export function ConversationsView(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/insights/ai-performances/conversations/ConversationsView.test.tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ConversationsView } from './ConversationsView'

describe('ConversationsView', () => {
  it('renders the Headless card grid and the table by default', () => {
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('heading', { name: 'Total conversations' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top A2A solve agents' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top A2A calling clients' })).toBeInTheDocument()
    expect(view.getByText('Calling client')).toBeInTheDocument()
  })

  it('swaps the A2A cards when a non-Headless channel is selected', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    await user.click(view.getByRole('tab', { name: 'Widget' }))
    expect(view.queryByRole('heading', { name: 'Top A2A solve agents' })).not.toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Top intents' })).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Total conversations' })).toBeInTheDocument()
  })

  it('hides the card grid when Collapse cards is toggled', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    expect(view.getByRole('heading', { name: 'Resolutions' })).toBeInTheDocument()
    await user.click(view.getByRole('button', { name: /Collapse cards/ }))
    expect(view.queryByRole('heading', { name: 'Resolutions' })).not.toBeInTheDocument()
  })

  it('filters the table to gap rows when Gaps only is checked', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    // A non-gap transcript line is present initially…
    expect(view.getByText(/Delegation token verified/)).toBeInTheDocument()
    await user.click(view.getByRole('checkbox', { name: 'Gaps only' }))
    // …and gone once filtered to gap rows only.
    expect(view.queryByText(/Delegation token verified/)).not.toBeInTheDocument()
    // A gap row remains.
    expect(view.getByText(/Abnormal bank statement/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/insights/ai-performances/conversations/ConversationsView.test.tsx --exclude '**/.claude/**'`
Expected: FAIL — cannot resolve `./ConversationsView`.

- [ ] **Step 3: Write the view**

```tsx
// Insights → AI Performance → Conversations tab. Channel-scoped: a tab group
// switches the card set (each channel provides its own ConvCard[]) and the
// table columns/rows. "Collapse cards" hides the grid; "Gaps only" filters the
// table. All data is mocked (see ./conversations-data).
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CHANNELS, CONV_CHANNEL_TABS, type ChannelKey } from './conversations-data'
import { ConversationCard } from './ConversationCards'
import { ConversationTable } from './ConversationTable'

export function ConversationsView() {
  const [channel, setChannel] = useState<ChannelKey>('headless')
  const [cardsCollapsed, setCardsCollapsed] = useState(false)
  const [gapsOnly, setGapsOnly] = useState(false)
  const data = CHANNELS[channel]

  return (
    <div data-testid="view-conversations" className="flex flex-col gap-6">
      {/* Header: title + date range + channel tabs + collapse toggle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[20px] font-semibold text-ink">Conversations</h2>
          <span className="text-[15px] text-ink-muted">{data.dateRange}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-surface-border p-0.5">
          {CONV_CHANNEL_TABS.map((t) => {
            const active = t.id === channel
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setChannel(t.id)}
                className={
                  active
                    ? 'rounded-full bg-app-backdrop px-4 py-1.5 text-[13px] font-medium text-ink'
                    : 'rounded-full px-4 py-1.5 text-[13px] text-ink-muted'
                }
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setCardsCollapsed((v) => !v)}
          aria-expanded={!cardsCollapsed}
          className="ml-auto flex items-center gap-1 text-[13px] text-ink-muted"
        >
          Collapse cards
          {cardsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Card grid */}
      {!cardsCollapsed && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data.cards.map((card) => (
            <ConversationCard key={card.title} card={card} />
          ))}
        </div>
      )}

      {/* Table */}
      <ConversationTable
        columns={data.columns}
        rows={data.rows}
        gapsOnly={gapsOnly}
        onGapsOnlyChange={setGapsOnly}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run the view test to verify it passes**

Run: `npx vitest run src/features/insights/ai-performances/conversations/ConversationsView.test.tsx --exclude '**/.claude/**'`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire into `AiPerformancesView`**

In `src/features/insights/AiPerformancesView.tsx`, add the import at the top with the other feature imports:

```tsx
import { ConversationsView } from './ai-performances/conversations/ConversationsView'
```

Then replace the closing ternary (the `) : (` … `Coming soon` … `)}` block that currently follows the Overview `</>`). The current code reads:

```tsx
        ) : (
          <div className="flex h-64 items-center justify-center text-[14px] text-ink-muted">Coming soon</div>
        )}
```

Change it to a chained conditional so `Conversations` renders the new view and `Knowledge`/`Intents` keep the placeholder:

```tsx
        ) : tab === 'Conversations' ? (
          <ConversationsView />
        ) : (
          <div className="flex h-64 items-center justify-center text-[14px] text-ink-muted">Coming soon</div>
        )}
```

- [ ] **Step 6: Run the AiPerformancesView test to verify the wiring**

Run: `npx vitest run src/features/insights/AiPerformancesView.test.tsx --exclude '**/.claude/**'`
Expected: PASS. (The existing "switches page tabs to a Coming soon placeholder" test clicks **Knowledge**, which still shows "Coming soon" — unaffected.)

- [ ] **Step 7: Commit**

```bash
git add src/features/insights/ai-performances/conversations/ConversationsView.tsx src/features/insights/ai-performances/conversations/ConversationsView.test.tsx src/features/insights/AiPerformancesView.tsx
git commit -m "feat(insights): wire Conversations tab into AI Performance"
```

---

### Task 5: Full-suite gates

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `npx vitest run --exclude '**/.claude/**'`
Expected: all tests pass (the four new tests plus the pre-existing suite).

- [ ] **Step 3: Build**

Run: `npx vite build`
Expected: build succeeds. (A pre-existing chunk-size warning is unrelated and acceptable.)

- [ ] **Step 4: Manual sanity (optional)**

Run `npx vite dev`, open `/insights/ai-performances`, click the **Conversations** page tab, confirm: Headless cards + table render; channel tabs swap the A2A cards; "Collapse cards" hides the grid; "Gaps only" filters rows.

---

## Self-Review

**Spec coverage:**
- Channel tab group + Headless-initial → Task 1 (`CONV_CHANNEL_TABS`), Task 4 (`useState('headless')`). ✓
- Three card archetypes (stacked / donut / ranked) → Task 2. ✓
- Shared 6 cards + Headless A2A trio + substitute trio → Task 1 (`CHANNELS`). ✓
- Channel-dependent columns (Source/Calling client Headless-only) → Task 1 (`HEADLESS_COLUMNS` vs `SIMPLE_COLUMNS`). ✓
- Collapse cards toggle → Task 4. ✓
- Table toolbar + Source/Detected-agents chips + transcript preview → Task 3. ✓
- Gaps only filter → Task 3 (filter) + Task 4 (state). ✓
- Wire into AiPerformancesView, Knowledge/Intents keep Coming soon → Task 4. ✓
- Tests (view behavior + data shape) → Tasks 1 & 4. ✓

**Placeholder scan:** none — every step has complete code or an exact command.

**Type consistency:** `ConvCard` union `kind` values (`'stacked'|'donut'|'ranked'`) match across Tasks 1/2; `ConvColumnId` values match the `Cell` switch in Task 3; `ConversationTable` prop names (`columns/rows/gapsOnly/onGapsOnlyChange`) match Task 4's call site; `ConversationCard`/`ConversationsView` export names match imports. ✓
