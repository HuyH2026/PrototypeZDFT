// The self-improving flow: the scripted survey, the plan panel beside it, and the
// one write in the whole feature. State lives here rather than in
// AiAssistantHost so the host stays a router, but the ownership rule is the
// spec's: this component unmounts with the studio, so closing the studio
// abandons an *unapproved* plan. An approved one is written on the click, so no
// close gesture can take it back.
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AiStudioConversation } from '../AiStudioConversation'
import type { StudioFlowScope } from '../ai-studio-landing-data'
import type { AiAttachmentAction, AiConversationSeed } from '../ai-context-registry'
import { SelfImprovingCanvas } from './SelfImprovingCanvas'
import { improvementReviewReducer, INITIAL_IMPROVEMENT_REVIEW } from './improvement-review-state'
import {
  activePlanFromImprovementPlan,
  improvementTraceLines,
  IMPROVEMENT_TRACE_STEP_MS,
  type ActiveImprovementPlan,
} from './self-improving-approval'
import {
  improvementActiveMessage,
  SELF_IMPROVING_CONVERSATION,
} from './self-improving-conversation'
import { PASSWORD_RESET_PLAN, type ImprovementSectionKey } from './self-improving-data'
import { useSelfImprovementPlans } from './self-improvement-store'

type Phase = 'review' | 'activating' | 'active'

const plan = PASSWORD_RESET_PLAN
const TRACE_LENGTH = improvementTraceLines(plan).length

export function SelfImprovingFlow({
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
  const [state, dispatch] = useReducer(improvementReviewReducer, INITIAL_IMPROVEMENT_REVIEW)
  const [panelOpen, setPanelOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('review')
  const [traceStep, setTraceStep] = useState(0)
  const [active, setActive] = useState<ActiveImprovementPlan | null>(null)

  const navigate = useNavigate()
  const { activatePlan } = useSelfImprovementPlans()
  const writtenRef = useRef(false)

  // The trace clock, and nothing else: the canvas renders the first `traceStep`
  // lines, so stepping one past the last is what gives that line its own 600ms of
  // dwell. Depending only on the phase and the step keeps an unrelated re-render
  // from re-identifying the effect and restarting the pending step.
  useEffect(() => {
    if (phase !== 'activating') return
    if (traceStep > TRACE_LENGTH) return
    const timer = setTimeout(() => setTraceStep((step) => step + 1), IMPROVEMENT_TRACE_STEP_MS)
    return () => clearTimeout(timer)
  }, [phase, traceStep])

  // The write is already done by the time the trace ends (see approve), so all
  // that is left is to put the panel away and post the confirmation.
  useEffect(() => {
    if (phase !== 'activating') return
    if (traceStep <= TRACE_LENGTH) return
    setPanelOpen(false)
    setPhase('active')
  }, [phase, traceStep])

  // The write happens on the click, not when the trace finishes: the trace only
  // narrates what has already been committed, so a user who approves and then
  // closes the panel — or the studio — inside those 2.4s still has the plan. The
  // ref is load-bearing: the artifact card stays in the transcript, so reopening
  // the panel gives activating === false with canApprove still true, which
  // re-enables Approve.
  const approve = useCallback(() => {
    if (writtenRef.current) return
    writtenRef.current = true

    const built = activePlanFromImprovementPlan(plan)
    activatePlan(built)
    setActive(built)
    setPhase('activating')
    setTraceStep(1)
  }, [activatePlan])

  // Esc closes the plan first and the studio second: a user reading a diagnosis
  // must not lose the whole conversation to one keystroke.
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

  const handleAttachmentAction = useCallback(
    (action: AiAttachmentAction) => {
      // Both the artifact card and the confirmation card open the same panel.
      if (action.kind === 'review-plan' || action.kind === 'view-improvement-plan') {
        setPanelOpen(true)
      }
      if (action.kind === 'open-agent') {
        navigate(`/agent-builder/${action.agentId}`)
        onClose()
      }
    },
    [navigate, onClose],
  )

  // The plan is active from the moment of approval, but the card announcing it
  // waits for the trace to finish narrating: the conversation must not report the
  // activation as done while the panel is still listing what it is doing.
  const activeMessages =
    active && phase === 'active' ? [improvementActiveMessage(active)] : undefined

  return (
    <AiStudioConversation
      onClose={onClose}
      onNewConversation={onNewConversation}
      onBranch={onBranch}
      conversation={SELF_IMPROVING_CONVERSATION}
      extraMessages={activeMessages}
      onAttachmentAction={handleAttachmentAction}
      onStartFlow={onStartFlow}
      panel={
        panelOpen ? (
          <SelfImprovingCanvas
            plan={plan}
            state={state}
            activating={phase === 'activating'}
            traceStep={traceStep}
            onToggleSection={(section: ImprovementSectionKey) =>
              dispatch({ type: 'toggle', section })
            }
            onApprove={approve}
            onClose={() => setPanelOpen(false)}
          />
        ) : undefined
      }
    />
  )
}
