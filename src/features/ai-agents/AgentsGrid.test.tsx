import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AgentsGrid } from './AgentsGrid'
import { DEFAULT_COLUMNS } from './AgentsTable'
import type { Agent } from './agent-builder-data'

const agents: Agent[] = [
  {
    id: 'w1',
    name: 'Knowledge Retrieval',
    on: true,
    isSubflow: false,
    type: 'Knowledge Retrieval',
    conversations: 19680,
    resolutions: 13813,
    resolutionRate: '84%',
    csat: 4.2,
    tags: ['Riders', 'Drivers'],
  },
  {
    id: 'w2',
    name: 'Call routing',
    on: true,
    isSubflow: false,
    type: 'Knowledge Retrieval',
    conversations: 4200,
    resolutions: 3600,
    resolutionRate: '86%',
    csat: 4.2,
    tags: [],
    canToggle: false,
  },
]

describe('AgentsGrid', () => {
  it('renders a card per agent with its name, type, and first three columns', () => {
    render(
      <AgentsGrid agents={agents} isOn={() => true} onToggle={() => {}} columns={DEFAULT_COLUMNS} />,
    )
    const card = screen.getByTestId('agent-card-w1')
    expect(card).toBeInTheDocument()
    expect(within(card).getAllByText('Knowledge Retrieval')).toHaveLength(2)
    expect(within(card).getByText('19,680')).toBeInTheDocument()
  })

  it('calls onRowClick with the agent id when the card is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <AgentsGrid
        agents={agents}
        isOn={() => true}
        onToggle={() => {}}
        onRowClick={onRowClick}
        columns={DEFAULT_COLUMNS}
      />,
    )
    await user.click(screen.getByTestId('agent-card-w1'))
    expect(onRowClick).toHaveBeenCalledWith('w1')
  })

  it('does not trigger row click when the toggle is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <AgentsGrid
        agents={agents}
        isOn={() => true}
        onToggle={() => {}}
        onRowClick={onRowClick}
        columns={DEFAULT_COLUMNS}
      />,
    )
    await user.click(screen.getByRole('switch', { name: 'Activate Knowledge Retrieval' }))
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('shows a fixed status dot instead of a switch when canToggle is false', () => {
    render(
      <AgentsGrid agents={agents} isOn={() => true} onToggle={() => {}} columns={DEFAULT_COLUMNS} />,
    )
    expect(screen.queryByRole('switch', { name: 'Activate Call routing' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Call routing is On')).toBeInTheDocument()
  })
})
