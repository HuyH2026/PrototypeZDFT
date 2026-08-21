// Mock data for Insights → Agent Overview → Use cases. Frontend-only; no backend.
// Transcribed from Figma "Explore Unification" 2014:96162
// (Agent Overview_UseCase_01_conetnts).
//
// Only the eight columns the frame's header row names are built. Its body rows
// carry six further cells the header never labels — a `member_center +1` chip,
// two n/a, an `Agent name +6` chip, a `Published` badge, and
// "Jan 4, 2024 9:25 AM by Brandon Mango". A column whose meaning is guessed is
// worse than a column that waits for a frame.
//
// The six cards are exactly the six card-factories already builds for a
// Conversations channel, so the figures behind a card named the same thing on
// two tabs cannot drift apart.
import {
  csatCard,
  engagementCard,
  quickFeedbackCard,
  relevanceCard,
  resolutionsCard,
  sentimentCard,
} from '../cards/card-factories'
import type { InsightCardData } from '../cards/card-types'
import type { ChannelKey } from '../channel-tabs'
import { pct } from '../metric-format'

export const USE_CASES_DATE_RANGE = 'May 2, 2026 – Jun 1, 2026'

export type UseCaseColumn = { id: string; label: string; width: string }

// Widths are the frame's own.
export const USE_CASE_COLUMNS: UseCaseColumn[] = [
  { id: 'name', label: 'Use cases', width: 'min-w-[275px]' },
  { id: 'activate', label: 'Activate', width: 'min-w-[98px]' },
  { id: 'channel', label: 'Channel', width: 'min-w-[120px]' },
  { id: 'type', label: 'Type', width: 'min-w-[200px]' },
  { id: 'conversations', label: 'Conversations', width: 'min-w-[140px]' },
  { id: 'deflections', label: 'Deflections', width: 'min-w-[140px]' },
  { id: 'deflectionRate', label: 'Deflection rate', width: 'min-w-[192px]' },
  { id: 'csat', label: 'Avg. CSAT', width: 'min-w-[140px]' },
]

function useCaseCards(scale: number, csatAvgScore: string): InsightCardData[] {
  return [
    resolutionsCard(scale, 'Automated resolutions (AR)'),
    csatCard(scale, csatAvgScore),
    quickFeedbackCard(scale),
    sentimentCard(scale),
    relevanceCard(scale),
    engagementCard(scale),
  ]
}

export type UseCaseRow = {
  id: string
  name: string
  activated: boolean
  channel: string
  type: string
  conversations: string
  deflections: string
  deflectionRate: string
  csat: string
  change: { conversations: string; deflections: string; csat: string }
  conversationCount: number
  deflectionCount: number
}

type UseCaseSeed = {
  id: string
  name: string
  activated: boolean
  type: string
  conversations: number
  deflections: number
  csat: string
  change: { conversations: string; deflections: string; csat: string }
}

// The frame draws three rows with identical figures (3,000 / 2,500 / 95% / 3).
// Row 1 is transcribed; rows 2–3 keep their drawn names, activation states and
// types and vary the figures, and two more of the app's own use cases fill out the
// table.
const USE_CASE_SEEDS: UseCaseSeed[] = [
  {
    id: 'u-1',
    name: 'Knowledge Retrieval',
    activated: true,
    type: 'Knowledge Retrieval',
    conversations: 3000,
    deflections: 2500,
    csat: '3',
    change: { conversations: '+7.4%', deflections: '+5.1%', csat: '+0.1' },
  },
  {
    id: 'u-2',
    name: 'Fallback',
    activated: true,
    type: 'Fallback',
    conversations: 2410,
    deflections: 1880,
    csat: '2.8',
    change: { conversations: '+2.6%', deflections: '-1.2%', csat: '-0.2' },
  },
  {
    id: 'u-3',
    name: 'Service cancellation',
    activated: false,
    type: 'With intent',
    conversations: 1640,
    deflections: 1208,
    csat: '3.4',
    change: { conversations: '-4.8%', deflections: '-3.3%', csat: '+0.3' },
  },
  {
    id: 'u-4',
    name: 'Refund request',
    activated: true,
    type: 'With intent',
    conversations: 1120,
    deflections: 902,
    csat: '4.1',
    change: { conversations: '+9.2%', deflections: '+8.7%', csat: '+0.4' },
  },
  {
    id: 'u-5',
    name: 'Change personal info',
    activated: true,
    type: 'With intent',
    conversations: 860,
    deflections: 611,
    csat: '3.9',
    change: { conversations: '+1.1%', deflections: '+0.9%', csat: '+0.2' },
  },
]

function useCaseRowsFor(scale: number, channelLabel: string): UseCaseRow[] {
  const slug = channelLabel.toLowerCase().replace(/\s+/g, '-')
  return USE_CASE_SEEDS.map((seed) => {
    const conversationCount = Math.round(seed.conversations * scale)
    const deflectionCount = Math.round(seed.deflections * scale)
    return {
      ...seed,
      id: `${slug}-${seed.id}`,
      channel: channelLabel,
      conversations: conversationCount.toLocaleString(),
      deflections: deflectionCount.toLocaleString(),
      deflectionRate: pct(deflectionCount, conversationCount),
      conversationCount,
      deflectionCount,
    }
  })
}

export type UseCaseChannelData = {
  cards: InsightCardData[]
  rows: UseCaseRow[]
  dateRange: string
}

function channelData(scale: number, label: string, csatAvgScore: string): UseCaseChannelData {
  return {
    cards: useCaseCards(scale, csatAvgScore),
    rows: useCaseRowsFor(scale, label),
    dateRange: USE_CASES_DATE_RANGE,
  }
}

export const USE_CASE_CHANNELS: Record<ChannelKey, UseCaseChannelData> = {
  widget: channelData(1, 'Widget', '3.5'),
  voice: channelData(0.6, 'Voice', '4.1'),
  webcall: channelData(0.3, 'Web Call', '3.8'),
  headless: channelData(0.22, 'Headless', '3.6'),
}
