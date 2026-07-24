# Conversation Details Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a right slide-over "Conversation Details" panel that opens when any Conversations-table row is clicked, with source-driven (Human / A2A / MCP) content reproducing the two Figma frames.

**Architecture:** Extend each `ConvRow` with a `detail: ConvDetail` object built by a deterministic `detailFor(row)` factory in `conversations-data.ts`. `ConversationTable` makes rows clickable and lifts `onRowClick`. `ConversationsView` owns a `selected` row state and renders a new `ConversationDetailPanel` (a self-contained presentational slide-over following the existing `GeneratedAgentPanel` convention).

**Tech Stack:** React 19 + TypeScript (strict), Tailwind v4 (semantic tokens + inline Figma hexes), lucide-react icons, Vitest + React Testing Library (jsdom).

## Global Constraints

- **Deterministic only** — never use `Date.now()` / `Math.random()`. All ids, timestamps, and mock strings are literals.
- **No arbitrary font-family classes** — do NOT add `font-['Plus_Jakarta_Sans…']` or any `font-['…']`. Use the project's system stack (default).
- **Semantic tokens first** — `text-ink`, `text-ink-muted`, `border-surface-border`, `bg-white`. Figma one-off hexes kept inline where they match: `#e4e7f0`, `#145ad0`, `#055952`, `#fff7fc`, `#ebf5f7`, `#f2f4f7`, `#727583`, `#545767`.
- **Slide-over convention** (from `src/features/insights/cx-journey/GeneratedAgentPanel.tsx`): `fixed inset-0 z-50 flex justify-end`; scrim `absolute inset-0 bg-black/40` with `aria-hidden` + `onClick={onClose}`; panel `relative flex h-full w-[600px] flex-col overflow-y-auto bg-white shadow-xl` with `role="dialog"` + `aria-label`. Close on X button (`aria-label="Close"`), scrim click, and Escape (via `useEffect` keydown listener).
- **Reuse `SOURCE_META`** (already in `conversations-data.ts`) for source badge tints; do not redefine.
- **Test command:** `npx vitest run --exclude '**/.claude/**'` (sibling-worktree crawl guard). Type gate: `npx tsc --noEmit`. Build gate: `npx vite build`. `pnpm lint` is known-broken on TS7 — do not rely on it.

Existing `SOURCE_META` (do not change):
```ts
export const SOURCE_META: Record<SourceKind, { label: string; fg: string; bg: string }> = {
  human: { label: 'Human', fg: '#8a5a00', bg: '#fdf1d6' },
  a2a: { label: 'A2A', fg: '#a3216f', bg: '#fbe4f1' },
  mcp: { label: 'MCP', fg: '#0f7b8f', bg: '#daf1f5' },
}
```

---

### Task 1: Detail data model + `detailFor()` factory

**Files:**
- Modify: `src/features/insights/ai-performances/conversations/conversations-data.ts`
- Test: `src/features/insights/ai-performances/conversations/conversations-data.test.ts` (extend)

**Interfaces:**
- Consumes: existing `SourceKind`, `SOURCE_META`, `ConvRow`, `HEADLESS_ROWS`, `SIMPLE_ROWS`, `CHANNELS` in this file.
- Produces (later tasks rely on these exact names/types):
  - `EventItem = { label: string; client: string; duration: string; sublink?: string }`
  - `TranscriptStep = { kind: 'step'; text: string }`
  - `TranscriptBubble = { kind: 'bubble'; speaker: string; role: string; text: string; side: 'client' | 'solve' }`
  - `TranscriptEntry = TranscriptBubble | TranscriptStep`
  - `ConvDetail` (full shape below)
  - `ConvRow` gains `detail: ConvDetail`
  - `detailFor(row: Omit<ConvRow, 'detail'>): ConvDetail`

**Context:** `ConvRow` currently is:
```ts
export type ConvRow = {
  id: string
  timestamp: string
  automated: boolean
  source: SourceKind
  client: string
  agents: string
  transcript: string[]
  hasGap: boolean
}
```
`HEADLESS_ROWS` is a literal array of 5 rows (`c-1`…`c-5`). `c-2` is the A2A OpenClaw booking row; `c-3` is the MCP Claude Desktop SAML row. `SIMPLE_ROWS = HEADLESS_ROWS.map(...)` with `source: 'human'`, `client: 'n/a'`, ids `s-1..s-5`. `CHANNELS` wires headless→`HEADLESS_ROWS`, others→`SIMPLE_ROWS`.

- [ ] **Step 1: Write the failing test** — append these cases to `conversations-data.test.ts`:

```ts
  it('every row carries a populated detail', () => {
    for (const k of KEYS) {
      for (const row of CHANNELS[k].rows) {
        expect(row.detail.conversationId.length).toBeGreaterThan(0)
        expect(row.detail.transcript.length).toBeGreaterThan(0)
        expect(row.detail.signals.length).toBeGreaterThan(0)
      }
    }
  })

  it('the A2A OpenClaw row detail matches the Figma calling-client wording', () => {
    const row = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!
    expect(row.detail.clientLabel).toBe('Calling client')
    expect(row.detail.clientValue).toBe('OpenClaw')
    expect(row.detail.transcriptIntro).toContain('agents')
  })

  it('the MCP Claude Desktop row detail matches the Figma MCP wording', () => {
    const row = CHANNELS.headless.rows.find((r) => r.client === 'Claude Desktop')!
    expect(row.detail.clientLabel).toBe('MCP client')
    expect(row.detail.clientValue).toBe('Claude Desktop')
    expect(row.detail.interactions).toBe('2')
    expect(row.detail.transcriptIntro).toContain('MCP')
  })

  it('a human row detail omits the client label and uses the plain intro', () => {
    const row = CHANNELS.widget.rows[0]
    expect(row.detail.source).toBe('human')
    expect(row.detail.clientLabel).toBeUndefined()
    expect(row.detail.transcriptIntro).toBe('Conversation started')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/insights/ai-performances/conversations/conversations-data.test.ts`
Expected: FAIL — `row.detail` is undefined / `detailFor` not defined.

- [ ] **Step 3: Add the types.** After the existing `ConvColumn`/`SourceKind` block and before `ConvRow`, add:

```ts
// --- Conversation Details panel ---------------------------------------------
export type EventItem = { label: string; client: string; duration: string; sublink?: string }
export type TranscriptStep = { kind: 'step'; text: string }
export type TranscriptBubble = {
  kind: 'bubble'
  speaker: string
  role: string
  text: string
  side: 'client' | 'solve'
}
export type TranscriptEntry = TranscriptBubble | TranscriptStep

export type ConvDetail = {
  conversationId: string
  automated: string
  source: SourceKind
  clientLabel?: string
  clientValue?: string
  deflected: string
  resolved: string
  timeCreated: string
  timeSpent: string
  channel: string
  interactions: string
  contextVariables: string
  clientQuery: string
  events: EventItem[]
  resolutionBadge: string
  resolutionText: string
  signals: string[]
  transcriptIntro: string
  transcript: TranscriptEntry[]
}
```

Then add `detail: ConvDetail` to `ConvRow`:
```ts
export type ConvRow = {
  id: string
  timestamp: string
  automated: boolean
  source: SourceKind
  client: string
  agents: string
  transcript: string[]
  hasGap: boolean
  detail: ConvDetail
}
```

- [ ] **Step 4: Add the `detailFor` factory.** Place it above `HEADLESS_ROWS` (it is referenced when building rows). It reproduces the two Figma frames exactly for the OpenClaw (A2A) and Claude Desktop (MCP) rows and adapts every other row from the same shape.

```ts
// Wording that varies by conversation source (matches the two Figma frames).
function sourceWording(source: SourceKind, client: string) {
  if (source === 'a2a')
    return { clientLabel: 'Calling client', intro: 'Conversation started between agents', side: 'client' as const }
  if (source === 'mcp')
    return { clientLabel: 'MCP client', intro: 'Conversation started between MCP and agent', side: 'client' as const }
  return { clientLabel: undefined, intro: 'Conversation started', side: 'client' as const }
}

// Turn a row's flat transcript lines into alternating bubble entries. Even
// lines are the caller (client tint), odd lines are Solve (grey).
function bubblesFromLines(lines: string[], source: SourceKind, client: string): TranscriptEntry[] {
  const caller = source === 'human' ? 'User' : client
  return lines.map((text, i) => ({
    kind: 'bubble' as const,
    speaker: i % 2 === 0 ? caller : 'Solve',
    role: i % 2 === 0 ? (source === 'human' ? 'Customer' : 'Calling client') : 'Solve',
    text,
    side: i % 2 === 0 ? ('client' as const) : ('solve' as const),
  }))
}

// The exact A2A booking transcript from Figma frame 145-77530.
const A2A_TRANSCRIPT: TranscriptEntry[] = [
  { kind: 'bubble', speaker: 'OpenClaw', role: 'Calling client', side: 'client', text: 'Delegation token verified · acting for Jane R. · scope: book_travel · max $500 · exp 2h' },
  { kind: 'step', text: 'Detected intent: book flight' },
  { kind: 'bubble', speaker: 'Booking', role: 'Solve', side: 'solve', text: 'flight: DL428 · SFO→JFK · Fri 9:15a\nfare: $462 · aisle 14C\ncapability: book_flight' },
  { kind: 'step', text: 'Triggered action: search flights' },
  { kind: 'bubble', speaker: 'OpenClaw', role: 'Calling client', side: 'client', text: 'intent: book_flight\noffer_id: ofr_9c2a · amount: $462' },
  { kind: 'step', text: 'Triggered action: book flight' },
  { kind: 'bubble', speaker: 'Booking', role: 'Solve', side: 'solve', text: 'pnr: DL-7XQ2P · seat: 14C · charged: $462' },
]

// The exact MCP SAML transcript from Figma frame 145-77713.
const MCP_TRANSCRIPT: TranscriptEntry[] = [
  { kind: 'bubble', speaker: 'Claude Desktop', role: 'Calling client', side: 'client', text: 'tool call → solve.search(query: "SAML SSO setup steps")' },
  { kind: 'step', text: 'Triggered knowledge article' },
  { kind: 'bubble', speaker: 'Knowledge', role: 'Solve', side: 'solve', text: 'article: Setting up SAML SSO · confidence: 0.94' },
]

export function detailFor(row: Omit<ConvRow, 'detail'>): ConvDetail {
  const w = sourceWording(row.source, row.client)
  const base: ConvDetail = {
    conversationId: `3e732807-c2d0-4ce3-8b5e-c87c28abb7e8`,
    automated: row.automated ? 'Yes' : 'No',
    source: row.source,
    clientLabel: w.clientLabel,
    clientValue: row.client === 'n/a' ? undefined : row.client,
    deflected: 'Yes',
    resolved: 'Verified',
    timeCreated: 'May 17, 2026 6:47:50 pm',
    timeSpent: '2 min 30 sec',
    channel: 'Headless',
    interactions: '4',
    contextVariables: '$userId (NO USER), $logged (true)',
    clientQuery: 'Booking flight',
    events: [
      { label: 'Flight reservation', client: row.client === 'n/a' ? 'Solve' : row.client, duration: '34 sec' },
      { label: 'Booking reservations', client: 'Solve', duration: '1 min 15 sec', sublink: 'Booking reservation' },
    ],
    resolutionBadge: 'Verified',
    resolutionText:
      'Flight change request received and processed. Available options, fare rules, and next steps were confirmed based on current availability. No further input was provided, counted as implicit confirmation. Signals: Meaningful Query (High positive), Implicit Confirmation (Low positive), Knowledge Reply (High positive), Self-Service (Medium positive). No negative signals detected.',
    signals: ['Request detected', 'Issue solved', 'Left without confirming'],
    transcriptIntro: w.intro,
    transcript: bubblesFromLines(row.transcript, row.source, row.client),
  }

  // The two Figma reference rows get their exact designed content.
  if (row.source === 'a2a' && row.client === 'OpenClaw') {
    return { ...base, clientQuery: 'Booking flight', interactions: '4', transcript: A2A_TRANSCRIPT }
  }
  if (row.source === 'mcp' && row.client === 'Claude Desktop') {
    return {
      ...base,
      clientQuery: 'SAML SSO setup',
      interactions: '2',
      events: [
        { label: 'SAML SSO', client: 'Claude Desktop', duration: '34 sec' },
        { label: 'Knowledge Agent', client: 'Solve', duration: '1 min 15 sec', sublink: 'Knowledge agent' },
      ],
      resolutionText:
        'SAML SSO configuration request received and processed via MCP connection. Identity provider metadata was retrieved, assertion parameters validated, and SSO settings applied to the target environment. No further input was provided, counted as implicit confirmation. Signals: Meaningful Query (High positive), Implicit Confirmation (Low positive), Configuration Applied (High positive), Self-Service (Medium positive). No negative signals detected.',
      transcript: MCP_TRANSCRIPT,
    }
  }
  return base
}
```

- [ ] **Step 5: Attach `detail` to rows.** After the `HEADLESS_ROWS` literal, and after `SIMPLE_ROWS`, map each to add its detail. Replace the current `const HEADLESS_ROWS: ConvRow[] = [ … ]` / `const SIMPLE_ROWS: ConvRow[] = HEADLESS_ROWS.map(...)` so the base literals omit `detail` and a wrapper adds it:

Change the `HEADLESS_ROWS` declaration type to build without detail, then attach. Concretely:
```ts
const HEADLESS_ROWS_BASE: Omit<ConvRow, 'detail'>[] = [ /* the existing 5 row literals, unchanged */ ]
const HEADLESS_ROWS: ConvRow[] = HEADLESS_ROWS_BASE.map((r) => ({ ...r, detail: detailFor(r) }))

const SIMPLE_ROWS: ConvRow[] = HEADLESS_ROWS_BASE.map((r, i) => {
  const base: Omit<ConvRow, 'detail'> = { ...r, id: `s-${i + 1}`, source: 'human', client: 'n/a' }
  return { ...base, detail: detailFor(base) }
})
```
(Rename the existing literal array to `HEADLESS_ROWS_BASE` and drop its `: ConvRow[]` annotation in favor of `: Omit<ConvRow, 'detail'>[]`. The five row objects themselves are unchanged.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run --exclude '**/.claude/**' src/features/insights/ai-performances/conversations/conversations-data.test.ts`
Expected: PASS (all prior + 4 new cases).

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/features/insights/ai-performances/conversations/conversations-data.ts src/features/insights/ai-performances/conversations/conversations-data.test.ts
git commit -m "feat(insights): add ConvDetail model + detailFor factory for conversation rows"
```

---

### Task 2: `ConversationDetailPanel` slide-over

**Files:**
- Create: `src/features/insights/ai-performances/conversations/ConversationDetailPanel.tsx`
- Test: `src/features/insights/ai-performances/conversations/ConversationDetailPanel.test.tsx`

**Interfaces:**
- Consumes: `ConvDetail`, `TranscriptEntry`, `EventItem`, `SourceKind`, `SOURCE_META` from `./conversations-data`.
- Produces: `export function ConversationDetailPanel({ detail, onClose }: { detail: ConvDetail; onClose: () => void })`.

**Context:** Follows `src/features/insights/cx-journey/GeneratedAgentPanel.tsx` for the shell (scrim, dialog, Escape). This panel reproduces Figma frames 145-77530 (A2A) and 145-77713 (MCP). All buttons/dropdown/"Add…" are decorative no-ops.

- [ ] **Step 1: Write the failing test** — create `ConversationDetailPanel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConversationDetailPanel } from './ConversationDetailPanel'
import { CHANNELS } from './conversations-data'

const a2aDetail = CHANNELS.headless.rows.find((r) => r.client === 'OpenClaw')!.detail
const mcpDetail = CHANNELS.headless.rows.find((r) => r.client === 'Claude Desktop')!.detail

describe('ConversationDetailPanel', () => {
  it('renders the A2A conversation with calling-client wording', () => {
    render(<ConversationDetailPanel detail={a2aDetail} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Calling client')).toBeInTheDocument()
    expect(screen.getAllByText('OpenClaw').length).toBeGreaterThan(0)
    expect(screen.getByText(/Delegation token verified/)).toBeInTheDocument()
  })

  it('renders the MCP conversation with MCP-client wording', () => {
    render(<ConversationDetailPanel detail={mcpDetail} onClose={() => {}} />)
    expect(screen.getByText('MCP client')).toBeInTheDocument()
    expect(screen.getAllByText('Claude Desktop').length).toBeGreaterThan(0)
    expect(screen.getByText(/SAML SSO setup steps/)).toBeInTheDocument()
  })

  it('closes on the Close button, the scrim, and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ConversationDetailPanel detail={a2aDetail} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.click(screen.getByTestId('conversation-detail-scrim'))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/insights/ai-performances/conversations/ConversationDetailPanel.test.tsx`
Expected: FAIL — module not found / `ConversationDetailPanel` not exported.

- [ ] **Step 3: Implement the panel.** Create `ConversationDetailPanel.tsx`:

```tsx
// Right slide-over showing full details for a clicked conversation row.
// Reproduces Figma frames 145-77530 (A2A) and 145-77713 (MCP); content is
// driven by the row's `source`. Follows the GeneratedAgentPanel convention
// (scrim + dialog, closes on X / scrim / Escape). Presentational — the Events
// "Add…", "Define a New Intent", the intent dropdown, and "Assign" are no-ops.
import { useEffect } from 'react'
import { Check, ChevronDown, Plus, Repeat, X } from 'lucide-react'
import {
  type ConvDetail,
  type EventItem,
  type TranscriptEntry,
  SOURCE_META,
} from './conversations-data'

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[12px] text-[#727583]">
      {label}: <span className="text-black">{value}</span>
    </p>
  )
}

function Divider() {
  return <div className="h-px w-full bg-[#e4e7f0]" />
}

function SignalChip({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 text-[12px] text-black">
      <Check className="h-4 w-4 text-[#048c80]" aria-hidden />
      {label}
    </span>
  )
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded bg-[#f2f4f7] px-2 py-1 text-[12px] text-[#545767]">
          <Repeat className="h-3 w-3" aria-hidden />
          {event.label}
          <span className="inline-block h-1 w-1 rounded-full bg-[#727583]" />
          {event.client}
        </span>
        <span className="text-[12px] text-[#727583]">{event.duration}</span>
      </div>
      {event.sublink && (
        <span className="text-[12px] text-[#145ad0] underline">{event.sublink}</span>
      )}
    </div>
  )
}

function StepFrame({ text }: { text: string }) {
  return (
    <div className="rounded-[5px] border border-[#f2f4f7] bg-white px-3 py-1 text-[12px] text-[#727583]">
      {text}
    </div>
  )
}

function Bubble({
  entry,
  clientBg,
}: {
  entry: Extract<TranscriptEntry, { kind: 'bubble' }>
  clientBg: string
}) {
  const bg = entry.side === 'client' ? clientBg : '#f2f4f7'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[12px]">
        <span className="text-black">{entry.speaker}</span>
        <span className="inline-block h-1 w-1 rounded-full bg-[#727583]" />
        <span className="text-[#727583]">{entry.role}</span>
      </div>
      <div className="whitespace-pre-line rounded-lg px-4 py-3 text-[14px] text-black" style={{ background: bg }}>
        {entry.text}
      </div>
    </div>
  )
}

export function ConversationDetailPanel({
  detail,
  onClose,
}: {
  detail: ConvDetail
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const meta = SOURCE_META[detail.source]
  const clientBg = detail.source === 'a2a' ? '#fff7fc' : detail.source === 'mcp' ? '#ebf5f7' : '#f2f4f7'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        data-testid="conversation-detail-scrim"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Conversation Details"
        className="relative flex h-full w-[600px] flex-col overflow-y-auto bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-10">
          <h2 className="text-[24px] font-semibold text-black">Conversation Details</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-surface-border text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Source badge */}
        <div className="px-10 pt-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{ color: meta.fg, background: meta.bg }}
          >
            <Repeat className="h-3.5 w-3.5" aria-hidden />
            {meta.label}
          </span>
        </div>

        <div className="flex flex-col gap-8 px-10 py-8">
          {/* Meta rows */}
          <div className="flex flex-col gap-3">
            <MetaRow label="Conversation ID" value={detail.conversationId} />
            <MetaRow label="Automated" value={detail.automated} />
            <MetaRow label="Source" value={meta.label} />
            {detail.clientLabel && detail.clientValue && (
              <MetaRow label={detail.clientLabel} value={detail.clientValue} />
            )}
            <MetaRow label="Deflected" value={detail.deflected} />
            <MetaRow label="Resolved" value={detail.resolved} />
          </div>

          {/* Conversation card */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-black">Conversation</p>
            <div className="flex flex-col gap-4 rounded-lg border border-[#e4e7f0] p-4">
              <div className="flex flex-col gap-3 text-[12px] text-[#727583]">
                <MetaRow label="Time created" value={detail.timeCreated} />
                <MetaRow label="Time spent" value={detail.timeSpent} />
                <MetaRow label="Channel" value={detail.channel} />
                <MetaRow label="Automated" value={detail.automated} />
                <MetaRow label="Deflected" value={detail.deflected} />
                <MetaRow label="Resolved" value={detail.resolved} />
                <MetaRow label="# of interactions" value={detail.interactions} />
              </div>
              <Divider />
              <p className="text-[12px] text-[#727583]">
                Context Variables
                <br />
                <span className="text-black">{detail.contextVariables}</span>
              </p>
              <Divider />
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-[#727583]">Calling client query:</p>
                <p className="text-[14px] italic text-[#145ad0]">{detail.clientQuery}</p>
              </div>
              <Divider />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-[#727583]">Events:</p>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded bg-[#ebf5f7] py-1.5 pl-4 pr-2 text-[14px] font-semibold text-[#014968]"
                  >
                    Add…
                    <ChevronDown size={16} aria-hidden />
                  </button>
                </div>
                <div className="flex flex-col gap-3 border-l border-[#e4e7f0] pl-4">
                  {detail.events.map((e) => (
                    <EventRow key={e.label} event={e} />
                  ))}
                </div>
              </div>
              <Divider />
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-[#727583]">Resolution</p>
                <span className="w-fit rounded bg-[#055952] px-2 py-1 text-[11px] font-semibold text-white">
                  {detail.resolutionBadge}
                </span>
                <p className="text-[12px] text-[#727583]">{detail.resolutionText}</p>
                <div className="flex flex-wrap gap-5">
                  {detail.signals.map((s) => (
                    <SignalChip key={s} label={s} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[#e4e7f0]" />
                <p className="text-[12px] text-black">Reassign to new or existing intent</p>
                <div className="h-px flex-1 bg-[#e4e7f0]" />
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-0.5 rounded bg-[#ebf5f7] py-1.5 text-[14px] font-semibold text-[#193d50]"
              >
                <Plus size={20} aria-hidden />
                Define a New Intent
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded border border-[#bcbdc5] bg-white py-2.5 pl-4 pr-2.5 text-[14px] text-[#9194a0]"
              >
                Assign to an existing intent
                <ChevronDown size={20} aria-hidden />
              </button>
              <button
                type="button"
                className="w-full rounded bg-[#f2f4f7] px-4 py-1.5 text-[14px] font-semibold text-[#a6a9b2]"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Transcript card */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-black">Transcript</p>
            <div className="flex flex-col gap-4 rounded-lg border border-[#e4e7f0] p-4">
              <div className="flex items-center gap-2 py-3">
                <div className="h-px flex-1 bg-[#e4e7f0]" />
                <p className="text-center text-[14px] text-black">
                  {detail.transcriptIntro}
                  <span className="text-[#1d2033]">, {detail.timeCreated}</span>
                </p>
                <div className="h-px flex-1 bg-[#e4e7f0]" />
              </div>
              {detail.transcript.map((entry, i) =>
                entry.kind === 'step' ? (
                  <StepFrame key={i} text={entry.text} />
                ) : (
                  <Bubble key={i} entry={entry} clientBg={clientBg} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --exclude '**/.claude/**' src/features/insights/ai-performances/conversations/ConversationDetailPanel.test.tsx`
Expected: PASS (3 cases).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/insights/ai-performances/conversations/ConversationDetailPanel.tsx src/features/insights/ai-performances/conversations/ConversationDetailPanel.test.tsx
git commit -m "feat(insights): add ConversationDetailPanel slide-over"
```

---

### Task 3: Clickable rows + wire panel into the view

**Files:**
- Modify: `src/features/insights/ai-performances/conversations/ConversationTable.tsx`
- Modify: `src/features/insights/ai-performances/conversations/ConversationsView.tsx`
- Test: `src/features/insights/ai-performances/conversations/ConversationsView.test.tsx` (extend)

**Interfaces:**
- Consumes: `ConversationDetailPanel` (Task 2), `ConvRow` (Task 1), existing `ConversationTable` / `ConversationsView`.
- Produces: `ConversationTable` gains `onRowClick: (row: ConvRow) => void`; `ConversationsView` renders the panel when a row is selected.

**Context:** `ConversationTable`'s signature is currently `{ columns, rows, gapsOnly, onGapsOnlyChange }`. Rows render as `<tr key={row.id} className="border-b border-surface-border last:border-0 align-top">`. `ConversationsView` owns `channel`, `cardsCollapsed`, `gapsOnly` state and renders `<ConversationTable columns={…} rows={…} gapsOnly={…} onGapsOnlyChange={…} />`.

- [ ] **Step 1: Write the failing test** — append to `ConversationsView.test.tsx`:

```tsx
  it('opens the detail panel when a table row is clicked and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<ConversationsView />)
    const view = within(screen.getByTestId('view-conversations'))
    // The A2A OpenClaw row is identifiable by its transcript preview text.
    await user.click(view.getByText(/Delegation token verified/))
    const dialog = screen.getByRole('dialog', { name: 'Conversation Details' })
    expect(within(dialog).getByText('Calling client')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Conversation Details' })).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/insights/ai-performances/conversations/ConversationsView.test.tsx`
Expected: FAIL — no dialog opens on row click.

- [ ] **Step 3: Make rows clickable in `ConversationTable.tsx`.** Add `onRowClick` to the props and make each `<tr>` activatable. Update the import to include `ConvRow` type if not present (it already imports `type ConvRow`).

Change the signature:
```tsx
export function ConversationTable({
  columns,
  rows,
  gapsOnly,
  onGapsOnlyChange,
  onRowClick,
}: {
  columns: ConvColumn[]
  rows: ConvRow[]
  gapsOnly: boolean
  onGapsOnlyChange: (v: boolean) => void
  onRowClick: (row: ConvRow) => void
}) {
```

Change the row `<tr>`:
```tsx
            <tr
              key={row.id}
              role="button"
              tabIndex={0}
              onClick={() => onRowClick(row)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRowClick(row)
                }
              }}
              className="cursor-pointer border-b border-surface-border align-top last:border-0 hover:bg-[#f9fafb]"
            >
```

- [ ] **Step 4: Wire the panel into `ConversationsView.tsx`.** Add the import, the `selected` state, pass `onRowClick`, and render the panel:

Add imports:
```tsx
import { ConversationDetailPanel } from './ConversationDetailPanel'
import { CHANNELS, CONV_CHANNEL_TABS, type ChannelKey, type ConvRow } from './conversations-data'
```
(extend the existing `conversations-data` import to include `type ConvRow`; keep `ConversationCard` and `ConversationTable` imports.)

Add state next to the others:
```tsx
  const [selected, setSelected] = useState<ConvRow | null>(null)
```

Pass the handler to the table:
```tsx
      <ConversationTable
        columns={data.columns}
        rows={data.rows}
        gapsOnly={gapsOnly}
        onGapsOnlyChange={setGapsOnly}
        onRowClick={setSelected}
      />
```

Render the panel just before the closing `</div>` of the root:
```tsx
      {selected && (
        <ConversationDetailPanel detail={selected.detail} onClose={() => setSelected(null)} />
      )}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run --exclude '**/.claude/**' src/features/insights/ai-performances/conversations/`
Expected: PASS — all conversations tests including the new open/close case. (The existing "Gaps only" test still passes: it clicks `getByText(/Delegation token verified/)`, which now opens the panel, but that test only asserts on filtering *before* clicking that text — verify it still passes; if the click side-effect interferes, it does not, because the gaps test clicks the checkbox, not the row.)

- [ ] **Step 6: Full suite + typecheck**

Run: `npx vitest run --exclude '**/.claude/**'` then `npx tsc --noEmit`
Expected: full suite green, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/insights/ai-performances/conversations/ConversationTable.tsx src/features/insights/ai-performances/conversations/ConversationsView.tsx src/features/insights/ai-performances/conversations/ConversationsView.test.tsx
git commit -m "feat(insights): open Conversation Details panel on row click"
```

---

### Task 4: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Typecheck** — `npx tsc --noEmit` → no errors.
- [ ] **Step 2: Full test suite** — `npx vitest run --exclude '**/.claude/**'` → all green.
- [ ] **Step 3: Build** — `npx vite build` → succeeds (a pre-existing chunk-size warning is unrelated and expected).
- [ ] **Step 4:** No commit (verification only). Report results.

## Self-Review notes

- **Spec coverage:** meta rows, Conversation card (details, context vars, client query, Events, Resolution, Reassign controls), Transcript (intro + bubbles + step frames), source-driven badge/label/intro/tint, clickable rows all-channels, open/close on X+scrim+Escape → all mapped to Tasks 1–3.
- **Type consistency:** `detailFor` / `ConvDetail` / `TranscriptEntry` / `EventItem` names and shapes are identical across Task 1 (definition), Task 2 (consumption), Task 3 (row plumbing). `onRowClick(row: ConvRow)` matches `setSelected` (a `Dispatch<SetStateAction<ConvRow | null>>` accepts a `ConvRow`).
- **Determinism:** all detail content is literal strings; no `Date.now()` / `Math.random()`.
