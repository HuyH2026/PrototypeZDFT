import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandAvatar, BrandMarkChip } from './BrandMarkChip'

describe('BrandMarkChip', () => {
  it('renders the wordmark on the brand colour', () => {
    render(<BrandMarkChip mark={{ label: 'Uber Eats', bg: '#0f8a5f' }} />)
    const chip = screen.getByTestId('brand-mark')
    expect(chip).toHaveTextContent('Uber Eats')
    expect(chip.style.backgroundColor).toBe('rgb(15, 138, 95)')
  })

  it('renders a compact chip at size 20', () => {
    render(<BrandMarkChip mark={{ label: 'Uber', bg: '#131313' }} size={20} />)
    expect(screen.getByTestId('brand-mark').style.height).toBe('20px')
  })
})

describe('BrandAvatar', () => {
  it('renders one initial per word, up to two', () => {
    render(<BrandAvatar mark={{ label: 'Uber Eats', bg: '#0f8a5f' }} />)
    expect(screen.getByTestId('brand-avatar')).toHaveTextContent('UE')
  })

  it('renders a single initial for a one-word mark', () => {
    render(<BrandAvatar mark={{ label: 'Freight', bg: '#724be8' }} />)
    expect(screen.getByTestId('brand-avatar')).toHaveTextContent('F')
  })

  it('is a circle on the brand colour', () => {
    render(<BrandAvatar mark={{ label: 'Uber', bg: '#131313' }} />)
    const avatar = screen.getByTestId('brand-avatar')
    expect(avatar.style.borderRadius).toBe('9999px')
    expect(avatar.style.width).toBe('20px')
    expect(avatar.style.backgroundColor).toBe('rgb(19, 19, 19)')
  })
})
