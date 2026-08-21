import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ManageAgentsEmpty } from './ManageAgentsEmpty'

function renderEmpty() {
  return render(
    <MemoryRouter>
      <ManageAgentsEmpty />
    </MemoryRouter>,
  )
}

describe('ManageAgentsEmpty', () => {
  it('explains what creating an agent involves', () => {
    renderEmpty()
    const empty = screen.getByTestId('manage-agents-empty')
    expect(within(empty).getByText(/Create your first agent, select or create a brand/)).toBeInTheDocument()
    expect(within(empty).getByText('Configuration')).toBeInTheDocument()
  })

  it('offers the create CTA', () => {
    renderEmpty()
    expect(screen.getByRole('link', { name: 'Create new agent' })).toHaveAttribute(
      'href',
      '/agent-setup/new',
    )
  })

  it('hides the decorative orbit from assistive tech', () => {
    renderEmpty()
    expect(screen.getByTestId('channel-orbit')).toHaveAttribute('aria-hidden', 'true')
  })
})
