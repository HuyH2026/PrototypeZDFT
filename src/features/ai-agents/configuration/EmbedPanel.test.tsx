import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmbedPanel } from './EmbedPanel'
import {
  EMBED_KEY_PLACEHOLDER,
  WIDGET_RAIL_SECTIONS,
  WIDGET_RAIL_TRAILING_START,
} from './config-data'

function setup() {
  const props = {
    sections: WIDGET_RAIL_SECTIONS,
    trailingStart: WIDGET_RAIL_TRAILING_START,
    activeSection: 'code',
    onSectionChange: vi.fn(),
  }
  render(<EmbedPanel {...props} />)
  return props
}

describe('EmbedPanel', () => {
  it('renders both numbered steps and the snippet', () => {
    setup()
    expect(screen.getByText('Embed')).toBeInTheDocument()
    expect(screen.getByText('Domain allowlist')).toBeInTheDocument()
    expect(
      screen.getByText('The widget can only be installed on the domains listed here.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Code Snippet')).toBeInTheDocument()
    expect(screen.getByText(/solve-widget\.forethought\.ai\/embed\.js/)).toBeInTheDocument()
  })

  it('lists a domain once it is added, and clears the field', async () => {
    setup()
    const field = screen.getByLabelText('Domain allowlist')
    await userEvent.type(field, 'https://uber.com')
    await userEvent.click(screen.getByRole('button', { name: 'Add domain' }))
    expect(screen.getByText('https://uber.com')).toBeInTheDocument()
    expect(field).toHaveValue('')
  })

  it('ignores an empty domain', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Add domain' }))
    expect(screen.getByLabelText('Domain allowlist')).toHaveValue('')
  })

  it('hides the API key when "Show API key in code snippet" is unchecked', async () => {
    setup()
    const checkbox = screen.getByLabelText(/Show API key in code snippet/)
    expect(checkbox).toBeChecked()
    expect(screen.getByText(/ft_a2a_live_/)).toBeInTheDocument()
    await userEvent.click(checkbox)
    expect(screen.getByText(EMBED_KEY_PLACEHOLDER)).toBeInTheDocument()
    expect(screen.queryByText(/ft_a2a_live_/)).not.toBeInTheDocument()
  })

  it('mints a different key on Refresh API key', async () => {
    setup()
    const before = screen.getByText(/ft_a2a_live_/).textContent
    await userEvent.click(screen.getByRole('button', { name: 'Refresh API key' }))
    expect(screen.getByText(/ft_a2a_live_/).textContent).not.toBe(before)
  })
})
