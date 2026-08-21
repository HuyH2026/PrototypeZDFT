import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanAccordion } from './PlanAccordion'

function renderRow(props: Partial<Parameters<typeof PlanAccordion>[0]> = {}) {
  return render(
    <PlanAccordion
      title="Agent health evaluation"
      icon={<span data-testid="glyph" />}
      chip="critical"
      expanded={false}
      onToggle={() => {}}
      {...props}
    >
      <p>body content</p>
    </PlanAccordion>,
  )
}

describe('PlanAccordion', () => {
  it('renders a collapsed row with its glyph and chip, and no body', () => {
    renderRow()
    const row = screen.getByTestId('plan-section-Agent health evaluation')
    expect(within(row).getByRole('button', { expanded: false })).toBeInTheDocument()
    expect(within(row).getByTestId('glyph')).toBeInTheDocument()
    expect(within(row).getByText('Critical')).toBeInTheDocument()
    expect(screen.queryByText('body content')).not.toBeInTheDocument()
  })

  // The frames put a chip only on collapsed rows: expanded, the section's own
  // heading names it.
  it('hides the chip and shows the body when expanded', () => {
    renderRow({ expanded: true })
    expect(screen.queryByText('Critical')).not.toBeInTheDocument()
    expect(screen.getByText('body content')).toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
  })

  it('renders no chip when given none', () => {
    renderRow({ chip: null })
    expect(screen.queryByText('Critical')).not.toBeInTheDocument()
  })

  it('reports a click to its owner', async () => {
    const onToggle = vi.fn()
    renderRow({ onToggle })
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('accepts a test id override', () => {
    renderRow({ testId: 'improvement-section-health' })
    expect(screen.getByTestId('improvement-section-health')).toBeInTheDocument()
  })
})
