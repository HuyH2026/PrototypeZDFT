import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgeEntryCard } from './KnowledgeEntryCard'
import { KNOWLEDGE_CONTENT } from './knowledge-data'

const rules = KNOWLEDGE_CONTENT['Knowledge coaching'].entries
const clarification = rules[0]
// The one rule scoped to two segments across two channels.
const businessTrip = rules.find((e) => e.segments.length === 2)!

function renderCard(entry = clarification, enabled = true, onToggle = vi.fn()) {
  render(<KnowledgeEntryCard entry={entry} enabled={enabled} onToggle={onToggle} />)
  return within(screen.getByTestId(`knowledge-entry-${entry.id}`))
}

describe('KnowledgeEntryCard', () => {
  it('shows the name, when it changed, and the instruction', () => {
    const card = renderCard()
    expect(card.getByRole('heading', { name: clarification.name })).toBeInTheDocument()
    expect(card.getByText(`Last updated on ${clarification.updatedOn}`)).toBeInTheDocument()
    expect(card.getByText(/clarify with the user/)).toBeInTheDocument()
  })

  it('lists the channels, segments and bound articles it applies to', () => {
    const card = renderCard(businessTrip)
    businessTrip.channels.forEach((channel) => {
      expect(card.getByText(channel)).toBeInTheDocument()
    })
    expect(card.getByText('Riders')).toBeInTheDocument()
    expect(card.getByText('Business riders')).toBeInTheDocument()
    expect(card.getByText('Business trip expenses')).toBeInTheDocument()
  })

  it('exposes the Activate toggle as a switch', () => {
    const card = renderCard(clarification, false)
    expect(card.getByRole('switch', { name: `Activate ${clarification.name}` })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('offers a per-entry actions menu', () => {
    const card = renderCard()
    expect(
      card.getByRole('button', { name: `Actions for ${clarification.name}` }),
    ).toBeInTheDocument()
  })

  it('opens a coaching rule from anywhere in the row when drill-in is available', async () => {
    const onOpen = vi.fn()
    render(<KnowledgeEntryCard entry={businessTrip} enabled onToggle={vi.fn()} onOpen={onOpen} />)

    await userEvent.click(screen.getByText(`Last updated on ${businessTrip.updatedOn}`))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('keeps the toggle independent from the row drill-in', async () => {
    const onOpen = vi.fn()
    const onToggle = vi.fn()
    render(<KnowledgeEntryCard entry={businessTrip} enabled onToggle={onToggle} onOpen={onOpen} />)

    await userEvent.click(screen.getByRole('switch', { name: `Activate ${businessTrip.name}` }))
    expect(onToggle).toHaveBeenCalledOnce()
    expect(onOpen).not.toHaveBeenCalled()
  })
})
