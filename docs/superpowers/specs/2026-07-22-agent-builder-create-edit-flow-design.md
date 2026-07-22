# Agent Builder — Create/Edit Flow

**Date:** 2026-07-22
**Status:** Approved (brainstorm)
**Scope:** Frontend-only (no backend). All state is mocked/in-memory + `localStorage`.

## Problem

The Agent Builder landing screen (`/ai-agents`) is a static dashboard: a channel
switcher, metric strip, agent tabs, and a table with a working on/off toggle.
Everything else is inert — "New Agent" does nothing, and agent rows are not
clickable. There is no way to create an agent or open one to edit it.

This spec adds the missing **flow**: a Create Agent slide-over, and a full
**Autoflow policy editor** that opens when a user creates or clicks an agent.

## Reference designs

- **Editor** — Figma `Unification` file, node `768:42679` ("AI agents_03"),
  shown when the user clicks the "Service cancellation" agent row.
- **Create Agent form** — screenshot supplied by the user (no Figma node);
  build from the screenshot, matching existing app tokens/spacing.

## Decisions (from brainstorm)

| Question | Decision |
| --- | --- |
| Fidelity | Fully interactive: editable policy + working DnD |
| Entry points | Row click → editor; "New Agent" → Create form → editor |
| Create form presentation | Right slide-over panel over the dimmed list |
| Create form source | Build from the user's screenshot |
| DnD target | Steps drop **both** as inline policy chips **and** as canvas block cards |
| Policy editing | Prose editable; entity chips are static (deletable, not reconfigurable) |
| Persistence | `localStorage` (guarded), like the Home dashboard |
| Secondary chrome | Preview/Versions/Publish, overflow ⋮, far-right icon rail: inert/visual-only |

## Architecture

### Routing & entry points

Two additions under the existing `ai-agents` route in `src/routes.tsx` (the
`AiAgentsScreen` shell already provides the white rounded surface via `<Outlet/>`):

- `/ai-agents/:agentId` → `AgentEditorScreen` — the Autoflow policy editor.
- Create is **not** a route. It is a right slide-over rendered by
  `AgentBuilderScreen` from local state.

Add `'/ai-agents'` remains in the `BUILT` set (already present). The new
`:agentId` child must be ordered so it does not shadow the existing static
children (`configuration`, `agent-builder`, `qa`) — place `:agentId` **after**
the static paths, since React Router v7 ranks static segments above dynamic ones
regardless of order, but explicit ordering keeps intent clear.

**Flows:**

- **Row click** in `AgentsTable` → `navigate(\`/ai-agents/${agent.id}\`)`.
- **New Agent** button → opens `CreateAgentPanel` (slide-over). On submit, the
  store mints a new agent, then the screen navigates to
  `/ai-agents/${newId}` (the editor).
- **Back arrow** in the editor header → `navigate('/ai-agents')`.

### Data & persistence

Current `agent-builder-data.ts` exposes a frozen `CHANNELS` const with per-channel
`agents`. Introduce a mutable store layer without discarding that seed data.

**`src/features/ai-agents/agent-store.ts`**

- Extends the existing `Agent` type with editor fields:
  - `policy: PolicyDoc` — the rich-text document model (see below).
  - `blocks: CanvasBlock[]` — canvas block cards.
  - `universalBrand: boolean`, `tags: string[]`, `triggeredWhen: string`,
    `trainingPhrases: string[]` — the Create form fields.
  - `channel: ChannelKey` — which channel the agent belongs to.
- **Seeds** from `CHANNELS`: each seeded agent gets a minimal starter policy,
  except `w3` ("Service cancellation"), which is seeded with the **exact Figma
  policy content** (prose + chips) so the editor matches the reference on first open.
- **`useAgentStore()`** hook returns:
  - `agents: StoredAgent[]`
  - `getAgent(id): StoredAgent | undefined`
  - `createAgent(fields): string` — mints a deterministic id from a module
    `seq` counter (never `Date.now()`/`Math.random()` — unavailable/nondeterministic
    here; follows the `org-context` pattern), returns the new id.
  - `updateAgent(id, patch)` — partial update (title, policy, blocks, toggle, …).
  - `toggleAgent(id)` — on/off; **replaces** the per-row override map currently
    local to `AgentBuilderScreen`, so list and editor share one source of truth.
- **Persistence:** `localStorage` key `agent-builder-store-v1`, guarded with
  `window.localStorage?.` so it degrades in jsdom. On load, sync the `seq`
  counter past any persisted ids to avoid collisions (mirrors the fix in
  `home` view-id handling).

`AgentBuilderScreen` stops owning its `overrides` map and instead reads/writes
the store. The metric strip and channel switcher are unchanged.

### PolicyDoc model

The policy document is a linear list of **segments** so DnD can insert chips
inline and prose stays editable:

```ts
type PolicyChip = {
  kind: 'chip'
  id: string
  variant: 'form' | 'routing' | 'event' | 'action' | 'trigger'
  label: string      // e.g. "Retention Routing"
}
type PolicyProse = { kind: 'prose'; id: string; text: string }
type PolicySegment = PolicyProse | PolicyChip
type PolicyDoc = { title: string; segments: PolicySegment[] }
```

- Prose segments are editable text. Chips render as read-only inline tokens,
  styled per Figma variant (form = green outline, routing = purple, event =
  blue, action = filled). Chips are **deletable** (small ✕ on hover) but not
  reconfigurable.
- Seeded "Service cancellation" content is transcribed from the Figma frame
  (the "Autoflow policy" paragraph with Form / Retention Routing / 30-Day Free /
  Retention Saved / Apply 30-Day Free / Process Cancellation / CSAT Survey chips).

### CanvasBlock model

```ts
type CanvasBlock = {
  id: string
  stepType: StepType   // 'options' | 'condition' | 'form' | 'text' | ...
  title: string        // e.g. "Untitled classic block 01"
}
```

Dropped block cards render on the canvas below the prose. Reorderable and
removable. Seeded "Service cancellation" gets one "Untitled classic block 01"
(Conditions) card to match the reference.

### Components

```
src/features/ai-agents/
  agent-store.ts            NEW  mutable store + useAgentStore() + persistence
  agent-store.test.ts       NEW  create/toggle/persist/seq-sync
  CreateAgentPanel.tsx      NEW  right slide-over create form
  CreateAgentPanel.test.tsx NEW
  AgentBuilderScreen.tsx    EDIT rows clickable; New Agent opens panel; use store
  AgentsTable.tsx           EDIT row onClick → navigate; toggle via store
  editor/
    AgentEditorScreen.tsx     NEW  DndProvider shell; :agentId lookup; 404 → redirect
    EditorHeader.tsx          NEW  back, title, version chip, channel tabs, actions
    PolicyEditor.tsx          NEW  toolbar + segment rendering + inline drop zone
    PolicyChipView.tsx        NEW  one inline chip token (variant styles, delete)
    StepsPalette.tsx          NEW  right panel of draggable step types
    BlockCanvas.tsx           NEW  canvas drop zone + block cards (reorder/remove)
    editor-data.ts            NEW  StepType list, chip variant styles, seed content
    *.test.tsx                NEW
```

### Drag & drop

- One `DndProvider` (`react-dnd` + `HTML5Backend`) at `AgentEditorScreen`,
  matching the Home dashboard setup.
- **Drag source:** each item in `StepsPalette` (`useDrag`, item = `{ stepType }`).
- **Drop targets:**
  1. Inline **policy drop zone** — a "Drop it here" affordance appears in the
     prose flow on drag-over; dropping inserts a `PolicyChip` derived from the
     step type at that position.
  2. **Canvas** (`BlockCanvas`) — dropping appends a `CanvasBlock`.
- Block cards on the canvas are also drag sources for **reordering** (drag to
  swap order); each has a remove control.
- All mutations go through pure reducer helpers in `agent-store`/`editor-data`
  (`insertChip`, `appendBlock`, `moveBlock`, `removeBlock`) so they are unit-
  testable without jsdom drag simulation.

### Inert (visual-only) this slice

- Channel tabs switch a local active tab but render the same editor body
  (no per-channel policy variation).
- Preview / Versions / Publish buttons, overflow ⋮ menu, far-right icon rail.
- Rich-text toolbar: undo/redo and B/I/U/list formatting wired where practical
  on the focused prose segment; H1–H3, quote, code, link, and "+ Insert" render
  faithfully but may be inert.

## Testing

Vitest + React Testing Library (jsdom), per existing conventions:

- **Routing:** row click navigates to `/ai-agents/:id`; editor back returns to list.
- **Create flow:** open panel → Create disabled until display name entered → fill
  name → submit → lands in editor showing the new agent's title; new agent appears
  in the list.
- **Store:** `createAgent` mints unique ids; `toggleAgent` flips state; persistence
  round-trips through a mock `localStorage`; `seq` syncs past persisted ids.
- **Policy/DnD reducers:** `insertChip`, `appendBlock`, `moveBlock`, `removeBlock`
  tested as pure functions (state-level, not jsdom drag events).
- **Editor render:** seeded "Service cancellation" shows its policy chips and the
  seeded classic block; Steps palette lists the step types.

Gates: `pnpm typecheck`, `pnpm test`, `pnpm build` (lint is a known upstream
toolchain gap on TS7).

## Out of scope (future specs)

- Per-channel policy variation; live Preview; Versions history; Publish.
- Configurable chips (editing a chip's target form/action/event).
- The far-right editor section rail becoming functional.
- Any backend / real persistence beyond `localStorage`.
