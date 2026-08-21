// Agent Builder ▸ Insights docked panel (Figma 149:179155), shared by every
// channel's editor. Voice's own rail always carries an Insights item; other
// channels only show one for an agent with a self-improving plan
// (self-improving-data.ts) — see EditorRail's `hasInsights`. That same plan is
// this panel's data source when one is passed in; with none, both tabs fall
// back to the panel's original generic mock content (Voice's v1/v2 today).
import { useState } from 'react'
import { Check, ChevronDown, TrendingDown, TrendingUp, X } from 'lucide-react'
import { Card } from '@/components/flora/Card'
import { StatusTag } from '@/components/flora/StatusTag'
import type { HealthStat, ImprovementPlan } from '@/features/ai-studio/self-improving/self-improving-data'
import { EDITOR_PANEL_W } from './editor-data'

type InsightsTab = 'health' | 'self-improving'

const TABS: { key: InsightsTab; label: string }[] = [
  { key: 'health', label: 'Agent Health' },
  { key: 'self-improving', label: 'Self-improving' },
]

// The good/bad delta-pill pair from HealthMetricCard (home/health/) — the
// same fg+bg combination KnowledgeMetricStrip and VoiceSegmentPanel reuse for
// "value + trend" metrics elsewhere in the app.
const DELTA_GOOD = { fg: '#048c80', bg: '#e6f4f2' }
const DELTA_BAD = { fg: '#e53112', bg: '#fceae7' }

function StatBlock({
  label,
  value,
  valueColor,
  delta,
  deltaGood = true,
  target,
}: {
  label: string
  value: string
  valueColor?: string
  delta?: string
  // Whether the delta's direction is good news for this metric — independent
  // of the arrow, which always reflects the delta's own sign (HealthMetricCard).
  deltaGood?: boolean
  // A plan-driven stat has a target instead of a trend (self-improving-data.ts
  // authors no deltas) — shown plain, since it isn't a real trend.
  target?: string
}) {
  const tone = deltaGood ? DELTA_GOOD : DELTA_BAD
  const Trend = delta?.startsWith('-') ? TrendingDown : TrendingUp
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <p className="text-[12px] font-medium text-ink-muted">{label}</p>
      <span className="text-[28px] font-medium leading-[30px]" style={{ color: valueColor }}>
        {value}
      </span>
      {delta && (
        <span
          className="flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium"
          style={{ color: tone.fg, backgroundColor: tone.bg }}
        >
          {delta}
          <Trend size={14} aria-hidden />
        </span>
      )}
      {!delta && target && <span className="text-[12px] font-medium text-ink-muted">{target}</span>}
    </div>
  )
}

function LinkOut({ children }: { children: string }) {
  return (
    <button type="button" className="whitespace-nowrap text-[14px] font-semibold text-[#01567a] underline">
      {children}
    </button>
  )
}

const PASS_RATE_TICKS = 46
const PASS_RATE_FILLED = 39

// Unrelated to the self-improving plan (it's AI QA's test-run coverage, not a
// health signal), so it renders the same regardless of which agent is open.
function LiveAgentCoverageCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#f2f4f7] p-4">
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-ink-muted">Live Agent Coverage</p>
        <p className="text-[28px] font-medium text-ink">Covered</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <p className="text-[12px] font-medium text-ink-muted">Pass Rate</p>
          <p className="text-[28px] font-medium text-ink">85%</p>
        </div>
        <div className="flex gap-[2px]">
          {Array.from({ length: PASS_RATE_TICKS }).map((_, i) => (
            <span
              key={i}
              className="h-4 w-[2px] shrink-0 rounded-full"
              style={{ backgroundColor: i < PASS_RATE_FILLED ? '#048c80' : 'rgba(0,0,0,0.2)' }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <StatBlock label="Total Last Runs" value="4" />
        <StatBlock label="Passing Runs" value="3" valueColor="#048c80" />
        <StatBlock label="Failing Runs" value="1" valueColor="#e53112" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-ink-muted">Last Run Date</p>
        <div className="flex items-center gap-2 text-[14px]">
          <p className="text-ink">Jan 4, 2024 9:25 AM</p>
          <LinkOut>View Runs</LinkOut>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-ink-muted">Test Cases for this Agent</p>
        <div className="flex items-center gap-2 text-[14px]">
          <p className="text-ink">4</p>
          <LinkOut>View Test Cases</LinkOut>
        </div>
      </div>
      <button
        type="button"
        className="w-full rounded-full bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold text-[#193d50]"
      >
        Create Test Case
      </button>
    </div>
  )
}

function statValueColor(tone: HealthStat['tone']): string | undefined {
  return tone === 'critical' ? '#e53112' : undefined
}

function statValueText(stat: HealthStat): string {
  return stat.glyph === 'frown' ? '🙁' : `${stat.value}${stat.unit ?? ''}`
}

// Agent Health rendered from the plan's own six signals (self-improving-data.ts)
// — health score, deflection, CSAT, sentiment, handle time, fallback, in that
// order — rather than a hand-maintained duplicate of the same numbers.
function PlanHealthCard({ plan }: { plan: ImprovementPlan }) {
  const [healthScore, deflection, csat, sentiment, handleTime, fallback] = plan.health.stats
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-[#f2f4f7] p-4">
      {/* The category verdict is a status pill, not a StatBlock — the same
          giant-number treatment that suits "34%" reads oversized and alarming
          for a whole word like "Critical" (see HealthHeroBand, home/health/,
          which keeps its verdict just as small beside the numeric metrics). */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] font-medium text-ink-muted">Agent Health (Last 30 days)</p>
        <div className="flex items-center gap-2">
          <StatusTag state={healthScore.tone === 'critical' ? 'attention' : 'good'}>
            {healthScore.value}
          </StatusTag>
          <span className="text-[12px] font-medium text-ink-muted">{healthScore.target}</span>
        </div>
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex gap-3">
        <StatBlock
          label={deflection.caption}
          value={statValueText(deflection)}
          valueColor={statValueColor(deflection.tone)}
          target={deflection.target}
        />
        <StatBlock
          label={csat.caption}
          value={statValueText(csat)}
          valueColor={statValueColor(csat.tone)}
          target={csat.target}
        />
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex gap-3">
        <StatBlock
          label={sentiment.caption}
          value={statValueText(sentiment)}
          valueColor={statValueColor(sentiment.tone)}
          target={sentiment.target}
        />
        <StatBlock
          label={handleTime.caption}
          value={statValueText(handleTime)}
          valueColor={statValueColor(handleTime.tone)}
          target={handleTime.target}
        />
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex gap-3">
        <StatBlock
          label={fallback.caption}
          value={statValueText(fallback)}
          valueColor={statValueColor(fallback.tone)}
          target={fallback.target}
        />
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-ink-muted">Human review in progress</p>
        <div className="flex items-end gap-2">
          <p className="text-[28px] font-medium leading-[30px]">
            <span className="text-ink">12</span>
            <span className="text-[#acbdd5]">/20</span>
          </p>
          <LinkOut>View conversations</LinkOut>
        </div>
      </div>
    </div>
  )
}

function GenericHealthCard() {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-[#f2f4f7] p-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] font-medium text-ink-muted">Agent Health (Last 30 days)</p>
        <StatusTag state="good">Healthy</StatusTag>
      </div>
      <div className="flex gap-3">
        <StatBlock label="Deflection rate" value="79%" delta="+8%" />
        <StatBlock label="Sentiment" value="🙂" delta="+15%" />
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex gap-3">
        <StatBlock label="CSAT" value="3.6" valueColor="#048c80" delta="-12%" deltaGood={false} />
        <StatBlock label="Relevant" value="89%" valueColor="#216eb8" delta="+5%" />
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex gap-3">
        <StatBlock label="Engagement" value="39%" valueColor="#e53112" delta="+6%" />
        {/* QA Closing time fell 30% — a good outcome despite the minus sign. */}
        <StatBlock label="QA Closing" value="79%" delta="-30%" />
      </div>
      <div className="h-px bg-surface-border" aria-hidden />
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-ink-muted">Human review in progress</p>
        <div className="flex items-end gap-2">
          <p className="text-[28px] font-medium leading-[30px]">
            <span className="text-ink">12</span>
            <span className="text-[#acbdd5]">/20</span>
          </p>
          <LinkOut>View conversations</LinkOut>
        </div>
      </div>
    </div>
  )
}

function AgentHealthTab({ plan }: { plan?: ImprovementPlan }) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {plan ? <PlanHealthCard plan={plan} /> : <GenericHealthCard />}
      <LiveAgentCoverageCard />
    </div>
  )
}

// Dot + colored label, matching the shared PlanChipView recipe
// (ai-studio/plan-parts/plan-chip.tsx) — a filled pill reads too loud stacked
// down a panel this narrow.
function PlanStatusChip({ color, children }: { color: string; children: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-[-0.1px]" style={{ color }}>
      <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  )
}

// Card treatment matches ImprovementPlanSection's fix cards (the real
// self-improving plan renderer) rather than a flat divided list.
const STEP_CARD = 'rounded-xl border border-[#d2d9e5] bg-white/70 px-4 py-3'

function DoneStep({ children }: { children: string }) {
  return (
    <div className={`flex items-center justify-between gap-2 text-[12px] font-semibold text-ink ${STEP_CARD}`}>
      <p>{children}</p>
      <Check size={16} className="shrink-0 text-[#048c80]" aria-hidden />
    </div>
  )
}

function ApprovalStep({ title, description }: { title: string; description: string }) {
  return (
    <div className={`flex flex-col gap-2 text-[12px] ${STEP_CARD}`}>
      <p className="font-semibold text-ink">{title}</p>
      <p className="text-ink-muted">{description}</p>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] font-semibold text-[#193d50]"
        >
          <X size={16} aria-hidden />
          Reject
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full bg-[#ebf5f7] px-3 py-1.5 text-[14px] font-semibold text-[#193d50]"
        >
          <Check size={16} aria-hidden />
          Approve
        </button>
      </div>
    </div>
  )
}

// Fallback content for an agent with no self-improving plan (Voice's v1/v2
// today) — the panel's original mock copy, unchanged.
const GENERIC_DONE_STEPS = [
  'Expand intent recognition — 14 new trigger phrases',
  'API timeout retry + graceful error message',
  'Shorten confirmation messages by ~40%',
]

const GENERIC_NEEDS_APPROVAL_STEPS = [
  {
    title: 'SSO detection + separate flow branch',
    description:
      'Detects SSO users via $auth_method and routes them to SSO-specific instructions. Adds a new API call and affects ~30% of users.',
  },
  {
    title: 'A/B test: proactive link vs guided steps',
    description:
      '50/50 split — variant A sends a direct reset link, variant B walks through steps. Changes the primary resolution path for 50% of users during the test.',
  },
]

const GENERIC_PENDING_STEPS = ['Promote A/B winner + close experiment']

const RECENT_ACTIVITY = [
  { time: 'Apr 27 09:14', text: 'Replaced old templates with updated versions' },
  { time: 'Apr 27 09:13', text: 'Confirmation messages shortened by 40%' },
  { time: 'Apr 27 09:12', text: 'Added retry logic and error messaging for API…' },
  { time: 'Apr 27 09:11', text: 'Configured retry attempts and backoff interval' },
  { time: 'Apr 26 10:34', text: '14 trigger phrases added to intent recognition' },
]

function SelfImprovingTab({ plan }: { plan?: ImprovementPlan }) {
  // Weeks are chronological: the first is already applied, the second is the
  // one awaiting approval, and anything after that hasn't started. There is
  // exactly one canned plan today, so that positional read is safe; a second
  // plan with a different shape would need its own mapping, not a guess here.
  const doneSteps = plan ? plan.weeks[0].fixes.map((fix) => fix.title) : GENERIC_DONE_STEPS
  const approvalSteps = plan
    ? plan.weeks[1].fixes.map((fix) => ({ title: fix.title, description: fix.description }))
    : GENERIC_NEEDS_APPROVAL_STEPS
  const pendingSteps = plan
    ? (plan.weeks[2]?.fixes.map((fix) => fix.title) ?? [])
    : GENERIC_PENDING_STEPS
  const stepsTotal = plan ? plan.weeks.reduce((n, week) => n + week.fixes.length, 0) : 6
  const stepsDone = doneSteps.length

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div
        className="flex shrink-0 flex-col overflow-hidden rounded-xl border"
        style={{ borderColor: '#ffb393' }}
      >
        <div className="flex flex-col gap-3 border-b border-[#f1efed] bg-[#fbfbfb] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-semibold text-ink">Self-improving plan</p>
            <PlanStatusChip color="#b8710a">In progress</PlanStatusChip>
          </div>
          <p className="text-[12px] font-medium text-ink-muted">May 01, 2026 ~ July 01, 2026</p>
          <div className="flex flex-col gap-2">
            <p className="text-[12px] font-medium text-ink-muted">Plan steps</p>
            <div className="flex items-center justify-between">
              <p className="text-[34px] font-medium leading-[30px] text-ink">
                {stepsDone}/{stepsTotal}
              </p>
              <div className="flex items-center gap-[10px]">
                {Array.from({ length: stepsTotal }).map((_, i) => (
                  <span
                    key={i}
                    className="h-4 w-[2px] shrink-0 rounded-full"
                    style={{ backgroundColor: i < stepsDone ? '#048c80' : 'rgba(0,0,0,0.2)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <PlanStatusChip color="#0a6b62">Auto-applied</PlanStatusChip>
          <div className="flex flex-col gap-2">
            {doneSteps.map((step) => (
              <DoneStep key={step}>{step}</DoneStep>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <PlanStatusChip color="#bc2f7c">Needs approval</PlanStatusChip>
          <div className="flex flex-col gap-2">
            {approvalSteps.map((step) => (
              <ApprovalStep key={step.title} title={step.title} description={step.description} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <PlanStatusChip color="#646864">Pending</PlanStatusChip>
          <div className="flex flex-col gap-2">
            {pendingSteps.map((step) => (
              <div key={step} className={`text-[12px] font-semibold text-ink ${STEP_CARD}`}>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 pt-0">
          <button
            type="button"
            className="w-full rounded-full bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold text-[#193d50]"
          >
            View plan in AI Studio
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <p className="text-[12px] font-medium text-ink-muted">Recent activity</p>
        <div className="flex flex-col">
          {RECENT_ACTIVITY.map((entry) => (
            <div
              key={entry.time}
              className="flex gap-2 border-b border-surface-border py-3 text-[12px] last:border-b-0"
            >
              <p className="w-[84px] shrink-0 font-medium text-ink-muted">{entry.time}</p>
              <p className="font-semibold text-ink">{entry.text}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="flex items-center justify-center gap-1 py-2 text-[14px] font-semibold text-[#01567a]"
        >
          <ChevronDown size={16} aria-hidden />
          View all
        </button>
      </div>
    </div>
  )
}

export function InsightsPanel({
  onClose,
  plan,
}: {
  onClose: () => void
  // The agent's self-improving plan, if AI Studio has diagnosed one
  // (self-improving-data.ts). Absent for every other agent.
  plan?: ImprovementPlan
}) {
  const [tab, setTab] = useState<InsightsTab>('health')

  return (
    // Docked in the same right-hand slot as the Steps/AI panels, holding the
    // rail's width clear of it (see AgentEditorScreen).
    <Card flat style={{ width: EDITOR_PANEL_W }} className="me-[72px] flex shrink-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-[18px] font-medium text-ink">Agent Insights</h2>
        <button
          type="button"
          aria-label="Close insights"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-ink-muted hover:bg-control-hover hover:text-ink"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <div role="tablist" aria-label="Insights" className="mt-2 flex gap-1 border-b border-surface-border px-4">
        {TABS.map(({ key, label }) => {
          const active = key === tab
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className="relative px-3 py-3 text-[14px]"
              style={{ color: active ? '#193d50' : '#9194a0' }}
            >
              {label}
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#01567a]" aria-hidden />}
            </button>
          )
        })}
      </div>
      {tab === 'health' && <AgentHealthTab plan={plan} />}
      {tab === 'self-improving' && <SelfImprovingTab plan={plan} />}
    </Card>
  )
}
