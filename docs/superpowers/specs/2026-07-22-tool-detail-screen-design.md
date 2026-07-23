# Tool Detail Screen — Design

**Date:** 2026-07-22
**Route:** `/tools/:id` (opened from a row in the Tool Builder `/tools` Available table)
**Figma:** `LMPNsX1T3nwkueIRUCDktm`, node `753:155092` ("05 Tools expanded")

## Goal

When a user selects a row in the Tool Builder Available table, navigate to a
Tool Detail screen matching the Figma frame: a header (back arrow, tool name,
state badge, Duplicate/Versions/Publish actions), an inert "Untitled" tab
strip, a request-builder card (Endpoint URL + Params/Header/Body/Authorization/
Code tabs + Action name/description panel), and a responses card
(Responses text + Output Parameters). Frontend-only mock UI, no backend —
same convention as the rest of `src/features/tools/`.

## Scope & interactivity

- **Only the request-card's inner tab strip is live** (Params / Header / Body
  / Authorization / Code) — local `useState`, same pattern as `ToolsScreen`'s
  Available/Recommended/Authentication/History tabs. Switching shows the
  matching static body; only **Params** has designed content (Key/Value row +
  inert Add), the other four tabs render a titled empty region (no fabricated
  data, matching the Insights sub-view / Tool Builder tab convention).
- **Everything else is presentational / inert**: back arrow navigates (the one
  other live behavior), the "Untitled" tab + "+" button, method dropdown
  ("GET"), endpoint input, Send button, Duplicate, Versions, Publish, the
  chevron-down next to the state badge, collapse chevrons on both cards,
  Action name / Description inputs, Key/Value inputs, "+ Add", the trash icon.
- Response card content (the two instructional text blocks) and Output
  Parameters empty state are static text matching the Figma frame verbatim —
  identical for every tool, since there's no backend and no real request has
  been sent.

## Data binding

- Title = the clicked `ToolAction.name` (e.g. "Action name 001"), not the
  Figma's literal "SF-User Permission Check" example.
- State badge = the clicked row's real `ToolAction.state`, reusing the exact
  `StateBadge` component/styling already in `ToolsTable.tsx` (Live = green,
  Read only = bordered neutral, Auto-saved = grey).
- Endpoint URL, params, action name/description, and response content are
  static placeholder copy from the Figma frame — the same for every tool.

## Architecture

New files in `src/features/tools/`, following the `AutomationDetailScreen` /
`orchestrator/:id` pattern already in the codebase:

- **`ToolDetailScreen.tsx`** — `data-testid="screen-tool-detail"`. Reads `id`
  from `useParams()`, looks up `TOOL_ACTIONS.find(t => t.id === id)`. Unknown
  id → `<Navigate to="/tools" replace />` (same guard as
  `AutomationDetailScreen`). Renders the header row (back arrow → `navigate('/tools')`,
  tool name, `StateBadge`, inert chevron, "Duplicate" text button, "Versions"
  pill, dark "Publish" pill) and the static "Untitled" tab strip, then
  `ToolRequestCard` and `ToolResponseCard`.
- **`ToolRequestCard.tsx`** — the top card. Endpoint URL section (label + icon,
  inert "GET" dropdown pill, inert URL text input, inert "Send" pill) and the
  Params/Header/Body/Authorization/Code tab strip (owns its own
  `useState<RequestTab>`, the only interactive piece). Params tab: "Key"/"Value"
  column labels, one inert key/value input row + trash icon, inert "+ Add".
  Other four tabs: titled empty region (`data-testid="request-tab-{Tab}"`).
  Right column (always visible, not tab-dependent): "Action name and
  description *" panel header + inert collapse chevron, "Action name*" input
  (placeholder "Provide a name for the action"), "Description*" textarea
  (placeholder "Provide information about the purpose and function of the API
  endpoint you are utilizing.").
- **`ToolResponseCard.tsx`** — the bottom card. Left: "Responses" label, blue
  instructional text ("Select an array [] to generate a Dynamic list of CV's or
  select an individual entity for a single CV. Utilize 'Advanced Filter' with
  JMESPath for precise filtering."), muted "Enter the URL and click Send to get
  a response". Right: "Output Parameters" header + inert collapse chevron,
  muted "Click on Response to add Output parameters".

### Modified files

- **`ToolsTable.tsx`**: add an `onOpen: (id: string) => void` prop; clicking a
  row (anywhere except the checkbox cell or the `⋮` button) calls
  `onOpen(a.id)`. Export `StateBadge` (currently module-private) so
  `ToolDetailScreen` can reuse it.
- **`ToolsScreen.tsx`**: add `useNavigate()`, pass
  `onOpen={(id) => navigate(\`/tools/${id}\`)}` to `ToolsTable`.
- **`src/routes.tsx`**: add `{ path: 'tools/:id', element: <ToolDetailScreen /> }`
  alongside the existing `tools` route (mirrors `orchestrator/:id`). No change
  to the `BUILT` set (already includes `/tools`).

## Visual details (tokens per CLAUDE.md)

- Header: `ArrowLeft` (lucide) back button; tool name ~22px `text-ink`;
  `StateBadge` reused unchanged; inert chevron-down icon button; "Duplicate"
  plain text button (`text-ink-muted` or `text-black` per frame); "Versions"
  outline pill with trailing chevron (`border-surface-border`); "Publish" dark
  filled pill (`bg-ink text-white`).
- Tab strip: static "Untitled" tab styled like the active tab in
  `ToolsScreen`/`AutomationDetailScreen` (`border-b border-ink`/`text-ink`),
  inert "+" (lucide `Plus`) beside it.
- Request card: rounded-[20px] white card, `border border-surface-border`.
  Endpoint URL row: small icon + "Endpoint URL" label; "GET" dropdown pill
  (`border-surface-border`, trailing `ChevronDown`); text input pill
  (placeholder "Select method, enter endpoint then sent"); "Send" pill
  (muted/disabled look, `bg-[#f2f4f7] text-grey-400` — no exact token, inline
  per CLAUDE.md one-off convention). Params/Header/Body/Authorization/Code use
  the same active/inactive tab classes as `ToolsScreen`'s strip. Params body:
  "Key"/"Value" labels (`text-grey-700`, ~10px per frame), one key input pill +
  value input pill + `Trash2` icon button, inert "+ Add" (`Plus` icon + text,
  muted). Right column: "Action name and description *" (`text-black`) +
  `ChevronUp` collapse icon; "Action name*" label + input pill; "Description*"
  label + textarea-style pill (multi-line, `items-start`).
- Response card: rounded-[20px] white card. "Responses" label; instructional
  text in `text-blue-700` (per CLAUDE.md's canonical Flora accent, matches the
  frame's `#01567a`); muted secondary line `text-ink-muted`. "Output
  Parameters" label + `ChevronUp` collapse icon; muted empty-state line.
- Icons: all from `lucide-react` (`ArrowLeft`, `ChevronDown`, `ChevronUp`,
  `Plus`, `Trash2`, `MoreVertical` if needed) — no new SVG assets, matching the
  project's "dashboard/chrome uses lucide" convention. No images to reproduce
  from the Figma asset URLs.

## Testing (Vitest + RTL)

- **`ToolDetailScreen.test.tsx`**:
  - Valid id (e.g. `t1`) renders `screen-tool-detail`, shows "Action name 001"
    as the heading, and the correct `StateBadge` text ("Live").
  - Unknown id redirects to `/tools` (render via `createMemoryRouter`/`routes`
    and assert `screen-tools` appears instead).
  - Clicking a Params/Header/Body/Authorization/Code tab swaps the visible
    body, scoped with `within(getByTestId('screen-tool-detail'))`.
  - Back arrow navigates to `/tools`.
- **`ToolsTable.test.tsx`**: clicking a row calls `onOpen` with that row's id;
  clicking the checkbox or the `⋮` button does not call `onOpen`.
- **`tools.routes.test.tsx`**: add cases — `/tools/t1` renders
  `screen-tool-detail`; `/tools/does-not-exist` renders `screen-tools` (i.e.
  redirected).

## Out of scope

- Any real request/response behavior (Send does nothing; no network calls).
- Real content for Header/Body/Authorization/Code request tabs.
- Editable/persisted Action name, Description, Key/Value fields, or Duplicate/
  Versions/Publish actions.
- Any backend or persistence.
