import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { within } from '@testing-library/react'
import { PASSWORD_RESET_PLAN } from '@/features/ai-studio/self-improving/self-improving-data'
import { activePlanFromImprovementPlan } from '@/features/ai-studio/self-improving/self-improving-approval'
import { resetSelfImprovementStore } from '@/features/ai-studio/self-improving/self-improvement-store'
import { AgentsTable, VOICE_COLUMNS } from './AgentsTable'
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
]

describe('AgentsTable row click', () => {
  it('uses the shared table header spacing', () => {
    render(
      <AgentsTable agents={agents} isOn={() => true} onToggle={() => {}} onRowClick={() => {}} />,
    )
    expect(screen.getByRole('columnheader', { name: 'Use cases' })).toHaveClass('px-3.5', 'py-3.5')
  })

  it('calls onRowClick with the agent id when the row is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <AgentsTable agents={agents} isOn={() => true} onToggle={() => {}} onRowClick={onRowClick} />,
    )
    await user.click(screen.getByTestId('agent-row-w1'))
    expect(onRowClick).toHaveBeenCalledWith('w1')
  })

  it('does not trigger row click when the toggle is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <AgentsTable agents={agents} isOn={() => true} onToggle={() => {}} onRowClick={onRowClick} />,
    )
    await user.click(screen.getByRole('switch', { name: 'Activate Knowledge Retrieval' }))
    expect(onRowClick).not.toHaveBeenCalled()
  })
})

describe('AgentsTable self-improving chip', () => {
  const passwordReset: Agent = {
    id: 'w8',
    name: 'Password Reset',
    on: true,
    isSubflow: false,
    type: 'With intent',
    conversations: 1910,
    resolutions: 649,
    resolutionRate: '34%',
    csat: 1.3,
    tags: ['Riders'],
  }

  beforeEach(() => {
    window.localStorage.clear()
    resetSelfImprovementStore()
  })

  it('marks no row when nothing is on a plan', () => {
    render(
      <AgentsTable agents={[...agents, passwordReset]} isOn={() => true} onToggle={() => {}} />,
    )
    expect(screen.queryByText('Self-improving')).not.toBeInTheDocument()
  })

  it('marks only the row whose id is in the store', () => {
    resetSelfImprovementStore({ w8: activePlanFromImprovementPlan(PASSWORD_RESET_PLAN) })
    render(
      <AgentsTable agents={[...agents, passwordReset]} isOn={() => true} onToggle={() => {}} />,
    )
    expect(
      within(screen.getByTestId('agent-row-w8')).getByText('Self-improving'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('agent-row-w1')).queryByText('Self-improving'),
    ).not.toBeInTheDocument()
  })
})

const voiceAgent: Agent = {
  id: 'v1',
  name: 'Call routing',
  on: true,
  isSubflow: false,
  type: 'Knowledge Retrieval',
  conversations: 19680,
  resolutions: 13813,
  resolutionRate: '84%',
  csat: 4.2,
  tags: [],
  segment: 'All segments',
  totalTalkTime: '19 hr 37 min',
  avgTalkTime: '1 min 12 sec',
  sentiment: '92%',
  contextVariables: ['Caller ID', 'Account tier'],
  actionsUsed: ['Route call', 'Verify identity'],
  subUseCases: [],
  status: 'Published',
  lastModified: { at: 'Jan 4, 2026 9:25 AM', by: 'Brandon Mango' },
}

describe('AgentsTable voice columns', () => {
  it('renders the voice-specific headers instead of the default ones', () => {
    render(
      <AgentsTable
        agents={[voiceAgent]}
        isOn={() => true}
        onToggle={() => {}}
        columns={VOICE_COLUMNS}
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Total talk time' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Context variables' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Tags' })).not.toBeInTheDocument()
  })

  it('renders voice cell values, falling back for unset optional fields', () => {
    render(
      <AgentsTable
        agents={[voiceAgent]}
        isOn={() => true}
        onToggle={() => {}}
        columns={VOICE_COLUMNS}
      />,
    )
    expect(screen.getByText('19 hr 37 min')).toBeInTheDocument()
    expect(screen.getByText('Caller ID +1')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
  })
})
