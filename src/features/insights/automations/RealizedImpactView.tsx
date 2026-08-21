import {
  ChevronsUpDown,
  Clock,
  CreditCard,
  FileText,
  Info,
  List,
  Search,
  Table2,
  Ticket,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { StatusTag } from '@/components/flora/StatusTag'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import {
  CONTENT_SNIPPET_IMPACT_ROWS,
  IMPACT_METRICS,
  USE_CASE_IMPACT_ROWS,
  type ImpactMetric,
  type ImpactMode,
  type ImpactRow,
} from './realized-impact-data'

const METRIC_ICONS = [Ticket, Clock, CreditCard]

function ImpactSummary({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <section className="rounded-[20px] border border-surface-border px-5 py-4">
      <p className="text-[13px] text-ink">Impact delivered in the last 30 days.</p>
      <div className="mt-4 grid grid-cols-3 gap-6">
        {metrics.map((metric, i) => {
          const Icon = METRIC_ICONS[i]
          // Only the cost metric carries an info affordance in the design, and it
          // sits at the end of the help text rather than beside the label.
          const explained = i === METRIC_ICONS.length - 1
          return (
            <div key={metric.label}>
              <p className="flex items-center gap-2 text-[24px] font-semibold text-ink">
                <Icon size={18} className="text-ink-muted" aria-hidden />
                {metric.value}
              </p>
              <p className="mt-1 text-[13px] text-ink">{metric.label}</p>
              <p className="mt-1 text-[11px] text-ink-muted">
                {metric.help}
                {explained ? (
                  <Info size={11} className="ml-1 inline align-baseline" aria-hidden />
                ) : null}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ImpactToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 rounded-full border border-surface-border px-3.5 py-2">
        <Search className="h-4 w-4 text-ink-muted" aria-hidden />
        <input
          type="text"
          placeholder="Search"
          className="w-52 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      <div className="flex items-center gap-1">
        {[
          { Icon: List, label: 'Row height' },
          { Icon: Table2, label: 'Column settings' },
        ].map(({ Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="rounded-lg p-1.5 text-ink-muted"
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  )
}

/** Content snippets are the only mode the design gives sortable headers. */
function SortableTh({ label, width }: { label: string; width: string }) {
  return (
    <Th className={width}>
      <span className="inline-flex items-center gap-1">
        {label}
        <button type="button" aria-label={`Sort by ${label}`} className="text-ink-muted">
          <ChevronsUpDown size={12} aria-hidden />
        </button>
      </span>
    </Th>
  )
}

function ImpactTable({ mode, rows }: { mode: ImpactMode; rows: ImpactRow[] }) {
  const snippets = mode === 'Content snippets'
  const columns = [
    { label: snippets ? 'Content snippet' : 'Use case', width: 'w-[18%]' },
    { label: 'Topics', width: 'w-[19%]' },
    {
      label: snippets ? 'Ticket reduction' : 'Ticket reduction/last 30 days',
      width: 'w-[17%]',
    },
    { label: snippets ? 'Cost reduction' : 'Cost reduction/last 30 days', width: 'w-[17%]' },
    { label: 'Status', width: 'w-[12%]' },
  ]

  return (
    <Table className="min-w-0 table-fixed">
      <Thead>
        <tr>
          {columns.map((column) =>
            snippets ? (
              <SortableTh key={column.label} label={column.label} width={column.width} />
            ) : (
              <Th key={column.label} className={column.width}>
                {column.label}
              </Th>
            ),
          )}
          <Th className="w-[17%]">
            <span className="sr-only">Action</span>
          </Th>
        </tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <Td>
              {snippets ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded bg-[#ebf5f7] px-2 py-1 text-[13px] text-ink">
                  <FileText size={12} className="shrink-0 text-blue-700" aria-hidden />
                  <span className="truncate">{row.name}</span>
                </span>
              ) : (
                row.name
              )}
            </Td>
            <Td>
              {row.topic === 'n/a' ? (
                <span className="text-grey-500">{row.topic}</span>
              ) : (
                <span className="inline-flex max-w-full items-center gap-1 rounded bg-app-backdrop px-2 py-1">
                  {/* Garden success teal (#048c80) — no token in theme.css. */}
                  <Zap size={12} className="shrink-0" style={{ color: '#048c80' }} aria-hidden />
                  <span className="truncate">{row.topic}</span>
                </span>
              )}
            </Td>
            <Td>{row.ticketReduction}</Td>
            <Td>{row.costReduction}</Td>
            <Td>
              <StatusTag state={row.status === 'Active' ? 'active' : 'neutral'}>
                {row.status}
              </StatusTag>
            </Td>
            <Td>
              <button type="button" className="text-[13px] font-medium text-blue-700">
                {row.action}
              </button>
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}

export function RealizedImpactView() {
  const [mode, setMode] = useState<ImpactMode>('Use cases')
  const rows = mode === 'Use cases' ? USE_CASE_IMPACT_ROWS : CONTENT_SNIPPET_IMPACT_ROWS

  return (
    <section data-testid="view-realized-impact" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-ink-muted">
          See how your active use cases and content snippets reduce tickets, resolution time, and
          support costs.
        </p>
        <ImpactSummary metrics={IMPACT_METRICS[mode]} />
      </div>
      <div
        role="tablist"
        aria-label="Realized impact source"
        className="flex gap-6 border-b border-surface-border"
      >
        {(['Use cases', 'Content snippets'] as ImpactMode[]).map((label) => {
          const active = mode === label
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(label)}
              className={
                active
                  ? '-mb-px border-b-2 border-ink pb-3 text-[14px] font-medium text-ink'
                  : 'pb-3 text-[14px] text-ink-muted'
              }
            >
              {label}
            </button>
          )
        })}
      </div>
      <ImpactToolbar />
      <ImpactTable mode={mode} rows={rows} />
    </section>
  )
}
