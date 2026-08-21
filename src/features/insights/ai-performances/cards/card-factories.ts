// The metric cards more than one Agent Overview tab draws. Figures come from the
// Figma reference frames (Explore Unification 1892-96346 for Conversations,
// 2014:97497 for Knowledge / Use cases / Topics); `scale` varies them per channel
// so four tabs don't render byte-identical grids.
//
// `title` is a parameter on the three cards the frames rename between tabs:
// Resolutions becomes "Automated resolutions (AR)", and Topics reads
// "Relevance for chats with Topics" / "User engagement for chat with Topics".
// Sharing the factory is the point — a card named the same thing on two tabs
// cannot show different numbers.
import { C1, C2, C3, C5, C7 } from '../ai-performances-data'
import type { DonutCardData, InsightCardData, RankedBarCard, StackedBarCard } from './card-types'

const n = (base: number, scale: number) => Math.round(base * scale)

export function totalConversationsCard(scale: number): StackedBarCard {
  const total = n(45000, scale)
  const automated = n(36000, scale)
  return {
    kind: 'stacked',
    title: 'Total conversations',
    value: total.toLocaleString(),
    segments: [
      { label: 'Automated', count: automated.toLocaleString(), pct: '80%', color: C5 },
      { label: 'Non automated', count: (total - automated).toLocaleString(), pct: '20%', color: '#b9bec7' },
    ],
  }
}

export function deflectionsCard(scale: number): StackedBarCard {
  const total = n(45000, scale)
  const deflected = n(28800, scale)
  return {
    kind: 'stacked',
    title: 'Deflections',
    value: `${deflected.toLocaleString()} (80%)`,
    segments: [
      { label: 'deflected', count: deflected.toLocaleString(), pct: '80%', color: C1 },
      {
        label: 'not deflected',
        count: (total - deflected - n(9000, scale)).toLocaleString(),
        pct: '20%',
        color: C2,
      },
    ],
  }
}

export function resolutionsCard(scale: number, title = 'Resolutions'): DonutCardData {
  return {
    kind: 'donut',
    title,
    center: '80%',
    centerLabel: '',
    slices: [
      { name: 'verified', count: n(17280, scale).toLocaleString(), value: 80, color: C7 },
      { name: 'contained', count: n(11520, scale).toLocaleString(), value: 20, color: '#8fd3c8' },
    ],
  }
}

export function sentimentCard(scale: number): DonutCardData {
  return {
    kind: 'donut',
    title: 'Sentiment',
    center: '80%',
    centerLabel: '',
    slices: [
      { name: 'positive', count: n(964, scale).toLocaleString(), value: 80, color: C7 },
      { name: 'neutral', count: n(200, scale).toLocaleString(), value: 8, color: '#8fd3c8' },
      { name: 'negative', count: n(737, scale).toLocaleString(), value: 12, color: C2 },
    ],
  }
}

export function relevanceCard(scale: number, title = 'Relevance'): DonutCardData {
  return {
    kind: 'donut',
    title,
    center: '75%',
    centerLabel: 'relevant calls',
    slices: [
      { name: 'relevant', count: n(6000, scale).toLocaleString(), value: 75, color: C3 },
      { name: 'somewhat relevant', count: n(1000, scale).toLocaleString(), value: 13, color: '#7fb3e8' },
      { name: 'irrelevant', count: n(1000, scale).toLocaleString(), value: 12, color: C2 },
    ],
  }
}

export function engagementCard(scale: number, title = 'Engagement'): DonutCardData {
  return {
    kind: 'donut',
    title,
    center: '75%',
    centerLabel: '',
    slices: [
      { name: 'yes', count: n(6000, scale).toLocaleString(), value: 75, color: C3 },
      { name: 'no', count: n(2000, scale).toLocaleString(), value: 25, color: C2 },
    ],
  }
}

// CSAT's bucket counts and colors come from the Figma reference frame; other
// channels scale the same buckets rather than inventing new ones.
const CSAT_BUCKETS = ['5-Excellent', '4-Good', '3-Okay', '2-Bad', '1-Terrible']
const CSAT_BASE_COUNTS = [424, 554, 3654, 277, 155]
const CSAT_BASE_TOTAL = 2928
const CSAT_COLORS = [C7, '#4f9e93', '#8fd3c8', '#c3e6e0', '#e1f2ef']

export function csatCard(scale: number, avgScore: string): RankedBarCard {
  return {
    kind: 'ranked',
    title: 'CSAT',
    total: avgScore,
    totalLabel: 'avg score',
    secondaryLabel: 'Total responses',
    secondaryValue: Math.round(CSAT_BASE_TOTAL * scale).toLocaleString(),
    color: C7,
    rows: CSAT_BUCKETS.map((label, i) => {
      const count = Math.round(CSAT_BASE_COUNTS[i] * scale)
      return { label, value: count, count: count.toLocaleString(), color: CSAT_COLORS[i] }
    }),
  }
}

export function quickFeedbackCard(scale: number): DonutCardData {
  return {
    kind: 'donut',
    title: 'Quick feedback',
    center: '43%',
    centerLabel: 'positive',
    slices: [
      { name: 'positive', count: n(36, scale).toLocaleString(), value: 43, color: C7 },
      { name: 'negative', count: n(109, scale).toLocaleString(), value: 57, color: C2 },
      { name: 'not answered', count: n(2244, scale).toLocaleString(), value: 0, color: '#d7dbe0' },
    ],
  }
}

/** The six cards every Conversations channel shares, in the frames' order. */
export function sharedCards(scale: number): InsightCardData[] {
  return [
    totalConversationsCard(scale),
    deflectionsCard(scale),
    resolutionsCard(scale),
    sentimentCard(scale),
    relevanceCard(scale),
    engagementCard(scale),
  ]
}
