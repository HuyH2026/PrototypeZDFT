import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { PolicyEditor } from './PolicyEditor'
import type { PolicyDoc } from '../agent-store'

const doc: PolicyDoc = {
  title: 'Autoflow policy',
  segments: [
    { kind: 'prose', id: 'p1', text: 'Reveal ' },
    { kind: 'chip', id: 'c1', variant: 'form', label: 'Survey' },
    { kind: 'prose', id: 'p2', text: ' to identify.' },
  ],
}

function renderEditor(onChange = vi.fn()) {
  render(
    <DndProvider backend={HTML5Backend}>
      <PolicyEditor doc={doc} onChange={onChange} />
    </DndProvider>,
  )
  return onChange
}

// Simulates typing by writing the live DOM text directly and pointing a real
// Range at its end, then firing the same `input` event a keystroke would —
// PolicyEditor reads the caret via Range/Selection, not React state, so this
// mirrors what the browser hands it without needing a full contentEditable
// typing simulation (unsupported in jsdom).
function typeInto(span: HTMLElement, text: string) {
  span.textContent = text
  const range = document.createRange()
  range.setStart(span.firstChild as Text, text.length)
  range.collapse(true)
  // jsdom's Range has no layout, so getBoundingClientRect isn't implemented —
  // stub it directly on the real range rather than faking the whole object,
  // so the offset math (cloneRange/selectNodeContents/setEnd/toString) stays
  // the genuine, spec-compliant behavior PolicyEditor relies on.
  Object.assign(range, { getBoundingClientRect: () => new DOMRect(0, 0, 0, 0) })
  vi.spyOn(window, 'getSelection').mockReturnValue({
    rangeCount: 1,
    getRangeAt: () => range,
  } as unknown as Selection)
  fireEvent.input(span)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PolicyEditor', () => {
  it('renders the policy title and chips', () => {
    renderEditor()
    expect(screen.getByText('Autoflow policy')).toBeInTheDocument()
    expect(screen.getByText('Survey')).toBeInTheDocument()
  })

  it('renders chips as plain tokens, with no remove control', () => {
    renderEditor()
    // The design's inline chips are icon + label only (Figma 1886:75770 and
    // siblings) — they carry no delete affordance.
    expect(screen.queryByRole('button', { name: 'Remove Survey' })).not.toBeInTheDocument()
  })

  it('renders the formatting toolbar', () => {
    renderEditor()
    expect(screen.getByRole('button', { name: 'Insert' })).toBeInTheDocument()
  })
})

describe('PolicyEditor — slash menu', () => {
  it('opens the menu when "/" is typed in a prose segment', () => {
    renderEditor()
    typeInto(screen.getByTestId('policy-prose-p1'), 'Reveal /')
    expect(screen.getByRole('menu', { name: 'Insert into policy' })).toBeInTheDocument()
  })

  it('inserts the chosen chip in place of the slash, splitting the prose around it', async () => {
    const onChange = renderEditor()
    typeInto(screen.getByTestId('policy-prose-p1'), 'Reveal /')

    await userEvent.click(screen.getByRole('menuitem', { name: 'Action' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const next = onChange.mock.calls[0][0] as PolicyDoc
    expect(next.segments[0]).toMatchObject({ kind: 'prose', text: 'Reveal ' })
    expect(next.segments[1]).toMatchObject({ kind: 'chip', variant: 'action', label: 'Action' })
    expect(next.segments[2]).toMatchObject({ kind: 'chip', id: 'c1' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes on Escape without touching the doc, leaving the slash as typed text', async () => {
    const onChange = renderEditor()
    typeInto(screen.getByTestId('policy-prose-p1'), 'Reveal /')

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes if the user keeps typing past the slash', () => {
    renderEditor()
    const span = screen.getByTestId('policy-prose-p1')
    typeInto(span, 'Reveal /')
    expect(screen.getByRole('menu')).toBeInTheDocument()

    typeInto(span, 'Reveal /a')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
