// Insights → Agent Overview → Use cases: the eight columns the frame's header row
// names. `showChange` adds each numeric cell's carried period-over-period change.
import { useState } from 'react'
import { NEG, POS } from '../ai-performances-data'
import { USE_CASE_COLUMNS, type UseCaseRow } from './use-cases-data'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'

function Change({ label }: { label: string }) {
  return (
    <span className="mt-0.5 block text-[12px]" style={{ color: label.startsWith('-') ? NEG : POS }}>
      {label}
    </span>
  )
}

// A dot plus an On / Off label, as the frame draws it — teal on, grey off. This is
// deliberately not list-parts' RowToggle: that control is a pill switch with its
// state written inside the track, a different object from what this frame shows.
// It stays local to this table rather than joining list-parts, which is for
// furniture more than one screen shares.
//
// Live but terminal: `key`ed on the row id by the caller, so a channel change
// hands each row a fresh control seeded from its own data rather than carrying an
// edit across.
function ActivateCell({ name, initial }: { name: string; initial: boolean }) {
  const [on, setOn] = useState(initial)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Activate ${name}`}
      onClick={() => setOn((v) => !v)}
      className="flex items-center gap-2 text-[13px] text-ink"
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: on ? '#048c80' : '#c9c7c3' }}
      />
      {on ? 'On' : 'Off'}
    </button>
  )
}

export function UseCasesTable({ rows, showChange }: { rows: UseCaseRow[]; showChange: boolean }) {
  return (
    <Table>
      <Thead>
        <tr>
          {USE_CASE_COLUMNS.map((c) => (
            <Th key={c.id} className={`whitespace-nowrap ${c.width}`}>
              {c.label}
            </Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <tr key={row.id} className="align-top">
            <Td>
              <span className="text-[14px] font-medium text-ink">{row.name}</span>
            </Td>
            <Td>
              <ActivateCell key={row.id} name={row.name} initial={row.activated} />
            </Td>
            <Td>
              <span className="text-ink">{row.channel}</span>
            </Td>
            <Td>
              <span className="text-ink">{row.type}</span>
            </Td>
            <Td>
              <span className="text-ink">{row.conversations}</span>
              {showChange && <Change label={row.change.conversations} />}
            </Td>
            <Td>
              <span className="text-ink">{row.deflections}</span>
              {showChange && <Change label={row.change.deflections} />}
            </Td>
            <Td>
              <span className="text-ink">{row.deflectionRate}</span>
            </Td>
            <Td>
              <span className="text-ink">{row.csat}</span>
              {showChange && <Change label={row.change.csat} />}
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
