// The scripted conversation that produces the plan, transcribed from the New
// Agent frames. Two exchanges: a diagnosis that names the coverage gap and asks
// permission, then the proposal, ending on the "Review plan" artifact card.
// There is no matcher and no model here — this is the whole conversation.
import type { AiConversationSeed, AiMessage } from '../ai-context-registry'

export const BUILD_AGENT_TITLE = 'Build a Service Cancellation agent'

// Authored: the frames only ever draw the disclosure collapsed, so these are the
// steps the diagnosis would have taken, written to be checkable rather than
// impressive.
const DIAGNOSIS_THINKING = [
  'Read 30 days of ticket data across Widget, Voice and Email.',
  'Grouped unresolved tickets by intent, then ranked by volume × handle time.',
  'Compared each intent against the agents that already cover it.',
]

const PROPOSAL_THINKING = [
  'Drafted the policy from the cancellation tickets that escalated to a human.',
  'Checked which actions already exist in your catalogue and which have to be created.',
  'Estimated deflection from agents with a similar shape.',
]

export const BUILD_AGENT_CONVERSATION: AiConversationSeed = {
  title: BUILD_AGENT_TITLE,
  messages: [
    {
      id: 'plan-user-1',
      role: 'user',
      text: "Analyze my ticket data from the last 30 days and tell me what’s standing out",
    },
    {
      id: 'plan-assistant-1',
      role: 'assistant',
      thinking: DIAGNOSIS_THINKING,
      text:
        "Hi! I’ve finished analyzing your support ticket data from the past 30 days. Here’s what’s standing out:\n\n" +
        "Your Refund Request agent is deflecting well at 71%, but cancellation requests are being handled entirely by human agents — that’s a significant coverage gap.\n\n" +
        'I can investigate and build a new AI plan for you. Would you like me to do that?',
    },
    { id: 'plan-user-2', role: 'user', text: 'Yes, build me a plan.' },
    {
      id: 'plan-assistant-2',
      role: 'assistant',
      thinking: PROPOSAL_THINKING,
      text:
        "Got it — I’ve built out a full proposal. It covers the agent description, policy guardrails, all the API actions it’ll need, the tools running under the hood, and a step-by-step breakdown of the AI logic.",
      attachments: [
        { type: 'plan', title: 'Service cancellation', subtitle: 'New agent plan', actionLabel: 'Review plan' },
      ],
    },
  ],
}

// Ask for changes: one prefill and one reply. Pretending to parse the request
// would imply a capability that is not there (spec Decision 10).
export const ASK_FOR_CHANGES_PREFILL = 'Change the retention offer to…'

// What the revision is doing while the reply is on its way. Two lines rather
// than three: it is a smaller piece of work than the diagnosis that opened the
// conversation, and the block should read that way.
export const ASK_FOR_CHANGES_THINKING = [
  'Reworked the retention offer and the steps that quote it.',
  'Re-checked the policy guardrails against the new offer.',
]

export const ASK_FOR_CHANGES_REPLY =
  "Updated the plan — I’ve reworked the retention offer and the steps that depend on it. The Plan overview and Agent sections are marked as updated, so give them another read before you approve."

export function agentCreatedMessage(agentId: string, agentName: string): AiMessage {
  return {
    id: `plan-created-${agentId}`,
    role: 'assistant',
    text: `Done — ${agentName} exists as a draft. It isn’t taking traffic yet, so open it to review the policy or run a test suite against it first.`,
    attachments: [
      {
        type: 'agent-created',
        agentName,
        agentId,
        status: 'Draft — not taking traffic',
        openLabel: 'Open in Agent Builder',
        testLabel: 'Run a test',
      },
    ],
  }
}
