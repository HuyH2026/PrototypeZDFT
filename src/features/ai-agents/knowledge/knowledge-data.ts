// Mock content for the Knowledge screen (/agent-builder/knowledge) — Figma
// frame 1:3847 (Knowledge coaching), with the existing Content snippets view.
//
// Names, instructions and snippet bodies are transcribed from the design,
// keeping its own typos ("vauge", "If the the VIP account", "Try to suggestion
// 2-3 products"). The drill-in frame supplies the complete Business trip
// instruction that the list frame visually truncates. Only stray whitespace is
// normalised. No backend.

export type KnowledgeTab = 'Knowledge coaching' | 'Content snippets'

export const KNOWLEDGE_TABS: KnowledgeTab[] = ['Knowledge coaching', 'Content snippets']

/** A delta pill on a Content snippets metric card. */
export type KnowledgeMetric = {
  key: string
  label: string
  value: string
  /** The smaller figure beside the value, where the frame shows one. */
  sub?: string
  delta?: { amount: string; trend: 'up' | 'down' }
}

export type KnowledgeInsights = {
  timesApplied: string
  conversations: string
  resolutions: string
}

/**
 * The scene a drill-in's Preview plays: one simulated live conversation plus the
 * debug panel's account of how the agent answered it. Authored per entry rather
 * than shared, because a preview is only worth showing if it is a conversation
 * this particular rule or snippet would actually shape.
 */
export type KnowledgePreviewContent = {
  /** The customer's opening message. */
  ask: string
  /** The agent's reply, one entry per line. */
  reply: string[]
  /** Debug panel: the use case the agent detected. */
  useCase: string
  /** Debug panel: that use case's policy description. */
  policy: string
  /** Debug panel: the content the agent drew on, one entry per paragraph. */
  source: string[]
}

export type KnowledgeCoachingEditorContent = {
  insights: KnowledgeInsights
  appliedUseCases: string[]
  /** The editor can be scoped more narrowly than the summary row. */
  channels: string[]
  preview: KnowledgePreviewContent
}

export type ContentSnippetEditorContent = {
  insights: KnowledgeInsights
  targetedArticle: string
  settingsName: string
  channels: string[]
  suggestionCount: number
  preview: KnowledgePreviewContent
}

/**
 * One coaching rule or content snippet. The two tabs draw identical rows, so
 * they share a type — only the body column's heading differs.
 */
export type KnowledgeEntry = {
  id: string
  name: string
  updatedOn: string
  /** Channels the entry applies to — Widget, Headless, Voice, … */
  channels: string[]
  /** Segments within those channels; empty means every segment. */
  segments: string[]
  /** Help-centre articles the entry is bound to, shown as link chips. */
  articles: string[]
  /** The instruction itself: "Knowledge Coaching" or "Content snippet". */
  body: string
  enabled: boolean
  /** Present when the entry has a designed Knowledge coaching drill-in. */
  editor?: KnowledgeCoachingEditorContent
  /** Present when the entry has a designed Content snippet drill-in. */
  snippetEditor?: ContentSnippetEditorContent
}

export type KnowledgeTabContent = {
  /** The one-line explanation under the tab strip. */
  description: string
  /** Content snippets has a summary strip; Knowledge coaching does not. */
  metrics?: KnowledgeMetric[]
  /** Heading over the body column. */
  bodyColumn: string
  /**
   * The views draw different filter controls — Knowledge coaching gets a
   * "Filter by" dropdown, Content snippets a "Filters" panel trigger. Both are
   * inert, so only the label and glyph differ.
   */
  filter: { label: string; kind: 'dropdown' | 'panel' }
  entries: KnowledgeEntry[]
}

const COACHING: KnowledgeTabContent = {
  description:
    'Guide how your agent uses help center content, including what to show, skip, or do when content is outdated.',
  bodyColumn: 'Knowledge Coaching',
  filter: { label: 'Filter by', kind: 'dropdown' },
  entries: [
    {
      id: 'clarification',
      name: 'Clarification',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget', 'Headless', 'Voice'],
      segments: ['Riders'],
      articles: ['FAQs'],
      body: 'if the question is vague such as just mentioning Google Big Query, clarify with the user if they would like to know about connecting with Cashwise cloud or something else',
      enabled: true,
      editor: {
        insights: {
          timesApplied: '3,418',
          conversations: '1,982',
          resolutions: '1,625 (82%)',
        },
        appliedUseCases: ['Connect to BigQuery', 'Cloud integration help'],
        channels: ['Widget', 'Headless', 'Voice'],
        preview: {
          ask: 'Google Big Query',
          reply: [
            'Happy to help with BigQuery — I’d just like to point you at the right guide.',
            'Are you looking to:',
            '• Connect BigQuery to Cashwise Cloud',
            '• Query data you’ve already synced',
            '• Something else',
            'Tell me which one and I’ll walk you through it.',
          ],
          useCase: 'Connect to BigQuery (Live)',
          policy: 'Clarify a vague ask before answering it',
          source: [
            'FAQs — Connecting Cashwise Cloud to Google BigQuery',
            'Cashwise Cloud connects to BigQuery through a service account. Ask an admin to grant the BigQuery Data Viewer role, then add the dataset under Settings → Integrations.',
          ],
        },
      },
    },
    {
      id: 'product-recommendation',
      name: 'Product Recommendation',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget'],
      segments: ['Riders'],
      articles: ['Products guide'],
      body: 'For questions about product recommendation, assess if the user already mentions their goal or purpose before giving them suggestion on which iFit products to buy. Use articles with URL contains nordictrack.com for your answer. Try to suggest 2-3 products with a good level of details / highlighted features per each product and the reason why you think they are good for what the user is looking for.',
      enabled: false,
      editor: {
        insights: {
          timesApplied: '1,876',
          conversations: '1,043',
          resolutions: '814 (78%)',
        },
        appliedUseCases: ['Product recommendations', 'Product comparisons'],
        channels: ['Widget'],
        preview: {
          ask: 'Which iFit machine should I get?',
          reply: [
            'Happy to help you pick one. Before I suggest anything — what are you training for?',
            '• Running and cardio',
            '• Strength',
            '• Low-impact recovery',
            'Once I know the goal I’ll pull two or three that fit it, with the reasons why.',
          ],
          useCase: 'Product recommendations (Live)',
          policy: 'Establish the customer’s goal before recommending products',
          source: [
            'Products guide — nordictrack.com/treadmills',
            'The Commercial 1750 pairs a 3.75 CHP motor with a 10" touchscreen and −3% to 15% incline, which suits interval running and daily cardio.',
          ],
        },
      },
    },
    {
      id: 'business-trip-expense-eligibility',
      name: 'Business trip expense eligibility',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget', 'Headless', 'Voice'],
      segments: ['Riders', 'Business riders'],
      articles: ['Business trip expenses'],
      body: 'When a rider on an Uber for Business account asks whether a trip is covered, check the trip\'s program rules before answering. If the rider is on an unlimited program, all rides during work hours qualify. If they\'re on a capped monthly program, tell them their remaining balance and ask if they want to proceed knowing the overage will bill to their personal card. Don’t approve or deny expense reports directly. Point riders to the "Trip receipts and expensing" article, and escalate disputes over a declined trip to a human agent instead of guessing at policy.',
      enabled: true,
      editor: {
        insights: {
          timesApplied: '2,999',
          conversations: '1,600',
          resolutions: '1,244 (85%)',
        },
        appliedUseCases: ['Order status', 'Order shipped but hasn’t arrived'],
        channels: ['Widget', 'Headless'],
        preview: {
          ask: 'Is my ride to the airport covered by my company account?',
          reply: [
            'Let me check your program before I answer.',
            'You’re on a capped monthly program with $84 of your $400 allowance left, so this trip is covered.',
            'If it does run over, the overage bills to your personal card — would you like to book it anyway?',
            'Receipts and expensing are covered in “Trip receipts and expensing”. I can’t approve or deny an expense report myself, so if a trip has already been declined I’ll pass you to a teammate.',
          ],
          useCase: 'Business trip expense eligibility (Live)',
          policy: 'Check the program rules first, and never approve or deny a report',
          source: [
            'Business trip expenses — Trip receipts and expensing',
            'Rides on an unlimited program qualify automatically during work hours. Capped programs bill any overage to the rider’s personal payment method.',
          ],
        },
      },
    },
    {
      id: 'account-plan',
      name: 'Account plan',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget', 'Voice'],
      segments: ['Riders', 'Business riders'],
      articles: ['Account center'],
      body: 'Do not use "personal, personal plus, or premium" names when responding to account plans or tier questions. Only reference "Bronze, Silver and Gold".',
      enabled: true,
      editor: {
        insights: {
          timesApplied: '2,105',
          conversations: '1,210',
          resolutions: '1,041 (86%)',
        },
        appliedUseCases: ['Account plan details', 'Tier eligibility'],
        channels: ['Widget', 'Voice'],
        preview: {
          ask: 'What’s the difference between Personal Plus and Premium?',
          reply: [
            'Our plans are Bronze, Silver and Gold — there’s no Personal Plus or Premium tier.',
            '• Bronze — pay as you go, no monthly fee',
            '• Silver — discounted rides and priority support',
            '• Gold — everything in Silver, plus fee-free cancellations',
            'Want the full details for any of them?',
          ],
          useCase: 'Account plan details (Live)',
          policy: 'Name only the Bronze, Silver and Gold tiers',
          source: [
            'Account center — Plans and tiers',
            'Bronze, Silver and Gold are the current plan names. The legacy names (Personal, Personal Plus, Premium) were retired and are not used in customer-facing answers.',
          ],
        },
      },
    },
  ],
}

const CONTENT_SNIPPETS: KnowledgeTabContent = {
  description:
    'Create short, standalone pieces of knowledge that help your agent answer accurately without publishing a help center article.',
  metrics: [
    { key: 'active-snippets', label: 'Active content snippets', value: '23' },
    {
      key: 'times-applied',
      label: 'Times applied',
      value: '8,000',
      delta: { amount: '12%', trend: 'up' },
    },
    {
      key: 'conversations',
      label: 'Conversations',
      value: '2,500',
      delta: { amount: '6%', trend: 'down' },
    },
    {
      key: 'resolutions',
      label: 'Resolutions',
      value: '2,000',
      sub: '85%',
      delta: { amount: '2.1%', trend: 'up' },
    },
  ],
  bodyColumn: 'Content snippet',
  filter: { label: 'Filter by', kind: 'dropdown' },
  entries: [
    {
      id: 'how-ride-pricing-works',
      name: 'How ride pricing works',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget', 'Headless', 'Voice'],
      segments: ['Riders'],
      articles: ['Ride billing'],
      body: 'How Ride Pricing Works\nHow are prices calculated?\nPrices are estimated using data from completed trips, based on:\nRide demand volume\nTraffic\nTolls\nBusiness products with add-ons (like priority pick-up) may cost more.\nUpfront pricing\nIn most cities, you’ll see an upfront price when booking. It’s based on estimated trip length and may include:\nBase rate\nTolls and surcharges\nHigh-demand pricing\nBooking fee\nRoute-based adjustments\nYou’re charged the upfront price when the trip ends. In rare cases, the final price may differ.\nNote: On Uber Health and Central, upfront pricing applies to scheduled and immediate rides; flexible rides show price estimates only. Some cities don’t support upfront pricing, or only offer it for real-time rides.\nWill I pay tolls or surcharges?\nEstimated tolls and surcharges may apply to:\nTrips to/from airports, events, seaports, stadiums, and other venues\nGovernment fees on rideshare services',
      enabled: true,
      snippetEditor: {
        insights: {
          timesApplied: '2,999',
          conversations: '1,600',
          resolutions: '1,244 (85%)',
        },
        targetedArticle: 'Troubleshooting login issues',
        settingsName: 'How to recover my points',
        channels: ['Widget', 'Headless', 'Voice'],
        suggestionCount: 2,
        preview: {
          ask: 'Help me recover my points',
          reply: [
            'You can recover missing points within 3 days of your receipt. Quick check first:',
            '• Checkout date within the offer window',
            '• All required items on one receipt',
            '• Eligible retailer',
            '• Spend minimum met (after coupons, pre-tax)',
            '• Card used, if required',
            'All good? Send your receipt or order number and I’ll file it.',
          ],
          useCase: 'Recover points (Live)',
          policy: 'Thank the customer for reaching out and provide them guidance',
          source: [
            'How to Recover my Points',
            'Notice a mistake on a recent receipt? You can get your missing points quickly by recovering your points within three days of submission.',
            'Before you request a correction, check these common blockers:',
            'Offer dates: Your receipt’s checkout date must fall within the offer’s valid period. Purchases made before an offer begins or after it ends aren’t eligible.',
          ],
        },
      },
    },
    {
      id: 'vip-account-inactive',
      name: 'VIP account is inactive',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget'],
      segments: ['Riders'],
      articles: ['Account management'],
      body: 'If the VIP account is inactive or suspended, surface reactivation steps and hide general feature usage articles. If the VIP user reports a login issue from a mobile device, prioritize mobile login troubleshooting articles and ignore desktop-specific content.',
      enabled: false,
    },
    {
      id: 'billing-for-premium-plan',
      name: 'Billing for premium plan',
      updatedOn: 'Feb 23, 2026',
      channels: ['Widget', 'Headless', 'Voice'],
      segments: ['Business riders'],
      articles: ['Ride billing'],
      body: "Billing for Premium Plan\nWhat's included in Premium\nPremium plan billing covers your subscription fee plus any usage-based charges that exceed your plan's included limits.\nBilling cycle...",
      enabled: true,
    },
  ],
}

export const KNOWLEDGE_CONTENT: Record<KnowledgeTab, KnowledgeTabContent> = {
  'Knowledge coaching': COACHING,
  'Content snippets': CONTENT_SNIPPETS,
}
