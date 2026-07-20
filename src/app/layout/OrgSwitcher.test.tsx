import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { OrgProvider } from '@/app/org-context'
import { OrgSwitcher } from './OrgSwitcher'

function renderSwitcher() {
  return render(
    <MemoryRouter>
      <OrgProvider>
        <OrgSwitcher />
      </OrgProvider>
    </MemoryRouter>,
  )
}

describe('OrgSwitcher', () => {
  it('shows the current org and lists orgs on open', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    expect(screen.getByText('SpaceX')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /switch organization/i }))
    expect(await screen.findByRole('menuitem', { name: /tesla/i })).toBeInTheDocument()
  })

  it('switches the current org on selection', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    expect(screen.getByText('SpaceX')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /switch organization/i }))
    await user.click(await screen.findByRole('menuitem', { name: /tesla/i }))
    // Current org should change to Tesla
    expect(screen.getAllByText('Tesla').length).toBeGreaterThan(0)
  })
})
