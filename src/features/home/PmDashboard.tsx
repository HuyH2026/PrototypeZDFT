import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDownRight, ArrowUpRight, Check, ChevronDown, ExternalLink, GripVertical, LayoutGrid,
  List, Plug, Search, Sparkles, TrendingDown, TrendingUp, Users, X,
} from 'lucide-react'
import { Link } from 'react-router'
import { useDrag, useDrop } from 'react-dnd'
import { Card as FloraCard } from '@/components/flora/Card'
import {
  PM_DATA, PM_NOW, SPOTLIGHT_TABS, SPOTLIGHT_TAB_COLOR, LIFECYCLE_LABEL,
  type PmKpi, type TrendingItem, type AtRiskItem, type AskingItem, type SpotlightTag,
  type LifecycleStage, type Opportunity,
  type SpotlightFilter, type LifecycleStageKey, type OppType,
} from './pm-data'
import {
  PM_TOOLS, PM_TOOL_LABEL, createPmIssueLink, loadPmIntegration, persistPmIntegration,
  type PmIntegration, type PmTool,
} from './pm-integration'
import {
  INK, INK_SOFT, MUTED, BORDER, BLUE, GREEN, RED, PURPLE,
  ImpactDonut, STAGE_COLOR, StageBadge, TypeTag,
} from './pm-ui'
import type { PmWidgetId } from './generate-layout'
import { PM_WIDGET_ID_LIST } from './generate-layout'
import { PmActionDialog, type PmActionMode } from './PmActionDialog'

const DAY = 86400000

// --- Building blocks --------------------------------------------------------
function PmCard({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <FloraCard className={`p-5 ${className}`} style={{ borderColor: BORDER }} {...rest}>
      {children}
    </FloraCard>
  )
}

function SectionLabel({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[15px] font-semibold tracking-[-0.154px]" style={{ color: INK }}>{title}</p>
      {action}
    </div>
  )
}

// --- KPIs -------------------------------------------------------------------
// Styled to match the Executive dashboard's metric cards (KpiCard in
// ExecutiveDashboard.tsx): an unboxed grid of individually-carded metrics
// rather than a set of flex-wrap chips inside one shared outer card.
function KpiCard({ kpi }: { kpi: PmKpi }) {
  const deltaColor = kpi.deltaGood ? GREEN : RED
  return (
    <FloraCard className="flex min-h-[152px] flex-col p-5">
      <p className="text-[14px] font-medium leading-5" style={{ color: INK }}>{kpi.label}</p>
      <p className="mt-4 text-[26px] font-medium leading-8 tracking-[-0.45px]" style={{ color: INK }}>{kpi.value}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[12px] leading-4">
        <span className="truncate" style={{ color: MUTED }}>{kpi.caption}</span>
        <span className="flex shrink-0 items-center gap-0.5" style={{ color: deltaColor }}>
          {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="font-semibold">{kpi.delta}</span>
        </span>
      </div>
    </FloraCard>
  )
}

function PmKpis() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {PM_DATA.kpis.map((k) => <KpiCard key={k.key} kpi={k} />)}
    </div>
  )
}

// --- Spotlight --------------------------------------------------------------
// The row shell is shared; each tab supplies its own right-hand column. The
// meta line and title sit under a rank chip, matching the Figma across tabs.
function SpotlightRowShell({
  rank, title, meta, right, first, oppId,
}: {
  rank: number; title: string; meta: string; right: ReactNode; first: boolean; oppId?: string
}) {
  const inner = (
    <div className="flex items-center gap-3 py-3" style={{ borderTop: first ? 'none' : `1px solid ${BORDER}` }}>
      <span className="w-6 shrink-0 text-[15px] font-semibold" style={{ color: MUTED }}>{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-[18px]" style={{ color: INK }}>{title}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium" style={{ color: MUTED }}>{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">{right}</div>
    </div>
  )
  if (oppId) {
    return <Link to={`/opportunity/${oppId}`} className="block outline-none hover:bg-[#faf9f8]">{inner}</Link>
  }
  return inner
}

// BUG/GAP tag for the At-risk tab (GAP is new in this design).
const SPOTLIGHT_TAG_META: Record<SpotlightTag, { label: string; color: string; bg: string }> = {
  bug: { label: 'BUG', color: RED, bg: `${RED}18` },
  gap: { label: 'GAP', color: '#ac5918', bg: '#ffe6cb' },
}

function SpotlightTagPill({ tag }: { tag: SpotlightTag }) {
  const meta = SPOTLIGHT_TAG_META[tag]
  return (
    <span className="flex h-[22px] items-center justify-center rounded-[5px] px-2.5" style={{ backgroundColor: meta.bg }}>
      <span className="text-[11px] font-semibold tracking-[0.2px]" style={{ color: meta.color }}>{meta.label}</span>
    </span>
  )
}

function TrendingRows({ items }: { items: TrendingItem[] }) {
  return (
    <>
      {items.map((item, i) => {
        const trendColor = item.trendGood ? GREEN : RED
        return (
          <SpotlightRowShell
            key={item.id} rank={item.rank} title={item.title} meta={item.meta} first={i === 0} oppId={item.oppId}
            right={
              <>
                <StageBadge stage={item.stage} />
                <span className="flex w-[52px] items-center justify-end gap-0.5" style={{ color: trendColor }}>
                  {item.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span className="text-[13px] font-semibold">{item.trendPct}</span>
                </span>
              </>
            }
          />
        )
      })}
    </>
  )
}

function AtRiskRows({ items }: { items: AtRiskItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <SpotlightRowShell
          key={item.id} rank={item.rank} title={item.title} meta={item.meta} first={i === 0} oppId={item.oppId}
          right={
            <>
              <SpotlightTagPill tag={item.tag} />
              <span className="w-[52px] text-right text-[14px] font-semibold" style={{ color: INK }}>{item.amount}</span>
            </>
          }
        />
      ))}
    </>
  )
}

function AskingRows({ items }: { items: AskingItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <SpotlightRowShell
          key={item.id} rank={item.rank} title={item.title} meta={item.meta} first={i === 0} oppId={item.oppId}
          right={
            <>
              <StageBadge stage={item.stage} />
              <span className="w-[52px] text-right text-[14px] font-semibold" style={{ color: BLUE }}>{item.amount}</span>
            </>
          }
        />
      ))}
    </>
  )
}

function PmSpotlight() {
  const [tab, setTab] = useState<SpotlightFilter>('trending')
  return (
    <PmCard data-testid="pm-spotlight" className="h-full">
      <SectionLabel
        title="Spotlight"
        action={
          <div className="flex items-center gap-2">
            {SPOTLIGHT_TABS.map((t) => {
              const on = tab === t.key
              const accent = SPOTLIGHT_TAB_COLOR[t.key]
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  aria-pressed={on}
                  className="flex h-7 items-center gap-1.5 rounded-full px-2.5 outline-none transition-colors"
                  style={{ backgroundColor: on ? accent : 'var(--color-grey-100)' }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: on ? '#fff' : accent }} />
                  <span className="text-[12px] font-semibold" style={{ color: on ? '#fff' : INK }}>{t.label}</span>
                </button>
              )
            })}
          </div>
        }
      />
      <div className="flex flex-col">
        {tab === 'trending' && <TrendingRows items={PM_DATA.spotlight.trending} />}
        {tab === 'at-risk' && <AtRiskRows items={PM_DATA.spotlight.atRisk} />}
        {tab === 'asking' && <AskingRows items={PM_DATA.spotlight.asking} />}
      </div>
    </PmCard>
  )
}

// --- Lifecycle --------------------------------------------------------------
function PmLifecycle() {
  const maxAmount = Math.max(...PM_DATA.lifecycle.map((s) => s.amountValue), 1)
  return (
    <PmCard className="h-full">
      <SectionLabel title="Lifecycle" />
      <div className="flex h-[180px] items-end gap-4">
        {PM_DATA.lifecycle.map((s: LifecycleStage) => {
          const pct = (s.amountValue / maxAmount) * 100
          const color = STAGE_COLOR[s.key]
          return (
            <div key={s.key} className="flex flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[12px] font-semibold" style={{ color: INK }}>{s.amount}</span>
              <div className="flex w-full items-end justify-center" style={{ height: '120px' }}>
                <div className="w-full rounded-t-lg" style={{ height: `${pct}%`, backgroundColor: `${color}cc`, minHeight: 4 }} />
              </div>
              <span className="text-[11px] font-normal" style={{ color: MUTED }}>{s.recCount} rec.</span>
              <span className="text-[12px] font-normal" style={{ color: INK_SOFT }}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </PmCard>
  )
}

// --- Opportunity card -------------------------------------------------------
function OpportunityCard({
  opp, integration, onCreate, viewMode,
}: {
  opp: Opportunity
  integration: PmIntegration
  onCreate: (id: string) => void
  viewMode: 'list' | 'grid'
}) {
  const revColor = opp.revenueState === 'at-risk' ? RED : GREEN
  const volColor = opp.volumeGood ? GREEN : RED
  const toolLabel = integration.tool ? PM_TOOL_LABEL[integration.tool] : null
  const issueLink = integration.linkedIssues[opp.id]
  const linkedToolLabel = issueLink ? PM_TOOL_LABEL[issueLink.tool] : null
  const [dialogMode, setDialogMode] = useState<PmActionMode | null>(null)

  return (
    <article
      aria-label={`${opp.title} opportunity`}
      className={`rounded-2xl border border-solid p-4 ${viewMode === 'grid' ? '' : 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4'}`}
      style={{ borderColor: BORDER, backgroundColor: '#fff' }}
    >
      <Link
        to={`/opportunity/${opp.id}`}
        className={`group min-w-0 outline-none ${viewMode === 'grid' ? 'block' : 'grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4'}`}
      >
        <div className={viewMode === 'grid' ? 'mb-3 flex items-center gap-3' : 'shrink-0'}>
          <ImpactDonut value={opp.impact} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <TypeTag type={opp.type} />
            <StageBadge stage={opp.stage} />
          </div>
          <p className="mt-2 text-[14px] font-semibold leading-[19px] group-hover:underline" style={{ color: INK }}>{opp.title}</p>
          <p className="mt-1 text-[12px] font-normal leading-[17px]" style={{ color: INK_SOFT }}>{opp.description}</p>
          <div className="mt-2.5 rounded-lg border-l-2 py-1.5 pl-2.5" style={{ borderColor: BORDER, backgroundColor: '#faf9f8' }}>
            <p className="text-[12px] font-normal italic leading-[17px]" style={{ color: MUTED }}>"{opp.quote}"</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold" style={{ color: INK }}>{opp.revenue}</span>
              <span className="flex h-[18px] items-center rounded-full px-1.5" style={{ backgroundColor: `${revColor}18` }}>
                <span className="text-[10px] font-semibold" style={{ color: revColor }}>{opp.revenueState === 'at-risk' ? 'At risk' : 'Asking'}</span>
              </span>
            </span>
            <span className="flex items-center gap-0.5" style={{ color: volColor }}>
              {opp.volumeUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              <span className="text-[12px] font-semibold">{opp.volumePct}</span>
            </span>
            <span className="flex items-center gap-1" style={{ color: MUTED }}>
              <Users size={13} />
              <span className="text-[12px] font-normal">{opp.customers} customers</span>
            </span>
            {opp.plans.map((p) => (
              <span key={p} className="flex h-[18px] items-center rounded-md px-1.5" style={{ backgroundColor: '#f2f1ef' }}>
                <span className="text-[11px] font-normal" style={{ color: INK }}>{p}</span>
              </span>
            ))}
            <span className="text-[11px] font-normal" style={{ color: MUTED }}>{opp.firstSeenLabel}</span>
          </div>
        </div>
      </Link>
      {/* Decision actions remain outside the detail link. */}
      <div
        role="group"
        aria-label={`Actions for ${opp.title}`}
        className={viewMode === 'grid'
          ? 'mt-3 flex items-center gap-2'
          : 'flex min-w-[190px] shrink-0 flex-col items-stretch justify-end gap-2 border-l border-surface-border pl-4'}
      >
        {issueLink && linkedToolLabel ? (
          <button
            onClick={() => setDialogMode('issue')}
            className="flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-solid bg-white px-3.5 outline-none"
            style={{ borderColor: BORDER }}
          >
            <ExternalLink size={13} color={INK} />
            <span className="text-[12px] font-semibold" style={{ color: INK }}>
              View {issueLink.key} in {linkedToolLabel}
            </span>
          </button>
        ) : integration.connected && toolLabel ? (
          <button
            onClick={() => onCreate(opp.id)}
            className="flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 outline-none"
            style={{ backgroundColor: INK }}
          >
            <Plug size={13} color="#fff" />
            <span className="text-[12px] font-semibold text-white">Create in {toolLabel}</span>
          </button>
        ) : null}
        <button onClick={() => setDialogMode('brief')} className="flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-solid bg-white px-3.5 outline-none" style={{ borderColor: BORDER }}>
          <Sparkles size={13} color={PURPLE} />
          <span className="text-[12px] font-semibold" style={{ color: INK }}>Draft product brief</span>
        </button>
      </div>
      {dialogMode && (
        <PmActionDialog
          mode={dialogMode}
          opportunity={opp}
          issueLink={dialogMode === 'issue' ? issueLink : undefined}
          onClose={() => setDialogMode(null)}
        />
      )}
    </article>
  )
}

// --- Feed -------------------------------------------------------------------
const DATE_PRESETS = [
  { days: 30, label: 'Last 30 days' },
  { days: 60, label: 'Last 60 days' },
  { days: 90, label: 'Last 90 days' },
]

function PmFeed() {
  const [search, setSearch] = useState('')
  const [datePreset, setDatePreset] = useState(30)
  const [dateOpen, setDateOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [typeFilters, setTypeFilters] = useState<Set<OppType>>(new Set())
  const [stageFilters, setStageFilters] = useState<Set<LifecycleStageKey>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [integration, setIntegration] = useState<PmIntegration>(() => loadPmIntegration())
  const [pickerOpen, setPickerOpen] = useState(false)
  const toolTriggerRef = useRef<HTMLButtonElement>(null)
  const firstToolRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (pickerOpen) firstToolRef.current?.focus()
  }, [pickerOpen])

  const closePicker = (restoreFocus = false) => {
    setPickerOpen(false)
    if (restoreFocus) toolTriggerRef.current?.focus()
  }

  const connect = (tool: PmTool) => {
    setIntegration((current) => {
      const next: PmIntegration = { ...current, connected: true, tool }
      persistPmIntegration(next)
      return next
    })
    closePicker(true)
  }

  const createIssue = (id: string) => setIntegration((current) => {
    const next = createPmIssueLink(current, id)
    persistPmIntegration(next)
    return next
  })

  const toggleType = (t: OppType) => setTypeFilters((prev) => {
    const next = new Set(prev)
    if (next.has(t)) next.delete(t)
    else next.add(t)
    return next
  })
  const toggleStage = (s: LifecycleStageKey) => setStageFilters((prev) => {
    const next = new Set(prev)
    if (next.has(s)) next.delete(s)
    else next.add(s)
    return next
  })

  const q = search.trim().toLowerCase()
  const cutoff = PM_NOW - datePreset * DAY
  const opps = PM_DATA.opportunities.filter((o) => {
    if (q && !(`${o.title} ${o.description}`.toLowerCase().includes(q))) return false
    if (o.firstSeen < cutoff) return false
    if (typeFilters.size > 0 && !typeFilters.has(o.type)) return false
    if (stageFilters.size > 0 && !stageFilters.has(o.stage)) return false
    return true
  })

  const presetLabel = DATE_PRESETS.find((p) => p.days === datePreset)?.label ?? 'Last 30 days'

  return (
    <PmCard data-testid="pm-feed">
      <SectionLabel
        title="Opportunity feed"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              {integration.connected && integration.tool ? (
                <button
                  ref={toolTriggerRef}
                  onClick={() => setPickerOpen((o) => !o)}
                  aria-label={`${PM_TOOL_LABEL[integration.tool]} connected, change PM tool`}
                  aria-haspopup="menu"
                  aria-expanded={pickerOpen}
                  aria-controls="pm-tool-menu"
                  className="flex h-8 items-center gap-1.5 rounded-full px-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flora-blue"
                  style={{ backgroundColor: `${GREEN}14` }}
                >
                  <Check size={13} color={GREEN} />
                  <span className="text-[12px] font-semibold" style={{ color: GREEN }}>{PM_TOOL_LABEL[integration.tool]} connected</span>
                  <ChevronDown size={12} color={GREEN} />
                </button>
              ) : (
                <button
                  ref={toolTriggerRef}
                  onClick={() => setPickerOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={pickerOpen}
                  aria-controls="pm-tool-menu"
                  className="flex h-8 items-center gap-1.5 rounded-full px-3.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flora-blue"
                  style={{ backgroundColor: INK }}
                >
                  <Plug size={13} color="#fff" />
                  <span className="text-[12px] font-semibold text-white">Connect PM tool</span>
                </button>
              )}
              {pickerOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => closePicker(true)} />
                  <FloraCard
                    id="pm-tool-menu"
                    role="menu"
                    flat
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        closePicker(true)
                      }
                    }}
                    className="absolute right-0 top-[38px] z-[61] w-52 rounded-xl py-1.5 shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)]"
                    style={{ borderColor: BORDER }}
                  >
                    <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.4px]" style={{ color: MUTED }}>
                      {integration.connected ? 'Change PM tool' : 'Connect PM tool'}
                    </p>
                    {PM_TOOLS.map((t, index) => (
                      <button
                        key={t.key}
                        ref={index === 0 ? firstToolRef : undefined}
                        role="menuitem"
                        onClick={() => connect(t.key)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left outline-none hover:bg-[#f5f5f4] focus-visible:bg-grey-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-flora-blue"
                      >
                        <span className="flex items-center gap-2">
                          <Plug size={14} color={MUTED} />
                          <span className="text-[13px] font-normal" style={{ color: INK }}>{t.label}</span>
                        </span>
                        {integration.tool === t.key && <Check size={13} color={GREEN} />}
                      </button>
                    ))}
                  </FloraCard>
                </>
              )}
            </div>
            <div className="flex items-center gap-0.5 rounded-full border border-solid p-0.5" style={{ borderColor: BORDER }}>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className="flex size-6 items-center justify-center rounded-full"
                style={{ backgroundColor: viewMode === 'list' ? INK : 'transparent' }}
              >
                <List size={13} color={viewMode === 'list' ? '#fff' : MUTED} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className="flex size-6 items-center justify-center rounded-full"
                style={{ backgroundColor: viewMode === 'grid' ? INK : 'transparent' }}
              >
                <LayoutGrid size={13} color={viewMode === 'grid' ? '#fff' : MUTED} />
              </button>
            </div>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-solid px-3" style={{ borderColor: BORDER, backgroundColor: '#faf9f8' }}>
          <Search size={14} color={MUTED} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities"
            className="w-full bg-transparent text-[13px] font-normal outline-none"
            style={{ color: INK }}
          />
        </div>

        {/* Date preset dropdown */}
        <div className="relative">
          <button
            onClick={() => setDateOpen((o) => !o)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-solid bg-white px-3.5 outline-none"
            style={{ borderColor: BORDER }}
          >
            <span className="text-[13px] font-semibold" style={{ color: INK }}>{presetLabel}</span>
            <ChevronDown size={13} color={MUTED} />
          </button>
          {dateOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setDateOpen(false)} />
              <FloraCard flat className="absolute right-0 top-[42px] z-[61] w-44 rounded-xl py-1.5 shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)]" style={{ borderColor: BORDER }}>
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.days}
                    onClick={() => { setDatePreset(p.days); setDateOpen(false) }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left outline-none hover:bg-[#f5f5f4]"
                  >
                    <span className="text-[13px] font-normal" style={{ color: INK }}>{p.label}</span>
                    {p.days === datePreset && <Check size={13} color={BLUE} />}
                  </button>
                ))}
              </FloraCard>
            </>
          )}
        </div>

        {/* All filters popover */}
        <div className="relative">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-solid bg-white px-3.5 outline-none"
            style={{ borderColor: BORDER }}
          >
            <span className="text-[13px] font-semibold" style={{ color: INK }}>All filters</span>
            {(typeFilters.size + stageFilters.size) > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1" style={{ backgroundColor: `${BLUE}18` }}>
                <span className="text-[10px] font-semibold" style={{ color: BLUE }}>{typeFilters.size + stageFilters.size}</span>
              </span>
            )}
            <ChevronDown size={13} color={MUTED} />
          </button>
          {filtersOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setFiltersOpen(false)} />
              <FloraCard flat className="absolute right-0 top-[42px] z-[61] w-56 rounded-xl p-3 shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)]" style={{ borderColor: BORDER }}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4px]" style={{ color: MUTED }}>Type</p>
                <div className="flex flex-col gap-1.5">
                  {(['request', 'bug'] as OppType[]).map((t) => (
                    <label key={t} className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={typeFilters.has(t)} onChange={() => toggleType(t)} />
                      <span className="text-[13px] font-normal capitalize" style={{ color: INK }}>{t}</span>
                    </label>
                  ))}
                </div>
                <p className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-[0.4px]" style={{ color: MUTED }}>Stage</p>
                <div className="flex flex-col gap-1.5">
                  {(Object.keys(LIFECYCLE_LABEL) as LifecycleStageKey[]).map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={stageFilters.has(s)} onChange={() => toggleStage(s)} />
                      <span className="text-[13px] font-normal" style={{ color: INK }}>{LIFECYCLE_LABEL[s]}</span>
                    </label>
                  ))}
                </div>
              </FloraCard>
            </>
          )}
        </div>
      </div>

      {/* Opportunity cards */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
        {opps.map((o) => (
          <OpportunityCard
            key={o.id}
            opp={o}
            integration={integration}
            onCreate={createIssue}
            viewMode={viewMode}
          />
        ))}
        {opps.length === 0 && (
          <p className="py-8 text-center text-[13px] font-normal" style={{ color: MUTED }}>No opportunities match your filters.</p>
        )}
      </div>
    </PmCard>
  )
}

// --- Widget registry --------------------------------------------------------
const PM_WIDGETS: Record<PmWidgetId, { title: string; span: 'full' | 'half'; render: () => ReactNode }> = {
  'pm-kpis': { title: 'Product signals', span: 'full', render: () => <PmKpis /> },
  'pm-spotlight': { title: 'Spotlight', span: 'half', render: () => <PmSpotlight /> },
  'pm-lifecycle': { title: 'Lifecycle', span: 'half', render: () => <PmLifecycle /> },
  'pm-feed': { title: 'Opportunity feed', span: 'full', render: () => <PmFeed /> },
}

// --- Drag & drop wrapper (flat ordered list) --------------------------------
const PM_DND_TYPE = 'pm-widget'
type PmDragItem = { id: PmWidgetId; index: number }

function PmDraggableWidget({
  id, index, editing, onMove, onRemove, children,
}: {
  id: PmWidgetId; index: number; editing: boolean
  onMove: (fromIndex: number, toIndex: number) => void
  onRemove: (id: PmWidgetId) => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag, preview] = useDrag({
    type: PM_DND_TYPE,
    canDrag: editing,
    item: (): PmDragItem => ({ id, index }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  })
  const [{ isOver }, drop] = useDrop<PmDragItem, void, { isOver: boolean }>({
    accept: PM_DND_TYPE,
    collect: (m) => ({ isOver: m.isOver({ shallow: true }) }),
    hover: (item, monitor) => {
      if (!ref.current) return
      if (item.index === index) return
      const rect = ref.current.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const pointer = monitor.getClientOffset()
      if (!pointer) return
      let toIndex = pointer.y < midY ? index : index + 1
      if (item.index < toIndex) toIndex -= 1
      if (toIndex === item.index) return
      onMove(item.index, toIndex)
      item.index = toIndex
    },
  })
  // Connect via a callback ref rather than `drop(preview(ref))` during render:
  // the connectors need the node, and `ref` stays for `hover`'s geometry read,
  // which runs from a drag event rather than a render. Memoized because
  // react-dnd's connectors are referentially stable — a fresh identity each
  // render would make React detach and reattach them mid-drag.
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node
      drop(preview(node))
    },
    [drop, preview],
  )

  return (
    <div ref={attach} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative">
      {editing && (
        <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl border-2 border-dashed transition-colors" style={{ borderColor: isOver ? BLUE : 'transparent' }} />
      )}
      {editing && (
        <div className="absolute -top-2.5 left-3 right-3 z-30 flex items-center justify-between">
          <div ref={(node) => { drag(node) }} className="flex h-6 cursor-grab items-center gap-1 rounded-full border border-solid bg-white px-2 shadow-sm active:cursor-grabbing" style={{ borderColor: BORDER }}>
            <GripVertical size={13} color={MUTED} />
            <span className="text-[11px] font-semibold" style={{ color: MUTED }}>Drag</span>
          </div>
          <button
            onClick={() => onRemove(id)}
            aria-label="Remove widget"
            title="Remove widget"
            className="flex size-6 items-center justify-center rounded-full border border-solid bg-white shadow-sm outline-none"
            style={{ borderColor: BORDER }}
          >
            <X size={13} color={RED} />
          </button>
        </div>
      )}
      <div className={editing ? 'pointer-events-none select-none' : ''}>{children}</div>
    </div>
  )
}

// --- Root -------------------------------------------------------------------
export function PmDashboard(props: {
  pmLayout: PmWidgetId[]
  editing: boolean
  onMove: (fromIndex: number, toIndex: number) => void
  onRemove: (id: PmWidgetId) => void
}) {
  const { pmLayout, editing, onMove, onRemove } = props
  const items = useMemo(() => pmLayout.filter((id) => PM_WIDGET_ID_LIST.includes(id)), [pmLayout])

  return (
    <div data-testid="screen-pm" className="grid grid-cols-2 gap-4">
      {items.map((id, index) => {
        const widget = PM_WIDGETS[id]
        return (
          <div key={id} className={widget.span === 'full' ? 'col-span-2' : 'col-span-1'}>
            <PmDraggableWidget id={id} index={index} editing={editing} onMove={onMove} onRemove={onRemove}>
              {widget.render()}
            </PmDraggableWidget>
          </div>
        )
      })}
    </div>
  )
}
