// Deterministic per-opportunity detail records for the L3 opportunity view.
// Extends the base Opportunity (from pm-data) with the narrative, conversations,
// customer-segment breakdown, affected accounts, and lifecycle timeline shown in
// the Figma. SCIM (o2) is transcribed from the Figma; o1/o3 are coherent
// equivalents. No backend, no Date.now(): dates are literal labels.
import { PM_DATA, type Opportunity, type LifecycleStageKey } from './pm-data'

export type DetailSegment = {
  key: string; label: string; convoCount: number; pct: number; revenue: string
}
export type AffectedCustomer = {
  id: string; name: string; plan: string; renewalDate: string; arrLabel: string
}
export type DetailConversation = {
  id: string; quote: string; customer: string; revenueLabel: string; plan: string
}
export type NarrativeRun = { text: string; bold?: boolean }
export type TimelineNode = { stage: LifecycleStageKey; dateLabel: string | null }

export type OpportunityDetail = {
  opp: Opportunity
  volumeCount: number
  narrative: NarrativeRun[]
  reproSteps?: string[]
  signalEvidence?: string[]
  suggestedAction: string
  linkedSuggestion?: { ref: string; text: string }
  timeline: TimelineNode[]
  segments: DetailSegment[]
  affectedCustomers: AffectedCustomer[]
  totalConversations: number
  conversations: DetailConversation[]
}

export const LIFECYCLE_ORDER: LifecycleStageKey[] = ['detected', 'planned', 'in-dev', 'shipped']

// Index the canonical opportunities by id so each detail's .opp is the SAME
// object (no drift between the feed card and the detail page).
const byId: Record<string, Opportunity> = Object.fromEntries(
  PM_DATA.opportunities.map((o) => [o.id, o]),
)

// Build the 4-node timeline: the node at the opportunity's current stage gets the
// supplied date; earlier stages are marked done with their date; later stages are
// null ("--"). `dates` maps a stage key to its label for the stages that have one.
function timeline(dates: Partial<Record<LifecycleStageKey, string>>): TimelineNode[] {
  return LIFECYCLE_ORDER.map((stage) => ({ stage, dateLabel: dates[stage] ?? null }))
}

export const PM_OPPORTUNITY_DETAILS: Record<string, OpportunityDetail> = {
  // --- SCIM auto-provisioning (Figma-exact) ---------------------------------
  o2: {
    opp: byId.o2,
    volumeCount: 164,
    narrative: [
      { text: 'Enterprise and Pro customers with an external identity provider report that new hires and departures are not reflected in their ' },
      { text: 'user access automatically', bold: true },
      { text: '. Without SCIM provisioning, admins manually add and remove seats, which leaves stale accounts active after employees leave and blocks org-wide rollout. The pattern is concentrated in accounts with 100+ seats and has grown sharply since the identity-sync beta opened on Jun 12, pointing to ' },
      { text: 'automated lifecycle management as the blocking requirement', bold: true },
      { text: '. Several customers say they cannot expand until provisioning is hands-off.' },
    ],
    signalEvidence: [
      '49 accounts explicitly name SCIM as a rollout requirement',
      'Okta and Microsoft Entra ID represent 82% of the identity-provider mentions',
      'Deprovisioning risk appears in 31 conversations tied to security reviews',
      '12 expansion opportunities are blocked until access changes are automated',
    ],
    suggestedAction:
      'Prioritize SCIM provisioning for Okta and Microsoft Entra ID, beginning with reliable deprovisioning and audit logs. Validate the rollout with the highest-risk Enterprise accounts before opening a broader beta.',
    linkedSuggestion: {
      ref: 'SCIM-1423',
      text: '"SCIM deprovisioning delay" already exists.',
    },
    timeline: timeline({ detected: 'Jun 15' }),
    segments: [
      { key: 'enterprise', label: 'Enterprise', convoCount: 82, pct: 50, revenue: '$280K' },
      { key: 'pro', label: 'Pro', convoCount: 54, pct: 33, revenue: '$130K' },
      { key: 'team', label: 'Team', convoCount: 28, pct: 17, revenue: '$45K' },
    ],
    affectedCustomers: [
      { id: 'ac', name: 'Active Campaign', plan: 'Enterprise', renewalDate: 'Aug 15, 2026', arrLabel: '$140K ARR' },
      { id: 'lime', name: 'Lime', plan: 'Pro', renewalDate: 'Sep 15, 2026', arrLabel: '$86K ARR' },
      { id: 'acorns', name: 'Acorns', plan: 'Pro', renewalDate: 'Aug 1, 2026', arrLabel: '$60K ARR' },
    ],
    totalConversations: 164,
    conversations: [
      { id: 'c1', quote: "We can't roll out org-wide until provisioning and deprovisioning are automated.", customer: 'Active Campaign', revenueLabel: '$140K revenue', plan: 'Enterprise' },
      { id: 'c2', quote: 'We offboarded two contractors last week and their accounts stayed active. That will block our security review.', customer: 'Lime', revenueLabel: '$86K revenue', plan: 'Pro' },
    ],
  },

  // --- SAML SSO drops users (bug, in-dev) -----------------------------------
  o1: {
    opp: byId.o1,
    volumeCount: 218,
    narrative: [
      { text: 'Large SSO customers report that users are ' },
      { text: 'silently signed out on token refresh', bold: true },
      { text: ', roughly every session hour, and bounced back to the login screen mid-task. The disruption scales with seat count and is most severe on Enterprise annual plans. It began after the v2.4 auth release and correlates with the silent-refresh code path, indicating a ' },
      { text: 'regression in SAML session renewal', bold: true },
      { text: '. Customers describe real adoption and productivity loss across hundreds of seats.' },
    ],
    reproSteps: [
      'Sign in via SAML SSO on an Enterprise account',
      'Leave the session idle until the access token nears expiry (~60 min)',
      'Trigger any authenticated request → silent refresh runs',
      'User is returned to the login screen; unsaved work is lost',
    ],
    suggestedAction:
      'Ship the session-renewal fix behind a flag for affected tenants, then sync the rollout to Jira so account teams can track it against renewals. Notify the top Enterprise accounts once verified.',
    linkedSuggestion: {
      ref: 'AUTH-982',
      text: '"Silent token refresh logout" already exists.',
    },
    timeline: timeline({ detected: 'May 28', planned: 'Jun 3', 'in-dev': 'Jun 12' }),
    segments: [
      { key: 'enterprise', label: 'Enterprise', convoCount: 118, pct: 54, revenue: '$320K' },
      { key: 'pro', label: 'Pro', convoCount: 61, pct: 28, revenue: '$190K' },
      { key: 'team', label: 'Team', convoCount: 39, pct: 18, revenue: '$100K' },
    ],
    affectedCustomers: [
      { id: 'lime', name: 'Lime', plan: 'Enterprise', renewalDate: 'Sep 15, 2026', arrLabel: '$210K ARR' },
      { id: 'ac', name: 'Active Campaign', plan: 'Enterprise', renewalDate: 'Aug 15, 2026', arrLabel: '$140K ARR' },
      { id: 'acorns', name: 'Acorns', plan: 'Pro', renewalDate: 'Aug 1, 2026', arrLabel: '$60K ARR' },
    ],
    totalConversations: 218,
    conversations: [
      { id: 'c1', quote: 'Every 60 minutes our whole org gets kicked back to login. Killing adoption with 400 seats.', customer: 'Lime', revenueLabel: '$210K revenue', plan: 'Enterprise' },
      { id: 'c2', quote: 'Our reps lose half-written tickets when the session drops. It happens all day.', customer: 'Active Campaign', revenueLabel: '$140K revenue', plan: 'Enterprise' },
    ],
  },

  // --- Bulk CSV export times out (request, planned) -------------------------
  o3: {
    opp: byId.o3,
    volumeCount: 91,
    narrative: [
      { text: 'Customers running scheduled exports report that ' },
      { text: 'large CSV exports time out past roughly 10,000 rows', bold: true },
      { text: ', returning no file and no clear error. Teams work around it by manually splitting files or abandoning the export entirely. Volume is concentrated on Growth-plan accounts with weekly reporting jobs and has climbed steadily over the last ten weeks, indicating a ' },
      { text: 'scaling limit in the export pipeline', bold: true },
      { text: ' rather than a one-off outage.' },
    ],
    signalEvidence: [
      '91 conversations mention exports failing beyond roughly 10,000 rows',
      'Weekly scheduled exports account for 63% of the reported failures',
      'No actionable error or recovery path is shown when the request times out',
      '28 accounts describe manual file splitting as the only workaround',
    ],
    suggestedAction:
      'Move large exports to an async, chunked job with a download link on completion. Track the work in Jira and notify affected accounts when streaming exports ship.',
    timeline: timeline({ detected: 'May 6', planned: 'May 20' }),
    segments: [
      { key: 'enterprise', label: 'Enterprise', convoCount: 32, pct: 35, revenue: '$95K' },
      { key: 'pro', label: 'Pro', convoCount: 37, pct: 41, revenue: '$65K' },
      { key: 'team', label: 'Team', convoCount: 22, pct: 24, revenue: '$30K' },
    ],
    affectedCustomers: [
      { id: 'acorns', name: 'Acorns', plan: 'Pro', renewalDate: 'Aug 1, 2026', arrLabel: '$60K ARR' },
      { id: 'lime', name: 'Lime', plan: 'Pro', renewalDate: 'Sep 15, 2026', arrLabel: '$86K ARR' },
      { id: 'ac', name: 'Active Campaign', plan: 'Enterprise', renewalDate: 'Aug 15, 2026', arrLabel: '$140K ARR' },
    ],
    totalConversations: 91,
    conversations: [
      { id: 'c1', quote: 'We schedule weekly exports and half of them silently fail now.', customer: 'Acorns', revenueLabel: '$60K revenue', plan: 'Pro' },
      { id: 'c2', quote: 'We had to split our monthly report into six files by hand. It is not workable.', customer: 'Lime', revenueLabel: '$86K revenue', plan: 'Pro' },
    ],
  },
}

export function getOpportunityDetail(id: string | undefined): OpportunityDetail | undefined {
  if (id === undefined) return undefined
  return PM_OPPORTUNITY_DETAILS[id]
}
