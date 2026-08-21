import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GitSyncPanel } from './GitSyncPanel'
import { seedAgents } from './agent-store'

function w3() {
  const a = seedAgents().find((x) => x.id === 'w3')
  if (!a) throw new Error('seed w3 missing')
  return a
}
const connection = { repoUrl: 'github.com/acme/agents', branch: 'main', basePath: 'agents', connectedAt: 'x' }

describe('GitSyncPanel', () => {
  it('lists the four synced files and previews policy.yaml by default', () => {
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'synced' }} onSync={() => {}} onDisconnect={() => {}} onClose={() => {}} />)
    const tree = screen.getByRole('list', { name: 'Synced files' })
    expect(within(tree).getByText('policy.yaml')).toBeInTheDocument()
    expect(within(tree).getByText('tools.yaml')).toBeInTheDocument()
    expect(within(tree).getByText('context.yaml')).toBeInTheDocument()
    expect(within(tree).getByText('agent.json')).toBeInTheDocument()
    // Default preview is policy.yaml.
    expect(screen.getByTestId('git-sync-preview').textContent).toContain('title:')
  })

  it('switches the preview when another file is selected', async () => {
    const user = userEvent.setup()
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'synced' }} onSync={() => {}} onDisconnect={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'agent.json' }))
    expect(screen.getByTestId('git-sync-preview').textContent).toContain('"id": "w3"')
  })

  it('calls onSync from the Sync now button', async () => {
    const user = userEvent.setup()
    const onSync = vi.fn()
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'out-of-sync' }} onSync={onSync} onDisconnect={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Sync now' }))
    expect(onSync).toHaveBeenCalledWith('w3')
  })

  it('calls onDisconnect from the Disconnect button', async () => {
    const user = userEvent.setup()
    const onDisconnect = vi.fn()
    render(<GitSyncPanel agent={w3()} connection={connection} state={{ status: 'synced' }} onSync={() => {}} onDisconnect={onDisconnect} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Disconnect' }))
    expect(onDisconnect).toHaveBeenCalled()
  })
})
