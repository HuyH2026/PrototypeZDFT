// Authored mock content for the Agent Builder's seeded use cases: the policy
// document each one opens with, the request it describes itself as handling, the
// phrases that route to it, and any condition block beneath the policy.
//
// This lives apart from agent-store.ts on purpose. That module is the store's
// reducers and persistence; this one is prose. Keeping them together buried the
// reducers under a few hundred lines of copy.
//
// Everything here is mock. No figure, article title, or action name implies a
// backend, and none of it should be read as real Uber policy.
import type { CanvasBlock, ChipVariant, PolicyDoc, PolicySegment } from './agent-store'

// The Figma frames label the heading "AI policy" (1886:75526), so every seeded
// and newly-created doc carries it. Declared here rather than in agent-store so
// the runtime dependency runs one way (agent-store → policy-seeds); agent-store
// re-exports it for the callers that already import it from there.
export const POLICY_TITLE = 'AI policy'

// ── Authoring helpers ───────────────────────────────────────────────────────
// A policy is an alternating run of prose and chips. Writing that out as segment
// literals means hand-numbering every id, which is how two segments end up
// sharing one: PolicyEditor edits prose by id (`s.id === id`), so a duplicate
// makes a keystroke in one span silently rewrite the other. Minting ids by
// position here makes that impossible to author by accident.

type ChipSpec = { variant: ChipVariant; label: string }

const chipOf =
  (variant: ChipVariant) =>
  (label: string): ChipSpec => ({ variant, label })

/** A form or survey the policy reveals. */
const form = chipOf('form')
/** A handoff to another queue or team. */
const reroute = chipOf('routing')
/** An analytics/automation event the policy fires. */
const event = chipOf('event')
/** An action from the Actions catalog (`tools-data.ts`). */
const action = chipOf('action')
/** A canned message block. */
const message = chipOf('trigger')
/** A context variable the policy reads. */
const context = chipOf('variable')
/** Another agent or team the policy defers to. */
const agent = chipOf('agent')
/** A help-centre article the policy cites. */
const article = chipOf('article')

function doc(...parts: (string | ChipSpec)[]): PolicyDoc {
  let prose = 0
  let chips = 0
  const segments: PolicySegment[] = parts.map((part) =>
    typeof part === 'string'
      ? { kind: 'prose', id: `p${++prose}`, text: part }
      : { kind: 'chip', id: `c${++chips}`, variant: part.variant, label: part.label },
  )
  return { title: POLICY_TITLE, segments }
}

function conditionBlock(id: string, title: string, subtitle: string, rows: string[]): CanvasBlock {
  return {
    id,
    stepType: 'condition',
    title,
    header: 'Conditions',
    subtitle,
    rows: rows.map((label, i) => ({ id: `${id}-r${i + 1}`, label })),
  }
}

export type PolicySeed = {
  policy: PolicyDoc
  /** How the use case describes the request it handles (the create form's field). */
  customerRequest: string
  /**
   * Phrases that route a question to this use case. Deliberately SHORT literal
   * substrings, because `matchesUseCase` (preview-data.ts) tests
   * `question.includes(phrase)` and — critically — skips the forgiving
   * name-token fallback entirely once a use case has any phrase at all. A
   * sentence-length phrase here would match nothing a real person types.
   */
  triggerPhrases: string[]
  blocks?: CanvasBlock[]
}

// ── Widget ──────────────────────────────────────────────────────────────────

const knowledgeRetrieval: PolicySeed = {
  policy: doc(
    'Answer from published help-centre content only.\nQuote fare, fee, and eligibility figures exactly as the article states them — never estimate, round, or infer a number that is not written down.\nWhen the answer comes from an article, name it: ',
    article('How pricing works'),
    '\nIf the question is about one specific trip, order, or payout, it is not a knowledge question. Hand it to ',
    reroute('Account Support'),
    ' rather than answering in general terms.\nIf no article covers it, say so plainly and offer ',
    reroute('Human Support'),
    '. Do not fill the gap with a guess.',
  ),
  customerRequest:
    'Answer general how-to and policy questions from published help-centre content, citing the article the answer came from and declining to guess when nothing covers it.',
  triggerPhrases: ['how do i', 'where can i', 'what is'],
}

const fallback: PolicySeed = {
  policy: doc(
    'This runs when nothing else matched, so do not restate the question back as though it were understood.\nSay once, plainly, that this needs a person: ',
    message('Handoff Notice'),
    '\nBefore handing over, collect the one thing the assignee would otherwise have to ask for: ',
    form('Fallback Context'),
    '\nTrigger ',
    action('Create Support Ticket'),
    ' with the transcript attached.\nGive a real expectation — the current queue depth from ',
    context('queue_wait_minutes'),
    ', not "as soon as possible".\nThen ',
    reroute('Human Support'),
    '\nNever promise a callback time this channel cannot honour.',
  ),
  customerRequest:
    'Catch conversations no other use case matched. Acknowledge once, collect the missing context, open a ticket with the transcript, and hand off with a realistic wait time.',
  triggerPhrases: ['agent', 'human', 'representative', 'talk to someone'],
}

// Transcribed exactly from the Figma frame — the prose carries the design's own
// line breaks (the editor renders it `whitespace-pre-wrap`): each clause on its
// own line, and the two branches (accepts / declines) separated by a blank line
// rather than the whole policy running together as one wrapped paragraph.
//
// Frozen. `policy-seeds.test.ts` pins its segments, so a stray edit fails there
// rather than quietly diverging from the design.
const serviceCancellation: PolicySeed = {
  policy: doc(
    'Reveal ',
    form('Form: Cancellation Diagnostic Survey'),
    ' to identify the root cause.\nTrigger ',
    reroute('Retention Routing'),
    '\nBased on retention classification, explain to the customer that their problem is solvable and offer 30 days free while the team works on resolving it.\nAsk if they want to take the offer.\nCollect their decision via ',
    form('30-Day Free - Accept or Decline'),
    '\n\nIf the customer accepts, fire event ',
    event('Retention Saved'),
    ' and trigger\n',
    action('Apply 30-Day Free'),
    ' and ',
    action('Schedule Day-30 Check-in'),
    '\n\nIf the customer declines, trigger ',
    action('Process Cancellation'),
    '\nAt close, trigger ',
    form('CSAT Survey'),
  ),
  customerRequest:
    'Handle service or subscription cancellations. Guide the user through the process, follow company rules, and attempt retention only when appropriate by offering options like pausing, downgrading, or resolving issues. No unnecessary persuasion.',
  triggerPhrases: ['cancel', 'unsubscribe', 'end my membership'],
  // The design shows one expanded condition card beneath the policy, with its
  // placeholder shipping-status branches visible.
  blocks: [
    {
      id: 'b-seed-1',
      stepType: 'condition',
      title: 'Untitled classic block 01',
      header: 'Conditions',
      subtitle: 'Shipping status',
      rows: [
        { id: 'r-seed-1', label: 'Condition description' },
        { id: 'r-seed-2', label: 'Condition description' },
        { id: 'r-seed-3', label: 'Otherwise…' },
      ],
    },
  ],
}

const loginHelp: PolicySeed = {
  policy: doc(
    'Confirm the account with ',
    context('account_email'),
    ' before anything else.\nIf ',
    context('auth_provider'),
    ' is Google or Apple, the customer has no password to reset. Say so, and point them at ',
    article('Signing in with Google or Apple'),
    '\nOtherwise trigger ',
    action('Send Sign-in Link'),
    ' and tell them it expires in 15 minutes.\nIf they say the link never arrived, check ',
    context('email_deliverability'),
    ' before resending, then offer to send it once to a different address.\nNever read a one-time code aloud, repeat one back, or accept one the customer volunteers.\nAfter two failed attempts, stop retrying and hand off with ',
    reroute('Account Security'),
  ),
  customerRequest:
    'Get a customer back into their account: identify how they signed up, send a single-use sign-in link, and escalate to Account Security after two failures rather than looping.',
  triggerPhrases: ['log in', 'login', 'sign in', 'locked out', 'two-factor'],
}

const taxDocuments: PolicySeed = {
  policy: doc(
    'Tax documents belong to the account holder alone, so confirm identity before retrieving anything.\nEstablish which year they need. The current year is not final until January 31 — say that plainly rather than reading a provisional figure as though it were settled.\nPull the figures with ',
    action('Get earnings'),
    ' and read back the gross total only. Do not interpret deductions, and do not offer tax advice of any kind.\nIf they want the document itself, confirm the address on file and trigger ',
    action('Email Tax Document'),
    '\nIf ',
    context('tax_form_type'),
    ' is 1099-K and the customer disputes a figure, do not explain the discrepancy. Collect it with ',
    form('Earnings Discrepancy'),
    ' and route to ',
    reroute('Payments'),
  ),
  customerRequest:
    'Help drivers and couriers retrieve an annual summary or 1099. Confirm identity, read back gross earnings only, email the document, and route disputed figures to Payments without attempting to explain them.',
  triggerPhrases: ['1099', 'tax', 'annual summary'],
}

const integrationTrouble: PolicySeed = {
  policy: doc(
    'Ask for the failing request before theorising: ',
    form('Integration Failure Details'),
    '\nCheck ',
    context('api_key_status'),
    ' and ',
    context('webhook_last_delivery'),
    ' first. An expired key and a webhook that quietly stopped delivering account for most reports that arrive here.\nIf the key is expired or compromised, trigger ',
    action('Rotate API Key'),
    ' and warn that the old key stops working after a one-hour grace period.\nFor a 401 that is not the key, walk them through ',
    article('Authenticating with the Unification API'),
    '\nConfirm the account is on a plan that includes API access with ',
    action('Get full account information by customer ID'),
    '\nAnything touching rate limits or a custom contract goes to ',
    agent('Solutions Engineering'),
    ' — never quote a limit increase yourself.',
  ),
  customerRequest:
    'Diagnose Uber for Business API and webhook failures. Start from the failing request, check key and delivery state before theorising, rotate a compromised key, and hand contract or rate-limit questions to Solutions Engineering.',
  triggerPhrases: ['api', 'webhook', 'integration', 'sdk'],
}

const productRecommendations: PolicySeed = {
  policy: doc(
    'Only recommend when the conversation is not already a complaint. If the customer is reporting a problem, resolve it and say nothing about a plan.\nRead ',
    context('rides_per_month'),
    ' and ',
    context('current_plan'),
    " before offering anything.\nUnder four rides a month Uber One does not pay for itself. Say so, even though it means no upsell.\nAt four or more, name the saving in the customer's own numbers rather than a generic percentage, and point them at ",
    article('What Uber One includes'),
    '\nIf they are interested, check for an open basket with ',
    action('Get Cart'),
    ' so the discount applies to the trip they are already booking.\nOn acceptance, fire ',
    event('Plan Upgrade Accepted'),
    '\nNever offer the same plan twice in one conversation.',
  ),
  customerRequest:
    "Recommend a membership only when it genuinely fits the customer's usage, using their own ride numbers, and never on top of an unresolved complaint.",
  triggerPhrases: ['recommend', 'uber one', 'worth it', 'which plan'],
}

// Reflects where PASSWORD_RESET_PLAN (self-improving-data.ts, keyed to `w8`)
// says this agent actually is: Week 1's three auto-fixes are marked done, Week
// 2's SSO branch still needs approval. The policy has to show that split or the
// Insights panel's Self-improving tab and the policy it describes disagree:
//
//   - Root cause #1, "intent recognition misses common variants" — fixed.
//     Trigger phrases now include "can't log in", "locked out" and "forgot
//     credentials", the exact set if1 adds.
//   - Root cause #3, "API timeouts drop to a generic error" — fixed. Retries
//     before showing a specific error with a manual reset link, per if2.
//   - The Week 1 message-shortening fix (if3) — the confirmation line is one
//     sentence instead of the old apologise-and-try-later text.
//
// Root cause #2 — SSO users get the wrong instructions — is deliberately still
// missing: the SSO branch is if4, Week 2, "Needs approval". Do not add an
// `auth_provider` check here until that fix is the one being approved.
const passwordReset: PolicySeed = {
  policy: doc(
    'Send a password reset link with ',
    action('Send Sign-in Link'),
    '\nTell the customer to check their inbox and their spam folder — keep it to one short line.\nIf the request times out, retry twice with backoff before showing a specific error with a manual reset link.',
  ),
  customerRequest: 'Send a password reset link when a customer cannot get into their account.',
  triggerPhrases: ['password', "can't log in", 'locked out', 'forgot credentials'],
}

// ── Order Management ────────────────────────────────────────────────────────

const trackOrder: PolicySeed = {
  policy: doc(
    'Start with the order number. If the customer does not have it, look it up from ',
    context('account_email'),
    ' and ',
    context('order_date_range'),
    ' using ',
    action('Lookup Order by Email'),
    '\nOnce the order is identified, pull its current state with ',
    action('Get Order Status'),
    ' and read back:\n  • Current location or stage\n  • Estimated delivery window\n  • Any exceptions (delays, delivery attempts, holds)\nIf the order is delayed, explain what is known about the cause without promising a revised ETA until the carrier updates it.\nFor "out for delivery" orders, confirm the delivery address with ',
    context('delivery_address'),
    ' so the customer can correct it if wrong.\nIf tracking shows delivered but the customer has not received it, trigger ',
    action('Open Delivery Investigation'),
    ' rather than immediately redelivering or refunding.\nNever show raw carrier codes — translate them into plain language.',
  ),
  customerRequest:
    'Help a customer track an order: locate it by number or email, report its current status and ETA, explain delays, and open a delivery investigation if it shows delivered but was not received.',
  triggerPhrases: ['track order', "where's my order", 'order status', 'delivery eta'],
}

const modifyOrder: PolicySeed = {
  policy: doc(
    'Confirm which order they want to change with ',
    action('Get Order Status'),
    ' before asking what to modify.\nCheck ',
    context('order_stage'),
    ' immediately. Past ',
    context('cutoff_stage'),
    ' the order cannot be changed — say so plainly and offer ',
    reroute('Post-Dispatch Support'),
    ' instead.\nBefore the cutoff:\n  • Address changes: verify the new address is in the delivery zone with ',
    action('Validate Delivery Address'),
    ', apply it with ',
    action('Update Order Address'),
    ', read back the confirmed address\n  • Item changes: show what can still be added or removed, apply with ',
    action('Modify Order Items'),
    ', recalculate the total\n  • Timing changes: check available windows with ',
    action('Get Delivery Windows'),
    ', reschedule with ',
    action('Update Delivery Window'),
    '\nFire ',
    event('Order Modified'),
    ' after every change.\nIf the modification adds cost, state the new total and get explicit acceptance before applying it.\nNever modify an order that is already in transit — hand it to ',
    reroute('Post-Dispatch Support'),
  ),
  customerRequest:
    'Modify an order before it ships: change the delivery address, add or remove items, or reschedule the delivery window, confirming each change cannot proceed once dispatch has started.',
  triggerPhrases: ['change order', 'modify delivery', 'update address', 'add items'],
}

const cancelOrder: PolicySeed = {
  policy: doc(
    'Pull the order with ',
    action('Get Order Status'),
    ' and check ',
    context('order_stage'),
    ' before saying whether cancellation is possible.\nPre-dispatch: trigger ',
    action('Cancel Order'),
    ', confirm the cancellation reference, state the refund timing — "3-5 business days to the original payment method" — and fire ',
    event('Order Cancelled'),
    '\nPost-dispatch: the order cannot be cancelled, but it can be refused or returned. Explain the return window from ',
    article('Return policy'),
    ' and offer ',
    action('Initiate Return'),
    '\nIf the customer wants to cancel because of a delay, check ',
    context('estimated_delivery'),
    ' first. A late order may arrive before the return completes, so ask if they would rather wait.\nNever refund manually without cancelling or returning first — that creates orphan shipments.',
  ),
  customerRequest:
    'Cancel an order before it ships and confirm the refund, or explain the return process for orders already dispatched, checking delivery timing before deciding which path fits.',
  triggerPhrases: ['cancel order', 'stop delivery', "don't want it", 'cancel my order'],
  blocks: [
    conditionBlock('b-seed-o1', 'Cancellation path', 'Order stage', [
      'Pre-dispatch — can cancel',
      'In transit — must return',
      'Out for delivery — must return',
      'Delivered — return window applies',
    ]),
  ],
}

const reportMissingDamagedItem: PolicySeed = {
  policy: doc(
    'Start by confirming what is wrong:\n  • Item missing from a delivered order\n  • Item arrived damaged\n  • Wrong item delivered\nPull the order with ',
    action('Get Order Status'),
    ' and verify it shows delivered. If it does not, this is a tracking issue — hand it to ',
    action('Open Delivery Investigation'),
    ' instead.\nFor confirmed deliveries, collect evidence:\n  • Missing: confirm which items are absent, ask if packaging was intact\n  • Damaged: request a photo via ',
    form('Damage Report Upload'),
    '\n  • Wrong item: confirm what was sent vs what was ordered\nOpen a claim with ',
    action('Open Item Claim'),
    ' and read back the claim reference.\nFor high-value items (',
    context('claim_threshold'),
    '), the claim needs manual review — set that expectation. Otherwise state the resolution timing: replacement ships in 1-2 days, or refund posts in 3-5 business days.\nFire ',
    event('Item Claim Filed'),
    '\nNever offer a refund and a replacement — it is one or the other, customer chooses.',
  ),
  customerRequest:
    'Handle claims for missing, damaged, or wrong items: collect evidence, open a claim with a reference number, and offer replacement or refund based on availability and customer preference.',
  triggerPhrases: ['missing item', 'damaged', 'wrong item', 'item not received'],
}

const requestDeliveryProof: PolicySeed = {
  policy: doc(
    'Confirm the order number and pull delivery details with ',
    action('Get Delivery Proof'),
    '\nIf proof exists (photo, signature, GPS coordinates), describe what is available and offer to email it via ',
    action('Email Delivery Proof'),
    '\nIf no proof is on file, explain what that means for this delivery method:\n  • Contactless: photo taken at drop-off, not always captured\n  • Signature required: recipient name and time logged\n  • Authority to leave: no proof collected\nIf the customer disputes delivery and no proof exists, this becomes a delivery investigation — trigger ',
    action('Open Delivery Investigation'),
    ' and hand to ',
    reroute('Post-Dispatch Support'),
    '\nNever say "the driver says it was delivered" as though that settles it. If there is no proof, acknowledge the gap.',
  ),
  customerRequest:
    'Retrieve and send delivery proof (photo, signature, GPS) when a customer questions whether an order was actually delivered, or open a delivery investigation if no proof exists.',
  triggerPhrases: ['delivery proof', 'photo of delivery', 'signature', 'prove it was delivered'],
}

// ── Subscription Lifecycle ──────────────────────────────────────────────────

const pauseSubscription: PolicySeed = {
  policy: doc(
    'Pull the subscription with ',
    action('Get Subscription Details'),
    ' and confirm the plan name before asking why they want to pause.\nExplain what pausing means for this plan:\n  • No charges during the pause\n  • Benefits stop immediately\n  • Pause duration options: ',
    context('pause_duration_options'),
    '\nIf they still want to pause, collect the duration via ',
    form('Pause Duration Selection'),
    ' and trigger ',
    action('Pause Subscription'),
    '\nRead back the resume date and fire ',
    event('Subscription Paused'),
    '\nIf they mention a problem the subscription is not solving, offer to help with that before pausing — many pauses are frustrated cancellations.\nFor enterprise or annual contracts, check ',
    context('contract_pause_allowed'),
    ' before offering to pause. If false, explain the contract terms and offer ',
    reroute('Account Management'),
  ),
  customerRequest:
    'Pause a subscription temporarily: explain what pausing means, collect the duration, confirm the resume date, and check for solvable frustrations before processing it.',
  triggerPhrases: ['pause subscription', 'pause my plan', 'stop billing temporarily'],
}

const resumeSubscription: PolicySeed = {
  policy: doc(
    'Pull the subscription with ',
    action('Get Subscription Details'),
    ' and check ',
    context('subscription_status'),
    '\nIf paused, confirm the current resume date and ask if they want to resume sooner.\nIf resuming now, trigger ',
    action('Resume Subscription'),
    ' and state when benefits restore and when the next charge will post.\nFire ',
    event('Subscription Resumed'),
    '\nIf the subscription is cancelled rather than paused, this is reactivation — that requires ',
    action('Reactivate Subscription'),
    ' and may involve re-entering payment details. Check ',
    context('reactivation_allowed'),
    ' first.\nIf resuming fails due to an expired payment method, hand to ',
    reroute('Payment Recovery'),
    ' rather than collecting the card yourself.',
  ),
  customerRequest:
    'Resume a paused subscription early or on schedule, restore benefits and billing, or reactivate a cancelled subscription if policy allows.',
  triggerPhrases: ['resume subscription', 'unpause', 'restart my plan'],
}

const failedPaymentRecovery: PolicySeed = {
  policy: doc(
    'Pull the payment failure with ',
    action('Get Payment Failure Details'),
    ' and read back what failed:\n  • Amount\n  • Last four digits of the card\n  • Failure reason from ',
    context('payment_failure_reason'),
    '\nExplain the reason in plain language:\n  • Insufficient funds → "Not enough available"\n  • Expired card → "Card expired [date]"\n  • Declined by issuer → "Card issuer declined; contact them"\n  • Invalid card → "Card details incorrect or no longer valid"\nOffer to retry with ',
    action('Retry Payment'),
    ' if the customer confirms the issue is resolved, or collect a new card via ',
    form('Payment Method'),
    ' and retry with the new method.\nFire ',
    event('Payment Recovered'),
    ' on success.\nIf the retry fails again, explain the ',
    context('grace_period_days'),
    '-day grace period before the subscription suspends, and hand to ',
    reroute('Billing Support'),
    '\nFor past-due accounts beyond grace, check ',
    context('reactivation_fee'),
    ' and state it clearly before attempting recovery.',
  ),
  customerRequest:
    'Recover a failed subscription payment: explain what went wrong, retry the existing method or collect a new one, and state the grace period before suspension.',
  triggerPhrases: ['payment failed', 'card declined', 'subscription suspended', 'billing issue'],
}

const changePlan: PolicySeed = {
  policy: doc(
    'Pull the current plan with ',
    action('Get Subscription Details'),
    ' and show available plans with ',
    action('Get Available Plans'),
    '\nFor each plan, state:\n  • Price difference from current\n  • Key features gained or lost\n  • When the change takes effect\nUpgrades apply immediately; downgrades apply at renewal unless ',
    context('immediate_downgrade_allowed'),
    ' is true.\nCollect the target plan via ',
    form('Plan Selection'),
    '\nCalculate proration with ',
    action('Calculate Proration'),
    ' and read back:\n  • Credit for unused current-plan time (upgrades only)\n  • Prorated charge for the new plan\n  • Net amount due today\nGet explicit acceptance before applying the change with ',
    action('Change Subscription Plan'),
    '\nFire ',
    event('Plan Changed'),
    '\nIf the customer is downgrading and mentions a problem, try to solve it first — many downgrades are retention opportunities.',
  ),
  customerRequest:
    'Change a subscription plan: show options, explain the price difference and timing, calculate proration for upgrades, and confirm the net charge before applying.',
  triggerPhrases: ['change plan', 'upgrade', 'downgrade', 'switch to'],
  blocks: [
    conditionBlock('b-seed-s1', 'Plan change timing', 'Upgrade or downgrade', [
      'Upgrade — immediate, with proration credit',
      'Downgrade — at renewal (default)',
      'Downgrade — immediate if policy allows',
    ]),
  ],
}

// ── Payment Management ──────────────────────────────────────────────────────

const addUpdatePaymentMethod: PolicySeed = {
  policy: doc(
    'Pull existing payment methods with ',
    action('Get Payment Methods'),
    ' and show the current default.\nIf adding a new method, collect card details via ',
    form('Payment Method'),
    ' and add with ',
    action('Add Payment Method'),
    '\nIf updating, confirm which card to update by the last four digits, then collect the new details and trigger ',
    action('Update Payment Method'),
    '\nIf they want to set a different card as default, trigger ',
    action('Set Default Payment Method'),
    ' and confirm the change.\nFor security, never read back the full card number — only the last four digits and expiry.\nIf the new card fails validation, explain the issue:\n  • Invalid number → "Card number format incorrect"\n  • Expired → "Card expired [date]"\n  • CVV mismatch → "Security code does not match"\nFire ',
    event('Payment Method Updated'),
    '\nNever store or transmit card details outside the secure payment form.',
  ),
  customerRequest:
    'Add a new payment method or update an existing one: collect card details securely, validate them, and set the default method if requested.',
  triggerPhrases: ['add card', 'update payment', 'change card', 'new payment method'],
}

const disputeCharge: PolicySeed = {
  policy: doc(
    'Pull the charge with ',
    action('Lookup Charge by Amount'),
    ' using the amount and date the customer provides.\nConfirm the charge details before asking why they are disputing it:\n  • Amount\n  • Date\n  • Description\n  • Last four of the card\nCollect the dispute reason via ',
    form('Dispute Reason'),
    '\nExplain what happens next:\n  • Investigation takes 5-10 business days\n  • Provisional credit may be issued within 3 days for amounts over ',
    context('provisional_credit_threshold'),
    '\n  • The merchant may provide evidence\n  • Final decision will be emailed\nOpen the dispute with ',
    action('Open Charge Dispute'),
    ' and read back the dispute reference.\nFire ',
    event('Dispute Filed'),
    '\nIf the charge is for a subscription they forgot about, offer to cancel the subscription with ',
    action('Cancel Subscription'),
    ' rather than disputing.\nNever refund directly without investigating — that bypasses fraud controls.',
  ),
  customerRequest:
    'Help a customer dispute an unrecognized or incorrect charge: locate it, collect the reason, open a formal dispute, and explain the investigation timeline.',
  triggerPhrases: ['dispute charge', 'wrong charge', "didn't authorize", 'fraudulent charge'],
}

const applyPromoCode: PolicySeed = {
  policy: doc(
    'Collect the promo code and validate it with ',
    action('Validate Promo Code'),
    '\nIf valid, explain what it offers:\n  • Discount amount or percentage\n  • What it applies to (first order, subscription, specific products)\n  • Expiry date\n  • Any restrictions\nIf the customer has an active cart, check it with ',
    action('Get Cart'),
    ' and apply the code with ',
    action('Apply Promo Code'),
    ', then read back the new total.\nIf no cart, add the code to their account for the next eligible purchase with ',
    action('Save Promo Code to Account'),
    '\nFire ',
    event('Promo Code Applied'),
    '\nIf the code is invalid, explain why:\n  • Expired → "Code expired [date]"\n  • Not eligible → "This code does not apply to [product/plan]"\n  • Already used → "This code was already used on [date]"\n  • Does not exist → "Code not recognized"\nNever issue a promo code without checking ',
    context('promo_approval_required'),
    ' — some codes require manager approval.',
  ),
  customerRequest:
    'Validate and apply a promo code: check it works, explain what discount it provides, apply it to the cart or save it to the account, and explain validation failures clearly.',
  triggerPhrases: ['promo code', 'discount code', 'coupon', 'apply code'],
}

const splitPaymentTroubleshooting: PolicySeed = {
  policy: doc(
    'Pull the transaction with ',
    action('Get Transaction Details'),
    ' and check ',
    context('payment_methods_used'),
    ' to see how it split.\nIf the split did not work as expected, identify the issue:\n  • One card declined → explain which one and why with ',
    context('decline_reason'),
    '\n  • Amount exceeded card limit → show the attempted split\n  • Split not supported for this purchase type → explain the restriction\nIf the customer wants to retry, offer:\n  • Use a single payment method with ',
    action('Retry Single Payment'),
    '\n  • Try a different card combination via ',
    form('Split Payment Selection'),
    '\nFor orders already placed, if one payment failed the order may be on hold — check ',
    context('order_status'),
    ' and explain what needs to happen to complete it.\nFire ',
    event('Split Payment Resolved'),
    ' when the payment goes through.\nIf split payment is not available for this transaction type, explain the policy from ',
    article('Payment methods and splitting'),
  ),
  customerRequest:
    'Help troubleshoot a split payment that failed: identify which card declined or why the split was rejected, and retry with adjusted payment methods.',
  triggerPhrases: ['split payment', 'pay with two cards', 'split between cards'],
}

// ── Email ───────────────────────────────────────────────────────────────────

const emailEscalation: PolicySeed = {
  policy: doc(
    'Read the whole thread before replying. The customer has usually explained the problem already, and being asked again is what escalated it.\nOpen with a one-line summary of what they asked for, so it is evident the thread was read.\nSet urgency from ',
    context('sla_breach_hours'),
    ' and the sentiment of the most recent message — not from how many messages there are.\nIf the thread is past its SLA, acknowledge that and apologise once, without explaining the internal reason.\nTrigger ',
    action('Create Support Ticket'),
    ' linked to the existing thread rather than opening a second one.\nFire ',
    event('Escalation Acknowledged'),
    ' so the thread stops accruing SLA time.\nRoute on what is being asked for, not who is asking: billing to ',
    reroute('Payments'),
    ', safety to ',
    reroute('Trust and Safety'),
    '\nNever close an escalated thread in the same reply that acknowledges it.',
  ),
  customerRequest:
    'Take over an email thread that has escalated: summarise what was already asked, acknowledge an SLA breach once, and route on the request rather than the sender.',
  triggerPhrases: ['escalate', 'manager', 'complaint'],
  blocks: [
    conditionBlock('b-seed-c1', 'Thread urgency', 'Time to SLA breach', [
      'Past SLA and negative sentiment',
      'Past SLA',
      'Within SLA, second reply or later',
      'Otherwise…',
    ]),
  ],
}

// ── Voice ───────────────────────────────────────────────────────────────────

const callRouting: PolicySeed = {
  policy: doc(
    'Open with one question — what they are calling about — and let them answer in their own words. There is no menu here.\nLook up who is calling from ',
    context('caller_phone'),
    ' before asking for an account number.\nRoute on the request, not the wording: a caller saying "I was charged twice" wants ',
    reroute('Payments'),
    ', not billing information read back to them.\nAn active trip outranks whatever else they mention: ',
    reroute('Trip Support'),
    '\nDo not ask a caller to repeat themselves more than once. If the intent is still unclear, route on what you have.\nIf they ask for a person at any point, pass them on. Do not ask why first.',
  ),
  customerRequest:
    'Capture what a caller wants in their own words and route them in one step, with no menu tree and no more than one clarifying question.',
  triggerPhrases: ['speak to', 'connect me', 'department'],
}

const voicemailTriage: PolicySeed = {
  policy: doc(
    'Work from the transcript, and treat a low ',
    context('transcription_confidence'),
    " as a reason to route wide rather than to guess a category.\nClassify on the caller's own words, not the number they called from.\nAnything mentioning an accident, a driver, or a passenger's safety skips triage entirely and fires ",
    event('Safety Flag Raised'),
    ' immediately.\nOtherwise trigger ',
    action('Schedule Callback'),
    ' inside the window the caller asked for, defaulting to the next business morning when they named none.\nFire ',
    event('Voicemail Triaged'),
    ' with the chosen category so the queue report stays accurate.\nNever leave a voicemail unrouted at end of day.',
  ),
  customerRequest:
    'Classify a voicemail from its transcript, flag anything safety-related immediately, and book a callback inside the window the caller asked for.',
  triggerPhrases: ['voicemail', 'left a message', 'call me back'],
  blocks: [
    conditionBlock('b-seed-v2', 'Voicemail category', 'Transcript contents', [
      'Mentions an accident, a driver, or safety',
      'Mentions a charge, refund, or payout',
      'Mentions an active or recent trip',
      'Otherwise…',
    ]),
  ],
}

// ── Safety & Trust ──────────────────────────────────────────────────────────

const reportIncident: PolicySeed = {
  policy: doc(
    'Fire ',
    event('Safety Incident Reported'),
    ' immediately — before asking any questions.\nConfirm who is involved: driver, rider, passenger, third party.\nCollect critical details via ',
    form('Incident Report'),
    ':\n  • Type: accident, harassment, unsafe driving, other\n  • When and where it occurred\n  • Anyone injured\n  • Police or emergency services involved\nNever ask the reporter to investigate or confront anyone — that is ',
    reroute('Safety Team'),
    "'s role.\nIf injury is mentioned, route to ",
    reroute('Emergency Response'),
    ' immediately rather than collecting the full report.\nCreate the incident with ',
    action('Create Safety Incident'),
    ' and read back the incident reference.\nExplain what happens next:\n  • Safety team reviews within 1 hour for urgent cases, 24 hours otherwise\n  • All parties may be contacted\n  • Account actions (warnings, suspensions) are decided by Safety, not support\nNever promise an outcome or timeline for account action — those decisions belong to the Safety team.',
  ),
  customerRequest:
    'Report a safety incident (accident, harassment, unsafe behavior): flag it urgently, collect the critical details, create the incident record, and route to the Safety team for investigation.',
  triggerPhrases: ['accident', 'unsafe', 'harassment', 'threatened', 'incident'],
}

const lostItemRecovery: PolicySeed = {
  policy: doc(
    'Confirm what was lost and where: in a vehicle, at a delivery location, or during a trip.\nFor items left in a vehicle, collect details via ',
    form('Lost Item Details'),
    ':\n  • Item description\n  • Trip or order ID\n  • When they realized it was missing\nTrigger ',
    action('Contact Driver for Lost Item'),
    ' to notify the driver.\nExplain the process:\n  • Driver has 48 hours to respond\n  • If found, driver will coordinate return or drop-off\n  • Coordination happens directly between customer and driver\n  • For high-value items, suggest filing a police report\nFire ',
    event('Lost Item Reported'),
    '\nIf the item is sensitive (ID, passport, medication), flag it as urgent with ',
    context('lost_item_priority'),
    ' set to high.\nFor delivery drop-offs, the driver cannot retrieve items after delivery completes — explain the item was left at the address and coordinate with the location instead.\nNever promise the item will be found or returned.',
  ),
  customerRequest:
    'Help recover an item left behind: collect details, contact the driver or delivery partner, explain the coordination process, and set expectations realistically.',
  triggerPhrases: ['lost item', 'left behind', 'forgot my', 'retrieve item'],
}

const ratingDispute: PolicySeed = {
  policy: doc(
    'Pull the rating with ',
    action('Get Rating Details'),
    ' and show:\n  • Star rating received\n  • Date\n  • Any written feedback\n  • Trip or order ID\nExplain the dispute policy from ',
    article('Rating and feedback policy'),
    ':\n  • Ratings can be disputed if they violate community guidelines\n  • Valid disputes: discriminatory comments, threats, content about factors outside control (traffic, weather)\n  • Invalid disputes: low rating alone, negative but respectful feedback\nIf the dispute is valid, collect evidence via ',
    form('Rating Dispute Evidence'),
    ' and trigger ',
    action('Submit Rating Dispute'),
    '\nRead back the dispute reference and the review timeline: 3-5 business days.\nFire ',
    event('Rating Disputed'),
    '\nIf the dispute is clearly invalid, explain why plainly rather than submitting it — ratings reflecting service quality, even if harsh, cannot be removed.',
  ),
  customerRequest:
    'Help dispute an unfair rating: review the rating and feedback, explain what qualifies for dispute, collect evidence for valid cases, and set realistic expectations.',
  triggerPhrases: ['unfair rating', 'dispute rating', 'bad review', 'wrong feedback'],
}

const emergencyContact: PolicySeed = {
  policy: doc(
    'Route to ',
    reroute('Emergency Response'),
    ' immediately if:\n  • Someone is injured\n  • There is an active threat\n  • Emergency services are needed\nFor non-emergency contact (notify someone of delay, share trip status), collect:\n  • Who to contact\n  • Relationship to the caller\n  • What to communicate\nVerify the contact with ',
    context('emergency_contact_on_file'),
    ' before proceeding.\nSend the notification with ',
    action('Send Emergency Notification'),
    ' and confirm delivery.\nFire ',
    event('Emergency Contact Notified'),
    '\nFor active trips, offer to share live trip status with ',
    action('Share Trip Status'),
    '\nNever delay emergency routing to collect contact information — life safety comes first.',
  ),
  customerRequest:
    'Notify an emergency contact or share trip status: route true emergencies immediately, collect contact details for non-urgent cases, and send the notification.',
  triggerPhrases: ['emergency contact', 'notify', 'share trip', 'family member'],
}

// ── Proactive Communication ─────────────────────────────────────────────────

const onboardNewUser: PolicySeed = {
  policy: doc(
    'Greet the user and confirm this is their first time using the service.\nWalk through the core features relevant to their role from ',
    context('user_role'),
    ':\n  • Riders: how to request, payment, safety features\n  • Drivers: how to go online, accept trips, earnings\n  • Eats customers: browsing, ordering, tracking\nKeep each point to one sentence — this is an orientation, not a manual.\nOffer to set up their profile with ',
    form('Profile Setup'),
    ': payment method, home/work addresses, preferences.\nDirect them to ',
    article('Getting started guide'),
    ' for the full walkthrough.\nFire ',
    event('Onboarding Completed'),
    '\nEnd with one question: "What would you like to do first?" and route them to that action.\nNever dump a wall of information — guide, do not lecture.',
  ),
  customerRequest:
    'Welcome and onboard a new user: introduce core features for their role, help set up their profile, and guide them to their first action.',
  triggerPhrases: ['first time', 'new user', 'getting started', 'how to use'],
}

const reengageDormantAccount: PolicySeed = {
  policy: doc(
    'Check account activity with ',
    action('Get Account Activity'),
    ' and confirm it has been inactive for ',
    context('dormancy_threshold_days'),
    ' days or more.\nAcknowledge the gap: "We noticed it\'s been a while since you used [service]."\nOffer a personalized reason to return based on ',
    context('last_used_feature'),
    ':\n  • New features launched since they were last active\n  • Promotions or credits available\n  • Service improvements in their area\nIf they mention why they stopped using the service, address that directly rather than pushing a promotion.\nOffer a small incentive with ',
    action('Apply Reengagement Credit'),
    ' if ',
    context('reengagement_credit_available'),
    ' is true.\nFire ',
    event('Account Reengaged'),
    '\nNever make them feel bad for being inactive — welcome them back, do not guilt them.',
  ),
  customerRequest:
    'Re-engage a dormant account: acknowledge the gap, offer relevant updates or incentives, and address any concerns about why they stopped using the service.',
  triggerPhrases: ['haven\'t used', 'been a while', 'stopped using'],
}

const scheduledMaintenance: PolicySeed = {
  policy: doc(
    'Confirm the maintenance window from ',
    context('maintenance_start'),
    ' to ',
    context('maintenance_end'),
    '\nExplain what will be unavailable:\n  • Full service down\n  • Specific features unavailable (payments, trip history, etc.)\n  • Read-only access\nState the window in the user\'s local time with ',
    context('user_timezone'),
    '\nOffer alternatives if available:\n  • Use a different channel (app vs web)\n  • Contact support via phone instead of chat\nFire ',
    event('Maintenance Notified'),
    '\nIf the user has an urgent need that conflicts with the window, escalate to ',
    reroute('Maintenance Coordination'),
    ' to see if accommodations can be made.\nNever downplay the impact — if something will be down, say so clearly.',
  ),
  customerRequest:
    'Notify users of scheduled maintenance: explain what will be unavailable, state the window in their local time, and offer alternatives where possible.',
  triggerPhrases: ['maintenance', 'service down', 'unavailable'],
}

// ── Headless ────────────────────────────────────────────────────────────────

const apiResolver: PolicySeed = {
  policy: doc(
    'There is no person reading this. Return the answer — not a greeting, an apology, or an offer to help further.\nAnswer only from the content in ',
    context('knowledge_scope'),
    '. An empty result is a valid response, and a far better one than an invented answer.\nCite the source in the payload so the calling application can link to it: ',
    article('Help centre source'),
    "\nNever include personally identifying data in the response body, even when the request context contains it.\nBelow the caller's confidence threshold, return the no-answer shape rather than the best guess.",
  ),
  customerRequest:
    'Resolve a question from scoped knowledge content and return a structured answer with its source, or the no-answer shape when nothing covers it.',
  triggerPhrases: ['resolve', 'lookup', 'query'],
}

const intentClassifier: PolicySeed = {
  policy: doc(
    'Return exactly one intent from the taxonomy in ',
    context('intent_taxonomy_version'),
    '. Do not invent a label, and do not return a parent category where a child fits.\nWhen two intents fit equally well, prefer the actionable one over the descriptive one.\nEmit ',
    event('Intent Classified'),
    ' with the label and a confidence score on every call, including the ones that fall through.\nBelow the confidence floor, return `unclassified` and emit ',
    event('Classification Abstained'),
    '. An abstention is measurable; a wrong label is not.',
  ),
  customerRequest:
    'Classify an inbound message into exactly one published intent, and abstain measurably rather than guess when confidence is below the floor.',
  triggerPhrases: ['classify', 'intent'],
}

const headlessFallback: PolicySeed = {
  policy: doc(
    'Return the escalation shape, not prose. The caller is code.\nInclude the transcript, the last intent attempted, and the reason for the fallthrough — a payload without a reason is why these get reopened.\nTrigger ',
    action('Create Support Ticket'),
    ' and return its id so the calling application can poll it.\nDo not retry the flow that has already failed.',
  ),
  customerRequest:
    'Return a structured escalation payload — transcript, last intent, and fallthrough reason — with a ticket id the caller can poll.',
  triggerPhrases: ['fallback', 'unhandled'],
}

const enrichment: PolicySeed = {
  policy: doc(
    'This runs ahead of the resolving use case, so it must be quick and it must never block: on timeout, return the request unchanged rather than failing it.\nFetch the profile with ',
    action('Get full account information by customer ID'),
    ' keyed on ',
    context('customer_id'),
    '\nAttach only the fields a downstream policy actually reads — plan tier, account standing, open trip — and drop the rest.\nNever attach a payment instrument, a full address, or anything else that would end up in a transcript.\nIf the lookup returns nothing, set ',
    context('account_known'),
    ' to false and let ',
    agent('API resolver'),
    ' answer generically.',
  ),
  customerRequest:
    'Attach account context to a request before the resolving use case runs, dropping anything a downstream policy does not read and never blocking on a timeout.',
  triggerPhrases: ['enrich', 'account context'],
}

/**
 * Authored content per seeded agent id (`agent-builder-data.ts`). Agents absent
 * from this map — anything created in the app — fall back to the starter policy.
 */
export const POLICY_SEEDS: Record<string, PolicySeed> = {
  w1: knowledgeRetrieval,
  w2: fallback,
  w3: serviceCancellation,
  w4: loginHelp,
  w5: taxDocuments,
  w6: integrationTrouble,
  w7: productRecommendations,
  w8: passwordReset,
  w9: trackOrder,
  w10: modifyOrder,
  w11: cancelOrder,
  w12: reportMissingDamagedItem,
  w13: requestDeliveryProof,
  w14: pauseSubscription,
  w15: resumeSubscription,
  w16: failedPaymentRecovery,
  w17: changePlan,
  w18: addUpdatePaymentMethod,
  w19: disputeCharge,
  w20: applyPromoCode,
  w21: splitPaymentTroubleshooting,
  c1: emailEscalation,
  v1: callRouting,
  v2: voicemailTriage,
  v3: reportIncident,
  v4: lostItemRecovery,
  v5: ratingDispute,
  v6: emergencyContact,
  v7: onboardNewUser,
  v8: reengageDormantAccount,
  v9: scheduledMaintenance,
  h1: apiResolver,
  h2: intentClassifier,
  h3: headlessFallback,
  h4: enrichment,
  // Web Call's four seeded rows (Agent Builder_Use case_001, 120:57534) reuse
  // the matching authored policies — same built-ins and request shapes as
  // Widget's.
  wc1: knowledgeRetrieval,
  wc2: fallback,
  wc3: addUpdatePaymentMethod,
  wc4: loginHelp,
}
