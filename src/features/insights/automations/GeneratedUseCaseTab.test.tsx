import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GeneratedUseCaseTab } from './GeneratedUseCaseTab'
import { USE_CASE_DETAILS } from './automation-insights-data'

const renderTab = (topic = 'Refund Request') =>
  render(<GeneratedUseCaseTab detail={USE_CASE_DETAILS[topic]} />)

describe('GeneratedUseCaseTab', () => {
  it('renders tools and the generated policy title', () => {
    renderTab()
    expect(screen.getByText('lookup_charge')).toBeInTheDocument()
    expect(screen.getByText('Generated policy')).toBeInTheDocument()
  })

  it('collapses each action down to a named pill', async () => {
    const user = userEvent.setup()
    renderTab()
    expect(screen.getByText('lookup_charge')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /toggle generated actions/i }))

    expect(screen.queryByText('lookup_charge')).not.toBeInTheDocument()
    expect(screen.getByText('Lookup charge')).toBeInTheDocument()
    expect(screen.getByText('Issue refund')).toBeInTheDocument()
  })
})
