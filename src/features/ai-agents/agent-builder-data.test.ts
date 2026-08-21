import { describe, it, expect } from 'vitest'
import { CHANNELS, type ChannelKey } from './agent-builder-data'

const METRIC_KEYS = ['chats', 'resolutions', 'fallback', 'csat', 'cost']
const VOICE_METRIC_KEYS = [
  'inboundCalls',
  'eligibleCalls',
  'talkTime',
  'avgTalkTime',
  'resolutions',
  'sentiment',
  'csat',
  'cost',
]
const CHANNEL_KEYS: ChannelKey[] = ['widget', 'email', 'webcall', 'voice', 'headless']
const AGENT_COUNTS: Record<ChannelKey, number> = {
  widget: 21,
  // 6 inbound + the frame 112:51124 outbound trio (Payment, Product Selection,
  // Refund Subscription).
  voice: 9,
  webcall: 4,
  headless: 4,
  email: 1,
}
// The Webcall frame (120:57534) draws its own eight-tile strip.
const WEBCALL_METRIC_KEYS = [
  'chats',
  'talk',
  'avg-talk',
  'resolutions',
  'fallback',
  'sentiment',
  'csat',
  'cost',
]

describe('agent-builder-data', () => {
  it('defines the four channels in order', () => {
    expect(CHANNELS.map((c) => c.key)).toEqual(CHANNEL_KEYS)
  })

  it('gives every non-Voice, non-Webcall channel exactly five metrics in fixed key order', () => {
    for (const c of CHANNELS.filter((c) => c.key !== 'voice' && c.key !== 'webcall')) {
      expect(c.metrics.map((m) => m.key)).toEqual(METRIC_KEYS)
    }
  })

  it('gives Webcall the frame\'s eight metrics', () => {
    const webcall = CHANNELS.find((c) => c.key === 'webcall')!
    expect(webcall.metrics.map((m) => m.key)).toEqual(WEBCALL_METRIC_KEYS)
  })

  it('gives Voice eight metrics for both Inbound and Outbound', () => {
    const voice = CHANNELS.find((c) => c.key === 'voice')!
    expect(voice.metrics.map((m) => m.key)).toEqual(VOICE_METRIC_KEYS)
    // Outbound's tiles are their own set (frame 112:51124), not the inbound keys.
    expect(voice.outboundMetrics?.map((m) => m.key)).toEqual([
      'outboundCalls',
      'eligibleCalls',
      'engaged',
      'followUpAsks',
      'avgTalkTime',
      'sentiment',
      'cost',
      'talkTime',
    ])
  })

  it('gives each channel its authored agent count', () => {
    for (const c of CHANNELS) {
      expect(c.agents).toHaveLength(AGENT_COUNTS[c.key])
    }
  })

  it('gives every channel at least one On use case and one subflow', () => {
    // Webcall seeds from its frame (120:57534): three On rows, none of them a
    // subflow — the frame's subflows are only implied by the "Active subflows"
    // tab, which filters the same list.
    for (const c of CHANNELS) {
      expect(c.agents.some((a) => a.on)).toBe(true)
      if (c.key === 'webcall') continue
      expect(c.agents.some((a) => a.isSubflow)).toBe(true)
    }
  })

  it('authors every resolution rate as a percentage string', () => {
    for (const c of CHANNELS) {
      for (const a of c.agents) {
        // The webcall frame prints "n/a" for the built-in Fallback row and for
        // zero-traffic use cases.
        if (a.resolutionRate === 'n/a') continue
        expect(a.resolutionRate).toMatch(/^\d+%$/)
      }
    }
  })

  it('matches the Figma-exact Widget headline metric', () => {
    const widget = CHANNELS.find((c) => c.key === 'widget')!
    const chats = widget.metrics.find((m) => m.key === 'chats')!
    const cost = widget.metrics.find((m) => m.key === 'cost')!
    expect(chats.value).toBe('21,590')
    expect(cost.value).toBe('$706,8K')
    expect(widget.agents.map((a) => a.name)).toEqual([
      'Knowledge Retrieval',
      'Fallback',
      'Service cancellation',
      'Login Help',
      'Tax document processing',
      'Trouble with integration',
      'Product recommendations',
      'Password Reset',
      'Track order',
      'Modify order',
      'Cancel order',
      'Report missing/damaged item',
      'Delivery proof request',
      'Pause subscription',
      'Resume subscription',
      'Failed payment recovery',
      'Change plan',
      'Add/update payment method',
      'Dispute charge',
      'Apply promo code',
      'Split payment help',
    ])
  })

  it('uses the updated channel labels from the frame', () => {
    expect(CHANNELS.map((channel) => channel.label)).toEqual([
      'Widget',
      'Email',
      'Web Call',
      'Voice',
      'Headless',
    ])
  })

  it('splits Voice agents into 6 Inbound and 3 Outbound, each carrying its table’s fields', () => {
    const voice = CHANNELS.find((c) => c.key === 'voice')!
    const inbound = voice.agents.filter((a) => a.callDirection === 'inbound')
    const outbound = voice.agents.filter((a) => a.callDirection === 'outbound')
    expect(inbound).toHaveLength(6)
    // Frame 112:51124: Payment, Product Selection (Subflow), Refund Subscription.
    expect(outbound).toHaveLength(3)
    expect(outbound.map((a) => a.name)).toEqual(['Payment', 'Product Selection', 'Refund Subscription'])
    for (const a of inbound) {
      expect(a.segment).toBeTruthy()
      expect(a.totalTalkTime).toBeTruthy()
      expect(a.avgTalkTime).toBeTruthy()
      expect(a.sentiment).toBeTruthy()
      expect(a.status).toBeTruthy()
      expect(a.lastModified?.at).toBeTruthy()
      expect(a.lastModified?.by).toBeTruthy()
    }
    for (const a of outbound) {
      expect(a.segment).toBeTruthy()
      expect(a.useCaseId).toBeTruthy()
      expect(a.voicemailLeft).toBeTruthy()
      expect(['Outbound', 'Subflow']).toContain(a.type)
    }
  })
})
