// Mock data + types for the Insights → AI Performance → Conversations tab.
// Frontend-only; no backend. The tab is channel-scoped: each ChannelKey maps to
// its own card set, table columns and rows. The reference frame (Figma 215-8805)
// shows the Headless channel, whose cards/columns are A2A-specific; the other
// channels share the six generic cards and fill the A2A slots with
// channel-appropriate cards (per the design spec).
import { C1, C2, C3, C4, C5, C6, C7 } from '../ai-performances-data'

export type ChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'

export const CONV_CHANNEL_TABS: { id: ChannelKey; label: string }[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'voice', label: 'Voice' },
  { id: 'webcall', label: 'Web Call' },
  { id: 'headless', label: 'Headless' },
]

// --- Card archetypes (discriminated on `kind`) -----------------------------
export type BarSegment = { label: string; count: string; pct: string; color: string }
export type StackedBarCard = { kind: 'stacked'; title: string; value: string; segments: BarSegment[] }

export type DonutSlice = { name: string; count: string; value: number; color: string }
export type DonutCardData = {
  kind: 'donut'
  title: string
  center: string
  centerLabel: string
  slices: DonutSlice[]
}

export type RankRow = { label: string; value: number; count: string }
export type RankedBarCard = {
  kind: 'ranked'
  title: string
  total: string
  totalLabel: string
  color: string
  rows: RankRow[]
}

export type ConvCard = StackedBarCard | DonutCardData | RankedBarCard

// --- Table -----------------------------------------------------------------
export type ConvColumnId = 'timestamp' | 'automated' | 'source' | 'client' | 'agents' | 'transcript'
export type ConvColumn = { id: ConvColumnId; label: string }
export type SourceKind = 'human' | 'a2a' | 'mcp'

// --- Conversation Details panel ---------------------------------------------
export type EventItem = { label: string; client: string; duration: string; sublink?: string }
export type TranscriptStep = { kind: 'step'; text: string }
export type TranscriptBubble = {
  kind: 'bubble'
  speaker: string
  role: string
  text: string
  side: 'client' | 'solve'
}
export type TranscriptEntry = TranscriptBubble | TranscriptStep

export type ConvDetail = {
  conversationId: string
  automated: string
  source: SourceKind
  clientLabel?: string
  clientValue?: string
  deflected: string
  resolved: string
  timeCreated: string
  timeSpent: string
  channel: string
  interactions: string
  contextVariables: string
  clientQuery: string
  events: EventItem[]
  resolutionBadge: string
  resolutionText: string
  signals: string[]
  transcriptIntro: string
  transcript: TranscriptEntry[]
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
  detail: ConvDetail
}

export type ChannelData = {
  cards: ConvCard[]
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

// The six cards shared by every channel. Numbers vary a little per channel via a
// factory so the four tabs don't render byte-identical grids.
function sharedCards(scale: number): ConvCard[] {
  const n = (base: number) => Math.round(base * scale)
  const total = n(45000)
  const automated = n(36000)
  const deflected = n(28800)
  return [
    {
      kind: 'stacked',
      title: 'Total conversations',
      value: total.toLocaleString(),
      segments: [
        { label: 'Automated', count: automated.toLocaleString(), pct: '80%', color: C5 },
        { label: 'Non automated', count: (total - automated).toLocaleString(), pct: '20%', color: '#b9bec7' },
      ],
    },
    {
      kind: 'stacked',
      title: 'Deflections',
      value: `${deflected.toLocaleString()} (80%)`,
      segments: [
        { label: 'deflected', count: deflected.toLocaleString(), pct: '80%', color: C1 },
        { label: 'not deflected', count: (total - deflected - n(9000)).toLocaleString(), pct: '20%', color: C2 },
      ],
    },
    {
      kind: 'donut',
      title: 'Resolutions',
      center: '80%',
      centerLabel: '',
      slices: [
        { name: 'verified', count: n(17280).toLocaleString(), value: 80, color: C7 },
        { name: 'contained', count: n(11520).toLocaleString(), value: 20, color: '#8fd3c8' },
      ],
    },
    {
      kind: 'donut',
      title: 'Sentiment',
      center: '80%',
      centerLabel: '',
      slices: [
        { name: 'positive', count: n(964).toLocaleString(), value: 80, color: C7 },
        { name: 'neutral', count: n(200).toLocaleString(), value: 8, color: '#8fd3c8' },
        { name: 'negative', count: n(737).toLocaleString(), value: 12, color: C2 },
      ],
    },
    {
      kind: 'donut',
      title: 'Relevance',
      center: '75%',
      centerLabel: 'relevant calls',
      slices: [
        { name: 'relevant', count: n(6000).toLocaleString(), value: 75, color: C3 },
        { name: 'somewhat relevant', count: n(1000).toLocaleString(), value: 13, color: '#7fb3e8' },
        { name: 'irrelevant', count: n(1000).toLocaleString(), value: 12, color: C2 },
      ],
    },
    {
      kind: 'donut',
      title: 'Engagement',
      center: '75%',
      centerLabel: '',
      slices: [
        { name: 'yes', count: n(6000).toLocaleString(), value: 75, color: C3 },
        { name: 'no', count: n(2000).toLocaleString(), value: 25, color: C2 },
      ],
    },
  ]
}

// The three A2A-specific cards (Headless only), filling grid slots 4–6.
const HEADLESS_A2A_CARDS: ConvCard[] = [
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

// The three substitute cards for Widget / Voice / Web Call (same grid slots).
function substituteCards(topIntentLabel: string): ConvCard[] {
  return [
    {
      kind: 'donut',
      title: 'CSAT',
      center: '4.3',
      centerLabel: 'avg. rating',
      slices: [
        { name: 'promoters', count: '3,120', value: 70, color: C7 },
        { name: 'passives', count: '820', value: 18, color: '#8fd3c8' },
        { name: 'detractors', count: '540', value: 12, color: C2 },
      ],
    },
    {
      kind: 'ranked',
      title: 'Top intents',
      total: '5,064',
      totalLabel: 'Total intents',
      color: C3,
      rows: [
        { label: topIntentLabel, value: 3654, count: '3,654' },
        { label: 'Refund request', value: 554, count: '554' },
        { label: 'Update profile', value: 424, count: '424' },
        { label: 'Track order', value: 277, count: '277' },
        { label: 'Cancel plan', value: 155, count: '155' },
      ],
    },
    {
      kind: 'stacked',
      title: 'Avg. response time',
      value: '1.3 sec',
      segments: [
        { label: 'under 2s', count: '38,400', pct: '85%', color: C1 },
        { label: 'over 2s', count: '6,600', pct: '15%', color: C4 },
      ],
    },
  ]
}

// Column labels are derived from each channel's `convHeader` (the source of
// truth for the transcript-column count) so the two never drift apart.
function columnsFor(convHeader: string, a2a: boolean): ConvColumn[] {
  const cols: ConvColumn[] = [
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'automated', label: 'Automated' },
  ]
  if (a2a) cols.push({ id: 'source', label: 'Source' }, { id: 'client', label: 'Calling client' })
  cols.push({ id: 'agents', label: 'Detected agents' }, { id: 'transcript', label: convHeader })
  return cols
}

// Wording that varies by conversation source (matches the two Figma frames).
function sourceWording(source: SourceKind) {
  if (source === 'a2a') return { clientLabel: 'Calling client', intro: 'Conversation started between agents' }
  if (source === 'mcp') return { clientLabel: 'MCP client', intro: 'Conversation started between MCP and agent' }
  return { clientLabel: undefined, intro: 'Conversation started' }
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
  }))
}

// The exact A2A booking transcript from Figma frame 145-77530.
const A2A_TRANSCRIPT: TranscriptEntry[] = [
  { kind: 'bubble', speaker: 'OpenClaw', role: 'Calling client', side: 'client', text: 'Delegation token verified · acting for Jane R. · scope: book_travel · max $500 · exp 2h' },
  { kind: 'step', text: 'Detected intent: book flight' },
  { kind: 'bubble', speaker: 'Booking', role: 'Solve', side: 'solve', text: 'flight: DL428 · SFO→JFK · Fri 9:15a\nfare: $462 · aisle 14C\ncapability: book_flight' },
  { kind: 'step', text: 'Triggered action: search flights' },
  { kind: 'bubble', speaker: 'OpenClaw', role: 'Calling client', side: 'client', text: 'intent: book_flight\noffer_id: ofr_9c2a · amount: $462' },
  { kind: 'step', text: 'Triggered action: book flight' },
  { kind: 'bubble', speaker: 'Booking', role: 'Solve', side: 'solve', text: 'pnr: DL-7XQ2P · seat: 14C · charged: $462' },
]

// The exact MCP SAML transcript from Figma frame 145-77713.
const MCP_TRANSCRIPT: TranscriptEntry[] = [
  { kind: 'bubble', speaker: 'Claude Desktop', role: 'Calling client', side: 'client', text: 'tool call → solve.search(query: "SAML SSO setup steps")' },
  { kind: 'step', text: 'Triggered knowledge article' },
  { kind: 'bubble', speaker: 'Knowledge', role: 'Solve', side: 'solve', text: 'article: Setting up SAML SSO · confidence: 0.94' },
]

export function detailFor(row: Omit<ConvRow, 'detail'>, channelLabel: string): ConvDetail {
  const w = sourceWording(row.source)
  const base: ConvDetail = {
    conversationId: `3e732807-c2d0-4ce3-8b5e-c87c28abb7e8`,
    automated: row.automated ? 'Yes' : 'No',
    source: row.source,
    clientLabel: w.clientLabel,
    clientValue: row.client === 'n/a' ? undefined : row.client,
    deflected: 'Yes',
    resolved: 'Verified',
    timeCreated: 'May 17, 2026 6:47:50 pm',
    timeSpent: '2 min 30 sec',
    channel: channelLabel,
    interactions: '4',
    contextVariables: '$userId (NO USER), $logged (true)',
    clientQuery: 'Booking flight',
    events: [
      { label: 'Flight reservation', client: row.client === 'n/a' ? 'Solve' : row.client, duration: '34 sec' },
      { label: 'Booking reservations', client: 'Solve', duration: '1 min 15 sec', sublink: 'Booking reservation' },
    ],
    resolutionBadge: 'Verified',
    resolutionText:
      'Flight change request received and processed. Available options, fare rules, and next steps were confirmed based on current availability. No further input was provided, counted as implicit confirmation. Signals: Meaningful Query (High positive), Implicit Confirmation (Low positive), Knowledge Reply (High positive), Self-Service (Medium positive). No negative signals detected.',
    signals: ['Request detected', 'Issue solved', 'Left without confirming'],
    transcriptIntro: w.intro,
    transcript: bubblesFromLines(row.transcript, row.source, row.client),
  }

  // The two Figma reference rows get their exact designed content.
  if (row.source === 'a2a' && row.client === 'OpenClaw') {
    return { ...base, clientQuery: 'Booking flight', interactions: '4', transcript: A2A_TRANSCRIPT }
  }
  if (row.source === 'mcp' && row.client === 'Claude Desktop') {
    return {
      ...base,
      clientQuery: 'SAML SSO setup',
      interactions: '2',
      events: [
        { label: 'SAML SSO', client: 'Claude Desktop', duration: '34 sec' },
        { label: 'Knowledge Agent', client: 'Solve', duration: '1 min 15 sec', sublink: 'Knowledge agent' },
      ],
      resolutionText:
        'SAML SSO configuration request received and processed via MCP connection. Identity provider metadata was retrieved, assertion parameters validated, and SSO settings applied to the target environment. No further input was provided, counted as implicit confirmation. Signals: Meaningful Query (High positive), Implicit Confirmation (Low positive), Configuration Applied (High positive), Self-Service (Medium positive). No negative signals detected.',
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

// Non-headless rows reuse the same transcripts minus the A2A-only fields.
// Built per-channel so the detail panel's `channel` field reflects the tab
// the row is actually shown under (Widget / Voice / Web Call).
function simpleRowsFor(channelLabel: string): ConvRow[] {
  return HEADLESS_ROWS_BASE.map((r, i) => {
    const base: Omit<ConvRow, 'detail'> = { ...r, id: `s-${i + 1}`, source: 'human', client: 'n/a' }
    return { ...base, detail: detailFor(base, channelLabel) }
  })
}

export const CHANNELS: Record<ChannelKey, ChannelData> = {
  headless: {
    cards: [...sharedCards(1).slice(0, 3), ...HEADLESS_A2A_CARDS, ...sharedCards(1).slice(3)],
    columns: columnsFor('Conversations (10,000)', true),
    rows: HEADLESS_ROWS,
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (10,000)',
  },
  widget: {
    cards: [...sharedCards(1.4).slice(0, 3), ...substituteCards('View bank statement'), ...sharedCards(1.4).slice(3)],
    columns: columnsFor('Conversations (32,000)', false),
    rows: simpleRowsFor('Widget'),
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (32,000)',
  },
  voice: {
    cards: [...sharedCards(0.6).slice(0, 3), ...substituteCards('Billing question'), ...sharedCards(0.6).slice(3)],
    columns: columnsFor('Conversations (12,000)', false),
    rows: simpleRowsFor('Voice'),
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (12,000)',
  },
  webcall: {
    cards: [...sharedCards(0.3).slice(0, 3), ...substituteCards('Technical support'), ...sharedCards(0.3).slice(3)],
    columns: columnsFor('Conversations (6,000)', false),
    rows: simpleRowsFor('Web Call'),
    dateRange: 'Nov 7, 2023 – Dec 6, 2023',
    convHeader: 'Conversations (6,000)',
  },
}
