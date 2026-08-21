import { describe, it, expect } from 'vitest'
import {
  channelMeta,
  CHANNEL_META,
  CHANNEL_SECTIONS,
  AGENT_CHANNELS,
  type AgentChannelKey,
} from './channel-meta'

describe('channelMeta', () => {
  it('maps a known channel to its display, color, and icon', () => {
    const meta = channelMeta('Web Widget')
    expect(meta.display).toBe('Widget')
    expect(meta.color).toBe('#e05c34')
    expect(meta.Icon).toBeDefined()
  })

  it('maps canonical Agent Builder channel labels to their channel colors', () => {
    expect(channelMeta('Widget').color).toBe('#e05c34')
    expect(channelMeta('Voice').color).toBe('#be297b')
    expect(channelMeta('Web Call').color).toBe('#7c1d79')
    expect(channelMeta('Headless').color).toBe('#2f99b3')
  })

  it('falls back for an unknown channel', () => {
    const meta = channelMeta('Carrier Pigeon')
    expect(meta.display).toBe('Carrier Pigeon')
    expect(meta.color).toBe('#646864')
    expect(meta.Icon).toBeDefined()
  })
})

describe('CHANNEL_SECTIONS', () => {
  it('lists the four sections in Figma order', () => {
    expect(CHANNEL_SECTIONS.map((s) => s.title)).toEqual([
      'Messaging',
      'Email',
      'Voice',
      'Headless',
    ])
  })

  it('covers every CHANNEL_META key exactly once', () => {
    const all = CHANNEL_SECTIONS.flatMap((s) => s.channels)
    expect(all.slice().sort()).toEqual(Object.keys(CHANNEL_META).slice().sort())
    expect(new Set(all).size).toBe(all.length) // no duplicates
  })

  it('references only known channels', () => {
    for (const section of CHANNEL_SECTIONS) {
      for (const label of section.channels) {
        expect(CHANNEL_META[label]).toBeDefined()
      }
    }
  })
})

describe('AGENT_CHANNELS', () => {
  it('lists the four agent channels in the design order', () => {
    expect(AGENT_CHANNELS.map((c) => c.key)).toEqual([
      'widget',
      'voice',
      'webcall',
      'headless',
    ])
  })

  it('labels each channel as the design does', () => {
    expect(AGENT_CHANNELS.map((c) => c.label)).toEqual([
      'Widget',
      'Voice',
      'Web Call',
      'Headless',
    ])
  })

  it('gives every channel an icon', () => {
    for (const c of AGENT_CHANNELS) {
      expect(c.Icon).toBeTruthy()
    }
  })

  it('types every key as an AgentChannelKey', () => {
    const keys: AgentChannelKey[] = AGENT_CHANNELS.map((c) => c.key)
    expect(keys).toHaveLength(4)
  })
})
