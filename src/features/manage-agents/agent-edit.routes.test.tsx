import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { resetRoster } from './agent-roster-store'
import { SEED_AGENTS } from './roster-data'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Agent edit routing', () => {
  beforeEach(() => {
    window.localStorage?.clear()
    resetRoster(SEED_AGENTS)
  })

  it('renders the edit takeover at /agent-setup/:agentId', () => {
    renderAt('/agent-setup/uber-rider-trip')
    expect(screen.getByTestId('screen-edit-agent')).toBeInTheDocument()
    expect(screen.getByLabelText('Agent name')).toHaveValue('Uber Rider Trip')
  })

  // It is a child route, so the roster it came from stays mounted beneath —
  // that is what makes Close reveal the screen untouched.
  it('keeps the roster mounted underneath the takeover', () => {
    renderAt('/agent-setup/uber-rider-trip')
    expect(screen.getByTestId('screen-manage-agents')).toBeInTheDocument()
  })

  // The dynamic segment sits beside the static `new`. React Router ranks static
  // higher, but this pins it: a regression would send Create new into the editor.
  it('still renders the create wizard at /agent-setup/new', () => {
    renderAt('/agent-setup/new')
    expect(screen.getByTestId('screen-create-agent')).toBeInTheDocument()
    expect(screen.queryByTestId('screen-edit-agent')).not.toBeInTheDocument()
  })

  it('drills into the editor from a roster row', async () => {
    const user = userEvent.setup()
    renderAt('/agent-setup')
    expect(screen.queryByTestId('screen-edit-agent')).not.toBeInTheDocument()

    await user.click(
      within(screen.getByTestId('screen-manage-agents')).getByRole('button', {
        name: 'Edit Shipper Support',
      }),
    )

    expect(screen.getByTestId('screen-edit-agent')).toBeInTheDocument()
    expect(screen.getByLabelText('Agent name')).toHaveValue('Shipper Support')
  })

  it('drills into the editor from the row action menu', async () => {
    const user = userEvent.setup()
    renderAt('/agent-setup')

    await user.click(screen.getByRole('button', { name: 'Row actions for Shipper Support' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(screen.getByLabelText('Agent name')).toHaveValue('Shipper Support')
  })
})
