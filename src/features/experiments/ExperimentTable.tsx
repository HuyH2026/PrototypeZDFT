// The experiments table. Columns: Name · Status · Use Case · Description ·
// Traffic split. Clicking a row opens its detail
// at /experiment/new?id=<id>.
import { useNavigate } from 'react-router'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { type Experiment } from './experiments-data'
import { StatusBadge } from './StatusBadge'
import { TrafficSplitBar } from './TrafficSplitBar'

const INK = '#2f3130'
export function ExperimentTable({ experiments }: { experiments: Experiment[] }) {
  const navigate = useNavigate()
  return (
    <Table clickableRows className="min-w-0 table-fixed">
      <colgroup>
        <col className="w-[23%]" />
        <col className="w-[13%]" />
        <col className="w-[20%]" />
        <col className="w-[29%]" />
        <col className="w-[15%]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col">Name</Th>
          <Th scope="col">Status</Th>
          <Th scope="col">Use Case</Th>
          <Th scope="col">Description</Th>
          <Th scope="col">Traffic split</Th>
        </tr>
      </Thead>
      <Tbody>
        {experiments.map((e) => (
          <tr
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/experiment/new?id=${e.id}`)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                navigate(`/experiment/new?id=${e.id}`)
              }
            }}
            className="cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <Td className="text-[14px] font-medium" style={{ color: INK }}>{e.name}</Td>
            <Td><StatusBadge status={e.status} /></Td>
            <Td className="text-[13px]" style={{ color: INK }}>{e.useCase}</Td>
            <Td className="text-[13px] text-ink-muted">{e.description}</Td>
            <Td><TrafficSplitBar splits={e.splits} /></Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
