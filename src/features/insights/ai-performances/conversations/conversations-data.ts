// Mock data + types for the Insights → AI Performance → Conversations tab.
// Frontend-only; no backend. The tab is channel-scoped: each ChannelKey maps to
// its own card set, table columns and rows. Headless (Figma 215-8805) is
// A2A-specific: conversation source split human/A2A/MCP, top A2A solve
// agents/calling clients, and Source/Calling client/Detected agents columns.
// Widget / Voice / Web Call (Figma "Explore Unification" 1892-96346, Widget
// channel) share a generic template instead: Total conversations, Automated
// resolutions, CSAT, Quick feedback, Sentiment, Relevance, Engagement, and a
// User query + Resolved column pair in place of Detected agents.
import { C4, C5, C6 } from '../ai-performances-data'
import { csatCard, quickFeedbackCard, resolutionsCard, sentimentCard, relevanceCard, engagementCard, sharedCards, totalConversationsCard } from '../cards/card-factories'
import type { InsightCardData } from '../cards/card-types'
import { CHANNEL_TABS, type ChannelKey } from '../channel-tabs'
import { type ConvAudit, auditFor } from './audit-data'

export type { ChannelKey }
export const CONV_CHANNEL_TABS = CHANNEL_TABS

// --- Table -----------------------------------------------------------------
export type ConvColumnId =
  | 'timestamp'
  | 'automated'
  | 'source'
  | 'client'
  | 'agents'
  | 'transcript'
  | 'query'
  | 'resolved'
  | 'state'
export type ConvColumn = { id: ConvColumnId; label: string }
export type SourceKind = 'human' | 'a2a' | 'mcp'
export type ResolvedStatus = 'Verified' | 'Contained' | 'n/a'

// --- Conversation Details panel ---------------------------------------------
// A timeline row is either a duration-bearing chip ("Order Status · 34 sec")
// or a bare inline link (`link: true`, no duration) — both render in the same
// dot-and-line timeline, matching the Figma reference frame.
export type EventItem = { label: string; duration?: string; link?: boolean }
// Every turn in the chat — bubble or step chip — carries its own timestamp
// (a Fetch requirement; reverses the earlier "no per-bubble timestamps" call).
export type TranscriptStep = { kind: 'step'; text: string; time: string }
export type TranscriptBubble = {
  kind: 'bubble'
  speaker: string
  role: string
  text: string
  side: 'client' | 'solve'
  time: string
}
export type TranscriptEntry = TranscriptBubble | TranscriptStep

// One scored row in the AI QA tab: a title, a threshold badge, a 0–100 track
// fill, and a reasoning paragraph. Colors are carried per-row (not derived
// from score vs. threshold) because the Figma reference frame's own six rows
// don't follow a consistent above/below-threshold rule.
export type CriteriaRow = {
  label: string
  score: number
  threshold: number
  fillPct: number
  color: string
  tickColor: string
  reasoning: string
}

export type ConvDetail = {
  conversationId: string
  clientLabel?: string
  clientValue?: string
  deflected: string
  resolved: string
  timeCreated: string
  timeSpent: string
  channel: string
  interactions: string
  sentimentScore: number
  csat: string
  summary: string
  events: EventItem[]
  eventsOutcome: string
  criteria: CriteriaRow[]
  transcriptIntro: string
  transcript: TranscriptEntry[]
  // Widget only. Its presence is the gate for the whole audit-trail layer: the
  // error card, the per-exchange evidence strips, the impact/owner MetaGrid
  // rows, and the table's State chip. Absent ⇒ every surface renders as before.
  audit?: ConvAudit
}

export type ConvRow = {
  id: string
  timestamp: string
  automated: boolean
  source: SourceKind
  client: string
  agents: string
  transcript: string[]
  hasGap: boolean
  resolved?: ResolvedStatus
  query?: { lines: string[]; more?: number }
  detail: ConvDetail
}

export type ChannelData = {
  cards: InsightCardData[]
  columns: ConvColumn[]
  rows: ConvRow[]
  dateRange: string
  convHeader: string
}

// Chip tints for the Source column (brand-ish, no token — see channel colors).
export const SOURCE_META: Record<SourceKind, { label: string; fg: string; bg: string }> = {
  human: { label: 'Human', fg: '#8a5a00', bg: '#fdf1d6' },
  a2a: { label: 'A2A', fg: '#a3216f', bg: '#fbe4f1' },
  mcp: { label: 'MCP', fg: '#0f7b8f', bg: '#daf1f5' },
}

// The three A2A-specific cards (Headless only), filling grid slots 4–6.
const HEADLESS_A2A_CARDS: InsightCardData[] = [
  {
    kind: 'donut',
    title: 'Conversation source',
    center: '60%',
    centerLabel: 'human',
    slices: [
      { name: 'human', count: '964', value: 60, color: C4 },
      { name: 'agent (A2A)', count: '650', value: 27, color: C6 },
      { name: 'MCP', count: '439', value: 13, color: C5 },
    ],
  },
  {
    kind: 'ranked',
    title: 'Top A2A solve agents',
    total: '5,064',
    totalLabel: 'Total responses',
    color: C6,
    rows: [
      { label: 'Access & Identity', value: 3654, count: '3,654' },
      { label: 'Refund request', value: 554, count: '554' },
      { label: 'Booking agent', value: 424, count: '424' },
      { label: 'Developer support', value: 277, count: '277' },
      { label: 'Knowledge', value: 155, count: '155' },
    ],
  },
  {
    kind: 'ranked',
    title: 'Top A2A calling clients',
    total: '5,064',
    totalLabel: 'Total responses',
    color: C5,
    rows: [
      { label: 'Revenue Copilot', value: 3654, count: '3,654' },
      { label: 'Acme Orchestrator', value: 554, count: '554' },
      { label: 'OpenClaw', value: 424, count: '424' },
      { label: 'Partner Triage Bot', value: 277, count: '277' },
      { label: 'Booking Bot', value: 155, count: '155' },
    ],
  },
]

// Widget / Voice / Web Call's card grid: the cards they share with Headless
// (Deflections is Headless-only) plus their own CSAT / Quick feedback slots.
function genericCards(scale: number, csatAvgScore: string): InsightCardData[] {
  return [
    totalConversationsCard(scale),
    resolutionsCard(scale, 'Automated resolutions (AR)'),
    csatCard(scale, csatAvgScore),
    quickFeedbackCard(scale),
    sentimentCard(scale),
    relevanceCard(scale),
    engagementCard(scale),
  ]
}

// Column labels are derived from each channel's `convHeader` (the source of
// truth for the transcript-column count) so the two never drift apart.
// Headless keeps its A2A-specific Source / Calling client / Detected agents
// columns; Widget / Voice / Web Call show a User query + Resolved status pair
// instead (per the Figma reference frame).
// `withState` is Widget-only, for the same reason the audit is: the chip has
// nothing to read on a channel with no audit.
function columnsFor(convHeader: string, variant: 'headless' | 'generic', withState = false): ConvColumn[] {
  if (variant === 'headless') {
    return [
      { id: 'timestamp', label: 'Timestamp' },
      { id: 'automated', label: 'Automated' },
      { id: 'source', label: 'Source' },
      { id: 'client', label: 'Calling client' },
      { id: 'agents', label: 'Detected agents' },
      { id: 'transcript', label: convHeader },
    ]
  }
  return [
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'automated', label: 'Automated' },
    { id: 'transcript', label: convHeader },
    { id: 'query', label: 'User query' },
    { id: 'resolved', label: 'Resolved' },
    ...(withState ? [{ id: 'state' as const, label: 'State' }] : []),
  ]
}

// Wording that varies by conversation source (matches the two Figma frames).
function sourceWording(source: SourceKind) {
  if (source === 'a2a') return { clientLabel: 'Calling client', intro: 'Conversation started between agents' }
  if (source === 'mcp') return { clientLabel: 'MCP client', intro: 'Conversation started between MCP and agent' }
  return { clientLabel: undefined, intro: 'Conversation started' }
}

// Deterministic turn times for the generated transcripts (Voice / Web Call /
// Headless preview rows): a fixed evening start, 20 seconds per line.
function lineTime(i: number): string {
  const t = 18 * 3600 + 47 * 60 + 50 + i * 20
  const h24 = Math.floor(t / 3600) % 24
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${period}`
}

// Turn a row's flat transcript lines into alternating bubble entries. Even
// lines are the caller (client tint), odd lines are Solve (grey).
function bubblesFromLines(lines: string[], source: SourceKind, client: string): TranscriptEntry[] {
  const caller = source === 'human' ? 'User' : client
  return lines.map((text, i) => ({
    kind: 'bubble' as const,
    speaker: i % 2 === 0 ? caller : 'Solve',
    role: i % 2 === 0 ? (source === 'human' ? 'Customer' : 'Calling client') : 'Solve',
    text,
    side: i % 2 === 0 ? ('client' as const) : ('solve' as const),
    time: lineTime(i),
  }))
}

// The exact A2A booking transcript from Figma frame 145-77530, with per-turn
// times inside the row's 11:57 PM minute.
const A2A_TRANSCRIPT: TranscriptEntry[] = [
  { kind: 'bubble', speaker: 'OpenClaw', role: 'Calling client', side: 'client', text: 'Delegation token verified · acting for Jane R. · scope: book_travel · max $500 · exp 2h', time: '11:57:02 PM' },
  { kind: 'step', text: 'Detected intent: book flight', time: '11:57:05 PM' },
  { kind: 'bubble', speaker: 'Booking', role: 'Solve', side: 'solve', text: 'flight: DL428 · SFO→JFK · Fri 9:15a\nfare: $462 · aisle 14C\ncapability: book_flight', time: '11:57:09 PM' },
  { kind: 'step', text: 'Triggered action: search flights', time: '11:57:09 PM' },
  { kind: 'bubble', speaker: 'OpenClaw', role: 'Calling client', side: 'client', text: 'intent: book_flight\noffer_id: ofr_9c2a · amount: $462', time: '11:57:21 PM' },
  { kind: 'step', text: 'Triggered action: book flight', time: '11:57:24 PM' },
  { kind: 'bubble', speaker: 'Booking', role: 'Solve', side: 'solve', text: 'pnr: DL-7XQ2P · seat: 14C · charged: $462', time: '11:57:31 PM' },
]

// The exact MCP SAML transcript from Figma frame 145-77713.
const MCP_TRANSCRIPT: TranscriptEntry[] = [
  { kind: 'bubble', speaker: 'Claude Desktop', role: 'Calling client', side: 'client', text: 'tool call → solve.search(query: "SAML SSO setup steps")', time: '11:44:06 PM' },
  { kind: 'step', text: 'Triggered knowledge article', time: '11:44:08 PM' },
  { kind: 'bubble', speaker: 'Knowledge', role: 'Solve', side: 'solve', text: 'article: Setting up SAML SSO · confidence: 0.94', time: '11:44:09 PM' },
]

// The AI QA tab's six scored rows — ported verbatim from the Figma reference
// frame (Explore Unification 1941-88348, "Criteria") and shared across every
// conversation, matching this file's existing precedent of reusing one
// generic reasoning block regardless of the row's own transcript topic.
const DEFAULT_CRITERIA: CriteriaRow[] = [
  {
    label: 'Escalation Awareness',
    score: 5,
    threshold: 90,
    fillPct: 76,
    color: '#048c80',
    tickColor: '#8c3f3f',
    reasoning:
      "The user expressed a clear need to speak with the Data Protection team but was unauthenticated and the bot appropriately informed them that live support requires signing in. The bot provided relevant public guidance based on the user's inputs without pushing further self-service when it lacked specific answers, indicating correct non-escalation. There were no repeated frustrations or loops, and no missed escalation triggers since the user was not signed in and thus had limited options for direct case creation or agent handoff.",
  },
  {
    label: 'Intent Accuracy',
    score: 5,
    threshold: 80,
    fillPct: 100,
    color: '#048c80',
    tickColor: '#8c3f3f',
    reasoning:
      "The bot correctly identified the user's specific intent to contact the Data Protection team and then refined it to a UK GDPR-related query. It asked for product disambiguation multiple times before providing relevant guidance, showing good handling of ambiguity. However, when the user asked about data storage location—a multi-part question involving product-specific details—the bot admitted lack of information but still sought clarification on product variant, demonstrating intent fidelity and evolution tracking. The bot did not prematurely answer or ignore shifts in user intent.",
  },
  {
    label: 'Efficiency',
    score: 5,
    threshold: 70,
    fillPct: 37,
    color: '#e53112',
    tickColor: '#8c3f3f',
    reasoning:
      'The bot efficiently gathered necessary context before providing detailed guidance, asking for the specific Granicus product and nature of the data protection request early on. It adapted its responses based on user input (e.g., UK GDPR) and acknowledged when it lacked sufficient information to answer a question about data storage, prompting for more details rather than repeating prior instructions. The bot did not repeat failed steps or get stuck in loops, showing good strategy diversity by shifting from contact support to knowledge retrieval appropriately. Overall, each turn moved the conversation forward without unnecessary restatements.',
  },
  {
    label: 'Knowledge Gap',
    score: 2,
    threshold: 65,
    fillPct: 51,
    color: '#ffbc42',
    tickColor: '#2f3b48',
    reasoning:
      "The chatbot provided relevant information about UK GDPR roles and data handling for EngagementHQ, showing partial coverage of the user's question. However, when asked about data storage location, it admitted no public article clearly addresses this for the user's product, indicating a knowledge gap. The bot did not synthesize or provide alternative troubleshooting steps but offered to continue exploring other questions. Thus, while some adjacent content exists on GDPR responsibilities and procedures, direct answers on data storage are missing.",
  },
  {
    label: 'Answer Accuracy',
    score: 5,
    threshold: 80,
    fillPct: 100,
    color: '#048c80',
    tickColor: '#8c3f3f',
    reasoning:
      "The chatbot correctly identified the user's intent to contact the Data Protection team and provided accurate guidance about needing to sign in for live support, which aligns with policy. It then gave a relevant summary of UK GDPR roles and public guidance related to EngagementHQ, addressing part of the user's inquiry. When asked about data storage location, it honestly stated that no specific public information is available yet for that question/product combination, avoiding fabrication. The responses are aligned with user questions and appropriately scoped given unauthenticated access limitations.",
  },
  {
    label: 'Relevancy',
    score: 4,
    threshold: 80,
    fillPct: 74,
    color: '#048c80',
    tickColor: '#2f3b48',
    reasoning:
      "The bot correctly identified the user's intent to contact the Data Protection team and provided relevant instructions about signing in and contacting support, matching the response type requested. It also gave detailed public guidance on UK GDPR related topics when asked, which fits the scope of data protection inquiries. However, when asked about data storage location, it did not provide a direct answer but explained why it couldn't due to lack of specific public information and prompted for more details. This partial coverage slightly limits relevancy but is appropriate given available info.",
  },
]

// Every conversation gets its own deterministic UUID — the Logs pages deep-link
// into the drawer by conversation ID, so the old shared placeholder id had to
// become per-row. Suffixes are authored, not random.
const CONVERSATION_IDS: Record<string, string> = {
  'g-1': '3e732807-c2d0-4ce3-8b5e-c87c28abb701',
  'g-2': '3e732807-c2d0-4ce3-8b5e-c87c28abb702',
  'g-3': '3e732807-c2d0-4ce3-8b5e-c87c28abb703',
  'g-4': '3e732807-c2d0-4ce3-8b5e-c87c28abb704',
  'g-5': '3e732807-c2d0-4ce3-8b5e-c87c28abb705',
  'c-1': '9b14c6a2-77d1-4f0e-9c3d-2f5a81e0c101',
  'c-2': '9b14c6a2-77d1-4f0e-9c3d-2f5a81e0c102',
  'c-3': '9b14c6a2-77d1-4f0e-9c3d-2f5a81e0c103',
  'c-4': '9b14c6a2-77d1-4f0e-9c3d-2f5a81e0c104',
  'c-5': '9b14c6a2-77d1-4f0e-9c3d-2f5a81e0c105',
}

export function conversationIdFor(rowId: string): string {
  return CONVERSATION_IDS[rowId] ?? '3e732807-c2d0-4ce3-8b5e-c87c28abb7e8'
}

// Look a conversation's drawer detail up by the ID a Logs row carries. Widget
// first (the audited channel), then Headless — the two channels the Logs mock
// links from.
export function detailForConversationId(conversationId: string): ConvDetail | undefined {
  for (const key of ['widget', 'headless'] as const) {
    const row = CHANNELS[key].rows.find((r) => r.detail.conversationId === conversationId)
    if (row) return row.detail
  }
  return undefined
}

export function detailFor(row: Omit<ConvRow, 'detail'>, channelLabel: string): ConvDetail {
  const w = sourceWording(row.source)
  const base: ConvDetail = {
    conversationId: conversationIdFor(row.id),
    clientLabel: w.clientLabel,
    clientValue: row.client === 'n/a' ? undefined : row.client,
    deflected: 'Yes',
    resolved: row.resolved ?? 'Verified',
    timeCreated: 'May 17, 2026 6:47:50 pm',
    timeSpent: '2 min 30 sec',
    channel: channelLabel,
    interactions: '4',
    sentimentScore: 78,
    csat: 'n/a',
    summary:
      "The customer's request was resolved within policy: the agent confirmed the relevant details and completed the requested action, assuring the customer of next steps. No further input was provided, counted as implicit confirmation.",
    events: [
      { label: 'Flight reservation', duration: '34 sec' },
      { label: 'Booking reservations', duration: '1 min 15 sec' },
      { label: 'Booking reservation', link: true },
    ],
    eventsOutcome: 'Successfully booked and confirmed with the customer.',
    criteria: DEFAULT_CRITERIA,
    transcriptIntro: w.intro,
    transcript: bubblesFromLines(row.transcript, row.source, row.client),
  }

  // The two Figma reference rows get their exact designed content.
  if (row.source === 'a2a' && row.client === 'OpenClaw') {
    return { ...base, interactions: '4', transcript: A2A_TRANSCRIPT }
  }
  if (row.source === 'mcp' && row.client === 'Claude Desktop') {
    return {
      ...base,
      interactions: '2',
      events: [
        { label: 'SAML SSO', duration: '34 sec' },
        { label: 'Knowledge Agent', duration: '1 min 15 sec' },
        { label: 'Knowledge agent', link: true },
      ],
      eventsOutcome: 'Successfully applied SAML SSO configuration.',
      transcript: MCP_TRANSCRIPT,
    }
  }
  return base
}

const HEADLESS_ROWS_BASE: Omit<ConvRow, 'detail'>[] = [
  {
    id: 'c-1',
    timestamp: 'Jun 1, 2026, 11:59 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Fallback + 2',
    transcript: [
      'Chatbot: Hi! How can I help you today?',
      'User: Abnormal bank statement',
      'Chatbot: Detected Intent: (Reopen your account)…',
    ],
    hasGap: true,
  },
  {
    id: 'c-2',
    timestamp: 'Jun 1, 2026, 11:57 PM',
    automated: true,
    source: 'a2a',
    client: 'OpenClaw',
    agents: 'Booking',
    transcript: [
      'OpenClaw: Delegation token verified · acting for',
      'Jane R. · scope: book_travel · max $500 · exp 2h',
      'Solve Headless: flight: DL428 · SFO→JFK · Fri 9:15a…',
    ],
    hasGap: false,
  },
  {
    id: 'c-3',
    timestamp: 'Jun 1, 2026, 11:44 PM',
    automated: true,
    source: 'mcp',
    client: 'Claude Desktop',
    agents: 'Knowledge',
    transcript: [
      'Claude Desktop: tool call → solve.search(query:',
      '"SAML SSO setup steps")',
      'Solve Headless: article: Setting up SAML SSO · co…',
    ],
    hasGap: true,
  },
  {
    id: 'c-4',
    timestamp: 'Jun 1, 2026, 11:31 PM',
    automated: false,
    source: 'a2a',
    client: 'Partner Triage Bot',
    agents: 'Fallback',
    transcript: [
      'Partner Triage Bot: escalation · priority high',
      'User: My integration keeps timing out on webhooks',
      'Solve Headless: no matching policy — routed to human',
    ],
    hasGap: true,
  },
  {
    id: 'c-5',
    timestamp: 'Jun 1, 2026, 11:20 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Refund request',
    transcript: [
      'Chatbot: Hi! How can I help you today?',
      'User: I want a refund for order 88213',
      'Solve Headless: refund initiated · $42.00 · 3–5 days',
    ],
    hasGap: false,
  },
]

const HEADLESS_ROWS: ConvRow[] = HEADLESS_ROWS_BASE.map((r) => ({ ...r, detail: detailFor(r, 'Headless') }))

// Widget / Voice / Web Call's rows — the exact conversations from the Figma
// reference frame (bank statement, withdraw funds, withdraw investments,
// update last name), plus a fifth (refund) to round out the table. Shared
// across the three channels; only the id prefix and detail's `channel` field
// vary per channel.
const GENERIC_ROWS_BASE: Omit<ConvRow, 'detail'>[] = [
  {
    id: 'g-1',
    timestamp: 'Jun 1, 2026, 11:59 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Fallback + 2',
    transcript: [
      'Chatbot: Hi! How can I help you today?',
      'User: Abnormal bank statement',
      'Chatbot: Detected Intent: (Reopen your account)…',
    ],
    hasGap: true,
    resolved: 'Verified',
    query: { lines: ['"abnormal bank statement"', '"transaction failed"'], more: 2 },
  },
  {
    id: 'g-2',
    timestamp: 'Jun 1, 2026, 11:57 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Close/Cancel',
    transcript: [
      'Chatbot: Hello! How can I help you?',
      'User: Withdraw funds',
      'Chatbot: Detected intent: (Close/Cancel)…',
    ],
    hasGap: false,
    resolved: 'Contained',
    query: { lines: ['"Withdraw funds"'] },
  },
  {
    id: 'g-3',
    timestamp: 'Jun 1, 2026, 11:44 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Close/Cancel',
    transcript: [
      'Chatbot: Hello! How can I help? By replying you are',
      'User: How do I withdraw my investments',
      'Chatbot: Detected intent: (Close/Cancel)…',
    ],
    hasGap: false,
    resolved: 'n/a',
    query: { lines: ['"How do I withdraw my investments"'] },
  },
  {
    id: 'g-4',
    timestamp: 'Jun 1, 2026, 11:36 PM',
    automated: false,
    source: 'human',
    client: 'n/a',
    agents: 'Change Personal Info',
    transcript: [
      'Chatbot: Hello! How can I help? By replying you ag',
      'User: Hi, I need to update my last name',
      'Chatbot: Detected Intent: (Change Personal Info)',
    ],
    hasGap: true,
    resolved: 'n/a',
    query: { lines: ['"I need to update my last name"'] },
  },
  {
    id: 'g-5',
    timestamp: 'Jun 1, 2026, 11:20 PM',
    automated: true,
    source: 'human',
    client: 'n/a',
    agents: 'Refund request',
    transcript: [
      'Chatbot: Hi! How can I help you today?',
      'User: I want a refund for order 88213',
      'Chatbot: Refund initiated: $42.00 · 3–5 days',
    ],
    hasGap: false,
    resolved: 'Verified',
    query: { lines: ['"Refund for order 88213"'] },
  },
]

// The three Figma preview lines in GENERIC_ROWS_BASE stay exactly as they are —
// they are the table's content. These are the drawer transcripts those rows
// preview, authored out so an exchange-level audit has exchanges to sit under.
// Speaker/role wording matches bubblesFromLines' human case ('User' · 'Customer'
// and 'Solve' · 'Solve') so an authored transcript is indistinguishable from a
// generated one.
const customerSays = (text: string, time: string): TranscriptEntry => ({
  kind: 'bubble',
  speaker: 'User',
  role: 'Customer',
  side: 'client',
  text,
  time,
})
const agentSays = (text: string, time: string): TranscriptEntry => ({
  kind: 'bubble',
  speaker: 'Solve',
  role: 'Solve',
  side: 'solve',
  text,
  time,
})
const stepChip = (text: string, time: string): TranscriptEntry => ({ kind: 'step', text, time })

// Group counts (3 / 3 / 2 / 3 / 2) match each row's audit.exchanges.length —
// asserted in audit-data.test.ts, since a silent drift here would hang evidence
// off the wrong exchange.
// Turn times line up with each row's audit events (audit-data.ts) — the chat
// and the Details timelines are two views of the same clock.
const WIDGET_TRANSCRIPTS: Record<string, TranscriptEntry[]> = {
  'g-1': [
    agentSays('Hi! How can I help you today?', '11:59:01 PM'),
    customerSays("I'm seeing an abnormal charge on my bank statement.", '11:59:10 PM'),
    agentSays(
      'Charges labelled that way are usually a pending authorisation or a monthly account fee. Pending authorisations clear within 3 working days, and account fees are listed in your plan summary.',
      '11:59:16 PM',
    ),
    stepChip('Fallback answer sent from knowledge', '11:59:16 PM'),
    customerSays("That doesn't explain this charge though — it's £48 and I don't recognise it.", '11:59:38 PM'),
    agentSays('I can put you through to the payments team, who can look at the charge itself. Shall I do that?', '11:59:43 PM'),
  ],
  'g-2': [
    agentSays('Hello! How can I help you?', '11:57:01 PM'),
    customerSays('How do I withdraw funds?', '11:57:09 PM'),
    agentSays(
      'Open Accounts, choose the account to withdraw from, then Withdraw. Transfers to a linked bank account arrive the same working day if you request them before 4pm.',
      '11:57:13 PM',
    ),
    customerSays('Great, thanks.', '11:57:44 PM'),
    agentSays('Happy to help. Anything else?', '11:57:48 PM'),
  ],
  'g-3': [
    agentSays('Hello! How can I help? By replying you agree to our terms.', '11:44:01 PM'),
    customerSays('How do I withdraw my investments?', '11:44:13 PM'),
    stepChip('Answer composed from knowledge', '11:44:18 PM'),
  ],
  'g-4': [
    agentSays('Hello! How can I help? By replying you agree to our terms.', '11:36:01 PM'),
    customerSays('Hi, I need to update my last name.', '11:36:09 PM'),
    agentSays("Of course — what's the new surname? I'll read it back before anything changes.", '11:36:13 PM'),
    customerSays("It's now Ferreira-Silva.", '11:36:47 PM'),
    stepChip('Triggered action: update profile', '11:36:52 PM'),
    agentSays("Thanks — I've recorded Ferreira-Silva. A specialist will confirm the change shortly.", '11:37:03 PM'),
  ],
  'g-5': [
    agentSays('Hi! How can I help you today?', '11:20:01 PM'),
    customerSays('I want a refund for order 88213.', '11:20:07 PM'),
    stepChip('Triggered action: create refund', '11:20:12 PM'),
    agentSays('Refund initiated: $42.00 · 3–5 business days.', '11:20:13 PM'),
  ],
}

// `withAudit` is Widget-only, which is the whole containment story for this
// feature: Voice and Web Call call this without it and are byte-identical.
function genericRowsFor(channelLabel: string, withAudit = false): ConvRow[] {
  return GENERIC_ROWS_BASE.map((r) => {
    const detail = detailFor(r, channelLabel)
    if (!withAudit) return { ...r, detail }
    return {
      ...r,
      detail: {
        ...detail,
        transcript: WIDGET_TRANSCRIPTS[r.id] ?? detail.transcript,
        audit: auditFor(r.id),
      },
    }
  })
}

export const CHANNELS: Record<ChannelKey, ChannelData> = {
  headless: {
    cards: [...sharedCards(1).slice(0, 3), ...HEADLESS_A2A_CARDS, ...sharedCards(1).slice(3)],
    columns: columnsFor('Conversations (10,000)', 'headless'),
    rows: HEADLESS_ROWS,
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (10,000)',
  },
  widget: {
    cards: genericCards(1, '3.5'),
    columns: columnsFor('Conversations (10,000)', 'generic', true),
    rows: genericRowsFor('Widget', true),
    dateRange: 'May 2, 2026 – Jun 1, 2026',
    convHeader: 'Conversations (10,000)',
  },
  voice: {
    cards: genericCards(0.6, '4.1'),
    columns: columnsFor('Conversations (6,000)', 'generic'),
    rows: genericRowsFor('Voice'),
    dateRange: 'May 2, 2026 – Jun 1, 2026',
    convHeader: 'Conversations (6,000)',
  },
  webcall: {
    cards: genericCards(0.3, '3.8'),
    columns: columnsFor('Conversations (3,000)', 'generic'),
    rows: genericRowsFor('Web Call'),
    dateRange: 'May 2, 2026 – Jun 1, 2026',
    convHeader: 'Conversations (3,000)',
  },
}
