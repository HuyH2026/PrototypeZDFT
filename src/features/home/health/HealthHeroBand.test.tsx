import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthHeroBand } from './HealthHeroBand'

const digest = { verdict: 'Amazing!', narrative: 'Agents are performing well.' }

describe('HealthHeroBand', () => {
  it('renders the section title, verdict and narrative', () => {
    render(<HealthHeroBand digest={digest} />)
    expect(screen.getByText('Agent health')).toBeInTheDocument()
    expect(screen.getByText('Amazing!')).toBeInTheDocument()
    expect(screen.getByText('Agents are performing well.')).toBeInTheDocument()
  })

  it('hides the decorative glyphs from assistive tech', () => {
    const { container } = render(<HealthHeroBand digest={digest} />)
    const decor = container.querySelector('[data-slot="health-hero-decor"]')
    expect(decor).toHaveAttribute('aria-hidden')
    expect(decor?.textContent).toContain('💗')
  })
})
