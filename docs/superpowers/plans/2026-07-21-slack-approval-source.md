# Slack-sourced Approval — Embedded Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Sunny created a self-improving plan" approval on the Home dashboard render its origin as an embedded, forwarded-from-Slack quote block.

**Architecture:** Add an optional `slack?` field to the approval mock-data type (same optional-discriminator pattern as `person?`/`abTest?`), populate it on the one Sunny approval, and render a neutral bordered quote block in `ApprovalsCard` when `slack` is present. A small inline Slack SVG glyph is added locally (no new dependency). The redundant `person` footer is suppressed when `slack` is present.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4, Vitest + React Testing Library, lucide-react.

## Global Constraints

- TypeScript strict mode; keep new code fully typed. Do NOT bump TypeScript (pinned 5.9).
- Use existing inline palette constants in `HomeScreen.tsx` (`INK`, `INK_SOFT`, `MUTED`, `BORDER`, etc.); Slack aubergine `#611f69` is a new one-off inline hue (no design token).
- No new dependencies. `lucide-react` has no Slack logo — use an inline SVG.
- Mock/presentational only. No backend, no Slack integration.
- Reliable gates: `pnpm test`, `pnpm typecheck`, `pnpm build`. (`pnpm lint` is known-broken upstream — do not rely on it.)
- `Level` is a single value (`'platform'`) — there is exactly one Sunny approval to update.

---

## File Structure

- `src/features/home/dashboard-data.ts` — add `slack?` to the approval type; populate it on `a2`.
- `src/features/home/HomeScreen.tsx` — add `SlackGlyph` component + render the embedded Slack block in `ApprovalsCard`; suppress `person` footer when `slack` present.
- `src/features/home/HomeScreen.test.tsx` — update the self-improving-plan test to assert the Slack block and the suppressed footer.

---

### Task 1: Add `slack` field to the approval data model and populate the Sunny approval

**Files:**
- Modify: `src/features/home/dashboard-data.ts:47-63` (type), `src/features/home/dashboard-data.ts:163-170` (a2 data)

**Interfaces:**
- Consumes: nothing.
- Produces: `LevelData['approvals'][number].slack?: { channel: string; author: string; role?: string; time: string; message: string }`. Consumed by `ApprovalsCard` in Task 3.

- [ ] **Step 1: Add the `slack?` field to the approval item type**

In `src/features/home/dashboard-data.ts`, inside the `approvals: {...}[]` type (currently ending at line 63 with the `abTest?` block), add after the `abTest?` field, before the closing `}[]`:

```ts
    // Present when the approval originated from a Slack message; renders the
    // original message as an embedded, forwarded-from-Slack quote block.
    slack?: {
      channel: string   // e.g. "#support-ai"
      author: string    // "Sunny Kong"
      role?: string      // "Support Lead"
      time: string       // "10:24 AM"
      message: string    // the quoted message text
    }
```

- [ ] **Step 2: Populate `slack` on the `a2` (Sunny) approval**

The `a2` object currently reads:

```ts
      {
        id: 'a2',
        title: 'Sunny created a self-improving plan',
        body: 'Add 8 macros and reroute refund intents to the billing skill. Review and approve the plan to let the agent apply it.',
        impact: '+4% resolution',
        author: 'Sunny Kong',
        person: { name: 'Sunny Kong', role: 'Support Lead' },
      },
```

Add a `slack` field to it:

```ts
      {
        id: 'a2',
        title: 'Sunny created a self-improving plan',
        body: 'Add 8 macros and reroute refund intents to the billing skill. Review and approve the plan to let the agent apply it.',
        impact: '+4% resolution',
        author: 'Sunny Kong',
        person: { name: 'Sunny Kong', role: 'Support Lead' },
        slack: {
          channel: '#support-ai',
          author: 'Sunny Kong',
          role: 'Support Lead',
          time: '10:24 AM',
          message: 'Can we add a few macros and reroute refund intents to the billing skill? Resolution keeps stalling there.',
        },
      },
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no type errors).

- [ ] **Step 4: Commit**

```bash
git add src/features/home/dashboard-data.ts
git commit -m "feat: add slack source field to approval mock data"
```

---

### Task 2: Add the inline Slack glyph component

**Files:**
- Modify: `src/features/home/HomeScreen.tsx` (add component near the other local presentational helpers, above `ApprovalsCard` at line 249)

**Interfaces:**
- Consumes: nothing.
- Produces: `function SlackGlyph({ size }: { size?: number }): JSX.Element` — a monochrome Slack mark. Consumed by `ApprovalsCard` in Task 3.

- [ ] **Step 1: Add the `SlackGlyph` component**

In `src/features/home/HomeScreen.tsx`, immediately above `function ApprovalsCard({ data }: { data: LevelData }) {` (line 249), add:

```tsx
// Slack logomark — lucide has no Slack icon, so this is a local inline SVG
// (matching the codebase's inline-SVG convention). Rendered in Slack aubergine.
function SlackGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.8 122.8" aria-hidden="true">
      <path fill="#611f69" d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9z"/>
      <path fill="#611f69" d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9z"/>
      <path fill="#611f69" d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9z"/>
      <path fill="#611f69" d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9z"/>
    </svg>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. (The component is unused for now — TypeScript does not error on unused top-level functions.)

- [ ] **Step 3: Commit**

```bash
git add src/features/home/HomeScreen.tsx
git commit -m "feat: add inline Slack glyph component"
```

---

### Task 3: Render the embedded Slack block and update the test

**Files:**
- Modify: `src/features/home/HomeScreen.tsx:296-306` (the impact/attribution row inside `ApprovalsCard`)
- Test: `src/features/home/HomeScreen.test.tsx:146-150`

**Interfaces:**
- Consumes: `a.slack` (Task 1), `SlackGlyph` (Task 2), existing constants `INK`, `INK_SOFT`, `MUTED`, `BORDER`.
- Produces: rendered output only.

- [ ] **Step 1: Update the failing test**

In `src/features/home/HomeScreen.test.tsx`, replace the existing test (lines 146-150):

```tsx
  it('attributes a self-improving plan approval to a named co-worker', () => {
    render(<HomeScreen />)
    expect(screen.getByText(/sunny created a self-improving plan/i)).toBeInTheDocument()
    expect(screen.getByText(/sunny kong · support lead/i)).toBeInTheDocument()
  })
```

with:

```tsx
  it('renders a self-improving plan approval as an embedded Slack message', () => {
    render(<HomeScreen />)
    expect(screen.getByText(/sunny created a self-improving plan/i)).toBeInTheDocument()
    // Origin is shown as a forwarded Slack message: channel + quoted text.
    expect(screen.getByText(/via slack #support-ai/i)).toBeInTheDocument()
    expect(screen.getByText(/reroute refund intents to the billing skill/i)).toBeInTheDocument()
    // The redundant "Name · Role" footer is suppressed when the Slack block shows.
    expect(screen.queryByText(/sunny kong · support lead/i)).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- HomeScreen`
Expected: FAIL — `via slack #support-ai` not found (block not rendered yet).

- [ ] **Step 3: Render the Slack block and gate the `person` footer**

In `src/features/home/HomeScreen.tsx`, the current block (lines 296-306) reads:

```tsx
            <div className="mt-2.5 flex items-center gap-2">
              <span className="flex h-5 items-center gap-1 rounded-full px-2" style={{ backgroundColor: `${GREEN}18` }}>
                <TrendingUp size={12} color={GREEN} />
                <span className="text-[11px] font-semibold" style={{ color: GREEN }}>{a.impact}</span>
              </span>
              {a.person ? (
                <span className="text-[11px] font-normal" style={{ color: MUTED }}>{a.person.name} · {a.person.role}</span>
              ) : (
                <span className="text-[11px] font-normal" style={{ color: MUTED }}>by {a.author}</span>
              )}
            </div>
```

Replace it with (adds the Slack block before the row, and suppresses the `person`/`author` footer when `slack` is present):

```tsx
            {a.slack && (
              <div className="mt-2.5 rounded-lg border border-solid bg-white p-2.5" style={{ borderColor: BORDER }}>
                <div className="mb-2 flex items-center gap-1.5">
                  <SlackGlyph size={13} />
                  <span className="text-[11px] font-normal" style={{ color: MUTED }}>via Slack {a.slack.channel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex size-[18px] shrink-0 items-center justify-center rounded-md text-[9px] font-semibold text-white"
                    style={{ backgroundColor: '#611f69' }}
                  >
                    {a.slack.author.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: INK }}>{a.slack.author}</span>
                  <span className="text-[11px] font-normal" style={{ color: MUTED }}>{a.slack.time}</span>
                </div>
                <p className="mt-1 pl-[24px] text-[12px] font-normal leading-[17px]" style={{ color: INK_SOFT }}>
                  {a.slack.message}
                </p>
              </div>
            )}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="flex h-5 items-center gap-1 rounded-full px-2" style={{ backgroundColor: `${GREEN}18` }}>
                <TrendingUp size={12} color={GREEN} />
                <span className="text-[11px] font-semibold" style={{ color: GREEN }}>{a.impact}</span>
              </span>
              {!a.slack && (a.person ? (
                <span className="text-[11px] font-normal" style={{ color: MUTED }}>{a.person.name} · {a.person.role}</span>
              ) : (
                <span className="text-[11px] font-normal" style={{ color: MUTED }}>by {a.author}</span>
              ))}
            </div>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- HomeScreen`
Expected: PASS.

- [ ] **Step 5: Typecheck and build**

Run: `pnpm typecheck && pnpm build`
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/home/HomeScreen.tsx src/features/home/HomeScreen.test.tsx
git commit -m "feat: render Sunny approval as embedded Slack message"
```

---

## Self-Review

- **Spec coverage:** data model `slack?` field (Task 1) ✓; populate `a2` (Task 1) ✓; render quoted block in `abTest`/`slack` slot (Task 3) ✓; suppress `person` footer (Task 3) ✓; inline Slack glyph, no dependency (Task 2) ✓; test for channel + message (Task 3) ✓. All spec sections covered.
- **Placeholder scan:** no TBD/TODO; all code shown in full.
- **Type consistency:** `slack` shape defined in Task 1 matches usage in Task 3 (`channel`, `author`, `role`, `time`, `message`); `SlackGlyph({ size })` defined in Task 2 matches call in Task 3.
- **Note:** the test filter `pnpm test -- HomeScreen` passes a name filter to vitest; if the project's `test` script does not forward args, use `npx vitest run HomeScreen` instead.
