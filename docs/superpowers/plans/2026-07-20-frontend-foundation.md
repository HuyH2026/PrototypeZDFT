# Front-End Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Figma Make prototype into a clean, robust, responsive front-end foundation for the FT Unification console — same look and navigation, no Figma Make cruft.

**Architecture:** Greenfield scaffold inside the same git repo. Build a clean `src/` tree with real `react-router` routing driven by a single `nav-config` source of truth, a persistent `AppLayout` (fluid sidebar + top bar + `<Outlet/>`), and rebuilt semantic screens. Port visuals across, then delete the old generated world in one dedicated commit.

**Tech Stack:** React 18, Vite 6, TypeScript (strict), Tailwind v4 (`@tailwindcss/vite`), shadcn/ui + Radix, react-router 7, motion, lucide-react, recharts. Tooling: ESLint (flat config) + Prettier, Vitest + React Testing Library + jsdom. Package manager: pnpm.

## Global Constraints

- **No Figma Make references** anywhere in shipped code, config, comments, package name, or docs by the end of the plan.
- **Package name:** `ft-unification` (replaces `@figma/my-make-file`).
- **Look-and-feel preserved:** existing navigation and visual design; icons are visually-equivalent Lucide glyphs, not byte-identical.
- **Responsive range:** desktop-fluid, `min-width: 1024px`; no invented mobile/tablet states.
- **Layout model:** NO fixed 1440×920 canvas, NO `ScaledStage`, NO uniform transform-scale. Fluid flex/grid filling available width.
- **Fonts:** system SF stack (`-apple-system, system-ui, "SF Pro Text", "SF Pro Display", sans-serif`); no committed font files. Replace all `font-['SF_Pro_*']` arbitrary classes with a shared font (default body font).
- **Nav is URL-driven:** active state derives from the current route, never a `useState` string.
- **Single source of truth for nav:** `src/app/nav-config.ts` drives rail, flyover, expanded sidebar, and routes.
- **Keep the full `components/ui/` shadcn kit** and its Radix deps.
- **Prune (non-ui, confirmed unused):** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `react-slick`, `react-responsive-masonry`, `react-dnd`, `react-dnd-html5-backend`, `canvas-confetti`, `react-popper`, `@popperjs/core`.
- **TDD:** write the failing test first, watch it fail, implement minimally, watch it pass, commit. Commit after every task.
- **Old files are the visual reference** until Task 11 deletes them. When a task says "match the reference," open the cited old file for exact colors/spacing/text.

## Reference Map (old files → what to reproduce)

- Nav rail, flyover, expand toggle, org switcher, screen-switching logic: `src/app/App.tsx`
- Expanded sidebar: `src/app/components/expanded-sidebar.tsx`
- Organization dashboard: `src/app/components/organization-dashboard.tsx`
- Create-org flow: `src/app/components/create-org-flow.tsx`
- Channel metadata: `src/app/components/channel-meta.ts`
- Design tokens: `src/styles/theme.css`
- Home / Insights visuals (mostly shell + empty white content card): `src/imports/01HomeDefault/index.tsx`, `src/imports/02Insights/index.tsx`
- Nav labels, submenus, index→child math: `App.tsx` lines 68–99 (`navItems`, `hoverMenus`)

## Nav model (verbatim from App.tsx)

Nav items in order: `Home, Insights, AI Agents, Knowledge, Tools, Experiments, Orchestrator, Integrations, Log, Settings` then a separator, then `Organization`.

Submenus:
- Insights: `CX Journey`, `AI Performances`
- AI Agents: `Agent Builder`, `Configuration`, `QA`
- Knowledge: `Insights`, `Contents`, `Coaching`
- Experiments: `A/B Test`, `Test Suite`, `Simulations`
- Settings: `Account`, `Security`
- (Tools, Orchestrator, Integrations, Log, Organization: none)

Route paths (kebab-case): `/` (Home), `/insights`, `/ai-agents`, `/knowledge`, `/tools`, `/experiments`, `/orchestrator`, `/integrations`, `/log`, `/settings`, `/organization`.

---

## Task 1: Tooling scaffold

Set up TypeScript, ESLint, Prettier, Vitest, and a clean `package.json`. The app must still boot on the existing old code after this task (we haven't moved screens yet).

**Files:**
- Create: `tsconfig.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Modify: `package.json` (name, scripts, prune deps, add dev deps), `vite.config.ts` (remove Figma comment lines only — keep plugins)

**Interfaces:**
- Produces: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:watch`, `pnpm format`, `pnpm build`, `pnpm dev`, `pnpm preview` scripts.

- [ ] **Step 1: Install and add dev dependencies**

Run:
```bash
pnpm add -D typescript @types/react @types/react-dom vitest @vitest/ui jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh \
  prettier
```

- [ ] **Step 2: Prune unused non-ui dependencies**

Run:
```bash
pnpm remove @mui/material @mui/icons-material @emotion/react @emotion/styled \
  react-slick react-responsive-masonry react-dnd react-dnd-html5-backend \
  canvas-confetti react-popper @popperjs/core
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 5: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

Run `pnpm add -D globals` if not already present.

- [ ] **Step 6: Create `.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 7: Create `.prettierignore`**

```
dist
node_modules
pnpm-lock.yaml
src/imports
```

- [ ] **Step 8: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 9: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 10: Write the smoke test `src/test/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 11: Update `package.json` name and scripts**

Set `"name": "ft-unification"`. Replace the `scripts` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 12: Remove the "required for Make" comment from `vite.config.ts`**

Delete only the comment lines at `vite.config.ts:22-23` (`// The React and Tailwind plugins ...`). Keep both plugins. Do NOT remove `figmaAssetResolver` yet (old screens still import assets) — that happens in Task 11.

- [ ] **Step 13: Run the checks**

Run: `pnpm test && pnpm typecheck`
Expected: smoke test PASSES; typecheck passes (old `.tsx` compiles — if pre-existing errors surface, note them but do not fix old files that will be deleted; scope tsconfig `include` already limits to `src`).

Run: `pnpm dev` briefly to confirm the app still boots on old code, then stop it.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: scaffold TS/ESLint/Prettier/Vitest tooling and prune unused deps"
```

---

## Task 2: Styles and lib foundation

Consolidated design tokens, font stack, `cn` helper, ported channel metadata, shared types. No screens yet.

**Files:**
- Create: `src/styles/index.css`, `src/styles/theme.css`, `src/styles/fonts.css` (new clean versions — will replace old ones in Task 11; create under new names to avoid clobbering the running app? No — old app imports `src/styles/index.css`. To avoid breaking the boot, create these in a new dir.)
- Create: `src/lib/cn.ts`, `src/lib/channel-meta.ts`, `src/lib/channel-meta.test.ts`
- Create: `src/types/index.ts`

> **Note:** The old app imports `./styles/index.css`. To keep it booting, put the NEW foundation styles at `src/app-styles/` for now; Task 11 renames to `src/styles/` after the old app is deleted. Reference new styles from new components via `@/app-styles/index.css`.

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string`
- Produces: `channelMeta(label: string): { display: string; color: string; Icon: LucideIcon }` and `CHANNEL_META` record
- Produces: types `Org = { id: string; name: string; channels: string[] }`, `Channel = string`, `NavItem = { label: string; path: string; icon: LucideIcon; submenu: string[] }`

- [ ] **Step 1: Create `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Write failing test `src/lib/channel-meta.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { channelMeta } from './channel-meta'

describe('channelMeta', () => {
  it('maps a known channel to its display, color, and icon', () => {
    const meta = channelMeta('Web Widget')
    expect(meta.display).toBe('Widget')
    expect(meta.color).toBe('#e05c34')
    expect(meta.Icon).toBeDefined()
  })

  it('falls back for an unknown channel', () => {
    const meta = channelMeta('Carrier Pigeon')
    expect(meta.display).toBe('Carrier Pigeon')
    expect(meta.color).toBe('#646864')
    expect(meta.Icon).toBeDefined()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test src/lib/channel-meta.test.ts`
Expected: FAIL — cannot find module `./channel-meta`.

- [ ] **Step 4: Create `src/lib/channel-meta.ts`**

Port verbatim from `src/app/components/channel-meta.ts` (the `CHANNEL_META` record and `channelMeta` fallback function — see Reference Map). Keep the exact display names, colors, and Lucide icon imports.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test src/lib/channel-meta.test.ts`
Expected: PASS (both tests).

- [ ] **Step 6: Create `src/types/index.ts`**

```ts
import type { LucideIcon } from 'lucide-react'

export type Channel = string

export type Org = {
  id: string
  name: string
  channels: Channel[]
}

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
  submenu: string[]
}
```

- [ ] **Step 7: Create `src/app-styles/theme.css`**

Copy `src/styles/theme.css` verbatim, then add a font-family token in `:root`:

```css
  --font-sans: -apple-system, system-ui, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', sans-serif;
```

And in `@layer base` add:

```css
  body {
    font-family: var(--font-sans);
  }
```

Also add these product-specific tokens to `:root` (named replacements for the prototype's hardcoded hex):

```css
  --color-app-backdrop: #f1efed;
  --color-nav-active: #293239;
  --color-ink: #2f3130;
  --color-ink-muted: #8b8e89;
  --color-accent-blue: #1f73b7;
  --color-surface-border: #d8dcde;
```

And expose them in `@theme inline`:

```css
  --color-app-backdrop: var(--color-app-backdrop);
  --color-nav-active: var(--color-nav-active);
  --color-ink: var(--color-ink);
  --color-ink-muted: var(--color-ink-muted);
  --color-accent-blue: var(--color-accent-blue);
  --color-surface-border: var(--color-surface-border);
```

- [ ] **Step 8: Create `src/app-styles/fonts.css`** (empty stub with a comment; the system stack needs no @font-face)

```css
/* System font stack is defined via --font-sans in theme.css. No web fonts committed. */
```

- [ ] **Step 9: Create `src/app-styles/index.css`**

```css
@import './fonts.css';
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
@import './theme.css';
```

- [ ] **Step 10: Run checks and commit**

Run: `pnpm test && pnpm typecheck`
Expected: PASS.

```bash
git add -A
git commit -m "feat: add design tokens, font stack, cn helper, channel-meta, and shared types"
```

---

## Task 3: Nav config

Single source of truth for navigation, with tests. This kills the prototype's `nth-child` index math.

**Files:**
- Create: `src/app/nav-config.ts`, `src/app/nav-config.test.ts`

**Interfaces:**
- Produces: `NAV_ITEMS: NavItem[]` (10 primary items + `Organization`), `PRIMARY_NAV: NavItem[]` (first 10), `SECONDARY_NAV: NavItem[]` (Organization), and `findNavItemByPath(pathname: string): NavItem | undefined`.

- [ ] **Step 1: Write failing test `src/app/nav-config.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { NAV_ITEMS, PRIMARY_NAV, SECONDARY_NAV, findNavItemByPath } from './nav-config'

describe('nav-config', () => {
  it('lists all nav items in order with correct paths', () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([
      'Home', 'Insights', 'AI Agents', 'Knowledge', 'Tools',
      'Experiments', 'Orchestrator', 'Integrations', 'Log', 'Settings', 'Organization',
    ])
    expect(NAV_ITEMS.find((i) => i.label === 'Home')?.path).toBe('/')
    expect(NAV_ITEMS.find((i) => i.label === 'AI Agents')?.path).toBe('/ai-agents')
  })

  it('splits primary (10) and secondary (Organization) groups', () => {
    expect(PRIMARY_NAV).toHaveLength(10)
    expect(SECONDARY_NAV.map((i) => i.label)).toEqual(['Organization'])
  })

  it('carries submenus where the design defines them', () => {
    expect(NAV_ITEMS.find((i) => i.label === 'Insights')?.submenu).toEqual([
      'CX Journey', 'AI Performances',
    ])
    expect(NAV_ITEMS.find((i) => i.label === 'Tools')?.submenu).toEqual([])
  })

  it('resolves the active item from a pathname, including nested routes', () => {
    expect(findNavItemByPath('/')?.label).toBe('Home')
    expect(findNavItemByPath('/insights')?.label).toBe('Insights')
    expect(findNavItemByPath('/insights/ai-performances')?.label).toBe('Insights')
    expect(findNavItemByPath('/nope')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/nav-config.test.ts`
Expected: FAIL — cannot find module `./nav-config`.

- [ ] **Step 3: Create `src/app/nav-config.ts`**

```ts
import {
  Home, BarChart3, Bot, BookOpen, Wrench, FlaskConical,
  Workflow, Plug, ScrollText, Settings, Building2,
} from 'lucide-react'
import type { NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', icon: Home, submenu: [] },
  { label: 'Insights', path: '/insights', icon: BarChart3, submenu: ['CX Journey', 'AI Performances'] },
  { label: 'AI Agents', path: '/ai-agents', icon: Bot, submenu: ['Agent Builder', 'Configuration', 'QA'] },
  { label: 'Knowledge', path: '/knowledge', icon: BookOpen, submenu: ['Insights', 'Contents', 'Coaching'] },
  { label: 'Tools', path: '/tools', icon: Wrench, submenu: [] },
  { label: 'Experiments', path: '/experiments', icon: FlaskConical, submenu: ['A/B Test', 'Test Suite', 'Simulations'] },
  { label: 'Orchestrator', path: '/orchestrator', icon: Workflow, submenu: [] },
  { label: 'Integrations', path: '/integrations', icon: Plug, submenu: [] },
  { label: 'Log', path: '/log', icon: ScrollText, submenu: [] },
  { label: 'Settings', path: '/settings', icon: Settings, submenu: ['Account', 'Security'] },
  { label: 'Organization', path: '/organization', icon: Building2, submenu: [] },
]

export const PRIMARY_NAV = NAV_ITEMS.slice(0, 10)
export const SECONDARY_NAV = NAV_ITEMS.slice(10)

export function findNavItemByPath(pathname: string): NavItem | undefined {
  const exact = NAV_ITEMS.find((i) => i.path === pathname)
  if (exact) return exact
  // Longest non-root path that prefixes the pathname (handles nested routes).
  return NAV_ITEMS
    .filter((i) => i.path !== '/' && pathname.startsWith(i.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/nav-config.test.ts`
Expected: PASS (all 4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add nav-config as single source of truth for navigation"
```

---

## Task 4: AppLayout, router entry, and Placeholder page

Build the routing skeleton and the persistent chrome container (without the detailed sidebar visuals yet — a minimal sidebar placeholder is fine here; full sidebar comes in Task 5). This task makes the new app boot at a temporary entry so we can test routing without disturbing the old app.

**Files:**
- Create: `src/app/layout/AppLayout.tsx`, `src/app/layout/AppLayout.test.tsx`
- Create: `src/features/_placeholder/PlaceholderScreen.tsx`
- Create: `src/routes.tsx`
- Create: `src/features/home/HomeScreen.tsx` (stub returning a labeled region; full build in Task 7)
- Create: `src/features/insights/InsightsScreen.tsx` (stub; full build in Task 8)
- Create: `src/features/organization/OrganizationScreen.tsx` (stub; full build in Task 9)

**Interfaces:**
- Consumes: `NAV_ITEMS` from Task 3.
- Produces: `AppLayout` (renders chrome + `<Outlet/>`), `PlaceholderScreen({ title }: { title: string })`, `routes` (a `RouteObject[]` for `createBrowserRouter`).

- [ ] **Step 1: Write failing test `src/app/layout/AppLayout.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('routing + layout', () => {
  it('renders the Home screen at /', () => {
    renderAt('/')
    expect(screen.getByTestId('screen-home')).toBeInTheDocument()
  })

  it('renders the Placeholder for an undesigned destination', () => {
    renderAt('/tools')
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })

  it('marks the active nav item based on the URL', () => {
    renderAt('/insights')
    expect(screen.getByRole('link', { name: /insights/i })).toHaveAttribute('aria-current', 'page')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/layout/AppLayout.test.tsx`
Expected: FAIL — cannot find module `@/routes`.

- [ ] **Step 3: Create `src/features/_placeholder/PlaceholderScreen.tsx`**

```tsx
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[26px] border border-white bg-white text-ink-muted">
      <div className="mb-4 text-4xl">🚧</div>
      <div className="text-xl font-medium text-ink">{title}</div>
      <div className="mt-2 text-sm opacity-70">Coming soon</div>
    </div>
  )
}
```

- [ ] **Step 4: Create the three screen stubs**

`src/features/home/HomeScreen.tsx`:
```tsx
export function HomeScreen() {
  return <div data-testid="screen-home" className="h-full rounded-[26px] bg-white" />
}
```

`src/features/insights/InsightsScreen.tsx`:
```tsx
export function InsightsScreen() {
  return <div data-testid="screen-insights" className="h-full rounded-[26px] bg-white" />
}
```

`src/features/organization/OrganizationScreen.tsx`:
```tsx
export function OrganizationScreen() {
  return <div data-testid="screen-organization" className="h-full rounded-[26px] bg-white" />
}
```

- [ ] **Step 5: Create `src/app/layout/AppLayout.tsx`**

```tsx
import { Link, Outlet, useLocation } from 'react-router'
import { NAV_ITEMS, findNavItemByPath } from '@/app/nav-config'

export function AppLayout() {
  const { pathname } = useLocation()
  const active = findNavItemByPath(pathname)

  return (
    <div className="flex h-screen min-w-[1024px] bg-app-backdrop">
      {/* Minimal nav rail — replaced with full Sidebar in Task 5 */}
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active?.label === item.label
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className="flex h-12 w-12 items-center justify-center rounded-lg"
            >
              <Icon size={20} />
            </Link>
          )
        })}
      </nav>
      <main className="flex-1 overflow-hidden p-2">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/routes.tsx`**

```tsx
import type { RouteObject } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { HomeScreen } from '@/features/home/HomeScreen'
import { InsightsScreen } from '@/features/insights/InsightsScreen'
import { OrganizationScreen } from '@/features/organization/OrganizationScreen'
import { PlaceholderScreen } from '@/features/_placeholder/PlaceholderScreen'
import { NAV_ITEMS } from '@/app/nav-config'

const BUILT = new Set(['/', '/insights', '/organization'])

const placeholderRoutes: RouteObject[] = NAV_ITEMS
  .filter((i) => !BUILT.has(i.path))
  .map((i) => ({ path: i.path, element: <PlaceholderScreen title={i.label} /> }))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'insights', element: <InsightsScreen /> },
      { path: 'organization', element: <OrganizationScreen /> },
      ...placeholderRoutes.map((r) => ({ ...r, path: r.path!.replace(/^\//, '') })),
    ],
  },
]
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm test src/app/layout/AppLayout.test.tsx`
Expected: PASS (all 3 tests).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add router, AppLayout chrome, and Placeholder screen"
```

---

## Task 5: Full Sidebar (collapsed rail + hover flyover + expand toggle)

Replace the minimal rail in `AppLayout` with the real collapsed sidebar: icon rail, hover-intent flyover menus, and an expand/collapse toggle. Match the visual reference in `src/app/App.tsx` and `expanded-sidebar.tsx`, but as clean components with real handlers (no invisible overlays, no injected `<style>`).

**Files:**
- Create: `src/app/layout/Sidebar.tsx`, `src/app/layout/Sidebar.test.tsx`
- Create: `src/app/layout/useHoverIntent.ts`
- Modify: `src/app/layout/AppLayout.tsx` (replace the minimal `<nav>` with `<Sidebar>`; add `isExpanded` state)

**Interfaces:**
- Consumes: `PRIMARY_NAV`, `SECONDARY_NAV`, `findNavItemByPath`.
- Produces: `Sidebar({ isExpanded, onToggleExpand }: { isExpanded: boolean; onToggleExpand: () => void })`.
- Produces: `useHoverIntent(delayMs?: number): { activeKey: string | null; open: (key: string) => void; scheduleClose: () => void }`.

- [ ] **Step 1: Write failing test `src/app/layout/Sidebar.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Sidebar } from './Sidebar'

function renderSidebar(isExpanded = false, onToggleExpand = vi.fn()) {
  return render(
    <MemoryRouter>
      <Sidebar isExpanded={isExpanded} onToggleExpand={onToggleExpand} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders a link per nav item', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /organization/i })).toBeInTheDocument()
  })

  it('opens a flyover with submenu items on hover', async () => {
    const user = userEvent.setup()
    renderSidebar()
    await user.hover(screen.getByRole('link', { name: /insights/i }))
    expect(await screen.findByText('CX Journey')).toBeInTheDocument()
    expect(screen.getByText('AI Performances')).toBeInTheDocument()
  })

  it('calls onToggleExpand when the expand toggle is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderSidebar(false, onToggle)
    await user.click(screen.getByRole('button', { name: /expand sidebar/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/layout/Sidebar.test.tsx`
Expected: FAIL — cannot find module `./Sidebar`.

- [ ] **Step 3: Create `src/app/layout/useHoverIntent.ts`**

```ts
import { useCallback, useRef, useState } from 'react'

export function useHoverIntent(delayMs = 140) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const open = useCallback((key: string) => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setActiveKey(key)
  }, [])

  const scheduleClose = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setActiveKey(null), delayMs)
  }, [delayMs])

  return { activeKey, open, scheduleClose }
}
```

- [ ] **Step 4: Create `src/app/layout/Sidebar.tsx`**

Build the collapsed icon rail from `PRIMARY_NAV` (top) + a separator + `SECONDARY_NAV` (Organization), then the expand toggle button pinned to the bottom. Each item is a `react-router` `<Link>` with `aria-label={item.label}` and `aria-current="page"` when active (derive via `useLocation` + `findNavItemByPath`). Active styling uses `bg-nav-active` with white icon; hover uses a subtle tint. On `onMouseEnter`, call `open(item.label)`; on `onMouseLeave`, `scheduleClose()`. When `activeKey` has a submenu, render the flyover popover (white, rounded-8, shadow) positioned beside the rail listing the item label + submenu entries as `<Link>`s to `${item.path}/${kebab(sub)}`. The expand toggle is a `<button aria-label="Expand sidebar">` calling `onToggleExpand`. Use `motion` for flyover fade/slide.

Reference for exact colors/spacing: `src/app/App.tsx` lines 156–404 and `expanded-sidebar.tsx`. Use tokens (`bg-nav-active`, `text-ink`) instead of raw hex.

- [ ] **Step 5: Wire `Sidebar` into `AppLayout`**

In `src/app/layout/AppLayout.tsx`, add `const [isExpanded, setIsExpanded] = useState(false)`, replace the minimal `<nav>` with `<Sidebar isExpanded={isExpanded} onToggleExpand={() => setIsExpanded((v) => !v)} />`. Keep the `<main>` fluid. Import `useState` from React.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test src/app/layout/Sidebar.test.tsx src/app/layout/AppLayout.test.tsx`
Expected: PASS. (The AppLayout active-state test still passes because links keep `aria-label` + `aria-current`.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build collapsed sidebar with hover-intent flyover and expand toggle"
```

---

## Task 6: ExpandedSidebar + OrgSwitcher + top bar

Build the expanded nav drawer and the organization switcher in the top bar. Introduce app-level org state.

**Files:**
- Create: `src/app/layout/ExpandedSidebar.tsx`, `src/app/layout/ExpandedSidebar.test.tsx`
- Create: `src/app/layout/OrgSwitcher.tsx`, `src/app/layout/OrgSwitcher.test.tsx`
- Create: `src/app/layout/TopBar.tsx`
- Create: `src/app/org-context.tsx` (org list + current org, shared across screens)
- Modify: `src/app/layout/AppLayout.tsx` (render `TopBar`; swap `Sidebar`↔`ExpandedSidebar` on `isExpanded`; wrap in `OrgProvider`)

**Interfaces:**
- Consumes: `NAV_ITEMS`, `PRIMARY_NAV`, `SECONDARY_NAV`, `Org` type.
- Produces: `OrgProvider`, `useOrgs(): { orgs: Org[]; currentOrg: string; setCurrentOrg(name: string): void; addOrg(name: string, channels: string[]): Org }`.
- Produces: `ExpandedSidebar({ activeLabel, selectedSub, onSelectSub, onCollapse }: {...})` — see step 4 for exact prop types.
- Produces: `OrgSwitcher()` (self-contained; reads `useOrgs`, navigates to `/organization/new` on "Add organization").

- [ ] **Step 1: Write failing test `src/app/layout/OrgSwitcher.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { OrgProvider } from '@/app/org-context'
import { OrgSwitcher } from './OrgSwitcher'

function renderSwitcher() {
  return render(
    <MemoryRouter>
      <OrgProvider>
        <OrgSwitcher />
      </OrgProvider>
    </MemoryRouter>,
  )
}

describe('OrgSwitcher', () => {
  it('shows the current org and lists orgs on open', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    expect(screen.getByText('SpaceX')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /switch organization/i }))
    expect(await screen.findByRole('menuitem', { name: /tesla/i })).toBeInTheDocument()
  })

  it('switches the current org on selection', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(screen.getByRole('button', { name: /switch organization/i }))
    await user.click(await screen.findByRole('menuitem', { name: /tesla/i }))
    expect(screen.getByText('Tesla')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/layout/OrgSwitcher.test.tsx`
Expected: FAIL — cannot find `@/app/org-context`.

- [ ] **Step 3: Create `src/app/org-context.tsx`**

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Org } from '@/types'

type OrgContextValue = {
  orgs: Org[]
  currentOrg: string
  setCurrentOrg: (name: string) => void
  addOrg: (name: string, channels: string[]) => Org
}

const OrgContext = createContext<OrgContextValue | null>(null)

const INITIAL_ORGS: Org[] = [
  { id: 'spacex', name: 'SpaceX', channels: ['Web Widget', 'Inbound Voice', 'Web Call', 'Slack'] },
  { id: 'tesla', name: 'Tesla', channels: ['Web Widget', 'Email'] },
]

let seq = 0

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>(INITIAL_ORGS)
  const [currentOrg, setCurrentOrg] = useState('SpaceX')

  const value = useMemo<OrgContextValue>(
    () => ({
      orgs,
      currentOrg,
      setCurrentOrg,
      addOrg: (name, channels) => {
        const org: Org = { id: `${name.toLowerCase().replace(/\s+/g, '-')}-${++seq}`, name, channels }
        setOrgs((prev) => [...prev, org])
        setCurrentOrg(name)
        return org
      },
    }),
    [orgs, currentOrg],
  )

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrgs() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrgs must be used within OrgProvider')
  return ctx
}
```

> Note: uses a module `seq` counter instead of `Date.now()` for deterministic ids (testable).

- [ ] **Step 4: Create `src/app/layout/OrgSwitcher.tsx`**

Render the current org name and a trigger `<button aria-label="Switch organization">`. On open, show a menu (`role="menu"`) listing each org as `role="menuitem"` (checkmark on current), a divider, and an "Add organization" item that navigates to `/organization/new`. Use hover-intent (reuse `useHoverIntent`) plus click. Match colors from `App.tsx` lines 226–312 using tokens. Reads `useOrgs()`.

- [ ] **Step 5: Run OrgSwitcher tests**

Run: `pnpm test src/app/layout/OrgSwitcher.test.tsx`
Expected: PASS.

- [ ] **Step 6: Write failing test `src/app/layout/ExpandedSidebar.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ExpandedSidebar } from './ExpandedSidebar'

describe('ExpandedSidebar', () => {
  it('renders labels for all nav items', () => {
    render(
      <MemoryRouter>
        <ExpandedSidebar activeLabel="Home" selectedSub={{}} onSelectSub={vi.fn()} onCollapse={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /^Home$/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Insights$/ })).toBeInTheDocument()
  })

  it('calls onCollapse when the collapse toggle is clicked', async () => {
    const user = userEvent.setup()
    const onCollapse = vi.fn()
    render(
      <MemoryRouter>
        <ExpandedSidebar activeLabel="Home" selectedSub={{}} onSelectSub={vi.fn()} onCollapse={onCollapse} />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(onCollapse).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

Run: `pnpm test src/app/layout/ExpandedSidebar.test.tsx`
Expected: FAIL — cannot find `./ExpandedSidebar`.

- [ ] **Step 8: Create `src/app/layout/ExpandedSidebar.tsx`**

Prop type:
```tsx
type ExpandedSidebarProps = {
  activeLabel: string
  selectedSub: Record<string, string>
  onSelectSub: (item: string, sub: string) => void
  onCollapse: () => void
}
```
Render the expanded drawer (~234px wide) with icon+label rows for `PRIMARY_NAV`, a separator, `SECONDARY_NAV`, and a collapse toggle `<button aria-label="Collapse sidebar">`. Items are `<Link>`s to `item.path`; active row uses `bg-nav-active` + white text. For items with a submenu, render sub-rows as `<Link>`s to `${path}/${kebab(sub)}`, highlighting `selectedSub[item.label]`. Reference `expanded-sidebar.tsx` for spacing; use tokens. Add a `kebab(s: string)` helper local to the file: `s.toLowerCase().replace(/\s+/g, '-')`.

- [ ] **Step 9: Create `src/app/layout/TopBar.tsx`**

A slim top bar containing the `OrgSwitcher` on the left (matching its current position) and space for the profile avatar/actions on the right (static, non-interactive placeholder is fine — reference `App.tsx` header region). Fluid width.

- [ ] **Step 10: Wire into `AppLayout`**

In `AppLayout.tsx`: wrap the returned tree in `<OrgProvider>`; render `<TopBar />` above `<Outlet/>`; when `isExpanded`, render `<ExpandedSidebar .../>` instead of `<Sidebar .../>`. Manage `selectedSub` state (`useState<Record<string,string>>({ Insights: 'AI Performances' })`) and pass `activeLabel={active?.label ?? 'Home'}`. Import `useOrgs`? No — TopBar/OrgSwitcher read context themselves.

- [ ] **Step 11: Run all tests**

Run: `pnpm test`
Expected: PASS (all suites).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add expanded sidebar, org switcher, top bar, and org context"
```

---

## Task 7: Home screen

Rebuild Home as a clean component. Per the reference, Home is the app shell (already provided by `AppLayout`) plus a mostly-empty white rounded content surface. Build the content surface faithfully and responsively.

**Files:**
- Modify: `src/features/home/HomeScreen.tsx`
- Create: `src/features/home/HomeScreen.test.tsx`

**Interfaces:**
- Consumes: nothing beyond layout.
- Produces: `HomeScreen()` rendering `data-testid="screen-home"`.

- [ ] **Step 1: Write failing test `src/features/home/HomeScreen.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen', () => {
  it('renders a full-height white content surface', () => {
    render(<HomeScreen />)
    const surface = screen.getByTestId('screen-home')
    expect(surface).toBeInTheDocument()
    expect(surface.className).toMatch(/rounded-\[26px\]/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails/passes**

Run: `pnpm test src/features/home/HomeScreen.test.tsx`
Expected: PASS already (stub matches). This test locks the contract; proceed to enrich the component.

- [ ] **Step 3: Build the Home content surface**

Replace the stub with a fluid white surface (`h-full w-full rounded-[26px] bg-white`) that fills the main area. Reproduce any real content from `src/imports/01HomeDefault/index.tsx` — which is essentially an empty white panel (`data-name="fields"`). Keep it minimal and fluid. Keep `data-testid="screen-home"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/features/home/HomeScreen.test.tsx`
Expected: PASS.

- [ ] **Step 5: Manual visual check**

Run `pnpm dev`, open `/`, confirm the white surface fills the content area fluidly beside the sidebar with the `#f1efed` backdrop. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: rebuild Home screen as fluid content surface"
```

---

## Task 8: Insights screen + sub-routes

Rebuild Insights with its two sub-views (CX Journey, AI Performances) as nested routes. Per the reference, Insights is also largely shell + content surface; build the surface and a sub-view switch. If the reference shows charts, render them with `recharts`; otherwise render titled empty surfaces.

**Files:**
- Modify: `src/features/insights/InsightsScreen.tsx`
- Create: `src/features/insights/CxJourneyView.tsx`, `src/features/insights/AiPerformancesView.tsx`
- Create: `src/features/insights/InsightsScreen.test.tsx`
- Modify: `src/routes.tsx` (add nested children for insights)

**Interfaces:**
- Consumes: layout `<Outlet/>` nesting.
- Produces: `InsightsScreen()` (renders sub-view via nested `<Outlet/>`), `CxJourneyView()`, `AiPerformancesView()`.

- [ ] **Step 1: Add nested routes in `src/routes.tsx`**

Change the `insights` route to:
```tsx
{
  path: 'insights',
  element: <InsightsScreen />,
  children: [
    { index: true, element: <AiPerformancesView /> },
    { path: 'cx-journey', element: <CxJourneyView /> },
    { path: 'ai-performances', element: <AiPerformancesView /> },
  ],
},
```
Add the imports. (Index defaults to AI Performances, matching the prototype's default `selectedSub`.)

- [ ] **Step 2: Write failing test `src/features/insights/InsightsScreen.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Insights routing', () => {
  it('shows AI Performances by default at /insights', () => {
    renderAt('/insights')
    expect(screen.getByTestId('view-ai-performances')).toBeInTheDocument()
  })

  it('shows CX Journey at /insights/cx-journey', () => {
    renderAt('/insights/cx-journey')
    expect(screen.getByTestId('view-cx-journey')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test src/features/insights/InsightsScreen.test.tsx`
Expected: FAIL — sub-view components/testids missing.

- [ ] **Step 4: Build the views and container**

`InsightsScreen.tsx`: fluid white surface (`h-full rounded-[26px] bg-white`) with a nested `<Outlet/>` for the sub-view; keep `data-testid="screen-insights"`. Import `Outlet` from `react-router`.

`CxJourneyView.tsx`: `<div data-testid="view-cx-journey" className="p-6">…</div>` — reproduce any real content from `src/imports/02Insights/index.tsx`; if empty, a titled empty region.

`AiPerformancesView.tsx`: `<div data-testid="view-ai-performances" className="p-6">…</div>`. If the reference contains charts, build them with `recharts` (import from `@/components/ui/chart` if that wrapper is used, else `recharts` directly); otherwise a titled empty region.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test src/features/insights/InsightsScreen.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: rebuild Insights screen with CX Journey and AI Performances sub-routes"
```

---

## Task 9: Organization dashboard + create-org flow

Rebuild the content-heavy Organization dashboard (org table with channel chips) and the full-screen create-org flow, both fluid. This is the largest visual task.

**Files:**
- Modify: `src/features/organization/OrganizationScreen.tsx`
- Create: `src/features/organization/OrgRow.tsx`, `src/features/organization/ChannelChip.tsx`
- Create: `src/features/organization/CreateOrgFlow.tsx`
- Create: `src/features/organization/OrganizationScreen.test.tsx`, `src/features/organization/CreateOrgFlow.test.tsx`
- Modify: `src/routes.tsx` (add `/organization/new` route)

**Interfaces:**
- Consumes: `useOrgs()`, `channelMeta`, `Org`.
- Produces: `OrganizationScreen()`, `ChannelChip({ label }: { label: string })`, `OrgRow({ org }: { org: Org })`, `CreateOrgFlow()` (reads `useOrgs().addOrg`, navigates to `/organization` on save/close).

- [ ] **Step 1: Add the create-org route in `src/routes.tsx`**

Add sibling child: `{ path: 'organization/new', element: <CreateOrgFlow /> }`. The create flow renders full-bleed within the layout content area (no fixed canvas). Import `CreateOrgFlow`.

- [ ] **Step 2: Write failing test `src/features/organization/OrganizationScreen.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { OrgProvider } from '@/app/org-context'
import { OrganizationScreen } from './OrganizationScreen'

function renderScreen() {
  return render(
    <MemoryRouter>
      <OrgProvider>
        <OrganizationScreen />
      </OrgProvider>
    </MemoryRouter>,
  )
}

describe('OrganizationScreen', () => {
  it('renders the title and a Create new action', () => {
    renderScreen()
    expect(screen.getByRole('heading', { name: /organization/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create new/i })).toBeInTheDocument()
  })

  it('lists seeded orgs with channel chips', () => {
    renderScreen()
    expect(screen.getByText('SpaceX')).toBeInTheDocument()
    expect(screen.getByText('Tesla')).toBeInTheDocument()
    // SpaceX has 4 channels -> 3 chips + "+1"
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test src/features/organization/OrganizationScreen.test.tsx`
Expected: FAIL — heading/link/rows missing (stub only).

- [ ] **Step 4: Build `ChannelChip.tsx`**

Port from `organization-dashboard.tsx` `ChannelChip` (lines 12–28): rounded pill, `channelMeta` color at ~13% alpha background, Lucide icon + display name. Use tokens where possible; keep the per-channel brand color inline (data-driven).

- [ ] **Step 5: Build `OrgRow.tsx`**

Reproduce the row from `OrgRow` (lines 30–78) but **fluid**, not absolute-positioned: use a flex/grid row (`avatar + name` | `channels` | `resolution rate` | overflow menu). Show first 3 channels as chips + `+N` overflow. Avatar is the org initial on `bg-ink`. Resolution rate renders `n/a`. Props: `{ org: Org }`.

- [ ] **Step 6: Build `OrganizationScreen.tsx`**

Fluid layout replacing the coordinate-driven original: a header row with an `<h1>Organization</h1>` and a right-aligned "Create new" `<Link to="/organization/new">` styled as the dark pill button; centered intro copy ("Create your organization and pick the channels…"); a table header (`Name` / `Channels` / `Resolution rate`) aligned to the rows via grid; then the org rows from `useOrgs().orgs` mapped to `<OrgRow>`. Drop the AI Studio panel toggle and the two hardcoded layout coordinate sets (`COLLAPSED_LAYOUT`/`EXPANDED_LAYOUT`) entirely — the fluid layout adapts automatically. Keep `data-testid="screen-organization"` on the root. Use grid columns so header and rows align.

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm test src/features/organization/OrganizationScreen.test.tsx`
Expected: PASS.

- [ ] **Step 8: Write failing test `src/features/organization/CreateOrgFlow.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'
import { OrgProvider } from '@/app/org-context'

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <OrgProvider>
      <RouterProvider router={router} />
    </OrgProvider>,
  )
}

describe('CreateOrgFlow', () => {
  it('renders the create-org form at /organization/new', () => {
    renderApp('/organization/new')
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument()
  })

  it('creates an org and returns to the dashboard listing it', async () => {
    const user = userEvent.setup()
    renderApp('/organization/new')
    await user.type(screen.getByLabelText(/organization name/i), 'Acme')
    await user.click(screen.getByRole('button', { name: /save|create/i }))
    expect(await screen.findByText('Acme')).toBeInTheDocument()
  })
})
```

> Note: `OrgProvider` wraps `RouterProvider` here so state survives navigation between `/organization/new` and `/organization`. Ensure `AppLayout` does NOT create a second provider that shadows this one in tests — in the app, `OrgProvider` lives in `AppLayout` (Task 6). For this test we wrap outside; that's fine because `useOrgs` reads the nearest provider. To avoid double-provider drift, in Task 6 keep `OrgProvider` in `AppLayout` only. This test wraps its own provider because it renders the full route tree which includes `AppLayout`'s provider — the INNER one (AppLayout's) is what components use. Therefore assert against navigation behavior, not the outer provider. If the double-provider causes the created org not to appear, move `OrgProvider` to wrap `routes` at the app entry instead of inside `AppLayout`, and update Task 6 Step 10 accordingly.

- [ ] **Step 9: Resolve provider placement**

To make org state survive across the create→dashboard navigation cleanly, place `OrgProvider` at the **app entry wrapping the router**, not inside `AppLayout`. Update: remove `<OrgProvider>` from `AppLayout` (Task 6) and instead wrap `<RouterProvider>` in `App.tsx` (Task 10). Re-run Task 6 tests — `OrgSwitcher` tests already wrap their own provider, so they still pass. Adjust the CreateOrgFlow test to wrap a single provider around `RouterProvider` (as written above).

- [ ] **Step 10: Run test to verify it fails**

Run: `pnpm test src/features/organization/CreateOrgFlow.test.tsx`
Expected: FAIL — form/labels missing.

- [ ] **Step 11: Build `CreateOrgFlow.tsx`**

Port the flow from `src/app/components/create-org-flow.tsx` as a fluid full-content-area form: an "Organization name" text input (`<label>` associated via `htmlFor`/`id`), channel selection (checkboxes/toggles from `CHANNEL_META` keys), a Save/Create button and a Close/Cancel control. On save: call `useOrgs().addOrg(name, selectedChannels)` then `navigate('/organization')`. On close: `navigate('/organization')`. Use `useNavigate` from `react-router`. Reference the old file for copy and field set.

- [ ] **Step 12: Run tests to verify they pass**

Run: `pnpm test src/features/organization/`
Expected: PASS (both suites).

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: rebuild Organization dashboard and create-org flow as fluid components"
```

---

## Task 10: New app entry — wire it all together

Point the real entry at the new router and delete the string-switching `App.tsx`. After this task the app runs entirely on new code (old `imports/` still present but unreferenced).

**Files:**
- Modify: `src/main.tsx` (import new styles + new `App`)
- Create: `src/App.tsx` (router provider + OrgProvider)
- Delete: `src/app/App.tsx` (old string-switching root)

**Interfaces:**
- Consumes: `routes`, `OrgProvider`.
- Produces: default-exported `App` mounting `createBrowserRouter(routes)`.

- [ ] **Step 1: Create `src/App.tsx`**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import { OrgProvider } from '@/app/org-context'
import { routes } from '@/routes'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <OrgProvider>
      <RouterProvider router={router} />
    </OrgProvider>
  )
}
```

- [ ] **Step 2: Update `src/main.tsx`**

```tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './app-styles/index.css'

createRoot(document.getElementById('root')!).render(<App />)
```

- [ ] **Step 3: Delete the old root**

Run: `git rm src/app/App.tsx`

- [ ] **Step 4: Run full verification**

Run: `pnpm test && pnpm typecheck`
Expected: PASS.

Run `pnpm dev`, click through every nav item (Home, Insights + sub-views, Organization, create-org save round-trip, all placeholders), test expand/collapse and the org switcher, resize the window ≥1024px to confirm fluidity. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: mount app on new router; remove string-switching root"
```

---

## Task 11: Delete the old world and finalize docs

Remove all remaining Figma Make artifacts, promote `app-styles`→`styles`, clean configs, and rewrite docs. End with a fully green build.

**Files:**
- Delete: `src/imports/` (entire dir), `src/app/components/` (old `organization-dashboard.tsx`, `create-org-flow.tsx`, `expanded-sidebar.tsx`, `Sidebar.tsx`, `PlaceholderScreen.tsx`, `channel-meta.ts` — but KEEP `src/app/components/ui/` and `src/app/components/figma/`? See steps), `guidelines/`, root scratch scripts, `default_shadcn_theme.css`, `pnpm-workspace.yaml`, `src/styles/` (old)
- Modify: `vite.config.ts` (remove `figmaAssetResolver` + `figma:asset` handling), `index.html` (clean comments/title stays "FT Unification"), `CLAUDE.md`, `README.md`
- Move: `src/app-styles/` → `src/styles/`; move `src/app/components/ui/` → `src/components/ui/`; move `src/app/components/figma/` → `src/components/figma/`

- [ ] **Step 1: Relocate the retained shadcn kit and figma image helper**

Run:
```bash
git mv src/app/components/ui src/components/ui
git mv src/app/components/figma src/components/figma
```
Update any imports inside `ui/` that reference `./utils` — `src/components/ui/utils.ts` stays put (it re-exports `cn`); optionally re-point ui files to `@/lib/cn`. Leave `ui/utils.ts` as-is to minimize churn.

- [ ] **Step 2: Delete old app components and generated imports**

Run:
```bash
git rm -r src/imports
git rm src/app/components/organization-dashboard.tsx \
       src/app/components/create-org-flow.tsx \
       src/app/components/expanded-sidebar.tsx \
       src/app/components/Sidebar.tsx \
       src/app/components/PlaceholderScreen.tsx \
       src/app/components/channel-meta.ts
```

- [ ] **Step 3: Promote styles**

Run:
```bash
git rm -r src/styles
git mv src/app-styles src/styles
```
Update `src/main.tsx` import to `./styles/index.css`. Search for any `@/app-styles` references and repoint to `@/styles`: `grep -rn "app-styles" src` should return nothing after.

- [ ] **Step 4: Delete remaining Figma Make artifacts**

Run:
```bash
git rm -r guidelines
git rm parseNav.js parseNav.cjs test.js test-compile.js test-compile2.js test-expand.js \
       default_shadcn_theme.css pnpm-workspace.yaml
```

- [ ] **Step 5: Clean `vite.config.ts`**

Replace with:
```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

- [ ] **Step 6: Clean `index.html`**

Ensure no Figma comments remain; keep `<title>FT Unification</title>`, the viewport meta, and the `#root` script. Remove the `noindex, nofollow` robots tag only if desired (optional — leave as-is otherwise).

- [ ] **Step 7: Grep for any lingering Figma Make references**

Run:
```bash
grep -rin "figma" src vite.config.ts index.html package.json README.md CLAUDE.md \
  --exclude-dir=node_modules
```
Expected: only legitimate hits are `src/components/figma/ImageWithFallback.tsx` (a generic image fallback helper — acceptable, but rename its comment/header to drop "Figma" if it mentions Make). No `figma:asset`, no `@figma/my-make-file`, no "Figma Make" strings anywhere. Fix any that remain.

- [ ] **Step 8: Rewrite `README.md`**

```markdown
# FT Unification

The FT Unification console — an AI platform for customer support automation.
A React + Vite + TypeScript front end.

## Development

```bash
pnpm install
pnpm dev        # start the dev server
pnpm build      # typecheck + production build
pnpm test       # run tests
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint
pnpm format     # prettier --write
```
```

- [ ] **Step 9: Rewrite `CLAUDE.md`**

Replace the Figma-Make-era content with the real architecture: greenfield React/Vite/TS app; routing via `react-router` driven by `src/app/nav-config.ts`; persistent `AppLayout` (Sidebar/ExpandedSidebar/TopBar/OrgSwitcher) + feature screens under `src/features/`; design tokens in `src/styles/theme.css`; full shadcn/ui kit in `src/components/ui/`; desktop-fluid (min-width 1024px); commands (dev/build/test/typecheck/lint/format); note foundation-only scope and that Solve/Triage/Assist/Discover/AI Studio are future features. Remove ALL Figma Make references.

- [ ] **Step 10: Full verification**

Run:
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
Expected: all four PASS with no errors.

Run `pnpm dev` and do a final click-through of every route + interaction. Stop the server.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: remove all Figma Make artifacts, promote styles, finalize docs"
```

---

## Self-Review

**Spec coverage:**
- Remove all Figma Make refs → Tasks 1, 10, 11 (grep gate in 11 Step 7). ✓
- Preserve nav + look-and-feel → Tasks 5, 6, 7, 8, 9 (reference-driven). ✓
- Rebuild screens clean + semantic → Tasks 7, 8, 9. ✓
- Responsive desktop-fluid ≥1024px → `min-w-[1024px]` in AppLayout (Task 4/5); fluid screens (7–9). ✓
- Keep stack + add rigor → Task 1 (TS/ESLint/Prettier/Vitest). ✓
- Greenfield scaffold in-repo, delete old world at end → new tree Tasks 2–10, deletion Task 11. ✓
- Real routing, URL-driven active state → Tasks 3, 4. ✓
- nav-config single source of truth → Task 3. ✓
- Lucide icons → Tasks 3, 5, 9. ✓
- System SF font stack → Task 2 (`--font-sans`). ✓
- Keep full shadcn/ui kit → Task 11 Step 1 (relocated, not pruned). ✓
- Prune unused non-ui deps → Task 1 Step 2. ✓
- No mobile/tablet, no backend, no product logic → out of scope, not in any task. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases". Screen-content steps cite the exact reference file and note the surfaces are largely empty in the prototype (honest about low content). ✓

**Type consistency:** `Org`, `NavItem` defined in Task 2, used consistently. `useOrgs` shape defined in Task 6, consumed in Task 9. `channelMeta` signature stable (Task 2 → 9). `findNavItemByPath` defined Task 3, used Tasks 4, 5. Provider placement conflict flagged and resolved in Task 9 Step 9 / Task 10 Step 1 (single `OrgProvider` at app entry). ✓

**Known risk carried from spec:** visual drift (icons/spacing), net-new responsive judgment calls, chart fidelity — all acceptable per approved spec.
