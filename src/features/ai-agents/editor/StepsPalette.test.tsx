import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { StepsPalette } from './StepsPalette'

describe('StepsPalette', () => {
  it('lists all step types under a Steps heading', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <StepsPalette onClose={() => {}} onAddStep={() => {}} />
      </DndProvider>,
    )
    expect(screen.getByText('Steps')).toBeInTheDocument()
    // Row set and order per the web-call policy detail frame (170:63332);
    // Attachment and the CSAT trigger point are legacy extras after the frame's
    // nine.
    const labels = screen.getAllByRole('button', { name: /^Add .* step$/ }).map((b) => b.textContent)
    expect(labels).toEqual([
      'Options',
      'Condition',
      'Nested Policy',
      'Forms',
      'Text card',
      'Dynamic cards',
      'Image',
      'Code',
      'Say',
      'Attachment',
      'CSAT Survey Trigger Point',
    ])
  })

  it('adds a step when its row is clicked', async () => {
    const user = userEvent.setup()
    const onAddStep = vi.fn()
    render(
      <DndProvider backend={HTML5Backend}>
        <StepsPalette onClose={() => {}} onAddStep={onAddStep} />
      </DndProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add Condition step' }))

    expect(onAddStep).toHaveBeenCalledWith('condition')
  })
})
