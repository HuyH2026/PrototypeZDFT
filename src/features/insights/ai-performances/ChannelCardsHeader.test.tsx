import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CHANNEL_TABS } from './channel-tabs'
import { ChannelCardsHeader } from './ChannelCardsHeader'

describe('ChannelCardsHeader', () => {
  it('names the section, its date range and the four channels', () => {
    render(
      <ChannelCardsHeader
        title="Knowledge"
        dateRange="May 2, 2026 – Jun 1, 2026"
        channels={CHANNEL_TABS}
        channel="widget"
        onChannelChange={vi.fn()}
        collapsed={false}
        onToggleCollapsed={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Knowledge' })).toBeInTheDocument()
    expect(screen.getByText('May 2, 2026 – Jun 1, 2026')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Widget' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Web Call' })).toHaveAttribute('aria-selected', 'false')
  })

  it('omits the pill group for a tab with no channel scope', () => {
    render(
      <ChannelCardsHeader
        title="Topics"
        dateRange="May 2, 2026 – Jun 1, 2026"
        collapsed={false}
        onToggleCollapsed={vi.fn()}
      />,
    )
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('reports the channel a pill selects', async () => {
    const user = userEvent.setup()
    const onChannelChange = vi.fn()
    render(
      <ChannelCardsHeader
        title="Knowledge"
        dateRange="May 2, 2026 – Jun 1, 2026"
        channels={CHANNEL_TABS}
        channel="widget"
        onChannelChange={onChannelChange}
        collapsed={false}
        onToggleCollapsed={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('tab', { name: 'Voice' }))
    expect(onChannelChange).toHaveBeenCalledWith('voice')
  })

  it('flips the collapse affordance to Expand cards when collapsed', () => {
    const { rerender } = render(
      <ChannelCardsHeader title="Knowledge" dateRange="x" collapsed={false} onToggleCollapsed={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /Collapse cards/ })).toHaveAttribute('aria-expanded', 'true')
    rerender(
      <ChannelCardsHeader title="Knowledge" dateRange="x" collapsed onToggleCollapsed={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /Expand cards/ })).toHaveAttribute('aria-expanded', 'false')
  })
})
