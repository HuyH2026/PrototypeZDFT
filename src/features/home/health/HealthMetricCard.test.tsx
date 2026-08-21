import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { HealthMetric } from '../dashboard-data'
import { HealthMetricCard } from './HealthMetricCard'

const res: HealthMetric = {
  key: 'res',
  label: 'Resolution rate',
  value: '82%',
  delta: '4.2%',
  up: true,
  goodWhenUp: true,
  byChannel: [
    { key: 'widget', value: '82%' },
    { key: 'voice', value: '76%' },
    { key: 'webcall', value: '87%' },
    { key: 'headless', value: '79%' },
  ],
}

const esc: HealthMetric = {
  ...res,
  key: 'esc',
  label: 'Escalations',
  value: '7%',
  delta: '5.8%',
  up: false,
  goodWhenUp: false,
}

const csat: HealthMetric = {
  ...res,
  key: 'csat',
  label: 'CSAT',
  value: '4.6',
  delta: '1.2%',
  up: false,
  goodWhenUp: true,
  accentColor: '#048c80',
}

describe('HealthMetricCard', () => {
  it('renders the label and value', () => {
    render(<HealthMetricCard metric={res} showBreakdown />)
    expect(screen.getByText('Resolution rate')).toBeInTheDocument()
    expect(screen.getByTestId('metric-value')).toHaveTextContent('82%')
  })

  it('lists every channel with its value when the breakdown is on', () => {
    render(<HealthMetricCard metric={res} showBreakdown />)
    const rows = within(screen.getByTestId('metric-breakdown'))
    for (const label of ['Widget', 'Voice', 'Web Call', 'Headless']) {
      expect(rows.getByText(label)).toBeInTheDocument()
    }
    expect(rows.getByText('76%')).toBeInTheDocument()
  })

  it('omits the breakdown entirely when it is off', () => {
    render(<HealthMetricCard metric={res} showBreakdown={false} />)
    expect(screen.queryByTestId('metric-breakdown')).not.toBeInTheDocument()
    expect(screen.queryByText('Web Call')).not.toBeInTheDocument()
  })

  it('keeps the headline and delta together in compact anatomy', () => {
    const { container } = render(<HealthMetricCard metric={res} showBreakdown={false} />)
    const card = container.querySelector('[data-slot="health-metric"]')
    const summary = container.querySelector('[data-slot="health-metric-summary"]')

    expect(card).toHaveAttribute('data-layout', 'compact')
    expect(summary).not.toBeNull()
    expect(within(summary as HTMLElement).getByTestId('metric-value')).toHaveTextContent('82%')
    expect(within(summary as HTMLElement).getByTestId('metric-delta')).toHaveTextContent('4.2%')
    expect(screen.queryByTestId('metric-breakdown')).not.toBeInTheDocument()
  })

  it('reads a falling escalation rate as good', () => {
    render(<HealthMetricCard metric={esc} showBreakdown />)
    const pill = screen.getByTestId('metric-delta')
    expect(pill).toHaveTextContent('5.8%')
    expect(pill).toHaveTextContent('down')
    expect(pill).toHaveStyle({ color: '#048c80', backgroundColor: '#e6f4f2' })
    expect(within(pill).getByTestId('trend-down')).toBeInTheDocument()
  })

  it('reads a falling CSAT as bad', () => {
    render(<HealthMetricCard metric={csat} showBreakdown />)
    const pill = screen.getByTestId('metric-delta')
    expect(pill).toHaveTextContent('1.2%')
    expect(pill).toHaveStyle({ color: '#e53112', backgroundColor: '#fceae7' })
    expect(within(pill).getByTestId('trend-down')).toBeInTheDocument()
  })

  it('points the arrow up on a rising metric', () => {
    render(<HealthMetricCard metric={res} showBreakdown />)
    expect(within(screen.getByTestId('metric-delta')).getByTestId('trend-up')).toBeInTheDocument()
  })

  it('tints the value with the metric accent when one is set', () => {
    render(<HealthMetricCard metric={csat} showBreakdown />)
    expect(screen.getByTestId('metric-value')).toHaveStyle({ color: '#048c80' })
  })

  it('falls back to ink when no accent is set', () => {
    render(<HealthMetricCard metric={res} showBreakdown />)
    expect(screen.getByTestId('metric-value')).toHaveStyle({ color: '#313131' })
  })
})
