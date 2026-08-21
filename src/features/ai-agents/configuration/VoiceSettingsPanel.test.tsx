import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceSettingsPanel } from './VoiceSettingsPanel'
import {
  VOICE_RAIL_SECTIONS,
  VOICE_RAIL_TRAILING_START,
  VOICE_SEED_SEGMENTS,
  seedVoiceSettings,
} from './config-data'

const seed = VOICE_SEED_SEGMENTS[0].voice.settings

function setup(overrides = {}) {
  const props = {
    settings: seed,
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'voice',
    onSectionChange: vi.fn(),
    onSettingsChange: vi.fn(),
    ...overrides,
  }
  render(<VoiceSettingsPanel {...props} />)
  return props
}

describe('VoiceSettingsPanel', () => {
  it('leads with the Voice / Sounds tabs, Voice selected', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'Voice' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Sounds' })).toHaveAttribute('aria-selected', 'false')
  })

  it('renders every section of the Voice tab', () => {
    setup()
    expect(screen.getByText('Inbound call greeting')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Inbound call greeting'),
    ).toHaveValue('Hello, thanks for calling Uber Support. How can I help you today?')
    expect(screen.getByText('Select default language')).toBeInTheDocument()
    expect(
      screen.getByText('The default language applies to greeting messages for all calls.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Select default language')).toHaveValue('English')
    expect(screen.getByRole('switch', { name: 'Auto language switching is off' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByText('Voice speed')).toBeInTheDocument()
    expect(screen.getByText('Slowest')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(screen.getByText('Fastest')).toBeInTheDocument()
  })

  it('reports greeting edits', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Inbound call greeting'), '!')
    expect(props.onSettingsChange).toHaveBeenCalledWith({
      greeting: 'Hello, thanks for calling Uber Support. How can I help you today?!',
    })
  })

  it('reports the picked default language', async () => {
    const props = setup()
    await userEvent.selectOptions(screen.getByLabelText('Select default language'), 'Spanish')
    expect(props.onSettingsChange).toHaveBeenCalledWith({ defaultLanguage: 'Spanish' })
  })

  it('reports the auto language switching toggle', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('switch', { name: 'Auto language switching is off' }))
    expect(props.onSettingsChange).toHaveBeenCalledWith({ autoLanguageSwitching: true })
  })

  it('lists the voices with the seed voice selected', () => {
    setup()
    const sarah = screen.getByRole('button', { name: /Sarah Curious/ })
    expect(sarah).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Tim/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports picking a different voice', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: /Tim/ }))
    expect(props.onSettingsChange).toHaveBeenCalledWith({ voiceId: 'tim' })
  })

  it('filters the voice list from the search box', () => {
    setup({ settings: seedVoiceSettings({ voiceQuery: 'sarah' }) })
    expect(screen.getByRole('button', { name: /Sarah Curious/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Tim/ })).not.toBeInTheDocument()
  })

  it('reports search edits', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Search'), 't')
    expect(props.onSettingsChange).toHaveBeenCalledWith({ voiceQuery: 't' })
  })

  it('reports speed changes from the slider', () => {
    const props = setup()
    fireEvent.change(screen.getByLabelText('Voice speed'), { target: { value: '80' } })
    expect(props.onSettingsChange).toHaveBeenCalledWith({ voiceSpeed: 80 })
  })

  it('shows the wait-time sound picker on the Sounds tab instead of the voice form', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Sounds' }))
    expect(screen.queryByText('Inbound call greeting')).not.toBeInTheDocument()
    expect(
      screen.getByRole('switch', { name: 'Wait time sound effect is on' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Sound effect')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Typewriter/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    // Picking the other effect reports it on the settings.
    await userEvent.click(screen.getByRole('button', { name: /Chime/ }))
    expect(props.onSettingsChange).toHaveBeenCalledWith({ soundEffect: 'chime' })
    // And the toggle reports its flip.
    await userEvent.click(screen.getByRole('switch', { name: 'Wait time sound effect is on' }))
    expect(props.onSettingsChange).toHaveBeenCalledWith({ soundOn: false })
  })

  it('swaps the picker for the multilingual table when auto switching is on', () => {
    setup({ settings: seedVoiceSettings({ autoLanguageSwitching: true }) })
    // The catalog is gone; the enabled-languages table takes its place.
    expect(screen.queryByLabelText('Search')).not.toBeInTheDocument()
    expect(screen.getByText('Enabled languages')).toBeInTheDocument()
    // `selector` keeps the language <option>s of the default-language select
    // out of the match.
    expect(screen.getByText('English (default)', { selector: 'li span' })).toBeInTheDocument()
    expect(screen.getByText('German', { selector: 'li span' })).toBeInTheDocument()
    expect(screen.getByText('Korean', { selector: 'li span' })).toBeInTheDocument()
    expect(screen.getByText('Camille', { selector: 'li span' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Auto language switching is on' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('opens the multilingual modal from the ON variant and saves languages', async () => {
    const props = setup({ settings: seedVoiceSettings({ autoLanguageSwitching: true }) })
    // The heading link and the stretched button both open the modal and share
    // the frame's "Multilingual settings" label — click whichever comes first.
    await userEvent.click(screen.getAllByRole('button', { name: 'Multilingual settings' })[0])
    const dialog = screen.getByRole('dialog', { name: 'Multilingual settings' })
    expect(within(dialog).getByText('English (default)')).toBeInTheDocument()
    // Remove German, then save — the panel gets the trimmed list.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Remove German' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    expect(props.onSettingsChange).toHaveBeenCalledWith({
      languages: expect.arrayContaining([
        expect.objectContaining({ id: 'english' }),
        expect.objectContaining({ id: 'korean' }),
      ]),
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the voice rail with the microphone section active', () => {
    setup()
    // The rail item is a button named "Voice"; the panel's tab is a tab.
    expect(screen.getByRole('button', { name: 'Voice' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: 'Embed' })).not.toBeInTheDocument()
  })
})
