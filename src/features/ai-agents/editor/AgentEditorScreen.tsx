// The Autoflow policy editor screen (/ai-agents/:agentId). One DndProvider over
// the header, the policy editor + block canvas (center), and the Steps palette
// (right). Unknown ids redirect to the list. Edits persist via the agent store.
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAgentStore } from '../agent-store'
import type { ChannelKey } from '../agent-builder-data'
import { EditorHeader } from './EditorHeader'
import { PolicyEditor } from './PolicyEditor'
import { BlockCanvas } from './BlockCanvas'
import { StepsPalette } from './StepsPalette'
import { EditorRail, type RailKey } from './EditorRail'
import { AiStudioEditorPanel } from './AiStudioEditorPanel'
import { AiStudioFullView } from './AiStudioFullView'
import { InlinePolicyPreview } from './InlinePolicyPreview'
import { AI_STUDIO_WORKING_MS } from './ai-studio-data'

export function AgentEditorScreen() {
  const { agentId = '' } = useParams()
  const navigate = useNavigate()
  const store = useAgentStore()
  const agent = store.getAgent(agentId)

  const [channel, setChannel] = useState<ChannelKey>(agent?.channel ?? 'widget')
  // The far-right rail drives the right panel. "steps" shows the palette,
  // "ai" shows the AI Studio assistant; any other selection hides it (those
  // panels are unspecced/empty).
  const [rail, setRail] = useState<RailKey>('steps')
  // Whether the AI Studio "Review plan" full-screen takeover is open.
  const [reviewing, setReviewing] = useState(false)
  const workingTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  if (!agent) return <Navigate to="/ai-agents" replace />

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div data-testid="view-agent-editor" className="flex h-full flex-col">
        <EditorHeader
          title={agent.name}
          version="Version 001"
          channel={channel}
          onChannelChange={setChannel}
          onBack={() => navigate('/ai-agents')}
          onTitleChange={(name) => store.updateAgent(agent.id, { name })}
        />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 gap-6 overflow-hidden p-8">
            <div className="flex-1 overflow-y-auto">
              {showPreview ? (
                <InlinePolicyPreview />
              ) : (
                <>
                  <PolicyEditor doc={agent.policy} onChange={(policy) => store.updateAgent(agent.id, { policy })} />
                  <BlockCanvas blocks={agent.blocks} onChange={(blocks) => store.updateAgent(agent.id, { blocks })} />
                </>
              )}
            </div>
            {rail === 'steps' && <StepsPalette onClose={() => setRail('outline')} />}
            {rail === 'ai' && (
              <AiStudioEditorPanel
                onClose={() => setRail('steps')}
                onReview={() => setReviewing(true)}
              />
            )}
          </div>
          <EditorRail selected={rail} onSelect={setRail} />
        </div>
      </div>
      {reviewing && <AiStudioFullView onClose={() => setReviewing(false)} onApprove={handleApprove} />}
    </DndProvider>
  )
}
