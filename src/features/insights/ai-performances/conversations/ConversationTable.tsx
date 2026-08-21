// The conversation table for the Conversations tab: a toolbar (search, date,
// filters, "Gaps only" toggle, icon actions) over channel-dependent columns and
// rows. Only the "Gaps only" checkbox is interactive (filters to rows flagged
// hasGap); search / date / filters / icon buttons are decorative, matching the
// sibling AI Performances views.
import { Table, Thead, Tbody, Th, Td } from '@/components/flora/Table'
import { MetricToolbar, ToolbarCheckbox } from '../MetricToolbar'
import { type ConvColumn, type ConvRow, type ResolvedStatus, SOURCE_META, type SourceKind } from './conversations-data'
import { type ConvAudit, STATE_META } from './audit-data'

function SourceChip({ source }: { source: SourceKind }) {
  const meta = SOURCE_META[source]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ color: meta.fg, background: meta.bg }}
    >
      {meta.label}
    </span>
  )
}

function AgentChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-2 py-0.5 text-[12px] text-ink">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f8a4f]" />
      {label}
    </span>
  )
}

const RESOLVED_BADGE_BG: Record<Exclude<ResolvedStatus, 'n/a'>, string> = {
  Verified: '#055952',
  Contained: '#399f96',
}

function ResolvedBadge({ status }: { status?: ResolvedStatus }) {
  if (!status || status === 'n/a') return <span className="text-ink-muted">n/a</span>
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold text-white"
      style={{ background: RESOLVED_BADGE_BG[status] }}
    >
      {status}
    </span>
  )
}

function QueryCell({ query }: { query?: { lines: string[]; more?: number } }) {
  if (!query) return <span className="text-ink-muted">—</span>
  return (
    <div className="flex flex-col gap-0.5 text-[13px] italic text-[#3489db]">
      {query.lines.map((line, i) => (
        <span key={i}>
          {line}
          {query.more && i === query.lines.length - 1 ? ` +${query.more}` : ''}
        </span>
      ))}
    </div>
  )
}

// State, never impact: the column is named State, and putting 'Delivery unknown'
// in it would mix two vocabularies in one cell. Impact lives in the drawer,
// paired with its owner, where there is room for both.
function StateChip({ audit }: { audit?: ConvAudit }) {
  if (!audit) return <span className="text-ink-muted">—</span>
  const meta = STATE_META[audit.state]
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ color: meta.fg, background: meta.bg }}
    >
      {audit.state !== 'healthy' && <span aria-hidden>⚠</span>}
      {meta.label}
    </span>
  )
}

function Cell({ col, row }: { col: ConvColumn; row: ConvRow }) {
  switch (col.id) {
    case 'timestamp':
      return <span className="text-ink-muted">{row.timestamp}</span>
    case 'automated':
      return <span className="text-ink">{row.automated ? 'Yes' : 'No'}</span>
    case 'source':
      return <SourceChip source={row.source} />
    case 'client':
      return <span className={row.client === 'n/a' ? 'text-ink-muted' : 'text-ink'}>{row.client}</span>
    case 'agents':
      return <AgentChip label={row.agents} />
    case 'query':
      return <QueryCell query={row.query} />
    case 'resolved':
      return <ResolvedBadge status={row.resolved} />
    case 'state':
      return <StateChip audit={row.detail.audit} />
    case 'transcript':
      return (
        <div className="flex flex-col text-[13px] leading-snug text-ink">
          {row.transcript.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      )
  }
}

export function ConversationTable({
  columns,
  rows,
  dateRange,
  gapsOnly,
  onGapsOnlyChange,
  errorsOnly,
  onErrorsOnlyChange,
  onRowClick,
}: {
  columns: ConvColumn[]
  rows: ConvRow[]
  dateRange: string
  gapsOnly: boolean
  onGapsOnlyChange: (v: boolean) => void
  errorsOnly: boolean
  onErrorsOnlyChange: (v: boolean) => void
  onRowClick: (row: ConvRow) => void
}) {
  const hasState = columns.some((c) => c.id === 'state')
  // `hasState` gates the filter as well as its checkbox: without a State column
  // there is no control to clear it with, so a channel that carries no audit
  // must not be narrowed to nothing. The caller resets the flag on a channel
  // change; this keeps the table right whether or not it does.
  const visible = rows.filter(
    (r) =>
      (!gapsOnly || r.hasGap) &&
      (!errorsOnly || !hasState || (r.detail.audit !== undefined && r.detail.audit.state !== 'healthy')),
  )
  return (
    <div className="flex flex-col gap-4">
      <MetricToolbar searchLabel="Search by conversation ID" dateRange={dateRange}>
        <ToolbarCheckbox label="Gaps only" checked={gapsOnly} onChange={onGapsOnlyChange} />
        {hasState && (
          <ToolbarCheckbox label="Errors only" checked={errorsOnly} onChange={onErrorsOnlyChange} />
        )}
      </MetricToolbar>

      {/* Table */}
      <Table clickableRows>
        <Thead>
          <tr>
            {columns.map((c) => (
              <Th key={c.id}>
                {c.label}
              </Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {visible.map((row) => (
            <tr
              key={row.id}
              role="button"
              tabIndex={0}
              onClick={() => onRowClick(row)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick(row)
                }
              }}
              className="cursor-pointer align-top"
            >
              {columns.map((c) => (
                <Td key={c.id}>
                  <Cell col={c} row={row} />
                </Td>
              ))}
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}
