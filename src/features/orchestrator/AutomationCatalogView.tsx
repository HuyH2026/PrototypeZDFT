import { useState } from 'react'
import { Calendar, ChevronDown, Search } from 'lucide-react'
import { AutomationTable } from './AutomationTable'
import { MetricStrip } from './MetricStrip'
import { AUTOMATIONS, METRICS, type Automation } from './orchestrator-data'

export function AutomationCatalogView({ onOpen }: { onOpen: (id: string) => void }) {
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS)
  const onToggle = (id: string) =>
    setAutomations((rows) => rows.map((row) => (row.id === id ? { ...row, on: !row.on } : row)))

  return (
    <section data-testid="view-automation-catalog" className="flex flex-col gap-6">
      <MetricStrip metrics={METRICS} />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-surface-border px-3 py-2">
          <Search size={15} className="text-ink-muted" aria-hidden />
          <input
            type="text"
            placeholder="Search"
            className="w-40 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <button type="button" className="flex items-center gap-2 rounded-full border border-surface-border px-3 py-2 text-[14px] text-ink">
          <Calendar size={15} className="text-ink-muted" aria-hidden />
          Jan 1, 2025 – Dec 31, 2025
          <ChevronDown size={15} className="text-ink-muted" aria-hidden />
        </button>
        <button type="button" className="rounded-full border border-surface-border px-3 py-2 text-[14px] text-ink">
          All filters
        </button>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" className="rounded-full border border-surface-border px-4 py-2 text-[14px] text-ink">
            Simulations
          </button>
          <button type="button" className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white">
            New automation
          </button>
        </div>
      </div>
      <AutomationTable
        automations={automations}
        isOn={(automation) => automation.on}
        onToggle={onToggle}
        onOpen={onOpen}
      />
    </section>
  )
}
