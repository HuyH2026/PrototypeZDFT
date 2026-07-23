import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GeneratePolicyTab } from './GeneratePolicyTab'
import { AUTOMATION_DETAILS } from './automation-data'

describe('GeneratePolicyTab', () => {
  it('renders tools and the generated policy title', () => {
    render(<GeneratePolicyTab detail={AUTOMATION_DETAILS['Reactivate account']} />)
    expect(screen.getByText('check_account_status')).toBeInTheDocument()
    expect(screen.getByText('Generated Autoflow policy')).toBeInTheDocument()
  })

  it('collapses the actions section when the toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<GeneratePolicyTab detail={AUTOMATION_DETAILS['Reactivate account']} />)
    expect(screen.getByText('check_account_status')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /toggle generated actions/i }))
    expect(screen.queryByText('check_account_status')).not.toBeInTheDocument()
  })
})
