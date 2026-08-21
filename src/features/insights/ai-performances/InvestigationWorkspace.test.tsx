import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'
import { InvestigationWorkspace } from './InvestigationWorkspace'

function renderWorkspace(props: Partial<Parameters<typeof InvestigationWorkspace>[0]> = {}) {
  const onBack = vi.fn()
  const onViewConversations = vi.fn()
  render(
    <MemoryRouter initialEntries={['/insights/ai-performances']}>
      <AiAssistantProvider>
        <InvestigationWorkspace
          findingId="reopens"
          onBack={onBack}
          onViewConversations={onViewConversations}
          {...props}
        />
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return { onBack, onViewConversations }
}

describe('InvestigationWorkspace', () => {
  it('renders the metric title, observed change, evidence, and honesty label', () => {
    renderWorkspace()
    const ws = within(screen.getByTestId('investigation-workspace'))
    expect(ws.getByText('Tickets reopened')).toBeInTheDocument()
    expect(ws.getByText(/Reopened tickets increased 18%/)).toBeInTheDocument()
    expect(ws.getByText('61% of the increase came from Billing conversations.')).toBeInTheDocument()
    expect(ws.getByText('Evidence: 842 conversations')).toBeInTheDocument()
    expect(ws.getByText('Observation, not causation')).toBeInTheDocument()
  })

  it('Back invokes onBack', async () => {
    const { onBack } = renderWorkspace()
    await userEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(onBack).toHaveBeenCalled()
  })

  it('View affected conversations invokes onViewConversations', async () => {
    const { onViewConversations } = renderWorkspace()
    await userEvent.click(
      screen.getByRole('button', { name: 'View affected conversations' }),
    )
    expect(onViewConversations).toHaveBeenCalled()
  })

  it('Continue in AI Studio opens a populated conversation seeded with the chart and analysis', async () => {
    renderWorkspace()
    await userEvent.click(screen.getByRole('button', { name: 'Continue in AI Studio' }))
    const body = screen.getByTestId('ai-studio-conversation-body')
    expect(body).toHaveTextContent(
      'Reopened tickets increased 18%, with the rise beginning the week after Policy v2.4 was published.',
    )
    expect(body).toHaveTextContent('Policy v2.4 published Jul 21')
    expect(body).toHaveTextContent('47 reopened tickets on Jul 28')
    expect(within(body).getByRole('button', { name: 'Break down by intent' })).toBeInTheDocument()
    expect(within(body).getByRole('button', { name: 'Compare agents' })).toBeInTheDocument()
  })

  it('Break down by intent opens the full view', async () => {
    renderWorkspace()
    await userEvent.click(screen.getByRole('button', { name: 'Break down by intent' }))
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
  })

  it('an unknown finding renders nothing and calls onBack', () => {
    const { onBack } = renderWorkspace({ findingId: 'nope' })
    expect(screen.queryByTestId('investigation-workspace')).not.toBeInTheDocument()
    expect(onBack).toHaveBeenCalled()
  })
})
