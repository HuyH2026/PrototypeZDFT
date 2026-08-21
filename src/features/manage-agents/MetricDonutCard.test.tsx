import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MessageSquare } from 'lucide-react'
import { formatCount } from './roster-metrics'
import { MetricDonutCard } from './MetricDonutCard'

const SEGMENTS = [
  { label: 'Uber', value: 15520, color: '#2f3130' },
  { label: 'Uber Eats', value: 10322, color: '#5c605c' },
]

describe('MetricDonutCard', () => {
  it('renders the centre total and one legend row per segment', () => {
    render(
      <MetricDonutCard
        title="Conversations"
        Icon={MessageSquare}
        mode="stacked"
        centerLabel="34,744"
        segments={SEGMENTS}
        totalLabel="Total • 34,744"
        formatValue={formatCount}
        emptyTitle="No conversations yet"
        emptyBody="Data will appear once your agent starts having conversations."
        testId="metric-conversations"
      />,
    )
    const card = screen.getByTestId('metric-conversations')
    expect(within(card).getByText('Conversations')).toBeInTheDocument()
    expect(within(card).getByTestId('metric-center')).toHaveTextContent('34,744')
    expect(within(card).getByText('Total • 34,744')).toBeInTheDocument()
    expect(within(card).getByText('Uber Eats')).toBeInTheDocument()
    expect(within(card).getByText('10,322')).toBeInTheDocument()
    expect(within(card).getAllByTestId('metric-arc')).toHaveLength(2)
  })

  it('draws a single arc and no legend total in single mode', () => {
    render(
      <MetricDonutCard
        title="Automated resolutions (AR)"
        Icon={MessageSquare}
        mode="single"
        centerLabel="84%"
        value={84}
        singleColor="#0f8a5f"
        segments={[{ label: 'Uber', value: 82, color: '#0f8a5f' }]}
        formatValue={(value) => `${value}%`}
        emptyTitle="No data yet"
        emptyBody="Resolution data will appear after your agent has conversations."
        testId="metric-ar"
      />,
    )
    const card = screen.getByTestId('metric-ar')
    expect(within(card).getByTestId('metric-center')).toHaveTextContent('84%')
    expect(within(card).getAllByTestId('metric-arc')).toHaveLength(1)
    expect(within(card).getByText('82%')).toBeInTheDocument()
    expect(within(card).queryByText(/^Total/)).not.toBeInTheDocument()
  })

  it('shows the empty copy and no legend when there is no data', () => {
    render(
      <MetricDonutCard
        title="Escalations"
        Icon={MessageSquare}
        mode="single"
        centerLabel={null}
        segments={[]}
        formatValue={(value) => `${value}%`}
        emptyTitle="No data yet"
        emptyBody="Escalation data will appear when conversations are handed off."
        testId="metric-escalations"
      />,
    )
    const card = screen.getByTestId('metric-escalations')
    expect(within(card).getByText('No data yet')).toBeInTheDocument()
    expect(
      within(card).getByText('Escalation data will appear when conversations are handed off.'),
    ).toBeInTheDocument()
    expect(within(card).getByTestId('metric-center')).toHaveTextContent('—')
    expect(within(card).queryAllByTestId('metric-arc')).toHaveLength(0)
  })
})
