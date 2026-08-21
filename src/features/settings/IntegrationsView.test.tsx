import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { IntegrationsView } from './IntegrationsView'
import { CONNECTIONS, INDEXED_DOCUMENTS } from './integrations-data'
import { AVAILABLE_INTEGRATIONS } from './collections-data'

function renderView(path = '/settings/integrations') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AiAssistantProvider>
        <IntegrationsView />
      </AiAssistantProvider>
    </MemoryRouter>,
  )
  return within(screen.getByTestId('screen-integrations'))
}

describe('IntegrationsView', () => {
  it('opens on the Connections tab', () => {
    const view = renderView()
    expect(view.getByRole('tab', { name: 'Connections' })).toHaveAttribute('aria-selected', 'true')
    expect(view.getByRole('tab', { name: 'Document index' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('opens directly on Collections from its URL', () => {
    const view = renderView('/settings/integrations?tab=collections')

    expect(view.getByRole('tab', { name: 'Collections' })).toHaveAttribute('aria-selected', 'true')
    expect(view.getByRole('heading', { name: 'Available' })).toBeInTheDocument()
    expect(view.queryByTestId('connection-row-salesforce')).not.toBeInTheDocument()
  })

  it('lists every connection with its sync text and status', () => {
    const view = renderView()
    expect(view.getByRole('table', { name: 'Connections' })).toBeInTheDocument()
    expect(view.getByRole('columnheader', { name: 'Display Name' })).toHaveClass('px-3.5', 'py-3.5')
    expect(CONNECTIONS.map((connection) => connection.id)).toEqual([
      'amazon-s3',
      'mcp-shopify',
      'shopify',
      'jira',
      'sunshine-conversations',
      'salesforce',
    ])
    CONNECTIONS.forEach((c) => {
      const row = view.getByTestId(`connection-row-${c.id}`)
      expect(within(row).getByText(c.name)).toBeInTheDocument()
      expect(within(row).getByText(c.lastSync)).toBeInTheDocument()
      expect(within(row).getByText(c.status)).toBeInTheDocument()
    })
  })

  // "Not used" is the one row that differs; a regression that hardcoded the
  // status would otherwise pass on the seven "In use" rows.
  it('shows the unreferenced connection as Not used', () => {
    const view = renderView()
    const row = view.getByTestId('connection-row-salesforce')
    expect(within(row).getByText('Not used')).toBeInTheDocument()
  })

  it('selects a row on click and deselects it on a second click', async () => {
    const view = renderView()
    const row = view.getByTestId('connection-row-jira')
    expect(row).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(row)
    expect(row).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches to the Collections catalogue, which shows no connections', async () => {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Collections' }))

    expect(view.getByRole('heading', { name: 'Available' })).toBeInTheDocument()
    expect(view.queryByTestId('connection-row-salesforce')).not.toBeInTheDocument()
  })
})

describe('IntegrationsView — Collections tab', () => {
  async function openCollections() {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Collections' }))
    return view
  }

  it('offers the inert catalogue search above the Available section', async () => {
    const view = await openCollections()
    expect(view.getByLabelText('Search available integrations')).toBeInTheDocument()
    expect(view.getByRole('heading', { name: 'Available' })).toBeInTheDocument()
  })

  it('renders a card per available integration, name and description intact', async () => {
    const view = await openCollections()
    expect(view.getAllByTestId(/^collection-card-/)).toHaveLength(AVAILABLE_INTEGRATIONS.length)

    AVAILABLE_INTEGRATIONS.forEach((i) => {
      const card = view.getByTestId(`collection-card-${i.id}`)
      expect(within(card).getByRole('heading', { name: i.name })).toBeInTheDocument()
      expect(within(card).getByText(i.description)).toBeInTheDocument()
    })
  })

  // The visible label is identical on every card, so each connect action is
  // named after its vendor — otherwise none of them is addressable.
  it('gives every card a vendor-named Connect action', async () => {
    const view = await openCollections()
    expect(view.getByRole('button', { name: 'Connect Intercom' })).toBeInTheDocument()
    expect(view.getAllByText('Connect Integration')).toHaveLength(AVAILABLE_INTEGRATIONS.length)
  })

  it('keeps the catalogue in the design’s order', async () => {
    const view = await openCollections()
    const ids = view.getAllByTestId(/^collection-card-/).map((el) => el.getAttribute('data-testid'))
    expect(ids).toEqual([
      'collection-card-absorb-lms',
      'collection-card-airtable',
      'collection-card-amazon-connect',
      'collection-card-canny',
      'collection-card-confluence',
      'collection-card-freshdesk',
      'collection-card-google-drive',
      'collection-card-intercom',
    ])
  })

  it('returns to Connections when that tab is reselected', async () => {
    const view = await openCollections()
    await userEvent.click(view.getByRole('tab', { name: 'Connections' }))

    expect(view.getByTestId('connection-row-salesforce')).toBeInTheDocument()
    expect(view.queryByTestId('collection-card-airtable')).not.toBeInTheDocument()
  })
})

describe('IntegrationsView — Document index tab', () => {
  async function openDocumentIndex() {
    const view = renderView()
    await userEvent.click(view.getByRole('tab', { name: 'Document index' }))
    return view
  }

  it('swaps the Connections body for the document list', async () => {
    const view = await openDocumentIndex()
    expect(view.getByLabelText('Search documents')).toBeInTheDocument()
    expect(view.queryByTestId('connection-row-salesforce')).not.toBeInTheDocument()
  })

  it('lists every indexed document with its columns', async () => {
    const view = await openDocumentIndex()
    expect(view.getByRole('table', { name: 'Document index' })).toBeInTheDocument()
    expect(view.getByRole('columnheader', { name: 'Source ID' })).toBeInTheDocument()
    INDEXED_DOCUMENTS.forEach((d) => {
      const row = view.getByTestId(`document-row-${d.id}`)
      expect(within(row).getByText(d.title)).toBeInTheDocument()
      expect(within(row).getByText(d.integration)).toBeInTheDocument()
      expect(within(row).getByText(d.sourceType)).toBeInTheDocument()
      expect(within(row).getByText(d.status)).toBeInTheDocument()
      expect(within(row).getByText(d.lastEdit)).toBeInTheDocument()
      // Long vendor ids are shown verbatim, not elided.
      expect(within(row).getByText(d.sourceId)).toBeInTheDocument()
    })
  })

  it('keeps the rows in last-edit-descending order, matching the sorted header', async () => {
    const view = await openDocumentIndex()
    const ids = view.getAllByTestId(/^document-row-/).map((el) => el.getAttribute('data-testid'))
    expect(ids).toEqual(INDEXED_DOCUMENTS.map((d) => `document-row-${d.id}`))
  })

  it('offers the filter controls, all inert', async () => {
    const view = await openDocumentIndex()
    expect(view.getByLabelText('Search documents')).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Select integration' })).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Choose columns' })).toBeInTheDocument()
  })

  it('returns to Connections when that tab is reselected', async () => {
    const view = await openDocumentIndex()
    await userEvent.click(view.getByRole('tab', { name: 'Connections' }))

    expect(view.getByTestId('connection-row-salesforce')).toBeInTheDocument()
    expect(view.queryByTestId('document-row-d1')).not.toBeInTheDocument()
  })
})
