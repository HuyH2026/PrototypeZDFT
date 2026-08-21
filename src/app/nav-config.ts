import {
  HomeIcon, InsightsIcon, AiAgentsIcon, ExperimentsIcon, SettingsIcon, OrganizationIcon,
} from '@/components/nav-icons'
import type { NavItem } from '@/types'

// The five main sections, then Agent Setup below the divider — the IA in Figma
// frame 1763-124603 ("Main Navigation"). The two groups are declared literally
// rather than sliced out of one list: the boundary is what the design specifies,
// so it should not be an index that has to be renumbered whenever an item moves.
//
// KnowledgeIcon, ToolsIcon, OrchestratorIcon, IntegrationsIcon, and LogIcon are
// no longer imported here — the sections they belonged to are now children of the
// five primary destinations. Those icons remain exported from nav-icons.tsx for
// future use when those child screens are built out.
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: HomeIcon, submenu: [] },
  {
    label: 'Insights',
    path: '/insights',
    icon: InsightsIcon,
    // Exactly the frame's three. Topics is where the built CX Journey screen
    // lives — it used to be appended as a fourth entry, which duplicated the
    // Topics tab inside that very screen.
    submenu: ['Agent Overview', 'Topics', 'Automations'],
    // Display-only grouping ported from the ft-unify prototype's Optimize
    // pages column (v1/index.html, NAV.analyse.groups): Agent Overview stays
    // ungrouped up top; Topics and Automations sit under a "Discover" divider.
    // Automations is relabeled "Automation opportunities" for display only —
    // its route is still the kebab of the routingKey ("Automations"), unchanged.
    submenuGroups: [
      { label: null, items: [{ display: 'Agent Overview', routingKey: 'Agent Overview' }] },
      {
        label: 'Discover',
        items: [
          { display: 'Topics', routingKey: 'Topics' },
          { display: 'Automation opportunities', routingKey: 'Automations' },
        ],
      },
    ],
  },
  {
    label: 'Agent Builder',
    path: '/agent-builder',
    icon: AiAgentsIcon,
    submenu: ['Use cases', 'Knowledge', 'Actions', 'AI QA', 'Configuration'],
  },
  {
    label: 'Experiment',
    path: '/experiment',
    icon: ExperimentsIcon,
    // Frame order, and the section lands on the first of them — see the index
    // redirect in routes.tsx.
    submenu: ['Test Suite', 'Simulation', 'A/B Test'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    submenu: ['Integrations', 'Security', 'Logs'],
  },
]

export const SECONDARY_NAV: NavItem[] = [
  {
    label: 'Agent Directory',
    path: '/agent-setup',
    icon: OrganizationIcon,
    submenu: [],
  },
]

export const NAV_ITEMS: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]

export function findNavItemByPath(pathname: string): NavItem | undefined {
  const exact = NAV_ITEMS.find((i) => i.path === pathname)
  if (exact) return exact
  // Longest non-root path that prefixes the pathname (handles nested routes).
  return NAV_ITEMS
    .filter((i) => i.path !== '/' && pathname.startsWith(i.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0]
}
