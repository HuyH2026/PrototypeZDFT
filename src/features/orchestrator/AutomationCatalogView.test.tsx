import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AutomationCatalogView } from './AutomationCatalogView'

describe('AutomationCatalogView', () => {
  it('renders catalog metrics and forwards row selection', () => {
    const onOpen = vi.fn()
    render(<AutomationCatalogView onOpen={onOpen} />)
    const catalog = screen.getByTestId('view-automation-catalog')

    expect(within(catalog).getByText('Total runs')).toBeInTheDocument()
    expect(within(catalog).getByRole('button', { name: 'New automation' })).toBeInTheDocument()
    fireEvent.click(within(catalog).getByText('Call users with issues'))
    expect(onOpen).toHaveBeenCalledWith('a1')
  })

  it('keeps activation state local to the catalog', () => {
    render(<AutomationCatalogView onOpen={() => {}} />)
    const catalog = screen.getByTestId('view-automation-catalog')
    const toggle = within(catalog).getByLabelText('Activate Call users with issues')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })
})
