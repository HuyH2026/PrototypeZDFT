// Insights → Agent Overview → Topics: six columns over expandable category rows.
// `grouped` off flattens the table to the child topics with no expanders;
// `gapsOnly` keeps the categories carrying a gap (and, flattened, the gap topics).
import { useState } from 'react'
import { INK } from '../ai-performances-data'
import {
  AO_CSAT_TEAL_THRESHOLD,
  AO_TOPIC_COLUMNS,
  type AoTopicGroup,
  type AoTopicRow,
  type AoUseCaseChip,
  groupHasGap,
  nonResolutions,
} from './ao-topics-data'
import { GardenIcon } from '@/components/garden-icon'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'

function CsatValue({ csat }: { csat: string }) {
  const teal = Number(csat) >= AO_CSAT_TEAL_THRESHOLD
  return <span style={{ color: teal ? '#048c80' : INK }}>{csat}</span>
}

function UseCaseChip({ chip }: { chip: AoUseCaseChip }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f2f4f7] px-2.5 py-1 text-[12px] text-[#545767]">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-[#048c80]" />
      {chip.label}
      {chip.more ? <span className="text-ink-muted">+{chip.more}</span> : null}
    </span>
  )
}

function CountChip({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#e6e6e3] px-2 py-0.5 text-[12px] text-ink-muted">
      {count}
    </span>
  )
}

// The four metric cells are identical between a category row and a child row, so
// they are written once.
function MetricCells({ row }: { row: { chats: number; resolutions: number; csat: string; useCases: AoUseCaseChip } }) {
  return (
    <>
      <Td>
        <span className="text-ink">{row.chats.toLocaleString()}</span>
      </Td>
      <Td>
        <span className="text-ink">{row.resolutions.toLocaleString()}</span>
      </Td>
      <Td>
        <span className="text-ink">{nonResolutions(row).toLocaleString()}</span>
      </Td>
      <Td>
        <CsatValue csat={row.csat} />
      </Td>
      <Td>
        <UseCaseChip chip={row.useCases} />
      </Td>
    </>
  )
}

export function AoTopicsTable({
  groups,
  grouped,
  gapsOnly,
}: {
  groups: AoTopicGroup[]
  grouped: boolean
  gapsOnly: boolean
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const visibleGroups = groups.filter((g) => !gapsOnly || groupHasGap(g))
  const flatRows: AoTopicRow[] = groups
    .flatMap((g) => g.children)
    .filter((r) => !gapsOnly || r.hasGap)

  const childRow = (child: AoTopicRow, indented: boolean) => (
    <tr key={child.id} className="h-[92px]">
      <Td>
        <span className={indented ? 'pl-8 text-ink' : 'text-ink'}>{child.label}</span>
      </Td>
      <MetricCells row={child} />
    </tr>
  )

  return (
    <Table>
      <Thead>
        <tr>
          {AO_TOPIC_COLUMNS.map((c) => (
            <Th key={c.id} className={`whitespace-nowrap ${c.width}`}>
              {c.label}
            </Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {grouped
          ? visibleGroups.flatMap((group) => {
              const open = expanded.has(group.id)
              const children = gapsOnly ? group.children.filter((c) => c.hasGap) : group.children
              return [
                <tr key={group.id} className="h-[92px]">
                  <Td>
                    <button
                      type="button"
                      onClick={() => toggle(group.id)}
                      aria-expanded={open}
                      aria-label={`${open ? 'Collapse' : 'Expand'} ${group.label}`}
                      className="flex items-center gap-2 text-left"
                    >
                      <GardenIcon
                        name="chevron-down-stroke"
                        className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-instant ease-soft ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                      <span className="text-[14px] font-medium text-ink">{group.label}</span>
                      <CountChip count={group.count} />
                    </button>
                  </Td>
                  <MetricCells row={group} />
                </tr>,
                ...(open ? children.map((child) => childRow(child, true)) : []),
              ]
            })
          : flatRows.map((child) => childRow(child, false))}
      </Tbody>
    </Table>
  )
}
