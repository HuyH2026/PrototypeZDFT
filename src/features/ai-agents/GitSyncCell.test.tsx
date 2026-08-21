import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetSelfImprovementStore } from '@/features/ai-studio/self-improving/self-improvement-store'
import { GitSyncCell } from './GitSyncCell'
import type { Agent } from './agent-builder-data'
import { AgentsTable } from './AgentsTable'

const agent: Agent = {
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
}

describe('GitSyncCell', () => {
  it('shows a Connect repo affordance when not connected', async () => {
    const user = userEvent.setup()
    const onConnectRepo = vi.fn()
    render(
      <GitSyncCell
        agent={agent}
        connected={false}
        state={{ status: 'not-synced' }}
        onSync={() => {}}
        onOpenPanel={() => {}}
        onConnectRepo={onConnectRepo}
      />,
    )
    await user.click(screen.getByRole('button', { name: /connect repo/i }))
    expect(onConnectRepo).toHaveBeenCalled()
  })

  it('shows a status chip and a Sync button when connected', async () => {
    const user = userEvent.setup()
    const onSync = vi.fn()
    render(
      <GitSyncCell
        agent={agent}
        connected
        state={{ status: 'out-of-sync' }}
        onSync={onSync}
        onOpenPanel={() => {}}
        onConnectRepo={() => {}}
      />,
    )
    expect(screen.getByText(/out of sync/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^sync/i }))
    expect(onSync).toHaveBeenCalledWith('w1')
  })

  it('opens the panel when the status chip is clicked', async () => {
    const user = userEvent.setup()
    const onOpenPanel = vi.fn()
    render(
      <GitSyncCell
        agent={agent}
        connected
        state={{ status: 'synced', lastSyncedAt: 'x' }}
        onSync={() => {}}
        onOpenPanel={onOpenPanel}
        onConnectRepo={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: /view git sync details/i }))
    expect(onOpenPanel).toHaveBeenCalledWith('w1')
  })
})

const agents: Agent[] = [agent]

describe('AgentsTable git sync column', () => {
  beforeEach(() => {
    resetSelfImprovementStore()
  })

  it('does not render the column when gitSync is absent', () => {
    render(<AgentsTable agents={agents} isOn={() => true} onToggle={() => {}} />)
    expect(screen.queryByText('Git sync')).not.toBeInTheDocument()
  })

  it('renders the column and isolates Sync clicks from row navigation', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const onSync = vi.fn()
    render(
      <AgentsTable
        agents={agents}
        isOn={() => true}
        onToggle={() => {}}
        onRowClick={onRowClick}
        gitSync={{
          getState: () => ({ status: 'not-synced' }),
          connected: true,
          onSync,
          onOpenPanel: () => {},
          onConnectRepo: () => {},
        }}
      />,
    )
    expect(screen.getByText('Git sync')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sync Knowledge Retrieval' }))
    expect(onSync).toHaveBeenCalledWith('w1')
    expect(onRowClick).not.toHaveBeenCalled()
  })
})
