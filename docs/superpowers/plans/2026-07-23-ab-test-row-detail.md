# A/B Test Row Click-Through Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each A/B Test table row clickable so it opens a fully-populated, per-experiment Results presentation at `/experiments/new?id=<id>`.

**Architecture:** Introduce an `ExperimentDetail` bundle type and an `EXPERIMENT_DETAILS` map (e1–e5) in `results-data.ts`; the current single dataset becomes `DEFAULT_EXPERIMENT_DETAIL`. Convert the Results cards from importing module consts to receiving data via props. `ResultsView` takes a `detail` prop. `ExperimentSetupScreen` reads the `id` query param, selects the detail, sets the top-bar title, and defaults to the Results tab when an id is present. Rows in `ExperimentTable` navigate on click.

**Tech Stack:** React 19, React Router v7 (`react-router`), TypeScript strict, Vitest + React Testing Library, recharts, Tailwind v4.

## Global Constraints

- Path alias `@` → `src/`. Do NOT add `baseUrl` to `tsconfig.json`.
- TypeScript strict mode; keep all new code fully typed.
- Import router APIs from `react-router` (not `react-router-dom`).
- No backend; all data stays in-memory mock.
- Gates are `pnpm typecheck` and `pnpm test` (lint is broken upstream — do not rely on it). If `pnpm` is unavailable use `npx tsc --noEmit` and `npx vitest run --exclude '**/.claude/**'`.
- Use semantic token classes / existing palette; do not introduce `font-['SF_Pro_*']` classes.
- Presentational only — no new behavior beyond data selection and row navigation.

---

## File Structure

- `src/features/experiments/setup/results/results-data.ts` — **modify**: add `ExperimentDetail` type, `DEFAULT_EXPERIMENT_DETAIL` (current login-fix data reorganized), and `EXPERIMENT_DETAILS` map for e1–e5. Keep shared color/enum consts and existing exported type names.
- `src/features/experiments/setup/results/ResultsView.tsx` — **modify**: accept `detail: ExperimentDetail`, pass slices to cards.
- `src/features/experiments/setup/results/WinnerCard.tsx` — **modify**: take props.
- `src/features/experiments/setup/results/RecommendationCard.tsx` — **modify**: take props.
- `src/features/experiments/setup/results/TrafficSplitCard.tsx` — **modify**: take props.
- `src/features/experiments/setup/results/AvgDeltaCard.tsx` — **modify**: take props.
- `src/features/experiments/setup/results/ResolutionsTimeSeriesCard.tsx` — **modify**: take props.
- `src/features/experiments/setup/results/MetricBarCard.tsx` — unchanged (already `card` prop).
- `src/features/experiments/setup/ExperimentSetupScreen.tsx` — **modify**: read `id` param, select detail, drive title + Results tab.
- `src/features/experiments/ExperimentTable.tsx` — **modify**: rows navigate on click.
- Tests: `ExperimentTable.test.tsx`, `ExperimentSetupScreen.test.tsx`, and a new `results-data.test.ts`.

Backward-compatibility note: the existing top-level consts (`WINNER_VARIANTS`, `WINNER_LABEL`, `RESULTS_RECOMMENDATION`, `KEY_LEARNING`, `TRAFFIC_SPLIT`, `TRAFFIC_SPLIT_TOTAL`, `AVG_DELTA`, `METRIC_CARDS`, `RESOLUTIONS_SERIES`) are consumed only by the cards being refactored. After Task 2 they will be **removed** and folded into `DEFAULT_EXPERIMENT_DETAIL`; do the card refactors (Tasks 3–4) in the same sequence so the build stays green.

---

## Task 1: Add `ExperimentDetail` type + data map (data layer)

**Files:**
- Modify: `src/features/experiments/setup/results/results-data.ts`
- Test: `src/features/experiments/setup/results/results-data.test.ts` (create)

**Interfaces:**
- Consumes: existing exported types `WinnerVariant`, `ResultsRecommendation`, `TrafficSplitSlice`, `AvgDeltaEntry`, `MetricCard`, `ResolutionsPoint`, and color consts `CONTROL_COLOR`, `VARIANT_A_COLOR`, `VARIANT_B_COLOR`.
- Produces:
  ```ts
  export type ExperimentDetail = {
    id: string
    name: string
    description: string
    winnerLabel: string
    winnerVariants: WinnerVariant[]
    recommendation: ResultsRecommendation
    keyLearning: ResultsRecommendation
    trafficSplit: TrafficSplitSlice[]
    trafficSplitTotal: number
    avgDelta: AvgDeltaEntry[]
    metricCards: MetricCard[]
    resolutionsSeries: ResolutionsPoint[]
  }
  export const DEFAULT_EXPERIMENT_DETAIL: ExperimentDetail
  export const EXPERIMENT_DETAILS: Record<string, ExperimentDetail>
  export function getExperimentDetail(id: string | null | undefined): ExperimentDetail
  ```

- [ ] **Step 1: Write the failing test**

Create `src/features/experiments/setup/results/results-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  EXPERIMENT_DETAILS,
  DEFAULT_EXPERIMENT_DETAIL,
  getExperimentDetail,
} from './results-data'
import { EXPERIMENTS } from '../../experiments-data'

describe('experiment details', () => {
  it('has a detail for every table experiment id', () => {
    for (const e of EXPERIMENTS) {
      expect(EXPERIMENT_DETAILS[e.id]).toBeDefined()
    }
  })

  it('each detail is internally consistent', () => {
    for (const d of Object.values(EXPERIMENT_DETAILS)) {
      const sum = d.trafficSplit.reduce((n, s) => n + s.value, 0)
      expect(sum).toBe(d.trafficSplitTotal)
      expect(d.metricCards.length).toBeGreaterThanOrEqual(1)
      expect(d.winnerVariants.some((v) => v.isWinner)).toBe(true)
    }
  })

  it('getExperimentDetail falls back to the default for unknown/empty id', () => {
    expect(getExperimentDetail(null)).toBe(DEFAULT_EXPERIMENT_DETAIL)
    expect(getExperimentDetail('nope')).toBe(DEFAULT_EXPERIMENT_DETAIL)
    expect(getExperimentDetail('e2')).toBe(EXPERIMENT_DETAILS.e2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/experiments/setup/results/results-data.test.ts`
Expected: FAIL — `EXPERIMENT_DETAILS`/`getExperimentDetail` not exported.

- [ ] **Step 3: Refactor existing consts into `DEFAULT_EXPERIMENT_DETAIL` and add the map**

In `results-data.ts`, keep the color consts and all `export type` declarations. Keep `RESOLUTIONS_TABS` and `BAR_COLORS`. **Remove** the standalone value exports `WINNER_VARIANTS`, `WINNER_LABEL`, `RESULTS_RECOMMENDATION`, `KEY_LEARNING`, `TRAFFIC_SPLIT`, `TRAFFIC_SPLIT_TOTAL`, `AVG_DELTA`, `METRIC_CARDS`, `RESOLUTIONS_SERIES` and fold their exact current values into `DEFAULT_EXPERIMENT_DETAIL` below. Then add the map, the four new stories, and the selector.

Append (using the current login-fix values verbatim for the default):

```ts
export const DEFAULT_EXPERIMENT_DETAIL: ExperimentDetail = {
  id: 'e1',
  name: 'Login fix method comparison',
  description:
    'Explore which login troubleshooting experience leads to the highest user satisfaction.',
  winnerLabel: 'Variant B',
  winnerVariants: [
    {
      key: 'variant-b',
      badge: 'Variant B',
      badgeColor: '#be297b',
      title: 'Auto Password Reset Account Authentication',
      detail: 'Conversation count (split %): 3,011 (33.6%)',
      isWinner: true,
    },
    {
      key: 'control',
      badge: 'Control',
      badgeColor: '#385075',
      title: 'Live',
      detail: 'Conversation count (split %): 3,000 (33.2%)',
    },
    {
      key: 'variant-a',
      badge: 'Variant A',
      badgeColor: '#2f69c7',
      title: 'Auto Ticket Creation',
      detail: 'Conversation count (split %): 2,989 (33.1%)',
    },
  ],
  recommendation: {
    title: 'Recommendation',
    bullets: ['Roll out this feature to only English speaking audience', 'Identify and fix so and so'],
  },
  keyLearning: {
    title: 'Key Learning',
    bullets: [
      'Variation B shows a notable 80% improvement in deflection rate.',
      'Users are 34% happier with Variation A based on CSAT result.',
      'Users were 18% happier with Variation A, based on Forethought sentiment analysis.',
      'Variation B generates 22% more messages per session, showing higher engagement.',
    ],
  },
  trafficSplit: [
    { name: 'control', value: 3000, pct: '33.3%', color: CONTROL_COLOR },
    { name: 'Variant A', value: 3000, pct: '33.3%', color: VARIANT_A_COLOR },
    { name: 'Variant B', value: 3000, pct: '33.3%', color: VARIANT_B_COLOR },
  ],
  trafficSplitTotal: 9000,
  avgDelta: [
    { name: 'Variant A', delta: '-27.4%', color: VARIANT_A_COLOR, positive: false },
    { name: 'Variant B', delta: '+16%', color: VARIANT_B_COLOR, positive: true },
  ],
  metricCards: [
    {
      key: 'deflection',
      title: 'Deflection',
      significant: true,
      domainMax: 3000,
      ticks: [0, 1000, 2000, 3000],
      tickSuffix: 'k',
      items: [
        { name: 'Control', value: 2400, display: '2,400' },
        { name: 'Variant A', value: 1800, display: '1,800', delta: '-600', positive: false },
        { name: 'Variant B', value: 2799, display: '2,799', delta: '+399', positive: true },
      ],
    },
    {
      key: 'deflection-rate',
      title: 'Deflection rate',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 80, display: '80%' },
        { name: 'Variant A', value: 55, display: '55%', delta: '-25%', positive: false },
        { name: 'Variant B', value: 92, display: '92%', delta: '+12%', positive: true },
      ],
    },
    {
      key: 'avg-csat',
      title: 'Avg. CSAT',
      significant: false,
      domainMax: 5,
      ticks: [2, 3, 4, 5],
      items: [
        { name: 'Control', value: 3.2, display: '3.2' },
        { name: 'Variant A', value: 2.8, display: '2.8', delta: '-0.4', positive: false },
        { name: 'Variant B', value: 3.8, display: '3.8', delta: '+0.6', positive: true },
      ],
    },
    {
      key: 'positive-sentiment',
      title: '% of positive sentiment',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 80, display: '80%' },
        { name: 'Variant A', value: 55, display: '55%', delta: '-25%', positive: false },
        { name: 'Variant B', value: 92, display: '92%', delta: '+12%', positive: true },
      ],
    },
    {
      key: 'engagement',
      title: 'Engagement',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 80, display: '80%' },
        { name: 'Variant A', value: 55, display: '55%', delta: '-25%', positive: false },
        { name: 'Variant B', value: 92, display: '92%', delta: '+12%', positive: true },
      ],
    },
    {
      key: 'relevance-rate',
      title: 'Relevance rate',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 80, display: '80%' },
        { name: 'Variant A', value: 55, display: '55%', delta: '-25%', positive: false },
        { name: 'Variant B', value: 92, display: '92%', delta: '+12%', positive: true },
      ],
    },
    {
      key: 'realized-saving',
      title: 'Realized saving',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      items: [
        { name: 'Control', value: 80, display: '80k' },
        { name: 'Variant A', value: 55, display: '55k', delta: '-25%', positive: false },
        { name: 'Variant B', value: 92, display: '92k', delta: '+12%', positive: true },
      ],
    },
  ],
  resolutionsSeries: [
    { bucket: '10/3', Control: 72, 'Variant A': 61, 'Variant B': 84 },
    { bucket: '10/10', Control: 64, 'Variant A': 75, 'Variant B': 74 },
    { bucket: '10/17', Control: 57, 'Variant A': 62, 'Variant B': 54 },
    { bucket: '10/24', Control: 69, 'Variant A': 92, 'Variant B': 89 },
    { bucket: '11/1', Control: 54, 'Variant A': 68, 'Variant B': 56 },
  ],
}

// ── Per-row stories (e2–e5). e1 is the default login-fix detail above. ──

const CART_RECOVERY: ExperimentDetail = {
  id: 'e2',
  name: 'Abandoned Cart Recovery',
  description: 'Explore which outbound calls experience leads to the highest user satisfaction.',
  winnerLabel: 'Variant A',
  winnerVariants: [
    {
      key: 'variant-a',
      badge: 'Variant A',
      badgeColor: '#be297b',
      title: 'Proactive outbound call',
      detail: 'Conversation count (split %): 4,120 (34.3%)',
      isWinner: true,
    },
    {
      key: 'control',
      badge: 'Control',
      badgeColor: '#385075',
      title: 'Email only',
      detail: 'Conversation count (split %): 4,000 (33.3%)',
    },
    {
      key: 'variant-b',
      badge: 'Variant B',
      badgeColor: '#2f69c7',
      title: 'SMS reminder',
      detail: 'Conversation count (split %): 3,880 (32.3%)',
    },
  ],
  recommendation: {
    title: 'Recommendation',
    bullets: ['Roll out proactive outbound calls for high-value carts', 'Keep SMS as a low-cost fallback'],
  },
  keyLearning: {
    title: 'Key Learning',
    bullets: [
      'Variant A recovers 41% more carts than the email baseline.',
      'Outbound calls lift CSAT by 0.5 points over control.',
      'SMS underperforms both control and Variant A on recovery.',
    ],
  },
  trafficSplit: [
    { name: 'control', value: 4000, pct: '33.3%', color: CONTROL_COLOR },
    { name: 'Variant A', value: 4120, pct: '34.3%', color: VARIANT_A_COLOR },
    { name: 'Variant B', value: 3880, pct: '32.3%', color: VARIANT_B_COLOR },
  ],
  trafficSplitTotal: 12000,
  avgDelta: [
    { name: 'Variant A', delta: '+41%', color: VARIANT_A_COLOR, positive: true },
    { name: 'Variant B', delta: '-8%', color: VARIANT_B_COLOR, positive: false },
  ],
  metricCards: [
    {
      key: 'recovered-carts',
      title: 'Recovered carts',
      significant: true,
      domainMax: 3000,
      ticks: [0, 1000, 2000, 3000],
      tickSuffix: 'k',
      items: [
        { name: 'Control', value: 1600, display: '1,600' },
        { name: 'Variant A', value: 2256, display: '2,256', delta: '+656', positive: true },
        { name: 'Variant B', value: 1472, display: '1,472', delta: '-128', positive: false },
      ],
    },
    {
      key: 'recovery-rate',
      title: 'Recovery rate',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 40, display: '40%' },
        { name: 'Variant A', value: 55, display: '55%', delta: '+15%', positive: true },
        { name: 'Variant B', value: 38, display: '38%', delta: '-2%', positive: false },
      ],
    },
    {
      key: 'avg-csat',
      title: 'Avg. CSAT',
      significant: true,
      domainMax: 5,
      ticks: [2, 3, 4, 5],
      items: [
        { name: 'Control', value: 3.4, display: '3.4' },
        { name: 'Variant A', value: 3.9, display: '3.9', delta: '+0.5', positive: true },
        { name: 'Variant B', value: 3.2, display: '3.2', delta: '-0.2', positive: false },
      ],
    },
    {
      key: 'positive-sentiment',
      title: '% of positive sentiment',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 62, display: '62%' },
        { name: 'Variant A', value: 78, display: '78%', delta: '+16%', positive: true },
        { name: 'Variant B', value: 58, display: '58%', delta: '-4%', positive: false },
      ],
    },
    {
      key: 'engagement',
      title: 'Engagement',
      significant: false,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 70, display: '70%' },
        { name: 'Variant A', value: 74, display: '74%', delta: '+4%', positive: true },
        { name: 'Variant B', value: 66, display: '66%', delta: '-4%', positive: false },
      ],
    },
    {
      key: 'realized-saving',
      title: 'Realized saving',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      items: [
        { name: 'Control', value: 60, display: '60k' },
        { name: 'Variant A', value: 88, display: '88k', delta: '+28k', positive: true },
        { name: 'Variant B', value: 54, display: '54k', delta: '-6k', positive: false },
      ],
    },
  ],
  resolutionsSeries: [
    { bucket: '10/3', Control: 40, 'Variant A': 52, 'Variant B': 38 },
    { bucket: '10/10', Control: 42, 'Variant A': 58, 'Variant B': 40 },
    { bucket: '10/17', Control: 39, 'Variant A': 61, 'Variant B': 37 },
    { bucket: '10/24', Control: 44, 'Variant A': 66, 'Variant B': 41 },
    { bucket: '11/1', Control: 41, 'Variant A': 63, 'Variant B': 39 },
  ],
}

const RECAP_STRATEGY: ExperimentDetail = {
  id: 'e3',
  name: 'Conversation recap strategy',
  description: 'Explore which recap experience leads to the highest CSAT rating.',
  winnerLabel: 'Control',
  winnerVariants: [
    {
      key: 'control',
      badge: 'Control',
      badgeColor: '#385075',
      title: 'Full transcript recap',
      detail: 'Conversation count (split %): 2,700 (33.8%)',
      isWinner: true,
    },
    {
      key: 'variant-a',
      badge: 'Variant A',
      badgeColor: '#be297b',
      title: 'Bullet summary recap',
      detail: 'Conversation count (split %): 2,660 (33.3%)',
    },
    {
      key: 'variant-b',
      badge: 'Variant B',
      badgeColor: '#2f69c7',
      title: 'No recap',
      detail: 'Conversation count (split %): 2,640 (33.0%)',
    },
  ],
  recommendation: {
    title: 'Recommendation',
    bullets: ['Keep the full transcript recap as the default', 'Re-test the bullet summary with a larger sample'],
  },
  keyLearning: {
    title: 'Key Learning',
    bullets: [
      'The race was close — Control edged out Variant A by under 1 point.',
      'Removing the recap entirely (Variant B) hurt CSAT the most.',
      'No result reached the significance threshold for deflection.',
    ],
  },
  trafficSplit: [
    { name: 'control', value: 2700, pct: '33.8%', color: CONTROL_COLOR },
    { name: 'Variant A', value: 2660, pct: '33.3%', color: VARIANT_A_COLOR },
    { name: 'Variant B', value: 2640, pct: '33.0%', color: VARIANT_B_COLOR },
  ],
  trafficSplitTotal: 8000,
  avgDelta: [
    { name: 'Variant A', delta: '-1.2%', color: VARIANT_A_COLOR, positive: false },
    { name: 'Variant B', delta: '-4.5%', color: VARIANT_B_COLOR, positive: false },
  ],
  metricCards: [
    {
      key: 'resolutions',
      title: 'Resolutions',
      significant: false,
      domainMax: 3000,
      ticks: [0, 1000, 2000, 3000],
      tickSuffix: 'k',
      items: [
        { name: 'Control', value: 2100, display: '2,100' },
        { name: 'Variant A', value: 2075, display: '2,075', delta: '-25', positive: false },
        { name: 'Variant B', value: 2010, display: '2,010', delta: '-90', positive: false },
      ],
    },
    {
      key: 'avg-csat',
      title: 'Avg. CSAT',
      significant: false,
      domainMax: 5,
      ticks: [2, 3, 4, 5],
      items: [
        { name: 'Control', value: 4.1, display: '4.1' },
        { name: 'Variant A', value: 4.05, display: '4.05', delta: '-0.05', positive: false },
        { name: 'Variant B', value: 3.9, display: '3.9', delta: '-0.2', positive: false },
      ],
    },
    {
      key: 'positive-sentiment',
      title: '% of positive sentiment',
      significant: false,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 74, display: '74%' },
        { name: 'Variant A', value: 73, display: '73%', delta: '-1%', positive: false },
        { name: 'Variant B', value: 70, display: '70%', delta: '-4%', positive: false },
      ],
    },
    {
      key: 'engagement',
      title: 'Engagement',
      significant: false,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 68, display: '68%' },
        { name: 'Variant A', value: 67, display: '67%', delta: '-1%', positive: false },
        { name: 'Variant B', value: 64, display: '64%', delta: '-4%', positive: false },
      ],
    },
  ],
  resolutionsSeries: [
    { bucket: '10/3', Control: 66, 'Variant A': 65, 'Variant B': 61 },
    { bucket: '10/10', Control: 68, 'Variant A': 66, 'Variant B': 62 },
    { bucket: '10/17', Control: 65, 'Variant A': 64, 'Variant B': 60 },
    { bucket: '10/24', Control: 70, 'Variant A': 68, 'Variant B': 63 },
    { bucket: '11/1', Control: 67, 'Variant A': 66, 'Variant B': 61 },
  ],
}

const SELF_SERVICE_CHECKOUT: ExperimentDetail = {
  id: 'e4',
  name: 'Self Service Checkout',
  description: 'Test which checkout experience leads to the highest user satisfaction.',
  winnerLabel: 'Variant B',
  winnerVariants: [
    {
      key: 'variant-b',
      badge: 'Variant B',
      badgeColor: '#be297b',
      title: 'Guided self-service checkout',
      detail: 'Conversation count (split %): 5,200 (52.0%)',
      isWinner: true,
    },
    {
      key: 'control',
      badge: 'Control',
      badgeColor: '#385075',
      title: 'Agent-assisted checkout',
      detail: 'Conversation count (split %): 4,800 (48.0%)',
    },
  ],
  recommendation: {
    title: 'Recommendation',
    bullets: ['Default new users into guided self-service checkout', 'Keep agent assist available on request'],
  },
  keyLearning: {
    title: 'Key Learning',
    bullets: [
      'Variant B lifts CSAT by 0.6 points over agent-assisted checkout.',
      'Self-service resolves 19% more sessions without escalation.',
      'Realized savings grow as agent handling time drops.',
    ],
  },
  trafficSplit: [
    { name: 'control', value: 4800, pct: '48.0%', color: CONTROL_COLOR },
    { name: 'Variant B', value: 5200, pct: '52.0%', color: VARIANT_B_COLOR },
  ],
  trafficSplitTotal: 10000,
  avgDelta: [{ name: 'Variant B', delta: '+19%', color: VARIANT_B_COLOR, positive: true }],
  metricCards: [
    {
      key: 'resolutions',
      title: 'Resolutions',
      significant: true,
      domainMax: 3000,
      ticks: [0, 1000, 2000, 3000],
      tickSuffix: 'k',
      items: [
        { name: 'Control', value: 2200, display: '2,200' },
        { name: 'Variant B', value: 2618, display: '2,618', delta: '+418', positive: true },
      ],
    },
    {
      key: 'avg-csat',
      title: 'Avg. CSAT',
      significant: true,
      domainMax: 5,
      ticks: [2, 3, 4, 5],
      items: [
        { name: 'Control', value: 3.6, display: '3.6' },
        { name: 'Variant B', value: 4.2, display: '4.2', delta: '+0.6', positive: true },
      ],
    },
    {
      key: 'positive-sentiment',
      title: '% of positive sentiment',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 66, display: '66%' },
        { name: 'Variant B', value: 81, display: '81%', delta: '+15%', positive: true },
      ],
    },
    {
      key: 'realized-saving',
      title: 'Realized saving',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      items: [
        { name: 'Control', value: 50, display: '50k' },
        { name: 'Variant B', value: 82, display: '82k', delta: '+32k', positive: true },
      ],
    },
  ],
  resolutionsSeries: [
    { bucket: '10/3', Control: 55, 'Variant A': 0, 'Variant B': 68 },
    { bucket: '10/10', Control: 57, 'Variant A': 0, 'Variant B': 72 },
    { bucket: '10/17', Control: 54, 'Variant A': 0, 'Variant B': 74 },
    { bucket: '10/24', Control: 58, 'Variant A': 0, 'Variant B': 77 },
    { bucket: '11/1', Control: 56, 'Variant A': 0, 'Variant B': 75 },
  ],
}

const GUIDED_TROUBLESHOOT: ExperimentDetail = {
  id: 'e5',
  name: 'Guided Troubleshoot Flow',
  description: 'Explore which troubleshooting experience leads to the best customer retention.',
  winnerLabel: 'Control',
  winnerVariants: [
    {
      key: 'control',
      badge: 'Control',
      badgeColor: '#385075',
      title: 'Human-led troubleshooting',
      detail: 'Conversation count (split %): 3,500 (50.0%)',
      isWinner: true,
    },
    {
      key: 'variant-a',
      badge: 'Variant A',
      badgeColor: '#be297b',
      title: 'Fully guided flow',
      detail: 'Conversation count (split %): 2,100 (30.0%)',
    },
    {
      key: 'variant-b',
      badge: 'Variant B',
      badgeColor: '#2f69c7',
      title: 'Hybrid flow',
      detail: 'Conversation count (split %): 1,400 (20.0%)',
    },
  ],
  recommendation: {
    title: 'Recommendation',
    bullets: ['Do not roll out the guided flow as tested', 'Revisit hybrid flow after fixing drop-off points'],
  },
  keyLearning: {
    title: 'Key Learning',
    bullets: [
      'Both variants underperformed the human-led control on retention.',
      'The fully guided flow saw the highest mid-flow drop-off.',
      'Test was canceled early once negative deltas were clear.',
    ],
  },
  trafficSplit: [
    { name: 'control', value: 3500, pct: '50.0%', color: CONTROL_COLOR },
    { name: 'Variant A', value: 2100, pct: '30.0%', color: VARIANT_A_COLOR },
    { name: 'Variant B', value: 1400, pct: '20.0%', color: VARIANT_B_COLOR },
  ],
  trafficSplitTotal: 7000,
  avgDelta: [
    { name: 'Variant A', delta: '-22%', color: VARIANT_A_COLOR, positive: false },
    { name: 'Variant B', delta: '-11%', color: VARIANT_B_COLOR, positive: false },
  ],
  metricCards: [
    {
      key: 'retention-rate',
      title: 'Retention rate',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 72, display: '72%' },
        { name: 'Variant A', value: 56, display: '56%', delta: '-16%', positive: false },
        { name: 'Variant B', value: 64, display: '64%', delta: '-8%', positive: false },
      ],
    },
    {
      key: 'avg-csat',
      title: 'Avg. CSAT',
      significant: false,
      domainMax: 5,
      ticks: [2, 3, 4, 5],
      items: [
        { name: 'Control', value: 3.8, display: '3.8' },
        { name: 'Variant A', value: 3.0, display: '3.0', delta: '-0.8', positive: false },
        { name: 'Variant B', value: 3.4, display: '3.4', delta: '-0.4', positive: false },
      ],
    },
    {
      key: 'positive-sentiment',
      title: '% of positive sentiment',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 70, display: '70%' },
        { name: 'Variant A', value: 52, display: '52%', delta: '-18%', positive: false },
        { name: 'Variant B', value: 61, display: '61%', delta: '-9%', positive: false },
      ],
    },
    {
      key: 'engagement',
      title: 'Engagement',
      significant: true,
      domainMax: 100,
      ticks: [0, 33, 67, 100],
      tickSuffix: '%',
      items: [
        { name: 'Control', value: 75, display: '75%' },
        { name: 'Variant A', value: 58, display: '58%', delta: '-17%', positive: false },
        { name: 'Variant B', value: 66, display: '66%', delta: '-9%', positive: false },
      ],
    },
  ],
  resolutionsSeries: [
    { bucket: '10/3', Control: 71, 'Variant A': 60, 'Variant B': 66 },
    { bucket: '10/10', Control: 72, 'Variant A': 55, 'Variant B': 64 },
    { bucket: '10/17', Control: 70, 'Variant A': 52, 'Variant B': 63 },
    { bucket: '10/24', Control: 73, 'Variant A': 50, 'Variant B': 62 },
    { bucket: '11/1', Control: 72, 'Variant A': 51, 'Variant B': 64 },
  ],
}

export const EXPERIMENT_DETAILS: Record<string, ExperimentDetail> = {
  e1: DEFAULT_EXPERIMENT_DETAIL,
  e2: CART_RECOVERY,
  e3: RECAP_STRATEGY,
  e4: SELF_SERVICE_CHECKOUT,
  e5: GUIDED_TROUBLESHOOT,
}

export function getExperimentDetail(id: string | null | undefined): ExperimentDetail {
  return (id && EXPERIMENT_DETAILS[id]) || DEFAULT_EXPERIMENT_DETAIL
}
```

Also add the `ExperimentDetail` type near the other exported types (definition shown in the Interfaces block above).

Note on e4/self-service: it is a 2-variant test (Control + Variant B). The `resolutionsSeries` still includes a `'Variant A': 0` field because `ResolutionsPoint` requires it and the chart always renders three lines; a flat zero line is acceptable for the mock. (Do not change `ResolutionsPoint`.)

- [ ] **Step 4: Run the data test**

Run: `npx vitest run src/features/experiments/setup/results/results-data.test.ts`
Expected: PASS (3 tests). The card files will not compile yet — that is fixed in Tasks 3–4; do not run `typecheck` until after Task 4.

- [ ] **Step 5: Commit**

```bash
git add src/features/experiments/setup/results/results-data.ts src/features/experiments/setup/results/results-data.test.ts
git commit -m "feat(experiments): add per-experiment detail data map"
```

---

## Task 2: Make `ResultsView` accept a `detail` prop

**Files:**
- Modify: `src/features/experiments/setup/results/ResultsView.tsx`

**Interfaces:**
- Consumes: `ExperimentDetail` from `results-data`.
- Produces: `ResultsView` now has signature `function ResultsView({ detail }: { detail: ExperimentDetail })`. It passes: `detail.winnerVariants`/`winnerLabel` → `WinnerCard`; `detail.recommendation`/`keyLearning` → `RecommendationCard`; `detail.trafficSplit`/`trafficSplitTotal` → `TrafficSplitCard`; `detail.avgDelta` → `AvgDeltaCard`; `detail.metricCards` → the `MetricBarCard` list; `detail.resolutionsSeries` → `ResolutionsTimeSeriesCard`.

- [ ] **Step 1: Rewrite `ResultsView.tsx`**

```tsx
// A/B Test Results tab. Presentational mock dashboard driven by one
// ExperimentDetail: winner summary, recommendation, traffic split, avg delta,
// per-metric bar cards, and a resolutions time-series chart. No backend.
import { type ExperimentDetail } from './results-data'
import { WinnerCard } from './WinnerCard'
import { RecommendationCard } from './RecommendationCard'
import { TrafficSplitCard } from './TrafficSplitCard'
import { AvgDeltaCard } from './AvgDeltaCard'
import { MetricBarCard } from './MetricBarCard'
import { ResolutionsTimeSeriesCard } from './ResolutionsTimeSeriesCard'

export function ResultsView({ detail }: { detail: ExperimentDetail }) {
  const [deflection, ...restMetrics] = detail.metricCards
  return (
    <div data-testid="view-ab-test-results" className="flex flex-col gap-5 px-8 py-6">
      <div className="grid grid-cols-[348px_1fr] gap-5">
        <WinnerCard winnerLabel={detail.winnerLabel} variants={detail.winnerVariants} />
        <RecommendationCard recommendation={detail.recommendation} keyLearning={detail.keyLearning} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <TrafficSplitCard splits={detail.trafficSplit} total={detail.trafficSplitTotal} />
        <AvgDeltaCard entries={detail.avgDelta} />
        {deflection && <MetricBarCard card={deflection} />}
        {restMetrics.map((card) => (
          <MetricBarCard key={card.key} card={card} />
        ))}
      </div>

      <ResolutionsTimeSeriesCard series={detail.resolutionsSeries} />
    </div>
  )
}
```

- [ ] **Step 2: Do not build yet** — the card prop signatures land in Tasks 3–4. Proceed directly.

- [ ] **Step 3: Commit**

```bash
git add src/features/experiments/setup/results/ResultsView.tsx
git commit -m "refactor(experiments): drive ResultsView from a detail prop"
```

---

## Task 3: Convert Winner / Recommendation / Resolutions cards to props

**Files:**
- Modify: `src/features/experiments/setup/results/WinnerCard.tsx`
- Modify: `src/features/experiments/setup/results/RecommendationCard.tsx`
- Modify: `src/features/experiments/setup/results/ResolutionsTimeSeriesCard.tsx`

**Interfaces:**
- Consumes: types `WinnerVariant`, `ResultsRecommendation`, `ResolutionsPoint` from `results-data`; keeps importing `BAR_COLORS`, `RESOLUTIONS_TABS`.
- Produces:
  - `WinnerCard({ winnerLabel: string; variants: WinnerVariant[] })`
  - `RecommendationCard({ recommendation: ResultsRecommendation; keyLearning: ResultsRecommendation })`
  - `ResolutionsTimeSeriesCard({ series: ResolutionsPoint[] })`

- [ ] **Step 1: Rewrite `WinnerCard.tsx`**

Replace the `import { WINNER_VARIANTS, WINNER_LABEL } from './results-data'` line with `import { type WinnerVariant } from './results-data'`, change the signature to `export function WinnerCard({ winnerLabel, variants }: { winnerLabel: string; variants: WinnerVariant[] })`, and replace `WINNER_LABEL` → `winnerLabel` and `WINNER_VARIANTS` → `variants` in the JSX. Keep the `Trophy` import, `GRADIENT`, and all class names unchanged.

- [ ] **Step 2: Rewrite `RecommendationCard.tsx`**

Replace `import { RESULTS_RECOMMENDATION, KEY_LEARNING } from './results-data'` with `import { type ResultsRecommendation } from './results-data'`, change the signature to `export function RecommendationCard({ recommendation, keyLearning }: { recommendation: ResultsRecommendation; keyLearning: ResultsRecommendation })`, and replace `RESULTS_RECOMMENDATION` → `recommendation` and `KEY_LEARNING` → `keyLearning` throughout the JSX. Class names unchanged.

- [ ] **Step 3: Rewrite `ResolutionsTimeSeriesCard.tsx`**

Change the import to `import { BAR_COLORS, RESOLUTIONS_TABS, type ResolutionsPoint } from './results-data'` (drop `RESOLUTIONS_SERIES`), change the signature to `export function ResolutionsTimeSeriesCard({ series }: { series: ResolutionsPoint[] })`, and replace the chart's `data={RESOLUTIONS_SERIES}` with `data={series}`. Everything else (tab state, legend, axes, lines) unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/features/experiments/setup/results/WinnerCard.tsx src/features/experiments/setup/results/RecommendationCard.tsx src/features/experiments/setup/results/ResolutionsTimeSeriesCard.tsx
git commit -m "refactor(experiments): prop-drive winner/recommendation/timeseries cards"
```

---

## Task 4: Convert Traffic split / Avg delta cards to props; verify build

**Files:**
- Modify: `src/features/experiments/setup/results/TrafficSplitCard.tsx`
- Modify: `src/features/experiments/setup/results/AvgDeltaCard.tsx`

**Interfaces:**
- Consumes: types `TrafficSplitSlice`, `AvgDeltaEntry` from `results-data`.
- Produces:
  - `TrafficSplitCard({ splits: TrafficSplitSlice[]; total: number })`
  - `AvgDeltaCard({ entries: AvgDeltaEntry[] })`

- [ ] **Step 1: Rewrite `TrafficSplitCard.tsx`**

Change the import to `import { type TrafficSplitSlice } from './results-data'` (drop `TRAFFIC_SPLIT`, `TRAFFIC_SPLIT_TOTAL`), keep the `Info` and recharts imports. Change the signature to `export function TrafficSplitCard({ splits, total }: { splits: TrafficSplitSlice[]; total: number })`. Replace `TRAFFIC_SPLIT` → `splits` (in the legend `.map` and the `<Pie data=...>` and the `Cell` `.map`) and `TRAFFIC_SPLIT_TOTAL` → `total` (the centered number). Keep the current geometry (`innerRadius={56}`, `outerRadius={69}`, `paddingAngle={4}`, `cornerRadius={4}`) and `p-5` padding from the prior fix.

- [ ] **Step 2: Rewrite `AvgDeltaCard.tsx`**

Change the import to `import { type AvgDeltaEntry } from './results-data'`, change the signature to `export function AvgDeltaCard({ entries }: { entries: AvgDeltaEntry[] })`, and replace `AVG_DELTA` → `entries` in the `.map`. Keep the `grid grid-cols-2`, `text-[35px]`, `p-5` styling from the prior fix.

Note: `grid-cols-2` still centers reasonably for a single-entry variant (e4). Leave as-is.

- [ ] **Step 3: Typecheck the whole project**

Run: `npx tsc --noEmit`
Expected: EXIT 0 (all card/`ResultsView` signatures now align).

- [ ] **Step 4: Run the results + experiments tests**

Run: `npx vitest run src/features/experiments`
Expected: PASS. `ExperimentSetupScreen.test.tsx` still passes because Task 5 keeps a no-id default; if it references removed consts it does not — it renders the screen. If any failure references `ResultsView` missing a `detail` prop, that is fixed in Task 5; at this step only the card/data compile must be green. If `ExperimentSetupScreen` fails to compile because it renders `<ResultsView />` without a prop, proceed to Task 5 in the same working session before considering the suite green.

- [ ] **Step 5: Commit**

```bash
git add src/features/experiments/setup/results/TrafficSplitCard.tsx src/features/experiments/setup/results/AvgDeltaCard.tsx
git commit -m "refactor(experiments): prop-drive traffic-split & avg-delta cards"
```

---

## Task 5: Wire `ExperimentSetupScreen` to the selected experiment

**Files:**
- Modify: `src/features/experiments/setup/ExperimentSetupScreen.tsx`
- Test: `src/features/experiments/setup/ExperimentSetupScreen.test.tsx`

**Interfaces:**
- Consumes: `getExperimentDetail` from `./results/results-data`; `useSearchParams` from `react-router`.
- Produces: no new exports. Behavior: with `?id=<known>` the screen initializes `tab` to `'Results'`, renders `<ResultsView detail={detail} />`, and shows `detail.name` in the top bar / name field. With no id (or unknown), `tab` initializes to `'Setup'` and `detail` is `DEFAULT_EXPERIMENT_DETAIL`.

- [ ] **Step 1: Add failing tests**

Append to `ExperimentSetupScreen.test.tsx`. First update the helper to accept an initial entry:

```tsx
function renderScreenAt(entry: string) {
  const router = createMemoryRouter(
    [{ path: '/experiments/new', element: <ExperimentSetupScreen /> }],
    { initialEntries: [entry] },
  )
  return render(<RouterProvider router={router} />)
}
```

Add these tests inside the `describe`:

```tsx
it('opens on the Results tab and shows the experiment name for a known id', () => {
  renderScreenAt('/experiments/new?id=e2')
  const el = screen.getByTestId('screen-experiment-setup')
  expect(within(el).getByRole('tab', { name: 'Results' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByTestId('view-ab-test-results')).toBeInTheDocument()
  // e2 winner label appears in the winner card
  expect(within(el).getByText('Abandoned Cart Recovery')).toBeInTheDocument()
})

it('defaults to the Setup tab with no id', () => {
  renderScreenAt('/experiments/new')
  const el = screen.getByTestId('screen-experiment-setup')
  expect(within(el).getByRole('tab', { name: 'Setup' })).toHaveAttribute('aria-selected', 'true')
  expect(within(el).getByText('A/B Test detail')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/features/experiments/setup/ExperimentSetupScreen.test.tsx`
Expected: FAIL — screen ignores `?id`, `ResultsView` needs a `detail` prop.

- [ ] **Step 3: Update `ExperimentSetupScreen.tsx`**

Add imports at the top:

```tsx
import { useNavigate, useSearchParams } from 'react-router'
import { getExperimentDetail } from './results/results-data'
```

(Replace the existing `import { useNavigate } from 'react-router'` line.)

Inside the component, before the existing `useState` calls:

```tsx
const [searchParams] = useSearchParams()
const detail = getExperimentDetail(searchParams.get('id'))
const hasId = Boolean(searchParams.get('id') && detail.id === searchParams.get('id'))
```

Change the initial state to seed from the detail and land on Results when an id is present:

```tsx
const [tab, setTab] = useState<(typeof TABS)[number]>(hasId ? 'Results' : 'Setup')
const [name, setName] = useState(detail.name)
const [description, setDescription] = useState(detail.description)
```

(Remove the now-unused `DEFAULT_TEST_NAME`/`DEFAULT_TEST_DESCRIPTION` initializers from `useState`; keep the `DEFAULT_TEST_NAME` import only if still referenced in the title fallback `{name || DEFAULT_TEST_NAME}` — it is, so keep that import.)

Change the Results render to pass the detail:

```tsx
{tab === 'Results' ? (
  <ResultsView detail={detail} />
) : (
```

Leave the Setup form fields as-is (they remain the shared login-fix setup content; only name/description are seeded from the detail).

- [ ] **Step 4: Run the screen tests**

Run: `npx vitest run src/features/experiments/setup/ExperimentSetupScreen.test.tsx`
Expected: PASS (all tests, old + new).

- [ ] **Step 5: Commit**

```bash
git add src/features/experiments/setup/ExperimentSetupScreen.tsx src/features/experiments/setup/ExperimentSetupScreen.test.tsx
git commit -m "feat(experiments): select experiment detail from ?id and land on Results"
```

---

## Task 6: Make table rows clickable

**Files:**
- Modify: `src/features/experiments/ExperimentTable.tsx`
- Test: `src/features/experiments/ExperimentTable.test.tsx`

**Interfaces:**
- Consumes: `useNavigate` from `react-router`.
- Produces: each row is a `role="button"` element (with keyboard support) that calls `navigate('/experiments/new?id=' + e.id)`. No prop changes to `ExperimentTable`.

- [ ] **Step 1: Update the test**

`ExperimentTable` uses `useNavigate`, so the test must render inside a router. Rewrite `ExperimentTable.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ExperimentTable } from './ExperimentTable'
import { EXPERIMENTS } from './experiments-data'

function renderTable() {
  let lastPath = ''
  const router = createMemoryRouter(
    [
      { path: '/', element: <ExperimentTable experiments={EXPERIMENTS} /> },
      { path: '/experiments/new', element: <LocationProbe onLocation={(p) => (lastPath = p)} /> },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return { getLastPath: () => lastPath, router }
}

function LocationProbe({ onLocation }: { onLocation: (p: string) => void }) {
  return <div data-testid="probe" ref={() => onLocation(window.location.pathname)} />
}

describe('ExperimentTable', () => {
  it('renders column headers and a row per experiment', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Traffic split')).toBeInTheDocument()
    expect(screen.getByText('Abandoned Cart Recovery')).toBeInTheDocument()
    expect(screen.getByText('Guided Troubleshoot Flow')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('navigates to the experiment detail with its id when a row is clicked', () => {
    const { router } = renderTable()
    fireEvent.click(screen.getByText('Abandoned Cart Recovery'))
    expect(router.state.location.pathname).toBe('/experiments/new')
    expect(router.state.location.search).toBe('?id=e2')
  })
})
```

(Drop the `LocationProbe` helper if unused — the assertion uses `router.state.location`, so you may remove `LocationProbe`/`getLastPath` entirely. Keep the file to the two tests above with the router-based assertion.)

Simplified final test file (use this):

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ExperimentTable } from './ExperimentTable'
import { EXPERIMENTS } from './experiments-data'

function renderTable() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <ExperimentTable experiments={EXPERIMENTS} /> },
      { path: '/experiments/new', element: <div data-testid="detail" /> },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('ExperimentTable', () => {
  it('renders column headers and a row per experiment', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Traffic split')).toBeInTheDocument()
    expect(screen.getByText('Abandoned Cart Recovery')).toBeInTheDocument()
    expect(screen.getByText('Guided Troubleshoot Flow')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('navigates to the experiment detail with its id when a row is clicked', () => {
    const router = renderTable()
    fireEvent.click(screen.getByText('Abandoned Cart Recovery'))
    expect(router.state.location.pathname).toBe('/experiments/new')
    expect(router.state.location.search).toBe('?id=e2')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/features/experiments/ExperimentTable.test.tsx`
Expected: FAIL — clicking the row does not change location (rows are static).

- [ ] **Step 3: Make rows clickable**

Rewrite `ExperimentTable.tsx`:

```tsx
// The experiments table. Columns: Name · Status · Intent · Description ·
// Traffic split. Rows are separated cards; clicking a row opens its detail
// at /experiments/new?id=<id>.
import { useNavigate } from 'react-router'
import { type Experiment } from './experiments-data'
import { StatusBadge } from './StatusBadge'
import { TrafficSplitBar } from './TrafficSplitBar'

const INK = '#2f3130'
const COLS = 'grid-cols-[1.4fr_0.8fr_1.2fr_1.8fr_0.9fr]'

export function ExperimentTable({ experiments }: { experiments: Experiment[] }) {
  const navigate = useNavigate()
  return (
    <div>
      {/* Column headers */}
      <div className={`grid ${COLS} gap-4 px-5 py-3 text-[12px] font-medium text-ink-muted`}>
        <span>Name</span>
        <span>Status</span>
        <span>Intent</span>
        <span>Description</span>
        <span>Traffic split</span>
      </div>
      {/* Rows */}
      <div className="flex flex-col gap-3">
        {experiments.map((e) => (
          <div
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/experiments/new?id=${e.id}`)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                navigate(`/experiments/new?id=${e.id}`)
              }
            }}
            className={`grid ${COLS} cursor-pointer items-center gap-4 rounded-2xl border border-surface-border bg-white px-5 py-4 transition-colors hover:border-grey-500 hover:bg-[#fafafa] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700`}
          >
            <div className="text-[14px] font-medium" style={{ color: INK }}>{e.name}</div>
            <div><StatusBadge status={e.status} /></div>
            <div className="text-[13px]" style={{ color: INK }}>{e.intent}</div>
            <div className="text-[13px] text-ink-muted">{e.description}</div>
            <div><TrafficSplitBar splits={e.splits} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/features/experiments/ExperimentTable.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/experiments/ExperimentTable.tsx src/features/experiments/ExperimentTable.test.tsx
git commit -m "feat(experiments): open experiment detail on row click"
```

---

## Task 7: Full-suite verification

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: EXIT 0.

- [ ] **Step 2: Full test run (exclude worktree crawl)**

Run: `npx vitest run --exclude '**/.claude/**'`
Expected: all suites PASS.

- [ ] **Step 3: Manual smoke (optional but recommended)**

Run `npx vite`, open `/experiments`, click "Abandoned Cart Recovery" → lands on `/experiments/new?id=e2` showing the Results tab with Variant A as winner, a 3-way traffic split summing to 12,000, and a `+41%` avg delta. Click back, try "Self Service Checkout" → 2-variant winner (Variant B) and a two-column traffic legend.

- [ ] **Step 4: No commit needed** (verification only). If manual smoke revealed a data typo, fix it in `results-data.ts` and commit `fix(experiments): correct <field> for <id>`.

---

## Self-Review Notes

- **Spec coverage:** row click-through (Task 6), `?id` selection + Results-tab landing + fallback (Task 5), `ExperimentDetail`/`EXPERIMENT_DETAILS`/`DEFAULT_EXPERIMENT_DETAIL` (Task 1), prop-drilled cards (Tasks 2–4), 5 distinct internally-consistent stories (Task 1), tests (Tasks 1, 5, 6), gates (Task 7). All spec sections covered.
- **Type consistency:** card prop names used in `ResultsView` (Task 2) match the signatures defined in Tasks 3–4 (`winnerLabel`/`variants`, `recommendation`/`keyLearning`, `splits`/`total`, `entries`, `series`). `getExperimentDetail` signature is identical in Tasks 1 and 5.
- **Ordering caveat:** Tasks 1–4 leave the tree non-compiling only between commits within the refactor; `tsc` is first run green at Task 4 Step 3 and again at Task 7. This is called out in each affected task.
