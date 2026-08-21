// Zone 1 of the Topics tab: a collapsible panel over a soft gradient, holding
// two white cards — a "top movers" table with an inert carousel pager, and a
// "most coaching" horizontal bar chart with an inert dropdown. Presentational
// except the panel's own collapse toggle.
import { useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { DEEP_TEAL, RED, TEAL } from '../cx-journey-data'
import { COACHING_BARS, TOP_MOVERS } from './topics-data'

function TopMoversCard() {
  return (
    <Card flat className="min-w-0 flex-1 rounded-[18px] p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-3.5 text-ink-muted" />
          <p className="text-[13px] font-medium text-ink">Top movers by categorized tickets</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-ink-muted">
          <button type="button" className="rounded p-0.5" aria-label="Previous">
            <ChevronLeft className="size-3" />
          </button>
          <span>1 of 5</span>
          <button type="button" className="rounded p-0.5" aria-label="Next">
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
      <table className="w-full table-fixed text-left text-[11px] leading-6">
        <thead className="text-ink-muted">
          <tr>
            <th className="w-[46%] font-medium">Topic</th>
            <th className="w-[18%] font-medium"># of tickets</th>
            <th className="w-[18%] font-medium">Previous</th>
            <th className="w-[18%] font-medium">Comparison</th>
          </tr>
        </thead>
        <tbody>
          {TOP_MOVERS.map((m) => (
            <tr key={m.topic}>
              <td className="pr-2 text-accent-blue">{m.topic}</td>
              <td className="text-ink">{m.tickets}</td>
              <td className="text-ink-muted">({m.previous})</td>
              <td className="font-medium" style={{ color: m.comparisonPct < 0 ? TEAL : RED }}>
                {m.comparisonPct > 0 ? '+' : ''}
                {m.comparisonPct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function CoachingCard() {
  const max = Math.max(...COACHING_BARS.map((b) => b.volume))
  return (
    <Card flat className="min-w-0 flex-1 rounded-[18px] p-4">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-surface-border px-3 py-1.5 text-[12px] text-ink"
      >
        <span>Topics that required the most coaching</span>
        <ChevronDown className="size-3 text-ink-muted" />
      </button>
      <div className="flex text-[10px] text-ink-muted">
        <span className="w-[132px]">Topics</span>
        <span>Volume</span>
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {COACHING_BARS.map((b, i) => (
          <div key={`${b.topic}-${i}`} className="flex items-center text-[11px] leading-5">
            <span className="w-[132px] truncate text-ink">{b.topic}</span>
            <span className="flex flex-1 items-center gap-1.5">
              <span
                className="h-2.5 rounded-sm"
                style={{ width: `${(b.volume / max) * 100}%`, backgroundColor: DEEP_TEAL }}
              />
              <span className="text-ink-muted">{b.volume}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function TopMoversPanel() {
  const [expanded, setExpanded] = useState(true)
  return (
    <section
      className="rounded-[24px] px-5 py-4"
      style={{ background: 'linear-gradient(105deg, #fbe9e0 0%, #eef0f6 48%, #e2edf0 100%)' }}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-medium text-ink">
          <TrendingUp className="size-4 text-[#58a991]" />
          Top movers &amp; recommendations
        </h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label="Toggle top movers"
          onClick={() => setExpanded((v) => !v)}
          className="rounded p-1 hover:bg-white/40"
        >
          {expanded ? (
            <ChevronUp className="size-3.5 text-ink-muted" />
          ) : (
            <ChevronDown className="size-3.5 text-ink-muted" />
          )}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 flex flex-col gap-4 lg:flex-row">
          <TopMoversCard />
          <CoachingCard />
        </div>
      )}
    </section>
  )
}
