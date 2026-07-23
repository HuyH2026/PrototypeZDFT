// CX Journey → Automation. Segmented control switches sub-views. "Agent gaps"
// and "Knowledge gaps" are designed (each: stats banner + toolbar + table); the
// search box and toolbar icon buttons are presentational (no backend). The
// remaining "Realized impact" sub-tab renders a "Coming soon" empty region.
import {
  Download,
  Info,
  List,
  ListFilter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Tag,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
  AUTOMATION_INTRO,
  AUTOMATION_ROWS,
  AUTOMATION_STATS,
  AUTOMATION_SUBTABS,
  KNOWLEDGE_GAP_ROWS,
  KNOWLEDGE_INTRO,
  KNOWLEDGE_STATS,
  type AutomationSubTab,
} from './automation-data'
import { GeneratedAgentPanel } from './GeneratedAgentPanel'

const COLS = [
  'Topic for generated policy',
  'Autoflow policy',
  'Ticket coverage/year',
  'Potential savings/year',
  'Time created',
]

function SegmentedControl({
  value,
  onChange,
}: {
  value: AutomationSubTab
  onChange: (v: AutomationSubTab) => void
}) {
  return (
    <div role="tablist" className="flex items-center gap-1 rounded-full bg-app-backdrop p-1">
      {AUTOMATION_SUBTABS.map(({ label, icon: Icon }) => {
        const active = label === value
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(label)}
            className={
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium ' +
              (active ? 'bg-white text-ink shadow-sm' : 'text-ink-muted')
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

function StatsBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#fbeee6] to-[#e7eef6] p-6">
      <p className="text-[13px] text-ink">{AUTOMATION_INTRO}</p>
      <div className="mt-4 flex flex-wrap gap-x-24 gap-y-4">
        {AUTOMATION_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-[32px] font-semibold text-ink">{stat.value}</p>
            <p className="flex items-center gap-1 text-[13px] text-ink-muted">
              {stat.label}
              <Info className="h-3.5 w-3.5" />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Toolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5">
        <Search className="h-4 w-4 text-ink-muted" />
        <input
          type="text"
          placeholder="Search"
          className="w-40 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      <div className="flex items-center gap-1">
        {[Download, List, Table2].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="rounded-lg border border-surface-border p-1.5 text-ink-muted"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}

function PolicyTable({ onRowClick }: { onRowClick: (topic: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-surface-border">
            {COLS.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-[12px] font-medium text-ink-muted">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AUTOMATION_ROWS.map((row) => (
            <tr
              key={row.topic}
              role="button"
              tabIndex={0}
              onClick={() => onRowClick(row.topic)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick(row.topic)
                }
              }}
              className="cursor-pointer border-b border-surface-border align-top hover:bg-app-backdrop"
            >
              <td className="px-4 py-6">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-app-backdrop px-2 py-1 text-[13px] text-ink">
                  <Sparkles className="h-3.5 w-3.5 text-ink-muted" />
                  {row.topic}
                </span>
              </td>
              <td className="px-4 py-6 text-[13px] text-ink">
                <p className="line-clamp-3 max-w-[320px]">{row.policy}</p>
              </td>
              <td className="px-4 py-6 text-[13px] text-ink">{row.coverage}</td>
              <td className="px-4 py-6 text-[13px] text-ink">{row.savings}</td>
              <td className="px-4 py-6 text-[13px] text-ink">{row.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KnowledgeBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#fbeee6] to-[#e7eef6] p-6">
      <p className="text-[13px] font-semibold text-ink-muted">{KNOWLEDGE_INTRO}</p>
      <div className="mt-4 flex flex-wrap gap-x-24 gap-y-4">
        {KNOWLEDGE_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-[26px] font-semibold text-ink">{stat.value}</p>
            <p className="flex items-center gap-1 text-[12px] font-semibold text-ink-muted">
              {stat.label}
              <Info className="h-3.5 w-3.5" />
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
        <div className="flex items-center gap-2 rounded-full border border-surface-border px-3 py-1.5">
          <Search className="h-4 w-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search"
            className="w-40 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-[13px] font-medium text-ink"
        >
          <ListFilter className="h-4 w-4" />
          Filter by
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink"
        >
          <SlidersHorizontal className="h-4 w-4" />
          All filters
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] font-medium text-ink"
        >
          <Tag className="h-4 w-4" />
          Manage labels
        </button>
      </div>
      <div className="flex items-center gap-1">
        {[Download, List, Table2].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="rounded-lg border border-surface-border p-1.5 text-ink-muted"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}

const KNOWLEDGE_COLS = [
  'Content title',
  'Body',
  'Related topic',
  'Related articles',
  'Labels',
  'Ticket coverage/year',
]

function KnowledgeTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-surface-border">
            {KNOWLEDGE_COLS.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-[12px] font-medium text-ink-muted">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KNOWLEDGE_GAP_ROWS.map((row) => (
            <tr key={row.title} className="border-b border-surface-border align-top">
              <td className="px-4 py-6 text-[13px] text-ink">
                <p className="max-w-[220px]">{row.title}</p>
              </td>
              <td className="px-4 py-6 text-[13px] text-ink">
                <p className="line-clamp-3 max-w-[320px]">{row.body}</p>
              </td>
              <td className="px-4 py-6">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-app-backdrop px-2 py-1 text-[12px] text-ink-muted">
                  <Zap className="h-3.5 w-3.5 text-ink-muted" />
                  {row.relatedTopic}
                </span>
              </td>
              <td className="px-4 py-6">
                <a className="cursor-pointer text-[12px] font-medium text-blue-700 underline">
                  {row.relatedArticle}
                </a>
              </td>
              <td className="px-4 py-6 text-[13px] text-grey-500">{row.labels}</td>
              <td className="px-4 py-6 text-[13px] text-ink">{row.coverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AutomationView() {
  const [subTab, setSubTab] = useState<AutomationSubTab>('Agent gaps')
  const [openTopic, setOpenTopic] = useState<string | null>(null)
  return (
    <section data-testid="view-automation" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">Automation</h2>
        <SegmentedControl value={subTab} onChange={setSubTab} />
      </div>
      {subTab === 'Agent gaps' && (
        <>
          <StatsBanner />
          <Toolbar />
          <PolicyTable onRowClick={setOpenTopic} />
        </>
      )}
      {subTab === 'Knowledge gaps' && (
        <>
          <KnowledgeBanner />
          <KnowledgeToolbar />
          <KnowledgeTable />
        </>
      )}
      {subTab === 'Realized impact' && (
        <div className="flex h-64 items-center justify-center text-[14px] text-ink-muted">
          Coming soon
        </div>
      )}
      {openTopic && (
        <GeneratedAgentPanel topic={openTopic} onClose={() => setOpenTopic(null)} />
      )}
    </section>
  )
}
