// Insights → Topics root. Composes the collapsible recommendations panel, the
// collapsible overview metrics, and the table/treemap analysis surface.
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TopMoversPanel } from './TopMoversPanel'
import { TopicStatCards } from './TopicStatCards'
import { TopicsTable } from './TopicsTable'

export function TopicsView() {
  const [overviewExpanded, setOverviewExpanded] = useState(true)

  return (
    <div data-testid="view-cx-topics" className="flex flex-col gap-6">
      <TopMoversPanel />
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">
            Overview <span className="font-normal text-ink-muted">Last 30 days</span>
          </h2>
          <button
            type="button"
            aria-expanded={overviewExpanded}
            aria-label={overviewExpanded ? 'Collapse overview' : 'Expand overview'}
            onClick={() => setOverviewExpanded((value) => !value)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-ink hover:bg-table-row-hover"
          >
            {overviewExpanded ? 'Collapse' : 'Expand'}
            {overviewExpanded ? (
              <ChevronUp className="size-3.5 text-ink-muted" />
            ) : (
              <ChevronDown className="size-3.5 text-ink-muted" />
            )}
          </button>
        </div>
        {overviewExpanded ? <TopicStatCards /> : null}
        <TopicsTable />
      </section>
    </div>
  )
}
