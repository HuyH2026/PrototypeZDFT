// Mock data + types for the Orchestrator screen. Values are illustrative
// (no backend) and match the Figma frame exactly.

export type OrchMetric = {
  key: string
  label: string
  value: string          // "32,128", "98%", "20,109", "69%"
  sub?: string           // secondary figure beside the value ("80%")
  delta?: string         // pill delta ("10%")
  trend?: 'up'           // ↗ (only upward appears in the frame)
  sentiment?: boolean    // true → green smiley before the value
}

// Drives the NodeChips icon color.
export type NodeKind = 'sentiment' | 'event' | 'csat'

export type Automation = {
  id: string
  name: string
  updatedLabel: string        // "Last updated: Jan 4, 2024 9:25 AM by Brandon Mango"
  primaryNode: string         // "Sentiment Detection"
  primaryNodeKind: NodeKind
  extraNodes: number          // the "+4"
  description: string
  runs: number                // 200
  successRate: number | null  // 99 → bar; null → "n/a"
  on: boolean
}

export const METRICS: OrchMetric[] = [
  { key: 'runs', label: 'Total runs', value: '32,128' },
  { key: 'success', label: 'Success rate', value: '98%', delta: '10%', trend: 'up' },
  { key: 'triggered', label: 'Conversations triggered', value: '20,109', sub: '80%' },
  { key: 'sentiment', label: 'Positive sentiment', value: '69%', sentiment: true },
]

const UPDATED = 'Last updated: Jan 4, 2024 9:25 AM by Brandon Mango'

export const AUTOMATIONS: Automation[] = [
  {
    id: 'a1',
    name: 'Call users with issues',
    updatedLabel: UPDATED,
    primaryNode: 'Sentiment Detection',
    primaryNodeKind: 'sentiment',
    extraNodes: 4,
    description:
      'When a customer is having issues, trigger a follow-up call to offer assistance. After the call, update Hubspot with the call results.',
    runs: 200,
    successRate: 99,
    on: true,
  },
  {
    id: 'a2',
    name: 'Refund request',
    updatedLabel: UPDATED,
    primaryNode: 'Event Fired',
    primaryNodeKind: 'event',
    extraNodes: 1,
    description:
      'When a customer requests a refund, trigger human in the loop to get permission before providing the refund.',
    runs: 200,
    successRate: null,
    on: false,
  },
  {
    id: 'a3',
    name: 'Send discount code',
    updatedLabel: UPDATED,
    primaryNode: 'CSAT Submission',
    primaryNodeKind: 'csat',
    extraNodes: 2,
    description:
      'When a customer has interacted with support and provides a low feedback score, email them a discount code.',
    runs: 200,
    successRate: 99,
    on: true,
  },
]
