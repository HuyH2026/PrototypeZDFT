import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlaceholderScreen } from './PlaceholderScreen'

describe('PlaceholderScreen', () => {
  it('renders the title and coming-soon copy', () => {
    render(<PlaceholderScreen title="QA" />)
    expect(screen.getByText('QA')).toBeInTheDocument()
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  it('renders an optional action in the top-right', () => {
    render(<PlaceholderScreen title="QA" action={<button>act</button>} />)
    expect(screen.getByRole('button', { name: 'act' })).toBeInTheDocument()
  })
})
