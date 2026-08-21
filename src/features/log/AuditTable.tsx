import { ArrowDown, ArrowUpDown } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { AUDIT_ENTRIES } from './log-data'

function HeaderLabel({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {label}
      {active ? (
        <ArrowDown size={13} className="text-ink-muted" aria-hidden />
      ) : (
        <ArrowUpDown size={13} className="text-ink-muted" aria-hidden />
      )}
    </span>
  )
}

export function AuditTable() {
  return (
    <Table aria-label="Change log" className="table-fixed">
      <colgroup>
        <col className="w-[17.5%]" />
        <col className="w-[16.5%]" />
        <col className="w-[30%]" />
        <col className="w-[36%]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Timestamp" active />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Product" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="Action" />
          </Th>
          <Th scope="col" className="py-3">
            <HeaderLabel label="User email" />
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {AUDIT_ENTRIES.map((e) => (
          <tr key={e.id} data-testid={`audit-row-${e.id}`}>
            <Td className="py-3.5 text-black">{e.timestamp}</Td>
            <Td className="py-3.5 text-black">{e.product}</Td>
            <Td className="py-3.5 text-black">{e.action}</Td>
            <Td className="py-3.5 text-black">{e.userEmail}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
