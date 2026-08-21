import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'
import { MetricInsightPopover } from './MetricInsightPopover'
import { STAT_CARDS } from './ai-performances-data'

function emittedHexColor(className: string, utility: 'text' | 'bg' | 'hover:bg') {
  const match = new RegExp(`(?:^|\\s)${utility}-\\[(#[0-9a-fA-F]{6})\\]`).exec(className)
  if (!match) throw new Error(`Expected ${utility} color utility in: ${className}`)
  return match[1]
}

function relativeLuminance(hex: string) {
  const channels = hex.match(/[0-9a-f]{2}/gi)!.map((channel) => Number.parseInt(channel, 16) / 255)
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

function renderPopover(cardTitle: string) {
  const card = STAT_CARDS.find((c) => c.title === cardTitle)!
  render(
    <MemoryRouter initialEntries={['/insights/ai-performances']}>
      <AiAssistantProvider>
        <MetricInsightPopover card={card} />
        <AiAssistantHost />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
}

describe('MetricInsightPopover', () => {
  it('emits WCAG AA normal-text contrast for status pills and their hover states', () => {
    const cases = [
      { title: 'Automated resolutions (AR)', name: 'Needs attention for Automated resolutions (AR)' },
      { title: 'Realized savings', name: 'Improved for Realized savings' },
    ]

    for (const { title, name } of cases) {
      renderPopover(title)
      const className = screen.getByRole('button', { name }).className
      const foreground = emittedHexColor(className, 'text')

      expect(contrastRatio(foreground, emittedHexColor(className, 'bg'))).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(foreground, emittedHexColor(className, 'hover:bg'))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('renders a persistent needs-attention indicator before the popover opens', () => {
    renderPopover('Automated resolutions (AR)')
    const indicator = screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' })
    expect(indicator).toHaveTextContent('Needs attention')
    expect(screen.queryByTestId('metric-insight-popover-Automated resolutions (AR)')).not.toBeInTheDocument()
  })

  it('opens the attention popover when its persistent indicator is hovered', async () => {
    const user = userEvent.setup()
    renderPopover('Automated resolutions (AR)')
    await user.hover(screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' }))
    const popover = await screen.findByTestId('metric-insight-popover-Automated resolutions (AR)')
    expect(within(popover).getByText('Needs attention')).toBeInTheDocument()
    expect(
      within(popover).getByText('Widget automation dipped while Email and Voice improved.'),
    ).toBeInTheDocument()
    expect(within(popover).getByRole('button', { name: 'Investigate in AI Studio' })).toBeInTheDocument()
  })

  it('renders an open insight above the dashboard section layers', async () => {
    const user = userEvent.setup()
    renderPopover('Automated resolutions (AR)')

    await user.hover(screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' }))

    const popover = await screen.findByTestId('metric-insight-popover-Automated resolutions (AR)')
    expect(popover.parentElement).toBe(document.body)
    expect(popover).toHaveClass('fixed', 'z-50')
  })

  it('renders a persistent improved indicator before its popover opens', () => {
    renderPopover('Realized savings')
    const indicator = screen.getByRole('button', { name: 'Improved for Realized savings' })
    expect(indicator).toHaveTextContent('Improved')
    expect(screen.queryByTestId('metric-insight-popover-Realized savings')).not.toBeInTheDocument()
  })

  it('unhovering closes the popover', async () => {
    const user = userEvent.setup()
    renderPopover('Automated resolutions (AR)')
    const statusPill = screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' })
    await user.hover(statusPill)
    await screen.findByTestId('metric-insight-popover-Automated resolutions (AR)')
    await user.unhover(statusPill)
    await waitFor(() => {
      expect(
        screen.queryByTestId('metric-insight-popover-Automated resolutions (AR)'),
      ).not.toBeInTheDocument()
    })
  })

  it('closes the popover when its scroll container moves', async () => {
    const user = userEvent.setup()
    renderPopover('Automated resolutions (AR)')
    await user.hover(screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' }))
    await screen.findByTestId('metric-insight-popover-Automated resolutions (AR)')

    window.dispatchEvent(new Event('scroll', { bubbles: true }))

    await waitFor(() => {
      expect(
        screen.queryByTestId('metric-insight-popover-Automated resolutions (AR)'),
      ).not.toBeInTheDocument()
    })
  })

  it('the drill-in button stays reachable by keyboard focus after opening via focus', async () => {
    const user = userEvent.setup()
    renderPopover('Automated resolutions (AR)')
    const statusPill = screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' })
    statusPill.focus()
    await screen.findByTestId('metric-insight-popover-Automated resolutions (AR)')
    await user.tab()
    const drillInButton = screen.getByRole('button', { name: /Investigate in AI Studio|See what changed/ })
    expect(drillInButton).toHaveFocus()

    // Guard against a closing race: the icon's blur (from focus moving onto
    // the drill-in button) must not schedule a close that later unmounts the
    // popover out from under the now-focused button. Wait longer than the
    // hover-intent close delay and confirm it's still there before acting.
    await new Promise((r) => setTimeout(r, 300))
    expect(screen.getByTestId('metric-insight-popover-Automated resolutions (AR)')).toBeInTheDocument()
    expect(drillInButton).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
  })

  it('drilling in on a plain card opens the AI Studio full view with a list-only conversation', async () => {
    const user = userEvent.setup()
    renderPopover('Automated resolutions (AR)')
    await user.hover(screen.getByRole('button', { name: 'Needs attention for Automated resolutions (AR)' }))
    await user.click(await screen.findByRole('button', { name: 'Investigate in AI Studio' }))
    expect(screen.getByTestId('ai-studio-landing')).toBeInTheDocument()
    const body = screen.getByTestId('ai-studio-conversation-body')
    expect(body).toHaveTextContent('Widget automation dipped while Email and Voice improved.')
    expect(body).toHaveTextContent('Widget: 90% (-2%)')
  })

})
