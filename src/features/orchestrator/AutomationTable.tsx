// The automations table. Columns: Automation (name + updated caption) · Nodes ·
// Description · Runs · Run success rate · Activate. The on/off toggle is driven
// by the parent via isOn/onToggle.
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { type Automation } from './orchestrator-data'
import { NodeChips } from './NodeChips'
import { SuccessBar } from './SuccessBar'

const INK = '#2f3130'
const GREEN = '#0f8a5f'

function Toggle({ automation, on, onToggle }: { automation: Automation; on: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`Activate ${automation.name}`}
        onClick={(e) => { e.stopPropagation(); onToggle(automation.id) }}
        className="relative h-5 w-9 rounded-full transition-colors"
        style={{ backgroundColor: on ? GREEN : '#c9c7c3' }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-instant ease-soft"
          style={{ left: on ? '18px' : '2px' }}
        />
      </button>
      <span className="text-[13px]" style={{ color: INK }}>{on ? 'On' : 'Off'}</span>
    </div>
  )
}

export function AutomationTable({
  automations, isOn, onToggle, onOpen,
}: {
  automations: Automation[]
  isOn: (a: Automation) => boolean
  onToggle: (id: string) => void
  onOpen?: (id: string) => void
}) {
  return (
    <Table clickableRows className="min-w-0 table-fixed">
      <colgroup>
        <col className="w-[24%]" />
        <col className="w-[17%]" />
        <col className="w-[26%]" />
        <col className="w-[8%]" />
        <col className="w-[15%]" />
        <col className="w-[10%]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col">Automation</Th>
          <Th scope="col">Nodes</Th>
          <Th scope="col">Description</Th>
          <Th scope="col">Runs</Th>
          <Th scope="col">Run success rate</Th>
          <Th scope="col">Activate</Th>
        </tr>
      </Thead>
      <Tbody>
        {automations.map((a) => (
          <tr
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen?.(a.id)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen?.(a.id)
              }
            }}
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <Td>
              <div className="text-[15px] font-semibold" style={{ color: INK }}>{a.name}</div>
              <div className="mt-1 text-[12px] text-ink-muted">{a.updatedLabel}</div>
            </Td>
            <Td>
              <NodeChips label={a.primaryNode} kind={a.primaryNodeKind} extra={a.extraNodes} />
            </Td>
            <Td className="text-[13px] text-ink-muted">{a.description}</Td>
            <Td className="text-[14px]" style={{ color: INK }}>{a.runs}</Td>
            <Td><SuccessBar rate={a.successRate} /></Td>
            <Td><Toggle automation={a} on={isOn(a)} onToggle={onToggle} /></Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
