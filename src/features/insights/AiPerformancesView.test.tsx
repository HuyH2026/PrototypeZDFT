import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'
import { DONUT_INNER_RADIUS_RATIO } from './ai-performances/CustomInsights'
import { AiPerformancesView } from './AiPerformancesView'

function stubStorage() {
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => void entries.set(key, value),
    removeItem: (key: string) => void entries.delete(key),
    clear: () => entries.clear(),
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    length: 0,
  })
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/insights/agent-overview']}>
      <BrandProvider>
        <AiAssistantProvider>
          <AiPerformancesView />
          <AiAssistantHost />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

describe('AiPerformancesView', () => {
  beforeEach(() => stubStorage())
  afterEach(() => vi.unstubAllGlobals())

  it('uses a 19% ring for the custom-insight donut charts', () => {
    expect(DONUT_INNER_RADIUS_RATIO).toBe(0.81)
  })

  it('offers the analytics tabs the frames add, in their order', () => {
    renderScreen()
    const strip = within(
      within(screen.getByTestId('view-ai-performances')).getByRole('tablist', {
        name: 'Agent Overview views',
      }),
    )
    expect(strip.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Overview',
      'Conversations',
      'Knowledge',
      'Use cases',
      'Topics',
    ])
  })

  it('lands on the Knowledge tab', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    await user.click(
      within(view.getByRole('tablist', { name: 'Agent Overview views' })).getByRole('tab', {
        name: 'Knowledge',
      }),
    )
    expect(screen.getByTestId('view-ao-knowledge')).toBeInTheDocument()
    expect(
      within(screen.getByTestId('view-ao-knowledge')).getByRole('heading', { name: 'Click rate' }),
    ).toBeInTheDocument()
  })

  it('lands on the Use cases tab', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    await user.click(
      within(view.getByRole('tablist', { name: 'Agent Overview views' })).getByRole('tab', {
        name: 'Use cases',
      }),
    )
    const useCases = within(screen.getByTestId('view-ao-use-cases'))
    expect(useCases.getByRole('columnheader', { name: 'Deflection rate' })).toBeInTheDocument()
  })

  it('lands on the Topics tab, distinct from the Insights ▸ Topics destination', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    await user.click(
      within(view.getByRole('tablist', { name: 'Agent Overview views' })).getByRole('tab', {
        name: 'Topics',
      }),
    )
    const topics = within(screen.getByTestId('view-ao-topics'))
    expect(topics.getByRole('columnheader', { name: 'Topics (115)' })).toBeInTheDocument()
    // The agent-scoped tab, not cx-journey's org-wide screen.
    expect(screen.queryByTestId('view-cx-journey')).not.toBeInTheDocument()
  })

  it('intentionally overlaps three tab names with nav destinations (analytics vs. authoring)', () => {
    renderScreen()
    const tabs = within(screen.getByTestId('view-ai-performances')).getByRole('tablist', {
      name: 'Agent Overview views',
    })
    // Knowledge and Use cases share names with Agent Builder destinations,
    // Topics with Insights ▸ Topics — the distinction is analytics here,
    // authoring there.
    expect(within(tabs).getByRole('tab', { name: 'Knowledge' })).toBeInTheDocument()
    expect(within(tabs).getByRole('tab', { name: 'Use cases' })).toBeInTheDocument()
    expect(within(tabs).getByRole('tab', { name: 'Topics' })).toBeInTheDocument()
  })

  it('renders the twelve summary metrics from the supplied content design', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))

    expect(view.getByText('Automated resolutions (AR)')).toBeInTheDocument()
    expect(view.getByText('Escalations')).toBeInTheDocument()
    expect(view.getAllByText('89%').length).toBeGreaterThan(0)
    expect(view.getByText('18%')).toBeInTheDocument()
    expect(view.queryByText('495,872')).not.toBeInTheDocument()
    expect(view.queryByText('Tickets reopened')).not.toBeInTheDocument()
    expect(view.queryByText('Escalations to a human')).not.toBeInTheDocument()
  })

  it('switches between aggregate and per-channel overview states', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    const breakdown = view.getByRole('checkbox', { name: 'Channel breakdown' })
    const flow = view.getByTestId('conversation-flow')

    expect(breakdown).toBeChecked()
    expect(flow).toHaveAttribute('data-channel-breakdown', 'true')
    expect(view.getByText('300,000')).toBeInTheDocument()

    await user.click(breakdown)

    expect(breakdown).not.toBeChecked()
    expect(flow).toHaveAttribute('data-channel-breakdown', 'false')
    expect(view.queryByText('300,000')).not.toBeInTheDocument()
  })

  it('uses the streamlined Figma section hierarchy', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))

    for (const title of [
      'Overview',
      'Custom insights',
      'Conversation trends',
      'Conversation comparison',
    ]) {
      expect(view.getByRole('heading', { name: title })).toBeInTheDocument()
    }
    expect(view.getByRole('heading', { name: 'Worst performing workflow' })).toBeInTheDocument()
    expect(
      view.queryByRole('heading', { name: 'Performance insights (AI)' }),
    ).not.toBeInTheDocument()
    expect(view.queryByTestId('ai-performance-briefing')).not.toBeInTheDocument()
    expect(
      view.queryByRole('button', { name: /Needs attention for|Improved for/ }),
    ).not.toBeInTheDocument()
  })

  it('renders the eight conversation-trend cards from the supplied design', () => {
    renderScreen()
    const trends = within(screen.getByTestId('conversation-trends'))

    for (const title of [
      'Conversations',
      'Resolution rate',
      'Knowledge article surfaced',
      'Avg. CSAT',
      'Positive sentiment',
      'Quick feedback',
      'Relevance',
      'User engagement',
    ]) {
      expect(trends.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })

  it('renders the five comparison detail cards from the supplied design', () => {
    renderScreen()
    const details = within(screen.getByTestId('comparison-detail-cards'))

    for (const title of ['Resolutions', 'CSAT', 'Relevance', 'Quick feedback', 'Engagement']) {
      expect(details.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })

  it('labels every sales-funnel stage once', () => {
    renderScreen()
    const funnel = within(screen.getByTestId('sales-funnel'))
    const names = within(screen.getByTestId('funnel-stage-names'))
    for (const [name, pct, count] of [
      ['Recommendation', '100%', '3,000'],
      ['Added to cart', '30%', '900'],
      ['Checkout process', '26.67%', '800'],
      ['Checked out successfully', '10%', '300'],
      ['Returned', '0.6%', '18'],
    ]) {
      expect(names.getByText(name)).toBeInTheDocument()
      expect(funnel.getAllByText(pct).length).toBeGreaterThan(0)
      expect(funnel.getByText(count)).toBeInTheDocument()
    }
  })

  it('renders the worst-performing workflow rows', () => {
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    expect(view.getByText('Vew bank statement')).toBeInTheDocument()
    expect(view.getByText('Update profile')).toBeInTheDocument()
    expect(view.getByText('Close your account')).toBeInTheDocument()
  })

  it('collapses the overview section', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    expect(view.getByText('550,982')).toBeInTheDocument()
    await user.click(view.getAllByRole('button', { name: 'Collapse' })[0])
    expect(view.queryByText('550,982')).not.toBeInTheDocument()
  })

  it('mounts the conversation drawer outside the Agent Overview surface', async () => {
    const user = userEvent.setup()
    renderScreen()
    const surface = screen.getByTestId('view-ai-performances')
    const view = within(surface)

    await user.click(view.getByRole('tab', { name: 'Conversations' }))
    await user.click(view.getByText(/Abnormal bank statement/))

    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(surface).not.toContainElement(dialog)
  })

  it('supports the comparison controls from the supplied design', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    const channels = within(view.getByRole('group', { name: 'Channel' }))
    const comparison = view.getByRole('checkbox', { name: 'Show comparison' })

    expect(channels.getByRole('button', { name: 'Widget' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(channels.getByRole('button', { name: 'Headless' }))
    expect(channels.getByRole('button', { name: 'Headless' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    expect(comparison).toBeChecked()
    await user.click(comparison)
    expect(comparison).not.toBeChecked()

    await user.click(view.getByRole('button', { name: 'Bar view' }))
    expect(view.getByRole('button', { name: 'Bar view' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('starts the comparison with one focused metric and lets people add or remove metrics', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    const metrics = within(view.getByRole('group', { name: 'Metric visibility' }))
    const conversations = metrics.getByRole('checkbox', { name: 'Conversations' })
    const resolutions = metrics.getByRole('checkbox', { name: 'Resolutions' })

    expect(conversations).toBeChecked()
    expect(resolutions).not.toBeChecked()

    await user.click(resolutions)
    expect(conversations).toBeChecked()
    expect(resolutions).toBeChecked()

    await user.click(conversations)
    expect(conversations).not.toBeChecked()
    expect(resolutions).toBeChecked()
  })

  it('offers select-all and clear actions without leaving the graph empty', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    const metrics = within(view.getByRole('group', { name: 'Metric visibility' }))
    const metricToggles = metrics.getAllByRole('checkbox')

    await user.click(metrics.getByRole('button', { name: 'Select all metrics' }))
    metricToggles.forEach((toggle) => expect(toggle).toBeChecked())

    await user.click(metrics.getByRole('button', { name: 'Clear metrics' }))
    expect(metrics.getByRole('checkbox', { name: 'Conversations' })).toBeChecked()
    expect(metricToggles.filter((toggle) => (toggle as HTMLInputElement).checked)).toHaveLength(1)

    await user.click(metrics.getByRole('checkbox', { name: 'Conversations' }))
    expect(metrics.getByRole('checkbox', { name: 'Conversations' })).toBeChecked()
  })

  it('uses the most recently selected metric as the primary series', async () => {
    const user = userEvent.setup()
    renderScreen()
    const view = within(screen.getByTestId('view-ai-performances'))
    const metrics = within(view.getByRole('group', { name: 'Metric visibility' }))

    expect(view.getByRole('heading', { name: 'Conversations · Widget' })).toBeInTheDocument()

    await user.click(metrics.getByRole('checkbox', { name: 'Resolutions' }))
    expect(view.getByRole('heading', { name: 'Resolutions +1 · Widget' })).toBeInTheDocument()

    await user.click(metrics.getByRole('checkbox', { name: 'Quick feedback' }))
    expect(view.getByRole('heading', { name: 'Quick feedback +2 · Widget' })).toBeInTheDocument()

    await user.click(metrics.getByRole('checkbox', { name: 'Quick feedback' }))
    expect(view.getByRole('heading', { name: 'Resolutions +1 · Widget' })).toBeInTheDocument()
  })
})
