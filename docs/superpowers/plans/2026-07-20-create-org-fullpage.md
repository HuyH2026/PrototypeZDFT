# Create Organization Full-Page Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/organization/new` a full-page takeover (no rail/top bar) matching the Figma design, with a Company name section and four collapsible channel groups whose cards use the design's colored-square icon treatment.

**Architecture:** A pathless `RootLayout` route owns the single `<OrgProvider>` and renders a bare `<Outlet/>`. `AppLayout` (the chrome) and `CreateOrgFlow` become sibling routes under it, so the create flow renders full-screen while org state still survives create→dashboard navigation. Channel grouping is data-driven via new `CHANNEL_SECTIONS` metadata in `channel-meta.ts`.

**Tech Stack:** React 19, React Router v7 (`react-router`), Tailwind v4 (semantic token classes), Vitest + React Testing Library (jsdom), lucide-react icons.

## Global Constraints

- Path alias `@` → `src/`. Do NOT add `baseUrl` to `tsconfig.json`.
- TypeScript strict mode; keep all new code fully typed.
- Exactly ONE `<OrgProvider>` in the tree (CLAUDE.md guarantee). After this change it lives in `RootLayout`, NOT `AppLayout`. Do not add a second one.
- Everything imports from `react-router` (not `react-router-dom`).
- Use semantic token classes (`bg-app-backdrop`, `text-ink`, `text-ink-muted`, `border-surface-border`) where a token exists; per-channel brand colors and one-off grays stay inline (expected).
- Do NOT reintroduce `font-['SF_Pro_*']` arbitrary font-family classes.
- Reliable gates are `pnpm typecheck`, `pnpm test`, `pnpm build`. `pnpm lint` is known-broken (TS7 toolchain gap) — do not rely on it.
- Backdrop color token is `app-backdrop` (`#f1efed`). Selected-card ring is `box-shadow: 0 0 0 2px #373a4d inset` (Figma value, inline).
- Channel section titles and membership are fixed (Figma): **Messaging** (Web Widget, Slack, Facebook Messenger, WhatsApp, Instagram Direct, Android, iOS, LINE), **Email** (Email), **Voice** (Inbound Voice, Outbound Voice, Web Call), **Headless** (API).
- Copy is verbatim: heading `Company name`, helper `Internal company name. This name is not visible to your customers.`; heading `Select channels`, helper `Select the customer support channels to enable for your organization. You can always edit these later.`; input placeholder `Give your AI Org a name`; header title `Organization Setup`; buttons `Close` / `Save`; count text `N channel selected` / `N channels selected`.

---

### Task 1: Full-page routing mechanism (RootLayout + route restructure)

Extract `OrgProvider` from `AppLayout` into a new pathless `RootLayout`, and restructure `routes.tsx` so `CreateOrgFlow` is a sibling of `AppLayout` (full-page), while everything else stays inside `AppLayout`.

**Files:**
- Create: `src/app/layout/RootLayout.tsx`
- Test: `src/app/layout/RootLayout.test.tsx`
- Modify: `src/app/layout/AppLayout.tsx`
- Modify: `src/routes.tsx`

**Interfaces:**
- Consumes: `OrgProvider` from `@/app/org-context`; `AppLayout`, `CreateOrgFlow`, screens as before.
- Produces: `RootLayout` (default-styled layout component, no props) rendering `<OrgProvider><Outlet/></OrgProvider>`. New route tree with `RootLayout` at the root, `AppLayout` at path `/`, and `CreateOrgFlow` at path `/organization/new` as a sibling of `AppLayout`.

- [ ] **Step 1: Write the failing test**

Create `src/app/layout/RootLayout.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('full-page create-org routing', () => {
  it('renders the create flow with no app chrome (no top bar product switcher)', () => {
    renderAt('/organization/new')
    // The create flow itself is present.
    expect(screen.getByText('Organization Setup')).toBeInTheDocument()
    // The TopBar (rendered only inside AppLayout) is absent: its "AI Agent"
    // product switcher must not be on the page.
    expect(screen.queryByText('AI Agent')).not.toBeInTheDocument()
  })

  it('still renders the shell (top bar) for in-app routes', () => {
    renderAt('/organization')
    expect(screen.getByText('AI Agent')).toBeInTheDocument()
    expect(screen.getByTestId('screen-organization')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/app/layout/RootLayout.test.tsx`
Expected: FAIL — at `/organization/new` the current tree renders `AppLayout` (so "AI Agent" is present), and `RootLayout` does not exist yet.

- [ ] **Step 3: Create RootLayout**

Create `src/app/layout/RootLayout.tsx`:

```tsx
import { Outlet } from 'react-router'
import { OrgProvider } from '@/app/org-context'

// Pathless root layout: owns the single OrgProvider so org state is shared by
// both the app shell (AppLayout) and the full-page create-org flow, which are
// sibling routes. Renders a bare Outlet — no chrome of its own.
export function RootLayout() {
  return (
    <OrgProvider>
      <Outlet />
    </OrgProvider>
  )
}
```

- [ ] **Step 4: Remove OrgProvider from AppLayout**

In `src/app/layout/AppLayout.tsx`, drop the `OrgProvider` import and wrapper (keep all other logic: `isExpanded`, active-label derivation, `TopBar`, sidebar swap, `<Outlet/>`). The new file:

```tsx
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { findNavItemByPath } from '@/app/nav-config'
import { Sidebar } from './Sidebar'
import { ExpandedSidebar } from './ExpandedSidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()

  const active = findNavItemByPath(location.pathname)
  const activeLabel = active?.label ?? 'Home'

  return (
    <div className="flex flex-col h-screen min-w-[1024px] bg-app-backdrop">
      <TopBar />
      {isExpanded ? (
        <div className="flex flex-1 min-h-0 ml-2 mb-2 mr-2 rounded-[26px] border border-white bg-white/60">
          <ExpandedSidebar
            activeLabel={activeLabel}
            onCollapse={() => setIsExpanded(false)}
          />
          <main className="flex-1 overflow-hidden rounded-[26px]">
            <Outlet />
          </main>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 ml-2 mb-2 mr-2 rounded-[26px] border border-white bg-white/60">
          <Sidebar onToggleExpand={() => setIsExpanded(true)} />
          <main className="flex-1 overflow-hidden rounded-[26px]">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Restructure routes**

Rewrite `src/routes.tsx` so `RootLayout` is the root, `AppLayout` sits at path `/` with all in-app children, and `CreateOrgFlow` is a sibling at `/organization/new`:

```tsx
import type { RouteObject } from 'react-router'
import { RootLayout } from '@/app/layout/RootLayout'
import { AppLayout } from '@/app/layout/AppLayout'
import { HomeScreen } from '@/features/home/HomeScreen'
import { InsightsScreen } from '@/features/insights/InsightsScreen'
import { AiPerformancesView } from '@/features/insights/AiPerformancesView'
import { CxJourneyView } from '@/features/insights/CxJourneyView'
import { OrganizationScreen } from '@/features/organization/OrganizationScreen'
import { CreateOrgFlow } from '@/features/organization/CreateOrgFlow'
import { PlaceholderScreen } from '@/features/_placeholder/PlaceholderScreen'
import { NAV_ITEMS } from '@/app/nav-config'

const BUILT = new Set(['/', '/insights', '/organization'])

const placeholderRoutes: RouteObject[] = NAV_ITEMS
  .filter((i) => !BUILT.has(i.path))
  .map((i) => ({ path: i.path.replace(/^\//, ''), element: <PlaceholderScreen title={i.label} /> }))

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
              { index: true, element: <AiPerformancesView /> },
              { path: 'cx-journey', element: <CxJourneyView /> },
              { path: 'ai-performances', element: <AiPerformancesView /> },
            ],
          },
          { path: 'organization', element: <OrganizationScreen /> },
          ...placeholderRoutes,
        ],
      },
      { path: '/organization/new', element: <CreateOrgFlow /> },
    ],
  },
]
```

Note: `placeholderRoutes` now strips the leading slash inline (previously done at the spread site), since they are nested under the `/` route. Verify the resulting paths match the previous behavior (`ai-agents`, `knowledge`, etc.).

- [ ] **Step 6: Run the new test + full suite**

Run: `npx vitest run src/app/layout/RootLayout.test.tsx`
Expected: PASS.

Run: `npx vitest run`
Expected: PASS — all pre-existing tests (AppLayout routing, OrgSwitcher, InsightsScreen, OrganizationScreen, CreateOrgFlow, etc.) remain green. `CreateOrgFlow.test.tsx` still passes because `/organization/new` still resolves to `CreateOrgFlow` and org state is still provided (now by `RootLayout`).

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/layout/RootLayout.tsx src/app/layout/RootLayout.test.tsx src/app/layout/AppLayout.tsx src/routes.tsx
git commit -m "feat: full-page routing for create-org via RootLayout"
```

---

### Task 2: Channel section metadata

Add the ordered channel-group metadata to `channel-meta.ts` so the create flow renders sections from data.

**Files:**
- Modify: `src/lib/channel-meta.ts`
- Modify: `src/lib/channel-meta.test.ts`

**Interfaces:**
- Consumes: existing `CHANNEL_META` keys.
- Produces: `type ChannelSection = { title: string; channels: string[] }` and `export const CHANNEL_SECTIONS: ChannelSection[]`. Every `channels` entry is a key of `CHANNEL_META`; the union of all `channels` equals the full set of `CHANNEL_META` keys, each appearing exactly once.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/channel-meta.test.ts`:

```ts
import { CHANNEL_META, CHANNEL_SECTIONS } from './channel-meta'

describe('CHANNEL_SECTIONS', () => {
  it('lists the four sections in Figma order', () => {
    expect(CHANNEL_SECTIONS.map((s) => s.title)).toEqual([
      'Messaging',
      'Email',
      'Voice',
      'Headless',
    ])
  })

  it('covers every CHANNEL_META key exactly once', () => {
    const all = CHANNEL_SECTIONS.flatMap((s) => s.channels)
    expect(all.slice().sort()).toEqual(Object.keys(CHANNEL_META).slice().sort())
    expect(new Set(all).size).toBe(all.length) // no duplicates
  })

  it('references only known channels', () => {
    for (const section of CHANNEL_SECTIONS) {
      for (const label of section.channels) {
        expect(CHANNEL_META[label]).toBeDefined()
      }
    }
  })
})
```

(The existing file imports `channelMeta` at the top; add `CHANNEL_META, CHANNEL_SECTIONS` to the imports or use the additional import line shown — keep a single import from `./channel-meta` if the reviewer prefers; duplicate import specifiers from the same module are a lint/style concern, so consolidate into the existing import statement.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/channel-meta.test.ts`
Expected: FAIL — `CHANNEL_SECTIONS` is not exported yet.

- [ ] **Step 3: Add the metadata**

In `src/lib/channel-meta.ts`, after the `CHANNEL_META` definition, add:

```ts
export type ChannelSection = {
  title: string
  channels: string[]
}

// Ordered channel groups shown in the create-org flow, mirroring the Figma
// "Full page" frame. Every entry is a key of CHANNEL_META; together the
// sections cover all channels exactly once.
export const CHANNEL_SECTIONS: ChannelSection[] = [
  {
    title: 'Messaging',
    channels: [
      'Web Widget',
      'Slack',
      'Facebook Messenger',
      'WhatsApp',
      'Instagram Direct',
      'Android',
      'iOS',
      'LINE',
    ],
  },
  { title: 'Email', channels: ['Email'] },
  { title: 'Voice', channels: ['Inbound Voice', 'Outbound Voice', 'Web Call'] },
  { title: 'Headless', channels: ['API'] },
]
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/channel-meta.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/channel-meta.ts src/lib/channel-meta.test.ts
git commit -m "feat: add CHANNEL_SECTIONS grouping metadata"
```

---

### Task 3: Rewrite CreateOrgFlow (sectioned, collapsible, full-page, Figma cards)

Replace the flat grid with the sectioned Figma layout: sticky header with scroll shadow, Company name section, Select channels section, four collapsible groups from `CHANNEL_SECTIONS`, and cards with the colored-square white-icon treatment + dark inset selected ring.

**Files:**
- Modify: `src/features/organization/CreateOrgFlow.tsx`
- Modify: `src/features/organization/CreateOrgFlow.test.tsx`

**Interfaces:**
- Consumes: `useOrgs().addOrg` from `@/app/org-context`; `useNavigate` from `react-router`; `CHANNEL_META`, `CHANNEL_SECTIONS` from `@/lib/channel-meta`; `ChevronDown` from `lucide-react`.
- Produces: `export function CreateOrgFlow()` — full-page create flow, no props.

- [ ] **Step 1: Write the failing tests**

Replace the contents of `src/features/organization/CreateOrgFlow.test.tsx` with:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('CreateOrgFlow', () => {
  it('renders the full-page create form with Company name and section headings', () => {
    renderApp('/organization/new')
    expect(screen.getByText('Organization Setup')).toBeInTheDocument()
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /messaging/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^voice$/i })).toBeInTheDocument()
  })

  it('disables Save until a name and a channel are provided', async () => {
    const user = userEvent.setup()
    renderApp('/organization/new')
    const save = screen.getByRole('button', { name: /save/i })
    expect(save).toBeDisabled()

    await user.type(screen.getByLabelText(/company name/i), 'Acme')
    expect(save).toBeDisabled() // name only, no channel

    await user.click(screen.getByRole('button', { name: /^widget$/i }))
    expect(save).toBeEnabled()
  })

  it('collapses a section to hide its cards', async () => {
    const user = userEvent.setup()
    renderApp('/organization/new')
    // "Web Call" lives in the Voice section and is visible by default.
    expect(screen.getByRole('button', { name: /web call/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^voice$/i }))
    expect(screen.queryByRole('button', { name: /web call/i })).not.toBeInTheDocument()
  })

  it('creates an org and returns to the dashboard listing it', async () => {
    const user = userEvent.setup()
    renderApp('/organization/new')
    await user.type(screen.getByLabelText(/company name/i), 'Acme')
    await user.click(screen.getByRole('button', { name: /^widget$/i }))
    await user.click(screen.getByRole('button', { name: /save/i }))

    await screen.findByRole('heading', { name: /organization/i })
    const dashboard = screen.getByTestId('screen-organization')
    expect(within(dashboard).getByText('Acme')).toBeInTheDocument()
  })
})
```

Note on selectors: channel cards expose their display name (`CHANNEL_META[label].display`, e.g. `Widget`). Section toggles expose their section title (e.g. `Voice`). `/^widget$/i` and `/^voice$/i` avoid cross-matching (`Web Widget` label vs `Widget` display; `Voice` vs `Inbound Voice`).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/features/organization/CreateOrgFlow.test.tsx`
Expected: FAIL — no `company name` label, no section toggle buttons in the current flat-grid component.

- [ ] **Step 3: Rewrite CreateOrgFlow**

Replace the contents of `src/features/organization/CreateOrgFlow.tsx` with:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { useOrgs } from '@/app/org-context'
import { CHANNEL_META, CHANNEL_SECTIONS } from '@/lib/channel-meta'

export function CreateOrgFlow() {
  const navigate = useNavigate()
  const { addOrg } = useOrgs()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [scrolled, setScrolled] = useState(false)

  const count = selected.size
  const hasSelection = count > 0
  const canSave = hasSelection && name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    addOrg(name.trim(), Array.from(selected))
    navigate('/organization')
  }

  const handleClose = () => navigate('/organization')

  const toggleChannel = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const toggleSection = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div
      onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
      className="h-screen overflow-y-auto bg-app-backdrop"
    >
      <div className="mx-auto max-w-[1080px] px-10 pt-3 pb-10">
        {/* Sticky header */}
        <div
          className={`sticky top-0 z-20 flex h-[73px] items-center justify-between rounded-t-[20px] bg-white px-6 transition-shadow duration-300 ${
            scrolled ? 'shadow-[0px_8px_16px_0px_rgba(10,13,14,0.06)]' : ''
          }`}
        >
          <p className="text-[22px] font-semibold leading-7 tracking-[0.352px] text-ink">
            Organization Setup
          </p>

          <div className="flex items-center gap-2.5">
            {hasSelection && (
              <p className="mr-4 text-sm font-semibold leading-5 text-ink">
                <span>{count} </span>
                <span className="font-normal text-ink-muted">
                  {count === 1 ? 'channel selected' : 'channels selected'}
                </span>
              </p>
            )}
            <button
              onClick={handleClose}
              className="flex h-10 items-center justify-center rounded-full border border-surface-border px-4 outline-none"
            >
              <span className="text-sm font-semibold leading-5 text-ink">Close</span>
            </button>
            <button
              disabled={!canSave}
              onClick={handleSave}
              className="flex h-10 items-center justify-center rounded-full px-4 outline-none transition-colors disabled:cursor-not-allowed"
              style={{
                backgroundColor: canSave ? '#2f3130' : 'rgba(100,104,100,0.08)',
                color: canSave ? '#ffffff' : '#8b8e89',
              }}
            >
              <span className="text-sm font-semibold leading-5">Save</span>
            </button>
          </div>
        </div>

        {/* Form body */}
        <div className="rounded-b-[20px] bg-white/80 px-10 pb-10 pt-8">
          {/* Company name */}
          <div className="mx-auto max-w-[680px]">
            <label
              htmlFor="org-name"
              className="block text-[22px] leading-7 tracking-[0.352px] text-ink"
            >
              Company name
            </label>
            <p className="mt-2 text-sm leading-5 text-ink-muted">
              Internal company name. This name is not visible to your customers.
            </p>
            <input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give your AI Org a name"
              className="mt-4 h-[42px] w-full rounded-lg border border-surface-border bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-ink"
            />
          </div>

          {/* Select channels */}
          <div className="mx-auto mt-12 max-w-[680px]">
            <p className="text-[22px] leading-7 tracking-[0.352px] text-ink">Select channels</p>
            <p className="mt-2 text-sm leading-5 text-ink-muted">
              Select the customer support channels to enable for your organization. You can always
              edit these later.
            </p>

            {CHANNEL_SECTIONS.map((section) => {
              const isCollapsed = collapsed.has(section.title)
              return (
                <div key={section.title} className="mt-8">
                  <button
                    onClick={() => toggleSection(section.title)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center justify-between outline-none"
                  >
                    <span className="text-lg font-semibold leading-6 tracking-[-0.45px] text-ink">
                      {section.title}
                    </span>
                    <span className="flex size-10 items-center justify-center">
                      <ChevronDown
                        size={20}
                        className={`text-[#646864] transition-transform ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      {section.channels.map((label) => {
                        const { display, color, Icon } = CHANNEL_META[label]
                        const isSelected = selected.has(label)
                        return (
                          <button
                            key={label}
                            onClick={() => toggleChannel(label)}
                            aria-pressed={isSelected}
                            className="flex h-[120px] flex-col items-center justify-center gap-4 rounded-xl border border-[#eae9e8] bg-white outline-none transition-shadow"
                            style={{
                              boxShadow: isSelected ? '0 0 0 2px #373a4d inset' : undefined,
                            }}
                          >
                            <span
                              className="flex size-11 items-center justify-center rounded-[22px]"
                              style={{ backgroundColor: color, opacity: 0.6 }}
                            >
                              <Icon size={22} className="text-white" strokeWidth={2} />
                            </span>
                            <span className="text-sm leading-5 tracking-[-0.154px] text-ink">
                              {display}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
```

Design notes for the reviewer:
- The colored square uses the brand `color` at `opacity: 0.6` (Figma treatment) with a white icon. Because `opacity` on the wrapper would also fade the icon, the icon must NOT be a child that inherits the fade in a way that dims it below legibility — the Figma frame applies opacity to the square including the glyph, so applying `opacity: 0.6` to the wrapper span (icon included) matches the design. Keep it on the wrapper as written.
- `aria-pressed` on cards and `aria-expanded` on section toggles give the buttons real selection/disclosure semantics (better than the prototype, which had neither) and make the tests robust.
- Card display text is `CHANNEL_META[label].display`; the count/name/save gating logic is unchanged from the previous implementation.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/features/organization/CreateOrgFlow.test.tsx`
Expected: PASS (all four tests).

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: PASS — no regressions.

- [ ] **Step 6: Typecheck + build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx vite build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/features/organization/CreateOrgFlow.tsx src/features/organization/CreateOrgFlow.test.tsx
git commit -m "feat: rebuild create-org flow to Figma sectioned full-page layout"
```

---

## Self-Review

**Spec coverage:**
- Full-page mechanism (RootLayout + sibling route) → Task 1. ✓
- OrgProvider single-instance moved to RootLayout → Task 1. ✓
- Channel section metadata → Task 2. ✓
- Company name + Select channels sections, verbatim copy → Task 3. ✓
- Four collapsible groups, functional collapse → Task 3 (chevron toggle, `aria-expanded`, cards hidden when collapsed). ✓
- Colored-square white-icon cards + dark inset selected ring → Task 3. ✓
- Save gating + navigation, Close → Task 3 (logic preserved). ✓
- Tests: full-page (no top bar), collapse, save gating, regression → Tasks 1 & 3. ✓

**Placeholder scan:** No TBD/TODO; all steps contain complete code and exact commands.

**Type consistency:** `CHANNEL_SECTIONS` (Task 2) is consumed by Task 3 with matching shape (`title`, `channels`). `CHANNEL_META[label]` destructures `{ display, color, Icon }` — matches the existing definition. `RootLayout` (Task 1) is a no-prop component consumed only by `routes.tsx`.
