import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ExpandedSidebar } from './ExpandedSidebar'

describe('ExpandedSidebar', () => {
  it('renders labels for all nav items', () => {
    render(
      <MemoryRouter>
        <ExpandedSidebar activeLabel="Home" selectedSub={{}} onSelectSub={vi.fn()} onCollapse={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /^Home$/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Insights$/ })).toBeInTheDocument()
  })

  it('calls onCollapse when the collapse toggle is clicked', async () => {
    const user = userEvent.setup()
    const onCollapse = vi.fn()
    render(
      <MemoryRouter>
        <ExpandedSidebar activeLabel="Home" selectedSub={{}} onSelectSub={vi.fn()} onCollapse={onCollapse} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(onCollapse).toHaveBeenCalledOnce()
  })
})
