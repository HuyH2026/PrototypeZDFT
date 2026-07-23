import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogScreen } from './LogScreen'

describe('LogScreen', () => {
  it('renders the Log title and the Audit tab by default', () => {
    render(<LogScreen />)
    const el = screen.getByTestId('screen-log')
    expect(within(el).getByRole('heading', { name: 'Log' })).toBeInTheDocument()
    expect(within(el).getByRole('tab', { name: 'Audit' })).toHaveAttribute('aria-selected', 'true')
    expect(within(el).getByText('See the history of changes made within this account.')).toBeInTheDocument()
    expect(within(el).getByText('User email')).toBeInTheDocument()
  })

  it('switches to the Error tab and shows the error table', async () => {
    const user = userEvent.setup()
    render(<LogScreen />)
    const el = screen.getByTestId('screen-log')
    await user.click(within(el).getByRole('tab', { name: 'Error' }))
    expect(within(el).getByRole('tab', { name: 'Error' })).toHaveAttribute('aria-selected', 'true')
    expect(within(el).queryByText('User email')).toBeNull()
    expect(within(el).getByText('Errors overview')).toBeInTheDocument()
    expect(within(el).getByText('Error Message')).toBeInTheDocument()
  })
})
