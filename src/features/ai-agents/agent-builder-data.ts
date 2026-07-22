// Mock data + types for the Agent Builder screen. All values are illustrative
// (no backend). The Widget channel matches the Figma design exactly; the other
// three channels carry plausible authored numbers so switching channels visibly
// changes the metrics and rows.

export type ChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'
export type Trend = 'up' | 'down'

// One metric card. `delta`/`trend` drive the pill (↗/↘ + green/red tint); `good`
// decides the tint independent of direction (a falling Fallback is good → green).
// `accent` renders the value itself in green (CSAT in the Figma frame).
export type Metric = {
  key: string
  label: string
  value: string      // formatted, e.g. "21,590", "$706.8K", "4.1"
  sub?: string       // secondary figure shown beside the value (Resolutions → "80%")
  delta: string      // e.g. "0.3%"
  trend: Trend       // 'up' → ↗, 'down' → ↘
  good: boolean      // true → green pill, false → red pill
  accent?: boolean   // true → value text rendered green
}

// One agent row. `deflectionRate` is an authored display string (matches the Figma
// frame, which shows a headline rate independent of the raw counts) — not derived.
export type Agent = {
  id: string
  name: string
  on: boolean          // default toggle state for this channel
  isSubagent: boolean  // included in the "Active subagents" tab
  type: string         // "Knowledge Retrieval" | "Fallback" | "With intent"
  conversations: number
  deflections: number
  deflectionRate: string
  csat: number
  tags: string[]
}

export type Channel = {
  key: ChannelKey
  label: string        // "Widget" | "Voice" | "Web Call" | "Headless"
  metrics: Metric[]    // exactly 5, keys: chats, resolutions, fallback, csat, cost
  agents: Agent[]
}

export const CHANNELS: Channel[] = [
  {
    key: 'widget',
    label: 'Widget',
    metrics: [
      { key: 'chats', label: 'Total Chats', value: '21,590', delta: '0.3%', trend: 'down', good: false },
      { key: 'resolutions', label: 'Resolutions', value: '19,673', sub: '80%', delta: '4.2%', trend: 'up', good: true },
      { key: 'fallback', label: 'Fallback', value: '486', delta: '1.8%', trend: 'down', good: true },
      { key: 'csat', label: 'CSAT', value: '4.1', delta: '1.7%', trend: 'down', good: false, accent: true },
      { key: 'cost', label: 'Cost Savings', value: '$706.8K', delta: '3.4%', trend: 'up', good: true },
    ],
    agents: [
      { id: 'w1', name: 'Knowledge Retrieval', on: true, isSubagent: false, type: 'Knowledge Retrieval', conversations: 3000, deflections: 2500, deflectionRate: '95%', csat: 3, tags: ['member_center'] },
      { id: 'w2', name: 'Fallback', on: true, isSubagent: false, type: 'Fallback', conversations: 3000, deflections: 2500, deflectionRate: '95%', csat: 3, tags: ['member_center'] },
      { id: 'w3', name: 'Service cancellation', on: false, isSubagent: true, type: 'With intent', conversations: 3000, deflections: 2500, deflectionRate: '95%', csat: 3, tags: ['member_center'] },
    ],
  },
  {
    key: 'voice',
    label: 'Voice',
    metrics: [
      { key: 'chats', label: 'Total Calls', value: '8,120', delta: '2.1%', trend: 'up', good: true },
      { key: 'resolutions', label: 'Resolutions', value: '6,900', sub: '85%', delta: '1.4%', trend: 'up', good: true },
      { key: 'fallback', label: 'Fallback', value: '212', delta: '0.9%', trend: 'up', good: false },
      { key: 'csat', label: 'CSAT', value: '4.3', delta: '0.5%', trend: 'up', good: true, accent: true },
      { key: 'cost', label: 'Cost Savings', value: '$318.2K', delta: '2.7%', trend: 'up', good: true },
    ],
    agents: [
      { id: 'v1', name: 'Call routing', on: true, isSubagent: false, type: 'Knowledge Retrieval', conversations: 4200, deflections: 3600, deflectionRate: '86%', csat: 4, tags: ['support_line'] },
      { id: 'v2', name: 'Voicemail triage', on: false, isSubagent: true, type: 'With intent', conversations: 1800, deflections: 1200, deflectionRate: '67%', csat: 4, tags: ['support_line'] },
    ],
  },
  {
    key: 'webcall',
    label: 'Web Call',
    metrics: [
      { key: 'chats', label: 'Total Calls', value: '4,300', delta: '1.2%', trend: 'up', good: true },
      { key: 'resolutions', label: 'Resolutions', value: '3,655', sub: '85%', delta: '0.8%', trend: 'up', good: true },
      { key: 'fallback', label: 'Fallback', value: '128', delta: '1.1%', trend: 'down', good: true },
      { key: 'csat', label: 'CSAT', value: '4.4', delta: '0.3%', trend: 'up', good: true, accent: true },
      { key: 'cost', label: 'Cost Savings', value: '$164.5K', delta: '1.9%', trend: 'up', good: true },
    ],
    agents: [
      { id: 'c1', name: 'Web escalation', on: true, isSubagent: true, type: 'With intent', conversations: 2100, deflections: 1700, deflectionRate: '81%', csat: 4, tags: ['web_widget'] },
    ],
  },
  {
    key: 'headless',
    label: 'Headless',
    metrics: [
      { key: 'chats', label: 'Total Sessions', value: '12,004', delta: '3.6%', trend: 'up', good: true },
      { key: 'resolutions', label: 'Resolutions', value: '10,320', sub: '86%', delta: '2.2%', trend: 'up', good: true },
      { key: 'fallback', label: 'Fallback', value: '640', delta: '2.4%', trend: 'down', good: true },
      { key: 'csat', label: 'CSAT', value: '4.0', delta: '0.6%', trend: 'down', good: false, accent: true },
      { key: 'cost', label: 'Cost Savings', value: '$402.1K', delta: '4.1%', trend: 'up', good: true },
    ],
    agents: [
      { id: 'h1', name: 'API resolver', on: true, isSubagent: false, type: 'Knowledge Retrieval', conversations: 5000, deflections: 4300, deflectionRate: '86%', csat: 4, tags: ['api'] },
      { id: 'h2', name: 'Intent classifier', on: true, isSubagent: false, type: 'With intent', conversations: 3200, deflections: 2600, deflectionRate: '81%', csat: 3, tags: ['api'] },
      { id: 'h3', name: 'Fallback', on: false, isSubagent: false, type: 'Fallback', conversations: 1500, deflections: 900, deflectionRate: '60%', csat: 3, tags: ['api'] },
      { id: 'h4', name: 'Enrichment', on: true, isSubagent: true, type: 'With intent', conversations: 2304, deflections: 1800, deflectionRate: '78%', csat: 4, tags: ['api'] },
    ],
  },
]
