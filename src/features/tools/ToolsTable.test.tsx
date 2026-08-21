import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ToolsTable } from './ToolsTable'
import { TOOL_ACTIONS } from './tools-data'

describe('ToolsTable', () => {
  it('renders the available tools in a named semantic table', () => {
    render(<ToolsTable onOpen={() => {}} />)
    expect(screen.getByRole('table', { name: 'Available tools' })).toBeInTheDocument()
  })

  it('renders a row for every action with its name and type', () => {
    render(<ToolsTable onOpen={() => {}} />)
    for (const a of TOOL_ACTIONS) {
      expect(screen.getByText(a.name)).toBeInTheDocument()
    }
    for (const type of ['API', 'MCP', 'Browser'] as const) {
      expect(screen.getAllByText(type)).toHaveLength(
        TOOL_ACTIONS.filter((a) => a.type === type).length,
      )
    }
  })

  it('shows the static Name (113) header count', () => {
    render(<ToolsTable onOpen={() => {}} />)
    expect(screen.getByText('Name (113)')).toBeInTheDocument()
  })

  // Counted off the data rather than pinned to a literal: the catalog grows as
  // policies name new actions, and a badge count is not what these assert.
  it('renders the state badges', () => {
    render(<ToolsTable onOpen={() => {}} />)
    for (const state of ['Live', 'Read only', 'Auto-saved'] as const) {
      const expected = TOOL_ACTIONS.filter((a) => a.state === state).length
      expect(expected).toBeGreaterThan(0)
      expect(screen.getAllByText(state)).toHaveLength(expected)
    }
  })

  it('renders "n/a" for rows without agents', () => {
    render(<ToolsTable onOpen={() => {}} />)
    expect(screen.getAllByText('n/a')).toHaveLength(
      TOOL_ACTIONS.filter((a) => a.useCase === null).length,
    )
  })

  it('calls onOpen with the row id when a row is clicked', () => {
    const onOpen = vi.fn()
    render(<ToolsTable onOpen={onOpen} />)
    fireEvent.click(screen.getByText('Reconcile payout'))
    expect(onOpen).toHaveBeenCalledWith('t3')
  })

  it('does not call onOpen when the row checkbox is clicked', () => {
    const onOpen = vi.fn()
    render(<ToolsTable onOpen={onOpen} />)
    const row = screen.getByTestId('tool-row-t3')
    fireEvent.click(within(row).getByTestId('tool-row-checkbox'))
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('does not call onOpen when the row options button is clicked', () => {
    const onOpen = vi.fn()
    render(<ToolsTable onOpen={onOpen} />)
    fireEvent.click(screen.getByLabelText('Reconcile payout options'))
    expect(onOpen).not.toHaveBeenCalled()
  })
})
