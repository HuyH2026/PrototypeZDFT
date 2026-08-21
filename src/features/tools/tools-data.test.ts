import { describe, it, expect } from 'vitest'
import { TOOL_TABS, TOOL_ACTIONS, NAME_COUNT, TOOL_RUNS, RUN_COUNT } from './tools-data'

describe('tools-data', () => {
  it('defines the four tabs in Figma order', () => {
    expect(TOOL_TABS).toEqual(['Available', 'Recommended', 'Authentication', 'History'])
  })

  it('leads with the five refreshed action rows in Figma order', () => {
    expect(TOOL_ACTIONS.slice(0, 5).map((action) => action.name)).toEqual([
      'Get full account information by customer ID',
      'Get earnings',
      'Reconcile payout',
      'Get flight',
      'Get Cart',
    ])
  })

  // The use-case policies name actions inline as `action` chips. Those labels are
  // only meaningful if the Actions catalog actually carries a row of that name —
  // otherwise a policy points at an action the Actions screen has never heard of.
  it('carries the actions the seeded policies name', () => {
    expect(TOOL_ACTIONS.slice(5).map((action) => action.name)).toEqual([
      'Apply 30-Day Free',
      'Schedule Day-30 Check-in',
      'Process Cancellation',
      'Create Support Ticket',
      'Send Sign-in Link',
      'Email Tax Document',
      'Rotate API Key',
      'Schedule Callback',
      'Lookup Order by Email',
      'Get Order Status',
      'Open Delivery Investigation',
      'Update Order Address',
      'Cancel Order',
      'Open Item Claim',
      'Get Delivery Proof',
      'Pause Subscription',
      'Resume Subscription',
      'Retry Payment',
      'Change Subscription Plan',
      'Add Payment Method',
      'Open Charge Dispute',
      'Apply Promo Code',
      'Create Safety Incident',
      'Contact Driver for Lost Item',
      'Submit Rating Dispute',
      'Apply Reengagement Credit',
      'Send Emergency Notification',
      'Validate Delivery Address',
      'Modify Order Items',
      'Get Delivery Windows',
      'Update Delivery Window',
      'Initiate Return',
      'Email Delivery Proof',
      'Get Subscription Details',
      'Get Available Plans',
      'Calculate Proration',
      'Get Payment Methods',
      'Update Payment Method',
      'Set Default Payment Method',
      'Lookup Charge by Amount',
      'Validate Promo Code',
      'Save Promo Code to Account',
      'Get Transaction Details',
      'Retry Single Payment',
      'Get Account Activity',
      'Reactivate Subscription',
      'Get Payment Failure Details',
      'Cancel Subscription',
      'Get Rating Details',
      'Share Trip Status',
    ])
  })

  it('gives every action a unique id', () => {
    expect(new Set(TOOL_ACTIONS.map((a) => a.id)).size).toBe(TOOL_ACTIONS.length)
  })

  it('matches the designed type, state, conversation, and use-case values', () => {
    expect(TOOL_ACTIONS[0]).toMatchObject({
      id: 't1',
      type: 'API',
      state: 'Live',
      conversations: 100,
      useCase: 'Account details',
    })
    expect(TOOL_ACTIONS[2]).toMatchObject({
      id: 't3',
      type: 'Imported',
      state: 'Live',
      conversations: 1_000,
      inputParameters: ['Store ID'],
    })
    expect(TOOL_ACTIONS[4]).toMatchObject({
      type: 'Browser',
      state: 'Auto-saved',
      useCase: null,
    })
  })

  it('uses static catalog and run counts of 113', () => {
    expect(NAME_COUNT).toBe(113)
    expect(RUN_COUNT).toBe(113)
  })
})

describe('tools-data (history)', () => {
  it('defines the six refreshed history runs', () => {
    expect(TOOL_RUNS).toHaveLength(6)
    expect(TOOL_RUNS.map((run) => run.name)).toEqual([
      'Get flight',
      'Freeze Card',
      'Get Cart',
      'Freeze Card',
      'Get Account Info',
      'Cancel order',
    ])
  })

  it('covers all three statuses and the designed channel mix', () => {
    expect(new Set(TOOL_RUNS.map((run) => run.status))).toEqual(
      new Set(['In progress', 'Completed', 'Failed']),
    )
    expect(TOOL_RUNS.map((run) => run.channel)).toEqual([
      'Headless',
      'Voice',
      'Web Call',
      'Voice',
      'Widget',
      'Voice',
    ])
  })
})
