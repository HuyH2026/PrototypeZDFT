// Mock data + shared types for the Home dashboard. All values are illustrative
// (no backend in this foundation phase). The dashboard is platform-level only —
// it aggregates across all organizations (the org-level view was removed).

export type Level = 'platform'

export type HealthMetric = {
  key: string
  label: string
  value: string
  delta: string
  up: boolean
  good: boolean
}

export type HealthState = 'good' | 'attention' | 'critical'

// Resolution rate broken out by channel family (mirrors CHANNEL_SECTIONS in
// src/lib/channel-meta.ts). `share` is the % of total volume on that family.
export type ChannelResolution = {
  key: 'messaging' | 'email' | 'voice' | 'headless'
  label: string
  rate: number
  delta: string
  up: boolean
  good: boolean
  share: number
}

export type LevelData = {
  score: number
  healthState: HealthState
  // AI-generated one-line read on the current agent health (mock).
  aiSummary: string
  trend: number[]
  metrics: HealthMetric[]
  resolutionByChannel: ChannelResolution[]
  notifications: { id: string; kind: 'studio' | 'billing' | 'error'; title: string; body: string; time: string }[]
  approvals: {
    id: string
    title: string
    body: string
    impact: string
    author: string
    // Set when a human co-worker (not an agent) raised the approval — renders a
    // name/role attribution and "review and approve" framing.
    person?: { name: string; role: string }
    // Present when the approval is a finished A/B test awaiting publish of the
    // winning variant. `variants[].winner` marks the recommended variant.
    abTest?: {
      winner: string
      confidence: string
      variants: { key: string; label: string; metric: string; value: string; winner: boolean }[]
    }
  }[]
  gaps: {
    summary: { articlesGenerated: number; potentialCoverage: string }
    items: { id: string; topic: string; misses: number; trend: 'up' | 'down' }[]
  }
  qa: {
    suites: { id: string; suite: string; pass: number; fail: number }[]
    // Test playlists the agent auto-generated and is waiting to run.
    generated: { id: string; name: string; tests: number; kind: 'regression' | 'tone' }[]
  }
  cost: { spend: number; limit: number; unit: string; note: string }
  activity: { id: string; text: string; time: string }[]
  intents: { id: string; name: string; share: number }[]
  policies: {
    summary: { improved: number; lift: string; period: string }
    items: { id: string; title: string; change: string; impact: string; status: 'applied' | 'proposed'; scope: string; time: string }[]
  }
  knowledge: {
    summary: { created: number; coverage: string; period: string }
    items: { id: string; title: string; topic: string; articles: number; status: 'draft' | 'published' }[]
  }
}

export type WidgetId =
  | 'health' | 'qa' | 'gaps' | 'approvals' | 'notifications'
  | 'cost' | 'activity' | 'intents' | 'policies' | 'knowledge'

export type Layout = { left: WidgetId[]; right: WidgetId[] }
export type ColumnKey = keyof Layout

export const DEFAULT_LAYOUT: Layout = {
  left: ['health', 'policies', 'qa', 'gaps'],
  right: ['approvals', 'knowledge', 'notifications'],
}

export const DATA: Record<Level, LevelData> = {
  platform: {
    score: 94,
    healthState: 'good',
    aiSummary: 'Agents are performing well. Resolution and CSAT are trending up, and escalations are down 1.2% — no action needed right now.',
    trend: [70, 74, 72, 80, 78, 86, 90, 88, 92, 94],
    metrics: [
      { key: 'res', label: 'Resolution rate', value: '82%', delta: '+3.1%', up: true, good: true },
      { key: 'csat', label: 'CSAT', value: '4.6', delta: '+0.2', up: true, good: true },
      { key: 'esc', label: 'Escalations', value: '6.4%', delta: '-1.2%', up: false, good: true },
      { key: 'aht', label: 'Avg handle time', value: '1m 48s', delta: '-9s', up: false, good: true },
    ],
    resolutionByChannel: [
      { key: 'messaging', label: 'Messaging', rate: 86, delta: '+3.4%', up: true, good: true, share: 58 },
      { key: 'email', label: 'Email', rate: 79, delta: '+1.8%', up: true, good: true, share: 24 },
      { key: 'voice', label: 'Voice', rate: 71, delta: '-2.1%', up: false, good: false, share: 14 },
      { key: 'headless', label: 'Headless', rate: 88, delta: '+0.6%', up: true, good: true, share: 4 },
    ],
    notifications: [
      { id: 'n1', kind: 'studio', title: 'Studio build is ready', body: 'Voice agent v12 finished training and is ready to deploy.', time: '12m ago' },
      { id: 'n2', kind: 'billing', title: 'Billing summary is ready', body: 'July invoice is available across 4 organizations.', time: '1h ago' },
      { id: 'n3', kind: 'error', title: '3 integration errors', body: 'Zendesk sync failing for SpaceX and 2 others.', time: '2h ago' },
    ],
    approvals: [
      {
        id: 'a1',
        title: 'A/B test finished — Refund policy',
        body: 'Variant A resolved refund requests without human handoff. Approve to publish the winner to all traffic.',
        impact: '+6.2% resolution',
        author: 'Experiments',
        abTest: {
          winner: 'Variant A',
          confidence: '98% confidence · 12,400 conversations',
          variants: [
            { key: 'a', label: 'Variant A · Auto-approve under $50', metric: 'Resolution', value: '88%', winner: true },
            { key: 'b', label: 'Variant B · Always confirm with agent', metric: 'Resolution', value: '82%', winner: false },
          ],
        },
      },
      {
        id: 'a2',
        title: 'Sunny created a self-improving plan',
        body: 'Add 8 macros and reroute refund intents to the billing skill. Review and approve the plan to let the agent apply it.',
        impact: '+4% resolution',
        author: 'Sunny Kong',
        person: { name: 'Sunny Kong', role: 'Support Lead' },
      },
      { id: 'a3', title: 'New knowledge contents created', body: 'Total coverage 12,470 tickets. Review and create content snippets.', impact: '12 gaps closed', author: 'Knowledge agent' },
    ],
    gaps: {
      summary: { articlesGenerated: 58, potentialCoverage: '11,004' },
      items: [
        { id: 'g1', topic: 'Refund eligibility windows', misses: 42, trend: 'up' },
        { id: 'g2', topic: 'Enterprise SSO setup', misses: 28, trend: 'down' },
        { id: 'g3', topic: 'Data residency (EU)', misses: 19, trend: 'up' },
      ],
    },
    qa: {
      suites: [
        { id: 'q1', suite: 'Billing & refunds', pass: 118, fail: 6 },
        { id: 'q2', suite: 'Account management', pass: 94, fail: 2 },
        { id: 'q3', suite: 'Voice flows', pass: 61, fail: 11 },
      ],
      generated: [
        { id: 'gen1', name: 'Regression test', tests: 42, kind: 'regression' },
        { id: 'gen2', name: 'Tone of Voice test', tests: 18, kind: 'tone' },
      ],
    },
    cost: { spend: 8420, limit: 12000, unit: '$', note: 'Across all organizations this month' },
    activity: [
      { id: 'ac1', text: 'Orchestrator deployed voice agent v12', time: '12m ago' },
      { id: 'ac2', text: 'Tesla org reached 80% resolution rate', time: '1h ago' },
      { id: 'ac3', text: 'Knowledge base synced 240 new articles', time: '3h ago' },
      { id: 'ac4', text: 'A/B test “Refund tone” concluded', time: '6h ago' },
    ],
    intents: [
      { id: 'in1', name: 'Order status', share: 34 },
      { id: 'in2', name: 'Refund request', share: 22 },
      { id: 'in3', name: 'Account access', share: 18 },
      { id: 'in4', name: 'Product info', share: 14 },
    ],
    policies: {
      summary: { improved: 18, lift: '+5.2% resolution', period: 'Last 30 days' },
      items: [
        { id: 'p1', title: 'Refund escalation policy', change: 'Auto-approve refunds under $50 instead of routing to a human.', impact: '-32% escalations', status: 'applied', scope: 'All organizations', time: '2h ago' },
        { id: 'p2', title: 'VIP tone guardrail', change: 'Enforce empathetic phrasing for enterprise customers.', impact: '+0.3 CSAT', status: 'applied', scope: '6 channels', time: '1d ago' },
        { id: 'p3', title: 'Data residency handling', change: 'Route EU data questions to the compliance skill.', impact: '12 gaps closed', status: 'proposed', scope: 'EU customers', time: '3h ago' },
      ],
    },
    knowledge: {
      summary: { created: 24, coverage: '12,470 tickets', period: 'Last 30 days' },
      items: [
        { id: 'kc1', title: 'How to Resolve Address Verification Issues When Opening a Checking Account', topic: 'Create New Ticket', articles: 3, status: 'draft' },
        { id: 'kc2', title: 'Resolving Account Suspension Issues: A Step-by-Step Guide', topic: 'Account Suspension Inquiry', articles: 3, status: 'published' },
        { id: 'kc3', title: 'How to Resolve Bank Account Verification Issues', topic: 'Bank Account Verification', articles: 3, status: 'draft' },
        { id: 'kc4', title: 'How to Convert a Traditional IRA to a Roth IRA', topic: 'IRA Conversion', articles: 3, status: 'published' },
        { id: 'kc5', title: 'Understanding and Managing Your Investment Settings', topic: 'Investing Guidance', articles: 3, status: 'draft' },
      ],
    },
  },
}
