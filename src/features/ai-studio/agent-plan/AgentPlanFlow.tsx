// The create-agent flow: the scripted conversation, the plan panel beside it, and
// the one write in the whole feature. State lives here rather than in
// AiAssistantHost so the host stays a router, but the ownership rule is the
// spec's: this component unmounts with the studio, so closing the studio
// abandons an *unapproved* plan. An approved one is written on the click, so no
// close gesture can take it back.
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useBrands } from '@/app/brand-context'
import { useAgentStore } from '@/features/ai-agents/agent-store'
import { useAgentRoster } from '@/features/manage-agents/agent-roster-store'
import { AiStudioConversation } from '../AiStudioConversation'
import type { StudioFlowScope } from '../ai-studio-landing-data'
import type { AiAttachmentAction, AiConversationSeed, AiFollowUp } from '../ai-context-registry'
import { AGENT_PLAN, type PlanSectionKey } from './agent-plan-data'
import { AgentPlanCanvas } from './AgentPlanCanvas'
import { buildAgentFromPlan } from './agent-plan-approval'
import {
  ASK_FOR_CHANGES_PREFILL,
  ASK_FOR_CHANGES_REPLY,
  ASK_FOR_CHANGES_THINKING,
  BUILD_AGENT_CONVERSATION,
  agentCreatedMessage,
} from './agent-plan-conversation'
import { BUILD_TRACE, BUILD_TRACE_STEP_MS } from './plan-build-trace'
import { INITIAL_PLAN_REVIEW, planReviewReducer } from './plan-review-state'

type Phase = 'review' | 'building' | 'created'

export function AgentPlanFlow({
  onClose,
  onNewConversation,
  onBranch,
  onStartFlow,
}: {
  onClose: () => void
  onNewConversation: () => void
  onBranch: (seed: AiConversationSeed) => void
  onStartFlow?: (scope: StudioFlowScope) => void
}) {
  const [state, dispatch] = useReducer(planReviewReducer, INITIAL_PLAN_REVIEW)
  const [panelOpen, setPanelOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('review')
  const [traceStep, setTraceStep] = useState(0)
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null)
  const [composer, setComposer] = useState('')
  // Only the send that follows "Ask for changes" is treated as a change request.
  // Everything else keeps the canned acknowledgement — there is no matcher here.
  const [changesPending, setChangesPending] = useState(false)

  const navigate = useNavigate()
  const { createAgent } = useAgentStore()
  const { createAgent: createRosterAgent } = useAgentRoster()
  const { brands, currentBrand } = useBrands()
  const writtenRef = useRef(false)

  // The trace clock, and nothing else: the canvas renders BUILD_TRACE.slice(0,
  // traceStep), so stepping one past the last line is what gives that line its
  // own 600ms of dwell instead of a single commit. The whole trace therefore
  // spans BUILD_TRACE_TOTAL_MS. Depending only on the phase and the step keeps
  // any unrelated re-render from re-identifying the effect and restarting the
  // pending step.
  useEffect(() => {
    if (phase !== 'building') return
    if (traceStep > BUILD_TRACE.length) return
    const timer = setTimeout(() => setTraceStep((step) => step + 1), BUILD_TRACE_STEP_MS)
    return () => clearTimeout(timer)
  }, [phase, traceStep])

  // The write is already done by the time the trace ends (see approve), so all
  // that is left once the last line has had its dwell is to put the panel away
  // and post the created card.
  useEffect(() => {
    if (phase !== 'building') return
    if (traceStep <= BUILD_TRACE.length) return
    setPanelOpen(false)
    setPhase('created')
  }, [phase, traceStep])

  // The write happens on the click, not when the trace finishes: the trace only
  // narrates what has already been committed. Writing at the end meant a user
  // who approved and then closed the panel — or the studio — inside those 2.4s
  // silently got no agent. The ref is load-bearing, not a nicety: the artifact
  // card stays in the transcript, so reopening the panel after creation gives
  // building === false with canApprove still true, which re-enables Approve.
  // Only the ref stops a second agent — and stops the phase === 'created' gate
  // retracting the created card.
  const approve = useCallback(() => {
    if (writtenRef.current) return
    writtenRef.current = true

    const built = buildAgentFromPlan(AGENT_PLAN, state.edits)
    const id = createAgent({
      ...built.fields,
      policy: built.policy,
      blocks: built.blocks,
      on: false,
    })
    // Without the roster write the agent would exist in Agent Builder but not on
    // the screen that claims to list every agent. All-brands scope falls back to
    // the first brand, since a roster row must belong to one.
    const brandId = currentBrand?.id ?? brands[0]?.id
    if (brandId) {
      createRosterAgent({ brandId, name: AGENT_PLAN.agentName, channels: ['Web Widget'] })
    }

    setCreated({ id, name: AGENT_PLAN.agentName })
    setPhase('building')
    setTraceStep(1)
  }, [state.edits, createAgent, createRosterAgent, brands, currentBrand])

  // Esc closes the plan first and the studio second: a user reviewing a plan must
  // not lose the whole conversation to one keystroke.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (panelOpen) {
        setPanelOpen(false)
        return
      }
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [panelOpen, onClose])

  const leaveFor = useCallback(
    (path: string) => {
      navigate(path)
      onClose()
    },
    [navigate, onClose],
  )

  const handleAttachmentAction = useCallback(
    (action: AiAttachmentAction) => {
      if (action.kind === 'review-plan') setPanelOpen(true)
      if (action.kind === 'open-agent') leaveFor(`/agent-builder/${action.agentId}`)
      if (action.kind === 'run-test') leaveFor('/experiment/test-suite')
    },
    [leaveFor],
  )

  const handleUserMessage = useCallback((): AiFollowUp | undefined => {
    if (!changesPending) return undefined
    setChangesPending(false)
    return {
      text: ASK_FOR_CHANGES_REPLY,
      thinking: ASK_FOR_CHANGES_THINKING,
      // The plan is marked updated — and the panel brought back — when the reply
      // lands, not when the request is sent: a panel that reopens with its
      // sections already flagged has announced the revision before the assistant
      // has finished making it.
      onReveal: () => {
        dispatch({ type: 'requested-changes' })
        setPanelOpen(true)
      },
    }
  }, [changesPending])

  const askForChanges = useCallback(() => {
    setPanelOpen(false)
    setChangesPending(true)
    setComposer(ASK_FOR_CHANGES_PREFILL)
  }, [])

  // The agent exists from the moment of approval, but the card announcing it
  // waits for the trace to finish narrating: the conversation must not report the
  // build as done while the panel is still listing what it is doing.
  const createdMessages =
    created && phase === 'created' ? [agentCreatedMessage(created.id, created.name)] : undefined

  return (
    <AiStudioConversation
      onClose={onClose}
      onNewConversation={onNewConversation}
      onBranch={onBranch}
      conversation={BUILD_AGENT_CONVERSATION}
      extraMessages={createdMessages}
      composerValue={composer}
      onComposerChange={setComposer}
      onUserMessage={handleUserMessage}
      onAttachmentAction={handleAttachmentAction}
      onStartFlow={onStartFlow}
      panel={
        panelOpen ? (
          <AgentPlanCanvas
            state={state}
            building={phase === 'building'}
            traceStep={traceStep}
            onToggleSection={(section: PlanSectionKey) => dispatch({ type: 'toggle', section })}
            onEdit={(fieldId, text, original) =>
              dispatch({ type: 'edit', fieldId, text, original })
            }
            onApprove={approve}
            onAskForChanges={askForChanges}
            onClose={() => setPanelOpen(false)}
            onOpenAction={(actionId) => leaveFor(`/agent-builder/actions/${actionId}`)}
          />
        ) : undefined
      }
    />
  )
}
