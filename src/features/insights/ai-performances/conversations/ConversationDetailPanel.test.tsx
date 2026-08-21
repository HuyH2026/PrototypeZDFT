import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ConversationDetailPanel } from './ConversationDetailPanel'
import { CHANNELS, type ConvDetail } from './conversations-data'

// The transcript's error rows render router Links ("View failed step"), so the
// panel's renders need a router context.
const renderPanel = (detail: ConvDetail, onClose: () => void = () => {}) =>
  render(
    <MemoryRouter>
      <ConversationDetailPanel detail={detail} onClose={onClose} />
    </MemoryRouter>,
  )

const a2aDetail = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!.detail
const mcpDetail = CHANNELS.headless.rows.find((r) => r.client === 'Claude Desktop')!.detail

describe('ConversationDetailPanel', () => {
  it('renders the A2A conversation with calling-client wording', () => {
    renderPanel(a2aDetail)
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Calling client')).toBeInTheDocument()
    expect(screen.getAllByText('OpenClaw').length).toBeGreaterThan(0)
    expect(screen.getByText(/Delegation token verified/)).toBeInTheDocument()
  })

  it('renders the MCP conversation with MCP-client wording', () => {
    renderPanel(mcpDetail)
    expect(screen.getByText('MCP client')).toBeInTheDocument()
    expect(screen.getAllByText('Claude Desktop').length).toBeGreaterThan(0)
    expect(screen.getByText(/SAML SSO setup steps/)).toBeInTheDocument()
  })

  it('closes on the Close button, the scrim, and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderPanel(a2aDetail, onClose)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.click(screen.getByTestId('conversation-detail-scrim'))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})

const widgetDetail = (id: string) => CHANNELS.widget.rows.find((r) => r.id === id)!.detail

describe('ConversationDetailPanel · audit', () => {
  it('leads with an error card listing each error on a failing conversation', () => {
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    // Scoped to the card: `1 error` renders twice on purpose — the card states
    // the conversation's count, the exchange strip states its own.
    const card = within(dialog.getByTestId('conversation-error-card'))
    expect(card.getByText('Partial failure')).toBeInTheDocument()
    expect(card.getByText('1 error')).toBeInTheDocument()
    expect(card.getByText('Missing context variable')).toBeInTheDocument()
    expect(card.getByText('err_9f2c41a7')).toBeInTheDocument()
    expect(card.getByRole('button', { name: /Jump to Missing context variable/ })).toBeInTheDocument()
  })

  it('preserves the chat and trace IDs on the identity grid', () => {
    renderPanel(widgetDetail('g-1'))
    const identity = within(screen.getByTestId('conversation-identity'))
    expect(identity.getByText('Chat ID')).toBeInTheDocument()
    expect(identity.getByText('3e732807-c2d0-4ce3-8b5e-c87c28abb701')).toBeInTheDocument()
    expect(identity.getByText('Trace ID')).toBeInTheDocument()
    expect(identity.getByText('tr_01J9XW4K8Q2M7Z3N6V0B5T8YC')).toBeInTheDocument()
    expect(identity.getByRole('button', { name: 'Copy Chat ID' })).toBeInTheDocument()
    expect(identity.getByRole('button', { name: 'Copy Trace ID' })).toBeInTheDocument()
  })

  it('keeps the conversation summary and drops the generated error-summary', () => {
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    expect(dialog.getByText('Summary')).toBeInTheDocument()
    expect(dialog.getByText(/The customer's request was resolved within policy/)).toBeInTheDocument()
    expect(dialog.queryByText(/The account lookup that would have explained/)).not.toBeInTheDocument()
  })

  it('removes the intent reassignment and verdict controls', () => {
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    expect(dialog.queryByRole('button', { name: 'Define a New Intent' })).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: /Assign to an existing intent/ })).not.toBeInTheDocument()
    expect(dialog.queryByText(/Whats your verdict/)).not.toBeInTheDocument()
    expect(dialog.queryByText(/Context Variables/)).not.toBeInTheDocument()
    expect(dialog.queryByText(/User queries:/)).not.toBeInTheDocument()
    expect(dialog.queryByText(/Relevance reasoning:/)).not.toBeInTheDocument()
  })

  it('shows no error card on a healthy conversation', () => {
    renderPanel(widgetDetail('g-2'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    expect(dialog.queryByTestId('conversation-error-card')).not.toBeInTheDocument()
    expect(dialog.queryByText('Healthy')).not.toBeInTheDocument()
  })

  it('reports impact and owner on a healthy conversation too', () => {
    renderPanel(widgetDetail('g-2'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    // Scoped to the meta grid — a bare '—' would match an em dash anywhere in
    // the drawer, the transcript included.
    const meta = within(dialog.getByTestId('conversation-meta-grid'))
    expect(meta.getByText('Answer delivered')).toBeInTheDocument()
    expect(meta.getByText('Customer impact')).toBeInTheDocument()
    expect(meta.getByText('Investigation owner')).toBeInTheDocument()
    expect(meta.getByText('—')).toBeInTheDocument()
    expect(meta.getByText('Sentiment')).toBeInTheDocument()
    expect(meta.getByText('CSAT')).toBeInTheDocument()
  })

  it('names the owner and how it was classified on a failing conversation', () => {
    renderPanel(widgetDetail('g-4'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    // The owner is named in both places on a failing row; scope each claim to
    // the surface making it.
    expect(within(dialog.getByTestId('conversation-error-card')).getByText('Integration')).toBeInTheDocument()
    const meta = within(dialog.getByTestId('conversation-meta-grid'))
    expect(meta.getByText('Integration')).toBeInTheDocument()
    expect(meta.getByText(/Classified from: the failing step is an outbound call/)).toBeInTheDocument()
  })

  it('reveals the failing exchange when its error is clicked', async () => {
    const user = userEvent.setup()
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    expect(dialog.queryByText(/the account identifier was unavailable/)).not.toBeInTheDocument()
    await user.click(dialog.getByRole('button', { name: /Jump to Missing context variable/ }))
    expect(dialog.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
  })

  it('returns to the Conversation tab before revealing, from the AI QA tab', async () => {
    const user = userEvent.setup()
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    await user.click(dialog.getByRole('tab', { name: 'AI QA' }))
    expect(dialog.queryByTestId('exchange-1')).not.toBeInTheDocument()
    await user.click(dialog.getByRole('button', { name: /Jump to Missing context variable/ }))
    expect(dialog.getByRole('tab', { name: 'Conversation' })).toHaveAttribute('aria-selected', 'true')
    expect(dialog.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
  })

  // The Conversation subtree is unmounted while AI QA is showing, so the reveal
  // has to be single-use: a live nonce on a remount would re-open, re-ring and
  // re-scroll the drawer on an ordinary tab return.
  it('does not replay the reveal on a Conversation ⇄ AI QA round trip', async () => {
    const user = userEvent.setup()
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    await user.click(dialog.getByRole('button', { name: /Jump to Missing context variable/ }))
    expect(dialog.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
    await user.click(dialog.getByRole('tab', { name: 'AI QA' }))
    await user.click(dialog.getByRole('tab', { name: 'Conversation' }))
    expect(dialog.queryByText(/the account identifier was unavailable/)).not.toBeInTheDocument()
  })

  it('scrolls to the failing exchange even when a kind filter was hiding it', async () => {
    const user = userEvent.setup()
    // jsdom implements no scrollIntoView; install one for this test and take it
    // back out again so the guard in TranscriptBody keeps its job elsewhere.
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      renderPanel(widgetDetail('g-4'))
      const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
      // g-4's error sits in exchange 2, which holds no intent — so Intents hides it.
      await user.click(dialog.getByRole('button', { name: /^Details/ }))
      await user.click(dialog.getByRole('menuitem', { name: /Intents/ }))
      expect(dialog.queryByTestId('exchange-2')).not.toBeInTheDocument()

      scrollIntoView.mockClear()
      await user.click(dialog.getByRole('button', { name: /Jump to Tool timeout/ }))
      expect(dialog.getByTestId('exchange-2')).toBeInTheDocument()
      expect(scrollIntoView).toHaveBeenCalled()
    } finally {
      delete (Element.prototype as Partial<Element>).scrollIntoView
    }
  })

  it('leaves a channel without an audit exactly as it was', () => {
    const headless = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!.detail
    renderPanel(headless)
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    expect(dialog.getByText('Events:')).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: /Add…/ })).toBeInTheDocument()
    expect(dialog.queryByText('Customer impact')).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: /Show details/ })).not.toBeInTheDocument()
    // No trace ID without an audit — only the chat ID is preserved.
    expect(dialog.queryByText('Trace ID')).not.toBeInTheDocument()
  })

  it('drops the old Events timeline where an audit replaces it', () => {
    renderPanel(widgetDetail('g-1'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    expect(dialog.queryByText('Events:')).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: /Add…/ })).not.toBeInTheDocument()
  })
})

describe('ConversationDetailPanel · outcome labels', () => {
  it('shows a help-center-linked tooltip on both the Deflected and Resolved rows', () => {
    renderPanel(widgetDetail('g-2'))
    const dialog = within(screen.getByRole('dialog', { name: 'Conversation Details' }))
    // Both contract-gated outcome terms live on the identity grid now.
    const identity = within(dialog.getByTestId('conversation-identity'))
    expect(identity.getByRole('button', { name: /Deflected/ })).toBeInTheDocument()
    expect(identity.getByRole('button', { name: /Resolved/ })).toBeInTheDocument()
    expect(dialog.getAllByRole('link', { name: 'Learn more' })).toHaveLength(2)
  })
})
