# CX Journey — Overview page

**Date:** 2026-07-21
**Status:** Approved (pending user review of this spec)
**Figma:** `LMPNsX1T3nwkueIRUCDktm`, frames `672:60671` / `672:61155` / `672:61993` (CX Journey_01/02/03)

## Goal

Replace the `CxJourneyView.tsx` stub (`/insights/cx-journey`) with the full mock
**CX Journey → Overview** screen from Figma: one long scrollable page, frontend-only,
all data mocked. Consistent with the Home dashboard's mock-UI approach.

## Non-goals

- No backend / no real analytics. All numbers are mock.
- The "Overview / Topics / Automations" strip is **decorative header chrome**, not
  routing. Overview reads active; Topics and Automations render greyed/disabled and
  do nothing. No new routes are added.
- Date-range pill, audience dropdown (`All (AI + Human)`), and `Channel breakdown`
  toggle are **presentational** — they render correctly but do not filter data.
- Topics and Automations screens are out of scope entirely.

## Page structure (top → bottom)

The page is a vertically scrolling column inside the existing Insights surface
(`InsightsScreen` renders `<Outlet/>` in a white rounded panel). Root element gets
`data-testid="view-cx-journey"` (preserving the current test id).

1. **Page header**
   - Title `CX Journey`.
   - Decorative tab strip: `Overview` (active, underlined, ink) · `Topics` (muted) ·
     `Automations` (muted). Non-interactive.

2. **Section: Total conversations (AI + Human)** — `ConversationFlowSection.tsx`
   - **Filter row:** section label `Total conversations (AI + Human)`, a date-range
     pill (`Nov 7, 2025 – Dec 6, 2025`, calendar icon, chevron), an audience dropdown
     (`All (AI + Human)`, chevron), and a `Channel breakdown` toggle (radio/switch dot
     + label). All presentational.
   - **Stat header card:** light-grey rounded card with three inline stats:
     - Total conversation — `550,000`
     - Handled — `530,000 (83%)`
     - Resolved — `453,000 (90%)`
   - **Sankey flow diagram** (recharts `Sankey`) inside the same card, with these
     nodes/labels (values as shown in Figma):
     - `Total conversations 100% — 550,000`
     - `AI handled 55% — 234,800`, `Human handled 35% — 221,720`, `Not handled 10% — 55,000`
     - `AI resolved 40% — 205,000`, `Human resolved 50% — 218,000`, `Not resolved 10% — 13,475`
     - `Total cost — $2.3M`
   - Link ribbon colors follow the design (blue → teal/amber/grey → teal/amber/red → teal).

3. **Section: Agents breakdown table** — `AgentsBreakdownTable.tsx`
   - Column headers: `Agents · Conversations · Handled · Resolved · Agent efficiency & CSAT`.
   - Three rows. Each metric cell = a large primary number plus stacked sub-stat lines
     (`<b>NN%</b> label`). CSAT is a green accent number under the cost.
   - **AI + Human**
     - Conversations `550,000` · `85% total eligible (450,000)` · `15% total not eligible (150,000)`
     - Handled `530,000` · `83% of eligible` · `60% Handled by AI` · `40% Handled by human`
     - Resolved `453,000` · `90% of handled` · `40% Resolved by AI` · `50% Resolved by human` · `10% Not resolved`
     - Efficiency `$2.3M` · CSAT `4.5` · `$200K AI total cost` · `$810k Human total cost` · `87% Positive Avg. sentiment`
   - **AI**
     - Conversations `300,000` · `58% total conversations` · `87% eligible` · `13% not eligible`
     - Handled `234,800` · `87% of ai eligible` · `80% deflected` · `20% handoff to human`
     - Resolved `205,000` · `80% of ai handled` · `60% First interaction resolution` · `1 sec. Avg. time to first response` · `3 Avg. interactions`
     - Efficiency `$205K` · CSAT `4.3` · `40% of total conversations` · `92% Positive Avg. sentiment` · `2 min. Avg. full resolution time` · `$1 cost per resolution`
   - **Human**
     - Conversations `250,000` · `42% total conversations` · `90% eligible` · `10% not eligible`
     - Handled `221,720` · `90% of human eligible` · `90% resolved` · `10% from AI handoff` · `15% not resolved`
     - Resolved `218,000` · `94% of human handled` · `80% First contact resolution` · `30 min. Avg. time to first response` · `3 Avg. replies`
     - Efficiency `$2.1M` · CSAT `4.7` · `50% of total conversation` · `84% Positive Avg. sentiment` · `2.5 hrs Avg. full resolution time` · `$8.5 cost per resolution`

4. **Section: Trends (AI + Human)** — `TrendsSection.tsx`
   - **Filter row:** section label `Trends (AI + Human)`, same date pill / audience
     dropdown / channel-breakdown toggle (presentational), and a **functional**
     `Weekly · Monthly · Quarterly` segmented toggle (right-aligned).
   - **4 × 2 grid of 8 bar-chart cards** (`TrendChartCard.tsx`), each a titled card with
     a recharts `BarChart` and a Y axis:
     1. **Total conversations** — stacked bars, Eligible (blue) + Not eligible (red), legend.
     2. **Resolution rate** — % axis (0–100%).
     3. **Total resolution cost** — $ axis ($0–$1M).
     4. **First contact resolution rate** — % axis, info tooltip icon in title.
     5. **Avg. first resolution time** — minutes axis (0–45 min), info icon.
     6. **Avg. reply time** — minutes axis (1–15 min), info icon.
     7. **Avg. full resolutions time** — hours axis (0–15 hr), info icon.
     8. **Sentiment** — % axis (0–100%), info icon.
   - Bars use the teal/blue chart color from the design. X axis is time buckets
     (`Nov 13, Nov 20, Nov 27, Dec 4` for weekly).

## Data model — `cx-journey/cx-journey-data.ts`

All mock, illustrative but matching the visible Figma numbers where legible.
Per-bar values that are not legible in the screenshots are invented to be visually
consistent with the design's bar heights.

```ts
export type Granularity = 'weekly' | 'monthly' | 'quarterly'

// --- Section 1 ---
export type FlowStat = { label: string; value: string; pct?: string }
export const FLOW_HEADER: FlowStat[]          // the 3 header stats

// recharts Sankey shape
export type SankeyNode = { name: string }     // display label composed in the component
export const FLOW_SANKEY: {
  nodes: { name: string; value: string; pct?: string }[]
  links: { source: number; target: number; value: number; color: string }[]
}

// --- Section 2 ---
export type SubStat = { emphasis: string; label: string }   // e.g. { emphasis: '85%', label: 'total eligible (450,000)' }
export type AgentCell = { primary: string; csat?: string; subs: SubStat[] }
export type AgentRow = {
  agent: string
  conversations: AgentCell
  handled: AgentCell
  resolved: AgentCell
  efficiency: AgentCell        // primary = cost, csat = score
}
export const AGENT_ROWS: AgentRow[]           // AI + Human, AI, Human

// --- Section 3 ---
export type TrendChart = {
  key: string
  title: string
  unit: 'percent' | 'currency' | 'minutes' | 'hours' | 'count'
  hasInfo?: boolean
  stacked?: boolean            // Total conversations only
  // data per granularity; each datum has a bucket label + value(s)
  data: Record<Granularity, { bucket: string; value: number; value2?: number }[]>
}
export const TREND_CHARTS: TrendChart[]       // the 8 charts
```

Weekly/Monthly/Quarterly datasets differ in bucket labels and bar counts
(weekly: `Nov 13…Dec 4`; monthly: `Sep…Dec`; quarterly: `Q1…Q4`). Toggling
`granularity` re-reads `chart.data[granularity]` for every chart.

## Components — `src/features/insights/cx-journey/`

- `CxJourneyView.tsx` — page shell + header strip; owns `granularity` state
  (`useState<Granularity>('weekly')`) passed down to `TrendsSection`. Renders the three
  section components in a scrolling column. Keeps `data-testid="view-cx-journey"`.
- `ConversationFlowSection.tsx` — filter row + stat card + `<Sankey>`. Self-contained;
  reads `FLOW_HEADER` / `FLOW_SANKEY`.
- `AgentsBreakdownTable.tsx` — reads `AGENT_ROWS`. A `AgentMetricCell` sub-component
  renders `primary` + optional green `csat` + `subs`.
- `TrendsSection.tsx` — filter row + `Weekly/Monthly/Quarterly` toggle (controlled by
  props from parent) + the 4×2 grid; maps `TREND_CHARTS` → `TrendChartCard`.
- `TrendChartCard.tsx` — one card: title (+ optional info icon), recharts `BarChart`
  (stacked when `chart.stacked`), Y axis formatted by `unit`.
- Small filter-row pieces (date pill, audience dropdown, channel-breakdown toggle) live
  as tiny local presentational components — either shared in a `FilterRow.tsx` used by
  both sections, or inline. Prefer a shared `FilterRow.tsx` since sections 1 and 3 use
  the same three controls.

## Styling

- Semantic tokens: `text-ink`, `text-ink-muted`, `border-surface-border`,
  `bg-app-backdrop` for the grey stat card. White section backgrounds inherit from the
  Insights panel.
- Chart series colors are inline hex matching Figma (blue `#1f73b7`-family for primary
  bars/links, teal for resolved/cost, amber for human, red `#d4183d`-family for
  not-resolved / not-eligible). CSAT green is an inline positive accent.
- No `font-['SF_Pro_*']` classes. Follow existing spacing/rounding conventions
  (`rounded-[..]`, `p-6`) seen in the other feature screens.
- Recharts `ResponsiveContainer` for all charts so they fill their cards fluidly
  (page targets ≥1024px desktop, consistent with the app's desktop-fluid model).

## Testing

`cx-journey/CxJourneyView.test.tsx` (Vitest + RTL, jsdom), scoped with
`within(screen.getByTestId('view-cx-journey'))`:
- Renders the three section headings (`Total conversations (AI + Human)`, the agents
  table header `Agent efficiency & CSAT`, `Trends (AI + Human)`).
- Renders the three agent row labels (`AI + Human`, `AI`, `Human`).
- Clicking `Monthly` in the trends toggle updates the active state (assert the toggle
  reflects the new selection). Recharts SVG internals are not asserted (jsdom has no
  layout); charts render inside a container with a test id if needed.

Note: recharts `ResponsiveContainer` measures 0×0 in jsdom. If chart rendering throws
or warns in tests, wrap chart bodies so they no-op at zero width, or assert only on the
card titles/toggle — not SVG geometry. This mirrors how the Home dashboard avoids
asserting chart internals.

## Risks / open items

- **Recharts Sankey** styling is limited (node/link colors, label placement). We match
  the design as closely as the component allows; exact ribbon curvature may differ. This
  is acceptable for a mock (confirmed: recharts Sankey chosen over hand-built SVG).
- Some sub-stat numbers in the Figma screenshots are partially legible; those are
  transcribed above as read and may be refined during implementation.
