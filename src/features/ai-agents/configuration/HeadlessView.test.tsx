import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigurationView } from './ConfigurationView'

const view = () => within(screen.getByTestId('view-configuration'))

describe('Headless tab', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  it('renders the 4 steps, API key section, and A2A endpoints when Headless is selected', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    expect(v.getByText('Add Forethought as an A2A agent')).toBeInTheDocument()
    expect(v.getByText("Pass the end-user's identity")).toBeInTheDocument()
    expect(v.getByText('Send a message')).toBeInTheDocument()
    expect(v.getByText('API key')).toBeInTheDocument()
    expect(v.getByText('Agent Card')).toBeInTheDocument()
    expect(v.getByText('Message endpoint')).toBeInTheDocument()
    expect(v.queryByText('Coming soon')).not.toBeInTheDocument()
  })

  it('reveals and re-masks the API key with the eye toggle', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    expect(v.getByText('••••••••••••••')).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Show API key' }))
    expect(v.queryByText('••••••••••••••')).not.toBeInTheDocument()
    expect(v.getByText(/^ft_a2a_live_/)).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Hide API key' }))
    expect(v.getByText('••••••••••••••')).toBeInTheDocument()
  })

  it('changes the key when Refresh is clicked', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    await userEvent.click(v.getByRole('button', { name: 'Show API key' }))
    const first = v.getByText(/^ft_a2a_live_/).textContent
    await userEvent.click(v.getByRole('button', { name: 'Refresh API key' }))
    await userEvent.click(v.getByRole('button', { name: 'Show API key' }))
    expect(v.getByText(/^ft_a2a_live_/).textContent).not.toBe(first)
  })

  it('copies a step code block to the clipboard', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    await userEvent.click(v.getByRole('button', { name: 'Copy code for step 01' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('agent-card.json'),
    )
  })
})
