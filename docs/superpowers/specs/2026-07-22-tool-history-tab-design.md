# Tool Builder History Tab — Design

**Date:** 2026-07-22
**Screen:** Tool Builder `/tools`, History tab
**Figma:** `LMPNsX1T3nwkueIRUCDktm`, node `755:167275` ("05 Tools expanded")

## Goal

Replace the History tab's shared "Coming soon"-style inert placeholder with a
real static table matching the Figma frame: a run log with Run date, Name,
Type, Channel, Conversation ID, and Status columns. Frontend-only mock UI, no
backend — same convention as the rest of `src/features/tools/`.

## Scope & interactivity

- Fully presentational, like the Available tab's `ToolsTable`: no sorting, no
  filtering, no row click-through, no search. The only interactivity in
  `ToolsScreen` remains the existing top-level tab strip (Available /
  Recommended / Authentication / History).
- Header sort carets, the `Run (N)` count, and any row affordance are static
  visuals only — same treatment as the Available table's inert checkboxes and
  sort arrows.

## Data binding

- Each history row references an existing `ToolAction` by id (`toolId`), and
  looks up its `name`/`description`/`iconTint` from `TOOL_ACTIONS` — reusing
  the Name-column avatar/title/description pattern already in `ToolsTable`,
  rather than duplicating action names into new mock rows.
- Run date, type, channel, conversation ID, and status are new mock fields
  with fresh placeholder values (not copied verbatim from the Figma example
  rows), covering all three status states and a mix of channels/types.

## Architecture

New files in `src/features/tools/`:

- **`ToolsHistoryTable.tsx`** — `data-testid="tools-history-table"`. Renders
  the header row (`Run (N)` · Name · Type · Channel · Conversation ID ·
  Status, `bg-[#fbfbfb]`, same fixed grid-template-column approach as
  `ToolsTable`'s `COLS` constant) and one row per `TOOL_RUNS` entry. Each row
  looks up its `ToolAction` via `TOOL_ACTIONS.find(a => a.id === run.toolId)`
  and renders the same avatar + name/description cell as `ToolsTable`.
  Exports nothing beyond the component; internal-only `ChannelPill` and
  `RunStatusBadge` live in this file (small, single-use, not reused
  elsewhere).

### Modified files

- **`tools-data.ts`**: add `RunStatus = 'In progress' | 'Completed' |
  'Failed'`, `ToolRun` type (`{ id, toolId, runAt, type, channel,
  conversationId: string | null, status: RunStatus }`), and a `TOOL_RUNS:
  ToolRun[]` mock array (5 entries, one per existing `TOOL_ACTIONS` id `t1`–`t5`).
- **`ToolsScreen.tsx`**: render `<ToolsHistoryTable />` when `tab ===
  'History'` instead of falling through to the generic
  `tools-tab-${tab}` placeholder div. The Recommended/Authentication tabs keep
  the existing placeholder.

## Visual details (tokens per CLAUDE.md)

- Table shell: `overflow-hidden rounded-t-[20px] border border-surface-border`
  — matches `ToolsTable`'s wrapper exactly.
- Header cells: `border-r border-surface-border px-3.5 py-3 text-[12px]
  font-semibold text-grey-700`, `ArrowDown` (lucide, size 13, `text-ink-muted`)
  on sortable columns — reuses `ToolsTable`'s `HeaderCell` shape (a local copy
  in the new file, since `HeaderCell` isn't exported).
- Name cell: same blue/slate circular `Bolt`-icon avatar
  (`ToolAction.iconTint`) + two-line title (`text-[12px] font-semibold
  text-black`) / description (`text-[12px] text-grey-700`) as `ToolsTable`.
- Run date cell: plain text, `text-[11px] text-black`.
- Type cell: plain text, `text-[11px] text-black`.
- **`ChannelPill`** (new): `inline-flex items-center gap-1.5 rounded-full
  border border-surface-border bg-white px-2 py-1`; a `size-4 rounded-full`
  circular badge colored via `channelMeta(label).color` containing that
  channel's Lucide icon in white (`size={9}`); label in `text-[11px]
  font-medium text-grey-700`. Uses the existing `channelMeta()` helper from
  `src/lib/channel-meta.ts` — no new channel-color mapping.
- Conversation ID cell: `text-[11px]`, `text-grey-400` when the value is
  `null` (rendered as `"n/a"`), `text-black` otherwise.
- **`RunStatusBadge`** (new): `rounded-xl px-2 py-0.5 text-[11px]
  font-semibold text-white`, same shape as `StateBadge`. Background per
  status: `In progress` → `#9194a0` (same grey `StateBadge` uses for
  Auto-saved); `Completed` → `#048c80` (same green `StateBadge` uses for
  Live); `Failed` → `var(--destructive)` (`#d4183d`, the project's existing
  destructive token — no inline hex needed since a token already covers this
  case).
- Icons: `Bolt`, `ArrowDown` (reused from `ToolsTable`'s imports) plus
  whatever channel icon `channelMeta()` returns — all `lucide-react`, no new
  SVG assets.

## Testing (Vitest + RTL)

- **`ToolsHistoryTable.test.tsx`**:
  - Renders a row for every `TOOL_RUNS` entry, asserting the looked-up
    action's name appears (via `TOOL_ACTIONS`).
  - Renders all three status labels (`In progress`, `Completed`, `Failed`)
    with the expected counts.
  - Renders channel labels via `ChannelPill` (e.g. `Slack`, `Voice`).
  - Renders `"n/a"` for rows whose `conversationId` is `null`.
- **`ToolsScreen.test.tsx`**: update the existing History-tab assertion —
  clicking the History tab now renders `tools-history-table` inside
  `screen-tools` (scoped with `within`) instead of the generic
  `tools-tab-History` placeholder div.

## Out of scope

- Sorting, filtering, search, or pagination on the History table.
- Row click-through to any run-detail view.
- Any backend, persistence, or real run data.
