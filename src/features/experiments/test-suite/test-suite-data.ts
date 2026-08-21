// Mock data for Experiment ▸ Test Suite, authored from the August 2026 Figma
// section (node 81:90448). No backend — every figure here is illustrative.

// A stat card is either a percentage with the frame's tick meter, or a
// passing/total ratio rendered as "49 / 78".
export type TestSuiteStat =
  | { key: string; label: string; kind: 'meter'; percent: number }
  | { key: string; label: string; kind: 'ratio'; passing: number; total: number }

export const TEST_SUITE_STATS: TestSuiteStat[] = [
  { key: 'pass-rate', label: 'Pass Rate', kind: 'meter', percent: 63 },
  { key: 'passing-runs', label: 'Passing Runs', kind: 'ratio', passing: 49, total: 78 },
  { key: 'agent-coverage', label: 'Agent Coverage', kind: 'meter', percent: 2 },
]

export type LastRunStatus = 'passed' | 'failed' | 'not-run'

export type TestCase = {
  id: string
  name: string
  // The frame clamps this to two lines; the full sentence is authored here and
  // the cell does the truncating.
  scenario: string
  // Use case the test covers, shown as a dotted tag.
  useCase: string
  lastRun: { status: LastRunStatus; at: string }
  // Historical pass rate across every run of the case, whole percent. Rendered
  // teal at or above PASS_RATE_GOOD_FLOOR, red below it — which is why a case
  // can have a passing last run and still read red.
  passRate: number
}

// The frame tints 78% and 100% teal while 25% and 0% are red; 50 is the
// simplest floor consistent with all four.
export const PASS_RATE_GOOD_FLOOR = 50

export const TEST_CASES: TestCase[] = [
  {
    id: 'tc1',
    name: 'Existing booking - user accepts updates for single flight',
    scenario:
      'The user starts by saying they have uploaded a roster PDF with a single flight, then asks the agent to update their existing booking to match it.',
    useCase: 'Airline processing',
    lastRun: { status: 'failed', at: 'Jan 3, 2024 9:25 AM' },
    passRate: 78,
  },
  {
    id: 'tc2',
    name: 'Trade Execution Service - User Accepts Escalation',
    scenario:
      'The user opens with a complaint that their order to buy shares did not go through, and accepts an escalation to a human broker.',
    useCase: 'Billing',
    lastRun: { status: 'passed', at: 'Jan 3, 2024 9:25 AM' },
    passRate: 25,
  },
  {
    id: 'tc3',
    name: 'Billing Address Update - No Account ID Provided Initially',
    scenario:
      'The user uploads a document that lists a single new flight, including its flight number and date, but never provides an account ID.',
    useCase: 'Billing',
    lastRun: { status: 'passed', at: 'Jan 3, 2024 9:25 AM' },
    passRate: 100,
  },
  {
    id: 'tc4',
    name: 'Alternative Product - Sustainability',
    scenario:
      'The user initiates the chat saying: “I want to know whether the packaging is recyclable,” then asks for a more sustainable alternative.',
    useCase: 'Inquiries',
    lastRun: { status: 'failed', at: 'Jan 3, 2024 9:25 AM' },
    passRate: 0,
  },
  {
    id: 'tc5',
    name: 'Invest withdrawal',
    scenario:
      'A user contacts support and asks where their money is, without initially specifying which investment withdrawal they mean.',
    useCase: 'Withdrawals',
    lastRun: { status: 'passed', at: 'Jan 3, 2024 9:25 AM' },
    passRate: 100,
  },
]

export const RUN_STATS = [
  { key: 'total', label: 'Total Runs', value: '114', tone: 'success' },
  { key: 'passed', label: 'Passed Runs', value: '72', detail: '(63%)', tone: 'success' },
  { key: 'failed', label: 'Failed Runs', value: '42', tone: 'danger' },
] as const

export type RunResult = 'in-progress' | 'passed' | 'failed'

export type TestRun = {
  id: string
  lastRun: string
  testCase: string
  useCase: string
  result: RunResult
  reasoning: string
}

export const TEST_RUNS: TestRun[] = [
  {
    id: 'run1',
    lastRun: 'Jan 10, 2024 9:25 AM',
    testCase: 'Handles ride cancellation within grace period',
    useCase: 'Cancel my ride',
    result: 'in-progress',
    reasoning: 'n/a',
  },
  {
    id: 'run2',
    lastRun: 'Jan 9, 2024 9:40 AM',
    testCase: 'Ends conversation gracefully after resolution',
    useCase: 'Handoff',
    result: 'failed',
    reasoning:
      "The bot did not meet the user's expectation to gracefully end the conversation when the user indicated they wanted to leave.",
  },
  {
    id: 'run3',
    lastRun: 'Jan 8, 2024 9:50 AM',
    testCase: 'Escalates fraud report to human agent',
    useCase: 'Fraud investigation',
    result: 'passed',
    reasoning:
      'The bot recognized the fraud claim immediately and routed to a live agent without asking unnecessary clarifying questions.',
  },
  {
    id: 'run4',
    lastRun: 'Jan 7, 2024 1:34 PM',
    testCase: 'Directs driver to correct earnings dispute flow',
    useCase: 'Earnings per trip',
    result: 'passed',
    reasoning:
      'The bot correctly identified the earnings discrepancy and walked the driver through the payout reconciliation steps.',
  },
  {
    id: 'run5',
    lastRun: 'Jan 6, 2024 1:39 PM',
    testCase: 'Confirms trip refund eligibility',
    useCase: 'Refund request',
    result: 'failed',
    reasoning:
      'The bot approved a refund for a trip outside the eligibility window instead of checking the cancellation policy first.',
  },
  {
    id: 'run6',
    lastRun: 'Jan 5, 2024 1:39 PM',
    testCase: 'Verifies driver document upload status',
    useCase: 'Document approval',
    result: 'passed',
    reasoning:
      'The bot correctly checked document status and gave the driver an accurate timeline for approval.',
  },
]
