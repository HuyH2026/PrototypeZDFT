import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VoiceFallbackPanel } from './VoiceFallbackPanel'
import { VOICE_RAIL_SECTIONS, VOICE_RAIL_TRAILING_START } from './config-data'

function setup() {
  const props = {
    sections: VOICE_RAIL_SECTIONS,
    trailingStart: VOICE_RAIL_TRAILING_START,
    activeSection: 'install',
    onSectionChange: vi.fn(),
  }
  render(<VoiceFallbackPanel {...props} />)
  return props
}

describe('VoiceFallbackPanel', () => {
  it('renders the help-desk connect and fallback groups', () => {
    setup()
    expect(screen.getByText('Connect Help Desk')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Connect new integration/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Build Fallback in agent' })).toBeInTheDocument()
    expect(
      screen.getByText(/The fallback activates if the 'Knowledge Retrieval' agent fails/),
    ).toBeInTheDocument()
  })
})
