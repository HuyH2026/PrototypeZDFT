import { describe, expect, it } from 'vitest'
import { AUTOMATION_DETAILS, AUTOMATION_ROWS, AUTOMATION_STATS, AUTOMATION_SUBTABS } from './automation-data'

describe('automation-data', () => {
  it('has three sub-tabs starting with Agent gaps', () => {
    expect(AUTOMATION_SUBTABS.map((t) => t.label)).toEqual([
      'Agent gaps',
      'Knowledge gaps',
      'Realized impact',
    ])
  })

  it('has three headline stats and three rows', () => {
    expect(AUTOMATION_STATS).toHaveLength(3)
    expect(AUTOMATION_STATS[0]).toMatchObject({ value: '6,908' })
    expect(AUTOMATION_ROWS).toHaveLength(3)
    expect(AUTOMATION_ROWS[0].topic).toBe('Reactivate account')
  })
})

describe('AUTOMATION_DETAILS', () => {
  it('has a well-formed detail for every automation row', () => {
    for (const row of AUTOMATION_ROWS) {
      const detail = AUTOMATION_DETAILS[row.topic]
      expect(detail, `missing detail for ${row.topic}`).toBeDefined()
      expect(detail.stats).toHaveLength(3)
      expect(detail.tools.length).toBeGreaterThanOrEqual(1)
      expect(detail.tickets.length).toBeGreaterThanOrEqual(1)
      expect(detail.keyPhrases.length).toBeGreaterThanOrEqual(1)
      expect(detail.trainingPhraseRows.length).toBeGreaterThanOrEqual(1)
    }
  })
})
