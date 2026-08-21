import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { TranscriptEntry } from './conversations-data'
import { CHANNELS } from './conversations-data'
import { auditFor } from './audit-data'
import {
  EvidenceTimeline,
  ExchangeStrip,
  ErrorsQuickFilter,
  groupIntoTurns,
  EvidenceMenu,
  type EvidenceFilter,
  TranscriptBody,
} from './TurnAudit'

const customer = (text: string): TranscriptEntry => ({
  kind: 'bubble',
  speaker: 'User',
  role: 'Customer',
  side: 'client',
  text,
  time: '11:59:10 PM',
})
const solve = (text: string): TranscriptEntry => ({
  kind: 'bubble',
  speaker: 'Solve',
  role: 'Solve',
  side: 'solve',
  text,
  time: '11:59:12 PM',
})
const step = (text: string): TranscriptEntry => ({ kind: 'step', text, time: '11:59:13 PM' })

describe('groupIntoTurns', () => {
  it('opens a new exchange on each customer bubble', () => {
    const groups = groupIntoTurns([customer('a'), solve('b'), customer('c'), solve('d')])
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveLength(2)
    expect(groups[1]).toHaveLength(2)
  })

  it('starts exchange one with the entries that precede the first customer bubble', () => {
    const groups = groupIntoTurns([solve('greeting'), customer('a'), solve('b')])
    expect(groups).toHaveLength(2)
    expect(groups[0]).toEqual([solve('greeting')])
  })

  it('attaches step chips to the exchange in progress', () => {
    const groups = groupIntoTurns([customer('a'), step('Triggered action'), solve('b'), customer('c')])
    expect(groups).toHaveLength(2)
    expect(groups[0].map((e) => e.kind)).toEqual(['bubble', 'step', 'bubble'])
    expect(groups[1]).toHaveLength(1)
  })

  it('returns no exchanges for an empty transcript', () => {
    expect(groupIntoTurns([])).toEqual([])
  })
})

const G1 = auditFor('g-1')!
const G2 = auditFor('g-2')!

// ExchangeStrip and EvidenceTimeline render router Links when an open exchange
// holds an error ("View failed step"), so their renders need a router context.
const renderWithRouter = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ExchangeStrip', () => {
  it('renders nothing for an exchange with no events', () => {
    const { container } = render(<ExchangeStrip events={[]} open={false} onToggle={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('states the event count and stays quiet on a healthy exchange', () => {
    render(<ExchangeStrip events={G1.exchanges[2]} open={false} onToggle={() => {}} />)
    const toggle = screen.getByRole('button', { name: /Show details/ })
    expect(toggle).toHaveTextContent('2 events')
    expect(toggle).not.toHaveTextContent('error')
  })

  it('leads with the error count on the affected exchange', () => {
    render(<ExchangeStrip events={G1.exchanges[1]} open={false} onToggle={() => {}} />)
    const toggle = screen.getByRole('button', { name: /Show details/ })
    expect(toggle).toHaveTextContent('1 error')
    expect(toggle).toHaveTextContent('5 events')
  })

  it('hides the details until it is open, and reports its state', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const { rerender } = renderWithRouter(<ExchangeStrip events={G1.exchanges[1]} open={false} onToggle={onToggle} />)
    expect(screen.getByRole('button', { name: /Show details/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/Statement-charge policy selected/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Show details/ }))
    expect(onToggle).toHaveBeenCalledOnce()
    rerender(
      <MemoryRouter>
        <ExchangeStrip events={G1.exchanges[1]} open onToggle={onToggle} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /Hide details/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Statement-charge policy selected/)).toBeInTheDocument()
  })
})

describe('EvidenceTimeline', () => {
  const renderWrapped = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

  it('gives each event a kind chip, a time and a plain line', () => {
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    expect(screen.getByText('Intent')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('API')).toBeInTheDocument()
    expect(screen.getByText('11:59:12 PM')).toBeInTheDocument()
  })

  it('shows a persistent latency on every event, including the first', () => {
    const G4 = auditFor('g-4')!
    renderWrapped(<EvidenceTimeline events={G4.exchanges[2]} />)
    // The 10s tool timeout is the conversation's smoking gun; the exchange's
    // first event carries its latency too — there is no "first event" exception.
    expect(screen.getByText('10s')).toBeInTheDocument()
    expect(screen.getByText('3ms')).toBeInTheDocument()
    expect(screen.getByText('750ms')).toBeInTheDocument()
  })

  it('marks an error row with its category and severity', () => {
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    expect(screen.getByText('Error · high')).toBeInTheDocument()
    expect(screen.getByText(/Missing context variable/)).toBeInTheDocument()
    expect(screen.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
  })

  it('preserves the error ID with a copy affordance', () => {
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    expect(screen.getByText('err_9f2c41a7')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy error ID err_9f2c41a7' })).toBeInTheDocument()
  })

  it("carries the How to fix guidance and links to the failed step's Autoflow", () => {
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    expect(screen.getByText('How to fix')).toBeInTheDocument()
    expect(screen.getByText(/Widget segment's context variables/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'View failed step in Call users with issues' })
    expect(link).toHaveAttribute('href', '/insights/automations/a1')
  })

  it('cites knowledge sources as title + version links, expanding to the full list', async () => {
    const user = userEvent.setup()
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    const first = screen.getByRole('link', { name: /Understanding statement charges/ })
    expect(first).toHaveAttribute('href', 'https://help.example.com/articles/understanding-statement-charges')
    expect(first).toHaveTextContent('v12')
    expect(screen.queryByRole('link', { name: /Pending authorisations/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+1 more source' }))
    expect(screen.getByRole('link', { name: /Pending authorisations/ })).toBeInTheDocument()
    // Sources are cited, never quoted.
    expect(screen.queryByText(/Pending authorisations clear within/)).not.toBeInTheDocument()
  })

  it('shows request and response payloads as expandable code blocks', async () => {
    const user = userEvent.setup()
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    expect(screen.queryByTestId('payload-details')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /request summary available/ }))
    const payload = screen.getByTestId('payload-details')
    expect(within(payload).getByText('Request')).toBeInTheDocument()
    expect(within(payload).getByText('Response')).toBeInTheDocument()
    expect(within(payload).getByText(/include_pending/)).toBeInTheDocument()
    // Sensitive fields stay redacted in the rendered payload.
    expect(within(payload).getByText(/Redacted/)).toBeInTheDocument()
  })

  it('never leaks a customer-data dump into an evidence line', () => {
    renderWrapped(<EvidenceTimeline events={G1.exchanges[1]} />)
    expect(screen.getByText(/customer data omitted from the drawer/)).toBeInTheDocument()
  })
})

describe('ErrorsQuickFilter', () => {
  it('renders nothing on a healthy conversation', () => {
    const { container } = render(<ErrorsQuickFilter audit={G2} value={null} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('names the error count on a failing conversation', () => {
    render(<ErrorsQuickFilter audit={G1} value={null} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Errors · 1' })).toBeInTheDocument()
  })

  it('reports the error filter when pressed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ErrorsQuickFilter audit={G1} value={null} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Errors · 1' }))
    expect(onChange).toHaveBeenCalledWith('error')
  })

  it('clears the filter when pressed again while active', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ErrorsQuickFilter audit={G1} value="error" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Errors · 1' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})

describe('EvidenceMenu', () => {
  const openMenu = async (value: EvidenceFilter = null, onChange = vi.fn()) => {
    const user = userEvent.setup()
    render(<EvidenceMenu audit={G1} value={value} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /Details|All events|Errors/ }))
    return { user, onChange, menu: within(screen.getByRole('menu')) }
  }

  it('counts every kind, including the ones with nothing in them', async () => {
    const { menu } = await openMenu()
    expect(menu.getByRole('menuitem', { name: /All events/ })).toHaveTextContent('8')
    expect(menu.getByRole('menuitem', { name: /Errors/ })).toHaveTextContent('1')
    expect(menu.getByRole('menuitem', { name: /Intents/ })).toHaveTextContent('2')
    expect(menu.getByRole('menuitem', { name: /Sources/ })).toHaveTextContent('1')
    expect(menu.getByRole('menuitem', { name: /APIs/ })).toHaveTextContent('1')
    expect(menu.getByRole('menuitem', { name: /Steps/ })).toHaveTextContent('3')
    expect(menu.getByRole('menuitem', { name: /Tools/ })).toHaveTextContent('0')
  })

  it('disables a zero-count entry rather than hiding it', async () => {
    const { menu } = await openMenu()
    expect(menu.getByRole('menuitem', { name: /Tools/ })).toBeDisabled()
    expect(menu.getByRole('menuitem', { name: /Errors/ })).toBeEnabled()
  })

  it('reports the chosen kind and closes', async () => {
    const { user, onChange, menu } = await openMenu()
    await user.click(menu.getByRole('menuitem', { name: /Errors/ }))
    expect(onChange).toHaveBeenCalledWith('error')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('clears the filter when the active entry is chosen again', async () => {
    const { user, onChange, menu } = await openMenu('error')
    await user.click(menu.getByRole('menuitem', { name: /Errors/ }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('names the active filter on the trigger', () => {
    render(<EvidenceMenu audit={G1} value="all" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /All events/ })).toBeInTheDocument()
  })
})

const widgetRow = (id: string) => CHANNELS.widget.rows.find((r) => r.id === id)!

// TranscriptBody renders router Links ("View failed step" on an error), so its
// renders need a router context.
const renderBody = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('TranscriptBody', () => {
  it('renders a strip under each exchange that has events, and none where there are none', () => {
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    // g-1 has three exchanges, all with events.
    expect(screen.getAllByRole('button', { name: /Show details/ })).toHaveLength(3)
    expect(screen.getByTestId('exchange-1')).toBeInTheDocument()
  })

  it('starts with every strip collapsed', () => {
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    expect(screen.queryByText(/Statement-charge policy selected/)).not.toBeInTheDocument()
  })

  it('stamps every chat turn — bubbles and step chips alike', () => {
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    // The greeting bubble opens exchange 0 with its own time (rendered in the
    // bubble header as "· 11:59:01 PM", hence the regex match).
    expect(within(screen.getByTestId('exchange-0')).getByText(/11:59:01 PM/)).toBeInTheDocument()
    // The step chip mid-exchange-1 carries a time too.
    const stepChip = screen.getByText('Fallback answer sent from knowledge')
    expect(within(stepChip.closest('div')!).getByText('11:59:16 PM')).toBeInTheDocument()
    // Every turn's timestamp is visible without expanding anything.
    for (const time of ['11:59:01 PM', '11:59:10 PM', '11:59:16 PM', '11:59:38 PM', '11:59:43 PM']) {
      expect(screen.getAllByText(new RegExp(time.replace(/:/g, '\\:') + '$')).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('expands one strip by hand without touching the others', async () => {
    const user = userEvent.setup()
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    const strip = within(screen.getByTestId('exchange-1'))
    await user.click(strip.getByRole('button', { name: /Show details/ }))
    expect(screen.getByText(/Statement-charge policy selected/)).toBeInTheDocument()
    expect(within(screen.getByTestId('exchange-2')).getByRole('button', { name: /Show details/ })).toBeInTheDocument()
  })

  it('expands every strip on All events without hiding an exchange', async () => {
    const user = userEvent.setup()
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    await user.click(screen.getByRole('button', { name: /^Details/ }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /All events/ }))
    expect(screen.getAllByRole('button', { name: /Hide details/ })).toHaveLength(3)
    expect(screen.getByTestId('exchange-0')).toBeInTheDocument()
  })

  it('hides non-matching exchanges and narrows the rest when a kind is chosen', async () => {
    const user = userEvent.setup()
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    await user.click(screen.getByRole('button', { name: /^Details/ }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Errors/ }))
    expect(screen.getByTestId('exchange-1')).toBeInTheDocument()
    expect(screen.queryByTestId('exchange-0')).not.toBeInTheDocument()
    expect(screen.queryByTestId('exchange-2')).not.toBeInTheDocument()
    // Only the error event is listed inside the surviving exchange.
    expect(screen.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
    expect(screen.queryByText(/Statement-charge policy selected/)).not.toBeInTheDocument()
  })

  it('restores every exchange when the active filter is chosen again', async () => {
    const user = userEvent.setup()
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    await user.click(screen.getByRole('button', { name: /^Details/ }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Errors/ }))
    await user.click(screen.getByRole('button', { name: /^Errors$/ }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Errors/ }))
    expect(screen.getByTestId('exchange-0')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Show details/ })).toHaveLength(3)
  })

  it('keeps the filter when a strip is toggled by hand', async () => {
    const user = userEvent.setup()
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    await user.click(screen.getByRole('button', { name: /^Details/ }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Errors/ }))
    await user.click(screen.getByRole('button', { name: /Hide details/ }))
    expect(screen.getByRole('button', { name: /^Errors$/ })).toBeInTheDocument()
    expect(screen.queryByTestId('exchange-0')).not.toBeInTheDocument()
  })

  it('offers a one-click Errors shortcut next to Details, and jumps straight to the failing exchanges', async () => {
    const user = userEvent.setup()
    renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    await user.click(screen.getByRole('button', { name: 'Errors · 1' }))
    expect(screen.getByTestId('exchange-1')).toBeInTheDocument()
    expect(screen.queryByTestId('exchange-0')).not.toBeInTheDocument()
    expect(screen.queryByTestId('exchange-2')).not.toBeInTheDocument()
    expect(screen.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
  })

  it('has no Errors shortcut on a healthy conversation', () => {
    renderBody(<TranscriptBody detail={widgetRow('g-2').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    expect(screen.queryByRole('button', { name: /^Errors/ })).not.toBeInTheDocument()
  })

  it('opens the first exchange holding an error when the reveal is bumped', () => {
    const { rerender } = renderBody(<TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 0, exchange: -1 }} />)
    expect(screen.queryByText(/the account identifier was unavailable/)).not.toBeInTheDocument()
    rerender(
      <MemoryRouter>
        <TranscriptBody detail={widgetRow('g-1').detail} reveal={{ nonce: 1, exchange: -1 }} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/the account identifier was unavailable/)).toBeInTheDocument()
  })

  it('reports the reveal consumed for a live nonce, and not for an inert one', () => {
    const onRevealConsumed = vi.fn()
    const detail = widgetRow('g-1').detail
    const { rerender } = renderBody(
      <TranscriptBody detail={detail} reveal={{ nonce: 0, exchange: -1 }} onRevealConsumed={onRevealConsumed} />,
    )
    expect(onRevealConsumed).not.toHaveBeenCalled()
    rerender(
      <MemoryRouter>
        <TranscriptBody detail={detail} reveal={{ nonce: 1, exchange: -1 }} onRevealConsumed={onRevealConsumed} />
      </MemoryRouter>,
    )
    expect(onRevealConsumed).toHaveBeenCalledTimes(1)
  })

  it('renders a channel without an audit as a flat transcript, with no strips or menu', () => {
    const headless = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!
    renderBody(<TranscriptBody detail={headless.detail} reveal={{ nonce: 0, exchange: -1 }} />)
    expect(screen.queryByRole('button', { name: /Show details/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Details/ })).not.toBeInTheDocument()
    expect(screen.queryByTestId('exchange-0')).not.toBeInTheDocument()
    expect(screen.getByText(/Delegation token verified/)).toBeInTheDocument()
  })
})
