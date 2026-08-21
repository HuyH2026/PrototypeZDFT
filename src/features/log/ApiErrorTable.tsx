// The API errors tab's table: failed outbound calls, one row per call, each
// opening the Conversation Details drawer for the conversation the call
// served. Same row-activation pattern as ErrorTable.
import { ArrowDown } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { API_ERROR_ENTRIES, type ApiErrorEntry } from './log-data'

function HeaderLabel({ label, sortable = true }: { label: string; sortable?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {sortable ? <ArrowDown size={13} className="text-ink-muted" aria-hidden /> : null}
    </span>
  )
}

function StatusChip({ status }: { status: number }) {
  const server = status >= 500
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11.5px] font-semibold"
      style={{ color: server ? '#8c1c1c' : '#c92a2a', background: server ? '#f9dcdc' : '#fdecec' }}
    >
      {status}
    </span>
  )
}

export function ApiErrorTable({ onOpen }: { onOpen: (entry: ApiErrorEntry) => void }) {
  return (
    <Table aria-label="API error log" clickableRows className="min-w-[1000px] table-fixed">
      <colgroup>
        <col className="w-[170px]" />
        <col className="w-[260px]" />
        <col className="w-[90px]" />
        <col className="w-[110px]" />
        <col className="w-[110px]" />
        <col className="w-[260px]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Timestamp" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Endpoint" sortable={false} />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Method" sortable={false} />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Status" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Latency" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Error type" sortable={false} />
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {API_ERROR_ENTRIES.map((e) => (
          <tr
            key={e.id}
            data-testid={`api-error-row-${e.id}`}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(e)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                onOpen(e)
              }
            }}
            className="cursor-pointer"
          >
            <Td className="py-4 text-black">{e.timestamp}</Td>
            <Td className="py-4 font-mono text-[12.5px] text-black">{e.endpoint}</Td>
            <Td className="py-4 text-black">{e.method}</Td>
            <Td className="py-3.5">
              <StatusChip status={e.status} />
            </Td>
            <Td className="py-4 text-black">{e.latency}</Td>
            <Td className="py-4 text-black">{e.errorType}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
