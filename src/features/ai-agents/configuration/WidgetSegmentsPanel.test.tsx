import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WidgetSegmentsPanel } from './WidgetSegmentsPanel'
import { SEED_SEGMENTS, WIDGET_RAIL_SECTIONS, WIDGET_RAIL_TRAILING_START } from './config-data'

const riders = SEED_SEGMENTS[0]

function setup(overrides = {}) {
  const props = {
    segment: riders,
    sections: WIDGET_RAIL_SECTIONS,
    trailingStart: WIDGET_RAIL_TRAILING_START,
    activeSection: 'segments',
    onSectionChange: vi.fn(),
    onNameChange: vi.fn(),
    onToggleEnabled: vi.fn(),
    onToggleDefault: vi.fn(),
    ...overrides,
  }
  render(<WidgetSegmentsPanel {...props} />)
  return props
}

describe('WidgetSegmentsPanel', () => {
  it('renders the heading, the segment-name field, and the tag chips', () => {
    setup()
    expect(screen.getByText('Widget segment')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Riders')).toBeInTheDocument()
    expect(screen.getByText('rider_app')).toBeInTheDocument()
  })

  it('uses the design’s segment wording, not brand', () => {
    setup()
    expect(screen.getByText('Segment name')).toBeInTheDocument()
    expect(screen.getByText(/Widget is visible to users in this segment/)).toBeInTheDocument()
    expect(screen.queryByText(/brand/i)).not.toBeInTheDocument()
  })

  it('exposes the enabled toggle via role=switch reflecting segment.enabled', () => {
    setup()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('On')).toBeInTheDocument()
  })

  it('fires onToggleEnabled when the switch is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('switch'))
    expect(props.onToggleEnabled).toHaveBeenCalledOnce()
  })

  it('fires onNameChange when the segment name input changes', async () => {
    const props = setup()
    await userEvent.type(screen.getByDisplayValue('Riders'), '!')
    expect(props.onNameChange).toHaveBeenCalled()
  })

  it('shows the "Assign tags" placeholder for a segment with no tags', () => {
    setup({ segment: { ...SEED_SEGMENTS[2], tags: [] } })
    expect(screen.getByText('Assign tags')).toBeInTheDocument()
  })

  it('fires onSectionChange when a rail icon is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Links' }))
    expect(props.onSectionChange).toHaveBeenCalledWith('links')
  })
})
