// Mock data for the Logs screen (Change Logs + Error Logs + API errors tabs).
// All presentational — no backend. Timestamps are pre-formatted display
// strings (no Date usage here).
export type LogTab = 'Change Logs' | 'Error Logs' | 'API errors'
export const LOG_TABS: LogTab[] = ['Change Logs', 'Error Logs', 'API errors']

export type AuditEntry = {
  id: string
  timestamp: string
  product: string
  action: string
  userEmail: string
}

export type Severity = 'High' | 'Medium' | 'Low'

export type ErrorEntry = {
  id: string
  timestamp: string
  product: string
  channel: string
  errorType: string
  severity: Severity
  userImpact: string
  // The conversation the error occurred in — the row opens the Conversation
  // Details drawer for it. The IDs belong to the Widget rows in
  // insights/ai-performances/conversations (see CONVERSATION_IDS there).
  conversationId: string
}

export type ApiErrorEntry = {
  id: string
  timestamp: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  status: number
  latency: string // pre-formatted, matching the timestamps' display-string rule
  errorType: string
  conversationId: string
}

export const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'a1',
    timestamp: 'Aug 6, 2026, 1:19 PM',
    product: 'Platform',
    action: 'connector-created',
    userEmail: 'sagar.phadkule+ft@forethought.ai',
  },
  {
    id: 'a2',
    timestamp: 'Aug 6, 2026, 12:00 PM',
    product: 'Solve',
    action: 'agent-builder-folder-agents-updated',
    userEmail: 'elizabeth.williams+cashwish@zendesk.com',
  },
  {
    id: 'a3',
    timestamp: 'Aug 6, 2026, 11:42 AM',
    product: 'Solve',
    action: 'agent-builder-folder-created',
    userEmail: 'elizabeth.williams+cashwish@zendesk.com',
  },
  {
    id: 'a4',
    timestamp: 'Aug 6, 2026, 11:42 AM',
    product: 'Solve',
    action: 'agent-builder-folder-deleted',
    userEmail: 'elizabeth.williams+cashwish@zendesk.com',
  },
  {
    id: 'a5',
    timestamp: 'Aug 6, 2026, 11:39 AM',
    product: 'Solve',
    action: 'agent-builder-folder-created',
    userEmail: 'elizabeth.williams+cashwish@zendesk.com',
  },
  {
    id: 'a6',
    timestamp: 'Aug 6, 2026, 11:07 AM',
    product: 'Platform',
    action: 'user-invite-sent',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a7',
    timestamp: 'Aug 6, 2026, 11:07 AM',
    product: 'Platform',
    action: 'user-invite-sent',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a8',
    timestamp: 'Aug 6, 2026, 10:54 AM',
    product: 'Platform',
    action: 'user-invite-sent',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a9',
    timestamp: 'Aug 6, 2026, 10:53 AM',
    product: 'Platform',
    action: 'user-invite-sent',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a10',
    timestamp: 'Aug 6, 2026, 10:13 AM',
    product: 'Platform',
    action: 'user-invite-sent',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a11',
    timestamp: 'Aug 6, 2026, 10:12 AM',
    product: 'Platform',
    action: 'user-invite-sent',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a12',
    timestamp: 'Aug 6, 2026, 10:11 AM',
    product: 'Platform',
    action: 'user-updated',
    userEmail: 'ahambaba@forethought.ai',
  },
  {
    id: 'a13',
    timestamp: 'Aug 6, 2026, 8:32 AM',
    product: 'Solve',
    action: 'intent-deleted',
    userEmail: 'tyler.peairs@forethought.ai',
  },
  {
    id: 'a14',
    timestamp: 'Aug 6, 2026, 8:19 AM',
    product: 'Solve',
    action: 'intent-created',
    userEmail: 'tyler.peairs@forethought.ai',
  },
]

export const ERROR_ENTRIES: ErrorEntry[] = [
  {
    id: 'e1',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    product: 'Solve',
    channel: 'Widget',
    errorType: 'Missing Context Variable',
    severity: 'Medium',
    userImpact: 'n/a',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb701',
  },
  {
    id: 'e2',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    product: 'Solve',
    channel: 'Widget',
    errorType: 'Tool timeout',
    severity: 'High',
    userImpact: 'n/a',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb704',
  },
  {
    id: 'e3',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    product: 'Solve',
    channel: 'Widget',
    errorType: 'No delivery event recorded',
    severity: 'Medium',
    userImpact: 'n/a',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb703',
  },
  {
    id: 'e4',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    product: 'Solve',
    channel: 'Widget',
    errorType: 'Failed to decode JWT',
    severity: 'Medium',
    userImpact: 'n/a',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb701',
  },
]

// The API errors tab: failed outbound calls, each linked to the conversation
// whose drawer shows the failing step in context.
export const API_ERROR_ENTRIES: ApiErrorEntry[] = [
  {
    id: 'ae1',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    endpoint: '/v1/account/status',
    method: 'GET',
    status: 400,
    latency: '380ms',
    errorType: 'Missing context variable',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb701',
  },
  {
    id: 'ae2',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    endpoint: '/v1/profile/update',
    method: 'PUT',
    status: 504,
    latency: '10s',
    errorType: 'Tool timeout',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb704',
  },
  {
    id: 'ae3',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    endpoint: '/v1/account/status',
    method: 'GET',
    status: 429,
    latency: '95ms',
    errorType: 'Rate limited',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb701',
  },
  {
    id: 'ae4',
    timestamp: 'Feb 13, 2026, 2:22 PM',
    endpoint: '/v1/delivery/ack',
    method: 'POST',
    status: 502,
    latency: '1.2s',
    errorType: 'No delivery event recorded',
    conversationId: '3e732807-c2d0-4ce3-8b5e-c87c28abb703',
  },
]
