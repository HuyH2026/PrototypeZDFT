import { ArrowDown, ArrowUpDown } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { INDEXED_DOCUMENTS } from './integrations-data'

function HeaderCell({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span className="flex items-start gap-1.5">
      <span className="min-w-0">{label}</span>
      {active ? (
        <ArrowDown size={14} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
      ) : (
        <ArrowUpDown size={14} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden />
      )}
    </span>
  )
}

export function DocumentIndexTable() {
  return (
    <Table aria-label="Document index" className="table-fixed">
      <colgroup>
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col className="w-[22%]" />
        <col className="w-[8%]" />
        <col className="w-[16%]" />
        <col className="w-[26%]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col" className="border-r border-table-divider">
            <HeaderCell label="Integration" />
          </Th>
          <Th scope="col">
            <HeaderCell label="Source type" />
          </Th>
          <Th scope="col">
            <HeaderCell label="Title" />
          </Th>
          <Th scope="col">
            <HeaderCell label="Status" />
          </Th>
          <Th scope="col">
            <HeaderCell label="Last edit date" active />
          </Th>
          <Th scope="col">
            <HeaderCell label="Source ID" />
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {INDEXED_DOCUMENTS.map((d) => (
          <tr key={d.id} data-testid={`document-row-${d.id}`} className="text-[13px] text-ink">
            <Td className="border-r border-table-divider">{d.integration}</Td>
            <Td>{d.sourceType}</Td>
            <Td>{d.title}</Td>
            <Td>{d.status}</Td>
            <Td>{d.lastEdit}</Td>
            <Td className="break-all">{d.sourceId}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
