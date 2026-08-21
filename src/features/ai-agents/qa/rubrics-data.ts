// Mock rubrics for the AI QA screen (/agent-builder/ai-qa) — frame 1545:321852.
// Names and definitions are transcribed verbatim from the design (vendor copy;
// the Empathy definition really does describe factual correctness rather than
// empathy — that is the frame's copy, not a transcription slip). No backend.

export type RubricChannel = {
  // A channel the rubric scores, plus the segments it is scoped to within that
  // channel. An empty `segments` means the whole channel.
  channel: string
  segments: string[]
}

export type RubricTestResult = {
  conversationId: string
  label: string
  score: number | null
  predictionReasoning: string
}

export type RubricScoring = {
  format: 'Numerical Scale'
  minimum: number
  maximum: number
  definition: string
  performanceGoal: number | null
}

export type Rubric = {
  id: string
  name: string
  enabled: boolean
  updatedOn: string
  channels: RubricChannel[]
  definition: string
  scoring: RubricScoring
  testMethod: 'Test 10 recent completed conversations'
  testResults: RubricTestResult[]
  // Communication & Tone alone carries this badge in the frame: the rubric is
  // scored but held out of the aggregate score.
  excludedFromAverage?: boolean
}

const EMPATHY_TEST_RESULTS: RubricTestResult[] = [
  {
    conversationId: '01acd89f-d859-4d1c-9027-fc6c06b0bc24',
    label: 'Meets criteria',
    score: 92,
    predictionReasoning:
      "The response acknowledges the customer's concern, validates their frustration, and offers a clear next step.",
  },
  {
    conversationId: '01b4a763-f515-49a3-bd10-7c12a6f425da',
    label: 'Meets criteria',
    score: 95,
    predictionReasoning:
      'The agent uses warm, specific language and confirms ownership before explaining the resolution.',
  },
  {
    conversationId: '021a0772-cf86-4fd5-a271-9a72418ec8c1',
    label: 'Not scored',
    score: null,
    predictionReasoning:
      'The conversation contains only an automated acknowledgement, so there is not enough agent response to evaluate.',
  },
  {
    conversationId: '03f20c25-c49c-4534-aa70-0f73bce8957b',
    label: 'Meets criteria',
    score: 94,
    predictionReasoning:
      'The response recognizes the inconvenience and reassures the customer without sounding scripted.',
  },
  {
    conversationId: '04ae3791-8e13-4d69-b4e8-4a9af8081855',
    label: 'Meets criteria',
    score: 90,
    predictionReasoning:
      'The agent is polite and supportive, but could more directly reflect the impact described by the customer.',
  },
  {
    conversationId: '05dc46e8-84c2-445d-9694-0d2988b1ead2',
    label: 'Needs attention',
    score: 68,
    predictionReasoning:
      'The answer provides the correct policy but moves to instructions before acknowledging the customer’s frustration.',
  },
  {
    conversationId: '068caeb5-132c-4e3c-a8fb-c88ea8b8c589',
    label: 'Meets criteria',
    score: 88,
    predictionReasoning:
      'The agent apologizes, explains what happened, and offers a helpful resolution in a calm tone.',
  },
  {
    conversationId: '074ae006-dbee-48ae-a4cd-91bb34aa543b',
    label: 'Meets criteria',
    score: 97,
    predictionReasoning:
      'The response mirrors the customer’s concern, confirms accountability, and sets a reassuring expectation.',
  },
  {
    conversationId: '08af665b-a055-41c2-a6f9-255cad644c16',
    label: 'Needs attention',
    score: 72,
    predictionReasoning:
      'The resolution is complete, but the response is transactional and does not acknowledge the customer’s experience.',
  },
  {
    conversationId: '09752680-f874-4762-9df5-b83204d199c7',
    label: 'Meets criteria',
    score: 91,
    predictionReasoning:
      'The agent validates the concern and keeps a warm, professional tone while resolving the issue.',
  },
]

function testResultsFor(
  label: string,
  scoreOffset = 0,
  focus = 'the configured rubric',
): RubricTestResult[] {
  return EMPATHY_TEST_RESULTS.map((result) => {
    const score =
      result.score == null ? null : Math.max(0, Math.min(100, result.score + scoreOffset))

    return {
      ...result,
      label: score == null ? 'Not scored' : label,
      score,
      predictionReasoning:
        score == null
          ? result.predictionReasoning
          : score >= 80
            ? `The response satisfies ${focus} and provides enough evidence for a confident score.`
            : `The response partially satisfies ${focus}, but one or more expected signals are missing or underdeveloped.`,
    }
  })
}

const DEFAULT_SCORING_DEFINITION =
  'A score of 100 indicates that all applicable criteria have been met in the response. Deduct 20 from 100 if any applicable criterion is not met in the response.'

export const RUBRICS: Rubric[] = [
  {
    id: 'churn-risk-signal',
    name: 'Churn risk signal',
    enabled: true,
    updatedOn: 'Feb 23, 2025',
    channels: [
      { channel: 'Widget', segments: ['Riders'] },
      { channel: 'Headless', segments: [] },
    ],
    definition: `Analyze the conversation for signals that the customer may be considering leaving or is at elevated risk of churn. Evaluate:

1. Did the customer explicitly mention canceling, downgrading, or switching to a competitor?
2. Did they question the value of the product/service ("I'm paying $X and still can't...")?
3. Did they reference repeated issues or a pattern of problems ("This is the third time...")?
4. Was there escalating frustration, especially tied to unresolved issues?
5. Did they mention upcoming decisions like contract renewal?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 4,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('Risk assessed', -6, 'the churn-risk criteria'),
  },
  {
    id: 'empathy',
    name: 'Empathy',
    enabled: true,
    updatedOn: 'Feb 23, 2025',
    channels: [
      { channel: 'Widget', segments: ['Riders'] },
      { channel: 'Email', segments: [] },
      { channel: 'Voice', segments: ['Business Riders'] },
    ],
    definition: `Measures whether the response acknowledges the customer's concern and demonstrates understanding of their situation. Evaluate:

1. Does the response validate the customer's frustration or inconvenience?
2. Is the tone warm and supportive rather than transactional?
3. Does it reflect the impact described by the customer before moving to resolution?
4. Does it reassure without sounding scripted?
5. Does it maintain a calm, professional demeanor while showing genuine care?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 4,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: EMPATHY_TEST_RESULTS,
  },
  {
    id: 'communication-and-tone',
    name: 'Communication & Tone',
    enabled: true,
    updatedOn: 'Feb 23, 2025',
    excludedFromAverage: true,
    channels: [
      { channel: 'Widget', segments: ['Riders'] },
      { channel: 'Voice', segments: [] },
    ],
    definition:
      'This metric evaluates how clearly and professionally the response is written, and whether the tone is appropriate for the context and aligned with the brand voice. It considers clarity, grammar, and whether the tone is friendly, empathetic, or professional.',
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 4,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('On brand', 1, 'the communication and tone criteria'),
  },
  {
    id: 'prompt-injection-detection',
    name: 'Prompt Injection Detection',
    enabled: true,
    updatedOn: 'Feb 23, 2025',
    channels: [{ channel: 'Widget', segments: [] }],
    definition: 'This rubric is used to detect if the user tried to attack the system or not.',
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition:
        'A score of 100 means no prompt injection attempt was present. A score of 0 means the conversation contains a clear attempt to override or expose system instructions.',
      performanceGoal: 5,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('No injection detected', 3, 'the prompt-injection safety criteria'),
  },
  // New rubrics addressing identified gaps
  {
    id: 'compliance-adherence',
    name: 'Compliance adherence',
    enabled: true,
    updatedOn: 'Aug 19, 2026',
    channels: [
      { channel: 'Widget', segments: [] },
      { channel: 'Email', segments: [] },
      { channel: 'Voice', segments: [] },
    ],
    definition: `Assess whether the response follows regulatory and company policy requirements. Evaluate:

1. Does it collect required disclosures or consents (GDPR, CCPA, terms)?
2. Does it avoid making unauthorized commitments or promises?
3. Does it handle sensitive data (PII, payment info) according to policy?
4. Does it escalate appropriately when policy requires human review?
5. Does it cite correct policies and not contradict them?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 5,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('Compliant', -4, 'compliance requirements'),
  },
  {
    id: 'brand-voice-consistency',
    name: 'Brand voice consistency',
    enabled: true,
    updatedOn: 'Aug 19, 2026',
    channels: [
      { channel: 'Widget', segments: ['Riders'] },
      { channel: 'Email', segments: [] },
    ],
    definition: `Measure whether the response aligns with the company's established brand voice and tone guidelines. Evaluate:

1. Does the language match the brand's personality (formal, friendly, professional)?
2. Are key brand terms and product names used correctly?
3. Is the tone appropriate for the situation (apologetic for errors, celebratory for wins)?
4. Does it avoid contradicting brand positioning or values?
5. Does it feel authentic to this brand, not generic support copy?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 4,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('On brand', 2, 'brand voice guidelines'),
  },
  {
    id: 'fact-verification',
    name: 'Fact verification',
    enabled: true,
    updatedOn: 'Aug 19, 2026',
    channels: [
      { channel: 'Widget', segments: [] },
      { channel: 'Voice', segments: [] },
    ],
    definition: `Verify that all factual claims in the response are accurate and properly sourced. Evaluate:

1. Are cited articles, policies, or prices current and correct?
2. Are numeric details (fees, limits, timelines) accurate?
3. Are product features and availability described correctly?
4. Does the response avoid speculation presented as fact?
5. When uncertain, does it acknowledge gaps rather than guessing?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 5,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('Accurate', -3, 'fact-verification standards'),
  },
  {
    id: 'handoff-quality',
    name: 'Handoff quality',
    enabled: true,
    updatedOn: 'Aug 19, 2026',
    channels: [
      { channel: 'Widget', segments: [] },
      { channel: 'Email', segments: [] },
      { channel: 'Voice', segments: [] },
    ],
    definition: `Assess the quality of context provided when handing off to another agent or team. Evaluate:

1. Is the problem summarized clearly without requiring the next agent to re-read everything?
2. Are relevant IDs, account details, and actions already taken included?
3. Is the routing decision explained so the next agent knows why they received it?
4. Is urgency and any SLA context communicated?
5. Does the customer know what to expect (who will help, when, what happens next)?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 4,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('Clear handoff', -1, 'handoff quality criteria'),
  },
  {
    id: 'deescalation-effectiveness',
    name: 'De-escalation effectiveness',
    enabled: true,
    updatedOn: 'Aug 19, 2026',
    channels: [
      { channel: 'Email', segments: [] },
      { channel: 'Voice', segments: [] },
    ],
    definition: `Measure how effectively the response reduces customer frustration and tension. Evaluate:

1. Does it acknowledge the customer's frustration without being defensive?
2. Does it focus on solutions rather than explanations or excuses?
3. Does it avoid escalatory language (challenging, blaming, dismissing)?
4. Does it de-escalate by offering control (choices, next steps, timeline)?
5. Does the tone shift appropriately as the customer's sentiment improves or worsens?`,
    scoring: {
      format: 'Numerical Scale',
      minimum: 0,
      maximum: 100,
      definition: DEFAULT_SCORING_DEFINITION,
      performanceGoal: 4,
    },
    testMethod: 'Test 10 recent completed conversations',
    testResults: testResultsFor('De-escalated', 0, 'de-escalation techniques'),
  },
]

export const NEW_RUBRIC_TEMPLATE: Rubric = {
  id: 'new-rubric',
  name: 'Resolution completeness',
  enabled: false,
  updatedOn: 'Aug 13, 2026',
  channels: [
    { channel: 'Widget', segments: ['Riders'] },
    { channel: 'API', segments: [] },
    { channel: 'Voice', segments: ['Business Riders'] },
  ],
  definition: `Evaluate whether the response fully resolves the customer's request. Confirm that it:

1. Answers every question the customer asked.
2. Gives the next action, owner, and expected timing.
3. Calls out any limitation or follow-up that remains.`,
  scoring: {
    format: 'Numerical Scale',
    minimum: 0,
    maximum: 100,
    definition: DEFAULT_SCORING_DEFINITION,
    performanceGoal: 4,
  },
  testMethod: 'Test 10 recent completed conversations',
  testResults: testResultsFor('Complete', -2, 'the resolution-completeness criteria'),
}
