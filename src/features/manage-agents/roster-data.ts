// The seeded agent roster: the Uber worked example, one row per brand/agent
// pair. `health`, `ar`, and `conversations` are null for an agent with no data
// yet — that is what renders the 'n/a' row right after a create.
export type AgentHealth = 'good' | 'new-insights' | 'needs-attention'

export type RosterAgent = {
  id: string
  brandId: string
  name: string
  // CHANNEL_META keys — 'Web Widget', 'Email', … (see src/lib/channel-meta.ts).
  channels: string[]
  health: AgentHealth | null
  ar: number | null // 0..100
  conversations: number | null
  insightCount: number // 0 renders no pill
}

// AR values are authored in the 70–90 band so the derived card total lands at
// 84% against 34,744 conversations. See the spec's Deviations: the frames' own
// per-row AR does not reconcile with their donut, and internal consistency
// wins.
export const SEED_AGENTS: RosterAgent[] = [
  {
    id: 'uber-rider-trip',
    brandId: 'uber',
    name: 'Uber Rider Trip',
    channels: ['Web Widget', 'Email', 'Inbound Voice', 'API'],
    health: 'good',
    ar: 84,
    conversations: 10286,
    insightCount: 3,
  },
  {
    id: 'uber-driver-earnings',
    brandId: 'uber',
    name: 'Driver Earnings',
    channels: ['Web Widget', 'Email', 'Web Call'],
    health: 'new-insights',
    ar: 79,
    conversations: 5234,
    insightCount: 5,
  },
  {
    id: 'eats-eater-order',
    brandId: 'uber-eats',
    name: 'Uber Eater Order',
    channels: ['WhatsApp', 'Facebook Messenger', 'Inbound Voice'],
    health: 'good',
    ar: 86,
    conversations: 6912,
    insightCount: 3,
  },
  {
    id: 'eats-merchant-ops',
    brandId: 'uber-eats',
    name: 'Uber Merchant Operation',
    channels: ['Web Widget', 'WhatsApp', 'Email', 'API'],
    health: 'new-insights',
    ar: 78,
    conversations: 3410,
    insightCount: 5,
  },
  {
    id: 'freight-carrier-load',
    brandId: 'uber-freight',
    name: 'Carrier Load Support',
    channels: ['Web Widget', 'Email'],
    health: 'good',
    ar: 88,
    conversations: 2480,
    insightCount: 2,
  },
  {
    id: 'freight-shipper',
    brandId: 'uber-freight',
    name: 'Shipper Support',
    channels: ['Web Widget', 'Slack'],
    health: 'needs-attention',
    ar: 71,
    conversations: 1484,
    insightCount: 4,
  },
  {
    id: 'health-patient-ride',
    brandId: 'uber-health',
    name: 'Patient Ride Support',
    channels: ['Inbound Voice', 'Email'],
    health: 'good',
    ar: 90,
    conversations: 4938,
    insightCount: 1,
  },
]
