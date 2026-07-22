import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PmDashboard } from './PmDashboard'
import { DEFAULT_PM_LAYOUT } from './generate-layout'

function renderPm(editing = false) {
  const onMove = vi.fn()
  const onRemove = vi.fn()
  render(
    <DndProvider backend={HTML5Backend}>
      <PmDashboard pmLayout={[...DEFAULT_PM_LAYOUT]} editing={editing} onMove={onMove} onRemove={onRemove} />
    </DndProvider>,
  )
  return { onMove, onRemove }
}

function stubStorage() {
  const map = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(), key: () => null, length: 0,
  })
}

describe('PmDashboard', () => {
  beforeEach(() => stubStorage())
  afterEach(() => vi.unstubAllGlobals())

  it('renders the KPI cards including ARR at risk and ARR asking', () => {
    renderPm()
    const surface = within(screen.getByTestId('screen-pm'))
    expect(surface.getByText('ARR at risk')).toBeInTheDocument()
    expect(surface.getByText('$1.36M')).toBeInTheDocument()
    expect(surface.getByText('ARR asking')).toBeInTheDocument()
  })

  it('renders the lifecycle stages', () => {
    renderPm()
    const surface = within(screen.getByTestId('screen-pm'))
    for (const label of ['Detected', 'Planned', 'In dev', 'Shipped']) {
      expect(surface.getAllByText(label).length).toBeGreaterThan(0)
    }
  })

  it('filters spotlight items when the At risk tab is selected', async () => {
    const user = userEvent.setup()
    renderPm()
    const spotlight = screen.getByTestId('pm-spotlight')
    // SCIM (asking-only) shows under Trending initially.
    expect(within(spotlight).getByText(/SCIM auto-provisioning/i)).toBeInTheDocument()
    await user.click(within(spotlight).getByRole('button', { name: /^At risk$/i }))
    // At risk tab excludes the asking-only SCIM item.
    expect(within(spotlight).queryByText(/SCIM auto-provisioning/i)).not.toBeInTheDocument()
    expect(within(spotlight).getByText(/Android 15 app crashes/i)).toBeInTheDocument()
  })

  it('filters the feed by search text', async () => {
    const user = userEvent.setup()
    renderPm()
    const feed = screen.getByTestId('pm-feed')
    expect(within(feed).getByText(/SAML SSO drops users/i)).toBeInTheDocument()
    await user.type(within(feed).getByPlaceholderText(/search/i), 'SCIM')
    expect(within(feed).queryByText(/SAML SSO drops users/i)).not.toBeInTheDocument()
    expect(within(feed).getByText(/SCIM auto-provisioning/i)).toBeInTheDocument()
  })

  it('connect flow: connecting Jira flips the card action to Add to Jira then Added', async () => {
    const user = userEvent.setup()
    renderPm()
    const feed = screen.getByTestId('pm-feed')
    // Before connect: the action prompts to connect.
    await user.click(within(feed).getByRole('button', { name: /connect pm tool/i }))
    await user.click(screen.getByRole('button', { name: /^Jira$/i }))
    // After connect, each opportunity offers "Add to Jira".
    const addButtons = within(feed).getAllByRole('button', { name: /add to jira/i })
    expect(addButtons.length).toBeGreaterThan(0)
    await user.click(addButtons[0])
    expect(within(feed).getAllByRole('button', { name: /added/i }).length).toBeGreaterThan(0)
  })

  it('shows remove controls in edit mode and calls onRemove', async () => {
    const user = userEvent.setup()
    const { onRemove } = renderPm(true)
    // Each widget has a Remove control in edit mode.
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons.length).toBeGreaterThan(0)
    await user.click(removeButtons[0])
    expect(onRemove).toHaveBeenCalled()
  })
})
