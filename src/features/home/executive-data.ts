// Deterministic mock data for the dedicated Executive dashboard. Values are
// transcribed from the Figma frame and stay separate from the general Home
// widgets because this view tells a top-down outcomes and value story.
import type { SankeyData } from '@/components/sankey/SankeyFlow'

export type ExecutiveSectionId =
  'outcomes' | 'customer-outcomes' | 'business-value' | 'leadership-action'

export const EXECUTIVE_SECTION_ID_LIST: ExecutiveSectionId[] = [
  'outcomes',
  'customer-outcomes',
  'business-value',
  'leadership-action',
]

export const DEFAULT_EXECUTIVE_LAYOUT: ExecutiveSectionId[] = [...EXECUTIVE_SECTION_ID_LIST]

export const EXECUTIVE_SECTION_TITLE: Record<ExecutiveSectionId, string> = {
  outcomes: 'Executive outcome summary',
  'customer-outcomes': 'Customer outcomes',
  'business-value': 'Business value',
  'leadership-action': 'Leadership action',
}

export type ExecutiveKpi = {
  id: string
  label: string
  value: string
  target?: string
  forecast: string
  status?: 'on-track' | 'under' | 'over'
}

export const EXECUTIVE_KPIS: ExecutiveKpi[] = [
  { id: 'conversations', label: 'Conversations', value: '2.40M', forecast: '84%' },
  {
    id: 'resolutions',
    label: 'Resolutions',
    value: '1.92M (93.8%)',
    target: '92% (+5%)',
    forecast: '94.5%',
    status: 'on-track',
  },
  {
    id: 'csat',
    label: 'CSAT',
    value: '4.7 / 5',
    target: '4.6 (+5%)',
    forecast: '2.52M',
    status: 'on-track',
  },
  {
    id: 'cost',
    label: 'Cost per resolution',
    value: '$6.74',
    target: '$6.00 (+5%)',
    forecast: '$6.50',
    status: 'over',
  },
  {
    id: 'revenue',
    label: 'Revenue protected',
    value: '$18.2M',
    target: '$18M (+5%)',
    forecast: '$18.3M',
    status: 'on-track',
  },
  { id: 'fcr', label: 'FCR', value: '82%', target: '85% (+5%)', forecast: '84%', status: 'under' },
  {
    id: 'sla',
    label: 'SLA achievement',
    value: '97%',
    target: '98% (-1%)',
    forecast: '98%',
    status: 'under',
  },
  {
    id: 'retained',
    label: 'Customers retained',
    value: '32.4K',
    target: '30K (+5%)',
    forecast: '30K',
    status: 'on-track',
  },
  {
    id: 'savings',
    label: 'AI cost savings',
    value: '$2.47M',
    target: '$2.4M (+5%)',
    forecast: '$2.5M',
    status: 'on-track',
  },
  {
    id: 'roi',
    label: 'Support ROI',
    value: '4.8x',
    target: '4.5x (+5%)',
    forecast: '5.1x',
    status: 'on-track',
  },
]

// `count` is the outcome in thousands — the number the Sankey's geometry is
// derived from (the four sum to the 2.4M total). `resolved` marks the outcomes
// that carry on into the resolved column.
export const OUTCOME_FLOW = [
  {
    id: 'ai-resolved',
    label: 'AI resolved',
    value: '1.46M',
    share: '61%',
    count: 1460,
    resolved: true,
    color: '#d86b4b',
  },
  {
    id: 'ai-human',
    label: 'AI to human',
    value: '576K',
    share: '24%',
    count: 576,
    resolved: true,
    color: '#4f75c6',
  },
  {
    id: 'human-only',
    label: 'Human only',
    value: '288K',
    share: '12%',
    count: 288,
    resolved: true,
    color: '#c58a19',
  },
  {
    id: 'not-resolved',
    label: 'Not resolved',
    value: '72K',
    share: '3%',
    count: 72,
    resolved: false,
    color: '#7d8493',
  },
] as const

// The customer-outcomes flow, drawn by the shared `SankeyFlow` so it reads as the
// same chart as Insights ▸ Agent Overview. Total → the four outcomes → resolved;
// Total → outcome ribbons are the neutral slate the Insights flow uses for its
// first hop, and each outcome tints its own ribbon into the resolved bar.
//
// Every label is transcribed from the frame, so the resolved bar's headline
// (1.92M · 93.8%, the same figure as the Resolutions KPI) does not reconcile with
// the per-outcome counts it is fed by. Keep the labels; the geometry follows the
// counts, so the bands still attach flush.
const OUTCOME_TOTAL_COLOR = '#2b607a'
const OUTCOME_RESOLVED_COLOR = '#188977'
const OUTCOME_RIBBON = '#a9c4dc'

export const OUTCOME_SANKEY: SankeyData = {
  nodes: [
    { name: 'Total', label: 'Total\n2.4M · 100%', color: OUTCOME_TOTAL_COLOR, col: 0 },
    ...OUTCOME_FLOW.map((outcome) => ({
      name: outcome.label,
      label: `${outcome.label}\n${outcome.value} · ${outcome.share}`,
      color: outcome.color,
      col: 1,
    })),
    {
      name: 'Total resolved',
      label: 'Total resolved\n1.92M · 93.8%',
      color: OUTCOME_RESOLVED_COLOR,
      col: 2,
    },
  ],
  links: [
    ...OUTCOME_FLOW.map((outcome, index) => ({
      source: 0,
      target: index + 1,
      value: outcome.count,
      color: OUTCOME_RIBBON,
    })),
    ...OUTCOME_FLOW.flatMap((outcome, index) =>
      outcome.resolved
        ? [
            {
              source: index + 1,
              target: OUTCOME_FLOW.length + 1,
              value: outcome.count,
              color: outcome.color,
            },
          ]
        : [],
    ),
  ],
}

export const OUTCOME_SANKEY_TITLES = ['Total conversations', 'Outcomes', 'Resolved']

export type OutcomeMetric = { label: string; current: string; target: string }
export type OutcomeChannel = {
  id: string
  label: string
  share: string
  color: string
  metrics: OutcomeMetric[]
}

export const OUTCOME_CHANNELS: OutcomeChannel[] = [
  {
    id: 'ai-resolved',
    label: 'AI resolved',
    share: '61%',
    color: '#d86b4b',
    metrics: [
      { label: 'Resolution', current: '1.46M', target: '1.5M' },
      { label: 'CSAT', current: '4.3', target: '4.6' },
      { label: 'Avg resolution time', current: '2 min', target: '2 min' },
      { label: 'Repeat contact', current: '7%', target: '6%' },
      { label: 'Cost / resolution', current: '$0.08', target: '$0.10' },
    ],
  },
  {
    id: 'ai-human',
    label: 'AI to human',
    share: '24%',
    color: '#4f75c6',
    metrics: [
      { label: 'Resolution', current: '576K', target: '570K' },
      { label: 'CSAT', current: '4.8', target: '4.6' },
      { label: 'Avg resolution time', current: '18 min', target: '16 min' },
      { label: 'Repeat contact', current: '8%', target: '6%' },
      { label: 'Handoff success', current: '96%', target: '96%' },
    ],
  },
  {
    id: 'human-only',
    label: 'Human only',
    share: '12%',
    color: '#c58a19',
    metrics: [
      { label: 'Resolution', current: '288K', target: '280K' },
      { label: 'CSAT', current: '4.7', target: '4.6' },
      { label: 'Avg resolution time', current: '28 min', target: '30 min' },
      { label: 'Repeat contact', current: '9%', target: '6%' },
      { label: 'Cost / resolution', current: '$4.20', target: '$4.30' },
    ],
  },
]

export const CUSTOM_INSIGHTS = [
  {
    label: 'Rider recovery rate',
    value: '64%',
    detail: '12,480 riders returned',
    formula: 'Riders who completed a trip within 7 days ÷ riders with an eligible resolved issue',
  },
  {
    label: 'Repeat contact avoided',
    value: '8,420',
    detail: '$67K estimated savings',
    formula: 'Improvement from baseline × eligible conversations × cost per assisted contact',
  },
  {
    label: 'Cost per successful resolution',
    value: '$2.84',
    detail: 'Down 18% from baseline',
    formula: 'Total support cost ÷ successfully resolved rider issues',
  },
] as const

export const BUSINESS_VALUE_KPIS = [
  {
    label: 'Value created',
    value: '$23.47M',
    target: '22M (+5%)',
    forecast: '84%',
    status: 'on-track',
  },
  {
    label: 'Revenue protected',
    value: '$18.2M',
    target: '$18M (+5%)',
    forecast: '$18.3M',
    status: 'on-track',
  },
  {
    label: 'AI cost savings',
    value: '$2.47M',
    target: '$2.4M (+5%)',
    forecast: '$2.5M',
    status: 'on-track',
  },
  {
    label: 'Refunds prevented',
    value: '$2.8M',
    target: '$2.9M (-5%)',
    forecast: '$2.5M',
    status: 'under',
  },
] as const

export const COST_MODEL = [
  { item: 'Support operating costs', method: 'Estimated', amount: '$2.79M' },
  { item: 'Cost per resolution', method: 'Estimated', amount: '$1.74' },
  { item: 'Customers retained', method: 'Salesforce', amount: '32,400' },
  { item: 'Support ROI', method: 'Estimated', amount: '4.8x' },
  { item: 'Baseline without AI', method: 'Calculated', amount: '$4.20M' },
] as const

export const AGENT_COSTS = [
  { agent: 'Human agent', method: 'Manual', unit: '$4.20', total: '$1.29M' },
  { agent: 'AI agent', method: 'Calculated', unit: '$0.08', total: '$116K' },
  { agent: 'AI-assisted', method: 'Calculated', unit: '$2.35', total: '$1.3M' },
] as const

export const RISKS_AND_OPPORTUNITIES = [
  { tone: 'risk', label: 'Billing escalations increased 18%' },
  { tone: 'risk', label: 'Email CSAT has decreased 5%' },
  { tone: 'risk', label: 'AI fallback rate rose to 7%' },
  // The `fcr` KPI sits at 82% against its 85% target.
  { tone: 'risk', label: 'FCR is 3 points under target' },
  { tone: 'opportunity', label: 'Automate return-status requests' },
  { tone: 'opportunity', label: 'Improve billing knowledge coverage' },
  // The AI-assisted tier in `AGENT_COSTS` costs $2.35 a resolution against the
  // AI agent's $0.08 and carries $1.3M of the spend — the largest lever behind
  // the cost-per-resolution KPI missing its target.
  { tone: 'opportunity', label: 'Shift AI-assisted volume to full automation' },
] as const

export type TopTopicRow = {
  topic: string
  metric: string
  previous: string
  comparison: string
  comparisonTone: 'positive' | 'negative'
  metricTone?: 'warning'
}

export type TopTopicView = {
  id: string
  insight: string
  metricLabel: string
  rows: TopTopicRow[]
}

const TOPIC_NAMES = ['Order status', 'Returns', 'Billing', 'Account access', 'Shipping delays']

export const TOP_TOPIC_VIEWS: TopTopicView[] = [
  {
    id: 'conversation-volume',
    insight: 'Topics with the most conversations',
    metricLabel: 'Volume',
    rows: [
      {
        topic: 'Order status',
        metric: '80,000 (20%)',
        previous: '70,000 (18%)',
        comparison: '▲ 2%',
        comparisonTone: 'positive',
      },
      ...TOPIC_NAMES.slice(1).map((topic) => ({
        topic,
        metric: '70,000 (18%)',
        previous: '60,000 (16%)',
        comparison: '▼ 2%',
        comparisonTone: 'negative' as const,
      })),
    ],
  },
  {
    id: 'cost-per-resolution',
    insight: 'Topics with the highest cost per resolution',
    metricLabel: 'Cost per resolution',
    rows: TOPIC_NAMES.map((topic, index) => ({
      topic,
      metric: index < 2 ? '$6.74' : '$6.70',
      previous: index < 2 ? '$6.44' : '$6.74',
      comparison: index < 2 ? '▲ 5%' : '▼ 2%',
      comparisonTone: index < 2 ? ('negative' as const) : ('positive' as const),
    })),
  },
  {
    id: 'first-contact-resolution',
    insight: 'Topics with the lowest first-contact resolution',
    metricLabel: 'Avg. interactions',
    rows: TOPIC_NAMES.map((topic) => ({
      topic,
      metric: '2.3',
      previous: '2.1',
      comparison: '▼ 5%',
      comparisonTone: 'positive',
    })),
  },
  {
    id: 'sla-achievement',
    insight: 'Topics with the lowest SLA achievement',
    metricLabel: 'Avg. SLA achievement',
    rows: TOPIC_NAMES.map((topic) => ({
      topic,
      metric: '80%',
      previous: '75%',
      comparison: '▲ 5%',
      comparisonTone: 'positive',
    })),
  },
  {
    id: 'csat',
    insight: 'Topics with the lowest CSAT',
    metricLabel: 'CSAT',
    rows: TOPIC_NAMES.map((topic) => ({
      topic,
      metric: '2.3',
      previous: '2.1',
      comparison: '▲ 5%',
      comparisonTone: 'positive',
      metricTone: 'warning',
    })),
  },
]
