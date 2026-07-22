// src/features/ai-agents/configuration/BrandedWidgetPanel.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandedWidgetPanel } from './BrandedWidgetPanel'
import { SEED_BRANDS } from './config-data'

const vip = SEED_BRANDS[0]

function setup(overrides = {}) {
  const props = {
    brand: vip,
    activeSection: 'brands',
    onSectionChange: vi.fn(),
    onNameChange: vi.fn(),
    onToggleEnabled: vi.fn(),
    onToggleDefault: vi.fn(),
    ...overrides,
  }
  render(<BrandedWidgetPanel {...props} />)
  return props
}

describe('BrandedWidgetPanel', () => {
  it('renders heading, brand-name input bound to the brand, and tag chips', () => {
    setup()
    expect(screen.getByText('Branded widget')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SpaceX support')).toBeInTheDocument()
    expect(screen.getByText('Existing Tag 1')).toBeInTheDocument()
  })

  it('exposes the enabled toggle via role=switch reflecting brand.enabled', () => {
    setup()
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('fires onToggleEnabled when the switch is clicked', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('switch'))
    expect(props.onToggleEnabled).toHaveBeenCalledOnce()
  })

  it('fires onNameChange when the brand name input changes', async () => {
    const props = setup()
    await userEvent.type(screen.getByDisplayValue('SpaceX support'), '!')
    expect(props.onNameChange).toHaveBeenCalled()
  })

  it('fires onSectionChange when a rail icon is clicked', async () => {
    const props = setup()
    // Links is the second rail section.
    await userEvent.click(screen.getByRole('button', { name: 'Links' }))
    expect(props.onSectionChange).toHaveBeenCalledWith('links')
  })
})
