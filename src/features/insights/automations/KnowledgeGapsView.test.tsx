import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { KnowledgeGapsView } from './KnowledgeGapsView'

const renderView = () => {
  render(<KnowledgeGapsView />)
  return within(screen.getByTestId('view-knowledge-gaps'))
}

describe('KnowledgeGapsView', () => {
  it('renders the Figma banner and knowledge table', () => {
    const view = renderView()
    expect(
      view.getByText(
        'Find missing or incomplete knowledge that prevents your agent from answering customer questions.',
      ),
    ).toBeInTheDocument()
    expect(
      view.getByText(
        'We identified gaps in your knowledge base and generated content to address them.',
      ),
    ).toBeInTheDocument()
    expect(view.getByText('185')).toBeInTheDocument()
    expect(view.getByText('Generated knowledge content')).toBeInTheDocument()
    expect(view.getByText('29,090')).toBeInTheDocument()
    expect(view.getByText('How to Handle a Fraudulent Charge Dispute')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveClass('px-3.5', 'py-3.5')
    expect(screen.getAllByRole('cell')[0]).toHaveClass('px-3.5', 'py-3.5')
  })

  it('leads the table with a selection column and drops the labels column', () => {
    const view = renderView()
    expect(
      view
        .getAllByRole('columnheader')
        .map((header) => header.textContent?.trim())
        .filter((label) => label !== ''),
    ).toEqual([
      'Content title',
      'Body',
      'Related topic',
      'Related articles',
      'Ticket coverage/year',
    ])
    expect(view.queryByText('Labels')).not.toBeInTheDocument()
  })

  it('lists every generated content row from the design', () => {
    const view = renderView()
    expect(
      view.getByText('Payment shows on your card but the invoice remains pending'),
    ).toBeInTheDocument()
    expect(view.getByText('How to Change Your IRA Type from Traditional to Roth')).toBeInTheDocument()
    expect(view.getByRole('link', { name: 'GUIDE: One-time and recu...' })).toBeInTheDocument()
    expect(view.getAllByRole('checkbox', { name: /^Select (?!all content)/ })).toHaveLength(5)
  })

  it('selects and clears every row from the header checkbox', async () => {
    const user = userEvent.setup()
    const view = renderView()
    const selectAll = view.getByRole('checkbox', { name: 'Select all content' })
    const rows = view.getAllByRole('checkbox', { name: /^Select (?!all content)/ })

    await user.click(selectAll)
    expect(rows.every((row) => (row as HTMLInputElement).checked)).toBe(true)

    await user.click(selectAll)
    expect(rows.some((row) => (row as HTMLInputElement).checked)).toBe(false)
  })

  it('marks the header checkbox indeterminate while only some rows are selected', async () => {
    const user = userEvent.setup()
    const view = renderView()
    const selectAll = view.getByRole('checkbox', {
      name: 'Select all content',
    }) as HTMLInputElement

    await user.click(view.getAllByRole('checkbox', { name: /^Select (?!all content)/ })[0])

    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll.checked).toBe(false)
  })

  it('shows a muted n/a instead of a link when a row has no related article', () => {
    const view = renderView()
    expect(view.getAllByRole('link')).toHaveLength(4)
    expect(view.getByText('n/a')).toBeInTheDocument()
  })

  it('carries the design toolbar copy', () => {
    const view = renderView()
    expect(view.getByPlaceholderText('Search content block')).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Filter by segment' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'All filters' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Manage labels' })).toBeInTheDocument()
  })
})
