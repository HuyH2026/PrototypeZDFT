import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const utils = render(<RouterProvider router={router} />)
  return { ...utils, router }
}

// Every URL the app has shipped keeps working. A missed internal link would
// otherwise 404 in a build where the nav no longer names the old path.
describe('legacy redirects', () => {
  it.each([
    ['/ai-agents', '/agent-builder/use-cases'],
    ['/ai-agents/agent-builder', '/agent-builder/use-cases'],
    ['/ai-agents/configuration', '/agent-builder/configuration'],
    ['/ai-agents/qa', '/agent-builder/ai-qa'],
    ['/insights/ai-performances', '/insights/agent-overview'],
    ['/tools', '/agent-builder/actions'],
    ['/orchestrator', '/insights/automations'],
    ['/experiments', '/experiment/test-suite'],
    ['/experiments/ab-test', '/experiment/ab-test'],
    ['/experiments/simulations', '/experiment/simulation'],
    ['/experiments/new', '/experiment/new'],
    ['/log', '/settings/logs'],
    ['/knowledge', '/agent-builder/knowledge'],
    ['/integrations', '/settings/integrations'],
    ['/organization', '/agent-setup'],
    ['/organization/new', '/agent-setup/new'],
  ])('redirects %s → %s', (from, to) => {
    const { router } = renderAt(from)
    expect(router.state.location.pathname).toBe(to)
  })

  // The splat cases: a deep link keeps its param, so a bookmarked detail page
  // still opens the record it named.
  it('preserves the param on a tool detail deep link', () => {
    const { router } = renderAt('/tools/t1')
    expect(router.state.location.pathname).toBe('/agent-builder/actions/t1')
    expect(screen.getByTestId('screen-tool-detail')).toBeInTheDocument()
  })

  it('preserves the param on an automation detail deep link', () => {
    const { router } = renderAt('/orchestrator/a2')
    expect(router.state.location.pathname).toBe('/insights/automations/a2')
    expect(screen.getByTestId('screen-automation-detail')).toBeInTheDocument()
  })

  it('preserves the param on an agent editor deep link', () => {
    const { router } = renderAt('/ai-agents/w3')
    expect(router.state.location.pathname).toBe('/agent-builder/w3')
  })

  // /ai-agents/qa is not a clean prefix swap — under the /ai-agents/* splat it
  // would land on /agent-builder/qa, which no route serves.
  it('routes /ai-agents/qa around the splat to its renamed path', () => {
    const { router } = renderAt('/ai-agents/qa')
    expect(router.state.location.pathname).toBe('/agent-builder/ai-qa')
    expect(screen.getByTestId('view-agent-qa')).toBeInTheDocument()
  })

  // A redirected section index must not itself redirect again — /experiments
  // lands on /experiment/test-suite in one hop, not via /experiment. It names
  // the same child as /experiment's own index, so the legacy alias and the
  // section root cannot drift apart.
  it('lands a redirected section on its built child, not its bare path', () => {
    const { router } = renderAt('/experiments')
    expect(router.state.location.pathname).toBe('/experiment/test-suite')
    expect(screen.getByTestId('view-test-suite')).toBeInTheDocument()
  })

  // Query string and hash preservation: bookmarked URLs with params must keep
  // their state across the redirect. /experiments/new?id=e2 is the app's only
  // real query-param use case — the setup screen seeds from it.
  it('preserves query string on a static redirect', () => {
    const { router } = renderAt('/experiments/new?id=e2')
    expect(router.state.location.pathname).toBe('/experiment/new')
    expect(router.state.location.search).toBe('?id=e2')
    expect(screen.getByTestId('screen-experiment-setup')).toBeInTheDocument()
  })

  it('preserves query string on a splat redirect', () => {
    const { router } = renderAt('/tools/t1?ref=nav')
    expect(router.state.location.pathname).toBe('/agent-builder/actions/t1')
    expect(router.state.location.search).toBe('?ref=nav')
  })

  it('preserves hash on a static redirect', () => {
    const { router } = renderAt('/log#filters')
    expect(router.state.location.pathname).toBe('/settings/logs')
    expect(router.state.location.hash).toBe('#filters')
  })
})
