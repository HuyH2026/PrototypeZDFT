import { describe, it, expect } from 'vitest'
import { TOOL_TABS, TOOL_ACTIONS, NAME_COUNT, TOOL_RUNS, RUN_COUNT } from './tools-data'

describe('tools-data', () => {
  it('defines the four tabs in Figma order', () => {
    expect(TOOL_TABS).toEqual(['Available', 'Recommended', 'Authentication', 'History'])
  })

  it('defines the five Figma action rows in order', () => {
    expect(TOOL_ACTIONS.map((a) => a.name)).toEqual([
      'Action name 001', 'Action name 002', 'Action name 003',
      'Action name 004', 'Action name 005',
    ])
  })

  it('matches the Figma-exact type/state/conversations per row', () => {
    expect(TOOL_ACTIONS[0]).toMatchObject({ type: 'API', state: 'Live', conversations: 100, iconTint: 'blue' })
    expect(TOOL_ACTIONS[1]).toMatchObject({ type: 'Imported', state: 'Read only', conversations: 40, iconTint: 'slate' })
    expect(TOOL_ACTIONS[2]).toMatchObject({ type: 'Imported', state: 'Read only', conversations: 1000, iconTint: 'slate' })
    expect(TOOL_ACTIONS[3]).toMatchObject({ type: 'MCP', state: 'Live', conversations: 950, iconTint: 'blue' })
    expect(TOOL_ACTIONS[4]).toMatchObject({ type: 'Browser', state: 'Auto-saved', conversations: 200, iconTint: 'blue' })
  })

  it('gives only the first two rows an agents chip', () => {
    expect(TOOL_ACTIONS[0].agents).toMatchObject({ label: 'Agent name', extra: 5 })
    expect(TOOL_ACTIONS[1].agents).toMatchObject({ label: 'Agent name', extra: 5 })
    expect(TOOL_ACTIONS[2].agents).toBeNull()
    expect(TOOL_ACTIONS[3].agents).toBeNull()
    expect(TOOL_ACTIONS[4].agents).toBeNull()
  })

  it('uses a static Name header count of 113', () => {
    expect(NAME_COUNT).toBe(113)
  })
})

describe('tools-data (history)', () => {
  it('defines five history runs, one per existing tool action', () => {
    expect(TOOL_RUNS).toHaveLength(5)
    expect(TOOL_RUNS.map((r) => r.toolId)).toEqual(['t1', 't2', 't3', 't4', 't5'])
  })

  it('every run references a real TOOL_ACTIONS id', () => {
    const actionIds = new Set(TOOL_ACTIONS.map((a) => a.id))
    for (const run of TOOL_RUNS) {
      expect(actionIds.has(run.toolId)).toBe(true)
    }
  })

  it('covers all three run statuses', () => {
    const statuses = TOOL_RUNS.map((r) => r.status)
    expect(statuses).toContain('In progress')
    expect(statuses).toContain('Completed')
    expect(statuses).toContain('Failed')
  })

  it('has a mix of null and real conversation ids', () => {
    expect(TOOL_RUNS.some((r) => r.conversationId === null)).toBe(true)
    expect(TOOL_RUNS.some((r) => typeof r.conversationId === 'string')).toBe(true)
  })

  it('uses a static Run header count of 113', () => {
    expect(RUN_COUNT).toBe(113)
  })
})
