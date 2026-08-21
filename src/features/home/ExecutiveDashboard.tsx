import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  GripVertical,
  Lightbulb,
  Settings2,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { useDrag, useDrop } from 'react-dnd'
import { Link } from 'react-router'
import { Card } from '@/components/flora/Card'
import { Field } from '@/components/flora/Field'
import { StatusTag } from '@/components/flora/StatusTag'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { SankeyFlow } from '@/components/sankey/SankeyFlow'
import {
  AGENT_COSTS,
  BUSINESS_VALUE_KPIS,
  COST_MODEL,
  CUSTOM_INSIGHTS,
  EXECUTIVE_KPIS,
  EXECUTIVE_SECTION_ID_LIST,
  EXECUTIVE_SECTION_TITLE,
  OUTCOME_CHANNELS,
  OUTCOME_SANKEY,
  OUTCOME_SANKEY_TITLES,
  RISKS_AND_OPPORTUNITIES,
  TOP_TOPIC_VIEWS,
  type ExecutiveKpi,
  type ExecutiveSectionId,
} from './executive-data'

const MUTED = '#6f7471'
const TEAL = '#188977'
const BLUE = '#245d78'
const AMBER = '#9a6a16'
const CORAL = '#c9684b'
const PINK = '#c77a96'
const EXECUTIVE_DND = 'executive-dashboard-section'

function StatusPill({ status }: { status: 'on-track' | 'under' | 'over' }) {
  return (
    <StatusTag state={status === 'on-track' ? 'good' : 'incomplete'}>
      {status === 'on-track' ? 'On track' : status === 'under' ? 'Under' : 'Over'}
    </StatusTag>
  )
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-5">
      <div>
        <h2 className="text-[20px] font-medium leading-7 text-ink">{title}</h2>
        <p className="mt-1 text-[14px] leading-5 text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}

function ExecutiveToolbar({ onConfigure }: { onConfigure: () => void }) {
  return (
    <div
      role="toolbar"
      aria-label="Executive dashboard controls"
      className="flex min-h-10 flex-wrap items-center justify-between gap-3"
    >
      <div className="flex min-w-0 items-baseline gap-3">
        <h2 className="shrink-0 text-[20px] font-medium leading-7 text-ink">
          Executive outcome summary
        </h2>
        <span className="truncate text-[14px] leading-5 text-ink-muted">
          May 2, 2026 - Jun 01, 2026
        </span>
      </div>
      {/* 34px / 13px is the platform's filter-pill size (Insights' `FilterPill`,
          Agent Builder's date pill). Every control repeats `text-[13px]`: the base
          layer in theme.css sizes bare `button`/`label` at 16px, and a rule on the
          element beats a size inherited from this wrapper — without the repeat these
          three render half again as large as their equivalents elsewhere. */}
      <div className="flex shrink-0 items-center gap-2 text-[13px] font-medium leading-5 text-ink">
        <label className="relative flex h-[34px] items-center rounded-full border border-border-default bg-white pl-3 pr-8 text-[13px] hover:bg-control-hover">
          <span className="sr-only">Channel filter</span>
          <select
            aria-label="Channel filter"
            defaultValue="all"
            className="appearance-none bg-transparent pr-1 text-[13px] outline-none"
          >
            <option value="all">All channels</option>
            <option value="ai-resolved">AI resolved</option>
            <option value="ai-to-human">AI to human</option>
            <option value="human-only">Human only</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5" size={14} />
        </label>
        <button
          type="button"
          aria-label="Reporting period"
          className="flex h-[34px] items-center gap-2 rounded-full border border-border-default bg-white px-3 text-[13px] hover:bg-control-hover"
        >
          <CalendarDays size={14} />
          July 7, 2026 - Aug 6, 2026
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={onConfigure}
          className="flex h-[34px] items-center gap-2 rounded-full border border-border-default bg-white px-3 text-[13px] hover:bg-control-hover"
        >
          <Settings2 size={14} />
          Configuration
        </button>
        <button
          type="button"
          aria-label="Download executive dashboard"
          className="flex size-[34px] items-center justify-center rounded-full border border-border-default bg-white hover:bg-control-hover"
        >
          <Download size={15} />
        </button>
      </div>
    </div>
  )
}

function ExecutiveInsightBanner() {
  return (
    <Card className="mt-5 flex items-start gap-3 px-5 py-4">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center text-accent-blue">
        <Sparkles size={23} strokeWidth={1.7} />
      </div>
      <div className="text-[14px] leading-5 text-ink">
        <p className="font-semibold">
          Customer outcomes are improving while support scales at lower cost.
        </p>
        <p>
          Resolution is <strong>93.8%</strong>, value created is <strong>$23.47M</strong> at{' '}
          <strong>78% confidence</strong>, and billing escalations are the next leadership priority.
        </p>
      </div>
    </Card>
  )
}

function ConfigField({
  label,
  value,
  select = false,
  disabled = false,
}: {
  label: string
  value: string
  select?: boolean
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium leading-4 text-ink">{label}</span>
      <span className="relative block">
        {select ? (
          <select
            defaultValue={value}
            disabled={disabled}
            className="h-10 w-full appearance-none rounded-field border border-field-border bg-white px-3 pr-8 text-[14px] leading-5 text-ink shadow-field outline-none transition-colors duration-instant focus:border-flora-blue disabled:bg-grey-100 disabled:text-ink-muted"
          >
            <option value={value}>{value}</option>
          </select>
        ) : (
          <Field
            defaultValue={value}
            disabled={disabled}
            className="h-10 px-3 py-2 disabled:bg-grey-100 disabled:text-ink-muted"
          />
        )}
        {select && <ChevronDown className="pointer-events-none absolute right-3 top-3" size={14} />}
      </span>
    </label>
  )
}

function ConfigurationDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end p-[10px]" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Executive dashboard configuration"
        className="relative flex h-full w-[628px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.20)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-10 pt-6">
          <h3 className="text-[22px] text-black">Configuration</h3>
          <button
            type="button"
            aria-label="Close configuration"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-md"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-10 py-6">
          <p className="text-[12px] leading-4 text-ink-muted">
            Configure metrics, costs, goals, and value assumptions for accurate outcome estimates.
          </p>

          <div className="mt-5">
            <p className="text-[14px] font-medium leading-5 text-ink">Sources (2)</p>
            <div className="mt-3 space-y-2 text-[12px] leading-4 text-ink">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#d6a32f]" /> Shopify
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#48a9d4]" /> Salesforce
              </div>
            </div>
            <Link
              to="/settings/integrations?tab=collections"
              className="mt-3 flex h-9 w-full items-center justify-center rounded-full border border-border-default text-[12px] font-semibold text-ink hover:bg-control-hover"
            >
              Manage integrations
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[14px] font-medium leading-5 text-ink">Success metrics</p>
            <ConfigField label="Primary success metric" value="Resolutions" select />
            <ConfigField label="Comparison period" value="Previous month" select />
            <ConfigField label="Eligible conversations" value="All eligible conversations" select />
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[14px] font-medium leading-5 text-ink">
              Executive goals and thresholds
            </p>
            <ConfigField label="Value created goal" value="$25M" />
            <ConfigField label="Success metric target" value="92%" />
            <ConfigField label="CSAT target" value="4.6" />
            <ConfigField label="AI contribution goal" value="65%" />
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[14px] font-medium leading-5 text-ink">Support costs</p>
            <ConfigField label="Human cost per resolution" value="$4.20" />
            {/* Metered, not an assumption: `AGENT_COSTS` lists the AI agent's
                $0.08 as "Calculated" where the human rate is "Manual". Read-only
                for the same reason as average handle time below. */}
            <ConfigField label="AI cost per resolution" value="$0.08" disabled />
            <ConfigField label="Agent hourly cost" value="$42.00" />
            <ConfigField label="Average handle time" value="12 minutes" disabled />
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[14px] font-medium leading-5 text-ink">Customer value</p>
            <ConfigField label="Average order value" value="Shopify · $44.20" select />
            <ConfigField
              label="Average annual contract value"
              value="Salesforce · $1,200.00"
              select
            />
            <ConfigField label="Customer lifetime value" value="$2,400.00" />
            <ConfigField label="Average refund amount" value="Shopify · $45.00" select />
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[14px] font-medium leading-5 text-ink">Custom insights</p>
            <ConfigField label="Visibility" value="Published insights" select />
            <ConfigField label="Timeframe" value="24 hours" select />
          </div>
        </div>
        <div className="border-t border-grey-200 px-10 py-8">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-full items-center justify-center rounded-[20px] bg-black text-[14px] font-semibold text-white"
          >
            Save configuration
          </button>
        </div>
      </aside>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const targetColor = kpi.status === 'on-track' ? '#188977' : '#b44b37'
  return (
    <Card className="flex min-h-[152px] flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-medium leading-5 text-ink">{kpi.label}</p>
        {kpi.status && <StatusPill status={kpi.status} />}
      </div>
      <p className="mt-4 text-[26px] font-medium leading-8 tracking-[-0.45px] text-ink">
        {kpi.value}
      </p>
      <div className="mt-auto space-y-1 pt-4 text-[12px] leading-4 text-ink-muted">
        {kpi.target && (
          <p>
            <span className="font-semibold" style={{ color: targetColor }}>
              Target: {kpi.target}
            </span>
          </p>
        )}
        <p>Forecast: {kpi.forecast}</p>
      </div>
    </Card>
  )
}

function TrendChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
  const resolution = [91, 91.6, 92.4, 92.3, 93.3]
  const resolutionForecast = [91, 91.6, 92.4, 93.1, 94.5]
  const cost = [6.75, 6.5, 6.35, 5.9, 5.65]
  const costForecast = [6.75, 6.5, 6.35, 6.2, 6.5]
  const x = (i: number) => 92 + i * 204
  const resY = (v: number) => 224 - ((v - 90) / 5) * 150
  const costY = (v: number) => 224 - ((v - 4) / 3.5) * 150
  const line = (values: number[], y: (v: number) => number) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')

  return (
    <Card flat className="px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold leading-5 text-ink">Resolution and cost trend</p>
          <p className="mt-1 text-[12px] leading-4 text-ink-muted">Blended human + AI support</p>
        </div>
        <div className="flex max-w-[660px] flex-wrap items-center gap-x-4 gap-y-2 text-[12px] leading-4 text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm" style={{ backgroundColor: TEAL }} />
            Resolution rate
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-[#b9dfe1]" />
            Target resolution rate
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-[#dba6b3]" />
            Forecast resolution rate
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm" style={{ backgroundColor: CORAL }} />
            Cost per resolution
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm" style={{ backgroundColor: '#d69a28' }} />
            Target cost per resolution
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm" style={{ backgroundColor: PINK }} />
            Forecast cost per resolution
          </span>
        </div>
      </div>
      <svg
        className="mt-4 block h-auto w-full"
        viewBox="0 0 1040 290"
        role="img"
        aria-label="Resolution rate increased while cost per resolution decreased from January to May"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1="78"
            x2="920"
            y1={74 + i * 30}
            y2={74 + i * 30}
            stroke="#eceae7"
            strokeWidth="1"
          />
        ))}
        <line
          x1="78"
          x2="920"
          y1={resY(92)}
          y2={resY(92)}
          stroke="#87bdc2"
          strokeDasharray="4 4"
          opacity=".9"
        />
        <line
          x1="78"
          x2="920"
          y1={costY(6)}
          y2={costY(6)}
          stroke={AMBER}
          strokeDasharray="4 4"
          opacity=".85"
        />
        <path
          d={line(resolutionForecast, resY)}
          fill="none"
          stroke="#dba6b3"
          strokeDasharray="5 5"
          strokeWidth="1.5"
          opacity=".8"
        />
        <path
          d={line(costForecast, costY)}
          fill="none"
          stroke={PINK}
          strokeDasharray="5 5"
          strokeWidth="1.5"
          opacity=".8"
        />
        <path d={line(resolution, resY)} fill="none" stroke={TEAL} strokeWidth="2.5" />
        <path d={line(cost, costY)} fill="none" stroke={CORAL} strokeWidth="2.5" />
        {resolution.map((v, i) => (
          <circle key={`r-${i}`} cx={x(i)} cy={resY(v)} r="4" fill={TEAL} />
        ))}
        {cost.map((v, i) => (
          <circle key={`c-${i}`} cx={x(i)} cy={costY(v)} r="4" fill={CORAL} />
        ))}
        {months.map((m, i) => (
          <text key={m} x={x(i)} y="262" textAnchor="middle" fill={MUTED} fontSize="12">
            {m}
          </text>
        ))}
        {[95, 94, 93, 92, 91, 90].map((tick, index) => (
          <text key={tick} x="48" y={78 + index * 30} fill={MUTED} fontSize="11">
            {tick}%
          </text>
        ))}
        {['$7.50', '$7.00', '$6.50', '$6.00', '$4.50', '$4.00'].map((tick, index) => (
          <text key={tick} x="946" y={78 + index * 30} fill={MUTED} fontSize="11">
            {tick}
          </text>
        ))}
        <text
          x="18"
          y="155"
          fill={MUTED}
          fontSize="12"
          textAnchor="middle"
          transform="rotate(-90 18 155)"
        >
          Resolution rate
        </text>
        <text
          x="1012"
          y="155"
          fill={MUTED}
          fontSize="12"
          textAnchor="middle"
          transform="rotate(90 1012 155)"
        >
          Cost per resolution
        </text>
      </svg>
      <div className="mt-1 flex items-start justify-between border-t border-surface-border pt-4 text-[12px] leading-4 text-ink-muted">
        <div>
          <p>
            Avg. resolution rate: <span className="font-semibold text-ink">93.8%</span>
          </p>
          <p>
            Target: <span className="font-semibold text-[#13745f]">92% (+5%)</span>
          </p>
          <p>
            Forecast: <span className="font-semibold text-ink">84%</span>
          </p>
        </div>
        <div className="text-right">
          <p>
            Overall cost / resolution: <span className="font-semibold text-ink">$6.74</span>
          </p>
          <p>
            Target: <span className="font-semibold text-[#b44b37]">$6.00 (+5%)</span>
          </p>
          <p>
            Forecast: <span className="font-semibold text-ink">$6.50</span>
          </p>
        </div>
      </div>
    </Card>
  )
}

function MiniProgress({
  label,
  value,
  width,
  bad = false,
}: {
  label: string
  value: string
  width: number
  bad?: boolean
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px] leading-4">
        <span className="text-ink-muted">{label}</span>
        <span className="font-medium text-ink">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-grey-200">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: bad ? '#c9684b' : BLUE }}
        />
      </div>
    </div>
  )
}

function OutcomeSummaryCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="flex min-h-[350px] flex-col p-5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold leading-5 text-ink">Customer outcomes</p>
          <StatusPill status="on-track" />
        </div>
        <p className="mt-1 text-[12px] leading-4 text-ink-muted">Resolutions · Target</p>
        <p className="mt-3 text-[26px] font-medium leading-8 text-ink">
          93.8% <span className="text-[18px] leading-6 text-ink-muted">· 92%</span>
        </p>
        <p className="mt-4 text-[14px] leading-5 text-ink-muted">
          CSAT is 4.7/5 and FCR is 82%. Billing and email are the exceptions to watch.
        </p>
        <div className="mt-5 space-y-4">
          <MiniProgress label="CSAT" value="4.3/5" width={78} />
          <MiniProgress label="First-contact resolution" value="82%" width={82} />
          <MiniProgress label="Repeat contact" value="7%" width={7} />
        </div>
        <button className="mt-auto flex items-center gap-1 pt-5 text-[12px] font-semibold leading-4 text-accent-blue">
          View customer outcomes <ArrowRight size={12} />
        </button>
      </Card>
      <Card className="flex min-h-[350px] flex-col p-5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold leading-5 text-ink">Business value</p>
          <StatusPill status="under" />
        </div>
        <p className="mt-1 text-[12px] leading-4 text-ink-muted">Business value created · Target</p>
        <p className="mt-3 text-[26px] font-medium leading-8 text-ink">
          $23.47M <span className="text-[18px] leading-6 text-ink-muted">· 25M</span>
        </p>
        <p className="mt-4 text-[14px] leading-5 text-ink-muted">
          Value includes protected revenue, AI savings, and prevented refunds.
        </p>
        <div className="mt-5 text-[12px] leading-4">
          <div className="flex justify-between border-b border-surface-border py-3">
            <span>Revenue protected</span>
            <b>18.2M</b>
          </div>
          <div className="flex justify-between border-b border-surface-border py-3">
            <span>AI cost savings</span>
            <b>$2.47M</b>
          </div>
          <div className="flex justify-between py-3">
            <span>Refunds prevented</span>
            <b>$2.8M</b>
          </div>
        </div>
        <button className="mt-auto flex items-center gap-1 pt-5 text-[12px] font-semibold leading-4 text-accent-blue">
          View business value <ArrowRight size={12} />
        </button>
      </Card>
      <Card className="flex min-h-[350px] flex-col p-5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold leading-5 text-ink">Leadership action</p>
          <StatusTag state="attention">Needs attention</StatusTag>
        </div>
        <p className="mt-1 text-[12px] leading-4 text-ink-muted">Top improvement opportunity</p>
        <p className="mt-3 text-[22px] font-medium leading-7 text-ink">Billing escalations</p>
        <p className="mt-4 text-[14px] leading-5 text-ink-muted">
          Prioritize billing escalations and email CSAT improvements in the next cycle.
        </p>
        <div className="mt-5 space-y-4">
          <MiniProgress label="Billing escalations" value="24% ↑ 18%" width={24} bad />
          <MiniProgress label="Email CSAT" value="3.2/5 ↓ 5%" width={64} bad />
          <MiniProgress label="AI fallback rate" value="7% ↑ 12%" width={7} bad />
        </div>
        <button className="mt-auto flex items-center gap-1 pt-5 text-[12px] font-semibold leading-4 text-accent-blue">
          View business value <ArrowRight size={12} />
        </button>
      </Card>
    </div>
  )
}

function OutcomesSection() {
  const [configurationOpen, setConfigurationOpen] = useState(false)
  return (
    <section>
      <ExecutiveToolbar onConfigure={() => setConfigurationOpen(true)} />
      <ExecutiveInsightBanner />
      <div className="mt-4 grid grid-cols-4 gap-4">
        {EXECUTIVE_KPIS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <div className="mt-5">
        <TrendChart />
      </div>
      <div className="mt-5">
        <OutcomeSummaryCards />
      </div>
      {configurationOpen && <ConfigurationDrawer onClose={() => setConfigurationOpen(false)} />}
    </section>
  )
}

function OutcomeFlow() {
  return (
    // `flat`: a chart carries its own color, so the glass sheen stays off — the
    // same call the Insights section makes for its flow.
    <Card flat className="overflow-hidden p-6">
      <SankeyFlow
        flow={OUTCOME_SANKEY}
        titles={OUTCOME_SANKEY_TITLES}
        ariaLabel="2.4 million conversations flow to AI resolved, AI to human, human only, and not resolved outcomes"
        height={300}
        // Four outcomes span 61% down to 3%; the default 20px floor would draw
        // the 12% and the 3% bands at the same thickness.
        minThickness={12}
      />
    </Card>
  )
}

function OutcomeChannelCard({ channel }: { channel: (typeof OUTCOME_CHANNELS)[number] }) {
  const Icon =
    channel.id === 'ai-resolved' ? Bot : channel.id === 'ai-human' ? ArrowRight : UserRound
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 px-1" style={{ color: channel.color }}>
        <Icon size={16} />
        <p className="text-[14px] font-medium leading-5">
          {channel.label} · {channel.share}
        </p>
      </div>
      <Table aria-label={`${channel.label} metrics`} className="min-w-0 table-fixed">
        <Thead>
          <tr>
            <Th className="px-3 first:pl-4">Metric</Th>
            <Th className="px-3 text-right">Last 30 days</Th>
            <Th className="px-3 text-right">Target</Th>
          </tr>
        </Thead>
        <Tbody>
          {channel.metrics.map((metric) => (
            <tr key={metric.label}>
              <Td className="px-3 first:pl-4 text-ink-muted">{metric.label}</Td>
              <Td className="px-3 text-right font-medium text-ink">{metric.current}</Td>
              <Td className="px-3 text-right font-medium text-ink">{metric.target}</Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}

function CustomerOutcomesSection() {
  return (
    <section className="border-t border-surface-border pt-8">
      <SectionHeading
        title="Customer outcomes"
        description="How conversations move through AI and human support into a measurable outcome."
      />
      <OutcomeFlow />
      <div className="mt-5 grid grid-cols-3 gap-4">
        {OUTCOME_CHANNELS.map((channel) => (
          <OutcomeChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
      <div className="mt-6 border-t border-surface-border pt-6">
        <p className="text-[14px] font-semibold leading-5 text-ink">Custom insights</p>
        <p className="mt-1 text-[14px] leading-5 text-ink-muted">
          Admin-defined metrics approved for executive visibility.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {CUSTOM_INSIGHTS.map((insight) => (
            <Card key={insight.label} className="p-5">
              <p className="text-[14px] font-semibold leading-5 text-ink">{insight.label}</p>
              <p className="mt-4 text-[26px] font-medium leading-8 text-ink">{insight.value}</p>
              <p className="mt-1 text-[12px] font-semibold leading-4 text-accent-blue">
                {insight.detail}
              </p>
              <div className="mt-4 rounded-lg bg-grey-100 p-3">
                <p className="text-[12px] font-semibold leading-4 text-ink-muted">Formula</p>
                <p className="mt-1 text-[12px] leading-4 text-ink-muted">{insight.formula}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CompactTable({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div>
      <p className="mb-3 text-[14px] font-semibold leading-5 text-ink">{title}</p>
      <Table aria-label={title} className="min-w-0 table-fixed">
        <Thead>
          <tr>
            {headers.map((header, index) => (
              <Th key={header} className={index === headers.length - 1 ? 'text-right' : undefined}>
                {header}
              </Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Td
                  key={cellIndex}
                  className={
                    cellIndex === row.length - 1 ? 'text-right font-semibold text-ink' : 'text-ink'
                  }
                >
                  {cell}
                </Td>
              ))}
            </tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}

function MethodPill({ method }: { method: string }) {
  const tone =
    method === 'Calculated'
      ? { bg: '#eee1ef', fg: '#7d3f7d' }
      : method === 'Salesforce'
        ? { bg: '#e2effa', fg: '#315f78' }
        : method === 'Manual'
          ? { bg: '#e9eaf0', fg: '#3c4355' }
          : { bg: '#fff6df', fg: '#84621c' }
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold leading-4"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {method}
    </span>
  )
}

function BusinessValueSection() {
  return (
    <section className="border-t border-surface-border pt-8">
      <SectionHeading
        title="Business value"
        description="Value created by resolving conversations."
      />
      <div className="grid grid-cols-4 gap-4">
        {BUSINESS_VALUE_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={{ id: kpi.label, ...kpi }} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <CompactTable
          title="Cost model"
          headers={['Item', 'Method', 'Amount']}
          rows={COST_MODEL.map((r) => [r.item, <MethodPill method={r.method} />, r.amount])}
        />
        <CompactTable
          title="How human and AI costs compare"
          headers={['Agent', 'Method', 'Cost per resolution', 'Total cost']}
          rows={AGENT_COSTS.map((r) => [
            r.agent,
            <MethodPill method={r.method} />,
            r.unit,
            r.total,
          ])}
        />
      </div>
    </section>
  )
}

function TopTopicsCard() {
  const [viewIndex, setViewIndex] = useState(0)
  const view = TOP_TOPIC_VIEWS[viewIndex]
  const isFirstView = viewIndex === 0
  const isLastView = viewIndex === TOP_TOPIC_VIEWS.length - 1

  return (
    <Card flat className="p-5">
      <p className="text-[14px] font-semibold leading-5 text-ink">Top topics</p>
      <div className="mb-4 mt-3 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-[12px] leading-4 text-ink-muted">
          <Lightbulb className="shrink-0" size={14} color={BLUE} />
          <p className="truncate">{view.insight}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[12px] leading-4 text-ink-muted">
          <button
            type="button"
            aria-label="Previous topics page"
            disabled={isFirstView}
            onClick={() => setViewIndex((current) => Math.max(0, current - 1))}
            className="rounded-full p-1 transition-colors hover:bg-control-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-current"
          >
            <ChevronLeft size={14} />
          </button>
          <span aria-live="polite">
            {viewIndex + 1} of {TOP_TOPIC_VIEWS.length}
          </span>
          <button
            type="button"
            aria-label="Next topics page"
            disabled={isLastView}
            onClick={() =>
              setViewIndex((current) => Math.min(TOP_TOPIC_VIEWS.length - 1, current + 1))
            }
            className="rounded-full p-1 transition-colors hover:bg-control-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-current"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <Table aria-label="Top topics" className="min-w-0 table-fixed">
        <Thead>
          <tr>
            <Th className="px-3 first:pl-4">Topic</Th>
            <Th className="px-3">{view.metricLabel}</Th>
            <Th className="px-3">Previous</Th>
            <Th className="px-3 text-right">Comparison</Th>
          </tr>
        </Thead>
        <Tbody>
          {view.rows.map((topic) => (
            <tr key={topic.topic}>
              <Td className="px-3 first:pl-4 font-medium text-accent-blue">{topic.topic}</Td>
              <Td
                className={`px-3 ${topic.metricTone === 'warning' ? 'text-red-700' : 'text-ink'}`}
              >
                {topic.metric}
              </Td>
              <Td
                className={`px-3 ${topic.metricTone === 'warning' ? 'text-red-700' : 'text-ink-muted'}`}
              >
                {topic.previous}
              </Td>
              <Td
                className={`px-3 text-right font-semibold ${topic.comparisonTone === 'positive' ? 'text-green-700' : 'text-red-700'}`}
              >
                {topic.comparison}
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  )
}

function LeadershipActionSection() {
  return (
    <section>
      <Card className="overflow-hidden p-5">
        <SectionHeading
          title="Leadership action"
          description="Recommendations, risks and opportunities."
        />
        <div className="grid grid-cols-[1fr_1.05fr] gap-4">
          <Card flat className="p-5">
            <p className="mb-4 text-[14px] font-semibold leading-5 text-ink">
              Risks & opportunities
            </p>
            <div className="space-y-3">
              {RISKS_AND_OPPORTUNITIES.map((item) => {
                const risk = item.tone === 'risk'
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-[8px] px-3 py-3"
                    style={{ backgroundColor: risk ? '#fff7e8' : '#eaf7f3' }}
                  >
                    {risk ? (
                      <AlertTriangle size={13} color={AMBER} />
                    ) : (
                      <Lightbulb size={13} color={TEAL} />
                    )}
                    <span className="text-[14px] leading-5 text-ink">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </Card>
          <TopTopicsCard />
        </div>
      </Card>
    </section>
  )
}

const SECTION_RENDERERS: Record<ExecutiveSectionId, () => ReactNode> = {
  outcomes: OutcomesSection,
  'customer-outcomes': CustomerOutcomesSection,
  'business-value': BusinessValueSection,
  'leadership-action': LeadershipActionSection,
}

type DraggedSection = { id: ExecutiveSectionId; index: number }

function DraggableExecutiveSection({
  id,
  index,
  editing,
  onMove,
  onRemove,
}: {
  id: ExecutiveSectionId
  index: number
  editing: boolean
  onMove: (fromIndex: number, toIndex: number) => void
  onRemove: (id: ExecutiveSectionId) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ dragging }, drag] = useDrag(
    () => ({
      type: EXECUTIVE_DND,
      item: { id, index },
      canDrag: editing,
      collect: (monitor) => ({ dragging: monitor.isDragging() }),
    }),
    [id, index, editing],
  )
  const [, drop] = useDrop<DraggedSection>(
    () => ({
      accept: EXECUTIVE_DND,
      hover(item) {
        if (!editing || item.index === index) return
        onMove(item.index, index)
        item.index = index
      },
    }),
    [editing, index, onMove],
  )
  // Connect via a callback ref rather than `drag(drop(ref))` during render: the
  // connectors need the node, and `ref` stays for the hover comparison, which
  // runs from a drag event rather than a render. Memoized because react-dnd's
  // connectors are referentially stable — a fresh identity each render would
  // make React detach and reattach them mid-drag.
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node
      drag(drop(node))
    },
    [drag, drop],
  )
  const Render = SECTION_RENDERERS[id]
  return (
    <div ref={attach} className="relative" style={{ opacity: dragging ? 0.45 : 1 }}>
      {editing && (
        <div className="absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-full border border-surface-border bg-white p-1 shadow-sm">
          <span className="flex size-7 cursor-grab items-center justify-center text-ink-muted">
            <GripVertical size={15} />
          </span>
          <button
            aria-label={`Remove ${EXECUTIVE_SECTION_TITLE[id]} executive section`}
            onClick={() => onRemove(id)}
            className="flex size-7 items-center justify-center rounded-full text-ink-muted hover:bg-control-hover hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <Render />
    </div>
  )
}

export function ExecutiveDashboard({
  layout,
  editing,
  onMove,
  onRemove,
}: {
  layout: ExecutiveSectionId[]
  editing: boolean
  onMove: (fromIndex: number, toIndex: number) => void
  onRemove: (id: ExecutiveSectionId) => void
}) {
  const sections = useMemo(
    () => layout.filter((id) => EXECUTIVE_SECTION_ID_LIST.includes(id)),
    [layout],
  )
  return (
    <div data-testid="screen-executive" className="relative flex flex-col gap-8">
      {sections.map((id, index) => (
        <DraggableExecutiveSection
          key={id}
          id={id}
          index={index}
          editing={editing}
          onMove={onMove}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
