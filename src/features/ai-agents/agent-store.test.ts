import { describe, expect, it } from 'vitest'
import {
  STEP_TYPES, chipVariantForStep,
  insertChip, removeChip, appendBlock, moveBlock, removeBlock,
  seedAgents, nextId, type PolicyDoc, type CanvasBlock,
} from './agent-store'

const doc: PolicyDoc = {
  title: 'Autoflow policy',
  segments: [
    { kind: 'prose', id: 'p1', text: 'Reveal ' },
    { kind: 'chip', id: 'c1', variant: 'form', label: 'Survey' },
    { kind: 'prose', id: 'p2', text: ' to identify.' },
  ],
}

describe('agent-store reducers', () => {
  it('exposes the palette step types with labels', () => {
    expect(STEP_TYPES.map((s) => s.type)).toContain('condition')
    expect(STEP_TYPES.find((s) => s.type === 'code')?.label).toBe('Code')
  })

  it('maps a step type to a chip variant', () => {
    expect(chipVariantForStep('form')).toBe('form')
    expect(chipVariantForStep('condition')).toBe('routing')
    expect(chipVariantForStep('code')).toBe('action')
  })

  it('inserts a chip at a segment index', () => {
    const next = insertChip(doc, 1, { kind: 'chip', id: 'c2', variant: 'action', label: 'Apply' })
    expect(next.segments[1]).toMatchObject({ id: 'c2', label: 'Apply' })
    expect(next.segments).toHaveLength(4)
    expect(doc.segments).toHaveLength(3) // original untouched
  })

  it('removes a chip by id', () => {
    const next = removeChip(doc, 'c1')
    expect(next.segments.some((s) => s.kind === 'chip')).toBe(false)
  })

  it('appends, moves, and removes canvas blocks', () => {
    const a: CanvasBlock = { id: 'b1', stepType: 'condition', title: 'Untitled classic block 01' }
    const b: CanvasBlock = { id: 'b2', stepType: 'code', title: 'Untitled classic block 02' }
    const two = appendBlock(appendBlock([], a), b)
    expect(two.map((x) => x.id)).toEqual(['b1', 'b2'])
    expect(moveBlock(two, 0, 1).map((x) => x.id)).toEqual(['b2', 'b1'])
    expect(removeBlock(two, 'b1').map((x) => x.id)).toEqual(['b2'])
  })

  it('seeds Service cancellation with policy chips and a classic block', () => {
    const agents = seedAgents()
    const svc = agents.find((x) => x.id === 'w3')!
    expect(svc.policy.segments.some((s) => s.kind === 'chip')).toBe(true)
    expect(svc.blocks.length).toBeGreaterThan(0)
  })

  it('mints unique deterministic ids', () => {
    expect(nextId('agent')).not.toBe(nextId('agent'))
  })
})
