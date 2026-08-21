import { describe, expect, it } from 'vitest'
import {
  STEP_TYPES,
  chipVariantForStep,
  insertChip,
  insertChipInProse,
  removeChip,
  appendBlock,
  moveBlock,
  removeBlock,
  addConditionRow,
  editConditionRow,
  removeConditionRow,
  toggleBlockCollapse,
  removeAgents,
  seedAgents,
  nextId,
  policyToText,
  type PolicyDoc,
  type CanvasBlock,
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

  describe('insertChipInProse', () => {
    const chip = { kind: 'chip' as const, id: 'c2', variant: 'action' as const, label: 'Action' }

    it('splits the prose segment around the caret and drops the slash before it', () => {
      const next = insertChipInProse(doc, 'p1', 'Reveal /'.length, chip)
      expect(next.segments[0]).toMatchObject({ kind: 'prose', text: 'Reveal ' })
      expect(next.segments[1]).toBe(chip)
      expect(next.segments[2]).toMatchObject({ kind: 'chip', id: 'c1' })
      expect(next.segments[3]).toMatchObject({ kind: 'prose', text: ' to identify.' })
      expect(doc.segments).toHaveLength(3) // original untouched
    })

    it('omits an empty half instead of leaving an empty prose segment', () => {
      const next = insertChipInProse(doc, 'p1', '/'.length, chip)
      expect(next.segments[0]).toBe(chip)
      expect(next.segments.some((s) => s.kind === 'prose' && s.text === '')).toBe(false)
    })

    it('is a no-op when the segment id is not a prose segment', () => {
      expect(insertChipInProse(doc, 'c1', 1, chip)).toBe(doc)
      expect(insertChipInProse(doc, 'missing', 1, chip)).toBe(doc)
    })
  })

  it('appends, moves, and removes canvas blocks', () => {
    const a: CanvasBlock = { id: 'b1', stepType: 'condition', title: 'Untitled classic block 01' }
    const b: CanvasBlock = { id: 'b2', stepType: 'code', title: 'Untitled classic block 02' }
    const two = appendBlock(appendBlock([], a), b)
    expect(two.map((x) => x.id)).toEqual(['b1', 'b2'])
    expect(moveBlock(two, 0, 1).map((x) => x.id)).toEqual(['b2', 'b1'])
    expect(removeBlock(two, 'b1').map((x) => x.id)).toEqual(['b2'])
  })

  it('adds, edits, and removes condition rows on a block', () => {
    const block: CanvasBlock = {
      id: 'b1',
      stepType: 'condition',
      title: 'Untitled classic block 01',
      rows: [{ id: 'r1', label: 'First' }],
    }
    const two = addConditionRow([block], 'b1', { id: 'r2', label: 'Second' })
    expect(two[0].rows?.map((r) => r.id)).toEqual(['r1', 'r2'])

    const edited = editConditionRow(two, 'b1', 'r2', 'Renamed')
    expect(edited[0].rows?.find((r) => r.id === 'r2')?.label).toBe('Renamed')

    const removed = removeConditionRow(edited, 'b1', 'r1')
    expect(removed[0].rows?.map((r) => r.id)).toEqual(['r2'])

    // other blocks untouched; original array not mutated
    expect(block.rows).toHaveLength(1)
  })

  it('seeds a first row on a block that has none when adding', () => {
    const block: CanvasBlock = { id: 'b1', stepType: 'condition', title: 'x' }
    const next = addConditionRow([block], 'b1', { id: 'r1', label: 'First' })
    expect(next[0].rows).toEqual([{ id: 'r1', label: 'First' }])
  })

  it('inserts a new condition before the terminal Otherwise row', () => {
    const block: CanvasBlock = {
      id: 'b1',
      stepType: 'condition',
      title: 'x',
      rows: [
        { id: 'r1', label: 'First' },
        { id: 'r3', label: 'Otherwise…' },
      ],
    }

    const next = addConditionRow([block], 'b1', { id: 'r2', label: 'Second' })

    expect(next[0].rows?.map((row) => row.label)).toEqual(['First', 'Second', 'Otherwise…'])
  })

  it('toggles a block collapsed flag', () => {
    const block: CanvasBlock = { id: 'b1', stepType: 'condition', title: 'x' }
    expect(toggleBlockCollapse([block], 'b1')[0].collapsed).toBe(true)
    expect(toggleBlockCollapse(toggleBlockCollapse([block], 'b1'), 'b1')[0].collapsed).toBe(false)
  })

  it('seeds Service cancellation with the expanded shipping-status condition block', () => {
    const agents = seedAgents()
    const svc = agents.find((x) => x.id === 'w3')!
    expect(svc.policy.segments.some((s) => s.kind === 'chip')).toBe(true)
    expect(svc.blocks).toEqual([
      {
        id: 'b-seed-1',
        stepType: 'condition',
        title: 'Untitled classic block 01',
        header: 'Conditions',
        subtitle: 'Shipping status',
        rows: [
          { id: 'r-seed-1', label: 'Condition description' },
          { id: 'r-seed-2', label: 'Condition description' },
          { id: 'r-seed-3', label: 'Otherwise…' },
        ],
      },
    ])
  })

  it("titles the seeded policies 'AI policy', as the design labels them", () => {
    const agents = seedAgents()
    expect(agents.every((a) => a.policy.title === 'AI policy')).toBe(true)
  })

  it('breaks the Service cancellation policy into the design’s lines', () => {
    const svc = seedAgents().find((x) => x.id === 'w3')!
    const prose = Object.fromEntries(
      svc.policy.segments.flatMap((s) => (s.kind === 'prose' ? [[s.id, s.text]] : [])),
    )
    // "…root cause." and "Trigger" sit on separate lines (Figma 1886:75766/75767).
    expect(prose.p2).toBe(' to identify the root cause.\nTrigger ')
    // "Ask if they want…" and "Collect their decision via" are their own lines too.
    expect(prose.p3).toContain('resolving it.\nAsk if they want to take the offer.\nCollect')
    // The accepts/declines branches are separated by a blank line.
    expect(prose.p4.startsWith('\n\n')).toBe(true)
    expect(prose.p7.startsWith('\n\n')).toBe(true)
  })

  it('removes agents by a set of ids', () => {
    const agents = seedAgents()
    const [a, b] = agents
    const remaining = removeAgents(agents, [a.id, b.id])
    expect(remaining.some((x) => x.id === a.id || x.id === b.id)).toBe(false)
    expect(remaining).toHaveLength(agents.length - 2)
    // original untouched
    expect(agents.some((x) => x.id === a.id)).toBe(true)
  })

  it('removeAgents with no ids returns the list unchanged', () => {
    const agents = seedAgents()
    expect(removeAgents(agents, [])).toHaveLength(agents.length)
  })

  it('mints unique deterministic ids', () => {
    expect(nextId('agent')).not.toBe(nextId('agent'))
  })
})

describe('policyToText', () => {
  it('reads a policy back as one line, chips included', () => {
    expect(policyToText(doc)).toBe('Reveal Survey to identify.')
  })

  it('collapses the editor’s line breaks into single spaces', () => {
    expect(
      policyToText({
        title: 'AI policy',
        segments: [{ kind: 'prose', id: 'p1', text: 'One thing.\n\nAnother thing.' }],
      }),
    ).toBe('One thing. Another thing.')
  })

  it('is empty for an empty policy', () => {
    expect(policyToText({ title: 'AI policy', segments: [] })).toBe('')
    expect(
      policyToText({ title: 'AI policy', segments: [{ kind: 'prose', id: 'p', text: '  ' }] }),
    ).toBe('')
  })

  it('flattens the seeded Service cancellation policy readably', () => {
    const cancellation = seedAgents().find((a) => a.id === 'w3')!
    const text = policyToText(cancellation.policy)
    expect(text).toContain(
      'Reveal Form: Cancellation Diagnostic Survey to identify the root cause.',
    )
    expect(text).toContain('Trigger Retention Routing')
    expect(text).not.toContain('\n')
  })
})
