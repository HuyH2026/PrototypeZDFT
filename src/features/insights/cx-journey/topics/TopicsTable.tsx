// Zone 3 + 4 of the Topics tab: a presentational toolbar (search, date,
// audience, view toggles, group-topics checkbox) over a nested, expandable
// topics table. Top-level rows are rounded cards; expanding one reveals a
// nested grid (its own header + sub-topic rows that expand to leaf rows). Two
// independent accordion mechanisms drive expansion — a Set of open top-level
// ids and per-SubRow local state. Everything else is inert.
import { useState } from 'react'
import {
  ArrowDown,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  Frown,
  Info,
  LayoutGrid,
  ListFilter,
  Meh,
  MoreVertical,
  Network,
  Search,
  Smile,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { cn } from '@/lib/cn'
import { RED, TEAL } from '../cx-journey-data'
import { type TopicRow, type TopicSub, TOPIC_ROWS, sentimentBand } from './topics-data'
import { TopicTreemap } from './TopicTreemap'

// Signed-percentage text: green when negative (improvement), red when positive.
function ChangeText({ pct, abs }: { pct: number; abs: string }) {
  return (
    <span className="text-[13px] font-medium" style={{ color: pct < 0 ? TEAL : RED }}>
      {pct > 0 ? '+' : ''}
      {pct}% <span className="font-normal text-ink-muted">({abs})</span>
    </span>
  )
}

// Sentiment face keyed to the band (good → smile, ok → meh, bad → frown).
const BAND_FACE: Record<string, LucideIcon> = { good: Smile, ok: Meh, bad: Frown }

function SentimentValue({ score }: { score: number }) {
  const band = sentimentBand(score)
  const Face = BAND_FACE[band.label]
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[13px] font-medium text-ink">{score}</span>
      <Face className="h-4 w-4" style={{ color: band.color }} />
    </span>
  )
}

// A labelled metric with the label in grey inline before the value (matching the
// design's "Tickets 25,286 (40.89%)" run-in style).
function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-ink">
      <span className="text-ink-muted">{label}</span>
      {children}
    </span>
  )
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-lg border p-1.5 transition-colors duration-instant',
        active
          ? 'border-nav-active bg-nav-active text-white'
          : 'border-surface-border bg-white text-ink-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({
  view,
  onViewChange,
}: {
  view: 'table' | 'treemap'
  onViewChange: (view: 'table' | 'treemap') => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-[220px] max-w-[280px] flex-1 items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-1.5">
        <Search className="size-3.5 text-ink-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-muted"
          placeholder="Search by topic"
        />
      </div>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-[12px] text-ink"
      >
        <Calendar className="size-3.5 text-ink-muted" />
        Last 30 days
        <ChevronDown className="size-3.5 text-ink-muted" />
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-[12px] text-ink"
      >
        <ListFilter className="size-3.5 text-ink-muted" />
        All filters
        <ChevronDown className="size-3.5 text-ink-muted" />
      </button>
      <div className="flex items-center gap-1">
        <ViewButton
          active={view === 'table'}
          label="Table view"
          onClick={() => onViewChange('table')}
        >
          <LayoutGrid className="size-3.5" />
        </ViewButton>
        <ViewButton
          active={view === 'treemap'}
          label="Treemap view"
          onClick={() => onViewChange('treemap')}
        >
          <Network className="size-3.5" />
        </ViewButton>
      </div>
      <label className="flex items-center gap-1.5 text-[12px] text-ink">
        <input type="checkbox" defaultChecked className="size-4 accent-[var(--color-nav-active)]" />
        Group topics
      </label>
    </div>
  )
}

// --- Nested grid (revealed inside an expanded top-level card) ---------------
// Fixed column template shared by the nested header and every nested row, so the
// vertical dividers line up into a real grid.
const NESTED_COLS = 'grid-cols-[minmax(240px,1.4fr)_1fr_1fr_1fr_1.2fr]'

function NestedHeaderCell({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 border-r border-surface-border px-4 py-2.5 text-[12px] font-medium text-ink-muted last:border-r-0">
      {label}
      <Info className="h-3 w-3 text-ink-muted" />
    </div>
  )
}

// One data cell in the nested grid. `indent` pushes the first column in for the
// leaf level; `chevron` renders the sub-topic expand control.
function NestedCell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`border-r border-surface-border px-4 py-3 last:border-r-0 ${className}`}>
      {children}
    </div>
  )
}

// Level-3 leaf row (white background, name indented under its sub-topic).
function LeafRow({ leaf }: { leaf: TopicSub['children'][number] }) {
  return (
    <div className={`grid ${NESTED_COLS} border-t border-surface-border bg-white`}>
      <NestedCell className="pl-14 text-[13px] text-ink">{leaf.name}</NestedCell>
      <NestedCell className="text-[13px] text-ink">
        {leaf.tickets.toLocaleString('en-US')}{' '}
        <span className="text-ink-muted">({leaf.ticketsPct})</span>
      </NestedCell>
      <NestedCell>
        <ChangeText pct={leaf.ticketsChangePct} abs={leaf.ticketsChangeAbs} />
      </NestedCell>
      <NestedCell className="text-[13px] text-ink">{leaf.fullResTime}</NestedCell>
      <NestedCell>
        <ChangeText pct={leaf.fullResChangePct} abs={leaf.fullResChangeAbs} />
      </NestedCell>
    </div>
  )
}

// Level-2 sub-topic row (grey-tinted; expands to leaf rows).
function SubRow({ sub, isFirst }: { sub: TopicSub; isFirst: boolean }) {
  const [open, setOpen] = useState(sub.id === 'pm-refund')
  const rowClass = cn(
    `grid ${NESTED_COLS} bg-app-backdrop`,
    !isFirst && 'border-t border-table-divider',
  )
  return (
    <>
      <div className={rowClass}>
        <NestedCell className="text-[13px]">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-left text-[13px] leading-[18px] font-semibold text-ink"
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
            )}
            {sub.name} <span className="font-normal text-ink-muted">({sub.count})</span>
          </button>
        </NestedCell>
        <NestedCell className="text-[13px] text-ink">
          {sub.tickets.toLocaleString('en-US')}{' '}
          <span className="text-ink-muted">({sub.ticketsPct})</span>
        </NestedCell>
        <NestedCell>
          <ChangeText pct={sub.ticketsChangePct} abs={sub.ticketsChangeAbs} />
        </NestedCell>
        <NestedCell className="text-[13px] text-ink">{sub.fullResTime}</NestedCell>
        <NestedCell>
          <ChangeText pct={sub.fullResChangePct} abs={sub.fullResChangeAbs} />
        </NestedCell>
      </div>
      {open && sub.children.map((leaf) => <LeafRow key={leaf.id} leaf={leaf} />)}
    </>
  )
}

// The nested grid revealed when a top-level card expands.
function NestedTable({ row }: { row: TopicRow }) {
  return (
    <div data-testid="topics-nested-table" className="overflow-hidden bg-table-header-bg">
      {/* Header row */}
      <div className={`grid ${NESTED_COLS} bg-table-header-bg`}>
        <div className="flex items-center gap-2 border-r border-surface-border px-4 py-2.5 text-[12px] font-medium text-ink-muted">
          <ChevronsDownUp className="h-3.5 w-3.5 text-ink-muted" />
          Topic ({row.count})
        </div>
        <NestedHeaderCell label="Tickets" />
        <NestedHeaderCell label="% of tickets change" />
        <NestedHeaderCell label="Full resolution time (hrs)" />
        <NestedHeaderCell label="% of full resolution time (hrs) change" />
      </div>
      {row.children.map((sub, index) => (
        <SubRow key={sub.id} sub={sub} isFirst={index === 0} />
      ))}
    </div>
  )
}

// --- Top-level card ---------------------------------------------------------
const TOP_LEVEL_COLS =
  'grid-cols-[minmax(280px,1fr)_minmax(175px,0.35fr)_minmax(210px,0.4fr)_minmax(135px,0.25fr)_24px]'

function TopicCard({
  row,
  open,
  onToggle,
}: {
  row: TopicRow
  open: boolean
  onToggle: () => void
}) {
  return (
    <Card
      data-testid="topic-card"
      flat
      className="overflow-hidden rounded-[16px] shadow-[0_1px_4px_rgba(18,20,22,0.08)]"
    >
      <div className={`grid ${TOP_LEVEL_COLS} min-w-[920px] items-center px-5 py-3.5`}>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-ink-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-ink-muted" />
          )}
          <span className="text-[13px] font-medium text-ink">{row.name}</span>
          <span className="text-[12px] text-ink-muted">({row.count})</span>
        </button>
        <div className="border-l border-surface-border pl-4">
          <Metric label="Tickets">
            <span className="font-semibold text-ink">{row.tickets.toLocaleString('en-US')}</span>
            <span className="text-ink-muted">({row.ticketsPct})</span>
          </Metric>
        </div>
        <div className="border-l border-surface-border pl-4">
          <Metric label="First contact resolution">
            <span className="font-semibold text-ink">{row.firstContactResolution}</span>
          </Metric>
        </div>
        <div className="border-l border-surface-border pl-4">
          <Metric label="Sentiment">
            <SentimentValue score={row.sentiment} />
          </Metric>
        </div>
        <button type="button" aria-label="Row options" className="text-ink-muted">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="border-t border-table-divider">{<NestedTable row={row} />}</div>
      ) : null}
    </Card>
  )
}

// Header sort label with a static sort caret.
function SortHeader({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={`flex items-center gap-1 text-[13px] font-medium text-ink-muted ${className}`}>
      {label}
      <ArrowDown className="h-3.5 w-3.5" />
    </span>
  )
}

export function TopicsTable() {
  const [view, setView] = useState<'table' | 'treemap'>('table')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['payment']))
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  return (
    <section className="flex flex-col gap-4">
      <Toolbar view={view} onViewChange={setView} />
      {view === 'treemap' ? (
        <TopicTreemap />
      ) : (
        <div className="overflow-x-auto pb-1">
          <div data-testid="topics-table" className="flex min-w-[920px] flex-col gap-2.5">
            <div
              data-testid="topics-table-header"
              className={`grid ${TOP_LEVEL_COLS} items-center rounded-[12px] bg-table-header-bg px-5 py-3`}
            >
              <SortHeader label="Topic (78)" />
              <SortHeader label="Tickets" />
              <SortHeader label="First contact resolution" />
              <SortHeader label="Sentiment" />
              <span />
            </div>
            {TOPIC_ROWS.map((row) => (
              <TopicCard
                key={row.id}
                row={row}
                open={expanded.has(row.id)}
                onToggle={() => toggle(row.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
