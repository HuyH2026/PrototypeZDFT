// The Autoflow policy editor screen (/ai-agents/:agentId). One DndProvider over
// the header, the policy editor + block canvas (center), and the Steps palette
// (right). Unknown ids redirect to the list. Edits persist via the agent store.
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  appendBlock,
  createCanvasBlock,
  nextBlockOrdinal,
  policyToText,
  useAgentStore,
} from '../agent-store'
import type { ChannelKey } from '../agent-builder-data'
import { UseCasePreview } from '../preview/UseCasePreview'
import { summarizeTags } from '../configuration/config-data'
import { EditorHeader } from './EditorHeader'
import { PolicyEditor } from './PolicyEditor'
import { BlockCanvas } from './BlockCanvas'
import { StepsPalette } from './StepsPalette'
import { InsightsPanel } from './InsightsPanel'
import { EditorRail, type RailKey, type VoiceRailKey } from './EditorRail'
import { AiStudioFullView } from './AiStudioFullView'
import { InlinePolicyPreview } from './InlinePolicyPreview'
import { EDITOR_COLUMN_W, VOICE_STEP_TYPES } from './editor-data'
import { AI_STUDIO_WORKING_MS } from './ai-studio-data'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { usePolicyReviewRequest } from './policy-ai-request-store'
import { getImprovementPlan } from '@/features/ai-studio/self-improving/self-improving-data'

export function AgentEditorScreen() {
  const { agentId = '' } = useParams()
  const navigate = useNavigate()
  const store = useAgentStore()
  const agent = store.getAgent(agentId)
  const { isOpen, context, open, close } = useAiAssistant()
  const reviewRequest = usePolicyReviewRequest()

  const [channel, setChannel] = useState<ChannelKey>(agent?.channel ?? 'widget')
  // The far-right rail drives the right panel. "steps" shows the palette,
  // "ai" shows the AI Studio assistant; any other selection hides it (those
  // panels are unspecced/empty).
  const [rail, setRail] = useState<RailKey>('steps')
  // Voice gets its own rail (different items entirely), tracked separately —
  // like Configuration's per-channel section state — so switching channels
  // can't strand the highlight on an id the other rail doesn't have.
  // Voice defaults to the Steps panel (its rail's "comps"/layers item), which
  // is what the Voice policy detail frame shows open (143:163114).
  const [voiceRail, setVoiceRail] = useState<VoiceRailKey>('comps')
  // Whether the AI Studio "Review plan" full-screen takeover is open.
  const [reviewing, setReviewing] = useState(false)
  // Whether the preview overlay is open. Deliberately not named `showPreview` —
  // that already means the inline policy diff further down this file.
  const [previewing, setPreviewing] = useState(false)
  const workingTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const handledReviewRequest = useRef(reviewRequest)
  const openedPolicyAssistant = useRef(false)

  useEffect(() => {
    if (reviewRequest === handledReviewRequest.current) return
    handledReviewRequest.current = reviewRequest
    setReviewing(true)
  }, [reviewRequest])

  useEffect(
    () => () => {
      clearTimeout(workingTimer.current)
      if (openedPolicyAssistant.current) close()
    },
    [close],
  )

  if (!agent) return <Navigate to="/agent-builder/use-cases" replace />

  // When an agent has a self-improving plan, the Insights panel shows plan-driven
  // health stats; otherwise it falls back to generic content (InsightsPanel).
  const improvementPlan = getImprovementPlan(agent.id)

  // Closing the shared assistant can happen outside this screen. Treat that as
  // the default Steps selection without a synchronizing state update; choosing
  // AI again still reopens the assistant through handleRailSelect.
  const visibleRail =
    channel === 'voice' ? voiceRail : rail === 'ai' && !isOpen ? 'steps' : rail

  // Once the plan is approved (and the "Working…" delay elapses), the policy
  // area is replaced by the inline accept/reject diff preview. Persisted on the
  // agent so it survives reload / navigation until the changes are resolved.
  const showPreview = agent.previewPending ?? false

  // User typed "Approve" in the full view: keep the takeover up (showing the
  // "Working…" indicator) for a beat, then close it and reveal the diff preview.
  const handleApprove = () => {
    clearTimeout(workingTimer.current)
    workingTimer.current = setTimeout(() => {
      setReviewing(false)
      store.updateAgent(agent.id, { previewPending: true })
    }, AI_STUDIO_WORKING_MS)
  }

  const handleRailSelect = (nextRail: RailKey | VoiceRailKey) => {
    if (channel === 'voice') {
      setVoiceRail(nextRail as VoiceRailKey)
      return
    }
    setRail(nextRail as RailKey)
    if (nextRail === 'ai') {
      openedPolicyAssistant.current = true
      open('service-cancellation-policy', 'panel')
    } else if (isOpen && context.scope === 'service-cancellation-policy') {
      close()
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div data-testid="view-agent-editor" className="flex h-full flex-col">
        <EditorHeader
          title={agent.name}
          version="Version 001"
          channel={channel}
          onChannelChange={setChannel}
          onBack={() => navigate('/agent-builder/use-cases')}
          onTitleChange={(name) => store.updateAgent(agent.id, { name })}
          onPreview={() => setPreviewing(true)}
        />
        {/* The tool rail floats over the right edge of the content area instead of
            taking a column out of it, because the design centres the document
            column in the *whole* area: with no panel open the column sits at the
            area's midpoint, rail included (Figma 1886:74637). Panels reserve the
            rail's width themselves (`me-[72px]` = 64px rail + the 8px the design
            leaves outside it). */}
        <div className="relative flex flex-1 overflow-hidden py-2">
          {/* px-4 is the gutter the design leaves at the content area's edge (the
              inline preview's banner sits on it); the column centres inside it. */}
          <div className="flex flex-1 flex-col overflow-y-auto px-4">
            {showPreview ? (
              <InlinePolicyPreview />
            ) : (
              // The design's column is 668px; below the width that needs, it
              // gives way rather than sliding under the docked panel.
              <div style={{ maxWidth: EDITOR_COLUMN_W }} className="mx-auto w-full">
                <PolicyEditor
                  doc={agent.policy}
                  onChange={(policy) => store.updateAgent(agent.id, { policy })}
                />
                <BlockCanvas
                  blocks={agent.blocks}
                  onChange={(blocks) => store.updateAgent(agent.id, { blocks })}
                />
              </div>
            )}
          </div>
          {(visibleRail === 'steps' || (channel === 'voice' && visibleRail === 'comps')) && (
            <StepsPalette
              // Voice docks the same Steps panel but with its own step set
              // (Condition / Nested Policy / GoTo / Text / Code / Say).
              steps={channel === 'voice' ? VOICE_STEP_TYPES : undefined}
              onClose={() => (channel === 'voice' ? setVoiceRail('insights') : setRail('outline'))}
              onAddStep={(stepType) =>
                store.updateAgent(agent.id, {
                  blocks: appendBlock(
                    agent.blocks,
                    createCanvasBlock(stepType, nextBlockOrdinal(agent.blocks)),
                  ),
                })
              }
            />
          )}
          {visibleRail === 'insights' && (
            <InsightsPanel
              plan={improvementPlan}
              onClose={() => (channel === 'voice' ? setVoiceRail('comps') : setRail('outline'))}
            />
          )}
          <EditorRail
            channel={channel}
            selected={visibleRail}
            onSelect={handleRailSelect}
          />
        </div>
      </div>
      {reviewing && (
        <AiStudioFullView onClose={() => setReviewing(false)} onApprove={handleApprove} />
      )}
      {/* Scoped to this use case: the overlay tests questions against *this*
          policy rather than the channel's whole router. Built fresh on each open
          so an edit made since the last preview is the one being tested. */}
      {previewing && (
        <UseCasePreview
          channel={channel}
          useCase={{
            name: agent.name,
            live: agent.on,
            policyText: policyToText(agent.policy),
            triggerPhrases: agent.triggerPhrases,
            segmentScope: agent.allSegments
              ? 'all segments'
              : summarizeTags(agent.tags) || 'no segments',
          }}
          onClose={() => setPreviewing(false)}
        />
      )}
    </DndProvider>
  )
}
