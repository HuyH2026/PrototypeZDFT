// Every number on the Manage agents screen is derived here, so the cards, the
// legends, and the table can never disagree. Pure functions over the roster —
// no formatting decisions beyond formatCount, no React.
import type { RosterAgent } from './roster-data'

export type Segment = { label: string; value: number; color: string }

export type MetricKey = 'conversations' | 'ar' | 'escalations'

// One monochrome ramp per card, lightening down the legend: warm grey for
// Conversations, green for AR, red for Escalations.
export const RAMPS: Record<MetricKey, readonly string[]> = {
  conversations: ['#2f3130', '#5c605c', '#8b8e89', '#b9bab6', '#d9d7d5'],
  ar: ['#0f8a5f', '#3aa87f', '#68c4a1', '#9adcc3', '#c8eede'],
  escalations: ['#c8402f', '#d76a5b', '#e39588', '#efc0b7', '#f7e2dd'],
}

export function conversationTotal(agents: RosterAgent[]): number {
  return agents.reduce((sum, agent) => sum + (agent.conversations ?? 0), 0)
}

// Conversation-weighted, because a 90% agent with 200 conversations must not
// outweigh a 78% agent with 3,400. Null when nothing in scope has data.
export function arPercent(agents: RosterAgent[]): number | null {
  let weight = 0
  let weighted = 0
  for (const agent of agents) {
    if (agent.ar === null || agent.conversations === null) continue
    weight += agent.conversations
    weighted += agent.ar * agent.conversations
  }
  if (weight === 0) return null
  return Math.round(weighted / weight)
}

export function escalationPercent(agents: RosterAgent[]): number | null {
  const ar = arPercent(agents)
  return ar === null ? null : 100 - ar
}

// Legend rows. All brands groups by brand; a selected brand groups by agent —
// exactly the difference between the two populated frames.
export function segments(
  agents: RosterAgent[],
  opts: {
    groupBy: 'brand' | 'agent'
    metric: MetricKey
    brandName: (brandId: string) => string
  },
): Segment[] {
  const groups = new Map<string, RosterAgent[]>()
  for (const agent of agents) {
    const key = opts.groupBy === 'brand' ? agent.brandId : agent.id
    const bucket = groups.get(key)
    if (bucket) bucket.push(agent)
    else groups.set(key, [agent])
  }

  const rows = [...groups.entries()].map(([key, group]) => ({
    label: opts.groupBy === 'brand' ? opts.brandName(key) : group[0].name,
    value:
      opts.metric === 'conversations'
        ? conversationTotal(group)
        : opts.metric === 'ar'
          ? (arPercent(group) ?? 0)
          : (escalationPercent(group) ?? 0),
  }))

  rows.sort((a, b) => b.value - a.value)

  const ramp = RAMPS[opts.metric]
  return rows.map((row, index) => ({
    ...row,
    color: ramp[Math.min(index, ramp.length - 1)],
  }))
}

// Explicit locale: the app must format identically wherever it runs.
export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}
