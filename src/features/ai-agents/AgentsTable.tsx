// The use-cases table for the active channel/tab. Built-in use cases show a
// fixed status dot; authored use cases expose the activation switch.
import { useEffect, useRef, type ReactNode } from 'react'
import { Copy, Info, Tag } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { Table, Thead, Tbody, Th, Td } from '@/components/flora/Table'
import { type Agent } from './agent-builder-data'
import { GitSyncCell } from './GitSyncCell'
import type { AgentSyncState } from './git-sync-store'
import { PLAN_CHIP_STYLE } from '@/features/ai-studio/plan-parts/plan-chip'
import { useSelfImprovementPlans } from '@/features/ai-studio/self-improving/self-improvement-store'

const INK = '#2f3130'
const GREEN = '#0f8a5f'

// The tint the plan's own Active check-ins chip carries, read for its colours: the
// chip here says what the column means, which is that the agent is on a plan.
const SELF_IMPROVING_TINT = PLAN_CHIP_STYLE['active-check-ins']

function ChipCell({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-grey-100 px-2.5 py-1 text-[12px] text-ink-muted">
      <Tag size={11} className="text-accent-blue" aria-hidden />
      {items[0]}
      {items.length > 1 ? ` +${items.length - 1}` : ''}
    </span>
  )
}

function StatusBadge({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-semibold text-white"
      style={{ backgroundColor: '#367a74' }}
    >
      {text}
    </span>
  )
}

function csatColor(csat: number): string {
  return csat >= 4 ? '#368f84' : csat < 3 ? '#c06048' : INK
}

/** Voice Outbound's Use Case ID cell: the id in the link blue, copy beside it. */
function UseCaseIdCell({ agent }: { agent: Agent }) {
  if (!agent.useCaseId) return <span>n/a</span>
  return (
    <span className="flex items-center gap-2">
      <span className="text-accent-blue">{agent.useCaseId}</span>
      <button
        type="button"
        aria-label={`Copy use case ID for ${agent.name}`}
        className="flex size-8 items-center justify-center rounded-lg text-[#545767] hover:bg-control-hover"
        onClick={(e) => {
          e.stopPropagation()
          void navigator.clipboard?.writeText?.(agent.useCaseId!)
        }}
      >
        <Copy size={16} aria-hidden />
      </button>
    </span>
  )
}

/**
 * Voice Outbound's Segment cell: "All segments" stays plain text; a named
 * segment is the frame's tag chip — `#eae9e8` fill, coloured tag glyph.
 */
function SegmentCell({ agent }: { agent: Agent }) {
  const segment = agent.segment ?? 'All segments'
  if (segment === 'All segments') return <span>{segment}</span>
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eae9e8] px-2.5 py-1 text-[12px] font-semibold text-[#2f3130]">
      <GardenIcon
        name="tag-stroke"
        className="h-3.5 w-3.5"
        style={{ color: agent.segmentColor ?? '#8b8e89' }}
      />
      {segment}
    </span>
  )
}

export type Column = {
  key: string
  label: string
  /** Frame 112:51124 draws an info glyph after some labels (Voicemail left). */
  info?: boolean
  render: (agent: Agent) => ReactNode
}

export const DEFAULT_COLUMNS: Column[] = [
  { key: 'conversations', label: 'Conversations', render: (a) => a.conversations.toLocaleString('en-US') },
  { key: 'resolutions', label: 'Resolutions', render: (a) => a.resolutions.toLocaleString('en-US') },
  { key: 'resolutionRate', label: 'Resolutions rate', render: (a) => a.resolutionRate },
  {
    key: 'csat',
    label: 'Avg. CSAT',
    render: (a) => <span style={{ color: csatColor(a.csat) }}>{a.csat.toFixed(1)}</span>,
  },
  { key: 'tags', label: 'Tags', render: (a) => <ChipCell items={a.tags} /> },
]

// The Web Call channel's columns (Agent Builder_Use case_001 frame, 120:57534):
// Type and Tags lead, then call volume and talk time — no CSAT column.
export const WEBCALL_COLUMNS: Column[] = [
  { key: 'type', label: 'Type', render: (a) => a.type },
  { key: 'tags', label: 'Tags', render: (a) => (a.tags.length ? <ChipCell items={a.tags} /> : 'n/a') },
  { key: 'conversations', label: 'Calls', render: (a) => a.conversations.toLocaleString('en-US') },
  {
    key: 'resolutions',
    label: 'Resolutions',
    // The built-in Fallback use case doesn't resolve calls — the frame prints
    // n/a for it (while a zero-traffic use case still prints 0).
    render: (a) => (a.type === 'Fallback' ? 'n/a' : a.resolutions.toLocaleString('en-US')),
  },
  { key: 'resolutionRate', label: 'Resolutions rate', render: (a) => a.resolutionRate },
  { key: 'totalTalkTime', label: 'Total talk time', render: (a) => a.totalTalkTime ?? 'n/a' },
]

export const VOICE_COLUMNS: Column[] = [
  { key: 'type', label: 'Type', render: (a) => a.type },
  { key: 'segment', label: 'Segment', render: (a) => a.segment ?? 'All segments' },
  { key: 'conversations', label: 'Inbound calls', render: (a) => a.conversations.toLocaleString('en-US') },
  { key: 'resolutions', label: 'Resolutions', render: (a) => a.resolutions.toLocaleString('en-US') },
  { key: 'resolutionRate', label: 'Resolutions rate', render: (a) => a.resolutionRate },
  { key: 'totalTalkTime', label: 'Total talk time', render: (a) => a.totalTalkTime ?? 'n/a' },
  { key: 'avgTalkTime', label: 'Average talk time', render: (a) => a.avgTalkTime ?? 'n/a' },
  { key: 'sentiment', label: 'Positive & Neutral sentiment', render: (a) => a.sentiment ?? 'n/a' },
  {
    key: 'csat',
    label: 'Avg. CSAT',
    render: (a) => <span style={{ color: csatColor(a.csat) }}>{a.csat.toFixed(1)}</span>,
  },
  { key: 'contextVariables', label: 'Context variables', render: (a) => <ChipCell items={a.contextVariables ?? []} /> },
  { key: 'actionsUsed', label: 'Actions', render: (a) => <ChipCell items={a.actionsUsed ?? []} /> },
  { key: 'subUseCases', label: 'Use Cases in use', render: (a) => <ChipCell items={a.subUseCases ?? []} /> },
  { key: 'status', label: 'Status', render: (a) => <StatusBadge text={a.status ?? 'Draft'} /> },
  {
    key: 'lastModified',
    label: 'Last modified',
    render: (a) => (a.lastModified ? `${a.lastModified.at} by ${a.lastModified.by}` : 'n/a'),
  },
]

/** Voice ▸ Outbound (frame 112:51124): five columns instead of the Inbound set. */
export const VOICE_OUTBOUND_COLUMNS: Column[] = [
  { key: 'type', label: 'Type', render: (a) => a.type },
  { key: 'useCaseId', label: 'Use Case ID', render: (a) => <UseCaseIdCell agent={a} /> },
  { key: 'segment', label: 'Segment', render: (a) => <SegmentCell agent={a} /> },
  {
    key: 'conversations',
    label: 'Outbound calls',
    render: (a) => (a.isSubflow ? 'n/a' : a.conversations.toLocaleString('en-US')),
  },
  {
    key: 'voicemail',
    label: 'Voicemail left',
    info: true,
    render: (a) => a.voicemailLeft ?? 'n/a',
  },
]

function Toggle({
  agent,
  on,
  onToggle,
}: {
  agent: Agent
  on: boolean
  onToggle: (id: string) => void
}) {
  if (agent.canToggle === false) {
    return (
      <div className="flex items-center gap-2" aria-label={`${agent.name} is ${on ? 'On' : 'Off'}`}>
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: on ? GREEN : '#c9c7c3' }}
          aria-hidden
        />
        <span className="text-[13px] text-ink">{on ? 'On' : 'Off'}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`Activate ${agent.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(agent.id)
        }}
        className="relative h-4 w-7 rounded-full transition-colors"
        style={{ backgroundColor: on ? GREEN : '#c9c7c3' }}
      >
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all duration-instant ease-soft"
          style={{ left: on ? '14px' : '2px' }}
        />
      </button>
      <span className="text-[13px]" style={{ color: INK }}>
        {on ? 'On' : 'Off'}
      </span>
    </div>
  )
}

function SelectAll({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Select all use cases"
      checked={checked}
      onChange={onChange}
      className="size-4 rounded border-surface-border accent-[#0f8a5f]"
    />
  )
}

export function AgentsTable({
  agents,
  isOn,
  onToggle,
  onRowClick,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  gitSync,
  columns = DEFAULT_COLUMNS,
}: {
  agents: Agent[]
  isOn: (a: Agent) => boolean
  onToggle: (id: string) => void
  onRowClick?: (id: string) => void
  selectedIds?: ReadonlySet<string>
  onToggleSelect?: (id: string) => void
  onToggleAll?: () => void
  gitSync?: {
    getState: (agentId: string) => AgentSyncState
    connected: boolean
    onSync: (agentId: string) => void
    onOpenPanel: (agentId: string) => void
    onConnectRepo: () => void
  }
  columns?: Column[]
}) {
  // Read straight from the module store: the assistant that writes it is mounted
  // in another subtree entirely, and no provider is involved.
  const { plans } = useSelfImprovementPlans()
  const selected = selectedIds ?? new Set<string>()
  const allSelected = agents.length > 0 && agents.every((a) => selected.has(a.id))
  const someSelected = agents.some((a) => selected.has(a.id))

  return (
    <Table clickableRows={!!onRowClick}>
      <Thead>
        <tr>
          <Th className="w-10">
            {onToggleAll ? (
              <SelectAll
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={onToggleAll}
              />
            ) : (
              <span className="sr-only">Select</span>
            )}
          </Th>
          <Th>Use cases</Th>
          <Th>Activate</Th>
          {columns.map((c) => (
            <Th key={c.key}>
              {c.label}
              {c.info && <Info size={14} aria-hidden className="ml-1 inline-block text-ink-muted" />}
            </Th>
          ))}
          {gitSync && <Th>Git sync</Th>}
        </tr>
      </Thead>
      <Tbody>
        {agents.map((a) => {
          const isSelected = selected.has(a.id)
          return (
            <tr
              key={a.id}
              data-testid={`agent-row-${a.id}`}
              data-selected={isSelected ? 'true' : undefined}
              className={onRowClick ? 'cursor-pointer' : ''}
              onClick={() => onRowClick?.(a.id)}
            >
              <Td onClick={(e) => e.stopPropagation()}>
                {onToggleSelect ? (
                  <input
                    type="checkbox"
                    aria-label={`Select ${a.name}`}
                    checked={isSelected}
                    onChange={() => onToggleSelect(a.id)}
                    className="size-4 rounded border-surface-border accent-[#0f8a5f]"
                  />
                ) : (
                  <span
                    className="inline-block size-4 rounded border border-surface-border"
                    aria-hidden
                  />
                )}
              </Td>
              <Td className="text-[14px] font-medium" style={{ color: INK }}>
                <span className="flex items-center gap-2">
                  {a.name}
                  {plans[a.id] && (
                    <span
                      className="shrink-0 rounded-2xl px-2 py-1 text-[11px] font-semibold tracking-[-0.1px]"
                      style={{
                        color: SELF_IMPROVING_TINT.fg,
                        backgroundColor: SELF_IMPROVING_TINT.bg,
                      }}
                    >
                      Self-improving
                    </span>
                  )}
                </span>
              </Td>
              <Td onClick={(e) => e.stopPropagation()}>
                <Toggle agent={a} on={isOn(a)} onToggle={onToggle} />
              </Td>
              {columns.map((c) => (
                <Td key={c.key} className="text-[13px]" style={{ color: INK }}>
                  {c.render(a)}
                </Td>
              ))}
              {gitSync && (
                <Td onClick={(e) => e.stopPropagation()}>
                  <GitSyncCell
                    agent={a}
                    connected={gitSync.connected}
                    state={gitSync.getState(a.id)}
                    onSync={gitSync.onSync}
                    onOpenPanel={gitSync.onOpenPanel}
                    onConnectRepo={gitSync.onConnectRepo}
                  />
                </Td>
              )}
            </tr>
          )
        })}
      </Tbody>
    </Table>
  )
}
