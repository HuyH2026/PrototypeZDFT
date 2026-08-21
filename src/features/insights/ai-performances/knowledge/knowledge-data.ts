// Mock data for Insights → Agent Overview → Knowledge. Frontend-only; no backend.
// Transcribed from Figma "Explore Unification" 2014:95551
// (Agent Overview_Knowledge_01_conetnts) under the design spec's two rules:
// counts verbatim and percentages derived, and cells the frame leaves blank
// varied from the drawn ones rather than invented.
//
// A CSAT change is a plain difference ('+0.2'), not a percentage — the same rule
// ConversationComparison's `changeLabel` follows: only counts get a percentage.
import { C3, C7 } from '../ai-performances-data'
import { csatCard, quickFeedbackCard, resolutionsCard } from '../cards/card-factories'
import type { DonutCardData, InsightCardData } from '../cards/card-types'
import type { ChannelKey } from '../channel-tabs'
import { pct } from '../metric-format'

export const KNOWLEDGE_DATE_RANGE = 'May 2, 2026 – Jun 1, 2026'

// --- Columns ---------------------------------------------------------------
// Thirteen columns cannot be made fluid at the app's 1024px floor, so each
// carries a minimum width and the flora Table's wrap scrolls horizontally. The
// frame's own 1165px crop is the design saying so.
export type KnowledgeColumn = { id: string; label: string; width: string }

export const KNOWLEDGE_COLUMNS: KnowledgeColumn[] = [
  { id: 'title', label: 'Title', width: 'min-w-[280px]' },
  { id: 'conversations', label: 'Conversations', width: 'min-w-[130px]' },
  { id: 'resolutions', label: 'Resolutions', width: 'min-w-[140px]' },
  { id: 'surfaceClicks', label: 'Surface & clicks', width: 'min-w-[180px]' },
  { id: 'csat', label: 'Avg. CSAT', width: 'min-w-[110px]' },
  { id: 'integration', label: 'Integration', width: 'min-w-[130px]' },
  { id: 'channel', label: 'Channel', width: 'min-w-[110px]' },
  { id: 'quickFeedback', label: 'Quick feedback', width: 'min-w-[140px]' },
  { id: 'relevance', label: 'Relevance', width: 'min-w-[150px]' },
  { id: 'engagement', label: 'User engagement', width: 'min-w-[150px]' },
  { id: 'engagementRate', label: 'Engagement rate', width: 'min-w-[150px]' },
  { id: 'topAgents', label: 'Top 3 surfaced agents', width: 'min-w-[200px]' },
  { id: 'related', label: 'Related articles', width: 'min-w-[220px]' },
]

export const KNOWLEDGE_GAP_COLUMNS: KnowledgeColumn[] = [
  { id: 'topic', label: 'Missing topic', width: 'min-w-[320px]' },
  { id: 'conversations', label: 'Conversations affected', width: 'min-w-[180px]' },
  { id: 'nonResolutions', label: 'Non-resolutions', width: 'min-w-[160px]' },
  { id: 'suggested', label: 'Suggested article', width: 'min-w-[300px]' },
]

// --- Cards -----------------------------------------------------------------
// Knowledge's two own donuts lead their legend with an undotted total, and both
// derive it by summing their slices rather than carrying it: a scaled channel
// would otherwise round to a total its own slices don't add up to.
function articlesSurfacedCard(scale: number): DonutCardData {
  const resolutions = Math.round(30010 * scale)
  const nonResolutions = Math.round(11526 * scale)
  const total = resolutions + nonResolutions
  return {
    kind: 'donut',
    title: 'Conversations with articles surfaced',
    center: pct(resolutions, total),
    centerLabel: 'resolutions',
    total: { count: total.toLocaleString(), label: 'conversations' },
    slices: [
      { name: 'resolutions', count: resolutions.toLocaleString(), value: resolutions, color: C7 },
      {
        name: 'non-resolutions',
        count: nonResolutions.toLocaleString(),
        value: nonResolutions,
        color: '#8fd3c8',
      },
    ],
  }
}

function clickRateCard(scale: number): DonutCardData {
  const clicked = Math.round(7530 * scale)
  const notClicked = Math.round(86600 * scale)
  const surfaced = clicked + notClicked
  return {
    kind: 'donut',
    title: 'Click rate',
    center: pct(clicked, surfaced),
    centerLabel: 'click rate',
    total: { count: surfaced.toLocaleString(), label: 'surfaced' },
    slices: [
      { name: 'clicked', count: clicked.toLocaleString(), value: clicked, color: C3 },
      { name: 'not clicked', count: notClicked.toLocaleString(), value: notClicked, color: '#7fb3e8' },
    ],
  }
}

// Five cards, three then two — the second row is two wide as drawn, no filler tile.
function knowledgeCards(scale: number, csatAvgScore: string): InsightCardData[] {
  return [
    articlesSurfacedCard(scale),
    resolutionsCard(scale, 'Automated resolutions (AR)'),
    clickRateCard(scale),
    csatCard(scale, csatAvgScore),
    quickFeedbackCard(scale),
  ]
}

// --- Rows ------------------------------------------------------------------
export type KnowledgeChange = { conversations: string; resolutions: string; csat: string | null }

export type KnowledgeRow = {
  id: string
  title: string
  conversations: string
  resolutions: string
  resolutionsPct: string
  surfaced: string
  clicked: string | null
  csat: string | null
  integration: string | null
  channel: string
  quickFeedback: string | null
  relevance: string | null
  engagement: string | null
  engagementRate: string | null
  topAgents: { label: string; more?: number } | null
  related: string[]
  change: KnowledgeChange
  // The raw counts behind the formatted cells, kept so a data test can assert
  // the table never claims more clicks than surfaces.
  conversationCount: number
  resolutionCount: number
  surfaceCount: number
  clickCount: number | null
}

type KnowledgeSeed = Omit<
  KnowledgeRow,
  | 'conversations'
  | 'resolutions'
  | 'resolutionsPct'
  | 'surfaced'
  | 'clicked'
  | 'channel'
  | 'conversationCount'
  | 'resolutionCount'
  | 'surfaceCount'
  | 'clickCount'
> & {
  conversations: number
  resolutions: number
  surfaced: number
  clicked: number | null
}

// Row 1 is the frame's only fully populated row and is transcribed cell for cell.
// Rows 2–4 keep the figures the frame draws for them and vary the rest from row 1.
//
// Row 3's title reads "WithdrawiQuestions or issues with my social security
// number (SSN) or..." in the frame — two overlapping text layers. The intended
// title is the second one.
const KNOWLEDGE_SEEDS: KnowledgeSeed[] = [
  {
    id: 'k-1',
    title: 'Withdrawing Funds from Your Investment Account',
    conversations: 9898,
    resolutions: 8390,
    surfaced: 7616,
    clicked: 500,
    csat: '4.4',
    integration: 'Salesforce',
    quickFeedback: null,
    relevance: 'Relevant',
    engagement: 'Yes',
    engagementRate: '99.4%',
    topAgents: { label: 'Transaction failed', more: 2 },
    related: ['Guide to withdrawing funds from…', 'How to Withdraw funds from your…'],
    change: { conversations: '+12.4%', resolutions: '+8.1%', csat: '+0.2' },
  },
  {
    id: 'k-2',
    title: 'Guide to Withdrawing Funds',
    conversations: 2434,
    resolutions: 2065,
    surfaced: 2434,
    clicked: null,
    csat: '4.6',
    integration: null,
    quickFeedback: null,
    relevance: 'Somewhat Relevant',
    engagement: null,
    engagementRate: null,
    topAgents: { label: 'Withdraw funds' },
    related: ['Withdrawing Funds from Your Inv…'],
    change: { conversations: '-3.2%', resolutions: '-1.6%', csat: '+0.1' },
  },
  {
    id: 'k-3',
    title: 'Questions or issues with my social security number (SSN) or…',
    conversations: 9898,
    resolutions: 1542,
    surfaced: 1625,
    clicked: 96,
    csat: '3.1',
    integration: 'Zendesk Guide',
    quickFeedback: '12 positive',
    relevance: 'Relevant',
    engagement: 'Yes',
    engagementRate: '61.2%',
    topAgents: { label: 'Identity check', more: 1 },
    related: [],
    change: { conversations: '+5.7%', resolutions: '-4.4%', csat: '-0.3' },
  },
  {
    id: 'k-4',
    title: 'Processing Times for Contributions, Withdrawals, and Transfers in …',
    conversations: 2434,
    resolutions: 1948,
    surfaced: 1317,
    clicked: 212,
    csat: '4.2',
    integration: 'Salesforce',
    quickFeedback: null,
    relevance: 'Relevant',
    engagement: 'Yes',
    engagementRate: '88.5%',
    topAgents: { label: 'Transfer status' },
    related: ['Guide to withdrawing funds from…'],
    change: { conversations: '+1.9%', resolutions: '+2.3%', csat: '+0.4' },
  },
]

function knowledgeRowsFor(scale: number, channelLabel: string): KnowledgeRow[] {
  const slug = channelLabel.toLowerCase().replace(/\s+/g, '-')
  return KNOWLEDGE_SEEDS.map((seed) => {
    const conversationCount = Math.round(seed.conversations * scale)
    const resolutionCount = Math.round(seed.resolutions * scale)
    const surfaceCount = Math.round(seed.surfaced * scale)
    const clickCount = seed.clicked === null ? null : Math.round(seed.clicked * scale)
    return {
      ...seed,
      id: `${slug}-${seed.id}`,
      channel: channelLabel,
      conversations: conversationCount.toLocaleString(),
      resolutions: resolutionCount.toLocaleString(),
      resolutionsPct: pct(resolutionCount, conversationCount),
      surfaced: `${surfaceCount.toLocaleString()} times surfaced`,
      clicked:
        clickCount === null
          ? null
          : `${clickCount.toLocaleString()} (${pct(clickCount, surfaceCount)}) clicked`,
      conversationCount,
      resolutionCount,
      surfaceCount,
      clickCount,
    }
  })
}

// --- Knowledge gap ---------------------------------------------------------
// No frame exists for this sub-tab; the columns are gap-shaped and the rows are
// authored from the topics the Knowledge rows above are weakest on.
export type KnowledgeGapRow = {
  id: string
  topic: string
  conversations: string
  nonResolutions: string
  suggestedArticle: string | null
}

type KnowledgeGapSeed = {
  id: string
  topic: string
  conversations: number
  nonResolutions: number
  suggestedArticle: string | null
}

const KNOWLEDGE_GAP_SEEDS: KnowledgeGapSeed[] = [
  {
    id: 'kg-1',
    topic: 'Wire transfer cut-off times',
    conversations: 1842,
    nonResolutions: 1406,
    suggestedArticle: 'Processing Times for Contributions, Withdrawals, and Transfers',
  },
  {
    id: 'kg-2',
    topic: 'Beneficiary changes after a divorce',
    conversations: 1205,
    nonResolutions: 1102,
    suggestedArticle: null,
  },
  {
    id: 'kg-3',
    topic: 'Rolling over an employer 401(k)',
    conversations: 968,
    nonResolutions: 774,
    suggestedArticle: 'Guide to Withdrawing Funds',
  },
  {
    id: 'kg-4',
    topic: 'Replacing a lost debit card abroad',
    conversations: 742,
    nonResolutions: 668,
    suggestedArticle: null,
  },
  {
    id: 'kg-5',
    topic: 'Tax documents for a closed account',
    conversations: 531,
    nonResolutions: 402,
    suggestedArticle: 'Withdrawing Funds from Your Investment Account',
  },
]

function knowledgeGapRowsFor(scale: number, channelLabel: string): KnowledgeGapRow[] {
  const slug = channelLabel.toLowerCase().replace(/\s+/g, '-')
  return KNOWLEDGE_GAP_SEEDS.map((seed) => ({
    id: `${slug}-${seed.id}`,
    topic: seed.topic,
    conversations: Math.round(seed.conversations * scale).toLocaleString(),
    nonResolutions: Math.round(seed.nonResolutions * scale).toLocaleString(),
    suggestedArticle: seed.suggestedArticle,
  }))
}

// --- Channels --------------------------------------------------------------
export type KnowledgeChannelData = {
  cards: InsightCardData[]
  rows: KnowledgeRow[]
  gapRows: KnowledgeGapRow[]
  dateRange: string
}

function channelData(scale: number, label: string, csatAvgScore: string): KnowledgeChannelData {
  return {
    cards: knowledgeCards(scale, csatAvgScore),
    rows: knowledgeRowsFor(scale, label),
    gapRows: knowledgeGapRowsFor(scale, label),
    dateRange: KNOWLEDGE_DATE_RANGE,
  }
}

// Widget, Voice and Web Call match the Conversations tab's scales and CSAT
// averages, so those channels read consistently. Headless differs deliberately:
// Conversations leaves it at full scale for its A2A card set.
export const KNOWLEDGE_CHANNELS: Record<ChannelKey, KnowledgeChannelData> = {
  widget: channelData(1, 'Widget', '3.5'),
  voice: channelData(0.6, 'Voice', '4.1'),
  webcall: channelData(0.3, 'Web Call', '3.8'),
  headless: channelData(0.22, 'Headless', '3.6'),
}
