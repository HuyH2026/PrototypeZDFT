import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NAV_ITEMS } from '@/app/nav-config'
import { SubnavPanel } from './SubnavPanel'

const insights = NAV_ITEMS.find((i) => i.label === 'Insights')!
const agentBuilder = NAV_ITEMS.find((i) => i.label === 'Agent Builder')!
const experiment = NAV_ITEMS.find((i) => i.label === 'Experiment')!

function renderAt(path: string, item = insights) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SubnavPanel item={item} />
    </MemoryRouter>,
  )
}

describe('SubnavPanel', () => {
  it('renders the section heading and a link per submenu entry', () => {
    renderAt('/insights/topics')
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /topics/i })).toHaveAttribute(
      'href',
      '/insights/topics',
    )
    expect(screen.getByRole('link', { name: /agent overview/i })).toHaveAttribute(
      'href',
      '/insights/agent-overview',
    )
    expect(screen.getByRole('link', { name: /automation opportunities/i })).toHaveAttribute(
      'href',
      '/insights/automations',
    )
  })

  it('groups Topics and Automation opportunities under a "Discover" divider, leaving Agent Overview ungrouped', () => {
    renderAt('/insights')
    expect(screen.getByText('Discover')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /automation opportunities/i }),
    ).toBeInTheDocument()
  })

  it('marks the entry matching the URL as current', () => {
    renderAt('/insights/agent-overview')
    expect(screen.getByRole('link', { name: /agent overview/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /topics/i })).not.toHaveAttribute('aria-current')
  })

  it('marks the first entry as current on the parent path, which the index route renders', () => {
    renderAt('/insights')
    expect(screen.getByRole('link', { name: /agent overview/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /topics/i })).not.toHaveAttribute('aria-current')
  })

  it('keeps Automations current on its nested detail route', () => {
    renderAt('/insights/automations/some-automation-id')
    expect(screen.getByRole('link', { name: /automation opportunities/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('keeps Use cases current on the agent editor, a sibling route', () => {
    renderAt('/agent-builder/some-agent-id', agentBuilder)
    expect(screen.getByRole('link', { name: /use cases/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /^knowledge$/i })).not.toHaveAttribute('aria-current')
  })

  it('keeps Actions current on its nested detail route', () => {
    renderAt('/agent-builder/actions/t1', agentBuilder)
    expect(screen.getByRole('link', { name: /actions/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /use cases/i })).not.toHaveAttribute('aria-current')
  })

  it('does not mistake the Knowledge or Configuration tab paths for the agent editor', () => {
    renderAt('/agent-builder/knowledge', agentBuilder)
    expect(screen.getByRole('link', { name: /^knowledge$/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /use cases/i })).not.toHaveAttribute('aria-current')
  })

  it('keeps A/B Test current on the experiment setup flow, a sibling route', () => {
    renderAt('/experiment/new', experiment)
    expect(screen.getByRole('link', { name: /a\/b test/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /test suite/i })).not.toHaveAttribute('aria-current')
  })
})
