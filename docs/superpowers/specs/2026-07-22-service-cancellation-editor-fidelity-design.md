# Service cancellation editor — Figma fidelity design

**Date:** 2026-07-22
**Figma:** `LMPNsX1T3nwkueIRUCDktm`, node `768-42679` (AI agents_03 — "Service cancellation" Autoflow policy editor)

## Context

Clicking **Service cancellation** in the Agent Builder list already navigates to
`/ai-agents/w3` → `AgentEditorScreen`. The editor already exists: transcribed
Autoflow policy prose + chips, a formatting toolbar, a drag-and-drop Steps
palette, and a classic-block canvas — all mock, persisted to `localStorage`
(`agent-builder-store-v1`).

This is **not** a build-from-scratch. It closes the visual/interaction gap
between the existing editor and the Figma frame. Scope tier chosen by the user:
**Visual + deeper interaction** (visual polish plus new interactive behavior).

## Goals

Bring the existing editor up to the Figma design across five areas — three
visual, two interactive.

### A. Policy chips: leading icons (visual)

Each inline chip in the Figma has a small colored glyph before its label. Add an
optional leading icon to `PolicyChipView`, derived from the chip `variant`,
reusing the existing `CHIP_STYLE` tints. Icons stay `lucide-react` (matches the
existing `editor-data.ts` convention; avoids committing 7-day Figma asset URLs).

Variant → icon:
- `form` → layers (green)
- `routing` → route/git-branch (purple)
- `event` → the event glyph (blue)
- `action` → bolt/zap (dark)
- `trigger` → neutral

The **"Autoflow policy"** title gains a gradient sparkle mark before it.

### B. Steps palette badges (visual)

Wrap each palette icon in a colored circular badge, per Figma:
Options=blue, Condition=amber, Form=purple, Text=grey, Dynamic card=teal,
Image=green, CSAT=pink, Attachment=blue, Code=dark. Icons stay lucide. Add a
`STEP_BADGE` color map in `editor-data.ts` alongside `STEP_ICON`.

### C. Classic block → expandable Condition card (new behavior)

The main interaction work. Extend `CanvasBlock`:

```ts
export type ConditionRow = { id: string; label: string }
export type CanvasBlock = {
  id: string
  stepType: StepType
  title: string
  collapsed?: boolean
  // condition content (present for condition-type blocks):
  header?: string        // "Conditions"
  subtitle?: string      // "Shipping status"
  rows?: ConditionRow[]  // numbered rows; last row acts as the "Otherwise…" fallthrough
}
```

Behavior:
- Card gets a collapse/expand chevron (Figma shows it collapsible).
- Expanded: yellow-badge "Conditions" header (route icon), "Shipping status"
  subtitle, numbered rows each with a trailing amber warning icon, terminal
  "Otherwise…" row (no number).
- Rows are editable (click label → contentEditable/commit-on-blur, matching the
  prose-edit pattern) and removable; an "Add condition" affordance appends a row.
- Seed `w3` block is pre-filled with the Figma's two "Condition description" rows
  + an "Otherwise…" row, header "Conditions", subtitle "Shipping status".

New pure reducers next to the existing block reducers, unit-tested without jsdom:
`addConditionRow`, `editConditionRow`, `removeConditionRow`, `toggleBlockCollapse`.

### D. Far-right vertical icon rail (new behavior)

A slim 56px rail on the far right (after the Steps panel) with the Figma glyphs
(list-tree, verified/check, layers, bolt, doc, route, card, wand, table,
sparkles) using lucide equivalents. The rail is a **selectable** control:
- The "layers" item is selected by default and shows the Steps palette.
- Selecting any other item collapses the Steps palette (reusing the palette's
  existing open/close). Panels beyond Steps are not specced in Figma, so they
  render nothing rather than fabricated content — selectable-but-empty.

Selection state lives in `AgentEditorScreen`.

### E. Drop-target polish (visual)

Match the Figma inline drop cue: a solid divider + a "Drop it here" pill for the
inline policy drop zone. Keep the dashed add-zone for the empty block canvas.

## Non-goals (pixel-exact tier — excluded)

- Dragged-card ghost overlay / custom drag preview
- Exact Garden/tabler glyph swaps (lucide stand-ins are used)
- Cursor sprites / hand-drag cursor states

## Files touched

- `src/features/ai-agents/agent-store.ts` — `ConditionRow`, extend `CanvasBlock`,
  new row/collapse reducers, seed `w3` condition block content.
- `src/features/ai-agents/editor/editor-data.ts` — `STEP_BADGE` color map,
  `CHIP_ICON` variant→icon map.
- `src/features/ai-agents/editor/PolicyChipView.tsx` — leading icon.
- `src/features/ai-agents/editor/PolicyEditor.tsx` — title sparkle, drop-cue polish.
- `src/features/ai-agents/editor/StepsPalette.tsx` — badge wrapper.
- `src/features/ai-agents/editor/BlockCanvas.tsx` — expandable condition card,
  row edit/add/remove.
- `src/features/ai-agents/editor/EditorRail.tsx` — **new** far-right icon rail.
- `src/features/ai-agents/editor/AgentEditorScreen.tsx` — mount rail, wire
  selection → palette visibility.

## Testing

- Extend `agent-store.test.ts` for the new row/collapse reducers (pure, no jsdom).
- Extend editor component tests for expand/collapse, row edit/remove/add, rail
  selection toggling the palette.
- Gates: `pnpm typecheck`, `pnpm test`, `pnpm build` (lint is a known broken gate
  per CLAUDE.md).

## Scope notes

No backend. All state is in-memory / `localStorage`, consistent with the rest of
the Agent Builder mock. The rail's non-Steps panels are intentionally empty.
