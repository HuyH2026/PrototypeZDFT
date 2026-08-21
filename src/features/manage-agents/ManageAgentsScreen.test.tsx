import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider, useAiAssistant } from '@/app/ai-assistant-context'
import { resetRoster } from './agent-roster-store'
import { SEED_AGENTS } from './roster-data'
import { ManageAgentsScreen, __resetAutoOpen } from './ManageAgentsScreen'

// Reads the assistant provider instead of mounting AiAssistantHost, so the
// auto-open assertions don't depend on the panel's animation.
function AssistantProbe() {
  const { isOpen, context } = useAiAssistant()
  return <div data-testid="assistant">{isOpen ? context.scope : 'closed'}</div>
}

function renderScreen() {
  return render(
    <MemoryRouter>
      <BrandProvider>
        <AiAssistantProvider>
          <ManageAgentsScreen />
          <AssistantProbe />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('ManageAgentsScreen', () => {
  beforeEach(() => {
    window.localStorage?.clear()
    __resetAutoOpen()
  })

  it('shows the empty state and opens the assistant when there are no agents', () => {
    resetRoster([])
    renderScreen()
    expect(screen.getByTestId('manage-agents-empty')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Agent Directory' })).toBeInTheDocument()
    // The header CTA is hidden on the empty state; the body owns it.
    expect(screen.queryByRole('link', { name: 'Create new' })).not.toBeInTheDocument()
    expect(screen.getByTestId('assistant')).toHaveTextContent('manage-agents')
  })

  it('shows the populated body and leaves the assistant closed', () => {
    resetRoster(SEED_AGENTS)
    renderScreen()
    expect(screen.getByTestId('assistant')).toHaveTextContent('closed')
    expect(screen.queryByTestId('manage-agents-empty')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create new' })).toHaveAttribute(
      'href',
      '/agent-setup/new',
    )
    expect(screen.getByText('Brand • Uber Freight')).toBeInTheDocument()
    // 34,744 conversations across the seed roster, 84% AR, 16% escalations.
    expect(within(screen.getByTestId('metric-conversations')).getByTestId('metric-center'))
      .toHaveTextContent('34,744')
    expect(within(screen.getByTestId('metric-ar')).getByTestId('metric-center')).toHaveTextContent(
      '84%',
    )
    expect(
      within(screen.getByTestId('metric-escalations')).getByTestId('metric-center'),
    ).toHaveTextContent('16%')
  })

  it('narrows the rows and re-legends the cards when a brand is picked', async () => {
    const user = userEvent.setup()
    resetRoster(SEED_AGENTS)
    renderScreen()
    await user.click(screen.getByRole('button', { name: 'Filter by brand' }))
    await user.click(screen.getByRole('menuitem', { name: 'Uber Eats' }))

    expect(screen.getByText('Brand • Uber Eats')).toBeInTheDocument()
    expect(screen.queryByText('Brand • Uber')).not.toBeInTheDocument()
    // All-brands legends list brands; a filtered legend lists that brand's agents.
    const conversations = screen.getByTestId('metric-conversations')
    expect(within(conversations).getByText('Uber Eater Order')).toBeInTheDocument()
    expect(within(conversations).getByTestId('metric-center')).toHaveTextContent('10,322')
  })

  it('falls back to the empty state when the last agent is deleted', async () => {
    const user = userEvent.setup()
    resetRoster([SEED_AGENTS[0]])
    renderScreen()
    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByTestId('manage-agents-empty')).toBeInTheDocument()
  })
})
