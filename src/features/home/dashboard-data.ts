// Mock data + shared types for the Home dashboard. All values are illustrative
// (no backend in this foundation phase). The dashboard is platform-level only —
// it aggregates across all organizations (the org-level view was removed).
import type { AgentChannelKey } from '@/lib/channel-meta'

export type Level = 'platform'

// One channel's value for a single metric. Presentation-only: the value string
// carries its own unit (%, score, or m:ss) so the row renderer stays unit-blind.
export type MetricChannelDatum = {
  key: AgentChannelKey
  value: string
}

export type HealthMetric = {
  key: string
  label: string
  value: string
  // Unsigned relative change, e.g. "4.2%". Direction lives in `up`; whether that
  // direction is good lives in `goodWhenUp`.
  delta: string
  up: boolean
  // true when a rising value is good (resolution, CSAT); false when a falling
  // value is good (escalations, avg handle time).
  goodWhenUp: boolean
  // Set only where the design tints a metric's numbers away from the default
  // ink — CSAT renders in the success teal.
  accentColor?: string
  byChannel: MetricChannelDatum[]
}

// Fixed customer tiers every top-intent breaks down into. `share` is the tier's
// % within a single intent (the three sum to 100); `tickets` is that tier's slice
// of the intent's own `tickets` total, authored as round(share/100 * intent.tickets).
export type BrandKey = 'vip' | 'premium' | 'vendor'
export type IntentBrandDatum = { key: BrandKey; label: string; share: number; tickets: number }

export type LevelData = {
  // The hero band's static read on agent health (mock copy, no LLM).
  healthDigest: { verdict: string; narrative: string }
  metrics: HealthMetric[]
  notifications: { id: string; kind: 'studio' | 'billing' | 'error'; title: string; body: string; time: string }[]
  approvals: {
    id: string
    title: string
    body: string
    // Projected lift, rendered as the teal trending-up pill under the title.
    impact: string
    // Present when the approval is a finished A/B test awaiting publish of the
    // winning variant. `variants[].winner` marks the recommended variant.
    abTest?: {
      winner: string
      // The primary button's copy. Authored rather than derived from `winner`,
      // so the mock controls the exact sentence case the design calls for.
      cta: string
      variants: {
        key: string
        // Short pill label ("Variant B", "Control") and its fill — a per-variant
        // chart hue with no token, so the hex lives with the datum.
        badge: string
        badgeColor: string
        label: string
        // Conversations routed to the variant with its traffic split, e.g.
        // "3,011 (33.6%)".
        conversations: string
        winner: boolean
      }[]
    }
    // Present when the approval originated from a Slack message; renders the
    // original message as an embedded, forwarded-from-Slack quote block.
    slack?: {
      channel: string   // e.g. "#AI-studio"
      author: string    // "Joanna"
      time: string      // "9:16 AM"
      message: string   // the quoted message text
    }
  }[]
  gaps: {
    summary: { articlesGenerated: number; potentialCoverage: string }
    items: { id: string; topic: string; misses: number; trend: 'up' | 'down' }[]
  }
  qa: {
    // Pass rate across every suite, not just the three listed below — the card
    // shows the top suites, so this is authored rather than derived from them.
    passRate: number
    suites: { id: string; suite: string; pass: number; fail: number }[]
    // Test playlists the agent auto-generated and is waiting to run.
    generated: { id: string; name: string; tests: number; kind: 'regression' | 'tone' }[]
  }
  cost: { spend: number; limit: number; unit: string; note: string }
  activity: { id: string; text: string; time: string }[]
  intents: { id: string; name: string; share: number; tickets: number; byBrand: IntentBrandDatum[] }[]
  // The self-improving card: what the agent changed about itself, and how much of
  // the ticket volume those changes cover.
  policies: {
    summary: { improved: number; period: string; coverage: string }
    items: {
      id: string
      title: string
      change: string
      // Signed, e.g. "+48% resolution" or "-32% escalations". The leading sign
      // picks the pill's trend arrow, so it is never dropped.
      impact: string
      status: 'applied' | 'pending'
      scope: string
      time: string
    }[]
  }
  knowledge: {
    summary: { created: number; period: string; coverage: string }
    items: { id: string; title: string; topic: string; articles: number; status: 'draft' | 'saved' }[]
  }
}

export type WidgetId =
  | 'health' | 'qa' | 'gaps' | 'approvals' | 'notifications'
  | 'cost' | 'activity' | 'intents' | 'policies' | 'knowledge'

export type Layout = { left: WidgetId[]; right: WidgetId[] }
export type ColumnKey = keyof Layout

// Runtime list of every widget id (mirrors the WidgetId union). Used to validate
// persisted layouts/views. Keep in sync with WidgetId and the WIDGETS registry.
export const WIDGET_ID_LIST: WidgetId[] = [
  'health', 'qa', 'gaps', 'approvals', 'notifications',
  'cost', 'activity', 'intents', 'policies', 'knowledge',
]

// The five widgets the design's default Home shows. The other five stay
// implemented and reachable from Customize ▸ Add widget — they are simply not
// part of the view you land on.
export const DEFAULT_LAYOUT: Layout = {
  left: ['health', 'policies', 'qa'],
  right: ['approvals', 'knowledge'],
}

export const DATA: Record<Level, LevelData> = {
  platform: {
    healthDigest: {
      verdict: 'Amazing!',
      narrative:
        'Agents are performing well: resolution and CSAT are trending up, while escalations dropped 5.8%, a sign more issues are getting resolved on first contact rather than escalated. That combo suggests real quality gains, not just speed. No action needed now, but worth watching if escalations start creeping back up.',
    },
    metrics: [
      {
        key: 'res',
        label: 'Resolution rate',
        value: '82%',
        delta: '4.2%',
        up: true,
        goodWhenUp: true,
        byChannel: [
          { key: 'widget', value: '82%' },
          { key: 'voice', value: '76%' },
          { key: 'webcall', value: '87%' },
          { key: 'headless', value: '79%' },
        ],
      },
      {
        key: 'csat',
        label: 'CSAT',
        value: '4.6',
        delta: '1.2%',
        up: false,
        goodWhenUp: true,
        accentColor: '#048c80',
        byChannel: [
          { key: 'widget', value: '3.9' },
          { key: 'voice', value: '4.9' },
          { key: 'webcall', value: '4.8' },
          { key: 'headless', value: '3.7' },
        ],
      },
      {
        // NOTE: the frame reads 18% here, but its channel rows are 8/7/5/3% — no
        // weighting of those yields 18. Authored as 7% so the mock is internally
        // consistent (see spec, "Authored values").
        key: 'esc',
        label: 'Escalations',
        value: '7%',
        delta: '5.8%',
        up: false,
        goodWhenUp: false,
        byChannel: [
          { key: 'widget', value: '8%' },
          { key: 'voice', value: '7%' },
          { key: 'webcall', value: '5%' },
          { key: 'headless', value: '3%' },
        ],
      },
      {
        key: 'aht',
        label: 'Avg handle time',
        value: '1:48',
        delta: '12%',
        up: false,
        goodWhenUp: false,
        byChannel: [
          { key: 'widget', value: '2:39' },
          { key: 'voice', value: '4:30' },
          { key: 'webcall', value: '3:10' },
          { key: 'headless', value: '1:32' },
        ],
      },
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
        body: 'Variant B resolved refund request without human handoff. Approve to publish the winner to all traffic.',
        impact: '+14% resolution',
        abTest: {
          winner: 'Variant B',
          cta: 'Publish variant B',
          variants: [
            {
              key: 'b',
              badge: 'Variant B',
              badgeColor: '#be297b',
              label: 'Auto Password Reset Account Authentication',
              conversations: '3,011 (33.6%)',
              winner: true,
            },
            {
              key: 'control',
              badge: 'Control',
              badgeColor: '#385075',
              label: 'Live',
              conversations: '3,000 (33.2%)',
              winner: false,
            },
            {
              key: 'a',
              badge: 'Variant A',
              badgeColor: '#2f69c7',
              label: 'Auto Ticket Creation',
              conversations: '2,989 (33.1%)',
              winner: false,
            },
          ],
        },
      },
      {
        id: 'a2',
        title: 'Self-improving plan needs approval for Service Cancellation Policy',
        body: 'Resolving ~540 of 800 cancellation tickets saves ~90 human agent hours/month. A structured retention offer converts better than ad-hoc replies, even a 5% save rate moves revenue.',
        impact: '+48% resolution',
        slack: {
          channel: '#AI-studio',
          author: 'Joanna',
          time: '9:16 AM',
          message: 'Can you approve this self-improving retention plan? This is for the Service Cancellation Policy.',
        },
      },
    ],
    gaps: {
      summary: { articlesGenerated: 58, potentialCoverage: '11,004' },
      items: [
        { id: 'g0', topic: 'Service cancellations', misses: 51, trend: 'up' },
        { id: 'g1', topic: 'Refund eligibility windows', misses: 42, trend: 'up' },
        { id: 'g2', topic: 'Enterprise SSO setup', misses: 28, trend: 'down' },
        { id: 'g3', topic: 'Data residency (EU)', misses: 19, trend: 'up' },
      ],
    },
    qa: {
      passRate: 93,
      suites: [
        { id: 'q1', suite: 'Billing & refunds', pass: 118, fail: 6 },
        { id: 'q2', suite: 'Account management', pass: 94, fail: 2 },
        { id: 'q3', suite: 'Refund request', pass: 64, fail: 2 },
      ],
      generated: [
        { id: 'gen1', name: 'Regression test', tests: 42, kind: 'regression' },
        { id: 'gen2', name: 'Tone of voice test', tests: 18, kind: 'tone' },
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
      {
        id: 'in1', name: 'Order status', share: 34, tickets: 4200,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 15, tickets: 630 },
          { key: 'premium', label: 'Premium', share: 25, tickets: 1050 },
          { key: 'vendor', label: 'Vendor', share: 60, tickets: 2520 },
        ],
      },
      {
        id: 'in2', name: 'Refund request', share: 22, tickets: 2720,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 55, tickets: 1496 },
          { key: 'premium', label: 'Premium', share: 30, tickets: 816 },
          { key: 'vendor', label: 'Vendor', share: 15, tickets: 408 },
        ],
      },
      {
        id: 'in3', name: 'Account access', share: 18, tickets: 2220,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 30, tickets: 666 },
          { key: 'premium', label: 'Premium', share: 45, tickets: 999 },
          { key: 'vendor', label: 'Vendor', share: 25, tickets: 555 },
        ],
      },
      {
        id: 'in4', name: 'Product info', share: 14, tickets: 1600,
        byBrand: [
          { key: 'vip', label: 'VIP', share: 20, tickets: 320 },
          { key: 'premium', label: 'Premium', share: 30, tickets: 480 },
          { key: 'vendor', label: 'Vendor', share: 50, tickets: 800 },
        ],
      },
    ],
    policies: {
      summary: { improved: 18, period: 'Last 30 days', coverage: '12,479 tickets covered' },
      items: [
        { id: 'p1', title: 'Refund escalation policy', change: 'Auto-approve refunds under $50 instead of routing to a human.', impact: '-32% escalations', status: 'applied', scope: 'Widget channel', time: '2 hr ago' },
        { id: 'p2', title: 'VIP tone guardrail', change: 'Enforce empathetic phrasing for enterprise customers', impact: '+.3 CSAT', status: 'applied', scope: 'All channels', time: '4 hr ago' },
        { id: 'p3', title: 'Service cancellation policy improvement', change: 'Offer a retention offer to improve resolution', impact: '+48% resolution', status: 'pending', scope: 'All channels', time: '4 hr ago' },
      ],
    },
    knowledge: {
      summary: { created: 24, period: 'Last 30 days', coverage: '12,479 tickets covered' },
      items: [
        { id: 'kc1', title: 'How to resolve address verification issues when opening a checking account', topic: 'Reactivate account', articles: 3, status: 'draft' },
        { id: 'kc2', title: 'Resolving Account Suspension issues: A step by step guide to resolution', topic: 'Account suspension', articles: 3, status: 'saved' },
        { id: 'kc3', title: 'How to verify bank account verification issues', topic: 'Bank account', articles: 3, status: 'saved' },
      ],
    },
  },
}
