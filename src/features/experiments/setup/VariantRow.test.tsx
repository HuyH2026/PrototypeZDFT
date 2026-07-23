import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VariantRow } from './VariantRow'
import { SETUP_VARIANTS } from '../experiments-data'

describe('VariantRow', () => {
  it('renders the badge, description, agent, and traffic', () => {
    render(<VariantRow variant={SETUP_VARIANTS[0]} />)
    expect(screen.getByText('Control')).toBeInTheDocument()
    expect(screen.getByText('The current live agent that acts as the baseline.')).toBeInTheDocument()
    expect(screen.getByText('Login troubleshooting')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })
})
