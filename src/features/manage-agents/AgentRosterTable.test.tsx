import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Brand } from '@/types'
import type { RosterAgent } from './roster-data'
import { AgentRosterTable } from './AgentRosterTable'

const BRANDS: Brand[] = [
  { id: 'uber', name: 'Uber', mark: { label: 'Uber', bg: '#131313' }, channels: [] },
  { id: 'uber-eats', name: 'Uber Eats', mark: { label: 'Uber Eats', bg: '#0f8a5f' }, channels: [] },
]

const AGENTS: RosterAgent[] = [
  {
    id: 'uber-rider-trip',
    brandId: 'uber',
    name: 'Uber Rider Trip',
    channels: ['Web Widget', 'Email'],
    health: 'good',
    ar: 84,
    conversations: 10286,
    insightCount: 3,
  },
  {
    id: 'rider-refunds-8',
    brandId: 'uber-eats',
    name: 'Rider Refunds',
    channels: ['Email'],
    health: null,
    ar: null,
    conversations: null,
    insightCount: 0,
  },
]

describe('AgentRosterTable', () => {
  it('groups rows under a brand row', () => {
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )
    expect(screen.getByText('Brand • Uber')).toBeInTheDocument()
    expect(screen.getByText('Brand • Uber Eats')).toBeInTheDocument()
  })

  it('keeps brand subsection rows on the white table surface', () => {
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )

    const brandCell = screen.getByText('Brand • Uber').closest('td')
    expect(brandCell).toHaveClass('bg-white')
    expect(brandCell).not.toHaveClass('bg-[#f5f6f7]')
  })

  it('renders metrics for an agent with data', () => {
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('84%')).toBeInTheDocument()
    expect(screen.getByText('10,286')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View 3' })).toBeInTheDocument()
  })

  it('renders n/a and no insights pill for an agent with no data', () => {
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )
    expect(screen.getAllByText('n/a')).toHaveLength(2)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View 0' })).not.toBeInTheDocument()
  })

  it('deletes an agent through the confirm dialog', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={onDelete} onEdit={() => {}} />,
    )
    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('uber-rider-trip')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('offers edit, duplicate, deactivate, and delete in the row action menu', async () => {
    const user = userEvent.setup()
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))

    expect(
      within(screen.getByRole('menu'))
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Edit', 'Duplicate', 'Deactivate', 'Delete'])
  })

  it('edits an agent from the row action menu', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onEdit).toHaveBeenCalledWith('uber-rider-trip')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('edits an agent from a click anywhere on its row', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={onEdit} />)

    await user.click(screen.getByText('10,286'))

    expect(onEdit).toHaveBeenCalledWith('uber-rider-trip')
  })

  // The menu has no dismiss-on-outside-click, so drilling in from a row while one
  // is open would leave it hanging there when the editor closes over the still-
  // mounted roster.
  it('closes an open row action menu when a row drills in', async () => {
    const user = userEvent.setup()
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions for Rider Refunds' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit Uber Rider Trip' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  // The name is the row's keyboard-reachable target: a click handler on the <tr>
  // alone is invisible to tab order and has no accessible name.
  it('edits an agent from its name button', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: 'Edit Rider Refunds' }))

    expect(onEdit).toHaveBeenCalledWith('rider-refunds-8')
  })

  // The row already holds two controls of its own. Both must beat the row's own
  // handler, or opening the menu (or the insights pill) would also drill in.
  it('does not edit when the controls inside the row are used', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: 'View 3' }))
    expect(onEdit).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    expect(onEdit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('closes the row action menu after a prototype action is chosen', async () => {
    const user = userEvent.setup()
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens the final row actions above the trigger so the menu stays inside the table shell', async () => {
    const user = userEvent.setup()
    render(
      <AgentRosterTable agents={AGENTS} brands={BRANDS} onDelete={() => {}} onEdit={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions for Rider Refunds' }))

    expect(screen.getByRole('menu')).toHaveAttribute('data-side', 'top')
  })

  // Four items is one row's worth of height more than the shell leaves below the
  // second-to-last row, so that one has to flip as well.
  it('opens the second-to-last row actions above the trigger too', async () => {
    const user = userEvent.setup()
    const third: RosterAgent = { ...AGENTS[1], id: 'third-agent', name: 'Third Agent' }
    render(
      <AgentRosterTable
        agents={[...AGENTS, third]}
        brands={BRANDS}
        onDelete={() => {}}
        onEdit={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions for Rider Refunds' }))
    expect(screen.getByRole('menu')).toHaveAttribute('data-side', 'top')
  })

  it('opens rows further up the table below the trigger', async () => {
    const user = userEvent.setup()
    const third: RosterAgent = { ...AGENTS[1], id: 'third-agent', name: 'Third Agent' }
    render(
      <AgentRosterTable
        agents={[...AGENTS, third]}
        brands={BRANDS}
        onDelete={() => {}}
        onEdit={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions for Uber Rider Trip' }))
    expect(screen.getByRole('menu')).toHaveAttribute('data-side', 'bottom')
  })
})
