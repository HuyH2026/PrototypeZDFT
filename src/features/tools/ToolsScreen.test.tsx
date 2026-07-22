import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolsScreen } from './ToolsScreen'

describe('ToolsScreen', () => {
  it('renders the Tool Builder title and the Available table by default', () => {
    render(<ToolsScreen />)
    const el = screen.getByTestId('screen-tools')
    expect(within(el).getByRole('heading', { name: 'Tool Builder' })).toBeInTheDocument()
    // Available tab is active and shows the table header.
    expect(within(el).getByText('Name (113)')).toBeInTheDocument()
    expect(within(el).getByRole('tab', { name: 'Available' })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to an empty placeholder tab when clicked', async () => {
    const user = userEvent.setup()
    render(<ToolsScreen />)
    const el = screen.getByTestId('screen-tools')
    await user.click(within(el).getByRole('tab', { name: 'History' }))
    expect(within(el).getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true')
    // Table header is gone; the Available table no longer renders.
    expect(within(el).queryByText('Name (113)')).toBeNull()
    // Empty region is labelled.
    expect(within(el).getByTestId('tools-tab-History')).toBeInTheDocument()
  })
})
