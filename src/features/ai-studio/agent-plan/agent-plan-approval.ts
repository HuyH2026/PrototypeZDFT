// Pure plan → agent mapping, run once when the user approves. Everything it
// returns goes straight into agent-store's createAgent; nothing here touches
// React or storage, so the mapping is unit-tested on its own.
import {
  blockAnswerField,
  blockPromptField,
  overviewDescriptionField,
  resolveEdit,
  type AgentPlan,
} from './agent-plan-data'
import {
  POLICY_TITLE,
  nextId,
  type CanvasBlock,
  type CreateAgentFields,
  type PolicyDoc,
  type PolicySegment,
} from '@/features/ai-agents/agent-store'

// Authored, not derived: the plan document has no utterances in it, and the
// agent record wants the phrases a customer would actually type.
export const PLAN_TRAINING_PHRASES = [
  'I want to cancel',
  'cancel my subscription',
  'how do I cancel my plan',
]
export const PLAN_TAGS = ['Cancellation', 'Retention']

export function buildAgentFromPlan(
  plan: AgentPlan,
  edits: Record<string, string>,
): { fields: CreateAgentFields; policy: PolicyDoc; blocks: CanvasBlock[] } {
  const segments: PolicySegment[] = []
  const blocks: CanvasBlock[] = []

  for (const node of plan.agent.policy) {
    if (node.kind === 'run') {
      segments.push(...node.segments)
      continue
    }
    const { block } = node
    const prompt = resolveEdit(edits, blockPromptField(node.id), block.prompt)
    const answers = (block.answers ?? []).map((answer, index) =>
      resolveEdit(edits, blockAnswerField(node.id, index), answer),
    )
    blocks.push({
      id: nextId('b'),
      stepType: block.stepType,
      title: block.canvasTitle,
      // Collapsed, like every block the palette creates: only a condition block
      // has a body in the editor, so an expanded form or options card would show
      // nothing but its own header.
      collapsed: true,
      subtitle: prompt,
      ...(answers.length > 0
        ? { rows: answers.map((label) => ({ id: nextId('r'), label })) }
        : {}),
    })
  }

  const firstStep = plan.overview[0]

  return {
    fields: {
      name: plan.agentName,
      channel: 'widget',
      allSegments: true,
      tags: PLAN_TAGS,
      // The one edited field with somewhere to land: step 01's description reads
      // as a trigger condition ("Detects when a customer truly wants to cancel").
      customerRequest: resolveEdit(
        edits,
        overviewDescriptionField(firstStep),
        firstStep.description,
      ),
      triggerPhrases: PLAN_TRAINING_PHRASES,
    },
    policy: { title: POLICY_TITLE, segments },
    blocks,
  }
}
