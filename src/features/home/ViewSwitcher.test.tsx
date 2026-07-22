import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewSwitcher } from './ViewSwitcher'
import type { DashboardView } from './views-store'

const views: DashboardView[] = [
  { id: 'v1', name: 'Default', kind: 'grid', role: null, layout: { left: [], right: [] }, builtIn: true },
  { id: 'v2', name: 'Ops lead', kind: 'grid', role: 'ops', layout: { left: [], right: [] } },
]

function setup(overrides: Partial<React.ComponentProps<typeof ViewSwitcher>> = {}) {
  const props = {
    views, activeId: 'v1',
    onSelect: vi.fn(), onRename: vi.fn(), onDelete: vi.fn(), onNew: vi.fn(),
    ...overrides,
  }
  render(<ViewSwitcher {...props} />)
  return props
}

describe('ViewSwitcher', () => {
  it('shows the active view name on the trigger', () => {
    setup({ activeId: 'v2' })
    expect(screen.getByTestId('view-switcher')).toHaveTextContent('Ops lead')
  })

  it('opens the menu and selects a view', async () => {
    const user = userEvent.setup()
    const props = setup()
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /default/i }))
    await user.click(screen.getByRole('button', { name: /^Ops lead$/ }))
    expect(props.onSelect).toHaveBeenCalledWith('v2')
  })

  it('hides delete for the built-in view but shows it for others', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /default/i }))
    expect(screen.queryByRole('button', { name: /delete default/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete ops lead/i })).toBeInTheDocument()
  })

  it('renames a view (commit on Enter)', async () => {
    const user = userEvent.setup()
    const props = setup()
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /default/i }))
    await user.click(screen.getByRole('button', { name: /rename ops lead/i }))
    const field = screen.getByDisplayValue('Ops lead')
    await user.clear(field)
    await user.type(field, 'My Ops{Enter}')
    expect(props.onRename).toHaveBeenCalledWith('v2', 'My Ops')
  })

  it('fires onNew from the footer', async () => {
    const user = userEvent.setup()
    const props = setup()
    await user.click(within(screen.getByTestId('view-switcher')).getByRole('button', { name: /default/i }))
    await user.click(screen.getByRole('button', { name: /new from/i }))
    expect(props.onNew).toHaveBeenCalled()
  })
})
