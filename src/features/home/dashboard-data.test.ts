import { describe, it, expect } from 'vitest'
import { AGENT_CHANNELS } from '@/lib/channel-meta'
import { DATA } from './dashboard-data'

const d = DATA.platform

describe('platform health data', () => {
  it('carries the health digest the hero band renders', () => {
    expect(d.healthDigest.verdict).toBe('Amazing!')
    expect(d.healthDigest.narrative).toContain('5.8%')
  })

  it('authors the four metrics in the design reading order', () => {
    expect(d.metrics.map((m) => m.key)).toEqual(['res', 'csat', 'esc', 'aht'])
    expect(d.metrics.map((m) => m.value)).toEqual(['82%', '4.6', '7%', '1:48'])
    expect(d.metrics.map((m) => m.delta)).toEqual(['4.2%', '1.2%', '5.8%', '12%'])
  })

  it('marks which direction is good for each metric', () => {
    expect(d.metrics.map((m) => m.goodWhenUp)).toEqual([true, true, false, false])
    expect(d.metrics.map((m) => m.up)).toEqual([true, false, false, false])
  })

  it('accents only CSAT', () => {
    const accented = d.metrics.filter((m) => m.accentColor)
    expect(accented.map((m) => m.key)).toEqual(['csat'])
    expect(accented[0].accentColor).toBe('#048c80')
  })

  it('breaks every metric down by the four agent channels', () => {
    const keys = AGENT_CHANNELS.map((c) => c.key)
    for (const m of d.metrics) {
      expect(m.byChannel.map((c) => c.key)).toEqual(keys)
    }
  })

  it('authors the designed per-channel values', () => {
    const byKey = new Map(d.metrics.map((m) => [m.key, m.byChannel.map((c) => c.value)]))
    expect(byKey.get('res')).toEqual(['82%', '76%', '87%', '79%'])
    expect(byKey.get('csat')).toEqual(['3.9', '4.9', '4.8', '3.7'])
    expect(byKey.get('esc')).toEqual(['8%', '7%', '5%', '3%'])
    expect(byKey.get('aht')).toEqual(['2:39', '4:30', '3:10', '1:32'])
  })
})
