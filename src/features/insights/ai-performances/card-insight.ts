// Pure derivation of a stat card's hover-popover tone and rows from its
// existing Delta data. No new "good/bad" concept — Delta.up already encodes
// direction-is-good, so a card is in `attention` tone if anything is down,
// `improved` if everything is up.
import type { Delta, StatCard } from './ai-performances-data'

export type CardInsight = { headline: string; detail?: string }
export type InsightRow = { label: string; value: string; delta: Delta }

const CHANNEL_LABELS = ['Widget', 'Email', 'Voice'] as const

export function cardTone(card: StatCard): 'attention' | 'improved' {
  const anyDown = card.delta.up === false || card.rows.some((row) => row.delta?.up === false)
  return anyDown ? 'attention' : 'improved'
}

export function insightRows(card: StatCard): InsightRow[] {
  const wantUp = cardTone(card) === 'improved'
  const rows: InsightRow[] = []

  if (card.delta.up === wantUp) {
    rows.push({ label: 'Overall', value: card.value, delta: card.delta })
  }

  card.rows.forEach((row, i) => {
    if (row.delta && row.delta.up === wantUp) {
      rows.push({ label: CHANNEL_LABELS[i], value: row.value, delta: row.delta })
    }
  })

  return rows
}
