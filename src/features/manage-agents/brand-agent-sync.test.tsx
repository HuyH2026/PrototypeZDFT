// The seam the two-field design (currentBrand + currentAgentId) exists to hold:
// the header switcher and the Manage agents page are mounted in different
// subtrees, and the agent the header names is *derived* (spec §2.1), never stored
// twice. Both halves of that rule need the two components live under one
// provider, which is why these cases live in their own file rather than in either
// component's suite.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AgentSwitcher } from '@/app/layout/AgentSwitcher'
import { resetRoster } from './agent-roster-store'
import { SEED_AGENTS } from './roster-data'
import { ManageAgentsScreen, __resetAutoOpen } from './ManageAgentsScreen'

function renderChromeAndScreen() {
  return render(
    <MemoryRouter>
      <BrandProvider>
        <AiAssistantProvider>
          <AgentSwitcher />
          <ManageAgentsScreen />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('header switcher ↔ Manage agents filter', () => {
  beforeEach(() => {
    window.localStorage?.clear()
    resetRoster(SEED_AGENTS)
    __resetAutoOpen()
  })

  it('re-labels the header to the brand’s first agent when the page filter changes', async () => {
    const user = userEvent.setup()
    renderChromeAndScreen()
    // All brands: the first agent of the whole roster.
    expect(screen.getByTestId('current-agent')).toHaveTextContent('Uber Rider Trip')

    await user.click(screen.getByRole('button', { name: 'Filter by brand' }))
    await user.click(screen.getByRole('menuitem', { name: 'Uber Eats' }))

    // The page narrowed, and the header followed it to that brand's first agent —
    // it can never keep naming an agent the table has filtered away.
    expect(screen.getByText('Brand • Uber Eats')).toBeInTheDocument()
    expect(screen.getByTestId('current-agent')).toHaveTextContent('Uber Eater Order')
  })

  it('re-labels the header to the next agent in scope when the named one is deleted', async () => {
    const user = userEvent.setup()
    renderChromeAndScreen()

    // Name an agent explicitly, so the stored currentAgentId — not the fallback —
    // is what the trigger is showing when the row goes away.
    await user.click(screen.getByRole('button', { name: 'Switch agent' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Driver Earnings' }))
    expect(screen.getByTestId('current-agent')).toHaveTextContent('Driver Earnings')

    await user.click(screen.getByRole('button', { name: 'Row actions for Driver Earnings' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    // Uber's remaining agent, not a blank trigger and not the create CTA.
    expect(screen.queryByText('Driver Earnings')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-agent')).toHaveTextContent('Uber Rider Trip')
    expect(screen.queryByRole('link', { name: 'Create your first agent' })).not.toBeInTheDocument()
  })
})
