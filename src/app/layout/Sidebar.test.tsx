import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { Sidebar } from './Sidebar'

function renderSidebar(
  onToggleSubnav = vi.fn(),
  props: { subnavOpen?: boolean; canToggleSubnav?: boolean; onSelectSection?: () => void } = {},
) {
  const { onSelectSection = vi.fn(), ...rest } = props
  return render(
    <MemoryRouter>
      <AiAssistantProvider>
        <Sidebar onToggleSubnav={onToggleSubnav} onSelectSection={onSelectSection} {...rest} />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders a link per nav item', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /agent directory/i })).toBeInTheDocument()
  })

  // The prototype's rail names the destination in a dark tooltip pill; it has no
  // popover listing the section's pages. Those live in the pages column, which
  // opens when you select the section.
  it('names every destination in a tooltip, listing no pages', () => {
    renderSidebar()
    const insights = screen.getByRole('link', { name: /^Insights$/ })
    expect(within(insights).getByRole('tooltip')).toHaveTextContent('Insights')
    // Insights has a submenu, but the rail never lists it.
    expect(screen.queryByText('Agent Overview')).not.toBeInTheDocument()
    expect(screen.queryByText('Topics')).not.toBeInTheDocument()
  })

  it('gives a destination without pages the same tooltip', () => {
    renderSidebar()
    const agentDirectory = screen.getByRole('link', { name: /^Agent Directory$/ })
    expect(within(agentDirectory).getByRole('tooltip')).toHaveTextContent('Agent Directory')
  })

  // The rail never widens — the toggle is the prototype's `toggleSubnav`, which
  // shows and hides the pages column beside it.
  it('names the toggle for what it will do', () => {
    renderSidebar(vi.fn(), { subnavOpen: true, canToggleSubnav: true })
    expect(screen.getByRole('button', { name: 'Hide pages' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('offers to show the pages again once the column is closed', () => {
    renderSidebar(vi.fn(), { subnavOpen: false, canToggleSubnav: true })
    expect(screen.getByRole('button', { name: 'Show pages' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('calls onToggleSubnav when the toggle is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderSidebar(onToggle, { subnavOpen: true, canToggleSubnav: true })
    await user.click(screen.getByRole('button', { name: 'Hide pages' }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  // Selecting a section is the prototype's `selectNav`, which always calls
  // `openSubnav` — so the rail reports the selection and the layout re-opens the
  // pages column, even when the section selected is the one already active.
  it('reports a section selection, including the active one', async () => {
    const user = userEvent.setup()
    const onSelectSection = vi.fn()
    renderSidebar(vi.fn(), { onSelectSection })

    await user.click(screen.getByRole('link', { name: /^Agent Builder$/ }))
    expect(onSelectSection).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('link', { name: /^Agent Builder$/ }))
    expect(onSelectSection).toHaveBeenCalledTimes(2)
  })

  // Dashboard and Agent Directory have no pages, so there is nothing to toggle.
  it('disables the toggle on a section without pages', () => {
    renderSidebar(vi.fn(), { subnavOpen: false, canToggleSubnav: false })
    expect(screen.getByRole('button', { name: 'Show pages' })).toBeDisabled()
  })
})
