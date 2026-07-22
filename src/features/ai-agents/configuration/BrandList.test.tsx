import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandList } from './BrandList'
import { SEED_BRANDS } from './config-data'

describe('BrandList', () => {
  it('renders a Create new button and one row per brand label', () => {
    render(<BrandList brands={SEED_BRANDS} selectedId="vip" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText('Member')).toBeInTheDocument()
    expect(screen.getByText('Partner')).toBeInTheDocument()
  })

  it('marks the selected row via aria-pressed', () => {
    render(<BrandList brands={SEED_BRANDS} selectedId="vip" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /VIP/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Member/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with the brand id when a row is clicked', async () => {
    const onSelect = vi.fn()
    render(<BrandList brands={SEED_BRANDS} selectedId="vip" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /Member/ }))
    expect(onSelect).toHaveBeenCalledWith('member')
  })
})
