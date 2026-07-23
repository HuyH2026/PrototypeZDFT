// Mock data for the A/B Test Results tab. Values are exact from Figma frame
// 755:170380 ("06 Experiments expanded" → Results). No backend.

export const CONTROL_COLOR = '#01567a'
export const VARIANT_A_COLOR = '#e05c34'
export const VARIANT_B_COLOR = '#2f69c7'
export const POSITIVE_COLOR = '#048c80'
export const NEGATIVE_COLOR = '#e53112'

export type WinnerVariant = {
  key: string
  badge: string
  badgeColor: string
  title: string
  detail: string
  isWinner?: boolean
}

export type ResultsRecommendation = {
  title: string
  bullets: string[]
}

export type TrafficSplitSlice = { name: string; value: number; pct: string; color: string }

export type AvgDeltaEntry = { name: string; delta: string; color: string; positive: boolean }

export type MetricBarItem = {
  name: 'Control' | 'Variant A' | 'Variant B'
  value: number
  display: string
  delta?: string
  positive?: boolean
}

export type MetricCard = {
  key: string
  title: string
  significant: boolean
  domainMax: number
  ticks: number[]
  tickSuffix?: string
  items: MetricBarItem[]
}

const BAR_COLORS = { Control: CONTROL_COLOR, 'Variant A': VARIANT_A_COLOR, 'Variant B': VARIANT_B_COLOR } as const

export { BAR_COLORS }

export const RESOLUTIONS_TABS = ['Conversations', 'Resolutions', 'Sentiment', 'CSAT', 'Duration', 'AI QA'] as const

export type ResolutionsPoint = { bucket: string; Control: number; 'Variant A': number; 'Variant B': number }

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
