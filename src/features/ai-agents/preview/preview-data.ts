// Mock content for the Use cases preview overlay: the conversation it opens on,
// the settings the panel offers, and the script that answers what the user types.
//
// `respondTo` is a deterministic keyword matcher, not a model — the same shape as
// `focusesFromPrompt` in home/generate-layout.ts. Every question resolves to one
// exchange, so the trace panel always has a detection block to render.

/** One question-and-answer, with the trace the panel prints beside it. */
export type PreviewExchange = {
  /** The use case the router picked. */
  detection: string
  /** That use case's state — 'Live' or 'Draft'. */
  status: 'Live' | 'Draft'
  confidence: 'High' | 'Medium' | 'Low'
  policy: string
  user: string
  agent: string
  /**
   * Whether the named use case actually fired. Only a use-case-scoped run can
   * report `false` — the channel-wide router always lands somewhere, even if
   * that somewhere is the knowledge-base fallback.
   */
  triggered?: boolean
}

/**
 * The use case a scoped run is testing — a view model, so the overlay never has
 * to import the agent store. The editor builds it from a `StoredAgent`.
 */
export type PreviewUseCase = {
  name: string
  /** The agent's `on` state, printed as Live / Draft. */
  live: boolean
  /** Its policy, flattened by `policyToText`. Empty until one is written. */
  policyText: string
  /** Authored trigger phrases, when the agent has any. */
  triggerPhrases: string[]
  /** 'all segments', or a summary of the agent's tags. */
  segmentScope: string
}

export const PREVIEW_CONVERSATION_ID = '5471e2cb-0347-41d6-85de-4ff6461f1642'
export const PREVIEW_GREETING = 'Hi there, how may I help you?'
export const PREVIEW_SCOPE_CAPTION = 'Currently previewing all “Live” traffic.'
export const PREVIEW_COMPOSER_PLACEHOLDER = 'Ask a question…'

export const PREVIEW_LANGUAGES = ['English', 'Español', 'Français', 'Deutsch', '日本語']
export const PREVIEW_SEGMENTS = ['All segments', 'Riders', 'Drivers', 'Business riders']

/** Copy for the two affordances the frame draws but does not wire up. */
export const PREVIEW_SETTINGS_ACTIONS = ['Select custom filters', 'Fill in Pre-defined context']

/**
 * What the panel says the run covers. A use case wins over any `qualifier` (the
 * Widget's segment, the Voice number): a scoped run's scope is the policy's own,
 * so offering a second narrowing would only contradict it.
 */
export function scopeCaption({
  useCaseName,
  useCaseScope,
  qualifier,
}: {
  useCaseName?: string
  useCaseScope?: string
  qualifier?: string
}): string {
  if (useCaseName) return `Currently previewing the “${useCaseName}” use case, ${useCaseScope}.`
  if (qualifier) return `Currently previewing all “Live” traffic for ${qualifier}.`
  return PREVIEW_SCOPE_CAPTION
}

/**
 * The script. First entry whose keywords appear in the question wins, so the
 * order here is the routing order. Names match use cases in the Widget roster
 * (agent-builder-data) except 'Update profile', which is the frame's own.
 */
const SCRIPT: {
  keywords: string[]
  detection: string
  status: 'Live' | 'Draft'
  confidence: 'High' | 'Medium' | 'Low'
  policy: string
  agent: string
}[] = [
  {
    keywords: ['billing address', 'address', 'update', 'profile', 'email'],
    detection: 'Update profile',
    status: 'Live',
    confidence: 'High',
    policy: 'Ask the customer for more details about what they want to update.',
    // Verbatim from the frame — this entry is what the overlay seeds with.
    agent: 'Thanks for reaching out! I can help you update the billing address on your account.',
  },
  {
    keywords: ['cancel', 'cancellation', 'unsubscribe', 'end my plan'],
    detection: 'Service cancellation',
    status: 'Live',
    confidence: 'High',
    policy:
      'Confirm the account holder before cancelling, then offer a pause as an alternative once.',
    agent:
      'I can help with that. Before I cancel anything — would pausing your plan for a month work instead? You would keep your ride history and pricing.',
  },
  {
    keywords: ['password', 'reset'],
    detection: 'Password Reset',
    status: 'Live',
    confidence: 'High',
    policy: 'Send the reset link to the address on file. Never read a code back to the customer.',
    agent:
      'No problem. I have sent a reset link to the email address on your account — it is valid for 30 minutes. Let me know once you are back in.',
  },
  {
    keywords: ['locked out', 'log in', 'login', 'sign in', 'cannot get in'],
    detection: 'Login Help',
    status: 'Live',
    confidence: 'High',
    policy: 'Verify the account by device before offering any recovery step.',
    agent:
      'Let us get you back in. Are you signing in with the phone number or the email on the account?',
  },
  {
    // No refund use case is live in the roster, so this routes to Fallback — the
    // kind of gap the preview exists to surface.
    keywords: ['refund', 'charged', 'charge', 'overcharge', 'money back'],
    detection: 'Fallback',
    status: 'Live',
    confidence: 'Medium',
    policy: 'No refund use case is live. Collect the trip id and hand off to an agent.',
    agent:
      'I am sorry about that charge. Can you give me the trip date so I can pull up the receipt? I may need to bring in a teammate.',
  },
  {
    keywords: ['tax', 'invoice', 'receipt', '1099'],
    detection: 'Tax document processing',
    status: 'Live',
    confidence: 'High',
    policy: 'Only release tax documents for the signed-in account, and only for closed quarters.',
    agent:
      'I can get that for you. Your tax documents are issued per quarter — which period do you need?',
  },
  {
    keywords: ['integration', 'api', 'webhook', 'sdk'],
    detection: 'Trouble with integration',
    status: 'Draft',
    confidence: 'Medium',
    policy: 'Ask which endpoint failed and the error code before suggesting a fix.',
    agent:
      'Let us narrow it down — which endpoint were you calling, and what status code came back?',
  },
]

const FALLBACK = {
  detection: 'Knowledge Retrieval',
  status: 'Live' as const,
  confidence: 'Low' as const,
  policy: 'No use case matched. Answer from the connected knowledge base or hand off.',
  agent:
    'Let me check our help centre for that. In the meantime, could you tell me a little more about what you are trying to do?',
}

/** Route a question to the exchange the trace panel should print for it. */
export function respondTo(question: string): PreviewExchange {
  const haystack = question.toLowerCase()
  const script =
    SCRIPT.find((entry) => entry.keywords.some((word) => haystack.includes(word))) ?? FALLBACK
  return {
    detection: script.detection,
    status: script.status,
    confidence: script.confidence,
    policy: script.policy,
    agent: script.agent,
    user: question,
  }
}

/** The exchange the overlay opens on — the one the frame draws. */
export const SEED_EXCHANGE = respondTo('Can you help me update the billing address on my account?')

/** Words in a use case's name that say nothing about what it handles. */
const NAME_STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'for', 'me', 'my', 'help', 'with'])

const words = (text: string) => text.toLowerCase().match(/[a-z0-9]+/g) ?? []

/**
 * Does this question route to this use case?
 *
 * Trigger phrases win when the agent has them — those are authored intent, and
 * the seeded roster carries them (policy-seeds.ts). They are matched as plain
 * substrings, so they are authored short there for that reason: a phrase long
 * enough to be a sentence matches nothing anyone types.
 *
 * The fallback, for an agent whose phrases are empty, is the use case's own
 * name: a question word matches a name token outright, or shares a 4-character
 * prefix with it ('cancel' → 'cancellation'). The prefix floor is what keeps
 * 'Login Help' from claiming a password question.
 */
export function matchesUseCase(question: string, useCase: PreviewUseCase): boolean {
  const asked = question.toLowerCase()
  if (useCase.triggerPhrases.length > 0) {
    return useCase.triggerPhrases.some((phrase) => asked.includes(phrase.toLowerCase()))
  }
  const tokens = words(useCase.name).filter((token) => !NAME_STOPWORDS.has(token))
  return words(question).some((word) =>
    tokens.some(
      (token) =>
        word === token ||
        (word.length >= 4 && token.length >= 4 && word.slice(0, 4) === token.slice(0, 4)),
    ),
  )
}

const NO_POLICY = 'This use case has no policy written yet.'

/**
 * Run one question against a single use case. Unlike `respondTo`, the detection
 * is fixed — the question is being tested against *this* policy — so the useful
 * output is whether it fired.
 */
export function respondAsUseCase(question: string, useCase: PreviewUseCase): PreviewExchange {
  const triggered = matchesUseCase(question, useCase)
  return {
    detection: useCase.name,
    status: useCase.live ? 'Live' : 'Draft',
    confidence: triggered ? 'High' : 'Low',
    policy: useCase.policyText.trim() || NO_POLICY,
    // A question that fired is on-topic, so the script's own reply for it reads
    // correctly; one that did not gets the fallback's explicit non-answer.
    agent: triggered ? respondTo(question).agent : FALLBACK.agent,
    user: question,
    triggered,
  }
}
