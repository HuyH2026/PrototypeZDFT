import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OUTCOME_METRICS, type OutcomeMetric } from './cockpit-data'
import { OutcomeOverlay } from './OutcomeOverlay'

describe('OutcomeOverlay', () => {
  it('shows the five outcomes and the day-60 measurement window', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)
    const overlay = within(screen.getByTestId('outcome-overlay'))

    expect(overlay.getByRole('heading', { name: 'Targets & floors' })).toBeInTheDocument()
    expect(overlay.getByText('Day 34 of 60')).toBeInTheDocument()
    expect(overlay.getByText('AI resolution rate')).toBeInTheDocument()
    expect(overlay.getByText('Entitlement consumption')).toBeInTheDocument()
    expect(overlay.getByText('Cost avoided')).toBeInTheDocument()
    expect(overlay.getByText('AI-interaction CSAT')).toBeInTheDocument()
    expect(overlay.getByText('Policy compliance rate')).toBeInTheDocument()
  })

  it('presents entitlement consumption as a target with remaining progress', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)

    const entitlement = within(screen.getByTestId('outcome-entitlement-consumption'))
    expect(entitlement.getByText('38.4K')).toBeInTheDocument()
    expect(entitlement.getByText('50K')).toBeInTheDocument()
    expect(entitlement.getByText('11.6K remaining')).toBeInTheDocument()
    expect(
      entitlement.getByRole('progressbar', { name: /Entitlement consumption/i }),
    ).toBeInTheDocument()
  })

  it('presents cost avoided as a currency target with remaining progress', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)

    const costAvoided = within(screen.getByTestId('outcome-cost-avoided'))
    expect(costAvoided.getByText('$312K')).toBeInTheDocument()
    expect(costAvoided.getByText('$450K')).toBeInTheDocument()
    expect(costAvoided.getByText('$138K remaining')).toBeInTheDocument()
    expect(costAvoided.getByRole('progressbar', { name: /Cost avoided/i })).toBeInTheDocument()
  })

  it('opens the editor from a pencil on each editable target card', () => {
    const onEdit = vi.fn()
    render(<OutcomeOverlay onEdit={onEdit} />)

    fireEvent.click(
      within(screen.getByTestId('outcome-entitlement-consumption')).getByRole('button', {
        name: 'Edit Entitlement consumption',
      }),
    )
    expect(onEdit).toHaveBeenCalledTimes(1)

    fireEvent.click(
      within(screen.getByTestId('outcome-cost-avoided')).getByRole('button', {
        name: 'Edit Cost avoided',
      }),
    )
    expect(onEdit).toHaveBeenCalledTimes(2)
  })

  it('offers no edit affordance on cards that cannot be edited', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)

    expect(
      within(screen.getByTestId('outcome-ai-resolution-rate')).queryByRole('button'),
    ).toBeNull()
    expect(
      within(screen.getByTestId('outcome-ai-interaction-csat')).queryByRole('button'),
    ).toBeNull()
    expect(
      within(screen.getByTestId('outcome-policy-compliance-rate')).queryByRole('button'),
    ).toBeNull()
  })

  it('lets AI resolution rate climb toward 100% with no editable target', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)
    const resolution = within(screen.getByTestId('outcome-ai-resolution-rate'))

    expect(resolution.getByText('42.1%')).toBeInTheDocument()
    expect(resolution.queryByText('Target')).not.toBeInTheDocument()
    expect(resolution.getByText(/CSAT floor/)).toBeInTheDocument()
    expect(resolution.getByRole('progressbar', { name: /AI resolution rate/i })).toHaveAttribute(
      'aria-valuemax',
      '100',
    )
  })

  it('treats CSAT as a hard-floor guardrail rather than a growth target', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)
    const overlay = within(screen.getByTestId('outcome-overlay'))
    const csat = within(screen.getByTestId('outcome-ai-interaction-csat'))

    expect(overlay.getAllByText('Target')).toHaveLength(2)
    expect(csat.queryByText('Target')).not.toBeInTheDocument()
    expect(csat.getByText('Hard floor')).toBeInTheDocument()
    expect(csat.getByText('4.17')).toBeInTheDocument()
    expect(csat.getByText('4.21')).toBeInTheDocument()
    expect(csat.getByText('Guardrail holding')).toBeInTheDocument()
    expect(csat.getByTestId('hard-floor-marker')).toBeInTheDocument()
    expect(csat.getByText(/service agreement/)).toBeInTheDocument()
  })

  it('treats policy compliance as a second hard-floor guardrail', () => {
    render(<OutcomeOverlay onEdit={() => {}} />)
    const compliance = within(screen.getByTestId('outcome-policy-compliance-rate'))

    expect(compliance.getByText('Hard floor')).toBeInTheDocument()
    expect(compliance.getByText('99.0%')).toBeInTheDocument()
    expect(compliance.getByText('99.6%')).toBeInTheDocument()
    expect(compliance.getByText('Guardrail holding')).toBeInTheDocument()
    expect(compliance.getByTestId('hard-floor-marker')).toBeInTheDocument()
    expect(compliance.getByText(/service agreement/)).toBeInTheDocument()
  })

  it('can render edited target fixtures supplied by its parent', () => {
    const editedMetrics: OutcomeMetric[] = OUTCOME_METRICS.map((metric) => {
      if (metric.id === 'entitlement-consumption' && metric.target !== undefined) {
        return { ...metric, target: 60_000 }
      }
      return metric
    })

    render(<OutcomeOverlay metrics={editedMetrics} onEdit={() => {}} />)

    expect(
      within(screen.getByTestId('outcome-entitlement-consumption')).getByText('60K'),
    ).toBeInTheDocument()
  })
})
