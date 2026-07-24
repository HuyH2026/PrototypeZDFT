# Conversation Details panel — design

**Date:** 2026-07-24
**Area:** Insights → AI Performance → Conversations tab
**Figma:** [A2A row panel `145-77530`](https://www.figma.com/design/UUy67blU4SHOkM8EIlclSa/Hackathon-2026?node-id=145-77530) · [MCP row panel `145-77713`](https://www.figma.com/design/UUy67blU4SHOkM8EIlclSa/Hackathon-2026?node-id=145-77713)

## Goal

Add a **Conversation Details** right slide-over that opens when a row in the
Conversations table is clicked. The reference frames show two variants of the
same drawer — one for an **A2A** conversation (calling client "OpenClaw") and
one for an **MCP** conversation (client "Claude Desktop"). They share one
layout and differ only in content driven by the row's conversation `source`.

Frontend-only, no backend. All content is mocked, consistent with the rest of
the Conversations tab and the sibling AI Performances views. The panel follows
the codebase's established right slide-over convention (`GeneratedAgentPanel`,
`CreateAgentPanel`).

## Scope

**In scope**
- A new `ConversationDetailPanel` slide-over rendered from `ConversationsView`
  when a table row is selected.
- **Every table row across all four channels** is clickable (per the user's
  decision). Clicking a row opens the panel populated from that row's data.
- **Full-fidelity, decorative** reproduction of both Figma frames: all sections
  present (meta rows, Conversation card with Events timeline + Resolution +
  Reassign controls, full Transcript with bubbles + step frames). Buttons,
  the dropdown, and "Add…" are decorative (no-ops), matching the rest of the
  mock.
- Content is **source-driven**: the row's `source` (`human` / `a2a` / `mcp`)
  selects the badge, the client-label wording, the transcript intro line, and
  the calling-client bubble tint.
- Panel opens on row click (and keyboard activation), closes on the X button,
  scrim click, and Escape — matching `GeneratedAgentPanel`.

**Out of scope**
- Real backend / network / persistence. Panel state is local to
  `ConversationsView`.
- Functional Events "Add…", "Define a New Intent", the "Assign to an existing
  intent" dropdown, and "Assign" — all decorative, matching the sibling views'
  interactivity bar and `GeneratedAgentPanel`'s footer.
- Changes to the card grid, the toolbar, or the channel/collapse/gaps
  interactivity already built on the Conversations tab.

## Interaction model

- `ConversationsView` owns `const [selected, setSelected] = useState<ConvRow | null>(null)`.
- `ConversationTable` gains an `onRowClick(row: ConvRow)` prop. Each `<tr>`
  becomes activatable: `role="button"`, `tabIndex={0}`, `onClick`, and
  `onKeyDown` handling Enter/Space (preventDefault on Space), plus a
  `cursor-pointer hover:bg-[#f9fafb]` affordance. The row's semantics as a
  table row are preserved; `role="button"` is added for activation, consistent
  with how the codebase already adds `role` to non-semantic interactive
  elements.
- When `selected` is non-null, `ConversationsView` renders
  `<ConversationDetailPanel detail={selected.detail} onClose={() => setSelected(null)} />`.
- The panel mirrors `GeneratedAgentPanel`: `fixed inset-0 z-50 flex justify-end`,
  a `bg-black/40` scrim (`aria-hidden`, `onClick={onClose}`,
  `data-testid="conversation-detail-scrim"`), and a `relative flex h-full
  w-[600px] flex-col overflow-y-auto bg-white shadow-xl` panel with
  `role="dialog"` and `aria-label="Conversation Details"`. Escape closes via a
  `useEffect` keydown listener (same as `GeneratedAgentPanel`).

## Source-driven differences

The two frames differ only in these fields, all carried on the row's
`ConvDetail` (built by `detailFor(row)` — see Data):

| Field | A2A (OpenClaw) | MCP (Claude Desktop) | Human |
|---|---|---|---|
| Badge | `A2A` — pink (`SOURCE_META.a2a`) | `MCP` — teal (`SOURCE_META.mcp`) | `Human` — amber (`SOURCE_META.human`) |
| Client meta label | `Calling client` | `MCP client` | omitted (row has none) |
| Client meta value | `OpenClaw` | `Claude Desktop` | — |
| Transcript intro | `Conversation started between agents` | `Conversation started between MCP and agent` | `Conversation started` |
| Calling-client bubble tint | `#fff7fc` (pink) | `#ebf5f7` (teal) | `#f2f4f7` (grey) |

Solve reply bubbles are always grey `#f2f4f7`. The badge tints reuse the
existing `SOURCE_META` map in `conversations-data.ts`.

## Panel layout (top → bottom)

Reproduces both frames. Fonts use the project's system stack (do **not** add
`font-['Plus_Jakarta_Sans…']` — that's Figma's font, deliberately dropped
project-wide). Figma one-off hexes are kept inline where they match, consistent
with the neighboring files.

1. **Header** — `Conversation Details` heading (text-[24px] font-semibold
   text-ink) + a circular close button (`X`, `aria-label="Close"`, same styling
   as `GeneratedAgentPanel`). A **source badge** (`SOURCE_META` chip with a
   leading icon) sits below the header.
2. **Meta rows** — a stack of `label: value` lines (label `text-[12px]
   text-ink-muted`, value `text-ink`): `Conversation ID`, `Automated`,
   `Source`, the client row (label per source table above; omitted for human),
   `Deflected`, `Resolved`.
3. **Conversation card** — bordered (`rounded-lg border border-[#e4e7f0]
   p-4`), containing in order:
   - **Detail lines** — `Time created`, `Time spent`, `Channel`, `Automated`,
     `Deflected`, `Resolved`, `# of interactions` (label:value, 12px).
   - divider (`h-px bg-[#e4e7f0]`)
   - **Context Variables** — label + value (`$userId (NO USER), $logged (true)`).
   - divider
   - **Calling client query** — label + an italic blue (`#145ad0`) value.
   - divider
   - **Events** — an "Events:" label with a decorative `Add… ▾` button on the
     right, then a small vertical timeline of `EventItem`s (a tinted filter-pill
     with `label · client` and a trailing duration, plus an underlined blue
     sub-link for the resolved event).
   - divider
   - **Resolution** — a `Resolution` label, a green (`#055952`) `Verified`
     badge, a paragraph of resolution prose, and a row of ✓ signal chips
     (`Request detected`, `Issue solved`, `Left without confirming`) using a
     check glyph.
   - a centered **"Reassign to new or existing intent"** divider-label (text
     between two hairlines).
   - a decorative **Define a New Intent** button (teal-tinted `#ebf5f7`, `+`
     icon), an **"Assign to an existing intent"** dropdown (bordered, `▾`), and
     a disabled-looking **Assign** button (`#f2f4f7`). All no-ops.
4. **Transcript card** — bordered, containing:
   - a **"Conversation started…"** divider row (source-specific intro text +
     timestamp, centered between hairlines).
   - the ordered **transcript bubbles**: each bubble is a rounded tinted block
     (calling-client tint per source, or grey for Solve) with the message text,
     preceded by a speaker header (`speaker · role`, e.g. `OpenClaw · Calling
     client`, `Booking · Solve`). Between bubbles, **step frames** — thin
     bordered `#f2f4f7` rows reading `Detected intent: …` / `Triggered action:
     …`.

The panel is a single component; a small internal set of presentational
sub-components (`MetaRow`, `Divider`, `Bubble`, `StepFrame`, `SignalChip`,
`EventRow`) keeps it readable. No new shared/exported components.

## Data

Extend `conversations-data.ts`:

- New types:
  - `EventItem = { label: string; client: string; duration: string; sublink?: string }`
  - `TranscriptStep = { kind: 'step'; text: string }`
  - `TranscriptBubble = { kind: 'bubble'; speaker: string; role: string; text: string; side: 'client' | 'solve' }`
  - `TranscriptEntry = TranscriptBubble | TranscriptStep`
  - `ConvDetail = { conversationId: string; automated: string; source: SourceKind; clientLabel?: string; clientValue?: string; deflected: string; resolved: string; timeCreated: string; timeSpent: string; channel: string; interactions: string; contextVariables: string; clientQuery: string; events: EventItem[]; resolutionBadge: string; resolutionText: string; signals: string[]; transcriptIntro: string; transcript: TranscriptEntry[] }`
- Add `detail: ConvDetail` to `ConvRow`.
- A `detailFor(row: Omit<ConvRow, 'detail'>): ConvDetail` factory builds the
  detail deterministically from the row's `source`, `client`, `timestamp`,
  `automated`, and `transcript`:
  - The **A2A OpenClaw** row (`c-2`) and the **MCP Claude Desktop** row (`c-3`)
    reproduce their Figma content exactly (the booking-flight A2A transcript;
    the SAML-SSO MCP transcript, 2 interactions).
  - Every other row (human rows, Partner Triage Bot A2A row, all non-headless
    `SIMPLE_ROWS`) gets adapted content from the same shape: badge/label/intro
    from `source`, transcript bubbles derived from the row's existing
    `transcript` lines, a generic Events list, and a generic resolution.
  - Deterministic only — no `Date.now()` / `Math.random()`. All timestamps and
    ids are literal strings.
- `HEADLESS_ROWS` and `SIMPLE_ROWS` attach `detail: detailFor(row)`; because
  `SIMPLE_ROWS` are derived from `HEADLESS_ROWS` with `source: 'human'` /
  `client: 'n/a'`, their details are rebuilt (not copied) so the human wording
  applies.

`SourceKind` and `SOURCE_META` already exist and are reused. `ChannelData`
and `CHANNELS` are unchanged in shape (rows now simply carry `detail`).

## Files

- **Modify** `src/features/insights/ai-performances/conversations/conversations-data.ts`
  — new detail types, `detailFor()`, `detail` on rows.
- **Create** `src/features/insights/ai-performances/conversations/ConversationDetailPanel.tsx`
  — the slide-over.
- **Modify** `src/features/insights/ai-performances/conversations/ConversationTable.tsx`
  — clickable rows + `onRowClick` prop.
- **Modify** `src/features/insights/ai-performances/conversations/ConversationsView.tsx`
  — `selected` state + render the panel.
- **Modify** `src/features/insights/ai-performances/conversations/conversations-data.test.ts`
  — assert `detail` shape + source-specific fields.
- **Create/extend** `src/features/insights/ai-performances/conversations/ConversationDetailPanel.test.tsx`
  and/or extend `ConversationsView.test.tsx` — open/close + source content.

## Testing

Mirror the existing Conversations + `GeneratedAgentPanel` test patterns
(Vitest + RTL, jsdom).

- **`conversations-data.test.ts`** (extend):
  - Every `ConvRow` in `CHANNELS` has a `detail` with non-empty
    `conversationId`, `transcript`, and `signals`.
  - The A2A OpenClaw row's detail has `clientLabel === 'Calling client'`,
    `clientValue === 'OpenClaw'`, and a transcript intro mentioning "agents".
  - The MCP Claude Desktop row's detail has `clientLabel === 'MCP client'`,
    `clientValue === 'Claude Desktop'`, `interactions === '2'`, and an intro
    mentioning "MCP".
  - A human row's detail omits the client label (`clientLabel` undefined) and
    uses the plain intro.
- **`ConversationsView.test.tsx`** (extend) / **`ConversationDetailPanel.test.tsx`**:
  - Clicking a table row opens a `role="dialog"` panel showing "Conversation
    Details" and the row's source badge.
  - The A2A row's panel shows "Calling client" + "OpenClaw"; switching to click
    the MCP row shows "MCP client" + "Claude Desktop" (distinct content).
  - Clicking the scrim, the Close button, and pressing Escape each close the
    panel (`role="dialog"` no longer present).

**Gates:** `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'`,
`npx vite build`. (`pnpm lint` is known-broken on TS7 — see CLAUDE.md.)

## Tokens & styling

Reuse semantic tokens (`text-ink`, `text-ink-muted`, `border-surface-border`,
`bg-white`) and the existing `SOURCE_META` tints. Keep the Figma one-off hexes
inline where they match (`#e4e7f0`, `#145ad0`, `#055952`, `#fff7fc`, `#ebf5f7`,
`#f2f4f7`, `#727583`, `#545767`), consistent with the neighboring Conversations
and AI Performances files. Do **not** add `font-['…']` arbitrary font-family
classes. Icons come from `lucide-react` (chrome/detail icons), matching the
Conversations table's existing icon usage.
