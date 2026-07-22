import { describe, it, expect } from 'vitest'
import { CHANNEL_TABS, SEED_BRANDS, BRAND_LIST_LABELS, RAIL_SECTIONS, summarizeTags } from './config-data'

describe('config-data', () => {
  it('has four channel tabs starting with widget', () => {
    expect(CHANNEL_TABS.map((t) => t.id)).toEqual(['widget', 'voice', 'webcall', 'headless'])
  })

  it('seeds three brands with vip default+enabled', () => {
    expect(SEED_BRANDS.map((b) => b.id)).toEqual(['vip', 'member', 'partner'])
    const vip = SEED_BRANDS.find((b) => b.id === 'vip')!
    expect(vip.isDefault).toBe(true)
    expect(vip.enabled).toBe(true)
    expect(vip.name).toBe('SpaceX support')
    expect(vip.tags.length).toBe(4)
  })

  it('maps brand ids to short list labels', () => {
    expect(BRAND_LIST_LABELS.vip).toBe('VIP')
    expect(BRAND_LIST_LABELS.member).toBe('Member')
    expect(BRAND_LIST_LABELS.partner).toBe('Partner')
  })

  it('rail sections lead with brands and each carries a Garden icon name', () => {
    expect(RAIL_SECTIONS[0].id).toBe('brands')
    expect(RAIL_SECTIONS.every((s) => typeof s.icon === 'string' && s.icon.length > 0)).toBe(true)
  })

  it('summarizes tags with a +N overflow past two', () => {
    expect(summarizeTags([])).toBe('')
    expect(summarizeTags(['A'])).toBe('A')
    expect(summarizeTags(['A', 'B'])).toBe('A, B')
    expect(summarizeTags(['A', 'B', 'C', 'D'])).toBe('A, B, +2')
  })
})
