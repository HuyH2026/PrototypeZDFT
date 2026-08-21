import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'
import { RootLayout } from '@/app/layout/RootLayout'
import { AppLayout } from '@/app/layout/AppLayout'
import { LegacyRedirect, RedirectWithParams } from '@/app/legacy-redirects'
import { HomeScreen } from '@/features/home/HomeScreen'
import { OpportunityDetailScreen } from '@/features/home/OpportunityDetailScreen'
import { InsightsScreen } from '@/features/insights/InsightsScreen'
import { AiPerformancesView } from '@/features/insights/AiPerformancesView'
import { CxJourneyView } from '@/features/insights/cx-journey/CxJourneyView'
import { AiAgentsScreen } from '@/features/ai-agents/AiAgentsScreen'
import { AgentBuilderScreen } from '@/features/ai-agents/AgentBuilderScreen'
import { ConfigurationView } from '@/features/ai-agents/configuration/ConfigurationView'
import { AgentEditorScreen } from '@/features/ai-agents/editor/AgentEditorScreen'
import { ManageAgentsScreen } from '@/features/manage-agents/ManageAgentsScreen'
import { CreateAgentFlow } from '@/features/manage-agents/CreateAgentFlow'
import { EditAgentFlow } from '@/features/manage-agents/EditAgentFlow'
import { AutomationsScreen } from '@/features/insights/automations/AutomationsScreen'
import { AutomationDetailScreen } from '@/features/orchestrator/AutomationDetailScreen'
import { ToolsScreen } from '@/features/tools/ToolsScreen'
import { ToolDetailScreen } from '@/features/tools/ToolDetailScreen'
import { LogScreen } from '@/features/log/LogScreen'
import { ExperimentsScreen } from '@/features/experiments/ExperimentsScreen'
import { AbTestView } from '@/features/experiments/AbTestView'
import { TestSuiteView } from '@/features/experiments/test-suite/TestSuiteView'
import { SimulationView } from '@/features/experiments/simulation/SimulationView'
import { ExperimentSetupScreen } from '@/features/experiments/setup/ExperimentSetupScreen'
import { AgentQaView } from '@/features/ai-agents/qa/AgentQaView'
import { KnowledgeView } from '@/features/ai-agents/knowledge/KnowledgeView'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { IntegrationsView } from '@/features/settings/IntegrationsView'
import { SecurityView } from '@/features/settings/SecurityView'
import { PipelineScreen } from '@/features/agent-pipeline/PipelineScreen'

// Pre-consolidation URLs, kept working. Static sub-paths (ai-agents/qa,
// experiments/new) are mounted as individual routes; index and splat redirects
// are nested so the index doesn't shadow the splat.
//
// Old → New mappings:
//   /ai-agents → /agent-builder/use-cases
//   /ai-agents/agent-builder → /agent-builder/use-cases
//   /ai-agents/configuration → /agent-builder/configuration
//   /ai-agents/qa → /agent-builder/ai-qa
//   /ai-agents/* → /agent-builder/*
//   /insights/ai-performances → /insights/agent-overview
//   /insights/cx-journey → /insights/topics
//   /tools → /agent-builder/actions
//   /tools/* → /agent-builder/actions/*
//   /orchestrator → /insights/automations
//   /orchestrator/* → /insights/automations/*
//   /experiments → /experiment/test-suite
//   /experiments/ab-test → /experiment/ab-test
//   /experiments/simulations → /experiment/simulation
//   /experiments/new → /experiment/new
//   /experiments/* → /experiment/*
//   /log → /settings/logs
//   /knowledge → /agent-builder/knowledge
//   /integrations → /settings/integrations
//   /organization → /agent-setup
//   /organization/new → /agent-setup/new (mounted outside AppLayout)
const legacyRoutes: RouteObject[] = [
  // Static redirects that must override their parent's splat:
  // - ai-agents/agent-builder: would go to /agent-builder/agent-builder, not /use-cases
  // - ai-agents/qa: would go to /agent-builder/qa, which no route serves (real path is ai-qa)
  // - insights/ai-performances: would go to /insights/ai-performances, real is /agent-overview
  // - experiments/simulations: would go to /experiment/simulations, real is /simulation (singular)
  // Top-level redirects (log, knowledge, integrations, organization) are mounted here
  // so they rank above any future catch-all.
  //
  // insights/cx-journey is not pre-consolidation — the screen moved into Topics
  // after the fact — but it is the same kind of debt, so it lives with its peers.
  { path: 'ai-agents/agent-builder', element: <RedirectWithParams to="/agent-builder/use-cases" /> },
  { path: 'ai-agents/qa', element: <RedirectWithParams to="/agent-builder/ai-qa" /> },
  { path: 'insights/ai-performances', element: <RedirectWithParams to="/insights/agent-overview" /> },
  { path: 'insights/cx-journey', element: <RedirectWithParams to="/insights/topics" /> },
  { path: 'experiments/simulations', element: <RedirectWithParams to="/experiment/simulation" /> },
  { path: 'log', element: <RedirectWithParams to="/settings/logs" /> },
  { path: 'knowledge', element: <RedirectWithParams to="/agent-builder/knowledge" /> },
  { path: 'integrations', element: <RedirectWithParams to="/settings/integrations" /> },
  { path: 'organization', element: <RedirectWithParams to="/agent-setup" /> },
  // Index + splat pairs: the index child makes the parent route exact, so the
  // splat sibling can see deep links. Indexes use RedirectWithParams; splats
  // use LegacyRedirect (which already preserves query+hash).
  {
    path: 'ai-agents',
    children: [
      { index: true, element: <RedirectWithParams to="/agent-builder/use-cases" /> },
      { path: '*', element: <LegacyRedirect to="/agent-builder" /> },
    ],
  },
  {
    path: 'tools',
    children: [
      { index: true, element: <RedirectWithParams to="/agent-builder/actions" /> },
      { path: '*', element: <LegacyRedirect to="/agent-builder/actions" /> },
    ],
  },
  {
    path: 'orchestrator',
    children: [
      { index: true, element: <RedirectWithParams to="/insights/automations" /> },
      { path: '*', element: <LegacyRedirect to="/insights/automations" /> },
    ],
  },
  {
    path: 'experiments',
    children: [
      // Names the same child as /experiment's own index — a redirected section
      // index must land on a built child in one hop rather than bouncing through
      // the bare parent, so the two have to be kept in step.
      { index: true, element: <RedirectWithParams to="/experiment/test-suite" /> },
      { path: '*', element: <LegacyRedirect to="/experiment" /> },
    ],
  },
]

// Every nav destination now has a real screen — nothing is derived from
// NAV_ITEMS, and no route renders PlaceholderScreen any more (the component
// stays for the next unbuilt destination). NAV_ITEMS is still the single source
// of truth for the nav itself.
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeScreen /> },
          {
            path: 'insights',
            element: <InsightsScreen />,
            children: [
              { index: true, element: <Navigate to="agent-overview" replace /> },
              { path: 'agent-overview', element: <AiPerformancesView /> },
              { path: 'topics', element: <CxJourneyView /> },
              { path: 'automations', element: <AutomationsScreen /> },
            ],
          },
          // Sibling of the insights children, not nested: the detail screen is a
          // full-surface takeover, and nesting it inside the section shell would
          // put it in the shell's white card.
          { path: 'insights/automations/:id', element: <AutomationDetailScreen /> },
          {
            path: 'agent-builder',
            element: <AiAgentsScreen />,
            children: [
              { index: true, element: <Navigate to="use-cases" replace /> },
              { path: 'use-cases', element: <AgentBuilderScreen /> },
              { path: 'knowledge', element: <KnowledgeView /> },
              { path: 'actions', element: <ToolsScreen /> },
              { path: 'ai-qa', element: <AgentQaView /> },
              { path: 'configuration', element: <ConfigurationView /> },
              // Dynamic sibling of the five static children above. React Router
              // ranks static segments higher, so `use-cases` etc. still win.
              { path: ':agentId', element: <AgentEditorScreen /> },
            ],
          },
          { path: 'agent-builder/actions/:id', element: <ToolDetailScreen /> },
          {
            path: 'experiment',
            element: <ExperimentsScreen />,
            children: [
              // Test Suite: the frame's first child, and the first row of the
              // subnav. The section used to open on A/B Test instead, because
              // Test Suite was unbuilt and landing there would have shown
              // "Coming soon" — a reason that expired when it was built.
              { index: true, element: <Navigate to="test-suite" replace /> },
              { path: 'test-suite', element: <TestSuiteView /> },
              { path: 'simulation', element: <SimulationView /> },
              { path: 'ab-test', element: <AbTestView /> },
            ],
          },
          { path: 'experiment/new', element: <ExperimentSetupScreen /> },
          {
            path: 'settings',
            element: <SettingsScreen />,
            children: [
              { index: true, element: <Navigate to="integrations" replace /> },
              { path: 'integrations', element: <IntegrationsView /> },
              { path: 'security', element: <SecurityView /> },
              { path: 'logs', element: <LogScreen /> },
            ],
          },
          // Not a nav destination: an evaluation screen for the outer loop, in
          // the chrome but not in the rail (agent-pipeline spec, Decision 10).
          { path: 'agent-pipeline', element: <PipelineScreen /> },
          // The create and edit flows are *children* of the roster, not siblings:
          // each renders as a layer over the app (frame 1833:90142), so Manage
          // agents stays mounted beneath and closing reveals it untouched.
          // `:agentId` is the dynamic sibling of the static `new`, which React
          // Router still ranks first — same arrangement as /agent-builder.
          {
            path: 'agent-setup',
            element: <ManageAgentsScreen />,
            children: [
              { path: 'new', element: <CreateAgentFlow /> },
              { path: ':agentId', element: <EditAgentFlow /> },
            ],
          },
          { path: 'opportunity/:id', element: <OpportunityDetailScreen /> },
          ...legacyRoutes,
        ],
      },
      { path: '/organization/new', element: <RedirectWithParams to="/agent-setup/new" /> },
    ],
  },
]
