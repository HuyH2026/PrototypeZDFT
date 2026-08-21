import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AgentQaView } from './AgentQaView'
import { RUBRICS } from './rubrics-data'

function renderView() {
  render(
    <MemoryRouter initialEntries={['/agent-builder/ai-qa']}>
      <AiAssistantProvider>
        <AgentQaView />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return within(screen.getByTestId('view-agent-qa'))
}

describe('AgentQaView', () => {
  it('titles the screen and explains what a rubric scores', () => {
    const view = renderView()
    expect(view.getByRole('heading', { level: 1, name: 'AI QA' })).toBeInTheDocument()
    expect(
      view.getByText(/Score your AI's conversations against the criteria that matter/),
    ).toBeInTheDocument()
  })

  it('labels the three columns, counting the rubrics on show', () => {
    const view = renderView()
    expect(view.getByText(`Name (${RUBRICS.length})`)).toBeInTheDocument()
    expect(view.getByText('Channels and Segment')).toBeInTheDocument()
    expect(view.getByText('Definition')).toBeInTheDocument()
  })

  it('keeps the column header and rubrics in one continuous table shell', () => {
    const view = renderView()

    const table = view.getByRole('region', { name: 'AI QA rubrics' })
    expect(table).toHaveClass('bg-table-header-bg')
    expect(within(table).getByText(`Name (${RUBRICS.length})`)).toBeInTheDocument()

    const body = within(table).getByTestId('card-list-table-body')
    expect(body).toHaveClass('bg-white')
    expect(within(body).getAllByTestId(/^rubric-card-/)).toHaveLength(RUBRICS.length)
  })

  it('lists every rubric in the design’s order', () => {
    const view = renderView()
    const ids = view.getAllByTestId(/^rubric-card-/).map((el) => el.getAttribute('data-testid'))
    expect(ids).toEqual(RUBRICS.map((r) => `rubric-card-${r.id}`))
  })

  it('offers the toolbar actions', () => {
    const view = renderView()
    expect(view.getByRole('button', { name: 'Test' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Create new' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Ask AI about this page' })).toBeInTheDocument()
  })

  it('opens the designed create workspace with populated mock test results', async () => {
    const view = renderView()
    const user = userEvent.setup()

    await user.click(view.getByRole('button', { name: 'Create new' }))

    const editor = within(screen.getByTestId('rubric-editor'))
    expect(editor.getByRole('heading', { level: 1, name: 'Create rubric' })).toBeInTheDocument()
    expect(editor.getByLabelText('Rubric name')).toHaveValue('Resolution completeness')
    expect(editor.getByRole('heading', { name: 'Test conversation' })).toBeInTheDocument()
    expect(editor.getAllByText('Prediction reasoning')).toHaveLength(10)
  })

  it('saves a new mock rubric into the library', async () => {
    const view = renderView()
    const user = userEvent.setup()

    await user.click(view.getByRole('button', { name: 'Create new' }))
    const editor = within(screen.getByTestId('rubric-editor'))
    await user.clear(editor.getByLabelText('Rubric name'))
    await user.type(editor.getByLabelText('Rubric name'), 'Refund policy accuracy')
    await user.click(editor.getByRole('button', { name: 'Save' }))

    const library = within(screen.getByTestId('view-agent-qa'))
    expect(library.getByText(`Name (${RUBRICS.length + 1})`)).toBeInTheDocument()
    expect(library.getByRole('heading', { name: 'Refund policy accuracy' })).toBeInTheDocument()
  })

  it('opens existing rubric items with their mock configuration', async () => {
    const view = renderView()
    const user = userEvent.setup()

    await user.click(view.getByRole('button', { name: 'Edit Empathy' }))

    const editor = within(screen.getByTestId('rubric-editor'))
    expect(editor.getByRole('heading', { level: 1, name: 'Empathy' })).toBeInTheDocument()
    expect(editor.getByLabelText('Rubric name')).toHaveValue('Empathy')
    expect(editor.getByRole('group', { name: 'Selected channels' })).toHaveTextContent(
      'WidgetEmailVoice',
    )
  })

  it('filters the list by rubric name and re-counts the header', async () => {
    const view = renderView()
    await userEvent.type(view.getByRole('searchbox', { name: /rubric/i }), 'empathy')

    expect(view.getAllByTestId(/^rubric-card-/)).toHaveLength(1)
    expect(view.getByTestId('rubric-card-empathy')).toBeInTheDocument()
    expect(view.getByText('Name (1)')).toBeInTheDocument()
  })

  it('says so when nothing matches the search', async () => {
    const view = renderView()
    await userEvent.type(view.getByRole('searchbox', { name: /rubric/i }), 'nothing here')

    expect(view.queryAllByTestId(/^rubric-card-/)).toHaveLength(0)
    expect(view.getByText(/No rubrics match/)).toBeInTheDocument()
  })
})
