# Create Organization Full-Page Flow — Design

**Date:** 2026-07-20
**Status:** Approved

## Goal

Make the Create Organization flow (`/organization/new`) a **full-page takeover** that matches the Figma design — no navigation rail, no top bar — and rebuild its content to the Figma structure: a "Company name" section and a "Select channels" section with four collapsible, labeled channel groups whose cards use the design's colored-square icon treatment.

## Problem

Today `CreateOrgFlow` renders inside `AppLayout`'s `<Outlet/>`, so the persistent chrome (64px nav rail + top bar) stays on screen and the flow is boxed into the content area. The prototype instead returns the flow *before* the shell, so it owns the entire viewport. The content is also a flat 3-column grid of all 13 channels with a brand-tint card style, whereas the Figma groups channels into **Messaging / Email / Voice / Headless** sections with 18px headings + collapse chevrons and a colored-square icon treatment.

## Reference

Canonical source is the Figma Make prototype (file `X4Q8UgWwZQUsBN7cTDDeEY`):
- `src/app/components/create-org-flow.tsx` — the flow shell (sticky header, scroll shadow, Close/Save, selection state).
- `src/app/App.tsx` — shows the full-page mechanism: when `currentScreen === "CreateOrg"`, App returns the flow **before** rendering the nav shell.
- `src/imports/FullPage/index.tsx` — the authored form: section headings, helper copy, channel grouping, and card geometry.

## Architecture

### Full-page mechanism: pathless root layout route

Introduce a **pathless root route** that owns the single `<OrgProvider>` and renders a bare `<Outlet/>`. It has two children:

```
root route (element: RootLayout — OrgProvider + <Outlet/>)
├── path "/"  → AppLayout (shell: rail + top bar + Outlet)
│                ├── index            → HomeScreen
│                ├── insights/*       → InsightsScreen
│                ├── organization     → OrganizationScreen
│                └── …placeholders
└── path "/organization/new" → CreateOrgFlow   (full screen, sibling of the shell)
```

- `OrgProvider` moves **out of `AppLayout`** and **into `RootLayout`**, so it wraps both the shell and the create flow. This preserves the CLAUDE.md guarantee of a single provider whose state survives create→dashboard navigation — the flow and the dashboard are both descendants of the same provider.
- `AppLayout` no longer renders `OrgProvider` (it keeps `isExpanded`, `TopBar`, sidebar swap, and its own `<Outlet/>`).
- `CreateOrgFlow` is a sibling of `AppLayout`, not a child, so it renders with no chrome — the full-page takeover.
- The `/organization/new` route moves from being a child of `/` to being a child of the root route. `/organization` (the dashboard) stays inside `AppLayout`.

This mirrors the prototype's "return before the shell" pattern using real routing, with no second provider and no `position: fixed` overlay hack.

### Channel section metadata

`src/lib/channel-meta.ts` is the single source of truth for channels. Add an ordered section grouping so the flow renders groups from data rather than hardcoding channel lists in the component. Introduce:

```ts
export type ChannelSection = {
  title: string          // "Messaging" | "Email" | "Voice" | "Headless"
  channels: string[]     // labels, in Figma order; each is a key of CHANNEL_META
}

export const CHANNEL_SECTIONS: ChannelSection[] = [
  { title: 'Messaging', channels: ['Web Widget', 'Slack', 'Facebook Messenger', 'WhatsApp', 'Instagram Direct', 'Android', 'iOS', 'LINE'] },
  { title: 'Email', channels: ['Email'] },
  { title: 'Voice', channels: ['Inbound Voice', 'Outbound Voice', 'Web Call'] },
  { title: 'Headless', channels: ['API'] },
]
```

`CHANNEL_META` is unchanged. Every label in `CHANNEL_SECTIONS` is an existing key of `CHANNEL_META`, and together the sections cover all 13 keys exactly once.

### CreateOrgFlow rewrite

Full-page scroll container on the `#f1efed` (`app-backdrop`) backdrop; a 680px centered content column.

**Sticky header (73px, white, rounded-top):**
- Left: `Organization Setup` (22px semibold, `text-ink`).
- Right cluster: `N channel(s) selected` count (shown only when ≥1 selected) + `Close` button (bordered pill) + `Save` button (dark pill when enabled, muted when disabled).
- Scroll shadow: header gains `shadow-[0px_8px_16px_0px_rgba(10,13,14,0.06)]` once the container is scrolled past ~20px; tracked with local `scrolled` state on the scroll container's `onScroll`.

**Company name section:**
- Heading `Company name` (22px), helper `Internal company name. This name is not visible to your customers.` (14px muted).
- Text input, placeholder `Give your AI Org a name`, bound to `name` state.

**Select channels section:**
- Heading `Select channels` (22px), helper `Select the customer support channels to enable for your organization. You can always edit these later.` (14px muted).

**Four collapsible channel groups** rendered from `CHANNEL_SECTIONS`:
- Each group: an 18px semibold heading (`text-ink`) on the left and a **chevron toggle button** on the right.
- **Functional collapse:** clicking the chevron (or heading row) toggles that section's expanded state. Collapsed → cards hidden; the chevron rotates to indicate state. Default: all expanded. Collapse state is local component state (a `Set<string>` of collapsed section titles or equivalent); not persisted.
- Cards: 3-column grid (`grid-cols-3`, 16px gap), each card 120px tall.

**Card:**
- White background, `#eae9e8` border, `rounded-[12px]`.
- Icon: the channel's lucide `Icon` (white stroke) centered inside a **brand-color rounded square at 60% opacity** — square uses `CHANNEL_META[label].color` as background with `opacity: 0.6`, icon is white. Label (14px, centered, `text-ink`) below.
- **Selected state:** dark inset ring `box-shadow: 0 0 0 2px #373a4d inset` (Figma treatment), replacing the current brand-tint background/border style.
- Whole card is a button; clicking toggles selection.

### Behavior

- `canSave = name.trim().length > 0 && selected.size > 0`.
- `Save` (enabled) → `addOrg(name.trim(), Array.from(selected))` then `navigate('/organization')`.
- `Close` → `navigate('/organization')`.
- Selection is a `Set<string>` of channel labels; toggling adds/removes.

## Components / Files

- **Modify** `src/routes.tsx` — add `RootLayout` root route; nest `AppLayout` under it at `/`; move `organization/new` to be a child of the root route (sibling of `AppLayout`).
- **Create** `src/app/layout/RootLayout.tsx` — `<OrgProvider><Outlet/></OrgProvider>`.
- **Modify** `src/app/layout/AppLayout.tsx` — remove `OrgProvider` wrapper (keep everything else).
- **Modify** `src/lib/channel-meta.ts` — add `ChannelSection` type + `CHANNEL_SECTIONS`.
- **Modify** `src/features/organization/CreateOrgFlow.tsx` — full rewrite to the sectioned, collapsible, full-page layout with Figma card styling.
- **Modify/create tests** — `CreateOrgFlow.test.tsx` (full-page: no TopBar/rail; section collapse; save gating + navigation). Keep org-context and screen tests green.

## Testing

1. **Full-page:** rendering `/organization/new` shows the flow with **no** top bar / nav rail (assert `TopBar`'s known content, e.g. the `AI Agent` product switcher, is absent; assert `Organization Setup` present).
2. **Section collapse:** each section heading toggles visibility of its cards (e.g. collapsing "Voice" hides `Web Call`).
3. **Save gating:** `Save` disabled with empty name or no selection; entering a name + selecting a channel enables it; clicking it calls `addOrg` and navigates to `/organization`.
4. **Close:** navigates to `/organization` without creating an org.
5. **Regression:** existing `org-context`, `OrganizationScreen`, routing/active-state tests remain green.

## Out of Scope

- No backend; org creation stays in-memory via `useOrgs().addOrg`.
- No persistence of collapse state.
- No changes to the Organization dashboard, sidebar, or top bar beyond removing the `OrgProvider` wrapper from `AppLayout`.
- No mobile/tablet layouts (desktop-fluid, ≥1024px, consistent with the rest of the app).

## Known deltas from Figma

- Icons use the existing `lucide-react` set already mapped in `CHANNEL_META`, not the prototype's hand-ported per-channel SVGs. Colors and the colored-square treatment match; exact glyph paths may differ slightly.
- Fixed 1440px canvas / `ScaledStage` from the prototype is intentionally **not** reproduced — the flow is desktop-fluid with a centered 680px column, consistent with the app's no-fixed-canvas layout model.
