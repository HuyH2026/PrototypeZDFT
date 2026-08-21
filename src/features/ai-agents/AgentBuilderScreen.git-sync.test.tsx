// Screen-level wiring for git sync. GitSyncCell.test.tsx already covers the
// column in isolation (present with the prop, absent without it); what only the
// screen can show is that it passes the prop at all, scoped to the brand+channel
// on screen, and that a row's chip reaches the detail panel.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AgentBuilderScreen } from './AgentBuilderScreen'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'

function renderScreen() {
  return render(
    <MemoryRouter>
      <BrandProvider>
        <AiAssistantProvider>
          <AgentBuilderScreen />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('AgentBuilderScreen git sync', () => {
  it('renders the Git sync column', () => {
    renderScreen()

    expect(screen.getByRole('columnheader', { name: 'Git sync' })).toBeInTheDocument()
  })

  it('shows each row its seeded sync state', () => {
    renderScreen()

    // 'all-brands' is seeded connected, so rows show status rather than the
    // Connect repo prompt: w1 synced, w2 out of sync, w4 unseeded.
    expect(
      within(screen.getByTestId('agent-row-w1')).getByRole('button', { name: /^re-sync /i }),
    ).toBeInTheDocument()
    expect(within(screen.getByTestId('agent-row-w2')).getByText('Out of sync')).toBeInTheDocument()
    expect(within(screen.getByTestId('agent-row-w4')).getByText('Not synced')).toBeInTheDocument()
  })

  it('opens the detail panel from a row status chip', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(
      screen.getByRole('button', { name: 'View git sync details for Knowledge Retrieval' }),
    )

    const panel = screen.getByRole('dialog', { name: 'Git sync for Knowledge Retrieval' })
    expect(within(panel).getByText(/github\.com\/uber\/agents/)).toBeInTheDocument()
  })

  it('syncs a row without navigating into the use case editor', async () => {
    const user = userEvent.setup()
    renderScreen()

    const row = screen.getByTestId('agent-row-w2')
    await user.click(within(row).getByRole('button', { name: 'Sync Fallback' }))

    // The cell stops propagation, so the row's navigate-to-editor click does
    // not also fire — the list is still on screen.
    expect(screen.getByTestId('view-agent-builder')).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: /^re-sync /i })).toBeInTheDocument()
  })
})
