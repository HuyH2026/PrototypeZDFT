# AI Agents → Configuration Screen — Design

**Date:** 2026-07-21
**Status:** Approved (pending user spec review)
**Figma:** file `LMPNsX1T3nwkueIRUCDktm`, frame `Config_01` (node `597:165377`)

## Overview

A widget-branding studio living at `/ai-agents/configuration`. It is a
frontend-only mock (no backend), consistent with the Home dashboard and the CX
Journey screens. The layout is a full-height white rounded surface containing:

- a sticky **top strip** — "Configuration" title, a centered channel-tab pill
  group (Widget / Voice / Web Call / Headless), and right-aligned **Preview**
  (ghost) + **Publish** (dark filled) buttons;
- a three-column body — a **brand list** (left), a **live chat-widget preview**
  (center), and a **Branded-widget config panel** (right) whose far edge carries
  a 64px customization icon rail.

Only the **Widget** tab is fully designed. Voice / Web Call / Headless render a
centered "Coming soon" body while the top strip stays put. The screen is
selection-driven: choosing a brand updates the preview and the panel fields;
tabs, the icon rail, the enabled toggle, and the default checkbox all flip local
state.

## Scope

**In scope:** the Configuration view (Widget tab), nested `/ai-agents` routing,
mock data, selection/edit interactions, tests.

**Out of scope / deferred:** real backend or persistence (all state is in-memory
and resets on reload — no `localStorage`); Voice / Web Call / Headless tab
content; Agent Builder and QA screens (placeholders); swapping the right panel's
content when a different icon-rail section is selected (the rail highlights the
active icon but the panel always shows "Branded widget" in this phase).

## Global Constraints

- **No backend.** All data mocked in `config-data.ts`; edits live in component
  `useState` only and reset on reload. Do **not** add `localStorage`.
- **TypeScript strict**, fully typed. Path alias `@` → `src/`.
- **Tailwind v4 semantic token classes** where a token exists (`text-ink`,
  `text-ink-muted`, `border-surface-border`, `bg-white`, `bg-nav-active`).
  One-off greys / brand colors go inline (consistent with CX Journey). Do
  **NOT** introduce `font-['SF_Pro_*']` arbitrary font-family classes — the SF
  stack is already the default via `--font-sans`.
- **Icons:** use `lucide-react` everywhere on this screen (not the custom
  nav-icon SVGs, which are rail-only). Do not embed the Figma asset URLs — they
  expire.
- **Gates:** `npx tsc --noEmit` and `npx vitest run` must pass. `pnpm lint` is
  known-broken (TS7 vs typescript-eslint) — do not rely on it.
- **Tests** use Vitest + RTL (jsdom). Scope screen assertions with
  `within(getByTestId('view-configuration'))` rather than page-wide text
  matches.
- **Commit trailer:** `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

## File Structure

All new files under `src/features/ai-agents/`:

```
src/features/ai-agents/
  AiAgentsScreen.tsx                       # white rounded surface + <Outlet/> (mirrors InsightsScreen)
  configuration/
    config-data.ts                         # mock brands, tabs, rail sections, types
    ConfigurationView.tsx                  # page shell: sticky top strip + 3-col body; owns all state
    BrandList.tsx                          # "Create new" + selectable brand rows
    WidgetPreview.tsx                      # center chat-widget mock
    BrandedWidgetPanel.tsx                 # right config panel + far-right icon rail
    ConfigurationView.test.tsx             # behavior tests for the view
```

Modified:

- `src/routes.tsx` — add `/ai-agents` to `BUILT`; add the nested route block.
- (No change to `nav-config.ts`: the AI Agents submenu already lists
  `['Agent Builder', 'Configuration', 'QA']`.)

### Responsibilities

- **AiAgentsScreen** — thin surface wrapper: `data-testid="screen-ai-agents"`,
  `className="h-full rounded-[26px] bg-white"`, renders `<Outlet/>`. Exactly like
  `InsightsScreen`.
- **ConfigurationView** — the whole Configuration screen. Owns `activeTab`,
  `selectedBrandId`, `activeSection`, and the editable per-brand `brands` state.
  Renders the sticky top strip and, below it, either the 3-column Widget body or
  a "Coming soon" body for other tabs.
- **config-data.ts** — types + seed data only. No React.
- **BrandList** — presentational list; takes `brands`, `selectedId`, `onSelect`.
- **WidgetPreview** — presentational; takes the selected brand's display name.
- **BrandedWidgetPanel** — the config form + icon rail; takes the selected brand
  and change handlers.

## Data Model (`config-data.ts`)

```ts
// src/features/ai-agents/configuration/config-data.ts
// Mock data + types for the AI Agents → Configuration (Widget) screen.
// Frontend-only; no backend. Values mirror the Figma design.

export type ChannelTab = { id: 'widget' | 'voice' | 'webcall' | 'headless'; label: string }

export const CHANNEL_TABS: ChannelTab[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'voice', label: 'Voice' },
  { id: 'webcall', label: 'Web Call' },
  { id: 'headless', label: 'Headless' },
]

// A brand a customer can configure a widget for. `swatch` is the list dot color.
export type Brand = {
  id: string
  name: string
  swatch: string // hex, list swatch/dot
  tags: string[]
  isDefault: boolean
  enabled: boolean
}

export const SEED_BRANDS: Brand[] = [
  { id: 'vip', name: 'SpaceX support', swatch: '#e0559a', tags: ['Existing Tag 1', 'Existing Tag 2', 'Existing Tag 3', 'Existing Tag 4'], isDefault: true, enabled: true },
  { id: 'member', name: 'Member', swatch: '#4f8bf0', tags: ['Existing Tag 1'], isDefault: false, enabled: true },
  { id: 'partner', name: 'Partner', swatch: '#a06cf0', tags: [], isDefault: false, enabled: false },
]

// The list shows a short label (VIP / Member / Partner); `name` is the editable
// brand-name field shown in the preview header + panel input.
export const BRAND_LIST_LABELS: Record<string, string> = { vip: 'VIP', member: 'Member', partner: 'Partner' }

// Right-edge customization rail. Only the first ('brands') is "active" content;
// the rest highlight on click but do not swap the panel in this phase.
import type { LucideIcon } from 'lucide-react'
import { Users, Link2, Heart, BadgeCheck, Smile, Megaphone, Code2, Globe, MessageSquare } from 'lucide-react'

export type RailSection = { id: string; icon: LucideIcon; label: string }

export const RAIL_SECTIONS: RailSection[] = [
  { id: 'brands', icon: Users, label: 'Brands' },
  { id: 'links', icon: Link2, label: 'Links' },
  { id: 'sentiment', icon: Heart, label: 'Sentiment' },
  { id: 'license', icon: BadgeCheck, label: 'License' },
  { id: 'mood', icon: Smile, label: 'Mood' },
  { id: 'announce', icon: Megaphone, label: 'Announcements' },
  // divider rendered between announce and the trailing group
  { id: 'code', icon: Code2, label: 'Code' },
  { id: 'locale', icon: Globe, label: 'Locale' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
]

// Suggested tags offered by the "Assign tags" dropdown (decorative — clicking
// the dropdown does nothing in this phase; chips come from the brand).
export const SUGGESTED_TAGS = ['Existing Tag 1', 'Existing Tag 2', 'Existing Tag 3', 'Existing Tag 4']
```

## Component Specs

### AiAgentsScreen

```tsx
import { Outlet } from 'react-router'

export function AiAgentsScreen() {
  return (
    <div data-testid="screen-ai-agents" className="h-full rounded-[26px] bg-white">
      <Outlet />
    </div>
  )
}
```

### ConfigurationView (state owner)

- `data-testid="view-configuration"`, `className="flex h-full flex-col"`.
- State:
  - `const [activeTab, setActiveTab] = useState<ChannelTab['id']>('widget')`
  - `const [brands, setBrands] = useState<Brand[]>(SEED_BRANDS)`
  - `const [selectedId, setSelectedId] = useState('vip')`
  - `const [activeSection, setActiveSection] = useState('brands')`
- Derived: `const selected = brands.find((b) => b.id === selectedId)!`
- Handlers:
  - `updateSelected(patch: Partial<Brand>)` → `setBrands((bs) => bs.map((b) => b.id === selectedId ? { ...b, ...patch } : b))`
  - name change → `updateSelected({ name })`; toggle → `updateSelected({ enabled })`;
    default checkbox → `updateSelected({ isDefault })`.
- **Top strip** (sticky): `sticky top-0 z-10 flex items-center bg-white px-8 pt-6 pb-4`.
  - Left: `<h1 className="text-[20px] font-semibold text-ink">Configuration</h1>`
  - Center: tab pill group — a `rounded-full bg-app-backdrop p-1 flex gap-1`
    container; each tab a button, active = `bg-white text-ink shadow-sm`, inactive
    = `text-ink-muted`. Each tab has a small leading lucide icon (Widget→`MessageSquare`,
    Voice→`Mic`, Web Call→`Phone`, Headless→`Code2`). Use `ml-auto`/`mr-auto`
    or a 3-slot flex so the group sits centered.
  - Right: **Preview** ghost button (`text-[14px] text-ink-muted`), **Publish**
    filled pill (`rounded-full bg-ink px-4 py-1.5 text-[14px] font-medium text-white`).
- **Body:**
  - If `activeTab !== 'widget'`: render a centered coming-soon block
    (`flex flex-1 flex-col items-center justify-center text-ink-muted`) with the
    tab label + "Coming soon". Reuse the visual idiom of `PlaceholderScreen` but
    inline (do not route away).
  - If `activeTab === 'widget'`: a 3-column flex row filling remaining height
    (`flex flex-1 gap-6 overflow-hidden px-8 pb-8`):
    - `<BrandList brands={brands} selectedId={selectedId} onSelect={setSelectedId} />`
    - `<WidgetPreview brandName={selected.name} />` (center, flex-1, centered card)
    - `<BrandedWidgetPanel brand={selected} activeSection={activeSection}
       onSectionChange={setActiveSection} onNameChange={(name) => updateSelected({ name })}
       onToggleEnabled={() => updateSelected({ enabled: !selected.enabled })}
       onToggleDefault={() => updateSelected({ isDefault: !selected.isDefault })} />`

### BrandList

- Column ~180px: `flex w-[180px] flex-col gap-2`.
- "Create new" outline button at top: `rounded-full border border-surface-border
  px-4 py-2 text-[14px] text-ink` (inert — no handler needed, or a no-op).
- Rows: for each brand, a button `flex items-center gap-2 rounded-lg px-3 py-2
  text-left text-[14px]`; selected row adds `bg-nav-active`. Contents: a
  `h-3 w-3 rounded-[3px]` swatch (`style={{ backgroundColor: brand.swatch }}`),
  the list label (`BRAND_LIST_LABELS[brand.id] ?? brand.name`), and — on the
  selected row — a trailing `h-1.5 w-1.5 rounded-full bg-accent-blue` status dot.
- Calls `onSelect(brand.id)` on click.

### WidgetPreview

- Center card, presentational. `mx-auto flex w-[320px] flex-col overflow-hidden
  rounded-2xl bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.08)]`.
- **Header:** dark bar `flex items-center gap-2 bg-[#1b1b1b] px-4 py-4 text-white`
  — a small logomark placeholder (a lucide `Rocket` or a simple SVG-free colored
  square is fine) + `{brandName}` in `text-[15px] font-medium`.
- **Body:** `flex flex-col gap-3 px-4 py-4`:
  - hint line: `text-[13px] italic text-accent-blue` → "Personalize your chat by
    using the menu on the right"
  - inbound bubble: grey — `self-start rounded-2xl bg-app-backdrop px-3 py-2
    text-[13px] text-ink max-w-[85%]` → "Bonjour, Hola, Hello and welcome! How can
    I help make your day awesome? What can I do to assist you today?"
  - outbound bubble: dark — `self-end rounded-2xl bg-[#1b1b1b] px-3 py-2
    text-[13px] text-white max-w-[85%]` → "I have some issues with my account"
- **Composer:** `mx-4 mb-3 rounded-full border border-surface-border px-4 py-2
  text-[13px] text-ink-muted` → "Ask a question…"
- **Footer:** `flex items-center justify-center gap-1 border-t border-surface-border
  py-2 text-[12px] text-ink-muted` → "Built with Zendesk" (a small lucide icon +
  text is fine).

### BrandedWidgetPanel

- Outer: `flex` — the frosted card + the icon rail side by side, total width
  ~484px. Card `flex-1`.
- **Card:** `rounded-[24px] border border-white/80 bg-white/80 p-6
  shadow-[0_0_30px_0_rgba(0,0,0,0.08)] backdrop-blur-xl`.
  - Heading: `text-[18px] tracking-[-0.45px] text-black` → "Branded widget".
  - Paragraph: `mt-4 text-[14px] leading-5 text-[#404241]` with **brands**,
    **personalized look**, **tagged brands** in `font-semibold`. Copy verbatim:
    "This section lets you create unique widget designs for different **brands**,
    giving each a **personalized look**. You can control which users see a widget
    by applying tags, so only those in the **tagged brands** will see it. This
    ensures targeted visibility and a tailored experience for your audience."
  - **Brand name** group (`mt-6`): label `text-[14px] font-semibold text-black`;
    help `mt-1 text-[12px] text-[#727583]` → "The name serves as a label for
    accessing and filtering workflows and insights."; input `mt-2 w-full rounded-lg
    border border-[#b7b7b3] bg-white px-3 py-2.5 text-[14px] text-ink` bound to
    `brand.name`, `onChange` → `onNameChange(e.target.value)`; sub-help
    `mt-1 text-[12px] text-[#999b97]` → "Keep it under 50 characters".
  - **Tags** group (`mt-6`): label + help ("Tag this brand to associate it with
    specific segments. Editing and managing tags can be done within " + a
    `text-[#406cc4]` "Global Tags." span). An "Assign tags" dropdown row:
    `flex items-center justify-between rounded-lg border border-[#b7b7b3] bg-white
    px-4 py-2.5 text-[14px] text-[#9194a0]` with a trailing `ChevronDown`
    (inert). Below it, chips wrapped: `flex flex-wrap gap-2` of
    `brand.tags.map(...)` → each chip `inline-flex items-center gap-1.5 rounded-full
    border border-[#d2d9e5] bg-[#f2f4f7] px-2.5 py-1 text-[12px] text-black` with a
    leading `Tag` icon (14px) and a trailing `X` icon (inert).
  - **Set as Default** checkbox (`mt-6`): a native `<input type="checkbox"
    checked={brand.isDefault} onChange={onToggleDefault} />` styled minimally +
    label "Set as Default" (`text-[14px] text-ink`); help below
    `text-[12px] text-[#727583]` → "Enable this brand by default if no specific
    tags are assigned or found in the " + `text-[#406cc4]` "embedded script" + ".".
  - **Widget enabled** toggle (`mt-6`): a button-based toggle
    (`role="switch" aria-checked={brand.enabled}`) — track `h-5 w-10 rounded-full`
    (`bg-[#2d7e55]` when on, `bg-surface-border` when off) with a `h-3 w-3
    rounded-full bg-white` knob translated right when on; label "Widget enabled for
    this brand" (`text-[14px] text-ink`); help `text-[12px] text-[#727583]` →
    "When off, the widget will not appear for users of this brand." Clicking calls
    `onToggleEnabled`.
- **Icon rail** (far right): `flex w-[64px] flex-col items-center gap-2 border-l
  border-surface-border px-2 py-5`. Render `RAIL_SECTIONS`: each a 32px button
  `flex size-8 items-center justify-center rounded-lg`; active section
  (`activeSection === id`) gets `bg-[#ebf5f7]` with the icon in a teal tone
  (`text-[#193d50]`), inactive `text-ink-muted`. Insert a thin `border-t
  border-surface-border w-6 my-1` divider before the trailing group (`id === 'code'`
  is the first of the trailing group). Each button calls `onSectionChange(id)`.
  Icon size 16px.

## Routing (`src/routes.tsx`)

```tsx
const BUILT = new Set(['/', '/insights', '/organization', '/ai-agents'])
```

Add the nested block inside the `AppLayout` children (alongside `insights`):

```tsx
{
  path: 'ai-agents',
  element: <AiAgentsScreen />,
  children: [
    { index: true, element: <ConfigurationView /> },
    { path: 'configuration', element: <ConfigurationView /> },
    { path: 'agent-builder', element: <PlaceholderScreen title="Agent Builder" /> },
    { path: 'qa', element: <PlaceholderScreen title="QA" /> },
  ],
},
```

Imports at top: `AiAgentsScreen`, `ConfigurationView`. Because `/ai-agents` is
now in `BUILT`, it is excluded from the derived `placeholderRoutes`, so no
duplicate route is generated.

`findNavItemByPath` already resolves `/ai-agents/configuration` → AI Agents via
its prefix match (`pathname.startsWith(i.path + '/')`), so active nav highlighting
works with no change.

## Testing (`ConfigurationView.test.tsx`)

Render `ConfigurationView` (wrapped in a `MemoryRouter` only if it needs routing
context; it does not — no `<Outlet/>`, no `<Link>` — so a bare render works).
Scope with `within(screen.getByTestId('view-configuration'))`.

1. **renders shell** — title "Configuration", all four tab labels, three brand
   list labels (VIP / Member / Partner), and "Branded widget".
2. **brand selection** — the brand-name input initially shows "SpaceX support";
   click the "Member" brand row → input value becomes "Member"; the preview header
   shows "Member".
3. **tab switch** — click "Voice" → body shows "Coming soon" and the Widget
   3-column body (e.g. "Branded widget") is gone; "Voice" tab has active styling
   (assert via `aria-current` or a class check — set `aria-selected`/`aria-current`
   on the active tab to make this testable).
4. **enabled toggle** — the "Widget enabled" switch starts `aria-checked="true"`
   for VIP; click it → `aria-checked="false"`.
5. **default checkbox** — VIP checkbox starts checked; clicking unchecks it.

Add a routing test (in `ConfigurationView.test.tsx` or a small `ai-agents.routes.test.tsx`):

6. **routing** — using `createMemoryRouter(routes, { initialEntries: ['/ai-agents/configuration'] })`
   + `RouterProvider`, assert the Configuration view renders; with
   `['/ai-agents/agent-builder']`, assert the placeholder ("Agent Builder" +
   "Coming soon") renders. And `findNavItemByPath('/ai-agents/configuration')?.label
   === 'AI Agents'`.

**Accessibility affordances added for testability:**
- active tab button: `aria-current={activeTab === tab.id ? 'page' : undefined}`
  (or `aria-selected` with `role="tab"`).
- enabled toggle: `role="switch"` + `aria-checked`.
- brand rows: `aria-pressed={selectedId === brand.id}` (optional but nice).

## Verification

- `npx tsc --noEmit` clean.
- `npx vitest run` all green (existing 78 + new).
- Visual check against the Figma frame via the dev server (`npx vite`) +
  Playwright screenshot of `/ai-agents/configuration`, comparing to
  `Config_01`.

## Self-Review Notes

- Spec coverage: top strip, tabs, brand list, preview, config panel, icon rail,
  routing, tests — all mapped to files/tasks. ✓
- No placeholders in the spec (concrete copy, class strings, handlers). ✓
- Type consistency: `Brand`, `ChannelTab`, `RailSection` used consistently
  across data + components; handler names (`onNameChange`, `onToggleEnabled`,
  `onToggleDefault`, `onSectionChange`, `onSelect`) fixed here. ✓
- Scope: single screen + its routing — appropriate for one plan. ✓
