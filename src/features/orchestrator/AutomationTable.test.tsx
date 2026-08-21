import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { AutomationTable } from './AutomationTable'
import { AUTOMATIONS } from './orchestrator-data'

function KeyboardToggleTable({ onOpen }: { onOpen: (id: string) => void }) {
  const [on, setOn] = useState(false)

  return (
    <AutomationTable
      automations={[AUTOMATIONS[1]]}
      isOn={() => on}
      onToggle={() => setOn((current) => !current)}
      onOpen={onOpen}
    />
  )
}

describe('AutomationTable', () => {
  it('renders the automations in a semantic table with padded headers', () => {
    render(<AutomationTable automations={AUTOMATIONS} isOn={(a) => a.on} onToggle={() => {}} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Automation' })).toHaveClass('px-3.5', 'py-3.5')
  })

  it('uses the catalog width with fixed proportional columns', () => {
    render(<AutomationTable automations={AUTOMATIONS} isOn={(a) => a.on} onToggle={() => {}} />)

    expect(screen.getByRole('table')).toHaveClass('min-w-0', 'table-fixed')
  })

  it('renders a row per automation with its name and run count', () => {
    render(<AutomationTable automations={AUTOMATIONS} isOn={(a) => a.on} onToggle={() => {}} />)
    for (const a of AUTOMATIONS) {
      expect(screen.getByText(a.name)).toBeInTheDocument()
    }
    expect(screen.getAllByText('200')).toHaveLength(AUTOMATIONS.length)
  })

  it('reflects on/off state via aria-checked', () => {
    render(<AutomationTable automations={AUTOMATIONS} isOn={(a) => a.on} onToggle={() => {}} />)
    expect(screen.getByLabelText('Activate Call users with issues')).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByLabelText('Activate Refund request')).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('calls onToggle with the row id when a switch is clicked', () => {
    const onToggle = vi.fn()
    render(<AutomationTable automations={AUTOMATIONS} isOn={(a) => a.on} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('Activate Refund request'))
    expect(onToggle).toHaveBeenCalledWith('a2')
  })

  it('calls onOpen with the automation id when a row is clicked', () => {
    const onOpen = vi.fn()
    render(
      <AutomationTable
        automations={AUTOMATIONS}
        isOn={(a) => a.on}
        onToggle={() => {}}
        onOpen={onOpen}
      />,
    )
    fireEvent.click(screen.getByText('Call users with issues'))
    expect(onOpen).toHaveBeenCalledWith('a1')
  })

  it('does not call onOpen when the toggle is clicked', () => {
    const onOpen = vi.fn()
    render(
      <AutomationTable
        automations={AUTOMATIONS}
        isOn={(a) => a.on}
        onToggle={() => {}}
        onOpen={onOpen}
      />,
    )
    fireEvent.click(screen.getByLabelText('Activate Call users with issues'))
    expect(onOpen).not.toHaveBeenCalled()
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('toggles the switch with %s without opening the automation row', async (_key, input) => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<KeyboardToggleTable onOpen={onOpen} />)
    const toggle = screen.getByRole('switch', {
      name: 'Activate Refund request',
    })

    toggle.focus()
    await user.keyboard(input)

    expect(onOpen).not.toHaveBeenCalled()
    expect(toggle).toBeChecked()
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('opens the automation when its row receives %s', async (_key, input) => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <AutomationTable
        automations={AUTOMATIONS}
        isOn={(automation) => automation.on}
        onToggle={() => {}}
        onOpen={onOpen}
      />,
    )
    const row = screen.getByText('Call users with issues').closest<HTMLElement>('[role="button"]')

    expect(row).not.toBeNull()
    row?.focus()
    await user.keyboard(input)

    expect(onOpen).toHaveBeenCalledOnce()
    expect(onOpen).toHaveBeenCalledWith('a1')
  })
})
