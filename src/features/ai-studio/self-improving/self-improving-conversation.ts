// The scripted conversation that produces the self-improving plan, transcribed
// from the Self-Improving agent frames. Two exchanges: a survey of every agent
// that names one failing agent and asks permission, then the proposal, ending on
// the "Review plan" artifact card. There is no matcher and no model here — this
// is the whole conversation.
import type { AiConversationSeed, AiMessage } from '../ai-context-registry'
import type { ActiveImprovementPlan } from './self-improving-approval'

export const SELF_IMPROVING_TITLE = 'Check agent health'

// Authored: the frames only ever draw the disclosure collapsed, so these are the
// steps the survey would have taken, written to be checkable rather than
// impressive.
const SURVEY_THINKING = [
  'Scored every agent on the six health signals over the last 30 days.',
  'Ranked them by distance from target, weighted by conversation volume.',
  'Checked whether the drop looked like drift or a step change.',
]

const PROPOSAL_THINKING = [
  'Grouped the fallback transcripts by the phrasing the intent map missed.',
  'Separated SSO users from password users to see which instructions were wrong.',
  'Ordered the fixes by blast radius, so the reversible ones come first.',
]

export const SELF_IMPROVING_CONVERSATION: AiConversationSeed = {
  title: SELF_IMPROVING_TITLE,
  messages: [
    {
      id: 'si-user-1',
      role: 'user',
      text: 'I wanted to check in on how our AI agents are doing. Are any of them struggling?',
    },
    {
      id: 'si-assistant-1',
      role: 'assistant',
      thinking: SURVEY_THINKING,
      text:
        'I’ve been keeping an eye on your agents, and it looks like Agent ‘Password Reset’ could use some attention. It’s not quite hitting the mark in the past 30 days.\n\n' +
        // All six set uniformly: the frame bolds four of them with no rule behind
        // which four.
        '• Health score → Critical\n' +
        '• Deflection rate → 34%\n' +
        '• CSAT → 1.3\n' +
        '• Sentiment → Negative\n' +
        '• Handle time → 8+ min\n' +
        '• Fallback rate → 58%\n\n' +
        'That’s well beyond normal drift — something structural appears to have broken. I can investigate what’s causing the drop and build an AI self-improving plan for you. Would you like me to do that?',
    },
    { id: 'si-user-2', role: 'user', text: 'Yes, show me the full plan.' },
    {
      id: 'si-assistant-2',
      role: 'assistant',
      thinking: PROPOSAL_THINKING,
      text:
        'Here’s the self-improving plan for Password Reset: it includes the full health scorecard, a 4-week phased roadmap, live monitoring, scheduled check-ins, and guardrails for autonomous changes.\n\n' +
        'If all actions are enabled, expected recovery to a health score of 70+ is 3–4 weeks.',
      attachments: [
        {
          type: 'plan',
          title: 'Self-improving Agent plan for Password Reset',
          subtitle: 'Self-improving plan',
          actionLabel: 'Review plan',
        },
      ],
    },
  ],
}

// The confirmation posted once the plan is active. Every number in it comes from
// the store's derived record, so the transcript and the store cannot disagree.
export function improvementActiveMessage(active: ActiveImprovementPlan): AiMessage {
  return {
    id: `improvement-active-${active.agentId}`,
    role: 'assistant',
    text: `Done — ${active.agentName} is on a self-improving plan. ${active.stage} is running now, and I’ll hold the changes that need your approval until you’ve looked at them. Next check-in: ${active.nextCheckIn}.`,
    attachments: [
      {
        type: 'improvement-active',
        agentName: active.agentName,
        agentId: active.agentId,
        status: `${active.weekLabel} · ${active.autoApplied} auto-fixes live · ${active.awaitingApproval} changes awaiting approval`,
        viewLabel: 'View plan',
        openLabel: 'Open in Agent Builder',
      },
    ],
  }
}
