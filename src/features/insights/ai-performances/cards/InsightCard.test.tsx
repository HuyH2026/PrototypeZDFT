import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InsightCard } from './InsightCard'
import type { DonutCardData, RankedBarCard, StackedBarCard } from './card-types'

const DONUT: DonutCardData = {
  kind: 'donut',
  title: 'Click rate',
  center: '8%',
  centerLabel: 'click rate',
  total: { count: '94,130', label: 'surfaced' },
  slices: [
    { name: 'clicked', count: '7,530', value: 7530, color: '#2F69C7' },
    { name: 'not clicked', count: '86,600', value: 86600, color: '#7fb3e8' },
  ],
}

const STACKED: StackedBarCard = {
  kind: 'stacked',
  title: 'Conversations with Topics',
  value: '45,000',
  segments: [
    { label: 'Resolved', count: '36,000', pct: '80%', color: '#2F99B3' },
    { label: 'Not resolved', count: '9,000', pct: '20%', color: '#b9bec7' },
  ],
}

const RANKED: RankedBarCard = {
  kind: 'ranked',
  title: 'CSAT',
  total: '3.5',
  totalLabel: 'avg score',
  secondaryLabel: 'Total responses',
  secondaryValue: '2,928',
  color: '#109081',
  rows: [{ label: '5-Excellent', value: 424, count: '424' }],
}

describe('InsightCard', () => {
  it('leads a donut legend with an undotted total when one is supplied', () => {
    render(<InsightCard card={DONUT} />)
    const total = screen.getByTestId('donut-total')
    expect(within(total).getByText('94,130')).toBeInTheDocument()
    expect(within(total).getByText('surfaced')).toBeInTheDocument()
    // The total is the one legend row with no color swatch — it is a sum, not a slice.
    expect(total.querySelectorAll('[data-slot="legend-swatch"]')).toHaveLength(0)
  })

  it('omits the total row for a donut that carries none', () => {
    const { total: _total, ...withoutTotal } = DONUT
    render(<InsightCard card={withoutTotal} />)
    expect(screen.queryByTestId('donut-total')).not.toBeInTheDocument()
    expect(screen.getByText('7,530')).toBeInTheDocument()
  })

  it('renders a stacked card and a ranked card by kind', () => {
    const { unmount } = render(<InsightCard card={STACKED} />)
    expect(screen.getByRole('heading', { name: 'Conversations with Topics' })).toBeInTheDocument()
    expect(screen.getByText('45,000')).toBeInTheDocument()
    unmount()

    render(<InsightCard card={RANKED} />)
    expect(screen.getByRole('heading', { name: 'CSAT' })).toBeInTheDocument()
    expect(screen.getByText('avg score')).toBeInTheDocument()
    expect(screen.getByText('2,928')).toBeInTheDocument()
  })
})
