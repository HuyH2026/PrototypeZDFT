// Mock data for automation insights. All values are illustrative (no backend);
// numbers/text match the Figma design where legible.
//
// Two design transcription notes for the Use case gaps table: the last row's
// coverage is drawn as "3,1916" and its savings as "2,500" with no currency
// mark. Both read as typos, so they are carried here as 31,916 (the value the
// design uses for that topic elsewhere) and $2,500.

export type AutomationStat = { value: string; label: string }

export const USE_CASE_GAP_INTRO =
  'By automating these topics with use cases, you could annually achieve:'

export const USE_CASE_GAP_STATS: AutomationStat[] = [
  { value: '6,908', label: 'Potential ticket coverage' },
  { value: '228,821 hrs', label: 'Potential full resolution time decrease' },
  { value: '$229,860', label: 'Potential savings' },
]

export type UseCaseGapRow = {
  topic: string
  useCase: string
  coverage: string
  savings: string
  created: string
}

const CREATED = 'Jan 4, 2024 9:25 AM'

export const USE_CASE_GAP_ROWS: UseCaseGapRow[] = [
  {
    topic: 'Account Linking and Updating',
    useCase:
      'I acknowledge your request to link or update accounts. I will ask you to specify which accounts you want to link or update, then verify that you own each one before applying the change.',
    coverage: '1,916',
    savings: '$28,740',
    created: CREATED,
  },
  {
    topic: 'Refund Request',
    useCase:
      "Acknowledge the customer's request to set up a new account.\n  1. If the customer specifies the type of account, confirm it back to them before continuing.",
    coverage: '1,508',
    savings: '$22,630',
    created: CREATED,
  },
  {
    topic: 'Beneficiary Information Updates',
    useCase:
      "Acknowledge the customer's request to update or add beneficiary information. Request the following details if not already supplied: full name, relationship, date of birth and allocation.",
    coverage: '832',
    savings: '$12,480',
    created: CREATED,
  },
  {
    topic: 'Card and Account Services',
    useCase:
      "Acknowledge the customer's request regarding their card or account issue.\n  1. If the customer is reporting a problem with a specific card, confirm the last four digits before acting.",
    coverage: '796',
    savings: '$11,940',
    created: CREATED,
  },
  {
    topic: 'Potential Hacking or Unauthorized Access',
    useCase:
      "Acknowledge the customer's concern about potential hacking or unauthorized access. Request the following information if the customer has not already provided it, then secure the account.",
    coverage: '31,916',
    savings: '$2,500',
    created: CREATED,
  },
  // New discoveries — real gaps the platform is surfacing
  {
    topic: 'Order Tracking and Status',
    useCase:
      'Acknowledge the customer\'s request to track their order. I will locate the order by number or email, report current status and ETA, explain any delays, and open a delivery investigation if needed.',
    coverage: '3,240',
    savings: '$48,600',
    created: CREATED,
  },
  {
    topic: 'Failed Payment Recovery',
    useCase:
      'I acknowledge the failed payment issue. I will explain what went wrong in plain language, retry the existing method or collect a new card, and state the grace period before suspension.',
    coverage: '1,840',
    savings: '$27,600',
    created: CREATED,
  },
  {
    topic: 'Add or Update Payment Method',
    useCase:
      'Acknowledge the customer\'s request to add or update a payment method. I will collect card details securely via encrypted form, validate them, and set the default method if requested.',
    coverage: '1,420',
    savings: '$21,300',
    created: CREATED,
  },
  {
    topic: 'Apply Promo Code',
    useCase:
      'I acknowledge the request to apply a promo code. I will validate the code, explain what discount it provides, apply it to the cart or save it to the account, and explain validation failures clearly.',
    coverage: '2,100',
    savings: '$31,500',
    created: CREATED,
  },
  {
    topic: 'Lost Item Recovery',
    useCase:
      'Acknowledge the customer\'s request to recover a lost item. I will collect details, contact the driver or delivery partner, explain the coordination process, and set realistic expectations.',
    coverage: '1,240',
    savings: '$18,600',
    created: CREATED,
  },
]

// Knowledge gaps sub-tab: AI-generated knowledge contents that fill gaps in the
// knowledge base. Banner stats + a table of proposed articles.
export const KNOWLEDGE_GAP_INTRO =
  'We identified gaps in your knowledge base and generated content to address them.'

export const KNOWLEDGE_GAP_STATS: AutomationStat[] = [
  { value: '185', label: 'Generated knowledge content' },
  { value: '29,090', label: 'Potential ticket coverage' },
  { value: '$160,500', label: 'Potential savings' },
]

export type KnowledgeGapRow = {
  title: string
  body: string
  relatedTopic: string
  /** `null` where the design shows a muted "n/a" instead of an article link. */
  relatedArticle: string | null
  coverage: string
}

export const KNOWLEDGE_GAP_ROWS: KnowledgeGapRow[] = [
  {
    title: 'How to Handle a Fraudulent Charge Dispute',
    body: "If you've noticed unauthorized transactions on your account, it's important to act quickly to dispute these charges. This gui...",
    relatedTopic: 'Fraudulent Charge dispu...',
    relatedArticle: 'What do I do if I see unauth...',
    coverage: '403',
  },
  {
    title: 'How to Recover Your Account When You No Longer Have Access to Your Email or phone number',
    body: "If you've lost access to the email or phone number associated with your account, recovering your account can seem challengin...",
    relatedTopic: 'Account recovery',
    relatedArticle: 'GUIDE: Customer verificat...',
    coverage: '394',
  },
  {
    title: 'Understanding and Managing Your Investment Settings',
    body: 'This guide will help you navigate common issues related to investment settings, including managing recurring investments, understand...',
    relatedTopic: 'Investing guidance',
    relatedArticle: 'GUIDE: One-time and recu...',
    coverage: '383',
  },
  {
    title: 'Payment shows on your card but the invoice remains pending',
    body: 'This article explains why your invoice can show Pending while your card shows a charge. It covers what you can do while the sync ...',
    relatedTopic: 'Payment receipts and...',
    relatedArticle: null,
    coverage: '383',
  },
  {
    title: 'How to Change Your IRA Type from Traditional to Roth',
    body: 'Switching your IRA from a Traditional to a Roth IRA involves several steps, including liquidating your current account and understanding the ...',
    relatedTopic: 'Payment receipts and...',
    relatedArticle: 'Changing account types from...',
    coverage: '383',
  },
]

export type TrainingPhraseRow = { topic: string; coverage: string; savings: string }

export type GeneratedTool = {
  name: string
  kind: string
  description: string
  input: string
  output: string
}

export type GeneratedPolicy = { title: string; body: string }

export type TicketSource = {
  id: string
  status: string
  channel: string
  dateCreated: string
  metrics: { label: string; value: string }[]
  subject: string
  customerRequest: { body: string; timestamp: string }
  agentResponse: { body: string; timestamp: string }
}

export type GeneratedUseCaseDetail = {
  summary: string
  suggestedPolicySummary: string
  stats: { value: string; label: string }[]
  trainingPhraseRows: TrainingPhraseRow[]
  keyPhrases: string[]
  tools: GeneratedTool[]
  policy: GeneratedPolicy
  tickets: TicketSource[]
}

const SUMMARY_INTRO =
  'We found a recurring customer request that your agent does not yet handle. Review the suggested policy, then create a new use case or add this topic to an existing one.'

/** Drawer stats read straight off the row so the two never drift. */
const drawerStats = (nonDeflections: string, row: UseCaseGapRow) => [
  { value: nonDeflections, label: 'Potential automated resolutions' },
  { value: row.coverage, label: 'Potential ticket coverage' },
  { value: row.savings, label: 'Potential annual savings' },
]

const rowFor = (topic: string) => USE_CASE_GAP_ROWS.find((row) => row.topic === topic)!

const refundTicket: TicketSource = {
  id: '1274',
  status: 'Closed',
  channel: 'Email',
  dateCreated: 'Jul 17, 2026, 6:47pm',
  metrics: [
    { label: 'First contact resolution', value: 'Yes' },
    { label: 'First resolution time', value: '0.2 hrs' },
    { label: 'Full resolution time', value: '0.2 hrs' },
    { label: 'Sentiment', value: '🙂' },
    { label: 'Average reply time', value: '0.2 hrs' },
    { label: 'Agent replies', value: '1' },
  ],
  subject: 'Refund request',
  customerRequest: {
    body: 'Why was I charged [MONEY_1] for a FREE 2 week trial?!?!?\nI demand my money back immediately!\n\n[NAME_1].',
    timestamp: 'Jul 17, 2023, 6:47pm',
  },
  agentResponse: {
    body: 'Hello again, Sunny!\n\nYour refund for the custom workout plan is being processed.\n\nCheers!\n\nRichard\nAddon Services Support',
    timestamp: 'Jul 17, 2023, 6:47pm',
  },
}

export const USE_CASE_DETAILS: Record<string, GeneratedUseCaseDetail> = {
  'Account Linking and Updating': {
    summary: SUMMARY_INTRO,
    suggestedPolicySummary:
      'Understand which accounts the customer wants to link or update, verify ownership of each, perform the link or profile update, confirm the change, and surface any conflicts that need manual review.',
    stats: drawerStats('1,072', rowFor('Account Linking and Updating')),
    trainingPhraseRows: [
      { topic: 'Link a second account', coverage: '1204 tix', savings: '$18,060' },
      { topic: 'Update billing email', coverage: '612 tix', savings: '$9,180' },
      { topic: 'Merge duplicate accounts', coverage: '311 tix', savings: '$4,665' },
    ],
    keyPhrases: [
      'how do I link my accounts',
      'change my email on file',
      'I have two accounts',
      'update my profile details',
    ],
    tools: [
      {
        name: 'lookup_linked_accounts',
        kind: 'API',
        description:
          'Return the accounts currently linked to a customer and any pending link requests, so the agent can decide whether a new link or a merge is required.',
        input: 'Email, username',
        output: 'linked accounts, pending requests',
      },
      {
        name: 'link_or_update_account',
        kind: 'API',
        description:
          'Link a second account or update profile fields after ownership is verified. Returns the applied change so the agent can confirm it with the customer.',
        input: 'Account id, target id, fields',
        output: 'success, applied change',
      },
    ],
    policy: {
      title: 'Account linking and updating',
      body: 'General Inquiry about linking or updating an account:\n"I can help you link accounts or update your details. First, let\'s make sure everything is verified."\n\nSteps:\n  1. "Confirm the primary account email."\n  2. "Confirm the account you want to link or the field you want to update."\n  3. "Verify ownership of both accounts."\n  4. "Apply the link or update and confirm the result."\n\nIf further Assistance is needed:\n"Handoff" for unresolved conflicts or if the user requests to connect with the support team.',
    },
    tickets: [
      {
        id: '1301',
        status: 'Closed',
        channel: 'Email',
        dateCreated: 'Jul 12, 2026, 11:03am',
        metrics: [
          { label: 'First contact resolution', value: 'No' },
          { label: 'First resolution time', value: '1.1 hrs' },
          { label: 'Full resolution time', value: '3.4 hrs' },
          { label: 'Sentiment', value: '🙂' },
          { label: 'Average reply time', value: '0.7 hrs' },
          { label: 'Agent replies', value: '3' },
        ],
        subject: 'Link a second account',
        customerRequest: {
          body: 'I have a personal and a work account and I want them linked so I can switch between them.',
          timestamp: 'Jul 12, 2026, 11:03am',
        },
        agentResponse: {
          body: "Hi [NAME_1], I've verified both accounts and linked them. You can now switch from your profile menu.\n\nThanks,\nSupport",
          timestamp: 'Jul 12, 2026, 2:29pm',
        },
      },
    ],
  },
  'Refund Request': {
    summary: SUMMARY_INTRO,
    suggestedPolicySummary:
      'Acknowledge the refund request, confirm which charge it relates to, check the order and the refund eligibility window, issue the refund or explain why it was declined, state when the money will land, and offer further help.',
    stats: drawerStats('844', rowFor('Refund Request')),
    trainingPhraseRows: [
      { topic: 'Refund not received', coverage: '948 tix', savings: '$14,220' },
      { topic: 'Dispute on refund', coverage: '412 tix', savings: '$6,180' },
      {
        topic: 'Wants refund on one year of subscription fees',
        coverage: '203 tix',
        savings: '$3,045',
      },
    ],
    keyPhrases: [
      'I want my money back',
      'can I still return after 30 days',
      'when I will get my refund back',
      'how long does it take to refund',
    ],
    tools: [
      {
        name: 'lookup_charge',
        kind: 'API',
        description:
          'Find the charge behind a refund request and return its amount, date and current state, so the agent can confirm the right transaction before refunding anything.',
        input: 'Email, amount, date range',
        output: 'charge id, amount, charged at, state',
      },
      {
        name: 'issue_refund',
        kind: 'API',
        description:
          'Refund a charge once eligibility has been confirmed via lookup_charge. Returns the refund reference and expected settlement date so the agent can tell the customer when to expect the money.',
        input: 'Charge id, amount, reason',
        output: 'refund id, settles on',
      },
    ],
    policy: {
      title: 'Refund request',
      body: 'General Inquiry about Refund request:\n"Notion\'s Plus Plan is free for higher education students and teachers using their school email addresses. Want more details? Check out Notion for Education. Any other questions on this?"\n\nIssues using gift cards for refunds:\n  1. "Confirm your Notion account\'s email is your school email."\n  2. "Ensure your workspace is single-member."\n  3. "On a paid plan? First, downgrade here."\n  4. "Then, go to Settings & Members → Plans and click Get free education plan."\n  5. "Follow these steps and let me know if you need more help!"\n\nCollect feedback, after providing an answer:\n"Did that help solve your issue? Please give us feedback! Or is there something else you need assistance with?"\n\nIf further Assistance is needed:\n"Handoff" for unresolved issues or if the user requests to connect with the support team.',
    },
    tickets: [refundTicket],
  },
  'Beneficiary Information Updates': {
    summary: SUMMARY_INTRO,
    suggestedPolicySummary:
      'Acknowledge the beneficiary request, verify the account holder, collect the beneficiary’s full name, relationship, date of birth and allocation, apply the update, confirm the new split, and route changes that need a notarised form for manual review.',
    stats: drawerStats('466', rowFor('Beneficiary Information Updates')),
    trainingPhraseRows: [
      { topic: 'Add a new beneficiary', coverage: '498 tix', savings: '$7,470' },
      { topic: 'Change beneficiary allocation', coverage: '221 tix', savings: '$3,315' },
      { topic: 'Remove a beneficiary', coverage: '113 tix', savings: '$1,695' },
    ],
    keyPhrases: [
      'how do I add a beneficiary',
      'change who inherits my account',
      'update my beneficiary percentages',
      'remove a beneficiary from my account',
    ],
    tools: [
      {
        name: 'get_beneficiaries',
        kind: 'API',
        description:
          'Return the beneficiaries currently on an account with their relationships and allocation percentages, so the agent knows what the change is being applied to.',
        input: 'Account id',
        output: 'beneficiaries, allocations',
      },
      {
        name: 'update_beneficiary',
        kind: 'API',
        description:
          'Add, amend or remove a beneficiary and rebalance allocations to total 100 percent. Returns the applied split, or the reason a notarised form is required instead.',
        input: 'Account id, beneficiary, allocation',
        output: 'success, applied allocation, form required',
      },
    ],
    policy: {
      title: 'Beneficiary information updates',
      body: 'General Inquiry about beneficiaries:\n"I can help you add or update a beneficiary. I\'ll need a few details to make the change."\n\nDetails to collect:\n  1. "The beneficiary\'s full legal name."\n  2. "Their relationship to you."\n  3. "Their date of birth."\n  4. "The percentage you\'d like to allocate to them."\n\nBefore applying the change:\n"Allocations across all beneficiaries must total 100%. I\'ll confirm the new split with you before saving."\n\nIf further Assistance is needed:\n"Handoff" where a notarised form or spousal consent is required, or if the user requests to connect with the support team.',
    },
    tickets: [
      {
        id: '1315',
        status: 'Closed',
        channel: 'Email',
        dateCreated: 'Jul 9, 2026, 4:18pm',
        metrics: [
          { label: 'First contact resolution', value: 'No' },
          { label: 'First resolution time', value: '0.9 hrs' },
          { label: 'Full resolution time', value: '2.1 hrs' },
          { label: 'Sentiment', value: '🙂' },
          { label: 'Average reply time', value: '0.6 hrs' },
          { label: 'Agent replies', value: '2' },
        ],
        subject: 'Add a beneficiary to my account',
        customerRequest: {
          body: 'I just got married and I need to add my spouse as a beneficiary on my retirement account. What do you need from me?',
          timestamp: 'Jul 9, 2026, 4:18pm',
        },
        agentResponse: {
          body: "Congratulations [NAME_1]! I've added your spouse at 100% and moved your previous beneficiary to contingent. The new split is confirmed on your account.\n\nBest,\nSupport",
          timestamp: 'Jul 9, 2026, 6:24pm',
        },
      },
    ],
  },
  'Card and Account Services': {
    summary: SUMMARY_INTRO,
    suggestedPolicySummary:
      'Acknowledge the card or account issue, identify whether it is a declined transaction, a lost card or a servicing request, verify the account, take the matching action (freeze, replace or update), confirm the outcome, and advise on delivery timing.',
    stats: drawerStats('446', rowFor('Card and Account Services')),
    trainingPhraseRows: [
      { topic: 'Card declined at checkout', coverage: '431 tix', savings: '$6,465' },
      { topic: 'Report a lost or stolen card', coverage: '244 tix', savings: '$3,660' },
      { topic: 'Request a replacement card', coverage: '121 tix', savings: '$1,815' },
    ],
    keyPhrases: [
      'my card was declined',
      'I lost my card',
      'freeze my card',
      'when will my new card arrive',
    ],
    tools: [
      {
        name: 'get_card_status',
        kind: 'API',
        description:
          'Return the state of a customer\'s card along with the reason for any recent decline (insufficient funds, fraud hold, expired card), so the agent can explain what happened before acting.',
        input: 'Account id, last four digits',
        output: 'card state, decline reason, expires on',
      },
      {
        name: 'freeze_or_replace_card',
        kind: 'API',
        description:
          'Freeze a card immediately and optionally order a replacement to the address on file. Returns the new card reference and expected delivery window.',
        input: 'Card id, action, shipping speed',
        output: 'success, replacement id, arrives by',
      },
    ],
    policy: {
      title: 'Card and account services',
      body: 'General Inquiry about a card or account issue:\n"I can help with that. Let me confirm which card we\'re talking about first."\n\nDeclined transaction:\n  1. "Confirm the last four digits of the card."\n  2. "Check the decline reason and explain it plainly."\n  3. "Advise the fix — add funds, release the hold, or use another card."\n\nLost or stolen card:\n  1. "Freeze the card straight away."\n  2. "Confirm the address on file."\n  3. "Order a replacement and give the delivery window."\n\nIf further Assistance is needed:\n"Handoff" for suspected fraud on multiple cards or if the user requests to connect with the support team.',
    },
    tickets: [
      {
        id: '1322',
        status: 'Closed',
        channel: 'Email',
        dateCreated: 'Jul 6, 2026, 8:52am',
        metrics: [
          { label: 'First contact resolution', value: 'Yes' },
          { label: 'First resolution time', value: '0.3 hrs' },
          { label: 'Full resolution time', value: '0.3 hrs' },
          { label: 'Sentiment', value: '😐' },
          { label: 'Average reply time', value: '0.3 hrs' },
          { label: 'Agent replies', value: '1' },
        ],
        subject: 'Card declined at checkout',
        customerRequest: {
          body: 'My card keeps getting declined even though there is money in the account. Ending 4417.',
          timestamp: 'Jul 6, 2026, 8:52am',
        },
        agentResponse: {
          body: 'Hi [NAME_1], a fraud hold was placed after an unusual merchant attempt. I have released it and your card ending 4417 is working again.\n\nRegards,\nSupport',
          timestamp: 'Jul 6, 2026, 9:10am',
        },
      },
    ],
  },
  'Potential Hacking or Unauthorized Access': {
    summary: SUMMARY_INTRO,
    suggestedPolicySummary:
      'Acknowledge the security concern, verify identity out of band, review recent sign-ins and devices, lock the account and reset credentials where access was unauthorised, restore access to the customer, and recommend two-factor authentication.',
    stats: drawerStats('17,873', rowFor('Potential Hacking or Unauthorized Access')),
    trainingPhraseRows: [
      { topic: 'Suspicious activity hold', coverage: '9,480 tix', savings: '$1,120' },
      { topic: 'Unrecognised sign-in alert', coverage: '4,210 tix', savings: '$640' },
      { topic: 'Too many failed logins', coverage: '2,180 tix', savings: '$380' },
    ],
    keyPhrases: [
      'someone logged into my account',
      'I think I was hacked',
      'there are charges I did not make',
      'how do I secure my account',
    ],
    tools: [
      {
        name: 'review_recent_sessions',
        kind: 'API',
        description:
          'Return recent sign-ins with device, location and timestamp so the agent can tell the customer which sessions were theirs and which were not.',
        input: 'Account id, time range',
        output: 'sessions, devices, locations',
      },
      {
        name: 'lock_account_and_reset',
        kind: 'API',
        description:
          'Lock the account, end every active session and send a credential reset once unauthorised access is confirmed. Returns whether the lock succeeded so the agent can walk the customer back in.',
        input: 'Account id, reason',
        output: 'success, locked at, reset sent',
      },
    ],
    policy: {
      title: 'Potential hacking or unauthorized access',
      body: 'General Inquiry about unauthorized access:\n"Thanks for flagging this — let\'s secure the account right now, then work out what happened."\n\nSteps to secure:\n  1. "Verify the one-time code we just sent to the number on file."\n  2. "Review recent sign-ins together and confirm which were yours."\n  3. "Lock the account and end all other sessions."\n  4. "Reset the password and enable two-factor authentication."\n\nIf money moved:\n"Raise a dispute for every transaction the customer does not recognise, and confirm the dispute reference."\n\nIf further Assistance is needed:\n"Handoff" to the fraud team for confirmed account takeover or if the user requests to connect with the support team.',
    },
    tickets: [
      {
        id: '1291',
        status: 'Closed',
        channel: 'Email',
        dateCreated: 'Jul 14, 2026, 9:35am',
        metrics: [
          { label: 'First contact resolution', value: 'Yes' },
          { label: 'First resolution time', value: '0.3 hrs' },
          { label: 'Full resolution time', value: '0.5 hrs' },
          { label: 'Sentiment', value: '🙂' },
          { label: 'Average reply time', value: '0.25 hrs' },
          { label: 'Agent replies', value: '2' },
        ],
        subject: 'Suspicious login lockout',
        customerRequest: {
          body: "My account was locked due to 'suspicious activity' but it was just me traveling. How do I get back in?",
          timestamp: 'Jul 14, 2026, 9:35am',
        },
        agentResponse: {
          body: "Hi [NAME_1], I've confirmed your identity and the travel location. Your account is now unlocked. Please update your password and consider enabling two-factor authentication for added security when traveling.\n\nRegards,\nSupport",
          timestamp: 'Jul 14, 2026, 9:50am',
        },
      },
      {
        id: '1288',
        status: 'Closed',
        channel: 'Email',
        dateCreated: 'Jul 15, 2026, 2:10pm',
        metrics: [
          { label: 'First contact resolution', value: 'Yes' },
          { label: 'First resolution time', value: '0.4 hrs' },
          { label: 'Full resolution time', value: '0.6 hrs' },
          { label: 'Sentiment', value: '😐' },
          { label: 'Average reply time', value: '0.3 hrs' },
          { label: 'Agent replies', value: '2' },
        ],
        subject: 'Unrecognised sign-in from another country',
        customerRequest: {
          body: 'I got an alert about a sign-in from a country I have never been to, and now my password does not work.',
          timestamp: 'Jul 15, 2026, 2:10pm',
        },
        agentResponse: {
          body: "Hi [NAME_1], that sign-in was not yours. I've locked the account, ended all sessions and sent you a reset link. Please enable two-factor authentication once you're back in.\n\nBest,\nSupport",
          timestamp: 'Jul 15, 2026, 2:22pm',
        },
      },
    ],
  },
}
