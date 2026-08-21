import { ArrowDown, Info } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { ERROR_ENTRIES, type ErrorEntry } from './log-data'
import { SeverityBadge } from './SeverityBadge'

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
      {info ? <Info size={13} className="text-ink-muted" aria-hidden /> : null}
      {sortable ? <ArrowDown size={13} className="text-ink-muted" aria-hidden /> : null}
    </span>
  )
}

export function ErrorTable({ onOpen }: { onOpen?: (entry: ErrorEntry) => void }) {
  return (
    <Table aria-label="Error log" clickableRows={onOpen !== undefined} className="min-w-[1000px] table-fixed">
      <colgroup>
        <col className="w-[170px]" />
        <col className="w-[110px]" />
        <col className="w-[120px]" />
        <col className="w-[350px]" />
        <col className="w-[170px]" />
        <col className="w-[150px]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Timestamp" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Product" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Channel" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Error type" sortable={false} />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Severity" info />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="User Impact" />
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {ERROR_ENTRIES.map((e) => (
          <tr
            key={e.id}
            data-testid={`error-row-${e.id}`}
            role={onOpen ? 'button' : undefined}
            tabIndex={onOpen ? 0 : undefined}
            onClick={onOpen ? () => onOpen(e) : undefined}
            onKeyDown={
              onOpen
                ? (ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault()
                      onOpen(e)
                    }
                  }
                : undefined
            }
            className={onOpen ? 'cursor-pointer' : undefined}
          >
            <Td className="py-4 text-black">{e.timestamp}</Td>
            <Td className="py-4 text-black">{e.product}</Td>
            <Td className="py-4 text-black">{e.channel}</Td>
            <Td className="py-4 text-black">{e.errorType}</Td>
            <Td className="py-3.5">
              <SeverityBadge severity={e.severity} />
            </Td>
            <Td className="py-4 text-grey-500">{e.userImpact}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
