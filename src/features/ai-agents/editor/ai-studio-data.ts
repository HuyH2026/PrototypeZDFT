// Canned AI Studio content for the policy-rewrite flow (transcribed from the
// Figma frames 768-43219 / 768-43609 / 768-44408 / 768-44545). Frontend-only
// mock — there is no model call. The greeting is a fixed string because
// Date.now()/new Date() are unavailable in this runtime and the design frame is
// a fixed "Good evening".

export const AI_STUDIO_GREETING = 'Good evening, Sunny! 👋'

// The two suggestion bubbles shown in the initial panel state.
export const AI_STUDIO_SUGGESTIONS = [
  'Refine this intent',
  'Improve this policy to improve deflection',
]

// The prompt pre-filled by the primary suggestion bubble / used as the seeded
// composer value in the initial state.
export const AI_STUDIO_REWRITE_PROMPT = 'Help me rewrite this policy to improve deflection'

// The word the user types into the composer to approve the plan (matched
// case-insensitively, trimmed).
export const AI_STUDIO_APPROVE_WORD = 'Approve'

// How long the "Working..." indicator shows after approval before the full view
// closes and the inline diff preview appears (ms).
export const AI_STUDIO_WORKING_MS = 2500

// The assistant's analysis reply after the user asks to rewrite the policy.
export const AI_STUDIO_ANALYSIS = {
  thinkingLabel: 'Thinking complete',
  paragraphs: [
    'Deflection issue: this flow needs a rewrite to close gaps causing drop-off.',
    'Customers are likely abandoning or escalating mid-flow due to unhandled errors, missing confirmations, and unclear next steps — fixing these gaps should reduce drop-off and improve deflection.',
  ],
  dropOffTitle: 'Current drop off rate:',
  dropOff: [
    { channel: 'Widget', rate: '43%' },
    { channel: 'Voice', rate: '37%' },
  ],
  closing: 'Here is the Improved policy plan to fix the dropoff issue.',
}

// The context-gathering Q&A bubble shown at the top of the full-view chat
// column (right-aligned gradient user bubble). Empty strings render as blank
// spacer lines.
export const AI_STUDIO_QA_BUBBLE = [
  'Q. Can the bot trigger Card freeze / card lock directly via API, or does it require a human?',
  'A. Requires a human',
  '',
  'Q. Can the bot pull the last N transactions for the authenticated user and let them flag which are unauthorized?',
  'A. Only when needed',
  '',
  'Q. How should the bot file a formal dispute?',
  'A. Bot can file a formal dispute end-to-end',
  '',
  'Q. How does authentication work?',
  'A. Policy needs to verify identity first',
  '',
  'Q. Which use cases should this cover?',
  'A. Lost/stolen cards, account-takeover',
  '',
  'Q. Should any of these scenarios be escalated automatically to a human?',
  'A. Losses above a $10,000 threshold, lost account access',
]

// The improvement-plan card + full "Review plan" content.
export const AI_STUDIO_PLAN = {
  emoji: '💖',
  title: 'Improvement plan',
  channel: 'Widget',
  agentName: 'Service Cancellation',
  reviewLabel: 'Review plan',
  workingLabel: 'Working...',
  approvedLabel: 'Approved',
  // Left-pane intro reasoning shown in the full view.
  intro:
    "This is more than a tweak — it's a wholesale redesign (handoff-only → multi-path resolution with three new tools and a CV). The right shape is the create-autoflow build pattern applied to the existing intent: rewrite the policy, attach new tools, add the loss-amount CV.",
  summary: {
    title: 'Summary',
    bullets: [
      'Fixes early PII collection, ignored blacklist logic, and unhandled branches',
      'Triages first, only collects email when needed',
      'Silent handoff for blacklisted users; KB answers for setup and claims',
    ],
    note: 'Approving plan will create a new agent in draft mode',
  },
  // Numbered plan sections on the right pane. Section 01 carries the "New policy"
  // detail (Call to Action / Context / Constraints / Content); 02 and 03 are
  // shorter prose steps.
  sections: [
    {
      number: '01',
      title: 'Update Policy Description',
      body: 'Replace the current policy with a tightened version that fixes the structural problems (PII collected before intent, branches with no instructions, blacklist field fetched but ignored, redundant name field). The new policy triages first, only collects email when account-specific data is actually needed, blocks blacklisted users via silent handoff, and answers Setup / Claim questions from the knowledge base instead of leaving the LLM to improvise.',
      newPolicy: {
        heading: 'New policy:',
        callToAction: {
          label: 'Call to Action',
          text: 'Help the customer with their cashback question. There are three categories: missing cashback (account-specific, requires lookup), cashback setup (general how-to), and cashback claims (general how-to). Triage first, then act.',
        },
        context: {
          label: 'Context',
          text: 'CashWise customers earn cashback on qualifying purchases. The Get_Account_Cash_back_Info action looks up a customer by email and returns their cashback records plus a blacklisted flag. Blacklisted accounts must never receive cashback assistance through the bot.',
        },
        constraints: {
          label: 'Constraints',
          items: [
            'Do NOT ask for the customer’s email or call Get_Account_Cash_back_Info until you have confirmed the issue is "missing cashback." Setup and claim questions are general and never require account lookup.',
            'Do NOT ask for the customer’s full name. Email alone is sufficient.',
            'If Get_Account_Cash_back_Info returns blacklisted = true, immediately hand off to an agent silently. Do NOT tell the customer they are blacklisted, do NOT explain the reason, and do NOT continue the cashback flow. Use a neutral handoff message such as "Let me connect you with an agent who can help."',
            'If Get_Account_Cash_back_Info returns no records for the email, ask the customer to confirm the email once. If the second attempt also returns no records, hand off to an agent.',
            'For setup and claim questions, answer using the knowledge base. Do not invent steps.',
            'Never promise specific cashback amounts, payout dates, or reversal of declined cashback.',
          ],
        },
        content: {
          label: 'Content',
          items: [
            'Greet the customer and ask which category their question falls into: Missing cashback, Cashback setup, or Cashback claim.',
            'If Missing cashback: Ask for the email on their CashWise account. Call Get_Account_Cash_back_Info with that email.',
            'If Cashback setup: Answer the customer’s specific setup question using the knowledge base. Ask a follow-up if the question is vague.',
            'If Cashback claim: Answer the customer’s specific claim question using the knowledge base. Ask a follow-up if the question is vague.',
            'After answering setup or claim questions, ask whether the customer needs anything else before ending.',
          ],
          footnote: 'This saves to draft. Publishing is a separate step.',
        },
      },
    },
    {
      number: '02',
      title: 'Add a buttons step asking clothes vs shoes',
      body: 'The workflow needs to branch based on whether the user wants a discount on clothes or shoes.',
    },
    {
      number: '03',
      title: 'Add response messages for each branch',
      body: 'Each branch needs a reply acknowledging the category so we can later plug in the relevant promo/article.',
    },
  ],
}

// After approval the editor shows an "Inline policy preview": the rewritten
// Autoflow policy rendered as accept/reject diff blocks (Figma 768-44545).
// `kind` drives the left rail color — 'context' = neutral (already-there steps),
// 'add' = teal (added), 'remove' = red (to be removed).
export type PreviewChangeKind = 'context' | 'add' | 'remove'
export type PreviewBlock = {
  id: string
  kind: PreviewChangeKind
  // A numbered heading (e.g. "2. Confirm before writing") or null for a plain
  // ordered top-level step rendered with its own number.
  heading?: string
  number?: string
  lines: string[]
}

export const AI_STUDIO_PREVIEW = {
  title: 'Inline policy preview',
  subtitle:
    'Your AI-suggested changes are ready to review. Accept or reject them one by one or in bulk. Resolve all changes to publish.',
  changes: 3,
  policyTitle: 'Autoflow policy',
  blocks: [
    {
      id: 'pv-1',
      kind: 'context',
      number: '1',
      heading: 'Acknowledge the customer’s request for update billing address',
      lines: [
        'If the customer has not provided the last 4 digits of their account number, request for it.',
        'If the customer has provided the last 4 digits of their account number, proceed to the next step.',
      ],
    },
    {
      id: 'pv-2',
      kind: 'add',
      number: '2',
      heading: 'Confirm before writing',
      lines: [
        'Read the new address back verbatim and ask the customer to confirm it is correct.',
        'Only proceed to the write if the customer confirms. If they correct any part, capture the correction and read back again.',
      ],
    },
    {
      id: 'pv-3',
      kind: 'add',
      number: '3',
      heading: 'Update the address',
      lines: [
        'Call Update billing address with the confirmed new address.',
        'On success, tell the customer the address has been updated and ask if there’s anything else.',
        'On error or non-success response, apologize, do not retry silently, and escalate to a human agent.',
      ],
    },
    {
      id: 'pv-4',
      kind: 'remove',
      lines: [
        'Tell the customer the current billing address and ask them to confirm if they want to update this information. If they confirm, ask them to provide the new billing address, then go to the next steps.',
      ],
    },
  ] as PreviewBlock[],
}
