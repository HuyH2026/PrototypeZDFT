import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ToolsHistoryTable } from './ToolsHistoryTable'
import { TOOL_RUNS } from './tools-data'

describe('ToolsHistoryTable', () => {
  it('renders the tool run history in a named semantic table', () => {
    render(<ToolsHistoryTable />)
    expect(screen.getByRole('table', { name: 'Tool run history' })).toBeInTheDocument()
  })

  it('renders a row for every run, showing the linked action name', () => {
    render(<ToolsHistoryTable />)
    const table = screen.getByTestId('tools-history-table')
    expect(within(table).getByText(TOOL_RUNS[0].name)).toBeInTheDocument()
    expect(within(table).getAllByText('Freeze Card')).toHaveLength(2)
    expect(within(table).getByText('Cancel order')).toBeInTheDocument()
  })

  it('shows the static Run (113) header count', () => {
    render(<ToolsHistoryTable />)
    expect(screen.getByText('Run (113)')).toBeInTheDocument()
  })

  it('renders all three status badges with the expected counts', () => {
    render(<ToolsHistoryTable />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getAllByText('Completed')).toHaveLength(4)
    expect(screen.getAllByText('Failed')).toHaveLength(1)
  })

  it('renders channel pill labels', () => {
    render(<ToolsHistoryTable />)
    expect(screen.getByText('Headless')).toBeInTheDocument()
    expect(screen.getAllByText('Voice')).toHaveLength(3)
    expect(screen.getByText('Web Call')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  it('renders "n/a" for runs with a null conversation id', () => {
    render(<ToolsHistoryTable />)
    expect(screen.getByText('n/a')).toBeInTheDocument()
  })
})
