import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceApiPanel } from './VoiceApiPanel'
import { VOICE_RAIL_SECTIONS, VOICE_RAIL_TRAILING_START } from './config-data'

function setup() {
  const props = {
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'api',
    onSectionChange: vi.fn(),
  }
  render(<VoiceApiPanel {...props} />)
  return props
}

describe('VoiceApiPanel', () => {
  it('renders the masked API key and the seeded context variables', () => {
    setup()
    expect(screen.getByText('API key')).toBeInTheDocument()
    expect(screen.getByText('**************')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh API key' })).toBeInTheDocument()
    expect(screen.getByText('Context Variable')).toBeInTheDocument()
    expect(screen.getByText('$name')).toBeInTheDocument()
    expect(screen.getByText('$phone')).toBeInTheDocument()
  })

  it('reveals and re-hides the key from the eye button', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Reveal API key' }))
    expect(screen.getByText('ft_voice_9f4k-83aa-29ce-51df')).toBeInTheDocument()
    expect(screen.queryByText('**************')).not.toBeInTheDocument()
  })

  it('removes a context variable and adds from the pool', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Remove $phone' }))
    expect(screen.queryByText('$phone')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add context variable' }))
    expect(screen.getByText('$email')).toBeInTheDocument()
  })
})
