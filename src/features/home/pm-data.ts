// Standalone deterministic mock for the PM dashboard view. NOT derived from
// DATA.platform — the PM view surfaces product-signal-from-support (revenue at
// risk, opportunity, calculated priority, delivery lifecycle). No backend, no
// Date.now(): PM_NOW anchors all date math so filtering is deterministic.

// Anchor "now" for date-range filtering (matches the Figma's ~mid-June window).
export const PM_NOW = new Date('2026-06-15T00:00:00Z').getTime()
const DAY = 24 * 60 * 60 * 1000

export type PmTrend = 'up' | 'down'
export type LifecycleStageKey = 'detected' | 'planned' | 'in-dev' | 'shipped'
export type SpotlightFilter = 'trending' | 'at-risk' | 'asking'
export type OppType = 'request' | 'bug'

export type PmKpi = {
  key: string; label: string; value: string; caption: string
  delta: string; deltaGood: boolean; up: boolean
}

// The Spotlight is three distinct curated lists — one per tab — with different
// right-hand columns, not a single list filtered three ways. Each row shares a
// rank + title + meta line; the tabs differ in what they surface on the right.
export type SpotlightTag = 'bug' | 'gap'
// Trending: momentum view — lifecycle stage + a week-over-week trend %.
export type TrendingItem = {
  id: string; rank: number; title: string; meta: string
  stage: LifecycleStageKey; trendPct: string; trendGood: boolean; up: boolean
}
// At risk: retention view — a BUG/GAP tag + the revenue at risk.
export type AtRiskItem = {
  id: string; rank: number; title: string; meta: string
  tag: SpotlightTag; amount: string
}
// Asking: growth view — the deal it blocks + revenue asking.
export type AskingItem = {
  id: string; rank: number; title: string; meta: string
  stage: LifecycleStageKey; amount: string
}
export type SpotlightData = {
  trending: TrendingItem[]
  atRisk: AtRiskItem[]
  asking: AskingItem[]
}
export type LifecycleStage = {
  key: LifecycleStageKey; label: string; amount: string; amountValue: number; recCount: number
}
export type Opportunity = {
  id: string; type: OppType; title: string; description: string; quote: string
  impact: number
  revenue: string; revenueState: 'asking' | 'at-risk'
  volumeTrend: number[]; volumePct: string; volumeGood: boolean; volumeUp: boolean
  customers: number; plans: string[]; stage: LifecycleStageKey
  firstSeen: number; firstSeenLabel: string
}
export type PmData = {
  kpis: PmKpi[]
  spotlight: SpotlightData
  lifecycle: LifecycleStage[]
  opportunities: Opportunity[]
}

// Per-tab accent (matches the Figma: amber Trending, magenta At risk, blue Asking).
export const SPOTLIGHT_TAB_COLOR: Record<SpotlightFilter, string> = {
  trending: '#df8600',
  'at-risk': '#bc2f7c',
  asking: '#1f73b7',
}

export const LIFECYCLE_LABEL: Record<LifecycleStageKey, string> = {
  detected: 'Detected',
  planned: 'Planned',
  'in-dev': 'In dev',
  shipped: 'Shipped',
}

export const SPOTLIGHT_TABS: { key: SpotlightFilter; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'at-risk', label: 'At risk' },
  { key: 'asking', label: 'Asking' },
]

export const PM_DATA: PmData = {
  kpis: [
    { key: 'synth', label: 'Conversations synthesized', value: '3,184', caption: 'last 30d · 47 rec.', delta: '5%', deltaGood: true, up: true },
    { key: 'spiking', label: 'Spiking now', value: '7', caption: '2 new this week', delta: '30%', deltaGood: false, up: true },
    { key: 'at-risk', label: 'ARR at risk', value: '$1.36M', caption: 'churn risks, bugs & gaps', delta: '15%', deltaGood: false, up: true },
    { key: 'asking', label: 'ARR asking', value: '$912K', caption: 'opportunity & request', delta: '12%', deltaGood: true, up: true },
    { key: 'realized', label: 'Realized impact', value: '$408K', caption: 'shipped', delta: '32%', deltaGood: true, up: true },
  ],
  spotlight: {
    trending: [
      { id: 't1', rank: 1, title: 'Android 15 app crashes on launch after update', meta: '206 conversations · churn risk $120K', stage: 'in-dev', trendPct: '140%', trendGood: false, up: true },
      { id: 't2', rank: 2, title: 'Bulk CSV export times out past ~10k rows', meta: '91 conversations · churn risk $190K', stage: 'planned', trendPct: '38%', trendGood: false, up: true },
      { id: 't3', rank: 3, title: 'SCIM auto-provisioning for user lifecycle', meta: '64 conversations · opportunity $610K', stage: 'planned', trendPct: '23%', trendGood: true, up: true },
    ],
    atRisk: [
      { id: 'r1', rank: 1, title: 'SAML SSO drops users on silent token refresh', meta: '71 Enterprise accounts · Impact 80', tag: 'bug', amount: '$840K' },
      { id: 'r2', rank: 2, title: 'Bulk CSV export times out past ~10k rows', meta: '28 Enterprise accounts · Impact 37', tag: 'gap', amount: '$190K' },
      { id: 'r3', rank: 3, title: 'SCIM auto-provisioning for user lifecycle', meta: '49 Mid-market accounts · Impact 30', tag: 'bug', amount: '$150K' },
    ],
    asking: [
      { id: 'a1', rank: 1, title: 'Salesforce two-way contact sync', meta: 'Deal · Helix Pharma ($96K) · Impact 68', stage: 'planned', amount: '$610K' },
      { id: 'a2', rank: 2, title: 'SCIM auto-provisioning for user lifecycle', meta: 'Deal · Orbit Labs ($184K) · Impact 67', stage: 'planned', amount: '$280K' },
      { id: 'a3', rank: 3, title: 'Dark mode', meta: 'Deal · Free users (free) · Impact 27', stage: 'detected', amount: '$75K' },
    ],
  },
  lifecycle: [
    { key: 'detected', label: 'Detected', amount: '$232K', amountValue: 232, recCount: 26 },
    { key: 'planned', label: 'Planned', amount: '$1.08M', amountValue: 1080, recCount: 14 },
    { key: 'in-dev', label: 'In dev', amount: '$846K', amountValue: 846, recCount: 7 },
    { key: 'shipped', label: 'Shipped', amount: '$408K', amountValue: 408, recCount: 3 },
  ],
  opportunities: [
    {
      id: 'o1', type: 'request',
      title: 'SAML SSO drops users on silent token refresh',
      description: 'When a session token expires and the app silently attempts to refresh it, the SAML SSO flow fails.',
      quote: 'Every 60 minutes our whole org gets kicked back to login.',
      impact: 88, revenue: '$610K', revenueState: 'asking',
      volumeTrend: [40, 44, 48, 55, 60, 72, 85, 96, 108, 120], volumePct: '70%', volumeGood: true, volumeUp: false,
      customers: 130, plans: ['Annual plan', 'Pro • Enterprise'], stage: 'in-dev',
      firstSeen: PM_NOW - 3 * DAY, firstSeenLabel: 'First seen Jun 12',
    },
    {
      id: 'o2', type: 'bug',
      title: 'SCIM auto-provisioning for user lifecycle',
      description: 'Users are automatically provisioned and deprovisioned via SCIM, keeping accounts in sync with the identity provider throughout the user lifecycle.',
      quote: "We can't roll you out org-wide until provisioning is automated.",
      impact: 78, revenue: '$455K', revenueState: 'at-risk',
      volumeTrend: [120, 110, 100, 92, 80, 66, 52, 40, 30, 22], volumePct: '80%', volumeGood: false, volumeUp: true,
      customers: 75, plans: ['Annual plan', 'Pro • Enterprise'], stage: 'detected',
      firstSeen: PM_NOW - 3 * DAY, firstSeenLabel: 'First seen Jun 12',
    },
    {
      id: 'o3', type: 'request',
      title: 'Bulk CSV export times out past ~10k rows',
      description: 'Large exports exceed the request timeout, forcing customers to split files manually or abandon the export.',
      quote: 'We schedule weekly exports and half of them silently fail now.',
      impact: 64, revenue: '$190K', revenueState: 'at-risk',
      volumeTrend: [10, 14, 18, 22, 30, 38, 47, 58, 70, 91], volumePct: '38%', volumeGood: false, volumeUp: true,
      customers: 44, plans: ['Monthly plan', 'Growth'], stage: 'planned',
      firstSeen: PM_NOW - 40 * DAY, firstSeenLabel: 'First seen May 6',
    },
  ],
}
