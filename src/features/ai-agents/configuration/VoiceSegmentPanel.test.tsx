import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceSegmentPanel } from './VoiceSegmentPanel'
import { VOICE_RAIL_SECTIONS, VOICE_RAIL_TRAILING_START, VOICE_SEED_SEGMENTS } from './config-data'

const riders = VOICE_SEED_SEGMENTS[0]

function setup(overrides = {}) {
  const props = {
    segment: riders,
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'segments',
    onSectionChange: vi.fn(),
    onNameChange: vi.fn(),
    onToggleEnabled: vi.fn(),
    onToggleDefault: vi.fn(),
    onVoiceChange: vi.fn(),
    ...overrides,
  }
  render(<VoiceSegmentPanel {...props} />)
  return props
}

describe('VoiceSegmentPanel', () => {
  it('renders the heading and every field group', () => {
    setup()
    expect(screen.getByText('Voice segment')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /Voice is enabled/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('Segment name')).toBeInTheDocument()
    expect(screen.getByText(/Assign phone numbers to this segment/)).toBeInTheDocument()
    expect(screen.getByText('Company name')).toBeInTheDocument()
    expect(screen.getByText('Voice agent name')).toBeInTheDocument()
    expect(screen.getByText('Default handoff number')).toBeInTheDocument()
    expect(
      screen.getByText('Where calls go when the voice agent hands off to a human.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Select initial use case for Inbound calls')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Set as default' })).toBeChecked()
    expect(
      screen.getByText(
        'Enable this segment by default if no specific tags are assigned or found in voice agents.',
      ),
    ).toBeInTheDocument()
    // The same spelling the segment list and the preview header use — not a
    // singularised variant of it (see VOICE_SEED_SEGMENTS).
    expect(screen.getByLabelText('Segment name')).toHaveValue('Riders English')
  })

  it('lists the segment’s phone numbers', () => {
    setup()
    expect(screen.getByText('+1 333-123-4567')).toBeInTheDocument()
    expect(screen.getByText('+1 888-888-56071')).toBeInTheDocument()
  })

  it('drops a number when its remove button is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Remove +1 333-123-4567' }))
    expect(props.onVoiceChange).toHaveBeenCalledWith({ phoneNumbers: ['+1 888-888-56071'] })
  })

  it('reports changes to the segment-level voice toggle', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('switch', { name: /Voice is enabled/ }))
    expect(props.onToggleEnabled).toHaveBeenCalledOnce()
  })

  it('reports company-name edits on the voice config, not the segment name', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Company name'), '!')
    expect(props.onVoiceChange).toHaveBeenCalledWith({ companyName: 'Uber!' })
    expect(props.onNameChange).not.toHaveBeenCalled()
  })

  it('reports the initial use case picked for inbound calls', async () => {
    const props = setup()
    await userEvent.selectOptions(
      screen.getByLabelText('Select initial use case for Inbound calls'),
      'Refund request',
    )
    expect(props.onVoiceChange).toHaveBeenCalledWith({ initialIntent: 'Refund request' })
  })

  it('reports toggles of the segment-level default checkbox', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Set as default' }))
    expect(props.onToggleDefault).toHaveBeenCalledOnce()
  })

  it('renders the voice rail, not the widget one', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Voice' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Embed' })).not.toBeInTheDocument()
  })
})
