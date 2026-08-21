import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { UseCaseGapsView } from './UseCaseGapsView'
import { USE_CASE_GAP_ROWS } from './automation-insights-data'

const renderView = () => {
  render(<UseCaseGapsView />)
  return within(screen.getByTestId('view-use-case-gaps'))
}

describe('UseCaseGapsView', () => {
  it('renders the use case banner metrics', () => {
    const view = renderView()
    expect(
      view.getByText(
        'Find customer needs your agent does not yet handle and estimate the potential impact of automating them.',
      ),
    ).toBeInTheDocument()
    expect(
      view.getByText('By automating these topics with use cases, you could annually achieve:'),
    ).toBeInTheDocument()
    expect(view.getByText('6,908')).toBeInTheDocument()
    expect(view.getByText('$229,860')).toBeInTheDocument()
  })

  it('names its columns after use cases rather than policies', () => {
    const view = renderView()
    expect(
      view.getAllByRole('columnheader').map((header) => header.textContent?.trim()),
    ).toEqual([
      'Topic for generated use case',
      'Use case',
      'Ticket coverage/year',
      'Potential savings/year',
      'Time created',
    ])
    expect(view.queryByText('AI policy')).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveClass('px-3.5', 'py-3.5')
    expect(screen.getAllByRole('cell')[0]).toHaveClass('px-3.5', 'py-3.5')
  })

  it('lists every generated topic from the design', () => {
    const view = renderView()
    for (const row of USE_CASE_GAP_ROWS) {
      expect(view.getByText(row.topic)).toBeInTheDocument()
    }
    expect(view.getByText('$28,740')).toBeInTheDocument()
    expect(view.getByText('31,916')).toBeInTheDocument()
  })

  it('opens Create Use case from any row', async () => {
    const user = userEvent.setup()
    const view = renderView()

    await user.click(view.getByText('Beneficiary Information Updates'))

    const dialog = within(screen.getByRole('dialog', { name: 'Create use case' }))
    expect(dialog.getByText('832')).toBeInTheDocument()
    expect(dialog.getByText('Add a new beneficiary')).toBeInTheDocument()
  })

  it('restores focus to the row that opened Create Use case', async () => {
    const user = userEvent.setup()
    const view = renderView()
    const opener = view.getByRole('button', { name: /Card and Account Services/ })

    await user.click(within(opener).getByText('Card and Account Services'))
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog', { name: 'Create use case' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
