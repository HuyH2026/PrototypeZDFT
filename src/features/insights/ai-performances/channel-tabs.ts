// The channel taxonomy every Agent Overview tab scopes by. It matches
// AGENT_CHANNELS in src/lib/channel-meta.ts; the Figma frames draw
// Widget / Email / Voice / Headless, and Email is deliberately not introduced —
// the pill group would change membership as the user moved between tabs of one
// screen.
//
// This lives here, not in conversations-data.ts, because CHANNEL_TABS is a value:
// importing it from there would pull that module's whole graph (transcripts,
// drawer details, the audit trail) into three data modules for a four-member
// union. conversations-data.ts re-exports both names.
export type ChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'
export type ChannelTab = { id: ChannelKey; label: string }

export const CHANNEL_TABS: ChannelTab[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'voice', label: 'Voice' },
  { id: 'webcall', label: 'Web Call' },
  { id: 'headless', label: 'Headless' },
]
