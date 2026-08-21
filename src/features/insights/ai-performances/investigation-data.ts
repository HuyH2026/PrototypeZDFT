// Authored, pure data for the tier-2 metric investigation workspace. One entry per
// briefing finding (reopens / csat / escalations). No React, no storage. Copy is
// kept consistent with ./briefing-data and the ai-context-registry prompts so the
// three engagement tiers tell one coherent story. All values are illustrative.
import type { AiConversationSeed, AiScope } from '@/features/ai-studio/ai-context-registry'
import type { InsightRow } from './card-insight'
import type { StatCard } from './ai-performances-data'

export type BreakdownRow = { label: string; value: string }

export type FixAction = { text: string; tag: string }

export type ObservedChange = {
  summary: string
  bullets: string[]
  evidenceCount: string
}

export type MetricInvestigation = {
  findingId: string // matches BriefingFinding.id
  scope: AiScope // reused by the AI Studio handoff
  title: string
  subtitle: string
  badge: string
  series: { x: string; value: number }[]
  annotation: string
  peak: string
  observed: ObservedChange
  breakdownByIntent: BreakdownRow[]
  breakdownByAgent: BreakdownRow[]
  fixActions: FixAction[]
  exampleConversations: string[]
}

export const METRIC_INVESTIGATIONS: MetricInvestigation[] = [
  {
    findingId: 'reopens',
    scope: 'ai-performance-reopens',
    title: 'Tickets reopened',
    subtitle: 'Daily conversations reopened after an AI resolution',
    badge: 'Attention needed',
    series: [
      { x: 'Jul 1', value: 10 },
      { x: 'Jul 4', value: 12 },
      { x: 'Jul 7', value: 11 },
      { x: 'Jul 10', value: 13 },
      { x: 'Jul 13', value: 12 },
      { x: 'Jul 16', value: 15 },
      { x: 'Jul 19', value: 13 },
      { x: 'Jul 22', value: 18 },
      { x: 'Jul 25', value: 26 },
      { x: 'Jul 28', value: 47 },
    ],
    annotation: 'Policy v2.4 published Jul 21',
    peak: '47 reopened tickets on Jul 28',
    observed: {
      summary:
        'Reopened tickets increased 18%, with the rise beginning the week after Policy v2.4 was published.',
      bullets: [
        '61% of the increase came from Billing conversations.',
        'Widget traffic accounts for 72% of those reopens.',
        'Most affected answer: subscription cancellation eligibility.',
      ],
      evidenceCount: 'Evidence: 842 conversations',
    },
    breakdownByIntent: [
      { label: 'Subscription cancellation eligibility', value: '61%' },
      { label: 'Refund status', value: '22%' },
      { label: 'Other', value: '17%' },
    ],
    breakdownByAgent: [
      { label: 'Billing Widget Agent', value: '72%' },
      { label: 'Billing Voice Agent', value: '19%' },
      { label: 'Fallback Agent', value: '9%' },
    ],
    fixActions: [
      { text: 'Update the subscription-cancellation answer to reflect Policy v2.4', tag: 'High impact' },
      { text: 'Add a fallback for edge-case renewal-date questions', tag: 'Quick fix' },
      { text: 'Review Billing Widget Agent training data for the old policy language', tag: 'Medium effort' },
    ],
    exampleConversations: [
      'Ticket #4821 — customer asked about canceling before renewal; agent cited the outdated policy.',
      'Ticket #4903 — customer reopened after being told cancellation wasn’t possible mid-cycle.',
      'Ticket #5017 — Widget conversation escalated after conflicting cancellation guidance.',
    ],
  },
  {
    findingId: 'csat',
    scope: 'ai-performance-csat',
    title: 'CSAT',
    subtitle: 'Daily average CSAT for AI-handled Voice conversations',
    badge: 'Attention needed',
    series: [
      { x: 'Jul 1', value: 4.6 },
      { x: 'Jul 4', value: 4.5 },
      { x: 'Jul 7', value: 4.6 },
      { x: 'Jul 10', value: 4.4 },
      { x: 'Jul 13', value: 4.3 },
      { x: 'Jul 16', value: 4.2 },
      { x: 'Jul 19', value: 4.1 },
      { x: 'Jul 22', value: 4.0 },
      { x: 'Jul 25', value: 3.9 },
      { x: 'Jul 28', value: 4.0 },
    ],
    annotation: '"View bank statement" workflow handle time rose Jul 18',
    peak: 'Low of 3.9 on Jul 25',
    observed: {
      summary:
        'Voice-channel CSAT fell 12% over the last 7 days, concentrated in longer conversations.',
      bullets: [
        'The "view bank statement" workflow shows the steepest CSAT drop.',
        'Handle time on that workflow rose 40% in the same window.',
        'Widget CSAT held steady over the period.',
      ],
      evidenceCount: 'Evidence: 512 conversations',
    },
    breakdownByIntent: [
      { label: 'View bank statement', value: '58%' },
      { label: 'Dispute a charge', value: '24%' },
      { label: 'Other', value: '18%' },
    ],
    breakdownByAgent: [
      { label: 'Voice Support Agent', value: '81%' },
      { label: 'Voice Billing Agent', value: '19%' },
    ],
    fixActions: [
      { text: 'Shorten the "view bank statement" workflow to reduce handle time', tag: 'High impact' },
      { text: 'Add a quick-reply shortcut for common statement requests', tag: 'Quick fix' },
      { text: 'Review Voice Support Agent prompts for unnecessary confirmation steps', tag: 'Medium effort' },
    ],
    exampleConversations: [
      'Call #2210 — customer waited through 3 confirmation steps before getting a statement.',
      'Call #2265 — handle time exceeded 6 minutes for a routine balance question.',
      'Call #2301 — customer rated 2/5, citing a slow, repetitive verification flow.',
    ],
  },
  {
    findingId: 'escalations',
    scope: 'ai-performance-escalations',
    title: 'Escalations to a human',
    subtitle: 'Daily AI conversations handed off to a human agent',
    badge: 'Attention needed',
    series: [
      { x: 'Jul 1', value: 120 },
      { x: 'Jul 4', value: 118 },
      { x: 'Jul 7', value: 125 },
      { x: 'Jul 10', value: 122 },
      { x: 'Jul 13', value: 130 },
      { x: 'Jul 16', value: 128 },
      { x: 'Jul 19', value: 140 },
      { x: 'Jul 22', value: 150 },
      { x: 'Jul 25', value: 158 },
      { x: 'Jul 28', value: 165 },
    ],
    annotation: 'Agent update shipped Jul 19',
    peak: '165 escalations on Jul 28',
    observed: {
      summary:
        'Human-escalation rate rose 22% week over week, mostly on one intent.',
      bullets: [
        'The "update profile" intent drove most of the increase.',
        'The rise begins right after the last agent change on Jul 19.',
        'Escalations from other intents were flat.',
      ],
      evidenceCount: 'Evidence: 388 conversations',
    },
    breakdownByIntent: [
      { label: 'Update profile', value: '64%' },
      { label: 'Account recovery', value: '20%' },
      { label: 'Other', value: '16%' },
    ],
    breakdownByAgent: [
      { label: 'Account Services Agent', value: '70%' },
      { label: 'Fallback Agent', value: '30%' },
    ],
    fixActions: [
      { text: 'Audit the "update profile" flow introduced in the last agent change', tag: 'High impact' },
      { text: 'Add a direct self-serve path for profile field updates', tag: 'Quick fix' },
      { text: 'Roll back or gate the agent change behind a smaller test cohort', tag: 'Medium effort' },
    ],
    exampleConversations: [
      'Ticket #6104 — profile update request escalated after the agent looped on verification.',
      'Ticket #6142 — customer asked to update an address; agent handed off without attempting it.',
      'Ticket #6188 — repeated escalations tied to the same "update profile" intent since Jul 19.',
    ],
  },
]

export const CARD_TITLE_BY_FINDING: Record<string, string> = {
  reopens: 'Tickets reopened',
  csat: 'CSAT',
  escalations: 'Escalations to a human',
}

export function investigationById(id: string): MetricInvestigation | undefined {
  return METRIC_INVESTIGATIONS.find((m) => m.findingId === id)
}

export function findingIdForCard(cardTitle: string): string | undefined {
  const entry = Object.entries(CARD_TITLE_BY_FINDING).find(([, title]) => title === cardTitle)
  return entry?.[0]
}

export function toConversationSeed(inv: MetricInvestigation): AiConversationSeed {
  return {
    title: inv.title,
    messages: [
      {
        id: 'seed-assistant',
        role: 'assistant',
        text: inv.observed.summary,
        attachments: [
          {
            type: 'chart',
            title: inv.title,
            series: inv.series,
            annotation: inv.annotation,
            peak: inv.peak,
          },
          {
            type: 'list',
            title: 'What we found',
            items: inv.observed.bullets,
            footnote: inv.observed.evidenceCount,
          },
        ],
        recommendations: ['Explain this change', 'Break down by intent', 'Compare agents'],
      },
    ],
    responses: {
      'Explain this change': {
        text: `${inv.observed.summary} ${inv.observed.bullets[0]}`,
        recommendations: ['What should I fix first?', 'Show example conversations'],
      },
      'Break down by intent': {
        text: `Here's the ${inv.title.toLowerCase()} change broken down by intent.`,
        attachments: [{ type: 'breakdown', title: 'By intent', rows: inv.breakdownByIntent }],
      },
      'Compare agents': {
        text: `Here's the ${inv.title.toLowerCase()} change broken down by agent.`,
        attachments: [{ type: 'breakdown', title: 'By agent', rows: inv.breakdownByAgent }],
      },
      'What should I fix first?': {
        text: `Here's what I'd prioritize for the ${inv.title.toLowerCase()} change.`,
        attachments: [{ type: 'actions', title: 'Recommended fixes', items: inv.fixActions }],
      },
      'Show example conversations': {
        text: `Here are a few conversations that show the ${inv.title.toLowerCase()} pattern.`,
        attachments: [{ type: 'list', title: 'Example conversations', items: inv.exampleConversations }],
      },
    },
  }
}

export function toStatCardConversationSeed(
  card: StatCard,
  _tone: 'attention' | 'improved',
  rows: InsightRow[],
): AiConversationSeed {
  const text = card.insight.detail
    ? `${card.insight.headline} ${card.insight.detail}`
    : card.insight.headline

  return {
    title: card.title,
    messages: [
      {
        id: 'seed-assistant',
        role: 'assistant',
        text,
        attachments: [
          {
            type: 'list',
            title: 'What changed',
            items: rows.map((row) => `${row.label}: ${row.value} (${row.delta.label})`),
          },
        ],
      },
    ],
  }
}
