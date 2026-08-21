// Backend-free store for the PM dashboard's mock "connect a PM tool" flow.
// Persists which tool is connected so the opportunity cards can offer
// create/link/view workflow. No real API — purely presentational PM-tool state.
// Same load/validate/persist/guard pattern as views-store.ts.

export type PmTool = 'jira' | 'linear' | 'asana'
export type PmIssueLink = { key: string; tool: PmTool }
export type PmIntegration = {
  connected: boolean
  tool: PmTool | null
  linkedIssues: Record<string, PmIssueLink>
}

export const PM_TOOLS: { key: PmTool; label: string }[] = [
  { key: 'jira', label: 'Jira' },
  { key: 'linear', label: 'Linear' },
  { key: 'asana', label: 'Asana' },
]
export const PM_TOOL_LABEL: Record<PmTool, string> = {
  jira: 'Jira', linear: 'Linear', asana: 'Asana',
}

const STORAGE_KEY = 'home-pm-integration-v1'

const TOOL_KEYS = new Set<string>(['jira', 'linear', 'asana'])
const ISSUE_NUMBER: Record<string, number> = { o1: 481, o2: 482, o3: 483 }

function disconnected(): PmIntegration {
  return { connected: false, tool: null, linkedIssues: {} }
}

function isTool(value: unknown): value is PmTool {
  return typeof value === 'string' && TOOL_KEYS.has(value)
}

function readLinkedIssues(value: unknown): Record<string, PmIssueLink> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([opportunityId, candidate]) => {
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return []
      const record = candidate as { key?: unknown; tool?: unknown }
      if (typeof record.key !== 'string' || record.key.length === 0 || !isTool(record.tool)) return []
      return [[opportunityId, { key: record.key, tool: record.tool }]]
    }),
  )
}

export function createPmIssueLink(state: PmIntegration, opportunityId: string): PmIntegration {
  if (!state.connected || !state.tool) return state
  const number = ISSUE_NUMBER[opportunityId] ?? 499
  return {
    ...state,
    linkedIssues: {
      ...state.linkedIssues,
      [opportunityId]: { key: `UNI-${number}`, tool: state.tool },
    },
  }
}

export function loadPmIntegration(): PmIntegration {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return disconnected()
    const parsed = JSON.parse(raw) as { connected?: unknown; tool?: unknown; linkedIssues?: unknown }
    // Only a known tool string counts as connected — own-key membership, not `in`.
    if (parsed.connected === true && isTool(parsed.tool)) {
      return {
        connected: true,
        tool: parsed.tool,
        linkedIssues: readLinkedIssues(parsed.linkedIssues),
      }
    }
    return disconnected()
  } catch {
    return disconnected()
  }
}

export function persistPmIntegration(state: PmIntegration): void {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}
