import { ArrowDown, Bolt, Info, MoreVertical } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { TOOL_ACTIONS, NAME_COUNT, type ToolAction, type ToolState } from './tools-data'

export function StateBadge({ state }: { state: ToolState }) {
  if (state === 'Live') {
    return (
      <span
        className="rounded-xl px-2 py-0.5 text-[11px] font-semibold text-white"
        style={{ backgroundColor: '#048c80' }}
      >
        Live
      </span>
    )
  }
  if (state === 'Auto-saved') {
    return (
      <span
        className="rounded-xl px-2 py-0.5 text-[11px] font-semibold text-white"
        style={{ backgroundColor: 'var(--color-grey-500)' }}
      >
        Auto-saved
      </span>
    )
  }
  return (
    <span className="rounded-xl border border-surface-border px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
      Read only
    </span>
  )
}

function UseCaseChip({ useCase }: { useCase: ToolAction['useCase'] }) {
  if (!useCase) return <span className="text-[12px] text-grey-400">n/a</span>
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[12px] font-medium text-grey-700"
      style={{ backgroundColor: 'var(--color-grey-100)' }}
    >
      <span className="size-1.5 rounded-full bg-[#3b998e]" aria-hidden />
      {useCase}
    </span>
  )
}

function Avatar({ tint }: { tint: ToolAction['iconTint'] }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: tint === 'blue' ? '#3492ef' : '#acbdd5' }}
    >
      <Bolt size={15} className="text-white" aria-hidden />
    </span>
  )
}

function CheckboxCell() {
  return (
    <span
      data-testid="tool-row-checkbox"
      onClick={(e) => e.stopPropagation()}
      className="h-3.5 w-3.5 shrink-0 rounded-[2px] border border-surface-border bg-white"
      aria-hidden
    />
  )
}

function HeaderLabel({
  label,
  sortable = true,
  info = false,
}: {
  label: string
  sortable?: boolean
  info?: boolean
}) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {info && <Info size={13} className="text-ink-muted" aria-hidden />}
      {sortable && <ArrowDown size={13} className="text-ink-muted" aria-hidden />}
    </span>
  )
}

export function ToolsTable({
  actions = TOOL_ACTIONS,
  onOpen,
}: {
  actions?: ToolAction[]
  onOpen: (id: string) => void
}) {
  return (
    <Table aria-label="Available tools" clickableRows className="min-w-[1126px] table-fixed">
      <colgroup>
        <col className="w-[300px]" />
        <col className="w-[100px]" />
        <col className="w-[190px]" />
        <col className="w-[200px]" />
        <col className="w-[120px]" />
        <col className="w-[160px]" />
        <col className="w-[56px]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col" className="py-3 text-[12px]">
            <span className="flex items-center gap-2">
              <CheckboxCell />
              <HeaderLabel label={`Name (${NAME_COUNT})`} />
            </span>
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Type" />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Use cases in use" sortable={false} />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Revealed # of conversations" />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="State" info />
          </Th>
          <Th scope="col" className="py-3 text-[12px]">
            <HeaderLabel label="Last modified" />
          </Th>
          <Th scope="col" aria-label="Row actions" className="py-3" />
        </tr>
      </Thead>
      <Tbody>
        {actions.map((a) => (
          <tr
            key={a.id}
            data-testid={`tool-row-${a.id}`}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(a.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(a.id)
              }
            }}
            className="cursor-pointer"
          >
            <Td className="py-3">
              <div className="flex items-center gap-3">
                <CheckboxCell />
                <Avatar tint={a.iconTint} />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-black">{a.name}</div>
                  <div className="truncate text-[12px] text-grey-700">{a.description}</div>
                </div>
              </div>
            </Td>
            <Td className="py-3 text-[11px] text-black">{a.type}</Td>
            <Td className="py-3">
              <UseCaseChip useCase={a.useCase} />
            </Td>
            <Td className="py-3 text-[11px] text-black">
              {a.conversations.toLocaleString('en-US')}
            </Td>
            <Td className="py-3">
              <StateBadge state={a.state} />
            </Td>
            <Td className="py-3 text-[11px] text-black">{a.lastModified}</Td>
            <Td className="bg-[#fbfbfb] px-2 py-3 text-center">
              <button
                type="button"
                aria-label={`${a.name} options`}
                onClick={(e) => e.stopPropagation()}
                className="text-ink-muted"
              >
                <MoreVertical size={16} aria-hidden />
              </button>
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
