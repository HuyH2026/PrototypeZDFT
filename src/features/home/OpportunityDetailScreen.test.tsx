import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { OpportunityDetailScreen } from './OpportunityDetailScreen'

function stubStorage() {
  const map = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(), key: () => null, length: 0,
  })
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/opportunity/:id', element: <OpportunityDetailScreen /> },
      { path: '/', element: <div data-testid="home-landing">Home</div> },
    ],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('OpportunityDetailScreen', () => {
  beforeEach(() => stubStorage())
  afterEach(() => vi.unstubAllGlobals())

  it('renders the SCIM opportunity by id', () => {
    renderAt('/opportunity/o2')
    const screenEl = within(screen.getByTestId('screen-opportunity-detail'))
    expect(screenEl.getByText(/SCIM auto-provisioning/i)).toBeInTheDocument()
    expect(screenEl.getByText('164')).toBeInTheDocument()          // volume
    expect(screenEl.getByLabelText('Impact 78')).toBeInTheDocument() // donut
    expect(screenEl.getByText('Request')).toBeInTheDocument()
    expect(screenEl.getByRole('heading', { name: /why this matters/i })).toBeInTheDocument()
    expect(screenEl.getByText(/signal evidence/i)).toBeInTheDocument()
  })

  it('shows a not-found state for an unknown id', () => {
    renderAt('/opportunity/bogus')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })

  it('back button navigates home', async () => {
    const user = userEvent.setup()
    renderAt('/opportunity/o2')
    await user.click(screen.getByRole('button', { name: 'Product recommendations' }))
    expect(screen.getByTestId('home-landing')).toBeInTheDocument()
  })

  it('directs disconnected users to the feed-owned PM tool control', () => {
    renderAt('/opportunity/o2')
    const detail = within(screen.getByTestId('screen-opportunity-detail'))

    expect(detail.queryByRole('button', { name: /connect pm tool/i })).not.toBeInTheDocument()
    expect(detail.getByText(/connect a PM tool from the opportunity feed/i)).toBeInTheDocument()
    expect(detail.getByRole('button', { name: /back to opportunity feed/i })).toBeInTheDocument()
  })

  it('creates an issue with the feed-connected tool and surfaces it as linked work', async () => {
    const user = userEvent.setup()
    localStorage.setItem('home-pm-integration-v1', JSON.stringify({ connected: true, tool: 'jira', linkedIssues: {} }))
    renderAt('/opportunity/o2')
    const detail = within(screen.getByTestId('screen-opportunity-detail'))

    expect(detail.queryByRole('button', { name: /change PM tool/i })).not.toBeInTheDocument()
    await user.click(detail.getByRole('button', { name: /create in jira/i }))
    await user.click(detail.getByRole('button', { name: /view UNI-482 in Jira/i }))
    expect(screen.getByRole('dialog', { name: /UNI-482/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(detail.getByText(/linked work/i)).toBeInTheDocument()
    expect(detail.getByText('UNI-482')).toBeInTheDocument()
    await user.click(detail.getByRole('button', { name: /draft product brief/i }))
    expect(screen.getByRole('dialog', { name: /draft product brief/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /proposed outcome/i })).toBeInTheDocument()
  })

  it('dismissing the linked-item alert hides it', async () => {
    const user = userEvent.setup()
    renderAt('/opportunity/o2')
    const detail = within(screen.getByTestId('screen-opportunity-detail'))
    expect(detail.getByText(/possible related issue/i)).toBeInTheDocument()
    await user.click(detail.getByRole('button', { name: /dismiss/i }))
    expect(detail.queryByText(/possible related issue/i)).not.toBeInTheDocument()
    expect(detail.getByText(/no issues linked yet/i)).toBeInTheDocument()
  })
})
