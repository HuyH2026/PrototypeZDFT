import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KNOWLEDGE_CHANNELS, KNOWLEDGE_COLUMNS } from './knowledge-data'
import { KnowledgeGapTable, KnowledgeTable } from './KnowledgeTable'

const { rows, gapRows } = KNOWLEDGE_CHANNELS.widget

describe('KnowledgeTable', () => {
  it('renders every named column and one cell per column per row', () => {
    render(<KnowledgeTable rows={rows} showChange={false} />)
    for (const col of KNOWLEDGE_COLUMNS) {
      expect(screen.getByRole('columnheader', { name: col.label })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('cell')).toHaveLength(rows.length * KNOWLEDGE_COLUMNS.length)
  })

  it('stacks the surface count over the click count', () => {
    render(<KnowledgeTable rows={rows} showChange={false} />)
    expect(screen.getByText('7,616 times surfaced')).toBeInTheDocument()
    expect(screen.getByText('500 (7%) clicked')).toBeInTheDocument()
  })

  it('shows a resolution count beside its derived share', () => {
    render(<KnowledgeTable rows={rows} showChange={false} />)
    const row = screen.getByText('Withdrawing Funds from Your Investment Account').closest('tr')!
    expect(within(row).getByText('8,390')).toBeInTheDocument()
    expect(within(row).getByText('(85%)')).toBeInTheDocument()
  })

  it('adds a period-over-period change to numeric cells only when asked', () => {
    const { rerender } = render(<KnowledgeTable rows={rows} showChange={false} />)
    expect(screen.queryByText('+12.4%')).not.toBeInTheDocument()
    rerender(<KnowledgeTable rows={rows} showChange />)
    expect(screen.getByText('+12.4%')).toBeInTheDocument()
    expect(screen.getByText('+8.1%')).toBeInTheDocument()
    expect(screen.getByText('-3.2%')).toBeInTheDocument()
  })

  it('renders a muted n/a for every absent value rather than an empty cell', () => {
    render(<KnowledgeTable rows={rows} showChange={false} />)
    // Row 2 has no integration, no click count, no engagement, no rate, and no feedback.
    const row = screen.getByText('Guide to Withdrawing Funds').closest('tr')!
    expect(within(row).getAllByText('n/a')).toHaveLength(5)
  })

  it('renders the top-agent chip with its overflow count', () => {
    render(<KnowledgeTable rows={rows} showChange={false} />)
    const chip = screen.getByText('Transaction failed').closest('span')!
    expect(within(chip).getByText('+2')).toBeInTheDocument()
  })

  it('links every related article', () => {
    render(<KnowledgeTable rows={rows} showChange={false} />)
    // "Guide to withdrawing funds from…" appears in two rows, so use getAllByRole
    expect(screen.getAllByRole('button', { name: 'Guide to withdrawing funds from…' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'How to Withdraw funds from your…' })).toBeInTheDocument()
  })
})

describe('KnowledgeGapTable', () => {
  it('renders the gap columns and a muted n/a where no article is suggested', () => {
    render(<KnowledgeGapTable rows={gapRows} />)
    for (const label of [
      'Missing topic',
      'Conversations affected',
      'Non-resolutions',
      'Suggested article',
    ]) {
      expect(screen.getByRole('columnheader', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByText('Wire transfer cut-off times')).toBeInTheDocument()
    const row = screen.getByText('Beneficiary changes after a divorce').closest('tr')!
    expect(within(row).getByText('n/a')).toBeInTheDocument()
  })
})
