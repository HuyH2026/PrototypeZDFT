export type ImpactMode = 'Use cases' | 'Content snippets'
export type ImpactStatus = 'Active' | 'Inactive'
export type ImpactMetric = { value: string; label: string; help: string }
export type ImpactRow = {
  name: string
  topic: string
  ticketReduction: string
  costReduction: string
  status: ImpactStatus
  action: string
}

const COST_HELP =
  'Estimated using $15 per ticket avoided'

const SHARED_IMPACT_METRICS: ImpactMetric[] = [
  {
    value: '847',
    label: 'Tickets avoided',
    help: 'Issues resolved automatically',
  },
  {
    value: '267.2 hrs',
    label: 'Resolution time saved',
    help: 'Time saved by resolving customer issues faster',
  },
  { value: '$10,485', label: 'Cost savings', help: COST_HELP },
]

export const IMPACT_METRICS: Record<ImpactMode, ImpactMetric[]> = {
  'Use cases': SHARED_IMPACT_METRICS,
  'Content snippets': SHARED_IMPACT_METRICS,
}

export const USE_CASE_IMPACT_ROWS: ImpactRow[] = [
  {
    name: 'Card ETA',
    topic: 'Account Login Issues',
    ticketReduction: '44',
    costReduction: '$660',
    status: 'Active',
    action: 'View use case',
  },
  {
    name: 'Password Reset',
    topic: 'Account Approval Delays',
    ticketReduction: '2',
    costReduction: '$30',
    status: 'Active',
    action: 'View use case',
  },
  {
    name: 'Transaction Disputes',
    topic: 'Withdrawal and Deposit ...',
    ticketReduction: '1',
    costReduction: '$15',
    status: 'Active',
    action: 'View use case',
  },
  {
    name: 'Account Lock Issues',
    topic: 'Account Unlock Docume...',
    ticketReduction: 'n/a',
    costReduction: 'n/a',
    status: 'Inactive',
    action: 'Activate use case',
  },
]

export const CONTENT_SNIPPET_IMPACT_ROWS: ImpactRow[] = [
  {
    name: 'Refund Processing Ti...',
    topic: 'n/a',
    ticketReduction: '0',
    costReduction: '$0',
    status: 'Inactive',
    action: 'Activate content snippet',
  },
  {
    name: 'Resolving Account Lo...',
    topic: 'Account Login Issues',
    ticketReduction: '3',
    costReduction: '$45',
    status: 'Active',
    action: 'View content snippet',
  },
  {
    name: 'Roth 401k',
    topic: 'n/a',
    ticketReduction: '6',
    costReduction: '$90',
    status: 'Active',
    action: 'View content snippet',
  },
  {
    name: 'Resolving Account Ap...',
    topic: 'Account Approval Delays',
    ticketReduction: '0',
    costReduction: '$0',
    status: 'Inactive',
    action: 'Activate content snippet',
  },
  {
    name: 'How to Resolve Issues ...',
    topic: 'Withdrawal and Deposit ...',
    ticketReduction: '14',
    costReduction: '$210',
    status: 'Active',
    action: 'View content snippet',
  },
  {
    name: 'How to Unlock Your Ac...',
    topic: 'Account Unlock Docume...',
    ticketReduction: '0',
    costReduction: '$0',
    status: 'Inactive',
    action: 'Activate content snippet',
  },
]
