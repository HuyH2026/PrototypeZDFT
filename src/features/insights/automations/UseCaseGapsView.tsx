import { Download, Info, List, Search, Table2, Zap } from 'lucide-react'
import { useState } from 'react'
import { Table, Thead, Tbody, Th, Td } from '@/components/flora/Table'
import {
  USE_CASE_GAP_INTRO,
  USE_CASE_GAP_ROWS,
  USE_CASE_GAP_STATS,
} from '@/features/insights/automations/automation-insights-data'
import { CreateUseCasePanel } from '@/features/insights/automations/CreateUseCasePanel'

const USE_CASE_COLUMNS = [
  'Topic for generated use case',
  'Use case',
  'Ticket coverage/year',
  'Potential savings/year',
  'Time created',
]

function UseCaseGapBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#fbeee6] to-[#e7eef6] p-6">
      <p className="text-[13px] text-ink-muted">{USE_CASE_GAP_INTRO}</p>
      <div className="mt-4 grid grid-cols-3 gap-6">
        {USE_CASE_GAP_STATS.map((stat) => (
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

function UseCaseGapToolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 rounded-full border border-surface-border px-3.5 py-2">
        <Search className="h-4 w-4 text-ink-muted" aria-hidden />
        <input
          type="text"
          placeholder="Search"
          className="w-40 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Export use cases"
          className="rounded-lg border border-surface-border bg-app-backdrop p-1.5 text-ink"
        >
          <Download className="h-4 w-4" aria-hidden />
        </button>
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

function UseCaseGapTable({
  onRowClick,
}: {
  onRowClick: (topic: string, opener: HTMLTableRowElement) => void
}) {
  return (
    <Table clickableRows>
      <Thead>
        <tr>
          {USE_CASE_COLUMNS.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {USE_CASE_GAP_ROWS.map((row) => (
          <tr
            key={row.topic}
            role="button"
            tabIndex={0}
            onClick={(event) => onRowClick(row.topic, event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onRowClick(row.topic, event.currentTarget)
              }
            }}
            className="cursor-pointer align-top"
          >
            <Td>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-app-backdrop px-2 py-1 text-[12px] text-ink-muted">
                {/* Garden success teal (#048c80) — no token in theme.css. */}
                <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: '#048c80' }} aria-hidden />
                <span className="line-clamp-1 max-w-[168px]">{row.topic}</span>
              </span>
            </Td>
            <Td className="text-[13px] text-ink">
              <p className="line-clamp-3 max-w-[320px] whitespace-pre-line">{row.useCase}</p>
            </Td>
            <Td className="text-[13px] text-ink">{row.coverage}</Td>
            <Td className="text-[13px] text-ink">{row.savings}</Td>
            <Td className="whitespace-nowrap text-[13px] text-ink">{row.created}</Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}

export function UseCaseGapsView() {
  const [openUseCase, setOpenUseCase] = useState<{
    topic: string
    opener: HTMLTableRowElement
  } | null>(null)

  return (
    <section data-testid="view-use-case-gaps" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-ink-muted">
          Find customer needs your agent does not yet handle and estimate the potential impact of
          automating them.
        </p>
        <UseCaseGapBanner />
      </div>
      <UseCaseGapToolbar />
      <UseCaseGapTable onRowClick={(topic, opener) => setOpenUseCase({ topic, opener })} />
      {openUseCase && (
        <CreateUseCasePanel
          topic={openUseCase.topic}
          opener={openUseCase.opener}
          onClose={() => setOpenUseCase(null)}
        />
      )}
    </section>
  )
}
