import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MemoryRouter } from 'react-router'
import { PmDashboard } from './PmDashboard'
import { DEFAULT_PM_LAYOUT } from './generate-layout'

function renderPm(editing = false) {
  const onMove = vi.fn()
  const onRemove = vi.fn()
  render(
    <MemoryRouter>
      <DndProvider backend={HTML5Backend}>
        <PmDashboard pmLayout={[...DEFAULT_PM_LAYOUT]} editing={editing} onMove={onMove} onRemove={onRemove} />
      </DndProvider>
    </MemoryRouter>,
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

  it('swaps the spotlight to its own curated list per tab', async () => {
    const user = userEvent.setup()
    renderPm()
    const spotlight = screen.getByTestId('pm-spotlight')
    // Trending (default): momentum list with a trend % and the Android crash item.
    expect(within(spotlight).getByText(/Android 15 app crashes/i)).toBeInTheDocument()
    expect(within(spotlight).getByText('140%')).toBeInTheDocument()
    // At risk: distinct list with BUG/GAP tags + revenue amounts (Android item is gone).
    await user.click(within(spotlight).getByRole('button', { name: /^At risk$/i }))
    expect(within(spotlight).queryByText(/Android 15 app crashes/i)).not.toBeInTheDocument()
    expect(within(spotlight).getAllByText('GAP').length).toBeGreaterThan(0)
    expect(within(spotlight).getByText('$840K')).toBeInTheDocument()
    // Asking: growth list keyed on deals (Salesforce sync) with asking amounts.
    await user.click(within(spotlight).getByRole('button', { name: /^Asking$/i }))
    expect(within(spotlight).getByText(/Salesforce two-way contact sync/i)).toBeInTheDocument()
    expect(within(spotlight).getByText('$610K')).toBeInTheDocument()
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

  it('connects once at feed level, then creates and reopens a linked Jira issue', async () => {
    const user = userEvent.setup()
    renderPm()
    const feed = screen.getByTestId('pm-feed')
    expect(within(feed).queryByRole('button', { name: /view in jira/i })).not.toBeInTheDocument()

    await user.click(within(feed).getByRole('button', { name: /connect pm tool/i }))
    await user.click(screen.getByRole('menuitem', { name: /^Jira$/i }))

    expect(within(feed).getByRole('button', { name: /jira connected/i })).toBeInTheDocument()
    const createButtons = within(feed).getAllByRole('button', { name: /create in jira/i })
    await user.click(createButtons[0])
    const issueTrigger = within(feed).getByRole('button', { name: /view UNI-481 in Jira/i })
    await user.click(issueTrigger)
    expect(screen.getByRole('dialog', { name: /UNI-481/i })).toBeInTheDocument()
    expect(screen.getByText(/ready for triage/i)).toBeInTheDocument()
    const closeDialog = screen.getByRole('button', { name: /close/i })
    const doneDialog = screen.getByRole('button', { name: /done/i })
    expect(closeDialog).toHaveFocus()
    await user.tab({ shift: true })
    expect(doneDialog).toHaveFocus()
    await user.tab()
    expect(closeDialog).toHaveFocus()
    await user.click(closeDialog)
    expect(issueTrigger).toHaveFocus()

    const briefTrigger = within(feed).getAllByRole('button', { name: /draft product brief/i })[0]
    await user.click(briefTrigger)
    expect(screen.getByRole('dialog', { name: /draft product brief/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /problem/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(briefTrigger).toHaveFocus()
  })

  it('supports keyboard dismissal and focus restoration for the PM tool picker', async () => {
    const user = userEvent.setup()
    renderPm()
    const feed = screen.getByTestId('pm-feed')
    const trigger = within(feed).getByRole('button', { name: /connect pm tool/i })

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const jira = screen.getByRole('menuitem', { name: /^Jira$/i })
    await waitFor(() => expect(jira).toHaveFocus())
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /^Jira$/i }))
    await waitFor(() => expect(within(feed).getByRole('button', { name: /jira connected/i })).toHaveFocus())
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

  it('feed cards link to the opportunity detail route', () => {
    renderPm()
    const feed = screen.getByTestId('pm-feed')
    const samlLink = within(feed).getByRole('link', { name: /SAML SSO drops users/i })
    expect(samlLink).toHaveAttribute('href', '/opportunity/o1')
  })

  it('scopes each opportunity card decision controls outside its detail link', () => {
    renderPm()
    const card = screen.getByRole('article', { name: /SAML SSO drops users/i })
    const detailLink = within(card).getByRole('link', { name: /SAML SSO drops users/i })
    const actions = within(card).getByRole('group', { name: /actions for SAML SSO drops users/i })

    expect(within(actions).getByRole('button', { name: /draft product brief/i })).toBeInTheDocument()
    expect(within(detailLink).queryByRole('button')).not.toBeInTheDocument()
  })

  it('mapped spotlight rows link to detail; unmapped rows do not', () => {
    renderPm()
    const spotlight = screen.getByTestId('pm-spotlight')
    // Trending default: SCIM row (t3 → o2) is a link; Android crash (t1) is not.
    const scimLink = within(spotlight).getByRole('link', { name: /SCIM auto-provisioning/i })
    expect(scimLink).toHaveAttribute('href', '/opportunity/o2')
    expect(within(spotlight).queryByRole('link', { name: /Android 15 app crashes/i })).toBeNull()
  })
})
