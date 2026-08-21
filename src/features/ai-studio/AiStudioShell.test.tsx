import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiStudioShell } from './AiStudioShell'

describe('AiStudioShell', () => {
  it('renders its children and the AI Studio title', () => {
    render(
      <AiStudioShell testId="shell-under-test">
        <p>body content</p>
      </AiStudioShell>,
    )
    expect(screen.getByTestId('shell-under-test')).toBeInTheDocument()
    expect(screen.getByText('AI Studio')).toBeInTheDocument()
    expect(screen.getByText('body content')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What can I help you with today?')).toBeInTheDocument()
  })

  it('fires onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <AiStudioShell onClose={onClose}>
        <p>body</p>
      </AiStudioShell>,
    )
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('offers an explicit path into the full Studio when expansion is available', async () => {
    const onExpand = vi.fn()
    render(
      <AiStudioShell onExpand={onExpand}>
        <p>body</p>
      </AiStudioShell>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Open full AI Studio' }))
    expect(onExpand).toHaveBeenCalledTimes(1)
  })

  it('toggles recent chat history from its own header control', async () => {
    render(
      <AiStudioShell>
        <p>body</p>
      </AiStudioShell>,
    )

    const historyButton = screen.getByRole('button', { name: 'Chat history' })
    expect(historyButton).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(historyButton)
    expect(historyButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: 'Chat history' })).toBeInTheDocument()
    expect(
      screen.getByText('How can we improve deflection rates on billing questions?'),
    ).toBeInTheDocument()

    await userEvent.click(historyButton)
    // The dropdown animates closed rather than vanishing, so its removal isn't
    // guaranteed to land in the same tick as the click — poll for it instead of
    // requiring it to still be mounted the instant this line runs.
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Chat history' })).not.toBeInTheDocument()
    })
  })

  it('drives an interactive composer: Enter submits the trimmed value', async () => {
    const onComposerChange = vi.fn()
    const onComposerSubmit = vi.fn()
    render(
      <AiStudioShell
        composerValue="hello"
        onComposerChange={onComposerChange}
        onComposerSubmit={onComposerSubmit}
      >
        <p>body</p>
      </AiStudioShell>,
    )
    const input = screen.getByDisplayValue('hello')
    await userEvent.type(input, '{Enter}')
    expect(onComposerSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows the AI disclaimer above the composer, then retires it', async () => {
    vi.useFakeTimers()
    try {
      render(
        <AiStudioShell>
          <p>body</p>
        </AiStudioShell>,
      )
      const disclaimer = screen.getByText(/AI content can be inaccurate/)
      expect(disclaimer).toBeVisible()
      expect(disclaimer).not.toHaveAttribute('aria-hidden', 'true')

      // It fades and collapses a few seconds after opening, as in the prototype,
      // so it doesn't sit under every conversation permanently.
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByText(/AI content can be inaccurate/)).toHaveAttribute(
        'aria-hidden',
        'true',
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not submit an empty composer', async () => {
    const onComposerSubmit = vi.fn()
    render(
      <AiStudioShell
        composerValue="   "
        onComposerChange={vi.fn()}
        onComposerSubmit={onComposerSubmit}
      >
        <p>body</p>
      </AiStudioShell>,
    )
    await userEvent.type(screen.getByRole('textbox'), '{Enter}')
    expect(onComposerSubmit).not.toHaveBeenCalled()
  })
})
