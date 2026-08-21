import { useState } from 'react'
import { ArrowUp, ArrowUpDown } from 'lucide-react'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { CONNECTIONS, type ConnectStatus } from './integrations-data'
import { IntegrationLogo } from './IntegrationLogo'

function StatusPill({ status }: { status: ConnectStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-grey-100 px-2.5 py-1 text-[12px] text-grey-700">
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: status === 'In use' ? 'var(--color-green-700)' : 'var(--color-grey-500)',
        }}
        aria-hidden
      />
      {status}
    </span>
  )
}

function HeaderCell({
  label,
  active = false,
  align = 'left',
}: {
  label: string
  active?: boolean
  align?: 'left' | 'right'
}) {
  return (
    <span className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
      {label}
      {active ? <ArrowUp size={13} aria-hidden /> : <ArrowUpDown size={13} aria-hidden />}
    </span>
  )
}

export function ConnectionsTable() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <Table aria-label="Connections" clickableRows className="table-fixed">
      <colgroup>
        <col className="w-[43%]" />
        <col className="w-[32%]" />
        <col className="w-[25%]" />
      </colgroup>
      <Thead>
        <tr>
          <Th scope="col">
            <HeaderCell label="Display Name" active />
          </Th>
          <Th scope="col">
            <HeaderCell label="Last Sync" />
          </Th>
          <Th scope="col">
            <HeaderCell label="Connect Status" align="right" />
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {CONNECTIONS.map((connection) => {
          const isSelected = selected === connection.id
          return (
            <tr
              key={connection.id}
              role="button"
              tabIndex={0}
              data-testid={`connection-row-${connection.id}`}
              data-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => setSelected(isSelected ? null : connection.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelected(isSelected ? null : connection.id)
                }
              }}
              className="cursor-pointer outline-none focus-visible:[&>td]:outline-2 focus-visible:[&>td]:outline-offset-[-2px] focus-visible:[&>td]:outline-flora-blue"
            >
              <Td>
                <span className="flex min-w-0 items-center gap-3">
                  <IntegrationLogo logo={connection.logo} />
                  <span className="truncate font-medium text-ink">{connection.name}</span>
                </span>
              </Td>
              <Td className="text-[13px] text-grey-700">{connection.lastSync}</Td>
              <Td>
                <span className="flex justify-end">
                  <StatusPill status={connection.status} />
                </span>
              </Td>
            </tr>
          )
        })}
      </Tbody>
    </Table>
  )
}
