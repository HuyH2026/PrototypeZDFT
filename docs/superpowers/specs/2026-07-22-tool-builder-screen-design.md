# Tool Builder Screen — Design

**Date:** 2026-07-22
**Route:** `/tools` (nav item "Tools")
**Figma:** `LMPNsX1T3nwkueIRUCDktm`, node `747:86563` ("05 Tools expanded")

## Goal

Replace the "Coming soon" placeholder at `/tools` with the **Tool Builder** screen
from Figma: a title + tab strip (Available / Recommended / Authentication /
History) over a data table of tool actions. The screen is a **mock UI** ported
from the design — frontend-only, no backend.

## Scope & interactivity

- **Tab switching is the only live interaction** — it is view navigation (local
  `useState`), identical to the CX Journey tab strip. Switching tabs swaps the
  body; the non-Available tabs show titled empty regions.
- **Everything else is presentational / inert**: Search input, "Filter by"
  button, "Import action" and "Create new…" buttons, the gear icon, row and
  select-all checkboxes, sort carets, and per-row `⋮` menus. This matches the
  fully-presentational convention used by the initial Orchestrator toolbar.
- The other three tabs (**Recommended, Authentication, History**) render titled
  empty regions with no fabricated data — the same approach Insights sub-views
  take for unknown content.

## Nav & title

- The nav label stays **"Tools"** (no change to `NAV_ITEMS`).
- The screen **title is "Tool Builder"** to match the Figma frame.

## Architecture

A new flat feature under `src/features/tools/`, mirroring `src/features/orchestrator/`
(screen owns state, presentational children, mock data in one file). Routing
moves `/tools` out of the derived placeholder set into an explicit route, exactly
as `/orchestrator` is handled.

### Components

- **`ToolsScreen.tsx`** — `data-testid="screen-tools"`. Renders the title row
  ("Tool Builder" + inert gear icon), the tab strip, and the active tab body.
  Owns `useState<ToolTab>` (the only live state). Available tab renders the
  toolbar + table; the other tabs render titled empty regions.
- **`tools-data.ts`** — types + mock data: `ToolAction[]` (the 5 rows), the
  `TOOL_TABS` list, and the union types (`ToolType`, `ToolState`).
- **`ToolsToolbar.tsx`** — presentational: Search input, "Filter by" button, and
  right-aligned "Import action" (outline pill) + "Create new…" (dark filled pill).
- **`ToolsTable.tsx`** — the Available-tab table: a header row (select-all
  checkbox, sortable column labels with carets, an info icon on State) plus data
  rows. Each row: checkbox, colored round icon avatar, name + description, Type,
  agents-in-use chip (or "n/a"), conversations count, State badge, last-modified,
  and an inert `⋮` button. All controls inert.

## Data model (`tools-data.ts`)

```ts
export type ToolTab = 'Available' | 'Recommended' | 'Authentication' | 'History'
export const TOOL_TABS: ToolTab[] = ['Available', 'Recommended', 'Authentication', 'History']

export type ToolType = 'API' | 'Imported' | 'MCP' | 'Browser'
export type ToolState = 'Live' | 'Read only' | 'Auto-saved'

export type ToolAction = {
  id: string
  name: string            // "Action name 001"
  description: string     // "Placeholder for action description"
  type: ToolType
  iconTint: 'blue' | 'slate'          // #3492ef vs #acbdd5 avatar (from frame)
  agents: { label: string; extra: number } | null  // "Agent name +5" | null → "n/a"
  conversations: number   // 100, 40, 1000, 950, 200
  state: ToolState
  lastModified: string    // "Feb 13, 2024, 12:43 PM"
}
```

### Rows (exactly as the frame)

| # | name           | type     | tint  | agents        | conversations | state       |
|---|----------------|----------|-------|---------------|---------------|-------------|
| 1 | Action name 001| API      | blue  | Agent name +5 | 100           | Live        |
| 2 | Action name 002| Imported | slate | Agent name +5 | 40            | Read only   |
| 3 | Action name 003| Imported | slate | n/a           | 1,000         | Read only   |
| 4 | Action name 004| MCP      | blue  | n/a           | 950           | Live        |
| 5 | Action name 005| Browser  | blue  | n/a           | 200           | Auto-saved  |

All rows share the description "Placeholder for action description" and last
modified "Feb 13, 2024, 12:43 PM". The **"Name (113)"** count is a static header
label (not `rows.length`).

## Visual details (tokens per CLAUDE.md)

- Screen title "Tool Builder" ~22px `text-ink`. Tab strip reuses the CX Journey
  pattern: active = `-mb-px border-b-2 border-ink pb-3 … text-ink`, inactive =
  `text-ink-muted`; `role="tab"` + `aria-selected`.
- **State badges:** Live → green (`#048c80` = `green-500`); Read only → bordered
  neutral pill; Auto-saved → grey (`#9194a0` = `grey-500`). Type is plain text.
- **Agents chip:** slate-tinted pill with a small icon + "Agent name +5" (same
  shape as the orchestrator agent chip). `null` → muted "n/a".
- **Table:** a bordered grid with vertical dividers using the
  `border-r border-surface-border` grid pattern from `TopicsTable`, rounded-top
  corners, `#fbfbfb` (≈ `beige-100`) header cells. A fixed `grid-cols-[…]`
  template is shared by the header and every row so dividers line up.
- Prefer semantic token classes / exposed Garden palette classes over raw hex
  where a token exists (per CLAUDE.md). Genuine one-off tints (e.g. `#fbfbfb`,
  per-avatar blue/slate) may stay inline.

## Routing & nav

- `src/routes.tsx`: add `'/tools'` to the `BUILT` set, import `ToolsScreen`, and
  add `{ path: 'tools', element: <ToolsScreen /> }` to the AppLayout children.
- `NAV_ITEMS` is unchanged (label stays "Tools").

## Testing (Vitest + RTL)

- `tools-data`: shape assertions on `TOOL_ACTIONS` and `TOOL_TABS`.
- `ToolsTable`: renders 5 rows, correct Type/State/agents per row, "n/a" for
  null agents.
- Tab switching: clicking a tab swaps the body, scoped with
  `within(getByTestId('screen-tools'))`.
- Routing: `/tools` renders `screen-tools` and NOT the placeholder; mirrors
  `orchestrator.routes.test.tsx`.

## Out of scope

- Any real behavior behind Search, Filter, Import action, Create new…, sort,
  checkboxes, or the `⋮` menus.
- Real content for the Recommended / Authentication / History tabs.
- Any backend or persistence.
