import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AiStudioEditorPanel } from './AiStudioEditorPanel'

function renderPanel() {
  const onClose = vi.fn()
  const onReview = vi.fn()
  render(<AiStudioEditorPanel onClose={onClose} onReview={onReview} />)
  return { onClose, onReview }
}

const composer = () => screen.getByRole('textbox', { name: 'Message AI Studio' })

describe('AiStudioEditorPanel', () => {
  it('starts with the greeting and suggestion bubbles', () => {
    renderPanel()
    expect(screen.getByText('Good evening, Sunny! 👋')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refine this intent' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Improve this policy to improve deflection' }),
    ).toBeInTheDocument()
  })

  it('opens with the rewrite prompt already in the composer', () => {
    renderPanel()
    expect(composer()).toHaveValue('Help me rewrite this policy to improve deflection')
  })

  it('offers the three header actions the design specifies', () => {
    renderPanel()
    expect(screen.getByLabelText('Open in new tab')).toBeInTheDocument()
    expect(screen.getByLabelText('Dock to bottom')).toBeInTheDocument()
    expect(screen.getByLabelText('Close AI Studio')).toBeInTheDocument()
  })

  it('a suggestion replaces the composer text', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: 'Refine this intent' }))
    expect(composer()).toHaveValue('Refine this intent')
  })

  it('submitting a prompt shows the user bubble and the analysis + plan card', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.type(composer(), '{Enter}')

    // User message echoed, greeting gone.
    expect(screen.getByText('Help me rewrite this policy to improve deflection')).toBeInTheDocument()
    expect(screen.queryByText('Good evening, Sunny! 👋')).not.toBeInTheDocument()
    // Canned analysis + plan card.
    expect(screen.getByText('Current drop off rate:')).toBeInTheDocument()
    expect(screen.getByText('Widget: 43%')).toBeInTheDocument()
    expect(screen.getByText('Service cancellation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review plan' })).toBeInTheDocument()
  })

  it('the composer clears to its own placeholder once a turn is sent', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.type(composer(), '{Enter}')
    expect(composer()).toHaveValue('')
    expect(screen.getByPlaceholderText('What can I help you with today?')).toBeInTheDocument()
  })

  it('Review plan fires onReview', async () => {
    const user = userEvent.setup()
    const { onReview } = renderPanel()
    await user.type(composer(), '{Enter}')
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    expect(onReview).toHaveBeenCalledTimes(1)
  })

  it('close fires onClose', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel()
    await user.click(screen.getByLabelText('Close AI Studio'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
