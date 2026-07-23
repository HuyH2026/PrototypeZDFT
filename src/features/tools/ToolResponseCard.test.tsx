import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolResponseCard } from './ToolResponseCard'

describe('ToolResponseCard', () => {
  it('renders the Responses and Output Parameters panels', () => {
    render(<ToolResponseCard />)
    expect(screen.getByText('Responses')).toBeInTheDocument()
    expect(screen.getByText('Output Parameters')).toBeInTheDocument()
    expect(screen.getByText('Enter the URL and click Send to get a response')).toBeInTheDocument()
    expect(screen.getByText('Click on Response to add Output parameters')).toBeInTheDocument()
  })
})
