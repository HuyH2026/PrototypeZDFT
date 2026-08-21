import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiPersonalityPanel } from './AiPersonalityPanel'
import {
  emptyPersonality,
  VOICE_RAIL_SECTIONS,
  WIDGET_RAIL_SECTIONS,
  WIDGET_RAIL_TRAILING_START,
} from './config-data'

function setup(overrides = {}) {
  const props = {
    personality: emptyPersonality(),
    sections: WIDGET_RAIL_SECTIONS,
    trailingStart: WIDGET_RAIL_TRAILING_START,
    activeSection: 'sentiment',
    onSectionChange: vi.fn(),
    onPersonalityChange: vi.fn(),
    ...overrides,
  }
  render(<AiPersonalityPanel {...props} />)
  return props
}

describe('AiPersonalityPanel', () => {
  it('renders the heading and the three section labels', () => {
    setup()
    expect(screen.getByText('AI Personality')).toBeInTheDocument()
    expect(screen.getByText('General Context')).toBeInTheDocument()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
    expect(screen.getByText('Tone of Voice')).toBeInTheDocument()
    expect(screen.getByText(/Define your agent’s voice and behavior/)).toBeInTheDocument()
  })

  it('starts with freeform tone enabled and suggestions off', () => {
    setup()
    expect(screen.getByRole('checkbox', { name: 'Describe with your own words' })).toBeChecked()
    expect(screen.getByLabelText('Tone of Voice')).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Select suggestions' })).not.toBeChecked()
  })

  it('fires onPersonalityChange when General Context is typed into', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('General Context'), 'x')
    expect(props.onPersonalityChange).toHaveBeenCalledWith({ generalContext: 'x' })
  })

  it('toggles a tone preset chip on click', async () => {
    const props = setup({ personality: { ...emptyPersonality(), toneUsePresets: true } })
    await userEvent.click(screen.getByRole('button', { name: 'Empathetic' }))
    expect(props.onPersonalityChange).toHaveBeenCalledWith({ tonePresets: ['Empathetic'] })
  })

  it('removes an already-selected preset chip on click', async () => {
    const props = setup({
      personality: { ...emptyPersonality(), toneUsePresets: true, tonePresets: ['Empathetic'] },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Empathetic' }))
    expect(props.onPersonalityChange).toHaveBeenCalledWith({ tonePresets: [] })
  })

  it('forwards rail section clicks', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Segments' }))
    expect(props.onSectionChange).toHaveBeenCalledWith('segments')
  })

  it('disables the preset chips and freeform textarea when their toggles are off', async () => {
    const props = setup({
      personality: { ...emptyPersonality(), toneUseFreeform: false, toneUsePresets: false },
    })
    const chip = screen.getByRole('button', { name: 'Empathetic' })
    expect(chip).toBeDisabled()
    expect(screen.getByLabelText('Tone of Voice')).toBeDisabled()
    await userEvent.click(chip)
    expect(props.onPersonalityChange).not.toHaveBeenCalled()
  })

  it('has no on/off toggle on the widget channel', () => {
    setup()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
})

describe('AiPersonalityPanel — voice channel', () => {
  it('uses the calls-oriented intro without a separate on/off toggle', () => {
    setup({
      channel: 'voice',
      sections: VOICE_RAIL_SECTIONS,
      trailingStart: 'install',
    })
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(screen.getByText(/Define how your agent behaves and speaks/)).toBeInTheDocument()
    expect(screen.getByText(/inbound and outbound calls/)).toBeInTheDocument()
  })
})
