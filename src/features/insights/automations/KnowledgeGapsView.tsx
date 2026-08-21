import { Download, Info, List, ListFilter, Search, SlidersHorizontal, Table2, Tag, Zap } from 'lucide-react'
import { useState } from 'react'
import { Table, Thead, Tbody, Th, Td } from '@/components/flora/Table'
import {
  KNOWLEDGE_GAP_INTRO,
  KNOWLEDGE_GAP_ROWS,
  KNOWLEDGE_GAP_STATS,
} from '@/features/insights/automations/automation-insights-data'
import { SelectionCheckbox } from './SelectionCheckbox'

function KnowledgeBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#fbeee6] to-[#e7eef6] p-6">
      <p className="text-[13px] text-ink-muted">{KNOWLEDGE_GAP_INTRO}</p>
      <div className="mt-4 grid grid-cols-3 gap-6">
        {KNOWLEDGE_GAP_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-[28px] font-semibold leading-9 text-ink">{stat.value}</p>
            <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-ink-muted">
              {stat.label}
              <Info className="h-3.5 w-3.5" aria-hidden />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function KnowledgeToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-surface-border px-3.5 py-2">
          <Search className="h-4 w-4 text-ink-muted" aria-hidden />
          <input
            type="text"
            placeholder="Search content block"
            className="w-44 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink"
        >
          <ListFilter className="h-4 w-4" aria-hidden />
          Filter by segment
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-surface-border px-3.5 py-2 text-[13px] font-medium text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          All filters
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-ink"
        >
          <Tag className="h-4 w-4" aria-hidden />
          Manage labels
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Export content"
          className="rounded-lg border border-surface-border bg-app-backdrop p-1.5 text-ink"
        >
          <Download className="h-4 w-4" aria-hidden />
        </button>
        {[
          { Icon: List, label: 'Row height' },
          { Icon: Table2, label: 'Column settings' },
        ].map(({ Icon, label }) => (
          <button key={label} type="button" aria-label={label} className="rounded-lg p-1.5 text-ink-muted">
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  )
}

// Fluid widths rather than intrinsic ones: the design's content area has no
// pages column, so an intrinsically-sized table pushes the last column out of
// sight here. Cells wrap instead of the table scrolling sideways.
const KNOWLEDGE_COLS = [
  { label: 'Content title', width: 'w-[20%]' },
  { label: 'Body', width: 'w-[30%]' },
  { label: 'Related topic', width: 'w-[16%]' },
  { label: 'Related articles', width: 'w-[18%]' },
  { label: 'Ticket coverage/year', width: 'w-[12%]' },
]

function KnowledgeTable() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const allSelected = selected.size === KNOWLEDGE_GAP_ROWS.length

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(KNOWLEDGE_GAP_ROWS.map((_, i) => i)))

  const toggleRow = (index: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <Table className="min-w-0 table-fixed">
      <Thead>
        <tr>
          <Th className="w-[4%]">
            <SelectionCheckbox
              label="Select all content"
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onChange={toggleAll}
            />
          </Th>
          {KNOWLEDGE_COLS.map((col) => (
            <Th key={col.label} className={col.width}>
              {col.label}
            </Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {KNOWLEDGE_GAP_ROWS.map((row, i) => (
          <tr key={row.title} data-selected={selected.has(i) || undefined} className="align-top">
            <Td>
              <SelectionCheckbox
                label={`Select ${row.title}`}
                checked={selected.has(i)}
                onChange={() => toggleRow(i)}
              />
            </Td>
            <Td className="text-[13px] text-ink">{row.title}</Td>
            <Td className="text-[13px] text-ink">
              <p className="line-clamp-3">{row.body}</p>
            </Td>
            <Td>
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-app-backdrop px-2 py-1 text-[12px] text-ink-muted">
                {/* Garden success teal (#048c80) — no token in theme.css. */}
                <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: '#048c80' }} aria-hidden />
                <span className="truncate">{row.relatedTopic}</span>
              </span>
            </Td>
            <Td>
              {row.relatedArticle ? (
                <a
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="text-[12px] font-medium text-blue-700 underline"
                >
                  {row.relatedArticle}
                </a>
              ) : (
                <span className="text-[13px] text-grey-500">n/a</span>
              )}
            </Td>
            <Td className="text-[13px] text-ink">{row.coverage}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}

export function KnowledgeGapsView() {
  return (
    <section data-testid="view-knowledge-gaps" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-ink-muted">
          Find missing or incomplete knowledge that prevents your agent from answering customer
          questions.
        </p>
        <KnowledgeBanner />
      </div>
      <KnowledgeToolbar />
      <KnowledgeTable />
    </section>
  )
}
