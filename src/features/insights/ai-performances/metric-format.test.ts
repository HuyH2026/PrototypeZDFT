import { describe, expect, it } from 'vitest'
import { pct } from './metric-format'

describe('pct', () => {
  it('rounds a share to a whole percent', () => {
    expect(pct(8390, 9898)).toBe('85%')
    expect(pct(500, 7616)).toBe('7%')
    expect(pct(30010, 41536)).toBe('72%')
    expect(pct(7530, 94130)).toBe('8%')
    expect(pct(2500, 3000)).toBe('83%')
  })

  it('reports 0% rather than NaN for an empty whole', () => {
    expect(pct(0, 0)).toBe('0%')
  })
})
