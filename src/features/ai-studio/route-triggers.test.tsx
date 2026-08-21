import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { AiAssistantHost } from '@/features/ai-studio/AiAssistantHost'
import { BrandProvider } from '@/app/brand-context'
import { AbTestView } from '@/features/experiments/AbTestView'
import { CxJourneyView } from '@/features/insights/cx-journey/CxJourneyView'
import { AutomationsScreen } from '@/features/insights/automations/AutomationsScreen'
import { AiPerformancesView } from '@/features/insights/AiPerformancesView'
import { ToolsScreen } from '@/features/tools/ToolsScreen'
import { LogScreen } from '@/features/log/LogScreen'
import { ConfigurationView } from '@/features/ai-agents/configuration/ConfigurationView'
import { AgentBuilderScreen } from '@/features/ai-agents/AgentBuilderScreen'
import { AgentQaView } from '@/features/ai-agents/qa/AgentQaView'

function renderAt(path: string, element: React.ReactNode) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <BrandProvider>
        <AiAssistantProvider>
          <Routes>
            <Route path={path} element={element} />
          </Routes>
          <AiAssistantHost />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

const CASES: Array<[string, React.ReactNode, string | RegExp]> = [
  ['/experiment/ab-test', <AbTestView />, /A\/B tests/i],
  ['/insights/topics', <CxJourneyView />, /customer journey/i],
  ['/insights/agent-overview', <AiPerformancesView />, /interpret AI performance/i],
  ['/insights/automations', <AutomationsScreen />, /orchestrate automations/i],
  ['/agent-builder/actions', <ToolsScreen />, /build and connect tools/i],
  ['/settings/logs', <LogScreen />, /investigate the logs/i],
  ['/agent-builder/configuration', <ConfigurationView />, /configure this channel/i],
  ['/agent-builder/use-cases', <AgentBuilderScreen />, /build and manage agents/i],
  ['/agent-builder/ai-qa', <AgentQaView />, /QA your agents/i],
]

// Use cases carries a second trigger — the full-screen create-agent flow
// (scope='build-agent', mode='full') — which is covered in
// AgentBuilderScreen.test.tsx and ManageAgentsScreen.test.tsx. The case above is
// the route-derived page assistant, which it also still has.

describe('per-screen header AI triggers (route-derived scope)', () => {
  it.each(CASES)('opens the scoped assistant from %s header', async (path, element, greetingMatch) => {
    renderAt(path, element)
    expect(screen.queryByTestId('ai-studio-panel')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ask AI about this page' }))
    expect(screen.getByTestId('ai-studio-panel')).toBeInTheDocument()
    expect(screen.getByText(greetingMatch)).toBeInTheDocument()
  })
})
