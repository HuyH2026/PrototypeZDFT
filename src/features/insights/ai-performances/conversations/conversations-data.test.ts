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

  it("the transcript column's label matches the channel's convHeader", () => {
    for (const k of KEYS) {
      const transcriptCol = CHANNELS[k].columns.find((c) => c.id === 'transcript')
      expect(transcriptCol?.label).toBe(CHANNELS[k].convHeader)
    }
  })

  it('every row carries a populated detail', () => {
    for (const k of KEYS) {
      for (const row of CHANNELS[k].rows) {
        expect(row.detail.conversationId.length).toBeGreaterThan(0)
        expect(row.detail.transcript.length).toBeGreaterThan(0)
        expect(row.detail.signals.length).toBeGreaterThan(0)
      }
    }
  })

  it('the A2A OpenClaw row detail matches the Figma calling-client wording', () => {
    const row = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!
    expect(row.detail.clientLabel).toBe('Calling client')
    expect(row.detail.clientValue).toBe('OpenClaw')
    expect(row.detail.transcriptIntro).toContain('agents')
  })

  it('the MCP Claude Desktop row detail matches the Figma MCP wording', () => {
    const row = CHANNELS.headless.rows.find((r) => r.client === 'Claude Desktop')!
    expect(row.detail.clientLabel).toBe('MCP client')
    expect(row.detail.clientValue).toBe('Claude Desktop')
    expect(row.detail.interactions).toBe('2')
    expect(row.detail.transcriptIntro).toContain('MCP')
  })

  it('a human row detail omits the client label and uses the plain intro', () => {
    const row = CHANNELS.widget.rows[0]
    expect(row.detail.source).toBe('human')
    expect(row.detail.clientLabel).toBeUndefined()
    expect(row.detail.transcriptIntro).toBe('Conversation started')
  })
})
