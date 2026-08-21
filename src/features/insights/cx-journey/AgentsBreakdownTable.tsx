import { Table, Thead, Tbody, Th, Td } from '@/components/flora/Table'
import { AGENT_ROWS, type AgentCell } from './cx-journey-data'

const COLS = ['Conversations', 'Handled', 'Resolved', 'Agent efficiency & CSAT']

function MetricCell({ cell }: { cell: AgentCell }) {
  return (
    <Td className="align-top">
      <div className="flex items-baseline gap-3">
        <span className="text-[24px] font-semibold text-ink">{cell.primary}</span>
        {cell.csat ? <span className="text-[20px] font-semibold text-[#0f8a5f]">{cell.csat}</span> : null}
      </div>
      <div className="mt-2 space-y-0.5">
        {cell.subs.map((sub, i) => (
          <p key={i} className="text-[12px] text-ink-muted">
            <span className="font-semibold text-ink">{sub.emphasis}</span> {sub.label}
          </p>
        ))}
      </div>
    </Td>
  )
}

export function AgentsBreakdownTable() {
  return (
    <Table>
      <Thead>
        <tr>
          <Th>Agents</Th>
          {COLS.map((col) => (
            <Th key={col}>
              {col}
            </Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {AGENT_ROWS.map((row) => (
          <tr key={row.agent}>
            <Td className="align-top text-[18px] font-semibold text-ink">{row.agent}</Td>
            <MetricCell cell={row.conversations} />
            <MetricCell cell={row.handled} />
            <MetricCell cell={row.resolved} />
            <MetricCell cell={row.efficiency} />
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
