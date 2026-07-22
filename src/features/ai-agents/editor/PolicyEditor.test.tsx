import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PolicyEditor } from './PolicyEditor'
import type { PolicyDoc } from '../agent-store'

const doc: PolicyDoc = {
  title: 'Autoflow policy',
  segments: [
    { kind: 'prose', id: 'p1', text: 'Reveal ' },
    { kind: 'chip', id: 'c1', variant: 'form', label: 'Survey' },
    { kind: 'prose', id: 'p2', text: ' to identify.' },
  ],
}

function renderEditor(onChange = vi.fn()) {
  render(
    <DndProvider backend={HTML5Backend}>
      <PolicyEditor doc={doc} onChange={onChange} />
    </DndProvider>,
  )
  return onChange
}

describe('PolicyEditor', () => {
  it('renders the policy title and chips', () => {
    renderEditor()
    expect(screen.getByText('Autoflow policy')).toBeInTheDocument()
    expect(screen.getByText('Survey')).toBeInTheDocument()
  })

  it('removes a chip and emits the new doc', async () => {
    const user = userEvent.setup()
    const onChange = renderEditor()
    await user.click(screen.getByRole('button', { name: 'Remove Survey' }))
    expect(onChange).toHaveBeenCalled()
    const next = onChange.mock.calls[0][0] as PolicyDoc
    expect(next.segments.some((s) => s.kind === 'chip')).toBe(false)
  })

  it('renders the formatting toolbar', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: 'Insert' })).toBeInTheDocument()
  })
})
