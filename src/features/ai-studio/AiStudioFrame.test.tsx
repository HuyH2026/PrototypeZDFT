import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiStudioFrame } from './AiStudioFrame'

describe('AiStudioFrame', () => {
  it('renders the dialog testid, history list, and children', () => {
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}}>
        <p>right pane content</p>
      </AiStudioFrame>,
    )
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
    expect(screen.getByText('right pane content')).toBeInTheDocument()
    expect(screen.getByText('CSAT best performers')).toBeInTheDocument()
  })

  it('lists the saved flashbacks above the conversation history', () => {
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.getByText('Flashbacks')).toBeInTheDocument()
    expect(screen.getByText('Knowledge gaps report')).toBeInTheDocument()
    expect(screen.getByText('Email volume surge report')).toBeInTheDocument()
    const saved = within(screen.getByTestId('ai-studio-sidebar-flashbacks')).getAllByRole(
      'listitem',
    )
    expect(saved[0]).toHaveTextContent('Knowledge gaps report')
  })

  it('calls onNewConversation when "New conversation" is clicked', async () => {
    const onNewConversation = vi.fn()
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={onNewConversation}>
        <p>body</p>
      </AiStudioFrame>,
    )
    await userEvent.click(screen.getByRole('button', { name: /New conversation/i }))
    expect(onNewConversation).toHaveBeenCalledTimes(1)
  })

  it('offers both flows under Start and reports which one was picked', async () => {
    const onStartFlow = vi.fn()
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}} onStartFlow={onStartFlow}>
        <p>body</p>
      </AiStudioFrame>,
    )
    const start = within(screen.getByTestId('ai-studio-sidebar-start'))
    expect(start.getByRole('button', { name: 'Build an agent' })).toBeInTheDocument()
    await userEvent.click(start.getByRole('button', { name: 'Self-improving agent' }))
    expect(onStartFlow).toHaveBeenCalledWith('self-improving')
  })

  it('draws no Start group when there is nothing to start', () => {
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.queryByTestId('ai-studio-sidebar-start')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <AiStudioFrame onClose={onClose} onNewConversation={() => {}}>
        <p>body</p>
      </AiStudioFrame>,
    )
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('prepends activeHistoryTitle to the history list when not already present', () => {
    render(
      <AiStudioFrame
        onClose={() => {}}
        onNewConversation={() => {}}
        activeHistoryTitle="Tickets reopened"
      >
        <p>body</p>
      </AiStudioFrame>,
    )
    const items = within(screen.getByTestId('ai-studio-sidebar-conversations')).getAllByRole(
      'listitem',
    )
    expect(items[0]).toHaveTextContent('Tickets reopened')
  })

  it('does not duplicate activeHistoryTitle when it already matches a history entry', () => {
    render(
      <AiStudioFrame
        onClose={() => {}}
        onNewConversation={() => {}}
        activeHistoryTitle="CSAT best performers"
      >
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.getAllByText('CSAT best performers')).toHaveLength(1)
  })

  it('renders a right-hand panel beside the content when given one', () => {
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}} panel={<p>plan panel</p>}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.getByText('plan panel')).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('leaves the close X to the panel while one is open, and takes it back after', () => {
    const { rerender } = render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}} panel={<p>plan panel</p>}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.queryByLabelText('Close AI Studio')).not.toBeInTheDocument()
    rerender(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.getByLabelText('Close AI Studio')).toBeInTheDocument()
  })

  it('collapses the history sidebar while a panel is open, and can bring it back', async () => {
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}} panel={<p>plan panel</p>}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.queryByText('CSAT best performers')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Show conversation history'))
    expect(screen.getByText('CSAT best performers')).toBeInTheDocument()
  })

  it('hides the sidebar on request when there is no panel', async () => {
    render(
      <AiStudioFrame onClose={() => {}} onNewConversation={() => {}}>
        <p>body</p>
      </AiStudioFrame>,
    )
    expect(screen.getByText('CSAT best performers')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Hide conversation history'))
    // The sidebar animates its width shut rather than vanishing, so its removal
    // isn't guaranteed to land in the same tick as the click — poll for it
    // instead of requiring it to still be mounted the instant this line runs.
    await waitFor(() => {
      expect(screen.queryByText('CSAT best performers')).not.toBeInTheDocument()
    })
    expect(screen.getByLabelText('Show conversation history')).toBeInTheDocument()
  })
})
