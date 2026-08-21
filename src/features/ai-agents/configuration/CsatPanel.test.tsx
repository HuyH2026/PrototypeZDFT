import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CsatPanel } from './CsatPanel'
import { seedCsat, WIDGET_RAIL_SECTIONS, WIDGET_RAIL_TRAILING_START } from './config-data'

function setup(overrides = {}) {
  const props = {
    csat: seedCsat(),
    sections: WIDGET_RAIL_SECTIONS,
    trailingStart: WIDGET_RAIL_TRAILING_START,
    activeSection: 'mood',
    onSectionChange: vi.fn(),
    onCsatChange: vi.fn(),
    ...overrides,
  }
  render(<CsatPanel {...props} />)
  return props
}

describe('CsatPanel', () => {
  it('leads with the CSAT tab selected and the on/off toggle', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'CSAT' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Quick Feedback' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('switch', { name: 'CSAT is on' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('lists the four availability rows, with the Policy one locked', () => {
    setup()
    expect(
      screen.getByLabelText(/Anytime the user accesses it via the widget header/),
    ).toBeChecked()
    expect(screen.getByLabelText(/When the live chat ends/)).toBeChecked()
    const policy = screen.getByLabelText(/When CSAT Trigger is applied in the Policy/)
    expect(policy).toBeChecked()
    expect(policy).toBeDisabled()
  })

  it('reports the rating question as it is edited', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Rating question'), '?')
    expect(props.onCsatChange).toHaveBeenCalledWith({
      question: `${seedCsat().question}?`,
    })
  })

  it('marks the seeded scale style as pressed and reports a different pick', async () => {
    const props = setup()
    expect(screen.getByRole('button', { name: /Stars/ })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: /Hearts/ }))
    expect(props.onCsatChange).toHaveBeenCalledWith({ style: 'hearts' })
  })

  it('renders one editable label per rating step, and reports an edit', async () => {
    const props = setup()
    expect(screen.getByDisplayValue('Terrible')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Excellent')).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Rating 3 label'))
    const [patch] = props.onCsatChange.mock.calls.at(-1)!
    expect(patch.steps.find((s: { value: number }) => s.value === 3).label).toBe('')
  })

  it('badges each rating with its sentiment', () => {
    setup()
    expect(screen.getAllByText('Negative')).toHaveLength(2)
    expect(screen.getByText('Neutral')).toBeInTheDocument()
    expect(screen.getAllByText('Positive')).toHaveLength(2)
  })

  it('shows a coming-soon body on the Quick Feedback tab', async () => {
    setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Quick Feedback' }))
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
    expect(screen.queryByLabelText('Rating question')).not.toBeInTheDocument()
  })
})
