// Mock data + types for the Insights → AI Performances → Overview screen. All
// values are illustrative (no backend) and mirror the Figma design where legible.
import type { CardInsight } from './card-insight'
import type { SankeyData } from '@/components/sankey/SankeyFlow'

export type Granularity = 'weekly' | 'monthly' | 'quarterly'

// Chart palette (Figma "Chart/Color N" variables).
export const C1 = '#01567A' // deep teal
export const C2 = '#E05C34' // orange
export const C3 = '#2F69C7' // blue
export const C4 = '#DF8600' // amber
export const C5 = '#2F99B3' // cyan
export const C6 = '#BE297B' // magenta
export const C7 = '#109081' // green-teal
export const C8 = '#EBA505' // yellow

export const INK = '#2f3130'
export const GREY = '#8b8e89'

// Delta colors: green reads as "good", red as "bad" — but which direction is
// "good" differs per metric (e.g. faster response time is good), so each delta
// carries an explicit `up` flag rather than deriving color from its sign.
export const POS = '#2f8a4f'
export const NEG = '#c8402f'

// --- Conversation flow (Sankey) -------------------------------------------
// Four stacked columns: Total → Channels → Resolutions → Savings. Heights come
// from the link values; nodes are sized by the larger of their incoming/outgoing
// ribbon totals so bands attach flush. Rendered by the shared `SankeyFlow`.
export type FlowData = SankeyData

// Node indices:
// 0 Total | 1 Widget(AI) | 2 Email(AI) | 3 Voice(AI)
// 4 Total Resolutions | 5 Un-resolved | 6 Realized Saving
export const FLOW: FlowData = {
  nodes: [
    { name: 'Total', label: 'Total  100,000', color: C1, col: 0 },
    { name: 'Widget(AI)', label: 'Widget(AI)  100,000', color: C6, col: 1 },
    { name: 'Email(AI)', label: 'Email(AI)  50,000', color: C3, col: 1 },
    { name: 'Voice(AI)', label: 'Voice(AI)  75,000', color: '#7b3ca0', col: 1 },
    { name: 'Total Resolutions', label: 'Total Resolutions  84,000', color: C1, col: 2 },
    { name: 'Un-resolved', label: 'Un-resolved  16,000', color: C2, col: 2 },
    { name: 'Realized Saving', label: 'Realized Saving\n$740K', color: C7, col: 3 },
  ],
  links: [
    // Total → channels (neutral slate bands).
    { source: 0, target: 1, value: 100000, color: '#a9c4dc' },
    { source: 0, target: 2, value: 50000, color: '#a9c4dc' },
    { source: 0, target: 3, value: 75000, color: '#a9c4dc' },
    // Channels → resolutions (channel-tinted).
    { source: 1, target: 4, value: 85000, color: C6 },
    { source: 2, target: 4, value: 43000, color: C3 },
    { source: 3, target: 4, value: 66000, color: '#7b3ca0' },
    // Channels → un-resolved (thin red strands).
    { source: 1, target: 5, value: 15000, color: C2 },
    { source: 2, target: 5, value: 7000, color: C2 },
    { source: 3, target: 5, value: 9000, color: C2 },
    // Resolutions → savings.
    { source: 4, target: 6, value: 194000, color: C7 },
  ],
}

// The unchecked Figma state rolls the channel ribbons up into the two outcome
// paths. It is intentionally a separate data set rather than a visual hide:
// every remaining ribbon now attaches directly to the aggregate total.
export const AGGREGATE_FLOW: FlowData = {
  nodes: [
    { name: 'Total', label: 'Total  100,000', color: C1, col: 0 },
    { name: 'Total Resolutions', label: 'Total Resolutions  84,000', color: C7, col: 1 },
    { name: 'Un-resolved', label: 'Un-resolved  16,000', color: C2, col: 1 },
    { name: 'Realized Saving', label: 'Realized Saving\n$740K', color: C3, col: 2 },
  ],
  links: [
    { source: 0, target: 1, value: 84000, color: C7 },
    { source: 0, target: 2, value: 16000, color: C2 },
    { source: 1, target: 3, value: 84000, color: C3 },
  ],
}

// --- Stat cards -----------------------------------------------------------
export type Delta = { label: string; up: boolean }
export type StatRow = { value: string; delta?: Delta }
export type StatCard = {
  title: string
  value: string
  unit?: string // greyed suffix, e.g. "sec"
  valueColor?: string
  sentiment?: boolean // render a smiley chip before the value
  delta: Delta
  rows: StatRow[] // widget / email / voice, in order
  insight: CardInsight
}

const up = (label: string): Delta => ({ label, up: true })
const down = (label: string): Delta => ({ label, up: false })

export const STAT_CARDS: StatCard[] = [
  {
    title: 'Total conversations',
    value: '550,982',
    delta: up('+7%'),
    rows: [{ value: '300,000', delta: up('+10%') }, { value: '100,000', delta: up('+6%') }, { value: '100,000', delta: up('+2%') }],
    insight: {
      headline: 'Total conversations grew across every channel this period.',
      detail: 'Widget led the increase, followed by Voice.',
    },
  },
  {
    title: 'Automated resolutions (AR)',
    value: '89%',
    delta: up('+12%'),
    rows: [{ value: '90%', delta: down('-2%') }, { value: '88%', delta: up('+6%') }, { value: '91%', delta: up('+2%') }],
    insight: {
      headline: 'Widget automation dipped while Email and Voice improved.',
      detail: 'Voice has the highest automated resolution rate.',
    },
  },
  {
    title: 'Escalations',
    value: '18%',
    delta: up('+12%'),
    rows: [{ value: '15%', delta: down('-2%') }, { value: '20%', delta: up('+6%') }, { value: '17%', delta: up('+2%') }],
    insight: {
      headline: 'Escalations increased across Email and Voice conversations.',
      detail: 'Email has the highest escalation rate.',
    },
  },
  {
    title: 'Sentiment',
    value: '65%',
    sentiment: true,
    delta: up('+5%'),
    rows: [{ value: '67%', delta: down('-2%') }, { value: '69%', delta: up('+6%') }, { value: '84%', delta: up('+2%') }],
    insight: {
      headline: 'Widget sentiment dipped while Email and Voice improved.',
      detail: 'Voice conversations show the most positive sentiment.',
    },
  },
  {
    title: 'CSAT',
    value: '4.3',
    valueColor: C1,
    delta: up('+9%'),
    rows: [{ value: '4.6', delta: up('+10%') }, { value: 'n/a' }, { value: '4.2', delta: up('+2%') }],
    insight: {
      headline: 'CSAT improved across every measured channel this period.',
      detail: 'Widget leads with the highest score.',
    },
  },
  {
    title: 'Time to first response',
    value: '1.3',
    unit: 'sec',
    delta: up('-10%'),
    rows: [{ value: '1 sec', delta: down('+35%') }, { value: '1.7 sec', delta: down('+67%') }, { value: '1.2 sec', delta: up('-20%') }],
    insight: {
      headline: 'Widget and Email first-response times got slower this period.',
      detail: 'Voice is the only channel that got faster.',
    },
  },
  {
    title: 'Time to resolution',
    value: '2.9',
    unit: 'min',
    delta: up('-10%'),
    rows: [{ value: '1 min', delta: down('+35%') }, { value: '1.7 min', delta: down('+67%') }, { value: '1.2 min', delta: up('-20%') }],
    insight: {
      headline: 'Widget and Email resolution times got slower this period.',
      detail: 'Voice is the only channel that got faster.',
    },
  },
  {
    title: 'Replies per conversation',
    value: '7.6',
    unit: 'times',
    delta: down('+7%'),
    rows: [{ value: '6.4', delta: down('+23%') }, { value: '4.2', delta: down('+45%') }, { value: '2.3', delta: up('-12%') }],
    insight: {
      headline: 'Widget and Email conversations are taking more replies to resolve.',
      detail: 'Voice is the only channel that improved.',
    },
  },
  {
    title: 'Positive user feedback',
    value: '84%',
    delta: up('+67%'),
    rows: [{ value: '90%', delta: up('+35%') }, { value: '82%', delta: up('+67%') }, { value: 'n/a' }],
    insight: {
      headline: 'Positive user feedback grew across every measured channel this period.',
      detail: 'Widget leads with the highest share of positive feedback.',
    },
  },
  {
    title: 'Relevant',
    value: '93%',
    delta: up('+7%'),
    rows: [{ value: '86%', delta: up('+10%') }, { value: '93%', delta: up('+6%') }, { value: '98%', delta: up('+2%') }],
    insight: {
      headline: 'Relevance improved across every channel this period.',
      detail: 'Voice leads with the highest relevance score.',
    },
  },
  {
    title: 'Engaged',
    value: '92%',
    delta: up('+12%'),
    rows: [{ value: '90%', delta: down('-2%') }, { value: '89%', delta: up('+6%') }, { value: '97%', delta: up('+2%') }],
    insight: {
      headline: 'Widget engagement dipped while Email and Voice improved.',
      detail: 'Voice leads with the highest engagement score.',
    },
  },
  {
    title: 'Realized savings',
    value: '$740K',
    delta: up('+32%'),
    rows: [{ value: '$375K', delta: up('+17%') }, { value: '$150K', delta: up('+4%') }, { value: '$175K', delta: up('+10%') }],
    insight: {
      headline: 'Realized savings grew across every channel this period.',
      detail: 'Widget led the increase, followed by Voice.',
    },
  },
]

// --- Performance insights: worst-performing workflows ----------------------
export type WorkflowRow = { workflow: string; nonDeflections: string; pct: string; csat: string; step: string }

export const WORST_WORKFLOWS: WorkflowRow[] = [
  { workflow: 'Vew bank statement', nonDeflections: '1,975', pct: '18%', csat: '3.2', step: 'Step #1' },
  { workflow: 'Update profile', nonDeflections: '1,274', pct: '12%', csat: '2.7', step: 'Step #5' },
  { workflow: 'Close your account', nonDeflections: '877', pct: '9%', csat: '3.2', step: 'Step #2' },
]

// --- Custom insights -------------------------------------------------------
export type FunnelStage = { label: string; pct: string; count: string; value: number }

// `value` is the bar height as a percentage of the funnel's first stage.
export const FUNNEL: FunnelStage[] = [
  { label: 'Recommendation', pct: '100%', count: '3,000', value: 100 },
  { label: 'Added to cart', pct: '30%', count: '900', value: 30 },
  { label: 'Checkout process', pct: '26.67%', count: '800', value: 27 },
  { label: 'Checked out successfully', pct: '10%', count: '300', value: 10 },
  { label: 'Returned', pct: '0.6%', count: '18', value: 3 },
]

export type DonutSlice = { name: string; value: number; color: string }
export type Donut = { title: string; centerValue: string; centerLabel: string; slices: DonutSlice[] }

export const DONUTS: Donut[] = [
  {
    title: 'Purchased Products by Category',
    centerValue: '9,674',
    centerLabel: 'events',
    slices: [
      { name: 'Books', value: 1500, color: C1 },
      { name: 'Clothing', value: 2600, color: C2 },
      { name: 'Electronics', value: 2100, color: C3 },
      { name: 'Fitness', value: 874, color: C4 },
      { name: 'Home & Kitchen', value: 1200, color: C5 },
      { name: 'Software', value: 1400, color: C6 },
    ],
  },
  {
    title: 'Sales Agent recommended purchase',
    centerValue: '2,413',
    centerLabel: 'events',
    slices: [
      { name: 'Furniture', value: 180, color: C4 },
      { name: 'Decor', value: 83, color: C7 },
      { name: 'Purchased', value: 1500, color: C1 },
      { name: 'Lighting', value: 400, color: C2 },
      { name: 'Rugs', value: 250, color: C3 },
    ],
  },
  {
    title: 'Products purchased by credit card',
    centerValue: '835',
    centerLabel: 'conversations',
    slices: [
      { name: 'Electronics', value: 220, color: C1 },
      { name: 'Software', value: 180, color: C2 },
      { name: 'Clothing', value: 150, color: C3 },
      { name: 'Books', value: 120, color: C4 },
      { name: 'Home & Kitchen', value: 90, color: C5 },
      { name: 'Fitness', value: 75, color: C6 },
    ],
  },
]

// --- Conversation comparison (one metric, this period vs previous) ----------
// The chart plots a single selected series at a time, so every series needs its
// own previous period: `compare` is required, not optional. `axis` names the unit
// the values are in, which drives the y-axis domain, the tick format, and whether
// the summary figure is a total or an average (see ConversationComparison).
export type CompareSeries = {
  key: string
  label: string
  color: string
  axis: 'conv' | 'rate' | 'csat'
  data: number[]
  compare: number[]
}

export const COMPARE_X = ['5/2', '5/9', '5/16', '5/23', '5/30']
export const COMPARE_CHANNELS = ['Widget', 'Email', 'Voice', 'API', 'Slack']

// The series above are the Widget baseline. Rather than hand-write 80 more mock
// arrays (5 channels × 8 metrics × 2 periods), each channel carries a weight and
// the view derives its series from the baseline — see `channelSeries`. The point
// is that the channel control moves the chart at all; a control that redraws the
// same numbers under a new label reads as a bug.
export const COMPARE_CHANNEL_WEIGHT: Record<string, number> = {
  Widget: 1,
  Email: 0.72,
  Voice: 0.55,
  Headless: 0.34,
  API: 0.34,
  Slack: 0.21,
}

// Counts scale with the channel's volume. Rates and ratings do not — they are
// bounded, and a 0.21-weight channel does not score 0.8 CSAT — so the weight only
// nudges them, and the result is clamped to the unit's ceiling.
function scaleValue(axis: CompareSeries['axis'], value: number, weight: number): number {
  if (axis === 'conv') return Math.round(value * weight)
  const nudged = value * (0.85 + 0.15 * weight)
  return axis === 'csat' ? Math.min(5, Number(nudged.toFixed(1))) : Math.min(100, Math.round(nudged))
}

/** The series as it stands for one channel. Returns the baseline for Widget. */
export function channelSeries(series: CompareSeries, channel: string): CompareSeries {
  const weight = COMPARE_CHANNEL_WEIGHT[channel] ?? 1
  if (weight === 1) return series
  return {
    ...series,
    data: series.data.map((v) => scaleValue(series.axis, v, weight)),
    compare: series.compare.map((v) => scaleValue(series.axis, v, weight)),
  }
}

export const COMPARE_SERIES: CompareSeries[] = [
  {
    key: 'conversations',
    label: 'Conversations',
    color: C1,
    axis: 'conv',
    data: [280, 210, 250, 300, 120],
    compare: [240, 230, 220, 265, 175],
  },
  {
    key: 'resolutions',
    label: 'Resolutions',
    color: C2,
    axis: 'conv',
    data: [230, 150, 235, 260, 80],
    compare: [190, 175, 200, 210, 190],
  },
  {
    key: 'resolution-rate',
    label: 'Resolution rate',
    color: C3,
    axis: 'rate',
    data: [72, 42, 72, 79, 28],
    compare: [96, 66, 55, 88, 52],
  },
  {
    key: 'avg-csat',
    label: 'Avg. CSAT',
    color: C4,
    axis: 'csat',
    data: [4, 3.6, 4, 4.3, 3.1],
    compare: [4.9, 3.4, 3.6, 4.2, 2.6],
  },
  {
    key: 'knowledge',
    label: 'Knowledge article surfaced',
    color: C5,
    axis: 'rate',
    data: [70, 46, 60, 40, 88],
    compare: [64, 58, 52, 49, 71],
  },
  {
    key: 'quick-feedback',
    label: 'Quick feedback',
    color: C6,
    axis: 'rate',
    data: [40, 24, 62, 30, 20],
    compare: [36, 33, 44, 38, 29],
  },
  {
    key: 'relevance',
    label: 'Relevance',
    color: C7,
    axis: 'rate',
    data: [55, 60, 48, 66, 30],
    compare: [62, 54, 57, 59, 44],
  },
  {
    key: 'user-engagement',
    label: 'User engagement',
    color: C8,
    axis: 'rate',
    data: [45, 62, 50, 70, 42],
    compare: [51, 48, 55, 61, 53],
  },
]
