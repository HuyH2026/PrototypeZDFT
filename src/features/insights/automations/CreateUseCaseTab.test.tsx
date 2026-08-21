import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CreateUseCaseTab } from './CreateUseCaseTab'
import { USE_CASE_DETAILS } from './automation-insights-data'

const renderTab = (topic = 'Refund Request') =>
  render(
    <CreateUseCaseTab
      detail={USE_CASE_DETAILS[topic]}
      selectedRows={new Set([0])}
      onToggleRow={() => {}}
    />,
  )

describe('CreateUseCaseTab', () => {
  it('renders summary stats, similar topics, and key phrases', () => {
    renderTab()
    expect(screen.getByText('844')).toBeInTheDocument()
    expect(screen.getByText('Refund not received')).toBeInTheDocument()
    expect(screen.getByText('"I want my money back"')).toBeInTheDocument()
    expect(
      screen.getByText('The use case will include the following key phrases:'),
    ).toBeInTheDocument()
  })

  it('explains the similar-topic columns with info affordances', () => {
    renderTab()
    const header = within(screen.getByTestId('similar-topics-header'))

    for (const column of ['Similar topic', 'Coverage', 'Savings']) {
      expect(header.getByLabelText(`About ${column}`)).toBeInTheDocument()
    }
  })

  it('reflects the parent selection in the row checkboxes', () => {
    renderTab()
    const rows = screen.getAllByRole('checkbox', { name: /^Select (?!all similar)/ })

    expect((rows[0] as HTMLInputElement).checked).toBe(true)
    expect((rows[1] as HTMLInputElement).checked).toBe(false)
  })
})
