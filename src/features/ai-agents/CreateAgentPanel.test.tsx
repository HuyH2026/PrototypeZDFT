import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CreateAgentPanel } from './CreateAgentPanel'

function renderPanel(onCreate = vi.fn(), onClose = vi.fn()) {
  render(<CreateAgentPanel channel="widget" onClose={onClose} onCreate={onCreate} />)
  return { onCreate, onClose }
}

describe('CreateAgentPanel', () => {
  it('opens with the use-case content from the design', () => {
    renderPanel()

    expect(screen.getByRole('dialog', { name: 'Create Use Case' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Create new Use Case' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'All-segment targeting' })).toBeChecked()
    expect(screen.getByText('All-segment targeting is on.')).toBeInTheDocument()
    expect(screen.getByLabelText('Use case name')).toHaveValue('💔 Service cancellation')
    expect((screen.getByLabelText('Customer request') as HTMLTextAreaElement).value).toContain(
      'service or subscription cancellations',
    )
    expect(screen.getByDisplayValue('cancel')).toBeInTheDocument()
  })

  it.each(['voice', 'webcall'] as const)(
    'opens on the call-channel frame seeds when the channel is %s',
    (channel) => {
      render(<CreateAgentPanel channel={channel} onClose={vi.fn()} onCreate={vi.fn()} />)

      // Targeting starts off with the four segment tags visible (frame 146:169720).
      expect(screen.getByRole('switch', { name: 'All-segment targeting' })).not.toBeChecked()
      expect(screen.getByText('All-segment targeting is off.')).toBeInTheDocument()
      const segments = screen.getByRole('group', { name: 'Segments' })
      for (const tag of ['Tag A', 'Tag B', 'Tag C', 'Tag D']) {
        expect(segments).toHaveTextContent(tag)
      }
      expect(screen.getByLabelText('Use case name')).toHaveValue('Add to cart')
      expect(screen.getByLabelText('Customer request')).toHaveValue(
        'Guide user to add forgotten items to cart.',
      )
      expect(screen.queryByDisplayValue('cancel')).not.toBeInTheDocument()
    },
  )

  it('Voice ▸ Outbound draws the pared-down subflow drawer (frame 155:58932)', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <CreateAgentPanel channel="voice" direction="outbound" onClose={vi.fn()} onCreate={onCreate} />,
    )

    // No targeting toggle, no segment box, no trigger phrases — just a name
    // ("Add to cart" is the placeholder, not a seed) and a description.
    expect(screen.queryByRole('switch', { name: 'All-segment targeting' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Segments' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Trigger phrases')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Use case name')).toHaveValue('')
    expect(screen.getByPlaceholderText('Add to cart')).toBeInTheDocument()
    expect(screen.getByLabelText('More information')).toHaveValue('')
    expect(
      screen.getByPlaceholderText('Give a description to this outbound use case'),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Use case name'), 'Win-back call')
    await user.click(screen.getByRole('button', { name: 'Create subflow' }))
    expect(onCreate).toHaveBeenCalledWith({
      name: 'Win-back call',
      channel: 'voice',
      allSegments: true,
      tags: [],
      customerRequest: '',
      triggerPhrases: [],
      callDirection: 'outbound',
      isSubflow: true,
      type: 'Subflow',
    })
  })

  it('reveals segments when all-segment targeting is turned off', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('switch', { name: 'All-segment targeting' }))

    expect(screen.getByText('All-segment targeting is off.')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Segments' })).toHaveTextContent('Riders')
    expect(screen.getByRole('group', { name: 'Segments' })).toHaveTextContent('One members')
  })

  it('submits the visible use-case fields', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderPanel()

    await user.click(screen.getByRole('switch', { name: 'All-segment targeting' }))
    await user.click(screen.getByRole('button', { name: 'Create Use Case' }))

    expect(onCreate).toHaveBeenCalledWith({
      name: '💔 Service cancellation',
      channel: 'widget',
      allSegments: false,
      tags: ['Riders', 'One members'],
      customerRequest: expect.stringContaining('service or subscription cancellations'),
      triggerPhrases: ['cancel'],
    })
  })

  it('disables Create when the use-case name is empty', async () => {
    const user = userEvent.setup()
    renderPanel()
    const create = screen.getByRole('button', { name: 'Create Use Case' })

    await user.clear(screen.getByLabelText('Use case name'))
    expect(create).toBeDisabled()
    await user.type(screen.getByLabelText('Use case name'), 'Delivery update')
    expect(create).toBeEnabled()
  })

  it('adds, edits, and removes trigger phrases', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderPanel()

    await user.type(screen.getByLabelText('Trigger phrases'), 'pause my subscription{Enter}')
    expect(screen.getByDisplayValue('pause my subscription')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove trigger phrase 1' }))
    await user.click(screen.getByRole('button', { name: 'Create Use Case' }))

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerPhrases: ['pause my subscription'],
      }),
    )
  })

  it('removes a selected segment before submission', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderPanel()
    await user.click(screen.getByRole('switch', { name: 'All-segment targeting' }))
    await user.click(screen.getByRole('button', { name: 'Remove segment Riders' }))
    await user.click(screen.getByRole('button', { name: 'Create Use Case' }))
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ tags: ['One members'] }))
  })

  it('is modal, focuses Close, and traps focus', async () => {
    const user = userEvent.setup()
    renderPanel()
    const close = screen.getByRole('button', { name: 'Close' })
    const create = screen.getByRole('button', { name: 'Create Use Case' })

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(create).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
  })

  it('closes on Escape, the close button, and the scrim', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel()
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    const scrim = screen.getByRole('dialog').previousElementSibling
    await user.click(scrim as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('restores focus to the opener when it unmounts', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open use case
          </button>
          {open && (
            <CreateAgentPanel channel="widget" onClose={() => setOpen(false)} onCreate={() => {}} />
          )}
        </>
      )
    }
    render(<Harness />)
    const opener = screen.getByRole('button', { name: 'Open use case' })
    await user.click(opener)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(opener).toHaveFocus()
  })
})
