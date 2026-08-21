import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Check,
  Code,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { Card } from '@/components/flora/Card'
import { Field, TextArea } from '@/components/flora/Field'
import { CHANNELS, type ChannelKey } from '@/features/ai-agents/agent-builder-data'
import type { StoredAgent } from '@/features/ai-agents/agent-store'
import { cn } from '@/lib/cn'
import { AgentDetailPanel } from './AgentDetailPanel'
import {
  ATTENTION_AGENT_IDS,
  FINDINGS,
  findingsForAgent,
  modeCounts,
  type CockpitFinding,
  type FindingState,
  type ManagementMode,
  type OutcomeMetric,
} from './cockpit-data'
import { OutcomeOverlay } from './OutcomeOverlay'

const MODE_LABEL: Record<ManagementMode, string> = {
  shadow: 'Shadow',
  suggest: 'Suggest & test',
  full: 'Full management',
}

const MODE_SHORT_LABEL: Record<ManagementMode, string> = {
  shadow: 'Shadow',
  suggest: 'Suggest',
  full: 'Full',
}

const MODE_DOT: Record<ManagementMode, string> = {
  shadow: '#8b9290',
  suggest: '#7556a8',
  full: '#5b8e3e',
}

const CHANNEL_ICON: Record<ChannelKey, typeof MessageSquare> = {
  widget: MessageSquare,
  webcall: PhoneCall,
  email: Mail,
  voice: Phone,
  headless: Code,
}

const MODE_WEIGHT: Record<ManagementMode, number> = { shadow: 0, suggest: 1, full: 2 }
const AUTHORED_ATTENTION_ORDER = new Map(
  ATTENTION_AGENT_IDS.map((agentId, index) => [agentId, index]),
)

function effectiveMode(
  finding: CockpitFinding,
  modes: Readonly<Record<string, ManagementMode>>,
): ManagementMode {
  return finding.targetAgentIds.reduce<ManagementMode>((mostRestrictive, agentId) => {
    const candidate = modes[agentId] ?? 'shadow'
    return MODE_WEIGHT[candidate] < MODE_WEIGHT[mostRestrictive] ? candidate : mostRestrictive
  }, 'full')
}

function OutcomeEditor({
  metrics,
  onSave,
  onClose,
}: {
  metrics: OutcomeMetric[]
  onSave: (entitlementTarget: number, costAvoidedTarget: number) => void
  onClose: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const entitlementInputId = useId()
  const entitlementErrorId = useId()
  const costAvoidedInputId = useId()
  const costAvoidedErrorId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const entitlement = metrics.find((metric) => metric.id === 'entitlement-consumption')
  const costAvoided = metrics.find((metric) => metric.id === 'cost-avoided')
  const [entitlementTarget, setEntitlementTarget] = useState(
    'target' in (entitlement ?? {}) ? String(entitlement?.target ?? 50_000) : '50000',
  )
  const [costAvoidedTarget, setCostAvoidedTarget] = useState(
    'target' in (costAvoided ?? {}) ? String(costAvoided?.target ?? 450_000) : '450000',
  )
  const entitlementValue = Number(entitlementTarget)
  const costAvoidedValue = Number(costAvoidedTarget)
  const entitlementError =
    entitlementTarget.trim() === '' || !Number.isFinite(entitlementValue) || entitlementValue <= 0
      ? 'Enter an entitlement target greater than 0.'
      : null
  const costAvoidedError =
    costAvoidedTarget.trim() === '' || !Number.isFinite(costAvoidedValue) || costAvoidedValue <= 0
      ? 'Enter a cost-avoided target greater than 0.'
      : null

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>('[data-outcome-initial-focus]')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!dialog?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <Card
        ref={dialogRef}
        flat
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-[480px] bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#eef3fc] text-[#406cc4]">
            <Target className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[18px] font-semibold text-ink">
              Edit outcome targets
            </h2>
            <p id={descriptionId} className="mt-1 text-[13px] leading-5 text-ink-muted">
              AI resolution always climbs toward 100%, bounded only by the locked CSAT floor. Set
              the entitlement and cost-avoided targets you want the loop to drive toward.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ink-muted hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (entitlementError || costAvoidedError) return
            onSave(entitlementValue, costAvoidedValue)
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={entitlementInputId} className="text-[12px] font-medium text-ink">
              Entitlement target
            </label>
            <Field
              id={entitlementInputId}
              data-outcome-initial-focus
              type="number"
              min="1"
              step="any"
              required
              value={entitlementTarget}
              aria-invalid={entitlementError !== null}
              aria-describedby={entitlementError ? entitlementErrorId : undefined}
              onChange={(event) => setEntitlementTarget(event.target.value)}
            />
            {entitlementError ? (
              <p id={entitlementErrorId} role="alert" className="text-[11px] text-red-700">
                {entitlementError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={costAvoidedInputId} className="text-[12px] font-medium text-ink">
              Cost-avoided target ($)
            </label>
            <Field
              id={costAvoidedInputId}
              type="number"
              min="1"
              step="any"
              required
              value={costAvoidedTarget}
              aria-invalid={costAvoidedError !== null}
              aria-describedby={costAvoidedError ? costAvoidedErrorId : undefined}
              onChange={(event) => setCostAvoidedTarget(event.target.value)}
            />
            {costAvoidedError ? (
              <p id={costAvoidedErrorId} role="alert" className="text-[11px] text-red-700">
                {costAvoidedError}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-[#f0c9ca] bg-[#fdf7f7] px-3 py-2.5 text-[12px] text-[#7b2d32]">
            AI-interaction CSAT and Policy compliance floors are set by your service agreement — not
            dials the loop can trade away.
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={entitlementError !== null || costAvoidedError !== null}
            >
              Save outcomes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export type CockpitOverviewProps = {
  agents: StoredAgent[]
  metrics: OutcomeMetric[]
  modes: Readonly<Record<string, ManagementMode>>
  findingStates: Readonly<Record<string, FindingState>>
  selectedAgentId: string | null
  selectedFindingId: string | null
  guidance: string
  guidanceSaved: boolean
  actionsPaused: boolean
  onGuidanceChange: (value: string) => void
  onSaveGuidance: () => void
  onSaveOutcomes: (entitlementTarget: number, costAvoidedTarget: number) => void
  onSelectAgent: (agentId: string) => void
  onSelectFinding: (findingId: string, agentId?: string) => void
  onRequestMode: (agentId: string, mode: ManagementMode) => void
  onAdvanceFinding: (findingId: string, actionMode: ManagementMode) => void
  onCloseAgent: () => void
}

export function CockpitOverview({
  agents,
  metrics,
  modes,
  findingStates,
  selectedAgentId,
  selectedFindingId,
  guidance,
  guidanceSaved,
  actionsPaused,
  onGuidanceChange,
  onSaveGuidance,
  onSaveOutcomes,
  onSelectAgent,
  onSelectFinding,
  onRequestMode,
  onAdvanceFinding,
  onCloseAgent,
}: CockpitOverviewProps) {
  const [editingOutcomes, setEditingOutcomes] = useState(false)
  const activeAgents = useMemo(() => agents.filter((agent) => agent.on), [agents])
  const activeAgentIds = useMemo(
    () => new Set(activeAgents.map((agent) => agent.id)),
    [activeAgents],
  )
  const activeModes = useMemo(
    () =>
      Object.fromEntries(
        activeAgents.map((agent) => [agent.id, modes[agent.id] ?? 'shadow']),
      ) as Record<string, ManagementMode>,
    [activeAgents, modes],
  )
  const counts = modeCounts(activeModes)
  const selectedAgent = activeAgents.find((agent) => agent.id === selectedAgentId)
  const unresolvedActiveFindings = useMemo(
    () =>
      FINDINGS.filter(
        (finding) =>
          (findingStates[finding.id] ?? finding.state) !== 'applied' &&
          finding.targetAgentIds.every((agentId) => activeAgentIds.has(agentId)),
      ),
    [activeAgentIds, findingStates],
  )
  const topFindingByAgent = useMemo(() => {
    const map = new Map<string, CockpitFinding>()
    for (const finding of unresolvedActiveFindings) {
      for (const agentId of finding.targetAgentIds) {
        const current = map.get(agentId)
        if (!current || finding.projectedResolutionDelta > current.projectedResolutionDelta) {
          map.set(agentId, finding)
        }
      }
    }
    return map
  }, [unresolvedActiveFindings])
  const attentionAgentIds = useMemo(() => {
    const impactByAgent = new Map<string, number>()
    for (const finding of unresolvedActiveFindings) {
      for (const agentId of finding.targetAgentIds) {
        impactByAgent.set(
          agentId,
          (impactByAgent.get(agentId) ?? 0) + finding.projectedResolutionDelta,
        )
      }
    }

    const ranked = [...impactByAgent.keys()].sort((left, right) => {
      const impactDifference = (impactByAgent.get(right) ?? 0) - (impactByAgent.get(left) ?? 0)
      if (impactDifference !== 0) return impactDifference
      const authoredDifference =
        (AUTHORED_ATTENTION_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER) -
        (AUTHORED_ATTENTION_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER)
      return authoredDifference || left.localeCompare(right)
    })
    return new Set(ranked.slice(0, 4))
  }, [unresolvedActiveFindings])
  const selectedAgentFindings = selectedAgent
    ? findingsForAgent(selectedAgent.id).filter((finding) =>
        finding.targetAgentIds.every((agentId) => activeAgentIds.has(agentId)),
      )
    : []
  const selectedFinding =
    selectedAgentFindings.find((finding) => finding.id === selectedFindingId) ??
    selectedAgentFindings[0]
  const selectedActionMode = selectedFinding
    ? effectiveMode(selectedFinding, modes)
    : (modes[selectedAgentId ?? ''] ?? 'shadow')
  const blockingAgentId =
    selectedFinding && selectedActionMode === 'shadow'
      ? (selectedFinding.targetAgentIds.find(
          (agentId) => agentId !== selectedAgentId && (modes[agentId] ?? 'shadow') === 'shadow',
        ) ??
        selectedFinding.targetAgentIds.find((agentId) => (modes[agentId] ?? 'shadow') === 'shadow'))
      : undefined
  const agentNameById = (agentId: string) =>
    agents.find((agent) => agent.id === agentId)?.name ?? agentId

  const saveOutcomes = (entitlementTarget: number, costAvoidedTarget: number) => {
    onSaveOutcomes(entitlementTarget, costAvoidedTarget)
    setEditingOutcomes(false)
  }

  return (
    <div data-testid="cockpit-overview" className="flex flex-col gap-5">
      <OutcomeOverlay metrics={metrics} onEdit={() => setEditingOutcomes(true)} />

      <Card data-testid="agent-oversight" className="min-w-0 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Agent oversight</h2>
            <p className="mt-1 text-[12px] text-ink-muted">
              {activeAgents.length} live agents ·{' '}
              {attentionAgentIds.size === 0
                ? 'no agents are calling for attention'
                : `${attentionAgentIds.size} highest-impact ${attentionAgentIds.size === 1 ? 'agent is' : 'agents are'} calling for attention`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-ink-muted">
            {(Object.keys(MODE_LABEL) as ManagementMode[]).map((mode) => (
              <span key={mode} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: MODE_DOT[mode] }} />
                {counts[mode]} {MODE_SHORT_LABEL[mode]}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 grid min-h-[420px] grid-cols-4 gap-3 rounded-[16px] border border-surface-border bg-[#fafafa] p-3">
          {/* The cockpit's domain is the four established agent channels;
              webcall starts empty on Use cases, and the map is fixed at four
              columns, so it stays out until it has agents. */}
          {CHANNELS.filter((channel) => channel.agents.length > 0).map((channel) => {
            const channelAgents = activeAgents.filter((agent) => agent.channel === channel.key)
            const Icon = CHANNEL_ICON[channel.key]
            return (
              <section
                key={channel.key}
                aria-label={`${channel.label} agents`}
                className="relative min-w-0 rounded-xl bg-white/70 p-2.5"
              >
                <div className="flex items-center gap-2 border-b border-dashed border-surface-border pb-2 text-[11px] font-medium text-ink-muted">
                  <Icon className="size-3.5" aria-hidden />
                  {channel.label}
                </div>
                <div className="relative mt-3 flex flex-col gap-3 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-grey-200">
                  {channelAgents.map((agent) => {
                    const mode = modes[agent.id] ?? 'shadow'
                    const attention = attentionAgentIds.has(agent.id)
                    const topFinding = topFindingByAgent.get(agent.id)
                    const selected = selectedAgentId === agent.id
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        aria-pressed={selected}
                        data-testid={`agent-map-node-${agent.id}`}
                        onClick={() => onSelectAgent(agent.id)}
                        className={cn(
                          'relative z-[1] rounded-xl border bg-white px-3 py-2.5 text-left transition-[border-color,box-shadow,transform] duration-instant ease-soft hover:-translate-y-0.5',
                          selected
                            ? 'border-[#406cc4] shadow-[0_0_0_2px_rgba(64,108,196,0.18)]'
                            : 'border-surface-border',
                          attention &&
                            !selected &&
                            'border-[#bba8d8] shadow-[0_0_0_3px_rgba(117,86,168,0.10)]',
                        )}
                      >
                        <span className="flex items-start gap-2">
                          <span
                            className="mt-1 size-2 shrink-0 rounded-full"
                            style={{ background: MODE_DOT[mode] }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium text-ink">
                              {agent.name}
                            </span>
                            <span className="mt-1 block text-[10px] text-ink-muted">
                              {MODE_SHORT_LABEL[mode]} · {agent.resolutionRate}
                            </span>
                          </span>
                        </span>
                        {attention && topFinding ? (
                          <div
                            data-testid="agent-attention-badge"
                            className="mt-2 flex flex-col gap-1 rounded-lg bg-[#f7f4fb] px-2 py-1.5"
                          >
                            <span className="flex items-start gap-1.5 text-[10px] leading-[14px] font-medium text-[#59446d]">
                              <Sparkles className="mt-[1px] size-3 shrink-0" aria-hidden />
                              {topFinding.title}
                            </span>
                            <span className="pl-[18px] text-[10px] text-[#8a7aad]">
                              +{topFinding.projectedResolutionDelta.toFixed(1)} pt ·{' '}
                              {topFinding.entitlementReach}
                            </span>
                          </div>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </Card>

      <Card className="flex items-center gap-5 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f0ebf7] text-[#7556a8]">
          <Sparkles className="size-4" aria-hidden />
        </div>
        <div className="w-[240px] shrink-0">
          <h2 className="text-[14px] font-semibold text-ink">Guide the next pass</h2>
          <p className="mt-1 text-[12px] leading-5 text-ink-muted">
            Add context the loop cannot infer. It becomes account memory.
          </p>
        </div>
        <TextArea
          aria-label="Guidance for the next pass"
          value={guidance}
          onChange={(event) => onGuidanceChange(event.target.value)}
          placeholder="Example: Deprioritize trial flows—we’re rewriting them next quarter."
          className="min-h-[70px] flex-1 resize-none"
        />
        <div className="flex w-[130px] shrink-0 flex-col items-end gap-2">
          <Button size="sm" variant="primary" disabled={!guidance.trim()} onClick={onSaveGuidance}>
            Add guidance
          </Button>
          {guidanceSaved ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#31591e]">
              <Check className="size-3" aria-hidden /> Saved to memory
            </span>
          ) : null}
        </div>
      </Card>

      {selectedAgent ? (
        <AgentDetailPanel
          agent={selectedAgent}
          mode={modes[selectedAgent.id] ?? 'shadow'}
          actionMode={selectedActionMode}
          blockingAgentName={blockingAgentId ? agentNameById(blockingAgentId) : undefined}
          findings={selectedAgentFindings}
          findingStates={findingStates}
          selectedFindingId={selectedFindingId}
          agentNameById={agentNameById}
          onSelectFinding={(findingId) => onSelectFinding(findingId)}
          onRequestMode={(mode) => onRequestMode(selectedAgent.id, mode)}
          onReviewBlockingAgent={
            blockingAgentId && blockingAgentId !== selectedAgent.id
              ? () => onSelectAgent(blockingAgentId)
              : undefined
          }
          onAdvanceFinding={(findingId) => onAdvanceFinding(findingId, selectedActionMode)}
          actionsPaused={actionsPaused}
          onClose={onCloseAgent}
        />
      ) : null}

      {editingOutcomes ? (
        <OutcomeEditor
          metrics={metrics}
          onSave={saveOutcomes}
          onClose={() => setEditingOutcomes(false)}
        />
      ) : null}
    </div>
  )
}
