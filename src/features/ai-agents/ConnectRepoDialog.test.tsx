import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConnectRepoDialog } from './ConnectRepoDialog'

describe('ConnectRepoDialog', () => {
  it('disables Connect until a repository URL is entered', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn()
    render(<ConnectRepoDialog brandName="Uber" channelLabel="Widget" onCancel={() => {}} onConnect={onConnect} />)
    const connect = screen.getByRole('button', { name: 'Connect repository' })
    expect(connect).toBeDisabled()
    await user.type(screen.getByLabelText('Repository URL'), 'github.com/acme/agents')
    expect(connect).toBeEnabled()
    await user.click(connect)
    expect(onConnect).toHaveBeenCalledWith({
      repoUrl: 'github.com/acme/agents', branch: 'main', basePath: 'agents',
    })
  })

  it('calls onCancel from the Cancel button', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConnectRepoDialog brandName="Uber" channelLabel="Widget" onCancel={onCancel} onConnect={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
