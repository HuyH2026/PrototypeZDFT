// `build-dashboard` assistant body: AI Studio drives Home's dashboard generation.
//
// Two ways in, one conversation. The guided picker asks two questions — your role,
// then what you want to track — and writes the request for you; the composer takes
// the same request as free text for anyone who would rather type. Either way the
// panel echoes the request, shows what it is doing, and reports back when the
// dashboard is ready.
//
// Home renders the dashboard itself and owns its saved views; this body only
// reports the turn (see dashboard-request-store). Nothing here is generated — the
// prompt, the steps, and the reply are all derived, so the same request always
// reads the same way. No model call this phase.
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BookOpen, ChartNoAxesColumn, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleCheck, MessageSquare, User, type LucideIcon,
} from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { FOCUS_AREAS, ROLES, type FocusArea, type Role } from '@/features/home/generate-layout'

// How long each step of the trace holds before the next appears.
const STEP_MS = 500

export type DashboardTurn = { prompt: string; role: Role | null; focuses: FocusArea[] }
export type DashboardSelection = {
  role: Role | null
  focuses: FocusArea[]
  prompt?: string
}

// --- The trace -------------------------------------------------------------
// What the assistant says it is doing, chosen by what the request asks for. Only
// the first two matches run: a longer list reads as stalling, not as thoroughness.
const WORK_STEPS: { when: (turn: DashboardTurn) => boolean; label: string; icon: LucideIcon }[] = [
  {
    when: (t) => t.focuses.includes('lifecycle') || t.focuses.includes('gaps'),
    label: 'Fetching Jira',
    icon: BookOpen,
  },
  { when: () => true, label: 'Loading customer requests', icon: MessageSquare },
  { when: (t) => t.focuses.includes('quality'), label: 'Reviewing test results', icon: Check },
  { when: (t) => t.focuses.includes('health'), label: 'Reading agent metrics', icon: ChartNoAxesColumn },
]

function traceSteps(turn: DashboardTurn): { label: string; icon: LucideIcon }[] {
  if (turn.role === 'exec') {
    return [
      { label: 'Fetching CRMs', icon: BookOpen },
      { label: 'Forecasting potential impact…', icon: ChartNoAxesColumn },
      { label: 'Done', icon: CircleCheck },
    ]
  }
  const work = WORK_STEPS.filter((s) => s.when(turn))
    .slice(0, 2)
    .map(({ label, icon }) => ({ label, icon }))
  return [...work, { label: 'Done', icon: CircleCheck }]
}

// --- The guided picker -----------------------------------------------------
// "Something else" is the frame's muted row: it stands for a request the two
// questions cannot express, which is what the composer below is for. It is not a
// selectable answer, so it is inert rather than a checkbox that does nothing.
const SOMETHING_ELSE = 'Something else'

type ExecutiveFocusArea =
  | 'resolution-trends'
  | 'business-value'
  | 'cost-model'
  | 'operational-diagnostics'
  | 'target-forecast'

const EXECUTIVE_FOCUS_AREAS: { key: ExecutiveFocusArea; label: string }[] = [
  { key: 'resolution-trends', label: 'Resolution trends' },
  { key: 'business-value', label: 'Business value and outcomes' },
  { key: 'cost-model', label: 'Cost model' },
  { key: 'operational-diagnostics', label: 'Operational diagnostics' },
  { key: 'target-forecast', label: 'Target and forecast' },
]

const EXECUTIVE_PROMPT_PHRASES: Record<ExecutiveFocusArea, string[]> = {
  'resolution-trends': ['resolution trends'],
  'business-value': ['value'],
  'cost-model': ['costs'],
  'operational-diagnostics': ['operational diagnostics'],
  'target-forecast': ['targets', 'forecasted impact'],
}

function joinPromptPhrases(phrases: string[]): string {
  if (phrases.length <= 1) return phrases.join('')
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`
  return `${phrases.slice(0, -1).join(', ')}, and ${phrases[phrases.length - 1]}`
}

function composeExecutivePrompt(focuses: ExecutiveFocusArea[]): string {
  const phrases = focuses.flatMap((focus) => EXECUTIVE_PROMPT_PHRASES[focus])
  return `Build me a business case with ${joinPromptPhrases(phrases)}.`
}

function SelectRow({
  label, selected, single, onSelect,
}: { label: string; selected: boolean; single: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role={single ? 'radio' : 'checkbox'}
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors duration-instant ease-soft ${
        selected ? 'bg-[#f1f3f6]' : 'hover:bg-control-hover'
      }`}
    >
      <span
        aria-hidden
        className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
          selected ? 'border-accent-blue bg-accent-blue' : 'border-grey-500 bg-white'
        }`}
      >
        {selected && <Check size={12} color="#fff" strokeWidth={3} />}
      </span>
      <span className={`text-[14px] leading-5 tracking-[-0.154px] ${selected ? 'text-black' : 'text-ink'}`}>
        {label}
      </span>
    </button>
  )
}

function InertRow({ label }: { label: string }) {
  return (
    <div aria-disabled className="flex items-center gap-3 px-2 py-3">
      <span aria-hidden className="size-4 shrink-0 rounded-[4px] border border-grey-400 bg-white" />
      <span className="text-[14px] leading-5 tracking-[-0.154px] text-ink-muted">{label}</span>
    </div>
  )
}

function GuidedPicker({ onSubmit }: { onSubmit: (turn: DashboardSelection) => void }) {
  const [step, setStep] = useState<0 | 1>(0)
  const [role, setRole] = useState<Role | null>(null)
  const [focuses, setFocuses] = useState<FocusArea[]>([])
  const [executiveFocuses, setExecutiveFocuses] = useState<ExecutiveFocusArea[]>([])

  const onRoleStep = step === 0
  // A role is one answer; what to track is several. Selections are kept in
  // FOCUS_AREAS order so the request reads the same however they were clicked.
  const toggleFocus = (key: FocusArea) =>
    setFocuses((prev) =>
      prev.includes(key)
        ? prev.filter((f) => f !== key)
        : FOCUS_AREAS.filter((f) => f.key === key || prev.includes(f.key)).map((f) => f.key),
    )
  const toggleExecutiveFocus = (key: ExecutiveFocusArea) =>
    setExecutiveFocuses((prev) =>
      prev.includes(key)
        ? prev.filter((focus) => focus !== key)
        : EXECUTIVE_FOCUS_AREAS.filter(
            (focus) => focus.key === key || prev.includes(focus.key),
          ).map((focus) => focus.key),
    )

  const selectRole = (nextRole: Role) => {
    setRole((previousRole) => (previousRole === nextRole ? null : nextRole))
    setFocuses([])
    setExecutiveFocuses([])
  }

  const selectedCount = onRoleStep
    ? role
      ? 1
      : 0
    : role === 'exec'
      ? executiveFocuses.length
      : focuses.length
  const advance = () =>
    onRoleStep
      ? setStep(1)
      : onSubmit(
          role === 'exec'
            ? { role, focuses: [], prompt: composeExecutivePrompt(executiveFocuses) }
            : { role, focuses },
        )

  return (
    <div
      data-testid="dashboard-picker"
      className="rounded-3xl bg-white p-4 shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_6px_18px_0px_rgba(3,17,38,0.10)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {onRoleStep ? (
            <User size={16} className="text-accent-blue" />
          ) : (
            <ChartNoAxesColumn size={16} className="text-[#be297b]" />
          )}
          <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">
            {onRoleStep ? "What's your role?" : 'What do you want to track?'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous question"
            disabled={onRoleStep}
            onClick={() => setStep(0)}
            className="text-ink disabled:text-grey-400"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] leading-4 text-ink-muted">{step + 1} of 2</span>
          <button
            type="button"
            aria-label="Next question"
            disabled={!onRoleStep}
            onClick={() => setStep(1)}
            className="text-ink disabled:text-grey-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        role={onRoleStep ? 'radiogroup' : 'group'}
        aria-label={onRoleStep ? 'Your role' : 'What to track'}
        className="mt-1.5 flex flex-col divide-y divide-surface-border"
      >
        {onRoleStep
          ? ROLES.map((r) => (
              <SelectRow
                key={r.key}
                label={r.label}
                single
                selected={role === r.key}
                onSelect={() => selectRole(r.key)}
              />
            ))
          : role === 'exec'
            ? EXECUTIVE_FOCUS_AREAS.map((focus) => (
                <SelectRow
                  key={focus.key}
                  label={focus.label}
                  single={false}
                  selected={executiveFocuses.includes(focus.key)}
                  onSelect={() => toggleExecutiveFocus(focus.key)}
                />
              ))
          : FOCUS_AREAS.map((f) => (
              <SelectRow
                key={f.key}
                label={f.label}
                single={false}
                selected={focuses.includes(f.key)}
                onSelect={() => toggleFocus(f.key)}
              />
            ))}
        <InertRow label={SOMETHING_ELSE} />
      </div>

      <div className="mt-2 flex h-8 items-center justify-between">
        <span className="text-[12px] leading-4 text-ink-muted">{selectedCount} selected</span>
        {selectedCount > 0 && (
          <button
            type="button"
            aria-label={onRoleStep ? 'Continue' : 'Build my dashboard'}
            onClick={advance}
            className="flex size-8 items-center justify-center rounded-full bg-nav-active text-white transition-colors duration-instant ease-soft hover:bg-ink"
          >
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// --- Building ---------------------------------------------------------------
// What the panel does between the request and the reply. Mounted keyed by the
// request, so a second request starts a fresh trace instead of resetting this
// state from an effect.
function BuildTrace({ turn, onBuilt }: { turn: DashboardTurn; onBuilt: () => void }) {
  const steps = useMemo(() => traceSteps(turn), [turn])
  const [revealed, setRevealed] = useState(0)
  const [built, setBuilt] = useState(false)
  const [tracePinned, setTracePinned] = useState(true)

  // One beat per step, then one more before the reply — so the last step ("Done")
  // is actually seen rather than being overtaken by the answer.
  useEffect(() => {
    if (built) return
    const timer = setTimeout(() => {
      if (revealed < steps.length) setRevealed(revealed + 1)
      else setBuilt(true)
    }, STEP_MS)
    return () => clearTimeout(timer)
  }, [revealed, steps.length, built])

  useEffect(() => {
    if (built) onBuilt()
  }, [built, onBuilt])

  if (built) {
    if (turn.role === 'exec') {
      return (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">All done!</p>
            <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">
              Your dashboard is ready.
            </p>
          </div>
          <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">
            Because no CRM is connected, the cost model uses estimated values. You can update
            the assumptions manually or connect a CRM to use your data.
          </p>
          <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">
            Let me know if you&apos;d like to refine the assumptions or adjust the dashboard.
          </p>
        </div>
      )
    }
    return (
      <div className="mt-4">
        <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">All done!</p>
        <p className="text-[14px] leading-5 tracking-[-0.1px] text-[#202121]">
          Your dashboard is ready. Let me know if you&apos;d like to adjust, refine, or add
          anything, I&apos;d be happy to make changes.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <ZendeskLogo size={16} color="#17494d" />
        <p className="text-[14px] leading-5 tracking-[-0.1px] text-ink">
          Creating <span className="text-ink-muted">dashboard</span>
        </p>
      </div>
      <button
        type="button"
        aria-expanded={tracePinned}
        onClick={() => setTracePinned((open) => !open)}
        className="mt-2.5 flex items-center gap-1 text-[14px] leading-5 text-ink-muted"
      >
        Thinking
        <ChevronDown
          size={16}
          className="transition-transform duration-instant ease-soft"
          style={{ transform: tracePinned ? 'none' : 'rotate(-90deg)' }}
          aria-hidden
        />
      </button>
      {tracePinned && (
        <ol data-testid="dashboard-trace" className="mt-1.5 ms-1 flex flex-col">
          {steps.slice(0, revealed).map(({ label, icon: Icon }, index) => (
            <li key={label} className="flex flex-col">
              {index > 0 && <span aria-hidden className="ms-2 h-2 w-px bg-surface-border" />}
              <span className="flex items-center gap-2 text-[13px] leading-[18px] text-ink-muted">
                <Icon size={14} aria-hidden />
                {label}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// --- The body --------------------------------------------------------------
export function DashboardBuilderBody({
  request,
  onSubmitSelection,
  onBuilt,
}: {
  // The request that has been sent, or null before the first send.
  request: DashboardTurn | null
  onSubmitSelection: (turn: DashboardSelection) => void
  // The trace has finished — the dashboard can be committed.
  onBuilt: () => void
}) {
  if (!request) {
    return (
      <div className="flex h-full flex-col">
        <p className="mt-6 text-[22px] leading-[30px] tracking-[0.352px] text-black">
          Let&apos;s design your dashboard 🧬
        </p>
        <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-ink">
          Tell me your role and priorities, and I&apos;ll build your dashboard, no configuring
          required.
        </p>
        {/* The picker sits with the composer at the foot of the panel, so the two
            ways of answering are next to each other. */}
        <div className="mt-auto pb-2 pt-6">
          <GuidedPicker onSubmit={onSubmitSelection} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-4">
      {/* The request, echoed as the user's own message. */}
      <div className="mt-4 flex justify-end">
        <p
          className="max-w-[85%] rounded-2xl px-4 py-3.5 text-[14px] leading-5 tracking-[-0.1px] text-white"
          style={{ background: 'linear-gradient(90deg,#01567a,#6dbbd7)' }}
        >
          {request.prompt}
        </p>
      </div>

      <BuildTrace key={request.prompt} turn={request} onBuilt={onBuilt} />
    </div>
  )
}
