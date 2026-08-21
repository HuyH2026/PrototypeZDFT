import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { BrandProvider, useBrands } from '@/app/brand-context'
import { resetRoster } from '@/features/manage-agents/agent-roster-store'
import { SEED_AGENTS } from '@/features/manage-agents/roster-data'
import { AgentSwitcher } from './AgentSwitcher'

function Probe() {
  const { currentBrand } = useBrands()
  return <span data-testid="current-scope">{currentBrand?.id ?? 'all-brands'}</span>
}

function renderSwitcher() {
  return render(
    <MemoryRouter>
      <BrandProvider>
        <AgentSwitcher />
        <Probe />
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('AgentSwitcher', () => {
  beforeEach(() => resetRoster(SEED_AGENTS))

  it('names the first agent and groups the menu by brand', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    expect(screen.getByTestId('current-agent')).toHaveTextContent('Uber Rider Trip')
    await user.click(screen.getByRole('button', { name: 'Switch agent' }))
    const groups = await screen.findAllByTestId('switcher-brand-group')
    expect(groups.map((group) => group.textContent)).toEqual([
      'Uber',
      'Uber Eats',
      'Uber Freight',
      'Uber Health',
    ])
    expect(screen.getByRole('menuitem', { name: 'Shipper Support' })).toBeInTheDocument()
  })

  it('leaves the brand headers unselectable', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch agent' }))
    await screen.findByRole('menuitem', { name: 'Uber Rider Trip' })
    // 'Uber Freight' is a group label, so it must not be reachable as a control.
    expect(screen.queryByRole('menuitem', { name: 'Uber Freight' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Uber Freight' })).not.toBeInTheDocument()
  })

  it('selecting an agent renames the trigger and switches the brand', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch agent' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Uber Merchant Operation' }))
    expect(screen.getByTestId('current-agent')).toHaveTextContent('Uber Merchant Operation')
    expect(screen.getByTestId('current-scope')).toHaveTextContent('uber-eats')
  })

  it('lists only the brands that have agents', async () => {
    // health-patient-ride is the roster's only Uber Health agent.
    resetRoster([SEED_AGENTS[6]])
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: 'Switch agent' }))
    const groups = await screen.findAllByTestId('switcher-brand-group')
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveTextContent('Uber Health')
  })

  it('becomes a create link when there is no agent in scope', () => {
    resetRoster([])
    renderSwitcher()
    expect(screen.queryByRole('button', { name: 'Switch agent' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create your first agent' })).toHaveAttribute(
      'href',
      '/agent-setup/new',
    )
  })
})
