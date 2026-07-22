// Mock AI Studio "quick win" suggestions for the CX Journey Topics context.
// Card 1 is verbatim from the Figma reference (node 846:62113); cards 2-3 are
// illustrative, drawn from the largest topics in the treemap (Billing, Account
// management). Presentation-only — the figures are mock, not backed by data.
export type TopicSuggestion = {
  id: string
  title: string
  bullets: string[]
  cta: string
}

export const TOPIC_SUGGESTIONS: TopicSuggestion[] = [
  {
    id: 'create-new-ticket-leak',
    title: 'Fix "Create New Ticket" leak',
    bullets: [
      '3,653 unresolved conversations',
      'only 7% resolutions',
      '~$54,795 in recoverable savings',
      'CSAT at 3.91 (your lowest of the high-volume topics)',
    ],
    cta: 'Show me the tickets',
  },
  {
    id: 'billing-deflection',
    title: 'Deflect Billing questions',
    bullets: [
      '1,567 tickets (your highest-volume topic)',
      'only 22% self-served today',
      '~$38,200 in recoverable savings',
      'a single macro could cover the top 3 intents',
    ],
    cta: 'Draft a macro',
  },
  {
    id: 'account-coaching',
    title: 'Coach on Account management',
    bullets: [
      '61% of replies needed a second touch',
      'agent reply time 2.4x your topic average',
      '~$21,450 in avoidable handling cost',
      'CSAT dips to 3.7 on escalated threads',
    ],
    cta: 'Review conversations',
  },
]
