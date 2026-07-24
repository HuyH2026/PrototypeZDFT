import { describe, expect, it } from 'vitest'
import { CHANNELS, CONV_CHANNEL_TABS, type ChannelKey } from './conversations-data'

const KEYS: ChannelKey[] = ['widget', 'voice', 'webcall', 'headless']

describe('conversations-data', () => {
  it('exposes a tab per channel key', () => {
    expect(CONV_CHANNEL_TABS.map((t) => t.id)).toEqual(KEYS)
  })

  it('every channel has non-empty cards, columns and rows', () => {
    for (const k of KEYS) {
      expect(CHANNELS[k].cards.length).toBeGreaterThan(0)
      expect(CHANNELS[k].columns.length).toBeGreaterThan(0)
      expect(CHANNELS[k].rows.length).toBeGreaterThan(0)
    }
  })

  it('headless carries the three A2A cards and a Source column', () => {
    const titles = CHANNELS.headless.cards.map((c) => c.title)
    expect(titles).toContain('Conversation source')
    expect(titles).toContain('Top A2A solve agents')
    expect(titles).toContain('Top A2A calling clients')
    expect(CHANNELS.headless.columns.map((c) => c.id)).toContain('source')
    expect(CHANNELS.headless.cards.filter((c) => c.kind === 'ranked')).toHaveLength(2)
  })

  it('non-headless channels omit A2A cards and the Source/client columns', () => {
    for (const k of ['widget', 'voice', 'webcall'] as ChannelKey[]) {
      const titles = CHANNELS[k].cards.map((c) => c.title)
      expect(titles).not.toContain('Top A2A solve agents')
      expect(titles).not.toContain('Top A2A calling clients')
      const cols = CHANNELS[k].columns.map((c) => c.id)
      expect(cols).not.toContain('source')
      expect(cols).not.toContain('client')
    }
  })

  it('all channels share the six generic card titles', () => {
    const shared = ['Total conversations', 'Deflections', 'Resolutions', 'Sentiment', 'Relevance', 'Engagement']
    for (const k of KEYS) {
      const titles = CHANNELS[k].cards.map((c) => c.title)
      for (const s of shared) expect(titles).toContain(s)
    }
  })

  it('headless has at least one gap row and one non-gap row', () => {
    const rows = CHANNELS.headless.rows
    expect(rows.some((r) => r.hasGap)).toBe(true)
    expect(rows.some((r) => !r.hasGap)).toBe(true)
  })
})
