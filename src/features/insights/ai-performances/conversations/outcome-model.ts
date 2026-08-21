// Which outcome term(s) a customer's contract entitles them to see on a
// conversation. Some orgs are on a deflection contract, some resolution,
// some both — the drawer must render only the term(s) the org actually
// pays for. A third model arrives in November; adding it is one more
// OutcomeTerm member plus one more OUTCOME_TERM_META entry, nothing else
// in the drawer branches on a specific term.
export type OutcomeTerm = 'deflection' | 'resolution'

export const OUTCOME_TERM_META: Record<OutcomeTerm, { label: string; definition: string; helpHref: string }> = {
  deflection: {
    label: 'Deflected',
    definition: 'The conversation was fully handled by the AI agent, with no need to escalate to a human.',
    helpHref: 'https://support.forethought.ai/hc/en-us/articles/deflection-rate',
  },
  resolution: {
    label: 'Resolved',
    definition: "The customer's issue was confirmed resolved, whether it was handled by the AI agent or a human.",
    helpHref: 'https://support.forethought.ai/hc/en-us/articles/resolution-rate',
  },
}

// Mock stand-in for the org's contracted terms (no backend here). Flip this
// to model a different org while demoing, e.g. ['deflection'] or
// ['resolution'].
export const CONTRACTED_OUTCOME_MODEL: OutcomeTerm[] = ['deflection', 'resolution']
