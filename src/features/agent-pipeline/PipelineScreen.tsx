import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/flora/Button'
import { PageHeader } from '@/components/flora/PageHeader'
import { useAgentStore } from '@/features/ai-agents/agent-store'
import { AccountMemoryView } from './AccountMemoryView'
import { ActivityExperiments } from './ActivityExperiments'
import { ApprovalInbox } from './ApprovalInbox'
import {
  FINDINGS,
  INITIAL_MANAGEMENT_MODES,
  OUTCOME_METRICS,
  topFindingForAgent,
  type FindingState,
  type ManagementMode,
  type OutcomeMetric,
} from './cockpit-data'
import { CockpitOverview } from './CockpitOverview'
import { CycleLog } from './CycleLog'
import { EnrollmentDialog } from './EnrollmentDialog'
import { LoopDiagram } from './LoopDiagram'
import { ALL_CHANGES, CYCLES, LOOP, MEMORY, TOTAL_CYCLES, type Change } from './pipeline-data'
import {
  activeExperimentChanges,
  changesForCycle,
  heldChanges,
  laneCounts,
  memoryWithDecisions,
} from './pipeline-selectors'
import { usePipelineStore } from './pipeline-store'
import { SessionActivity } from './SessionActivity'

const TABS = ['Direction', 'Activity', 'Memory'] as const
type Tab = (typeof TABS)[number]

type PendingEnrollment = {
  agentId: string
  targetMode: Exclude<ManagementMode, 'shadow'>
}

const NEXT_FINDING_STATE: Record<FindingState, FindingState> = {
  observed: 'testing',
  testing: 'awaiting-approval',
  'awaiting-approval': 'applied',
  applied: 'applied',
}

export function PipelineScreen() {
  const screenRef = useRef<HTMLDivElement>(null)
  const { agents } = useAgentStore()
  const { decisions, paused, decide, reconsider, setPaused } = usePipelineStore()
  const [tab, setTab] = useState<Tab>('Direction')
  const [selectedCycleId, setSelectedCycleId] = useState(CYCLES[0].id)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null)
  const [modes, setModes] = useState<Record<string, ManagementMode>>(INITIAL_MANAGEMENT_MODES)
  const [findingStates, setFindingStates] = useState<Record<string, FindingState>>({})
  const [pendingEnrollment, setPendingEnrollment] = useState<PendingEnrollment | null>(null)
  const [enrolledAgentIds, setEnrolledAgentIds] = useState<Set<string>>(
    () =>
      new Set(
        Object.entries(INITIAL_MANAGEMENT_MODES)
          .filter(([, mode]) => mode !== 'shadow')
          .map(([agentId]) => agentId),
      ),
  )
  const [guidance, setGuidance] = useState('')
  const [guidanceEntries, setGuidanceEntries] = useState<string[]>([])
  const [guidanceSaved, setGuidanceSaved] = useState(false)
  const [metrics, setMetrics] = useState<OutcomeMetric[]>(OUTCOME_METRICS)

  const selectedCycle = CYCLES.find((cycle) => cycle.id === selectedCycleId) ?? CYCLES[0]
  const selectedCycleChanges = changesForCycle(selectedCycle, ALL_CHANGES)
  const selectedCycleDecisions = selectedCycle.id === CYCLES[0].id ? decisions : {}
  const counts = laneCounts(selectedCycleChanges, selectedCycleDecisions)
  const held = heldChanges(ALL_CHANGES, decisions)
  const experiments = activeExperimentChanges(ALL_CHANGES, decisions)
  const memory = memoryWithDecisions(MEMORY, ALL_CHANGES, decisions, CYCLES)
  const memoryRuledOut = memory.filter((entry) => entry.verdict === 'ruled-out').length
  const activeAgents = useMemo(() => agents.filter((agent) => agent.on), [agents])
  const activeAgentIds = useMemo(
    () => new Set(activeAgents.map((agent) => agent.id)),
    [activeAgents],
  )
  const sessionActivity = useMemo(
    () =>
      Object.entries(findingStates).flatMap(([findingId, state]) => {
        const finding = FINDINGS.find((candidate) => candidate.id === findingId)
        if (!finding) return []
        return [
          {
            finding,
            state,
            agentNames: finding.targetAgentIds.map(
              (agentId) => agents.find((agent) => agent.id === agentId)?.name ?? agentId,
            ),
          },
        ]
      }),
    [agents, findingStates],
  )

  const selectAgent = (agentId: string) => {
    const unresolved = FINDINGS.filter(
      (finding) =>
        finding.targetAgentIds.includes(agentId) &&
        finding.targetAgentIds.every((targetAgentId) => activeAgentIds.has(targetAgentId)) &&
        (findingStates[finding.id] ?? finding.state) !== 'applied',
    ).sort(
      (left, right) =>
        right.projectedResolutionDelta - left.projectedResolutionDelta ||
        right.confidence - left.confidence,
    )[0]
    setSelectedAgentId(agentId)
    setSelectedFindingId(unresolved?.id ?? topFindingForAgent(agentId)?.id ?? null)
  }

  const selectFinding = (findingId: string, agentId?: string) => {
    const finding = FINDINGS.find((candidate) => candidate.id === findingId)
    const targetAgentId = agentId ?? selectedAgentId ?? finding?.targetAgentIds[0]
    if (targetAgentId) setSelectedAgentId(targetAgentId)
    setSelectedFindingId(findingId)
  }

  const requestMode = (agentId: string, mode: ManagementMode) => {
    const current = modes[agentId] ?? 'shadow'
    if (current === mode) return
    if (mode !== 'shadow' && !enrolledAgentIds.has(agentId)) {
      setPendingEnrollment({ agentId, targetMode: mode })
      return
    }
    setModes((value) => ({ ...value, [agentId]: mode }))
  }

  const confirmEnrollment = () => {
    if (!pendingEnrollment) return
    const { agentId, targetMode } = pendingEnrollment
    setModes((value) => ({ ...value, [agentId]: targetMode }))
    setEnrolledAgentIds((value) => new Set(value).add(agentId))
    setPendingEnrollment(null)
  }

  const advanceFinding = (findingId: string, actionMode: ManagementMode) => {
    if (paused) return
    const finding = FINDINGS.find((candidate) => candidate.id === findingId)
    if (!finding) return
    const current = findingStates[findingId] ?? finding.state
    const next =
      current === 'testing' && actionMode === 'full' && finding.risk === 'low'
        ? 'applied'
        : NEXT_FINDING_STATE[current]
    setFindingStates((value) => ({ ...value, [findingId]: next }))
  }

  const saveGuidance = () => {
    const value = guidance.trim()
    if (!value) return
    setGuidanceEntries((entries) => (entries.includes(value) ? entries : [value, ...entries]))
    setGuidanceSaved(true)
  }

  const saveOutcomes = (entitlementTarget: number, costAvoidedTarget: number) => {
    setMetrics((current) =>
      current.map((metric): OutcomeMetric => {
        if (metric.id === 'entitlement-consumption' && metric.target !== undefined) {
          return {
            id: metric.id,
            label: metric.label,
            current: metric.current,
            format: metric.format,
            target: entitlementTarget,
          }
        }
        if (metric.id === 'cost-avoided' && metric.target !== undefined) {
          return {
            id: metric.id,
            label: metric.label,
            current: metric.current,
            format: metric.format,
            target: costAvoidedTarget,
          }
        }
        return metric
      }),
    )
  }

  const activityDisabledReason = (change: Change): string | null => {
    if ((modes[change.agentId] ?? 'shadow') !== 'shadow') return null
    return `${change.agentName} is in Shadow mode. Change its authority in Outcomes to continue.`
  }

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab)
    if (nextTab === 'Activity') setSelectedCycleId(CYCLES[0].id)
    if (screenRef.current) screenRef.current.scrollTop = 0
  }

  const enrollmentAgent = pendingEnrollment
    ? agents.find((agent) => agent.id === pendingEnrollment.agentId)
    : undefined

  return (
    <div
      ref={screenRef}
      data-testid="screen-agent-pipeline"
      className="h-full overflow-y-auto rounded-[26px] bg-white"
    >
      <PageHeader
        title="Agent Governance"
        tabs={TABS}
        activeTab={tab}
        onTabChange={changeTab}
        tablistLabel="Agent management views"
        actions={
          <Button variant="outline" size="sm" onClick={() => setPaused(!paused)}>
            {paused ? 'Resume loop' : 'Pause loop'}
          </Button>
        }
      />

      <div className="px-16 pb-16">
        {tab === 'Direction' ? (
          <CockpitOverview
            agents={agents}
            metrics={metrics}
            modes={modes}
            findingStates={findingStates}
            selectedAgentId={selectedAgentId}
            selectedFindingId={selectedFindingId}
            guidance={guidance}
            guidanceSaved={guidanceSaved}
            actionsPaused={paused}
            onGuidanceChange={(value) => {
              setGuidance(value)
              setGuidanceSaved(false)
            }}
            onSaveGuidance={saveGuidance}
            onSaveOutcomes={saveOutcomes}
            onSelectAgent={selectAgent}
            onSelectFinding={selectFinding}
            onRequestMode={requestMode}
            onAdvanceFinding={advanceFinding}
            onCloseAgent={() => {
              setSelectedAgentId(null)
              setSelectedFindingId(null)
            }}
          />
        ) : null}

        {tab === 'Activity' ? (
          <div className="flex flex-col gap-5">
            <LoopDiagram
              loop={LOOP}
              cycle={selectedCycle}
              counts={counts}
              paused={paused}
              totalCycles={TOTAL_CYCLES}
              managedCount={activeAgents.length}
              memoryTried={memory.length}
              memoryRuledOut={memoryRuledOut}
            />
            <SessionActivity events={sessionActivity} />
            <ApprovalInbox
              changes={held}
              disabled={paused}
              getDisabledReason={activityDisabledReason}
              onDecide={(changeId, decision) => {
                if (!paused) decide(changeId, decision)
              }}
            />
            <ActivityExperiments
              changes={experiments}
              decisions={decisions}
              disabled={paused}
              getDisabledReason={activityDisabledReason}
              onAdvance={(changeId, decision) => {
                if (!paused) decide(changeId, decision)
              }}
            />
            <CycleLog
              cycles={CYCLES}
              totalCycles={TOTAL_CYCLES}
              changes={ALL_CHANGES}
              memory={MEMORY}
              decisions={decisions}
              selectedId={selectedCycleId}
              onSelect={setSelectedCycleId}
            />
          </div>
        ) : null}

        {tab === 'Memory' ? (
          <AccountMemoryView
            entries={memory}
            guidanceEntries={guidanceEntries}
            onReconsider={reconsider}
          />
        ) : null}
      </div>

      {pendingEnrollment && enrollmentAgent ? (
        <EnrollmentDialog
          agent={enrollmentAgent}
          targetMode={pendingEnrollment.targetMode}
          onConfirm={confirmEnrollment}
          onCancel={() => setPendingEnrollment(null)}
        />
      ) : null}
    </div>
  )
}
