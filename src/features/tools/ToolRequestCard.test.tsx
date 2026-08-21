import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolRequestCard } from './ToolRequestCard'
import { TOOL_ACTIONS } from './tools-data'

const reconcilePayout = TOOL_ACTIONS[2]

describe('ToolRequestCard', () => {
  it('shows the Params tab content by default', () => {
    render(<ToolRequestCard tool={reconcilePayout} />)
    expect(screen.getByRole('tab', { name: 'Params' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Enter value or select CV from the list')).toBeInTheDocument()
  })

  it('switches to an empty placeholder tab when clicked', async () => {
    const user = userEvent.setup()
    render(<ToolRequestCard tool={reconcilePayout} />)
    await user.click(screen.getByRole('tab', { name: 'Header' }))
    expect(screen.getByRole('tab', { name: 'Header' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Enter value or select CV from the list')).toBeNull()
    expect(screen.getByTestId('request-tab-Header')).toBeInTheDocument()
  })

  it('renders the action name and description panel', () => {
    render(<ToolRequestCard tool={reconcilePayout} />)
    expect(screen.getByText('Action name and description *')).toBeInTheDocument()
    expect(screen.getByText('Reconcile payout')).toBeInTheDocument()
    expect(screen.getByText(reconcilePayout.description)).toBeInTheDocument()
    expect(screen.getAllByText('Store ID')).toHaveLength(2)
  })
})
