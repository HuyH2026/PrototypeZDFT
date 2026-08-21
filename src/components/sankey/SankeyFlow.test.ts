import { describe, expect, it } from 'vitest'
import { sankeyColumnStart } from './SankeyFlow'

describe('sankeyColumnStart', () => {
  it('anchors every column heading to the corresponding Sankey bar', () => {
    expect(sankeyColumnStart(0, 900)).toBe(4)
    expect(sankeyColumnStart(1, 900)).toBeCloseTo(297.33, 2)
    expect(sankeyColumnStart(2, 900)).toBeCloseTo(590.67, 2)
    expect(sankeyColumnStart(3, 900)).toBe(884)
  })

  it('spreads the aggregate state across three aligned columns', () => {
    expect(sankeyColumnStart(0, 900, 3)).toBe(4)
    expect(sankeyColumnStart(1, 900, 3)).toBe(444)
    expect(sankeyColumnStart(2, 900, 3)).toBe(884)
  })
})
