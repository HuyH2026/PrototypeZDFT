import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConversationDetailPanel } from './ConversationDetailPanel'
import { CHANNELS } from './conversations-data'

const a2aDetail = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!.detail
const mcpDetail = CHANNELS.headless.rows.find((r) => r.client === 'Claude Desktop')!.detail

describe('ConversationDetailPanel', () => {
  it('renders the A2A conversation with calling-client wording', () => {
    render(<ConversationDetailPanel detail={a2aDetail} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Calling client')).toBeInTheDocument()
    expect(screen.getAllByText('OpenClaw').length).toBeGreaterThan(0)
    expect(screen.getByText(/Delegation token verified/)).toBeInTheDocument()
  })

  it('renders the MCP conversation with MCP-client wording', () => {
    render(<ConversationDetailPanel detail={mcpDetail} onClose={() => {}} />)
    expect(screen.getByText('MCP client')).toBeInTheDocument()
    expect(screen.getAllByText('Claude Desktop').length).toBeGreaterThan(0)
    expect(screen.getByText(/SAML SSO setup steps/)).toBeInTheDocument()
  })

  it('closes on the Close button, the scrim, and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ConversationDetailPanel detail={a2aDetail} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.click(screen.getByTestId('conversation-detail-scrim'))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
