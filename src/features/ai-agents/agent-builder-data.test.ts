import { describe, it, expect } from 'vitest'
import { CHANNELS, type ChannelKey } from './agent-builder-data'

const METRIC_KEYS = ['chats', 'resolutions', 'fallback', 'csat', 'cost']
const CHANNEL_KEYS: ChannelKey[] = ['widget', 'voice', 'webcall', 'headless']
const AGENT_COUNTS: Record<ChannelKey, number> = { widget: 3, voice: 2, webcall: 1, headless: 4 }

describe('agent-builder-data', () => {
  it('defines the four channels in order', () => {
    expect(CHANNELS.map((c) => c.key)).toEqual(CHANNEL_KEYS)
  })

  it('gives every channel exactly five metrics in fixed key order', () => {
    for (const c of CHANNELS) {
      expect(c.metrics.map((m) => m.key)).toEqual(METRIC_KEYS)
    }
  })

  it('gives each channel its authored agent count', () => {
    for (const c of CHANNELS) {
      expect(c.agents).toHaveLength(AGENT_COUNTS[c.key])
    }
  })

  it('gives every channel at least one On agent and one subagent', () => {
    for (const c of CHANNELS) {
      expect(c.agents.some((a) => a.on)).toBe(true)
      expect(c.agents.some((a) => a.isSubagent)).toBe(true)
    }
  })

  it('authors every deflectionRate as a percentage string', () => {
    for (const c of CHANNELS) {
      for (const a of c.agents) {
        expect(a.deflectionRate).toMatch(/^\d+%$/)
      }
    }
  })

  it('matches the Figma-exact Widget headline metric', () => {
    const widget = CHANNELS.find((c) => c.key === 'widget')!
    const chats = widget.metrics.find((m) => m.key === 'chats')!
    expect(chats.value).toBe('21,590')
    expect(widget.agents.map((a) => a.name)).toEqual([
      'Knowledge Retrieval', 'Fallback', 'Service cancellation',
    ])
  })
})
