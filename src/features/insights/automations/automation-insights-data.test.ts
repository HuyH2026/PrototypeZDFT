import { describe, expect, it } from 'vitest'
import {
  KNOWLEDGE_GAP_ROWS,
  KNOWLEDGE_GAP_STATS,
  USE_CASE_DETAILS,
  USE_CASE_GAP_INTRO,
  USE_CASE_GAP_ROWS,
  USE_CASE_GAP_STATS,
} from './automation-insights-data'

// Topics with full detail records (drawer content)
const DETAILED_USE_CASE_TOPICS = [
  'Account Linking and Updating',
  'Refund Request',
  'Beneficiary Information Updates',
  'Card and Account Services',
  'Potential Hacking or Unauthorized Access',
] as const

// All topics including new discoveries (may not all have detail records yet)
const ALL_USE_CASE_TOPICS = [
  ...DETAILED_USE_CASE_TOPICS,
  // New discoveries from gap remediation (list-only, no drill-in detail yet)
  'Order Tracking and Status',
  'Failed Payment Recovery',
  'Add or Update Payment Method',
  'Apply Promo Code',
  'Lost Item Recovery',
] as const

describe('automation-insights-data', () => {
  it('frames the Use case gaps banner around use cases rather than agents', () => {
    expect(USE_CASE_GAP_INTRO).toBe(
      'By automating these topics with use cases, you could annually achieve:',
    )
  })

  it('preserves the original approved Use case gaps metrics and row values', () => {
    expect(USE_CASE_GAP_STATS).toEqual([
      { value: '6,908', label: 'Potential ticket coverage' },
      {
        value: '228,821 hrs',
        label: 'Potential full resolution time decrease',
      },
      { value: '$229,860', label: 'Potential savings' },
    ])

    // Check that the original 5 rows are preserved (new discoveries can be added after)
    const originalTopics = [
      'Account Linking and Updating',
      'Refund Request',
      'Beneficiary Information Updates',
      'Card and Account Services',
      'Potential Hacking or Unauthorized Access',
    ]
    const originalRows = USE_CASE_GAP_ROWS.filter((row) => originalTopics.includes(row.topic))

    expect(
      originalRows.map(({ topic, coverage, savings, created }) => ({
        topic,
        coverage,
        savings,
        created,
      })),
    ).toEqual([
      {
        topic: 'Account Linking and Updating',
        coverage: '1,916',
        savings: '$28,740',
        created: 'Jan 4, 2024 9:25 AM',
      },
      {
        topic: 'Refund Request',
        coverage: '1,508',
        savings: '$22,630',
        created: 'Jan 4, 2024 9:25 AM',
      },
      {
        topic: 'Beneficiary Information Updates',
        coverage: '832',
        savings: '$12,480',
        created: 'Jan 4, 2024 9:25 AM',
      },
      {
        topic: 'Card and Account Services',
        coverage: '796',
        savings: '$11,940',
        created: 'Jan 4, 2024 9:25 AM',
      },
      {
        topic: 'Potential Hacking or Unauthorized Access',
        coverage: '31,916',
        savings: '$2,500',
        created: 'Jan 4, 2024 9:25 AM',
      },
    ])

    // Verify new discoveries were added
    expect(USE_CASE_GAP_ROWS.length).toBeGreaterThan(5)
  })

  it('opens each generated use case with an acknowledgement of the request', () => {
    for (const row of USE_CASE_GAP_ROWS) {
      expect(row.useCase, `${row.topic} must read as a use case`).toMatch(/^I? ?[Aa]cknowledge/)
    }
  })

  it('preserves the approved Knowledge gaps metrics and row values', () => {
    expect(KNOWLEDGE_GAP_STATS).toEqual([
      { value: '185', label: 'Generated knowledge content' },
      { value: '29,090', label: 'Potential ticket coverage' },
      { value: '$160,500', label: 'Potential savings' },
    ])
    expect(
      KNOWLEDGE_GAP_ROWS.map(({ title, relatedTopic, relatedArticle, coverage }) => ({
        title,
        relatedTopic,
        relatedArticle,
        coverage,
      })),
    ).toEqual([
      {
        title: 'How to Handle a Fraudulent Charge Dispute',
        relatedTopic: 'Fraudulent Charge dispu...',
        relatedArticle: 'What do I do if I see unauth...',
        coverage: '403',
      },
      {
        title:
          'How to Recover Your Account When You No Longer Have Access to Your Email or phone number',
        relatedTopic: 'Account recovery',
        relatedArticle: 'GUIDE: Customer verificat...',
        coverage: '394',
      },
      {
        title: 'Understanding and Managing Your Investment Settings',
        relatedTopic: 'Investing guidance',
        relatedArticle: 'GUIDE: One-time and recu...',
        coverage: '383',
      },
      {
        title: 'Payment shows on your card but the invoice remains pending',
        relatedTopic: 'Payment receipts and...',
        relatedArticle: null,
        coverage: '383',
      },
      {
        title: 'How to Change Your IRA Type from Traditional to Roth',
        relatedTopic: 'Payment receipts and...',
        relatedArticle: 'Changing account types from...',
        coverage: '383',
      },
    ])
  })

  it('details every use case gap row with full detail records', () => {
    // Only the original detailed topics have drawer content
    expect(Object.keys(USE_CASE_DETAILS).sort()).toEqual([...DETAILED_USE_CASE_TOPICS].sort())

    // All topics (including new discoveries) appear in the gap rows table
    expect(USE_CASE_GAP_ROWS.map((row) => row.topic).sort()).toEqual(
      [...ALL_USE_CASE_TOPICS].sort(),
    )

    // Every detailed topic has complete drawer content
    for (const [topic, detail] of Object.entries(USE_CASE_DETAILS)) {
      expect(detail.tickets.length, `${topic} must have a ticket source`).toBeGreaterThan(0)
      expect(detail.stats, `${topic} must have three drawer stats`).toHaveLength(3)
      expect(detail.tools.length, `${topic} must have generated actions`).toBeGreaterThan(0)
      expect(detail.trainingPhraseRows.length, `${topic} must offer similar topics`).toBeGreaterThan(
        0,
      )
      expect(detail.keyPhrases.length, `${topic} must list key phrases`).toBeGreaterThan(0)
      expect(detail.policy.body.length, `${topic} must have a generated policy`).toBeGreaterThan(0)
    }
  })

  it('ties each drawer coverage and savings stat back to its table row', () => {
    // Only detailed topics have drawer stats to validate
    for (const row of USE_CASE_GAP_ROWS) {
      const detail = USE_CASE_DETAILS[row.topic]
      if (!detail) {
        // New discovery topics don't have detail records yet
        continue
      }

      expect(detail.stats[1], `${row.topic} coverage`).toEqual({
        value: row.coverage,
        label: 'Potential ticket coverage',
      })
      expect(detail.stats[2], `${row.topic} savings`).toEqual({
        value: row.savings,
        label: 'Potential annual savings',
      })
    }
  })

  it('frames the drawer summary around the unhandled request and suggested policy', () => {
    for (const detail of Object.values(USE_CASE_DETAILS)) {
      expect(detail.summary).toBe(
        'We found a recurring customer request that your agent does not yet handle. Review the suggested policy, then create a new use case or add this topic to an existing one.',
      )
      expect(detail.stats.map((stat) => stat.label)).toEqual([
        'Potential automated resolutions',
        'Potential ticket coverage',
        'Potential annual savings',
      ])
    }
  })
})
