import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('ToolDetailScreen', () => {
  it('renders the tool name and state badge for a valid id', () => {
    renderAt('/tools/t3')
    const el = screen.getByTestId('screen-tool-detail')
    expect(within(el).getByRole('heading', { name: 'Reconcile Payout' })).toBeInTheDocument()
    expect(within(el).getByText('Live')).toBeInTheDocument()
    expect(within(el).getByText(/api\.cashwise\.example/)).toBeInTheDocument()
  })

  it('redirects an unknown id back to /tools', () => {
    renderAt('/tools/does-not-exist')
    expect(screen.getByTestId('screen-tools')).toBeInTheDocument()
    expect(screen.queryByTestId('screen-tool-detail')).toBeNull()
  })

  it('navigates back to /tools when the back arrow is clicked', () => {
    renderAt('/tools/t3')
    fireEvent.click(screen.getByRole('button', { name: 'Back to Actions' }))
    expect(screen.getByTestId('screen-tools')).toBeInTheDocument()
  })

  it('switches request tabs within the detail screen', () => {
    renderAt('/tools/t3')
    const el = screen.getByTestId('screen-tool-detail')
    fireEvent.click(within(el).getByRole('tab', { name: 'Body' }))
    expect(within(el).getByRole('tab', { name: 'Body' })).toHaveAttribute('aria-selected', 'true')
  })
})
