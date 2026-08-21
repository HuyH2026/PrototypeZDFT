import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MemoryRouter } from 'react-router'
import { ExecutiveDashboard } from './ExecutiveDashboard'
import { DEFAULT_EXECUTIVE_LAYOUT, OUTCOME_SANKEY } from './executive-data'

// The Sankey only draws once its container reports a size, which the global
// no-op stub never does.
class ImmediateResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(element: Element) {
    this.callback(
      [
        {
          target: element,
          contentRect: { width: 900, height: 300 },
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderExecutive(editing = false) {
  const onMove = vi.fn()
  const onRemove = vi.fn()
  render(
    <MemoryRouter>
      <DndProvider backend={HTML5Backend}>
        <ExecutiveDashboard
          layout={[...DEFAULT_EXECUTIVE_LAYOUT]}
          editing={editing}
          onMove={onMove}
          onRemove={onRemove}
        />
      </DndProvider>
    </MemoryRouter>,
  )
  return { onMove, onRemove }
}

describe('ExecutiveDashboard', () => {
  it('renders the Figma executive narrative in decision order', () => {
    renderExecutive()
    const dashboard = within(screen.getByTestId('screen-executive'))

    expect(
      dashboard.getByRole('heading', { name: 'Executive outcome summary' }),
    ).toBeInTheDocument()
    expect(dashboard.getByText('Resolution and cost trend')).toBeInTheDocument()
    expect(dashboard.getByRole('heading', { name: 'Customer outcomes' })).toBeInTheDocument()
    expect(dashboard.getByRole('heading', { name: 'Business value' })).toBeInTheDocument()
    expect(dashboard.getByRole('heading', { name: 'Leadership action' })).toBeInTheDocument()
    expect(dashboard.getAllByText('$23.47M').length).toBeGreaterThan(0)
    expect(
      dashboard.getByText('Customer outcomes are improving while support scales at lower cost.'),
    ).toBeInTheDocument()
    expect(
      dashboard.getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent?.startsWith('Resolution is 93.8%, value created is $23.47M') === true,
      ),
    ).toBeInTheDocument()
    expect(dashboard.getByText('Forecast resolution rate')).toBeInTheDocument()
    expect(dashboard.getByText('Forecast cost per resolution')).toBeInTheDocument()
    expect(dashboard.getByText('Rider recovery rate')).toBeInTheDocument()
    expect(dashboard.getByText('How human and AI costs compare')).toBeInTheDocument()
    expect(dashboard.getByText('Billing escalations increased 18%')).toBeInTheDocument()
    expect(dashboard.getAllByText('Forecast: 84%').length).toBeGreaterThanOrEqual(2)
  })

  it('uses the shared table semantics and an accessible dashboard toolbar', () => {
    renderExecutive()
    const dashboard = within(screen.getByTestId('screen-executive'))

    expect(
      dashboard.getByRole('toolbar', { name: 'Executive dashboard controls' }),
    ).toBeInTheDocument()
    expect(dashboard.getByRole('table', { name: 'AI resolved metrics' })).toBeInTheDocument()
    expect(dashboard.getByRole('table', { name: 'AI to human metrics' })).toBeInTheDocument()
    expect(dashboard.getByRole('table', { name: 'Human only metrics' })).toBeInTheDocument()
    expect(dashboard.getByRole('table', { name: 'Cost model' })).toBeInTheDocument()
    expect(
      dashboard.getByRole('table', { name: 'How human and AI costs compare' }),
    ).toBeInTheDocument()
    expect(dashboard.getByRole('table', { name: 'Top topics' })).toBeInTheDocument()
  })

  it('clicks through all five Top topics insight tables', async () => {
    const user = userEvent.setup()
    renderExecutive()
    const dashboard = within(screen.getByTestId('screen-executive'))
    const topicsCard = dashboard
      .getByRole('table', { name: 'Top topics' })
      .closest<HTMLElement>('[data-slot="card"]')

    expect(topicsCard).not.toBeNull()
    const topics = within(topicsCard!)
    const next = topics.getByRole('button', { name: 'Next topics page' })

    expect(topics.getByText('Topics with the most conversations')).toBeInTheDocument()
    expect(topics.getByText('1 of 5')).toBeInTheDocument()

    await user.click(next)
    expect(topics.getByText('Topics with the highest cost per resolution')).toBeInTheDocument()
    expect(topics.getByRole('columnheader', { name: 'Cost per resolution' })).toBeInTheDocument()
    expect(
      within(topics.getByRole('row', { name: /Order status/ })).getByText('$6.74'),
    ).toBeInTheDocument()

    await user.click(next)
    expect(topics.getByText('Topics with the lowest first-contact resolution')).toBeInTheDocument()
    expect(topics.getByRole('columnheader', { name: 'Avg. interactions' })).toBeInTheDocument()

    await user.click(next)
    expect(topics.getByText('Topics with the lowest SLA achievement')).toBeInTheDocument()
    expect(topics.getByRole('columnheader', { name: 'Avg. SLA achievement' })).toBeInTheDocument()

    await user.click(next)
    expect(topics.getByText('Topics with the lowest CSAT')).toBeInTheDocument()
    expect(topics.getByRole('columnheader', { name: 'CSAT' })).toBeInTheDocument()
    expect(topics.getByText('5 of 5')).toBeInTheDocument()

    await user.click(topics.getByRole('button', { name: 'Previous topics page' }))
    expect(topics.getByText('Topics with the lowest SLA achievement')).toBeInTheDocument()
    expect(topics.getByText('4 of 5')).toBeInTheDocument()
  })

  it('disables Top topics navigation at the first and last insight', async () => {
    const user = userEvent.setup()
    renderExecutive()
    const topicsCard = screen
      .getByRole('table', { name: 'Top topics' })
      .closest<HTMLElement>('[data-slot="card"]')

    expect(topicsCard).not.toBeNull()
    const topics = within(topicsCard!)
    const previous = topics.getByRole('button', { name: 'Previous topics page' })
    const next = topics.getByRole('button', { name: 'Next topics page' })

    expect(previous).toBeDisabled()
    expect(next).toBeEnabled()

    for (let page = 1; page < 5; page += 1) {
      await user.click(next)
    }

    expect(previous).toBeEnabled()
    expect(next).toBeDisabled()
  })

  it('opens and closes the Executive dashboard configuration drawer', async () => {
    const user = userEvent.setup()
    renderExecutive()
    const dashboard = within(screen.getByTestId('screen-executive'))

    await user.click(dashboard.getByRole('button', { name: 'Configuration' }))

    expect(
      dashboard.getByRole('dialog', { name: 'Executive dashboard configuration' }),
    ).toBeInTheDocument()
    expect(dashboard.getByText('Success metrics')).toBeInTheDocument()

    await user.click(dashboard.getByRole('button', { name: 'Close configuration' }))
    expect(
      dashboard.queryByRole('dialog', { name: 'Executive dashboard configuration' }),
    ).not.toBeInTheDocument()
  })

  it('links Manage integrations to the Collections catalogue', async () => {
    const user = userEvent.setup()
    renderExecutive()
    const dashboard = within(screen.getByTestId('screen-executive'))

    await user.click(dashboard.getByRole('button', { name: 'Configuration' }))

    expect(dashboard.getByRole('link', { name: 'Manage integrations' })).toHaveAttribute(
      'href',
      '/settings/integrations?tab=collections',
    )
  })

  // The customer-outcomes flow used to be a hand-drawn SVG with baked-in
  // coordinates. It now goes through the shared `SankeyFlow`, so it must carry
  // the same node/ribbon/pill anatomy as the Insights flow.
  it('draws the customer-outcomes flow with the shared Sankey', () => {
    globalThis.ResizeObserver = ImmediateResizeObserver as unknown as typeof ResizeObserver
    try {
      renderExecutive()
      const dashboard = within(screen.getByTestId('screen-executive'))

      expect(dashboard.getByText('Total conversations')).toBeInTheDocument()
      expect(dashboard.getByText('Outcomes')).toBeInTheDocument()
      expect(dashboard.getByText('Resolved')).toBeInTheDocument()

      const svg = dashboard.getByRole('img', {
        name: /^2\.4 million conversations flow/,
      }) as unknown as SVGSVGElement
      const ribbons = svg.querySelectorAll('[data-sankey-ribbon]')

      expect(ribbons).toHaveLength(OUTCOME_SANKEY.links.length)
      expect(svg.querySelectorAll('[data-sankey-sheen]')).toHaveLength(ribbons.length)
      expect(svg.querySelectorAll('[data-sankey-node]')).toHaveLength(OUTCOME_SANKEY.nodes.length)

      const labels = Array.from(svg.querySelectorAll('[data-sankey-label]'))
      expect(labels).toHaveLength(OUTCOME_SANKEY.nodes.length)
      labels.forEach((label) => {
        expect(label.querySelector('rect')).not.toBeNull() // the colored pill
        expect(label.querySelector('text')?.getAttribute('font-size')).toBe('10')
        expect(label.getAttribute('style')).toContain('--sankey-order')
      })
    } finally {
      globalThis.ResizeObserver = NoopResizeObserver as unknown as typeof ResizeObserver
    }
  })

  it('shows section removal controls only while customizing', async () => {
    const user = userEvent.setup()
    const { onRemove } = renderExecutive(true)
    const buttons = screen.getAllByRole('button', { name: /remove .* executive section/i })
    expect(buttons).toHaveLength(DEFAULT_EXECUTIVE_LAYOUT.length)
    await user.click(buttons[0])
    expect(onRemove).toHaveBeenCalledWith(DEFAULT_EXECUTIVE_LAYOUT[0])
  })
})
