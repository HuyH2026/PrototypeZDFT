import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceCsatPanel } from './VoiceCsatPanel'
import {
  VOICE_RAIL_SECTIONS,
  VOICE_RAIL_TRAILING_START,
  VOICE_SEED_SEGMENTS,
  VOICE_SMS_MESSAGE,
} from './config-data'

const seed = VOICE_SEED_SEGMENTS[0].voice.csat

function setup(overrides = {}) {
  const props = {
    csat: seed,
    tab: 'csat' as const,
    onTabChange: vi.fn(),
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'mood',
    onSectionChange: vi.fn(),
    onCsatChange: vi.fn(),
    ...overrides,
  }
  render(<VoiceCsatPanel {...props} />)
  return props
}

describe('VoiceCsatPanel', () => {
  it('renders the survey fields on the CSAT survey tab', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'CSAT survey' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Header logo')).toBeInTheDocument()
    expect(screen.getByLabelText('Theme color')).toHaveValue('#000000')
    expect(screen.getByLabelText('Rating question')).toHaveValue(
      'How would you rate your experience today?',
    )
    expect(screen.getByRole('button', { name: 'Stars' })).toHaveAttribute('aria-pressed', 'true')
    // The 1–5 scale rows with their sentiment badges.
    expect(screen.getByLabelText('Rating 1 label')).toHaveValue('Terrible')
    expect(screen.getByLabelText('Rating 5 label')).toHaveValue('Excellent')
    // Negative badges: two scale rows, one chip under the low-ratings
    // checkbox, one chip beside the question label.
    expect(screen.getAllByText('Negative')).toHaveLength(4)
    // Reasons for rating (frame 132:81756).
    expect(screen.getByText('Reasons for rating')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Request feedback for low ratings (1-3)' }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Request feedback for high ratings (4-5)' }),
    ).toBeChecked()
    expect(screen.getByLabelText('Question for low ratings')).toHaveValue(
      "We're sorry to hear that. Could you share what didn't go well?",
    )
    expect(screen.getByLabelText('Reason option 1')).toHaveValue('Took too long')
    expect(screen.getByLabelText('Reason option 4')).toHaveValue('Unfriendly')
    // Resolution confirmation, additional feedback, confirmation message.
    expect(screen.getByText('Resolution confirmation')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Request to confirm the resolution of the issue' }),
    ).toBeChecked()
    expect(screen.getByLabelText('Question to confirm')).toHaveValue(
      'Has your reported issue been resolved today?',
    )
    expect(screen.getByLabelText('Resolution option 1')).toHaveValue('Yes')
    expect(screen.getByLabelText('Resolution option 2')).toHaveValue('No, not really')
    expect(
      screen.getByRole('checkbox', { name: 'Request open-ended feedback in free-form text' }),
    ).not.toBeChecked()
    expect(screen.getByLabelText('Confirmation message')).toHaveValue(
      'We value and thank you for your feedback.',
    )
  })

  it('reports the resolution and feedback checkboxes', async () => {
    const props = setup()
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Request to confirm the resolution of the issue' }),
    )
    expect(props.onCsatChange).toHaveBeenCalledWith({ resolution: false })
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Request open-ended feedback in free-form text' }),
    )
    expect(props.onCsatChange).toHaveBeenCalledWith({ openFeedback: true })
  })

  it('reports a style pick and a scale-label edit', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Smiles' }))
    expect(props.onCsatChange).toHaveBeenCalledWith({ style: 'smiles' })
    await userEvent.type(screen.getByLabelText('Rating 3 label'), '!')
    expect(props.onCsatChange).toHaveBeenCalledWith({
      steps: expect.arrayContaining([expect.objectContaining({ value: 3, label: 'Okay!' })]),
    })
  })

  it('reports removing and adding a selectable reason', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Remove Unfriendly' }))
    expect(props.onCsatChange).toHaveBeenCalledWith({
      followUpOptions: ['Took too long', 'The info was hard to understand', 'Unhelpful response'],
    })
    await userEvent.click(screen.getByRole('button', { name: '+ Add option' }))
    expect(props.onCsatChange).toHaveBeenCalledWith({
      followUpOptions: [...seed.followUpOptions, ''],
    })
  })

  it('reports tab clicks and shows the SMS form on the SMS Message tab', async () => {
    const props = setup()
    // Clicking a tab bubbles up — the view owns the tab so the preview can
    // swap with it.
    await userEvent.click(screen.getByRole('tab', { name: 'SMS Message' }))
    expect(props.onTabChange).toHaveBeenCalledWith('sms')
  })

  it('shows the SMS form on the SMS Message tab', async () => {
    const props = setup({ tab: 'sms' })
    expect(screen.queryByText('Header logo')).not.toBeInTheDocument()
    expect(
      screen.getByRole('switch', { name: 'CSAT is on for inbound calls' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(
      screen.getByRole('checkbox', { name: 'Send after non-resolved conversations' }),
    ).not.toBeChecked()
    expect(screen.getByLabelText('SMS message')).toHaveValue(VOICE_SMS_MESSAGE)
    await userEvent.click(screen.getByRole('switch', { name: 'CSAT is on for inbound calls' }))
    expect(props.onCsatChange).toHaveBeenCalledWith({ on: false })
  })
})
