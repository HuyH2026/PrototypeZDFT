import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { BlockCanvas } from './BlockCanvas'
import type { CanvasBlock } from '../agent-store'

const blocks: CanvasBlock[] = [
  { id: 'b1', stepType: 'condition', title: 'Untitled classic block 01' },
]

// A condition block carries the only body the design specifies. Keep a focused
// fixture here so row editing/collapse behavior does not depend on route state.
const conditionBlock: CanvasBlock[] = [
  {
    id: 'b1', stepType: 'condition', title: 'Untitled classic block 01',
    header: 'Conditions', subtitle: 'Shipping status',
    rows: [
      { id: 'r1', label: 'Condition description' },
      { id: 'r2', label: 'Condition description' },
      { id: 'r3', label: 'Otherwise…' },
    ],
  },
]

function renderBlocks(items: CanvasBlock[], onChange = vi.fn()) {
  render(
    <DndProvider backend={HTML5Backend}>
      <BlockCanvas blocks={items} onChange={onChange} />
    </DndProvider>,
  )
  return onChange
}

describe('BlockCanvas', () => {
  it('renders existing block cards', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <BlockCanvas blocks={blocks} onChange={() => {}} />
      </DndProvider>,
    )
    expect(screen.getByText('Untitled classic block 01')).toBeInTheDocument()
  })

  it('offers an expand control on a collapsed title-only card', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DndProvider backend={HTML5Backend}>
        <BlockCanvas
          blocks={[{ id: 'b2', stepType: 'form', title: 'Form: Cancellation Diagnostic Survey', collapsed: true }]}
          onChange={onChange}
        />
      </DndProvider>,
    )
    const expand = screen.getByRole('button', { name: 'Expand Form: Cancellation Diagnostic Survey' })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    await user.click(expand)
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'b2', collapsed: false })])
  })

  it('removes a block and emits the new list', async () => {
    const user = userEvent.setup()
    const onChange = renderBlocks(blocks)
    await user.click(screen.getByRole('button', { name: 'Remove Untitled classic block 01' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('renders an expanded condition block with its numbered rows', () => {
    renderBlocks(conditionBlock)
    expect(screen.getByText('Shipping status')).toBeInTheDocument()
    expect(screen.getAllByText('Condition description')).toHaveLength(2)
    expect(screen.getByText('Otherwise…')).toBeInTheDocument()
  })

  it('collapsing a condition block hides its body', async () => {
    const user = userEvent.setup()
    const onChange = renderBlocks(conditionBlock)
    await user.click(screen.getByRole('button', { name: 'Collapse Untitled classic block 01' }))
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'b1', collapsed: true })])
  })

  it('adds a condition row', async () => {
    const user = userEvent.setup()
    const onChange = renderBlocks(conditionBlock)
    await user.click(screen.getByRole('button', { name: 'Add condition' }))
    const next = onChange.mock.calls[0][0] as CanvasBlock[]
    expect(next[0].rows).toHaveLength(4)
  })
})
