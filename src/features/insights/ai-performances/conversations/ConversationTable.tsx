// The conversation table for the Conversations tab: a toolbar (search, date,
// filters, "Gaps only" toggle, icon actions) over channel-dependent columns and
// rows. Only the "Gaps only" checkbox is interactive (filters to rows flagged
// hasGap); search / date / filters / icon buttons are decorative, matching the
// sibling AI Performances views.
import { Columns3, Download, Menu, Search } from 'lucide-react'
import { DatePill } from '../SectionHeader'
import { type ConvColumn, type ConvRow, SOURCE_META, type SourceKind } from './conversations-data'

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
  gapsOnly,
  onGapsOnlyChange,
}: {
  columns: ConvColumn[]
  rows: ConvRow[]
  gapsOnly: boolean
  onGapsOnlyChange: (v: boolean) => void
}) {
  const visible = gapsOnly ? rows.filter((r) => r.hasGap) : rows
  return (
    <div className="rounded-2xl border border-surface-border bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
        <div className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-[13px] text-ink-muted">
          <Search className="h-3.5 w-3.5" />
          Search by conversation ID
        </div>
        <DatePill label="May 2, 2026 – Jun 1, 2026" />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[13px] font-medium text-[#01567A]"
        >
          All filters
        </button>
        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={gapsOnly}
            onChange={(e) => onGapsOnlyChange(e.target.checked)}
            className="h-4 w-4 accent-[#01567A]"
          />
          Gaps only
        </label>
        <div className="ml-auto flex items-center gap-3 text-[#01567A]">
          <button type="button" aria-label="Download"><Download className="h-4 w-4" /></button>
          <button type="button" aria-label="List view"><Menu className="h-4 w-4" /></button>
          <button type="button" aria-label="Columns"><Columns3 className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((c) => (
              <th key={c.id} className="px-4 py-3 font-medium text-ink-muted">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id} className="border-b border-surface-border last:border-0 align-top">
              {columns.map((c) => (
                <td key={c.id} className="px-4 py-4">
                  <Cell col={c} row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
