import { ArrowDown, Bolt } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { channelMeta } from '@/lib/channel-meta'
import { TOOL_RUNS, RUN_COUNT, type RunStatus, type ToolRun } from './tools-data'

function RunStatusBadge({ status }: { status: RunStatus }) {
  if (status === 'Completed')
    return (
      <span
        className="rounded-xl px-2 py-0.5 text-[11px] font-semibold text-white"
        style={{ backgroundColor: '#048c80' }}
      >
        Completed
      </span>
    )
  if (status === 'Failed')
    return (
      <span className="rounded-xl bg-destructive px-2 py-0.5 text-[11px] font-semibold text-white">
        Failed
      </span>
    )
  return (
    <span
      className="rounded-xl px-2 py-0.5 text-[11px] font-semibold text-white"
      style={{ backgroundColor: 'var(--color-grey-500)' }}
    >
      In progress
    </span>
  )
}

function ChannelPill({ label }: { label: string }) {
  const { display, color, Icon } = channelMeta(label)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-2 py-1">
      <span
        className="flex size-4 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Icon size={9} className="text-white" aria-hidden />
      </span>
      <span className="text-[11px] font-medium text-grey-700">{display}</span>
    </span>
  )
}

function HeaderLabel({ label, sortable = true }: { label: string; sortable?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {sortable && <ArrowDown size={13} className="text-ink-muted" aria-hidden />}
    </span>
  )
}

function Avatar({ tint }: { tint: 'blue' | 'slate' }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: tint === 'blue' ? '#3492ef' : '#acbdd5' }}
    >
      <Bolt size={15} className="text-white" aria-hidden />
    </span>
  )
}

export function ToolsHistoryTable({ runs = TOOL_RUNS }: { runs?: ToolRun[] }) {
  return (
    <Table
      data-testid="tools-history-table"
      aria-label="Tool run history"
      className="min-w-[1030px] table-fixed"
    >
      <colgroup>
        <col className="w-[150px]" />
        <col className="w-[280px]" />
        <col className="w-[100px]" />
        <col className="w-[160px]" />
        <col className="w-[220px]" />
        <col className="w-[120px]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label={`Run (${RUN_COUNT})`} />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Name" />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Type" />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Channel" sortable={false} />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Conversation ID" sortable={false} />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Status" />
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {runs.map((run) => (
          <tr key={run.id}>
            <Td className="py-3 text-[11px] text-black">{run.runAt}</Td>
            <Td className="py-3">
              <div className="flex items-center gap-3">
                <Avatar tint="blue" />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-black">{run.name}</div>
                  <div className="truncate text-[12px] text-grey-700">{run.description}</div>
                </div>
              </div>
            </Td>
            <Td className="py-3 text-[11px] text-black">{run.type}</Td>
            <Td className="py-3">
              <ChannelPill label={run.channel} />
            </Td>
            <Td
              className={`py-3 text-[11px] ${run.conversationId ? 'text-black' : 'text-grey-400'}`}
            >
              {run.conversationId ?? 'n/a'}
            </Td>
            <Td className="py-3">
              <RunStatusBadge status={run.status} />
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
