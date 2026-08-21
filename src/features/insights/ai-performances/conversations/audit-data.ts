// Execution-error audit trail for the Insights → AI Performance → Conversations
// drawer. Frontend-only mock, Widget channel only: `auditFor` knows the five
// Widget row ids and nothing else, which is how Voice / Web Call / Headless keep
// rendering exactly as they did before.
//
// Counts, the affected exchange and each strip's tone are DERIVED from
// `exchanges` (see countFor / errorCount / firstErrorExchange) rather than
// authored — an error count that can disagree with the events it counts is a bug
// waiting to happen.
//
// `evidence` strings are deliberately allowlist-safe summaries: a request is
// described, never dumped. That is the source-side redaction assumption the
// design carries, honoured in the mock content so a later real integration has a
// shape to match.
//
// This module imports nothing from its siblings, so `conversations-data.ts` can
// import the types from here without a cycle.

export type ImpactState =
  | 'Answer delivered'
  | 'Fallback delivered'
  | 'Handoff initiated'
  | 'System response absent'
  | 'Delivery unknown'
  | 'Impact undetermined'

export const IMPACT_STATES: ImpactState[] = [
  'Answer delivered',
  'Fallback delivered',
  'Handoff initiated',
  'System response absent',
  'Delivery unknown',
  'Impact undetermined',
]

export type OwnerDomain =
  | 'Configuration'
  | 'Workflow'
  | 'Knowledge'
  | 'Integration'
  | 'Platform / engineering'
  | 'Operations'
  | 'Unassigned / needs triage'

export const OWNER_DOMAINS: OwnerDomain[] = [
  'Configuration',
  'Workflow',
  'Knowledge',
  'Integration',
  'Platform / engineering',
  'Operations',
  'Unassigned / needs triage',
]

export type AuditEventKind = 'intent' | 'retrieval' | 'api' | 'tool' | 'step' | 'error'
export type ConvState = 'healthy' | 'partial failure' | 'unresolved'

// A retrieved knowledge source: title + version as a link, never the article
// body — the drawer cites sources, it does not re-publish them.
export type SourceRef = { title: string; version: string; href: string }

// The remediation block an error event carries: the Log page's "How to fix"
// guidance plus the Autoflow/policy the failed step belongs to.
export type ErrorFix = {
  steps: string[]
  flowId: string // /insights/automations/:id
  flowName: string
}

export type AuditEvent = {
  kind: AuditEventKind
  detail: string // plain language, always visible once expanded
  time: string
  // How long this turn / call took, in milliseconds. Explicit (not derived
  // from adjacent timestamps) so it persists for every turn and tool/API call
  // — a hard requirement from Fetch — and so a gap in the trace can never be
  // misread as a step's own latency.
  latencyMs: number
  evidence: string // safe secondary detail, one line beneath
  category?: string // errors only — 'Missing context variable'
  severity?: 'high' | 'medium' | 'low' // errors only
  errorId?: string // errors only
  fix?: ErrorFix // errors only
  sources?: SourceRef[] // retrieval only
  payload?: { request: object; response: string | object } // API/tool only
}

export type ConvAudit = {
  state: ConvState
  traceId: string // preserved on the drawer's identity grid, next to Chat ID
  impact: ImpactState
  owner?: OwnerDomain // absent when healthy
  ownerEvidence?: string
  exchanges: AuditEvent[][] // index i ↔ derived transcript exchange i
}

// The chip in the table and the chip in the drawer's error card read from the
// same map, so the two surfaces cannot disagree about a conversation's state.
// The reds are one-offs: the status scale in theme.css has no "deeper red" step.
export const STATE_META: Record<ConvState, { label: string; fg: string; bg: string }> = {
  healthy: { label: 'Healthy', fg: '#4a4f56', bg: '#f1f2f4' },
  'partial failure': { label: 'Partial failure', fg: '#c92a2a', bg: '#fdecec' },
  unresolved: { label: 'Unresolved', fg: '#8c1c1c', bg: '#f9dcdc' },
}

// Menu order: errors first, because that is what the menu gets opened for, then
// the kinds in the order they occur within a turn. `Intents` is here even though
// the requirements name only the other five — a kind no filter can select is a
// hole the user would find by noticing events vanish.
export const EVIDENCE_KINDS: { kind: AuditEventKind; label: string }[] = [
  { kind: 'error', label: 'Errors' },
  { kind: 'intent', label: 'Intents' },
  { kind: 'retrieval', label: 'Sources' },
  { kind: 'api', label: 'APIs' },
  { kind: 'tool', label: 'Tools' },
  { kind: 'step', label: 'Steps' },
]

// Singular forms for the per-event chip in the expanded timeline ("Source",
// not "Sources" — the menu counts a set, a chip names one event).
export const KIND_CHIP: Record<AuditEventKind, string> = {
  error: 'Error',
  intent: 'Intent',
  retrieval: 'Source',
  api: 'API',
  tool: 'Tool',
  step: 'Step',
}

export function allEvents(audit: ConvAudit): AuditEvent[] {
  return audit.exchanges.flat()
}

export function countFor(audit: ConvAudit, kind: AuditEventKind): number {
  return allEvents(audit).filter((e) => e.kind === kind).length
}

export function errorCount(audit: ConvAudit): number {
  return countFor(audit, 'error')
}

// The exchange "Go to it" jumps to. -1 when the conversation has no error, which
// is every healthy row.
export function firstErrorExchange(audit: ConvAudit): number {
  return audit.exchanges.findIndex((events) => events.some((e) => e.kind === 'error'))
}

// The error events across every exchange, paired with the exchange index so the
// drawer's error list can jump each entry to the turn it failed in.
export function errorEvents(audit: ConvAudit): { event: AuditEvent; exchange: number }[] {
  return audit.exchanges.flatMap((events, exchange) =>
    events.filter((e) => e.kind === 'error').map((event) => ({ event, exchange })),
  )
}

// Persistent per-event latency: under a second renders as ms, otherwise as
// seconds with a single trimmed decimal (840ms, 1.4s, 10s).
export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1).replace(/\.0$/, '')}s`
}

// Sensitive fields that should be redacted in request/response payloads.
const REDACTED_FIELDS = new Set([
  'account_id',
  'email',
  'phone',
  'ssn',
  'customer_id',
  'user_id',
  'password',
  'token',
  'api_key',
  'credit_card',
  'card_number',
  'cvv',
  'address',
  'name',
  'first_name',
  'last_name',
])

// Recursively redact sensitive fields in an object. Returns a new object with
// sensitive fields replaced by the string "Redacted".
export function redactPayload(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(redactPayload)

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_FIELDS.has(key.toLowerCase())) {
      result[key] = 'Redacted'
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactPayload(value)
    } else {
      result[key] = value
    }
  }
  return result
}

const GREETING_STEP: AuditEvent = {
  kind: 'step',
  detail: 'Session opened; the segment greeting was sent.',
  time: '11:59:01 PM',
  latencyMs: 320,
  evidence: "segment 'Retail banking' · greeting template v3",
}

// The Autoflows each failing step belongs to, so "View failed step" can open
// the real policy surface. These two are the only catalogue automations whose
// domains match the authored errors.
const FLOW_REFUND = { flowId: 'a2', flowName: 'Refund request' }
const FLOW_FOLLOW_UP = { flowId: 'a1', flowName: 'Call users with issues' }

// --- The five authored Widget scenarios ------------------------------------
// Three impact states, three owner domains including the triage case, and a
// non-zero count for every evidence kind somewhere in the set. The two healthy
// rows matter as much as the three failures: they are what proves the design is
// quiet when nothing is wrong.
const WIDGET_AUDITS: Record<string, ConvAudit> = {
  // g-1 · abnormal bank statement — the worked example from the design.
  'g-1': {
    state: 'partial failure',
    traceId: 'tr_01J9XW4K8Q2M7Z3N6V0B5T8YC',
    impact: 'Fallback delivered',
    owner: 'Configuration',
    ownerEvidence: 'the failing step is a context variable the Widget segment supplies',
    exchanges: [
      [GREETING_STEP],
      [
        {
          kind: 'intent',
          detail: 'Statement-charge policy selected.',
          time: '11:59:12 PM',
          latencyMs: 410,
          evidence: 'intent = statement_charge · confidence 0.94',
        },
        {
          kind: 'retrieval',
          detail: 'Knowledge search returned 2 matching articles.',
          time: '11:59:13 PM',
          latencyMs: 640,
          evidence: '2 sources cited',
          sources: [
            {
              title: 'Understanding statement charges',
              version: 'v12',
              href: 'https://help.example.com/articles/understanding-statement-charges',
            },
            {
              title: 'Pending authorisations explained',
              version: 'v4',
              href: 'https://help.example.com/articles/pending-authorisations-explained',
            },
          ],
        },
        {
          kind: 'api',
          detail: 'Account-status lookup attempted to personalise the answer.',
          time: '11:59:14 PM',
          latencyMs: 380,
          evidence: 'request summary available · customer data omitted from the drawer',
          payload: {
            request: redactPayload({
              account_id: 'acc_8472910',
              scope: 'status',
              include_pending: true,
            }) as object,
            response: "Not captured — payload wasn't retained; absence state, not an error",
          },
        },
        {
          kind: 'error',
          category: 'Missing context variable',
          severity: 'high',
          errorId: 'err_9f2c41a7',
          detail: 'the account identifier was unavailable for the account-status request.',
          time: '11:59:14 PM',
          latencyMs: 5,
          evidence: 'configuration / context availability · `$account_id` unavailable',
          fix: {
            steps: [
              "Add `$account_id` to the Widget segment's context variables so the lookup receives it on every session.",
              'Add a fallback to the Autoflow so the account-status step is skipped — not attempted — when `$account_id` is absent.',
            ],
            ...FLOW_FOLLOW_UP,
          },
        },
        {
          kind: 'step',
          detail: 'Fallback generated a general explanation from the retrieved articles.',
          time: '11:59:16 PM',
          latencyMs: 1800,
          evidence: 'cited knowledge source · fallback answer reached the customer',
        },
      ],
      [
        {
          kind: 'intent',
          detail: 'Follow-up classified as the same statement-charge policy.',
          time: '11:59:41 PM',
          latencyMs: 390,
          evidence: 'intent = statement_charge · confidence 0.88',
        },
        {
          kind: 'step',
          detail: 'Handoff to the payments team offered after the second unresolved attempt.',
          time: '11:59:43 PM',
          latencyMs: 700,
          evidence: 'policy: offer handoff after one unresolved personalisation attempt',
        },
      ],
    ],
  },

  // g-2 · withdraw funds — healthy, and silent throughout.
  'g-2': {
    state: 'healthy',
    traceId: 'tr_01J9XW4M2R8Q5N1Z7V4B0T3YA',
    impact: 'Answer delivered',
    exchanges: [
      [{ ...GREETING_STEP, time: '11:57:01 PM' }],
      [
        {
          kind: 'intent',
          detail: 'Withdrawal policy selected.',
          time: '11:57:10 PM',
          latencyMs: 380,
          evidence: 'intent = withdraw_funds · confidence 0.96',
        },
        {
          kind: 'retrieval',
          detail: 'Knowledge search returned 3 matching articles.',
          time: '11:57:11 PM',
          latencyMs: 590,
          evidence: '3 sources cited',
          sources: [
            {
              title: 'Withdrawing available funds',
              version: 'v8',
              href: 'https://help.example.com/articles/withdrawing-available-funds',
            },
            {
              title: 'Linked bank accounts',
              version: 'v3',
              href: 'https://help.example.com/articles/linked-bank-accounts',
            },
            {
              title: 'Transfer timings and cut-offs',
              version: 'v6',
              href: 'https://help.example.com/articles/transfer-timings-and-cut-offs',
            },
          ],
        },
        {
          kind: 'step',
          detail: 'Answer composed from the top article and delivered.',
          time: '11:57:13 PM',
          latencyMs: 1400,
          evidence: 'cited knowledge source · delivery confirmed',
        },
      ],
      [
        {
          kind: 'step',
          detail: 'Conversation closed on customer confirmation.',
          time: '11:57:48 PM',
          latencyMs: 250,
          evidence: 'no further customer message within the session window',
        },
      ],
    ],
  },

  // g-3 · how do I withdraw my investments — an answer was composed and no
  // delivery event was recorded. "Unresolved", not "failure": the evidence does
  // not support asserting the customer never saw it.
  'g-3': {
    state: 'unresolved',
    traceId: 'tr_01J9XW4P7K3M9Z2N5V8B1T6YD',
    impact: 'Delivery unknown',
    owner: 'Unassigned / needs triage',
    ownerEvidence: 'the evidence does not show which system dropped the answer',
    exchanges: [
      [
        {
          kind: 'step',
          detail: 'Session opened; greeting and terms notice sent.',
          time: '11:44:01 PM',
          latencyMs: 300,
          evidence: "segment 'Wealth' · terms notice v2",
        },
      ],
      [
        {
          kind: 'intent',
          detail: 'Investment-withdrawal policy selected.',
          time: '11:44:15 PM',
          latencyMs: 420,
          evidence: 'intent = withdraw_investments · confidence 0.91',
        },
        {
          kind: 'retrieval',
          detail: 'Knowledge search returned 1 matching article.',
          time: '11:44:16 PM',
          latencyMs: 610,
          evidence: '1 source cited',
          sources: [
            {
              title: 'Selling and withdrawing investments',
              version: 'v9',
              href: 'https://help.example.com/articles/selling-and-withdrawing-investments',
            },
          ],
        },
        {
          kind: 'step',
          detail: 'Answer composed from the retrieved article.',
          time: '11:44:18 PM',
          latencyMs: 1250,
          evidence: 'cited knowledge source · composition completed',
        },
        {
          kind: 'error',
          category: 'No delivery event recorded',
          severity: 'medium',
          errorId: 'err_4d81b06e',
          detail: 'the composed answer has no matching delivery event for this session.',
          time: '11:44:19 PM',
          latencyMs: 4,
          evidence: 'platform / delivery telemetry · no delivery event within the session window',
          fix: {
            steps: [
              'Check the Widget delivery webhook for this session — the compose step completed, so the drop is downstream of it.',
              'Enable delivery acknowledgements on the Widget channel so composed answers record a delivery event.',
            ],
            ...FLOW_FOLLOW_UP,
          },
        },
      ],
    ],
  },

  // g-4 · update my last name — the tool timeout, and the only row with a
  // non-zero Tools count in its failing exchange.
  'g-4': {
    state: 'partial failure',
    traceId: 'tr_01J9XW4S6N1Q4M8Z3V7B2T9YF',
    impact: 'Fallback delivered',
    owner: 'Integration',
    ownerEvidence: 'the failing step is an outbound call to the profile service',
    exchanges: [
      [
        {
          kind: 'step',
          detail: 'Session opened; greeting and terms notice sent.',
          time: '11:36:01 PM',
          latencyMs: 310,
          evidence: "segment 'Retail banking' · terms notice v2",
        },
      ],
      [
        {
          kind: 'intent',
          detail: 'Profile-change policy selected.',
          time: '11:36:11 PM',
          latencyMs: 400,
          evidence: 'intent = change_personal_info · confidence 0.93',
        },
        {
          kind: 'step',
          detail: 'Confirmation of the new value requested before any write.',
          time: '11:36:13 PM',
          latencyMs: 900,
          evidence: 'policy: profile writes require explicit confirmation',
        },
      ],
      [
        {
          kind: 'tool',
          detail: '`profile.update` called with the confirmed surname.',
          time: '11:36:52 PM',
          latencyMs: 10000,
          evidence: 'request summary available · customer data omitted from the drawer',
          payload: {
            request: redactPayload({
              user_id: 'usr_9283',
              field: 'last_name',
              value: 'Morrison',
              confirm: true,
            }) as object,
            response: "Not captured — payload wasn't retained; absence state, not an error",
          },
        },
        {
          kind: 'error',
          category: 'Tool timeout',
          severity: 'high',
          errorId: 'err_7c3e58f1',
          detail: '`profile.update` did not respond within the 10s limit, so the name was never written.',
          time: '11:37:02 PM',
          latencyMs: 3,
          evidence: 'integration / profile service · no response in 10s (limit 10s)',
          fix: {
            steps: [
              "Check the profile service's status and p95 latency — the call hit the 10s timeout, so the integration was slow or down.",
              "Raise the tool timeout or add one retry in the Autoflow if the profile service's p95 is above 10s.",
            ],
            ...FLOW_REFUND,
          },
        },
        {
          kind: 'step',
          detail: 'Fallback acknowledged the request and queued a specialist follow-up.',
          time: '11:37:03 PM',
          latencyMs: 750,
          evidence: 'fallback answer reached the customer · follow-up task recorded',
        },
      ],
    ],
  },

  // g-5 · refund for order 88213 — healthy, and the second row carrying a tool
  // call, so `Tools` is never a zero-count entry across the whole set.
  'g-5': {
    state: 'healthy',
    traceId: 'tr_01J9XW4V9Q2N7M1Z4V6B3T0YH',
    impact: 'Answer delivered',
    exchanges: [
      [{ ...GREETING_STEP, time: '11:20:01 PM' }],
      [
        {
          kind: 'intent',
          detail: 'Refund policy selected.',
          time: '11:20:09 PM',
          latencyMs: 370,
          evidence: 'intent = refund_request · confidence 0.97',
        },
        {
          kind: 'api',
          detail: 'Order lookup confirmed order 88213 was refund-eligible.',
          time: '11:20:10 PM',
          latencyMs: 460,
          evidence: 'request summary available · customer data omitted from the drawer',
          payload: {
            request: redactPayload({
              customer_id: 'cust_4721',
              order_id: '88213',
              check_eligibility: true,
            }) as object,
            response: redactPayload({
              order_id: '88213',
              eligible: true,
              amount: 42.0,
              reason: 'within_return_window',
            }) as object,
          },
        },
        {
          kind: 'tool',
          detail: '`refund.create` returned a confirmation id.',
          time: '11:20:12 PM',
          latencyMs: 820,
          evidence: 'request summary available · confirmation id recorded',
          payload: {
            request: redactPayload({
              order_id: '88213',
              amount: 42.0,
              method: 'original_payment',
            }) as object,
            response: {
              confirmation_id: 'ref_2847',
              status: 'initiated',
              estimated_days: 4,
            },
          },
        },
        {
          kind: 'step',
          detail: 'Refund confirmation delivered to the customer.',
          time: '11:20:13 PM',
          latencyMs: 600,
          evidence: 'delivery confirmed · $42.00 · 3–5 business days',
        },
      ],
    ],
  },
}

export function auditFor(rowId: string): ConvAudit | undefined {
  return WIDGET_AUDITS[rowId]
}
