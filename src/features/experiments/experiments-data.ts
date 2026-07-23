// Mock data + types for the Experiments A/B Test screen. Values are exact from
// Figma frame 747:86296 (no backend).

export type ABMetric = {
  key: string
  label: string
  value: string        // "5", "55,987", "41,312", "4.1"
  sub?: string         // secondary figure beside the value ("80%")
  accent?: 'green'     // render the value in green (CSAT)
}

export type ExperimentStatus = 'not-started' | 'running' | 'completed' | 'canceled'

export type Experiment = {
  id: string
  name: string
  status: ExperimentStatus
  intent: string
  description: string
  splits: number[]     // traffic split percentages, e.g. [50, 50] or [33, 33, 33]
}

export const METRICS: ABMetric[] = [
  { key: 'tests', label: 'Total Tests', value: '5' },
  { key: 'conversations', label: 'Total conversations', value: '55,987' },
  { key: 'resolutions', label: 'Resolutions', value: '41,312', sub: '80%' },
  { key: 'csat', label: 'CSAT', value: '4.1', accent: 'green' },
]

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'e1',
    name: 'Test',
    status: 'not-started',
    intent: 'Log in troubleshooting',
    description: 'Explore which login experience leads to the highest conversion.',
    splits: [50, 50],
  },
  {
    id: 'e2',
    name: 'Abandoned Cart Recovery',
    status: 'running',
    intent: 'Call users with abandoned carts',
    description:
      'Explore which outbound calls experience leads to the highest user satisfaction.',
    splits: [33, 33, 33],
  },
  {
    id: 'e3',
    name: 'Conversation recap strategy',
    status: 'completed',
    intent: 'Update shipping address',
    description: 'Explore which login experience leads to the highest CSAT rating.',
    splits: [33, 33, 33],
  },
  {
    id: 'e4',
    name: 'Self Service Checkout',
    status: 'completed',
    intent: 'Update Billing address',
    description: 'Test emails for the highest user satisfaction.',
    splits: [50, 50],
  },
  {
    id: 'e5',
    name: 'Guided Troubleshoot Flow',
    status: 'canceled',
    intent: 'Replacement Card',
    description: 'Explore which login experience leads to the best customer retention.',
    splits: [50, 30, 20],
  },
]

// ── A/B Test Setup screen (presentational, exact copy from Figma 756:86465) ──

export type SetupVariant = {
  key: string
  badge: string
  badgeColor: string
  description: string
  agent: string
  traffic: number
}

export type SummaryVariant = {
  badge: string
  badgeColor: string
  title: string
  body: string
}

export type Recommendation = {
  title: string
  body: string
}

export const DEFAULT_TEST_NAME = 'Login fix method comparison'
export const DEFAULT_TEST_DESCRIPTION =
  'Explore which login troubleshooting experience leads to the highest user satisfaction.'

export const CHANNEL_OPTIONS = ['Widget', 'Email', 'Voice', 'Messaging']

export const WINNER_METRICS = ['Deflection', 'Sentiment']

export const TIME_ZONE = 'Pacific time GTM -8, Los Angeles'

export const SETUP_VARIANTS: SetupVariant[] = [
  {
    key: 'control',
    badge: 'Control',
    badgeColor: '#01567a',
    description: 'The current live agent that acts as the baseline.',
    agent: 'Login troubleshooting',
    traffic: 50,
  },
  {
    key: 'variant-a',
    badge: 'Variant A',
    badgeColor: '#e05c34',
    description: 'The new agent you want to test against the control.',
    agent: 'Auto Reset Password',
    traffic: 50,
  },
]

export const SUMMARY_VARIANTS: SummaryVariant[] = [
  {
    badge: 'Control',
    badgeColor: '#01567a',
    title: 'Manual login',
    body: 'All login-related tickets are routed to the Authentication Support queue and handled entirely by human agents. They manually verify user identities, reset passwords, and resolve access issues. Automation is limited to basic confirmation messages.',
  },
  {
    badge: 'Variant A',
    badgeColor: '#e05c34',
    title: 'Fully automated login assistance',
    body: 'An AI-driven system identifies and resolves most login issues automatically through chat or self-service. Users can reset passwords, unlock accounts, or recover credentials without agent help. Only complex or security-sensitive cases are escalated to support.',
  },
]

export const RECOMMENDATION: Recommendation = {
  title: 'Test duration: 2 weeks',
  body: 'This duration captures both weekday and weekend user behavior, ensuring enough data to reach statistically meaningful results for deflection and CSAT metrics.',
}
