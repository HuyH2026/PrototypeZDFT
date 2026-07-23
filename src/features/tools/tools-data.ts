// Mock data + types for the Tool Builder screen. Values are illustrative
// (no backend) and match the Figma frame (node 747:86563) exactly.

export type ToolTab = 'Available' | 'Recommended' | 'Authentication' | 'History'
export const TOOL_TABS: ToolTab[] = ['Available', 'Recommended', 'Authentication', 'History']

export type ToolType = 'API' | 'Imported' | 'MCP' | 'Browser'
export type ToolState = 'Live' | 'Read only' | 'Auto-saved'

export type ToolAction = {
  id: string
  name: string                 // "Action name 001"
  description: string          // "Placeholder for action description"
  type: ToolType
  iconTint: 'blue' | 'slate'   // #3492ef vs #acbdd5 avatar
  agents: { label: string; extra: number } | null  // "Agent name +5" | null → "n/a"
  conversations: number        // 100, 40, 1000, 950, 200
  state: ToolState
  lastModified: string         // "Feb 13, 2024, 12:43 PM"
}

// The "Name (113)" header count is a fixed design label, not TOOL_ACTIONS.length.
export const NAME_COUNT = 113

const DESC = 'Placeholder for action description'
const MODIFIED = 'Feb 13, 2024, 12:43 PM'
const AGENTS = { label: 'Agent name', extra: 5 }

export const TOOL_ACTIONS: ToolAction[] = [
  { id: 't1', name: 'Action name 001', description: DESC, type: 'API', iconTint: 'blue', agents: AGENTS, conversations: 100, state: 'Live', lastModified: MODIFIED },
  { id: 't2', name: 'Action name 002', description: DESC, type: 'Imported', iconTint: 'slate', agents: AGENTS, conversations: 40, state: 'Read only', lastModified: MODIFIED },
  { id: 't3', name: 'Action name 003', description: DESC, type: 'Imported', iconTint: 'slate', agents: null, conversations: 1000, state: 'Read only', lastModified: MODIFIED },
  { id: 't4', name: 'Action name 004', description: DESC, type: 'MCP', iconTint: 'blue', agents: null, conversations: 950, state: 'Live', lastModified: MODIFIED },
  { id: 't5', name: 'Action name 005', description: DESC, type: 'Browser', iconTint: 'blue', agents: null, conversations: 200, state: 'Auto-saved', lastModified: MODIFIED },
]

export type RunStatus = 'In progress' | 'Completed' | 'Failed'

export type ToolRun = {
  id: string
  toolId: string        // cross-references a TOOL_ACTIONS id for name/description/avatar
  runAt: string          // "Jul 20, 2026 3:12 PM"
  type: ToolType
  channel: string        // a key of CHANNEL_META, e.g. "Slack"
  conversationId: string | null
  status: RunStatus
}

// The "Run (113)" header count is a fixed design label, like NAME_COUNT.
export const RUN_COUNT = 113

export const TOOL_RUNS: ToolRun[] = [
  { id: 'r1', toolId: 't1', runAt: 'Jul 20, 2026 3:12 PM', type: 'API', channel: 'Slack', conversationId: 'a1b2c3d4-1111-4a5b-9c3d-000000000001', status: 'In progress' },
  { id: 'r2', toolId: 't2', runAt: 'Jul 19, 2026 11:45 AM', type: 'Imported', channel: 'Outbound Voice', conversationId: 'a1b2c3d4-2222-4a5b-9c3d-000000000002', status: 'Completed' },
  { id: 'r3', toolId: 't3', runAt: 'Jul 18, 2026 9:02 AM', type: 'MCP', channel: 'Email', conversationId: null, status: 'Failed' },
  { id: 'r4', toolId: 't4', runAt: 'Jul 17, 2026 4:30 PM', type: 'Browser', channel: 'Web Widget', conversationId: 'a1b2c3d4-4444-4a5b-9c3d-000000000004', status: 'Completed' },
  { id: 'r5', toolId: 't5', runAt: 'Jul 16, 2026 8:15 AM', type: 'API', channel: 'Slack', conversationId: null, status: 'In progress' },
]
