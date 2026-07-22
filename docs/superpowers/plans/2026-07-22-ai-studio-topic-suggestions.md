# AI Studio Topic Suggestions Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the global TopBar "AI assistant" button to toggle a right-docked AI Studio suggestions panel that shows topic "quick win" cards (greeting + 3-card wrapping carousel + composer), reusing an extracted shell.

**Architecture:** Extract the panel chrome from the Organization `AiStudioPanel` into a reusable `AiStudioShell`. Build a new `ai-studio` feature (data + card + panel) that renders through the shell. Lift a `showAiStudio` toggle into `AppLayout`, wired to the existing TopBar AI button, and dock the panel globally.

**Tech Stack:** React 19, Vite, TypeScript (strict), Tailwind v4, lucide-react, Vitest + React Testing Library (jsdom).

## Global Constraints

- Path alias `@` → `src/`. Do NOT add `baseUrl` to tsconfig.
- TypeScript strict; keep new code fully typed.
- Determinism: no `Date.now()` / `Math.random()`.
- Presentation-only: no backend. Composer input, `+`, send, external-link, and card CTAs are no-ops.
- Use semantic Tailwind tokens (`text-ink`, `text-ink-muted`, `border-surface-border`, `bg-white`). For chrome fidelity, reuse the exact hex values already present in `AiStudioPanel.tsx` (e.g. `#545767`, `#5c6970`, `#f5f6f7`, `#ffb393`, gradient stops `#01567A`/`#6DBBD7`).
- Commands: `npx vitest run`, `npx tsc --noEmit` (pnpm not on PATH). Lint is broken (TS7 toolchain gap) — do not rely on it.
- The Organization screen's behavior and its `data-testid="ai-studio-panel"` must be preserved; its existing tests (`src/features/organization/OrganizationScreen.test.tsx`) must stay green.

---

## File Structure

- `src/features/ai-studio/AiStudioShell.tsx` — reusable presentational chrome (aside + header + body slot + composer).
- `src/features/ai-studio/suggestions-data.ts` — `TopicSuggestion` type + `TOPIC_SUGGESTIONS` (3 records).
- `src/features/ai-studio/SuggestionCard.tsx` — one suggestion card with pager + CTA.
- `src/features/ai-studio/TopicSuggestionsPanel.tsx` — greeting + carousel, rendered through the shell.
- `src/features/organization/AiStudioPanel.tsx` — refactored to render its steps through `AiStudioShell`.
- `src/app/layout/TopBar.tsx` — AI button wired to toggle props.
- `src/app/layout/AppLayout.tsx` — owns `showAiStudio`, docks the panel.

Test files colocated: `AiStudioShell.test.tsx`, `SuggestionCard.test.tsx`, `TopicSuggestionsPanel.test.tsx`, `AppLayout.test.tsx` (new or extended).

---

## Task 1: Extract `AiStudioShell`

**Files:**
- Create: `src/features/ai-studio/AiStudioShell.tsx`
- Test: `src/features/ai-studio/AiStudioShell.test.tsx`

**Interfaces:**
- Produces: `AiStudioShell({ testId?: string; onClose?: () => void; children: ReactNode }): JSX.Element`

**Notes:** The chrome is lifted verbatim from the current `src/features/organization/AiStudioPanel.tsx` (header with gradient sparkle + "AI Studio" title + external-link + close; scrollable body; composer pill with `+`, input, gradient-sparkle send). The `data-testid` is parameterized via `testId` so the Organization instance keeps `ai-studio-panel` and the Topics instance can set its own.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-studio/AiStudioShell.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiStudioShell } from './AiStudioShell'

describe('AiStudioShell', () => {
  it('renders its children and the AI Studio title', () => {
    render(
      <AiStudioShell testId="shell-under-test">
        <p>body content</p>
      </AiStudioShell>,
    )
    expect(screen.getByTestId('shell-under-test')).toBeInTheDocument()
    expect(screen.getByText('AI Studio')).toBeInTheDocument()
    expect(screen.getByText('body content')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What can I help you with today?')).toBeInTheDocument()
  })

  it('fires onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <AiStudioShell onClose={onClose}>
        <p>body</p>
      </AiStudioShell>,
    )
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-studio/AiStudioShell.test.tsx`
Expected: FAIL — cannot resolve `./AiStudioShell`.

- [ ] **Step 3: Write the shell**

Create `src/features/ai-studio/AiStudioShell.tsx`. Move the chrome out of `AiStudioPanel.tsx` verbatim, replacing the steps body with `{children}` and parameterizing the testid:

```tsx
import type { ReactNode } from 'react'
import { Plus, ExternalLink, X } from 'lucide-react'

// Reusable AI Studio assistant shell: a white card with a header (sparkle +
// "AI Studio" title, external-link and close actions), a scrollable body slot,
// and a presentational chat composer pinned to the bottom. Static shell — the
// composer, `+`, send, and external-link are no-ops (no backend this phase).
// `onClose` is wired to the header X button so the parent can hide the panel.
export function AiStudioShell({
  testId = 'ai-studio-panel',
  onClose,
  children,
}: {
  testId?: string
  onClose?: () => void
  children: ReactNode
}) {
  return (
    <aside
      data-testid={testId}
      className="flex h-full w-[380px] shrink-0 flex-col overflow-hidden rounded-3xl border border-[#f8f8f8] bg-white"
    >
      {/* Header: AI Studio title + action buttons */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2.5">
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-semibold leading-[22px] tracking-[-0.085px] text-[#545767]">
            AI Studio
          </span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="aiStudioSparkle" x1="3" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#01567A" />
                <stop offset="1" stopColor="#6DBBD7" />
              </linearGradient>
            </defs>
            <path
              d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"
              stroke="url(#aiStudioSparkle)"
              strokeWidth={1.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Open in new tab"
            className="flex size-6 items-center justify-center rounded text-[#5c6970] transition-colors hover:bg-[#f5f6f7]"
          >
            <ExternalLink size={16} />
          </button>
          <button
            aria-label="Close AI Studio"
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded text-[#5c6970] transition-colors hover:bg-[#f5f6f7]"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5">{children}</div>

      {/* Chat composer: peach-bordered pill with + and gradient sparkle send */}
      <div className="px-5 pb-5 pt-2">
        <div className="flex items-center gap-2 rounded-full border border-[#ffb393] bg-white px-2 py-2 shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)]">
          <button
            aria-label="Add attachment"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-[#f5f6f7]"
          >
            <Plus size={16} />
          </button>
          <input
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-5 tracking-[-0.1px] text-ink outline-none placeholder:text-[#727583]"
            placeholder="What can I help you with today?"
          />
          <button
            aria-label="Send message"
            className="flex size-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="aiStudioSend" x1="3" y1="12" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#01567A" />
                  <stop offset="1" stopColor="#6DBBD7" />
                </linearGradient>
              </defs>
              <path
                d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"
                stroke="url(#aiStudioSend)"
                strokeWidth={1.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-studio/AiStudioShell.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-studio/AiStudioShell.tsx src/features/ai-studio/AiStudioShell.test.tsx
git commit -m "feat(ai-studio): extract reusable AiStudioShell chrome"
```

---

## Task 2: Refactor Organization `AiStudioPanel` onto the shell

**Files:**
- Modify: `src/features/organization/AiStudioPanel.tsx`
- Verify: `src/features/organization/OrganizationScreen.test.tsx` (unchanged, must stay green)

**Interfaces:**
- Consumes: `AiStudioShell` from Task 1.

**Notes:** Replace the panel's hand-rolled `<aside>`/header/composer with `AiStudioShell`, keeping the `STEPS` array and the frosted sub-card body. The shell instance keeps `testId="ai-studio-panel"` (its default) so existing tests pass.

- [ ] **Step 1: Rewrite `AiStudioPanel.tsx`**

Replace the whole file with the shell-based version (keep the `STEPS` array verbatim from the current file — Building2/BookOpen/SlidersHorizontal/Bot with the same titles, bodies, and colors):

```tsx
import { Building2, BookOpen, SlidersHorizontal, Bot } from 'lucide-react'
import { AiStudioShell } from '@/features/ai-studio/AiStudioShell'

type StepCard = {
  Icon: typeof BookOpen
  color: string
  title: string
  body: string
}

// The four onboarding steps shown inside the "AI Agent set up" sub-card, ported
// from the Figma "AI Studio active" frame. Icon colors match the design's hues.
const STEPS: StepCard[] = [
  {
    Icon: Building2,
    color: '#247acb',
    title: 'Organization Setup',
    body: 'Set your Organization name and select customer support channels.',
  },
  {
    Icon: BookOpen,
    color: '#be297b',
    title: 'Connect Knowledge',
    body: 'Connect a knowledge base so your Agents have source information to work with.',
  },
  {
    Icon: SlidersHorizontal,
    color: '#2f99b3',
    title: 'Channel Configuration',
    body: 'Set up your channels based on your brand specifications.',
  },
  {
    Icon: Bot,
    color: '#e05c34',
    title: 'Build Agent',
    body: 'Build your AI agent using natural language.',
  },
]

// Organization dashboard AI Studio panel: onboarding steps rendered through the
// shared AiStudioShell. Presentational — no backend this phase.
export function AiStudioPanel({ onClose }: { onClose?: () => void }) {
  return (
    <AiStudioShell onClose={onClose}>
      {/* Two-line welcome */}
      <p className="mt-6 text-[22px] leading-[30px] tracking-[0.352px] text-black">
        Welcome, Sunny 👋
        <br />
        Let&apos;s set up your first AI organization.
      </p>

      {/* Copilot message */}
      <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-ink">
        Here are the next steps to get your AI Agent up and running.
      </p>

      {/* "AI Agent set up" frosted sub-card holding the steps */}
      <div className="mt-4 rounded-[20px] border border-white/80 bg-white/30 p-4 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <p className="mb-1 text-[12px] font-medium leading-5 tracking-[-0.154px] text-black">
          AI Agent set up
        </p>
        <div className="flex flex-col">
          {STEPS.map((step, i) => (
            <button
              key={step.title}
              className={`flex flex-col items-start gap-2 py-3 text-left ${
                i < STEPS.length - 1 ? 'border-b border-[#e8e9eb]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <step.Icon size={18} color={step.color} strokeWidth={2} />
                <span className="text-[14px] font-medium leading-5 tracking-[-0.154px] text-[#3d4040]">
                  {step.title}
                </span>
              </div>
              <p className="text-[12px] leading-4 text-[#373a4d]">{step.body}</p>
            </button>
          ))}
        </div>
      </div>
    </AiStudioShell>
  )
}
```

- [ ] **Step 2: Run the Organization tests**

Run: `npx vitest run src/features/organization/OrganizationScreen.test.tsx`
Expected: PASS (existing tests unchanged — `ai-studio-panel` still present when shown, absent when hidden).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/organization/AiStudioPanel.tsx
git commit -m "refactor(organization): render AiStudioPanel through AiStudioShell"
```

---

## Task 3: Suggestions data

**Files:**
- Create: `src/features/ai-studio/suggestions-data.ts`
- Test: `src/features/ai-studio/suggestions-data.test.ts`

**Interfaces:**
- Produces:
  - `type TopicSuggestion = { id: string; title: string; bullets: string[]; cta: string }`
  - `const TOPIC_SUGGESTIONS: TopicSuggestion[]` (length 3)

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-studio/suggestions-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { TOPIC_SUGGESTIONS } from './suggestions-data'

describe('TOPIC_SUGGESTIONS', () => {
  it('has three suggestions, each fully populated', () => {
    expect(TOPIC_SUGGESTIONS).toHaveLength(3)
    for (const s of TOPIC_SUGGESTIONS) {
      expect(s.id).toBeTruthy()
      expect(s.title).toBeTruthy()
      expect(s.cta).toBeTruthy()
      expect(s.bullets.length).toBeGreaterThan(0)
    }
  })

  it('leads with the verbatim Figma "Create New Ticket" card', () => {
    const first = TOPIC_SUGGESTIONS[0]
    expect(first.id).toBe('create-new-ticket-leak')
    expect(first.title).toBe('Fix "Create New Ticket" leak')
    expect(first.cta).toBe('Show me the tickets')
    expect(first.bullets).toEqual([
      '3,653 unresolved conversations',
      'only 7% resolutions',
      '~$54,795 in recoverable savings',
      'CSAT at 3.91 (your lowest of the high-volume topics)',
    ])
  })

  it('has unique ids', () => {
    const ids = TOPIC_SUGGESTIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-studio/suggestions-data.test.ts`
Expected: FAIL — cannot resolve `./suggestions-data`.

- [ ] **Step 3: Write the data**

Create `src/features/ai-studio/suggestions-data.ts`:

```ts
// Mock AI Studio "quick win" suggestions for the CX Journey Topics context.
// Card 1 is verbatim from the Figma reference (node 846:62113); cards 2-3 are
// illustrative, drawn from the largest topics in the treemap (Billing, Account
// management). Presentation-only — the figures are mock, not backed by data.
export type TopicSuggestion = {
  id: string
  title: string
  bullets: string[]
  cta: string
}

export const TOPIC_SUGGESTIONS: TopicSuggestion[] = [
  {
    id: 'create-new-ticket-leak',
    title: 'Fix "Create New Ticket" leak',
    bullets: [
      '3,653 unresolved conversations',
      'only 7% resolutions',
      '~$54,795 in recoverable savings',
      'CSAT at 3.91 (your lowest of the high-volume topics)',
    ],
    cta: 'Show me the tickets',
  },
  {
    id: 'billing-deflection',
    title: 'Deflect Billing questions',
    bullets: [
      '1,567 tickets (your highest-volume topic)',
      'only 22% self-served today',
      '~$38,200 in recoverable savings',
      'a single macro could cover the top 3 intents',
    ],
    cta: 'Draft a macro',
  },
  {
    id: 'account-coaching',
    title: 'Coach on Account management',
    bullets: [
      '61% of replies needed a second touch',
      'agent reply time 2.4x your topic average',
      '~$21,450 in avoidable handling cost',
      'CSAT dips to 3.7 on escalated threads',
    ],
    cta: 'Review conversations',
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-studio/suggestions-data.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-studio/suggestions-data.ts src/features/ai-studio/suggestions-data.test.ts
git commit -m "feat(ai-studio): add topic suggestion mock data"
```

---

## Task 4: `SuggestionCard`

**Files:**
- Create: `src/features/ai-studio/SuggestionCard.tsx`
- Test: `src/features/ai-studio/SuggestionCard.test.tsx`

**Interfaces:**
- Consumes: `TopicSuggestion` from Task 3.
- Produces: `SuggestionCard({ suggestion: TopicSuggestion; index: number; total: number; onPrev: () => void; onNext: () => void }): JSX.Element`

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-studio/SuggestionCard.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuggestionCard } from './SuggestionCard'
import { TOPIC_SUGGESTIONS } from './suggestions-data'

describe('SuggestionCard', () => {
  const suggestion = TOPIC_SUGGESTIONS[0]

  it('renders the title, pager, all bullets, and CTA', () => {
    render(
      <SuggestionCard suggestion={suggestion} index={0} total={3} onPrev={vi.fn()} onNext={vi.fn()} />,
    )
    expect(screen.getByText('Fix "Create New Ticket" leak')).toBeInTheDocument()
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    expect(screen.getByText('3,653 unresolved conversations')).toBeInTheDocument()
    expect(screen.getByText('Show me the tickets')).toBeInTheDocument()
  })

  it('fires onPrev / onNext from the pager buttons', async () => {
    const onPrev = vi.fn()
    const onNext = vi.fn()
    render(
      <SuggestionCard suggestion={suggestion} index={0} total={3} onPrev={onPrev} onNext={onNext} />,
    )
    await userEvent.click(screen.getByLabelText('Previous suggestion'))
    await userEvent.click(screen.getByLabelText('Next suggestion'))
    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-studio/SuggestionCard.test.tsx`
Expected: FAIL — cannot resolve `./SuggestionCard`.

- [ ] **Step 3: Write the card**

Create `src/features/ai-studio/SuggestionCard.tsx`:

```tsx
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { TopicSuggestion } from './suggestions-data'

// One AI Studio "quick win" card: sparkle + pager row, title, "What it is:"
// bullet list, and a full-width CTA. The CTA is presentational (no-op). Pager
// controls are driven by the parent carousel via onPrev/onNext.
export function SuggestionCard({
  suggestion,
  index,
  total,
  onPrev,
  onNext,
}: {
  suggestion: TopicSuggestion
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.06)]">
      {/* Sparkle + pager */}
      <div className="mb-3 flex items-center justify-between">
        <Sparkles className="h-4 w-4 text-ink-muted" />
        <div className="flex items-center gap-1 text-[12px] text-ink-muted">
          <button type="button" aria-label="Previous suggestion" onClick={onPrev} className="rounded p-0.5">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            {index + 1} of {total}
          </span>
          <button type="button" aria-label="Next suggestion" onClick={onNext} className="rounded p-0.5">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p className="text-[14px] font-semibold text-ink">{suggestion.title}</p>

      {/* What it is */}
      <p className="mt-3 text-[12px] font-medium text-ink">What it is:</p>
      <ul className="mt-1 list-disc pl-5 text-[12px] leading-5 text-ink-muted">
        {suggestion.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      {/* CTA (presentational) */}
      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-surface-border py-2 text-[13px] font-medium text-accent-blue transition-colors hover:bg-[#f5f6f7]"
      >
        {suggestion.cta}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-studio/SuggestionCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-studio/SuggestionCard.tsx src/features/ai-studio/SuggestionCard.test.tsx
git commit -m "feat(ai-studio): add SuggestionCard with pager and CTA"
```

---

## Task 5: `TopicSuggestionsPanel` (carousel through the shell)

**Files:**
- Create: `src/features/ai-studio/TopicSuggestionsPanel.tsx`
- Test: `src/features/ai-studio/TopicSuggestionsPanel.test.tsx`

**Interfaces:**
- Consumes: `AiStudioShell` (Task 1), `TOPIC_SUGGESTIONS` (Task 3), `SuggestionCard` (Task 4).
- Produces: `TopicSuggestionsPanel({ onClose?: () => void }): JSX.Element`. Root shell carries `data-testid="ai-studio-topics-panel"`.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-studio/TopicSuggestionsPanel.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopicSuggestionsPanel } from './TopicSuggestionsPanel'

describe('TopicSuggestionsPanel', () => {
  it('shows the greeting and the first suggestion', () => {
    render(<TopicSuggestionsPanel />)
    expect(screen.getByTestId('ai-studio-topics-panel')).toBeInTheDocument()
    expect(screen.getByText(/Here's 3 quick wins/)).toBeInTheDocument()
    expect(screen.getByText('Fix "Create New Ticket" leak')).toBeInTheDocument()
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('advances to the next card and wraps around', async () => {
    render(<TopicSuggestionsPanel />)
    const next = screen.getByLabelText('Next suggestion')
    await userEvent.click(next)
    expect(screen.getByText('2 of 3')).toBeInTheDocument()
    expect(screen.getByText('Deflect Billing questions')).toBeInTheDocument()
    await userEvent.click(next)
    expect(screen.getByText('3 of 3')).toBeInTheDocument()
    await userEvent.click(next)
    // wraps back to the first
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Fix "Create New Ticket" leak')).toBeInTheDocument()
  })

  it('wraps backward from the first card to the last', async () => {
    render(<TopicSuggestionsPanel />)
    await userEvent.click(screen.getByLabelText('Previous suggestion'))
    expect(screen.getByText('3 of 3')).toBeInTheDocument()
    expect(screen.getByText('Coach on Account management')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-studio/TopicSuggestionsPanel.test.tsx`
Expected: FAIL — cannot resolve `./TopicSuggestionsPanel`.

- [ ] **Step 3: Write the panel**

Create `src/features/ai-studio/TopicSuggestionsPanel.tsx`:

```tsx
import { useState } from 'react'
import { AiStudioShell } from './AiStudioShell'
import { SuggestionCard } from './SuggestionCard'
import { TOPIC_SUGGESTIONS } from './suggestions-data'

// AI Studio panel for the CX Journey Topics context: a greeting, a subline, and
// a wrapping carousel of "quick win" suggestion cards, rendered through the
// shared AiStudioShell. Presentation-only.
export function TopicSuggestionsPanel({ onClose }: { onClose?: () => void }) {
  const total = TOPIC_SUGGESTIONS.length
  const [index, setIndex] = useState(0)
  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  return (
    <AiStudioShell testId="ai-studio-topics-panel" onClose={onClose}>
      {/* Two-line greeting */}
      <p className="mt-6 text-[22px] leading-[30px] tracking-[0.352px] text-black">
        Hello, Sunny 👋
        <br />
        Here&apos;s 3 quick wins you can knock out today.
      </p>

      {/* Subline */}
      <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-ink">
        Each is a quick action with real dollars behind it.
      </p>

      {/* Suggestion carousel */}
      <div className="mt-4 mb-4">
        <SuggestionCard
          suggestion={TOPIC_SUGGESTIONS[index]}
          index={index}
          total={total}
          onPrev={prev}
          onNext={next}
        />
      </div>
    </AiStudioShell>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-studio/TopicSuggestionsPanel.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-studio/TopicSuggestionsPanel.tsx src/features/ai-studio/TopicSuggestionsPanel.test.tsx
git commit -m "feat(ai-studio): add TopicSuggestionsPanel carousel"
```

---

## Task 6: Wire the TopBar button + dock the panel in AppLayout

**Files:**
- Modify: `src/app/layout/TopBar.tsx`
- Modify: `src/app/layout/AppLayout.tsx`
- Test: `src/app/layout/AppLayout.test.tsx` (create if absent)

**Interfaces:**
- Consumes: `TopicSuggestionsPanel` (Task 5).
- `TopBar` props become `{ onToggleAiStudio?: () => void; isAiStudioOpen?: boolean }`.

**Notes:** The AI-assistant button already exists in `TopBar.tsx` (the gradient sparkle at the end of the right cluster). Add `onClick` + `aria-pressed`; do not change the other icon buttons. `AppLayout` owns the state and docks the panel in BOTH the expanded and collapsed sidebar branches, to the right of `<main>`.

- [ ] **Step 1: Write the failing test**

Create `src/app/layout/AppLayout.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppLayout } from './AppLayout'

function renderLayout() {
  const router = createMemoryRouter(
    [{ path: '/', element: <AppLayout />, children: [{ index: true, element: <div>home</div> }] }],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('AppLayout AI Studio toggle', () => {
  it('toggles the topic suggestions panel from the TopBar AI button', async () => {
    renderLayout()
    const button = screen.getByLabelText('AI assistant')
    expect(screen.queryByTestId('ai-studio-topics-panel')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(button)
    expect(screen.getByTestId('ai-studio-topics-panel')).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(button)
    expect(screen.queryByTestId('ai-studio-topics-panel')).not.toBeInTheDocument()
  })

  it('closes the panel from its own close button', async () => {
    renderLayout()
    await userEvent.click(screen.getByLabelText('AI assistant'))
    expect(screen.getByTestId('ai-studio-topics-panel')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(screen.queryByTestId('ai-studio-topics-panel')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/layout/AppLayout.test.tsx`
Expected: FAIL — `AppLayout` renders no panel; the AI button has no `aria-pressed`.

- [ ] **Step 3: Update `TopBar.tsx`**

Change the signature and the AI-assistant button only (leave `ICON_BUTTONS` and the rest untouched):

```tsx
export function TopBar({
  onToggleAiStudio,
  isAiStudioOpen = false,
}: {
  onToggleAiStudio?: () => void
  isAiStudioOpen?: boolean
} = {}) {
```

and the button:

```tsx
        <button
          aria-label="AI assistant"
          aria-pressed={isAiStudioOpen}
          onClick={onToggleAiStudio}
          className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8d59b1] to-blue-700"
        >
          <Sparkles size={20} className="text-white" />
        </button>
```

- [ ] **Step 4: Update `AppLayout.tsx`**

Add the state, pass it to `TopBar`, and dock the panel in both branches:

```tsx
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { findNavItemByPath } from '@/app/nav-config'
import { Sidebar } from './Sidebar'
import { ExpandedSidebar } from './ExpandedSidebar'
import { TopBar } from './TopBar'
import { TopicSuggestionsPanel } from '@/features/ai-studio/TopicSuggestionsPanel'

export function AppLayout() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAiStudio, setShowAiStudio] = useState(false)
  const location = useLocation()

  const active = findNavItemByPath(location.pathname)
  const activeLabel = active?.label ?? 'Home'

  const aiStudioPanel = showAiStudio ? (
    <div className="mr-2 py-0">
      <TopicSuggestionsPanel onClose={() => setShowAiStudio(false)} />
    </div>
  ) : null

  return (
    <div className="flex flex-col h-screen min-w-[1024px] bg-app-backdrop">
      <TopBar onToggleAiStudio={() => setShowAiStudio((s) => !s)} isAiStudioOpen={showAiStudio} />
      {isExpanded ? (
        <div className="flex flex-1 min-h-0 ml-2 mb-2 mr-2 rounded-[26px] border border-white bg-white/60">
          <ExpandedSidebar activeLabel={activeLabel} onCollapse={() => setIsExpanded(false)} />
          <main className="flex-1 overflow-hidden rounded-[26px]">
            <Outlet />
          </main>
          {aiStudioPanel}
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 ml-2 mb-2 mr-2 rounded-[26px] border border-white bg-white/60">
          <Sidebar onToggleExpand={() => setIsExpanded(true)} />
          <main className="flex-1 overflow-hidden rounded-[26px]">
            <Outlet />
          </main>
          {aiStudioPanel}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/app/layout/AppLayout.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Full suite + typecheck**

Run: `npx vitest run --exclude '**/.claude/**'`
Expected: all pass (existing suite + new tests). The `--exclude` avoids the known worktree-crawl / duplicate-React artifact.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/layout/TopBar.tsx src/app/layout/AppLayout.tsx src/app/layout/AppLayout.test.tsx
git commit -m "feat(ai-studio): toggle topic suggestions panel from TopBar"
```

---

## Self-Review

**Spec coverage:**
- Global toggle from TopBar AI button → Task 6. ✅
- Right-docked panel, default closed → Task 6. ✅
- Shared shell extracted; Org panel refactored, tests green → Tasks 1–2. ✅
- 3 working wrapping carousel cards; card 1 verbatim → Tasks 3–5. ✅
- Greeting + subline copy → Task 5. ✅
- Presentational no-ops → shell + card. ✅
- Testing across shell, card, panel, layout, org → each task. ✅

**Type consistency:** `TopicSuggestion` defined in Task 3, consumed unchanged in Tasks 4–5. `AiStudioShell` signature (`testId?`, `onClose?`, `children`) consistent across Tasks 1, 2, 5. `TopBar` props consistent across Task 6. `TopicSuggestionsPanel({ onClose? })` consistent Tasks 5–6.

**Placeholder scan:** No TBD/TODO. All code blocks complete.
