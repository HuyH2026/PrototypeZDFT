# Generate a new Home — AI-assisted dashboard builder

**Date:** 2026-07-20
**Status:** Approved (design), pending implementation
**Scope:** Frontend only (no backend). Adds an AI-Studio-style panel to the Home
dashboard that lets a user describe what they want to see through a short Q&A and
then deterministically generates a widget layout, previewed before it is applied.

## Problem

The Home dashboard supports manual customization (drag/drop, add/remove widgets),
but there is no fast way to stand up a fresh, purpose-built Home. We want a guided,
natural-language-flavored path: the user answers a couple of questions (like the
AI Studio assistant), and we generate a sensible dashboard for their role and focus.

Because this phase has no backend, "generation" is a **deterministic, explainable
function** over the answers — not an LLM call. It reconfigures the *existing*
widgets into a new layout, so the result is fully functional, just heuristic.

## Goals

- A "Generate" affordance on the Home header, alongside "Customize".
- A right-side panel mirroring `AiStudioPanel`'s visual language (380px, rounded,
  white, header + scrollable body + bottom composer).
- A short Q&A (role + focus areas + optional free text) that maps to a layout.
- **Preview before apply**: the live dashboard previews the generated layout; the
  saved layout is only overwritten on explicit Apply. Discard is lossless.
- Deterministic, unit-tested generation logic.

## Non-goals (YAGNI)

- No LLM / backend call. No streaming "thinking" animation beyond a trivial state.
- No new widgets or changes to widget internals (only a tag map is added).
- No new routes. The panel is a child of `HomeScreen`, not a route.
- No named/savable preset library, no multi-Home switching. (Could be a follow-up.)
- No mobile/tablet layout — desktop-fluid like the rest of the app.

## User flow

1. User clicks **Generate** (Sparkles icon) in the Home header.
2. Right-side `GenerateHomePanel` opens; dashboard stays visible on the left.
3. Panel greets the user and presents the Q&A one step at a time:
   - **Q1 — Role** (single-select chips): Ops lead · Quality lead ·
     Knowledge manager · Executive.
   - **Q2 — Focus areas** (multi-select chips): Resolution & health ·
     Approvals & actions · Quality & testing · Knowledge · Cost & usage.
   - **Free-text box** (the composer, optional): "Anything specific you want front
     and center?"
4. **Generate** activates once Q1 and at least one Q2 answer are set.
5. On Generate: panel shows a "Here's your Home" result state, and the left
   dashboard re-renders in **preview mode** (a subtle "Preview" badge).
6. Panel footer offers **Apply**, **Discard**, and **Regenerate**.
   - **Apply** → overwrite saved `layout` (existing `localStorage` path), close panel.
   - **Discard** / close → restore the pre-generation layout, save nothing.
   - **Regenerate** → adjust answers and re-run.

## Architecture

### Generation logic — `src/features/home/generate-layout.ts`

Pure, backend-free, unit-testable module. Exports:

- `Role` — `'ops' | 'quality' | 'knowledge' | 'exec'`.
- `FocusArea` — `'resolution' | 'actions' | 'quality' | 'knowledge' | 'cost'`.
- `WIDGET_TAGS: Record<WidgetId, FocusArea[]>` — tags each existing widget:
  - `health → [resolution]`, `intents → [resolution]`
  - `approvals → [actions]`, `activity → [actions]`, `notifications → [actions]`
  - `qa → [quality]`, `policies → [quality]`
  - `gaps → [knowledge]`, `knowledge → [knowledge]`
  - `cost → [cost]`
- `ROLE_BASELINE: Record<Role, FocusArea[]>` — the focus areas implied by a role
  when the user selects nothing else (e.g. `quality → [quality, resolution]`).
- `generateLayout(input: { role: Role; focuses: FocusArea[]; prompt?: string }): Layout`

**Algorithm (deterministic):**
1. Effective focuses = user-selected `focuses`, or `ROLE_BASELINE[role]` if empty.
2. Score every `WidgetId`: base 0; +2 for each of its tags in effective focuses;
   +1 if the free-text `prompt` (lowercased) contains a keyword mapped to one of
   its tags/title. Ordering within equal scores follows a stable canonical order
   so results are reproducible.
3. Always include a small **core set** so no layout is empty (`health`, `approvals`)
   even if unscored, appended at the end if missing.
4. Split the ranked list into `{ left, right }` by alternating/priority rules so the
   highest-scored widgets land at the top of the left column (the primary reading
   column), matching how `DEFAULT_LAYOUT` weights left.
5. Guarantee the invariants `loadLayout` already enforces: only valid `WidgetId`s,
   no duplicates across columns.

### Panel — `src/features/home/GenerateHomePanel.tsx`

Presentational shell + local Q&A state. Visual language ported from
`AiStudioPanel` (header with title + gradient sparkle + close; scrollable body;
bottom composer pill). Props:

- `onGenerate(layout: Layout): void` — called when the user hits Generate; parent
  sets preview state.
- `onApply(): void`, `onDiscard(): void` — footer actions (only shown after a
  layout has been generated).
- `onClose(): void`.

Local state: `role`, `focuses`, `promptText`, and a `hasGenerated` flag to switch
between the Q&A view and the result/footer view. The panel calls
`generateLayout(...)` and hands the result up via `onGenerate`.

### Host wiring — `HomeScreen.tsx`

- Add a **Generate** button next to **Customize** in the header (hidden while
  `editing`, consistent with the existing header logic).
- New state: `showGenerate: boolean`, `previewLayout: Layout | null`.
- The rendered dashboard uses `previewLayout ?? layout`, so preview is non-destructive.
- When previewing, show a small **"Preview"** badge in the header.
- `onGenerate(next)` → `setPreviewLayout(next)`.
- `onApply()` → `setLayout(previewLayout!)` (this hits the existing `useEffect`
  that persists to `localStorage`), clear preview, close panel.
- `onDiscard()` / `onClose()` → clear preview, close panel (saved layout untouched).

No changes to the widget registry beyond importing `WIDGET_TAGS` usage in the
generator; the registry itself stays the source of truth for `WidgetId`s.

## Error / edge handling

- **Empty focuses** → fall back to `ROLE_BASELINE[role]`; Generate stays disabled
  until Q1 + ≥1 Q2 (so the fallback is only a safety net for the baseline path).
- **Prompt with no keyword matches** → ignored; scoring proceeds on role + focuses.
- **Generated layout would be empty** → core set guarantees at least `health` +
  `approvals`.
- **Discard/close mid-preview** → `previewLayout` cleared, `layout` never written.
- **Interaction with edit mode** → Generate is unavailable while `editing`; the two
  flows don't overlap.

## Testing

`src/features/home/generate-layout.test.ts` (pure logic):
- Each role's baseline produces the expected widget set and top-of-left priority.
- Selecting a focus area (e.g. `quality`) ranks its tagged widgets (`qa`,
  `policies`) above untagged ones.
- Free-text keyword (e.g. "cost") boosts the matching widget.
- Every generated layout contains only valid `WidgetId`s and no duplicates across
  columns (mirrors `loadLayout`'s invariants).
- Same input → same output (determinism).

`src/features/home/HomeScreen.test.tsx` (integration):
- Clicking Generate opens the panel.
- Completing Q1 + a Q2 enables the Generate button.
- Generating shows a preview and changes the visible widget order.
- Apply persists the new order; Discard restores the original.

## Files

- `src/features/home/generate-layout.ts` — new (pure generator + tags/presets).
- `src/features/home/generate-layout.test.ts` — new (unit tests).
- `src/features/home/GenerateHomePanel.tsx` — new (panel UI).
- `src/features/home/HomeScreen.tsx` — edited (button, preview state, wiring).
- `src/features/home/HomeScreen.test.tsx` — edited (integration tests).

## Open questions

None blocking. Possible follow-ups (out of scope): saving generated Homes as named
presets, an actual LLM-backed generator when a backend exists, and a light
"thinking" animation on Generate.
