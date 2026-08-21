import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoicePrivacyPanel } from './VoicePrivacyPanel'
import {
  VOICE_RAIL_SECTIONS,
  VOICE_RAIL_TRAILING_START,
  VOICE_SEED_SEGMENTS,
  VOICE_DISCLAIMER_TEXT,
} from './config-data'

const seed = VOICE_SEED_SEGMENTS[0].voice.privacy

function setup(overrides = {}) {
  const props = {
    privacy: seed,
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'license',
    onSectionChange: vi.fn(),
    onPrivacyChange: vi.fn(),
    ...overrides,
  }
  render(<VoicePrivacyPanel {...props} />)
  return props
}

describe('VoicePrivacyPanel', () => {
  it('renders the recording toggle, disclaimer controls, and direction tiles', () => {
    setup()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(
      screen.getByRole('switch', { name: 'Enable automatic recording of all calls' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(
      screen.getByRole('checkbox', { name: 'Play disclaimer message before call connection' }),
    ).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Inbound calls' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Outbound calls' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByLabelText('Disclaimer message')).toHaveValue(VOICE_DISCLAIMER_TEXT)
  })

  it('reports recording and disclaimer toggles', async () => {
    const props = setup()
    await userEvent.click(
      screen.getByRole('switch', { name: 'Enable automatic recording of all calls' }),
    )
    expect(props.onPrivacyChange).toHaveBeenCalledWith({ recording: false })
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Play disclaimer message before call connection' }),
    )
    expect(props.onPrivacyChange).toHaveBeenCalledWith({ playDisclaimer: true })
  })

  it('reports the selected call direction', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Outbound calls' }))
    expect(props.onPrivacyChange).toHaveBeenCalledWith({ side: 'outbound' })
  })
})
