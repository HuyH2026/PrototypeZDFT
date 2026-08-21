// Data-only registry mapping an assistant "scope" to its primed copy: the
// greeting shown at the top of the panel, an optional composer prefill, and
// optional suggestion chips. Contextual triggers pass a scope so the shared
// assistant opens pre-primed; the global trigger uses `default`. No JSX here —
// scope-specific rich bodies (topics carousel, Manage agents steps) live in ./bodies and
// are selected by the host on scope.
export type AiScope =
  | 'default'
  | 'manage-agents'
  | 'brand-setup'
  | 'home'
  | 'build-dashboard'
  | 'insights'
  | 'cx-journey'
  | 'ai-performances'
  | 'ai-performance-reopens'
  | 'ai-performance-csat'
  | 'ai-performance-escalations'
  | 'agent-builder'
  | 'service-cancellation-policy'
  | 'knowledge-emerging-topic'
  | 'build-agent'
  | 'configuration'
  | 'qa'
  | 'tools'
  | 'orchestrator'
  | 'log'
  | 'ab-test'
  | 'self-improving'

export type AiAttachment =
  | {
      type: 'chart'
      title: string
      series: { x: string; value: number }[]
      annotation?: string
      peak?: string
      color?: string
    }
  | {
      type: 'list'
      title: string
      items: string[]
      footnote?: string
    }
  | {
      type: 'breakdown'
      title: string
      rows: { label: string; value: string }[]
    }
  | {
      type: 'actions'
      title: string
      items: { text: string; tag: string }[]
    }
  | {
      // The artifact card that hands a conversation off to a reviewable plan
      // (Figma 1:183686). Its button is the only way into the plan panel.
      type: 'plan'
      title: string
      subtitle: string
      actionLabel: string
    }
  | {
      // Posted after a plan is approved and the agent has been written.
      type: 'agent-created'
      agentName: string
      agentId: string
      status: string
      openLabel: string
      testLabel: string
    }
  | {
      // Posted once a self-improving plan has been approved and activated. Its
      // status line is composed from the store's derived counts, never authored.
      type: 'improvement-active'
      agentName: string
      agentId: string
      status: string
      viewLabel: string
      openLabel: string
    }

// What a click on an attachment's control means. The conversation view is
// presentational, so it reports the intent and its owner decides what happens.
export type AiAttachmentAction =
  | { kind: 'review-plan' }
  | { kind: 'open-agent'; agentId: string }
  | { kind: 'run-test' }
  | { kind: 'view-improvement-plan' }

export type AiFollowUp = {
  text: string
  // Shown as the live thinking block while the reply is on its way, and behind
  // the collapsed disclosure once it has landed. Unset means the reply thinks
  // for one quiet beat instead — better than inventing reasoning for it.
  thinking?: string[]
  attachments?: AiAttachment[]
  recommendations?: string[]
  // Side effects that belong to the reply rather than to the send that asked for
  // it: the conversation calls this when the message actually lands, after its
  // thinking beat. Data-authored replies leave it unset; the create-agent flow
  // uses it so the plan panel cannot announce a change before the assistant has
  // said it made one.
  onReveal?: () => void
}

export type AiMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  // Scripted reasoning behind an assistant message, shown under a
  // "Thinking complete ›" disclosure (Figma 1:173818).
  thinking?: string[]
  attachments?: AiAttachment[]
  recommendations?: string[]
}

export type AiConversationSeed = {
  title: string
  messages: AiMessage[]
  responses?: Record<string, AiFollowUp>
}

export type AiContext = {
  scope: AiScope
  greeting: string
  prompt?: string
  suggestions?: string[]
  conversation?: AiConversationSeed
}

export const AI_CONTEXTS: Record<AiScope, AiContext> = {
  default: {
    scope: 'default',
    greeting: 'Hello, Sunny 👋 What can I help you with today?',
  },
  'manage-agents': {
    scope: 'manage-agents',
    greeting: "Welcome, Sunny 👋 Let's set up your first agent.",
  },
  'brand-setup': {
    scope: 'brand-setup',
    greeting: "Let's set up this brand.",
    prompt: 'Help me choose the right channels for this brand',
    suggestions: [
      'Which channels should I enable first?',
      'How should I name this agent?',
      'What does resolution rate measure?',
    ],
  },
  home: {
    scope: 'home',
    greeting: "Welcome back, Sunny 👋 Here's what needs your attention today.",
    prompt: 'Summarize what changed across my agents today',
    suggestions: ['What needs approval?', 'Any new knowledge gaps?', 'Show cost trend'],
  },
  // Home's Generate New action. The panel asks its two questions and writes the
  // request itself, so the composer opens empty — it is the way out of the two
  // questions, not a prefilled form.
  'build-dashboard': {
    scope: 'build-dashboard',
    greeting: "Let's design your dashboard 🧬",
    suggestions: [
      'Build me a dashboard for a knowledge manager',
      'Show cost and quality front and center',
      'I want resolution health and anything waiting on my approval',
    ],
  },
  insights: {
    scope: 'insights',
    greeting: 'Let me help you read your insights.',
    prompt: 'Explain the biggest change in my metrics this week',
    suggestions: [
      'What drove resolution rate?',
      'Compare to last month',
      'Where are customers dropping off?',
    ],
  },
  'cx-journey': {
    scope: 'cx-journey',
    greeting: "Let's dig into the customer journey.",
    prompt: 'Where in the journey are customers getting stuck?',
    suggestions: ['Top drop-off points', 'Which topics need automation?', 'Summarize this flow'],
  },
  'ai-performances': {
    scope: 'ai-performances',
    greeting: 'I can help you interpret AI performance.',
    prompt: 'Which agents are underperforming and why?',
    // The first chip starts the self-improving survey (AiAssistantHost routes any
    // health-shaped chip or ask there). This header used to carry a second sparkle
    // for it and lost it — a chip inside the assistant is the progressive form of
    // the same offer. The prefill above is health-shaped too, so sending it does
    // the same thing.
    suggestions: [
      'Are any of my agents struggling?',
      'Compare two conversations',
      'Explain this stat',
      'What should I fix first?',
    ],
  },
  'ai-performance-reopens': {
    scope: 'ai-performance-reopens',
    greeting: "Let's investigate why tickets are being reopened.",
    prompt:
      'Explain why tickets reopened increased by 18% in Billing widget conversations after Policy v2.4',
    suggestions: ['Break down by intent', 'Compare affected agents', 'Show example conversations'],
  },
  'ai-performance-csat': {
    scope: 'ai-performance-csat',
    greeting: "Let's dig into the CSAT drop on Voice.",
    prompt:
      'Explain why Voice-channel CSAT dropped 12% over the last 7 days and whether longer handle times on the "view bank statement" workflow are driving it',
    suggestions: [
      'Break down by intent',
      'Show low-scoring conversations',
      'Compare to Widget CSAT',
    ],
  },
  'ai-performance-escalations': {
    scope: 'ai-performance-escalations',
    greeting: "Let's look at why escalations are rising.",
    prompt:
      'Explain why human-escalation rate increased 22% week over week, focused on the "update profile" intent after the last agent change',
    suggestions: [
      'Break down by intent',
      'Which agent change caused this?',
      'Show escalated conversations',
    ],
  },
  'agent-builder': {
    scope: 'agent-builder',
    greeting: 'Let me help you build and manage agents.',
    prompt: 'Draft a new agent for this channel',
    // As on ai-performances: the health chip is how this header offers the survey
    // now that it carries one AI entry rather than a sparkle per flow.
    suggestions: [
      'Are any of my agents struggling?',
      'Create an agent from a description',
      'Which agents are inactive?',
      'Explain sub-agents',
    ],
  },
  // Explicit contextual entry from the Service cancellation policy editor.
  // It is not route-derived: the editor rail opens it with the policy rewrite
  // request already in the shared panel composer.
  'service-cancellation-policy': {
    scope: 'service-cancellation-policy',
    greeting: 'Good evening, Sunny! 👋',
    prompt: 'Help me rewrite this policy to improve deflection',
    suggestions: ['Refine this intent', 'Improve this policy to improve deflection'],
  },
  // Contextual result launched from the Content Snippet editor. The rich
  // response lives in KnowledgeEmergingTopicBody; this scope deliberately has
  // no composer prefill because the selected-text request is already shown as
  // the first message in that response.
  'knowledge-emerging-topic': {
    scope: 'knowledge-emerging-topic',
    greeting: 'Here is the emerging topic related to your selection.',
  },
  // The create-agent flow. Deliberately absent from SCOPE_ROUTES: no route
  // implies it — a trigger has to ask for it (spec Decision 8). The conversation
  // seed lives with the flow, not here, so this module stays free of imports
  // from features it is imported by.
  'build-agent': {
    scope: 'build-agent',
    greeting: "Let's build an agent 🧬",
    suggestions: [
      'Build an agent for cancellations',
      'Create an autoflow from a description',
      'Which gaps could an agent cover?',
    ],
  },
  // The self-improving flow. Deliberately absent from SCOPE_ROUTES for the same
  // reason 'build-agent' is: no route implies it — a trigger has to ask for it
  // (spec Decision 10). The conversation seed lives with the flow, not here.
  'self-improving': {
    scope: 'self-improving',
    greeting: "Let's check on your agents 🩺",
    suggestions: [
      'Are any of my agents struggling?',
      'Which agent needs attention first?',
      'What would a self-improving plan change?',
    ],
  },
  configuration: {
    scope: 'configuration',
    greeting: 'I can help you configure this channel.',
    prompt: 'Set up branding for the widget',
    suggestions: [
      'Match my brand colors',
      'Draft a welcome message',
      'Explain personality settings',
    ],
  },
  qa: {
    scope: 'qa',
    greeting: 'Let me help you QA your agents.',
    prompt: 'Draft test cases for this agent',
    suggestions: [
      'Generate edge-case questions',
      'What should I test first?',
      'Explain a failed case',
    ],
  },
  tools: {
    scope: 'tools',
    greeting: 'Let me help you build and connect tools.',
    prompt: 'Create a tool that calls my order API',
    suggestions: [
      'Recommend a tool for this use case',
      'Set up authentication',
      'Explain tool history',
    ],
  },
  orchestrator: {
    scope: 'orchestrator',
    greeting: 'Let me help you orchestrate automations.',
    prompt: 'Create an automation for escalating angry customers',
    suggestions: ['Which automations are off?', 'Draft a new automation', 'Explain this rule'],
  },
  log: {
    scope: 'log',
    greeting: 'I can help you investigate the logs.',
    prompt: 'Summarize the errors from the last 24 hours',
    suggestions: [
      'What caused the latest error?',
      'Show audit events for this agent',
      'Any unusual activity?',
    ],
  },
  'ab-test': {
    scope: 'ab-test',
    greeting: 'Let me help you with your A/B tests.',
    prompt: 'Design an A/B test for a new greeting',
    suggestions: ['Is this result significant?', 'What should I test next?', 'Explain this metric'],
  },
}

export function getAiContext(scope?: AiScope): AiContext {
  return (scope && AI_CONTEXTS[scope]) || AI_CONTEXTS.default
}

// Ordered longest-prefix table mapping a URL path to a scope. First match wins,
// so more specific paths MUST come before their parents. '/' is special-cased
// (exact match only) and listed last so it never swallows other paths.
const SCOPE_ROUTES: ReadonlyArray<readonly [string, AiScope]> = [
  ['/insights/agent-overview', 'ai-performances'],
  // Topics is the CX Journey screen's route; the scope keeps the screen's name.
  ['/insights/topics', 'cx-journey'],
  ['/insights/automations', 'orchestrator'],
  ['/insights', 'insights'],
  ['/agent-builder/configuration', 'configuration'],
  ['/agent-builder/ai-qa', 'qa'],
  ['/agent-builder/actions', 'tools'],
  ['/agent-builder', 'agent-builder'],
  ['/experiment', 'ab-test'],
  ['/settings/logs', 'log'],
  ['/agent-setup/new', 'brand-setup'],
  ['/agent-setup', 'manage-agents'],
  ['/', 'home'],
]

// Derive the assistant scope from the current route. Used by the provider when a
// trigger opens with no explicit scope (TopBar button, ⌘K, per-screen headers).
export function routeToScope(pathname: string): AiScope {
  const hit = SCOPE_ROUTES.find(([p]) =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/'),
  )
  return hit ? hit[1] : 'default'
}
