# AI Studio Topic Suggestions Panel — Design Spec

**Date:** 2026-07-22
**Status:** Approved (design), pending implementation plan
**Reference:** Figma `LMPNsX1T3nwkueIRUCDktm` node `846:62113` (CX Journey_01, AI Studio panel)

## Goal

Wire the global TopBar "AI assistant" button to toggle a right-docked **AI Studio
suggestions panel** that presents topic-focused "quick win" cards — a greeting, a
3-card carousel (title + "What it is" bullets + CTA), and the standard composer.
Presentation-only; no backend.

## Context

- Today there is exactly one AI Studio surface: `src/features/organization/AiStudioPanel.tsx`,
  docked on the Organization screen, showing **onboarding steps** (Org Setup →
  Connect Knowledge → Channel Config → Build Agent) plus a composer. It is toggled
  by a local Sparkles button on that screen.
- The global `src/app/layout/TopBar.tsx` already has a gradient-sparkle **"AI
  assistant"** button (top-right) that is currently **inert**.
- The Figma frame shows the CX Journey → Topics screen with a right-docked AI
  Studio panel whose body is **suggestion cards**, not onboarding steps.

"Update the AI Studio suggestion for the Topics" means: bring an AI Studio panel
into the console (toggled by the TopBar AI button) whose body is these topic
"quick win" suggestion cards.

## Decisions (from brainstorming)

- **Activation:** the existing global TopBar AI-assistant button toggles the panel.
  Purely presentational.
- **Scope:** **global** — the panel is available on any screen (state lives in
  `AppLayout`), showing the Topics quick-wins content. Default **closed**.
- **Carousel:** **3 working cards.** Card 1 is verbatim from Figma; cards 2–3 are
  authored from existing topics in `topics-data.ts` as plausible illustrative mock
  copy. The ‹ N of 3 › pager actually flips between real cards (wrapping).
- **Shared shell:** **extract** the panel chrome (aside frame + header + composer)
  from the current `AiStudioPanel` into a reusable `AiStudioShell`. Both the
  Organization onboarding panel and the new Topics suggestions panel render through
  it. The Organization screen's behavior is unchanged; its tests stay green.

## Architecture

```
AppLayout (owns showAiStudio state; default false)
├── TopBar (AI button → onToggleAiStudio, aria-pressed=isAiStudioOpen)
├── Sidebar / ExpandedSidebar
├── <main><Outlet/></main>
└── {showAiStudio && <TopicSuggestionsPanel onClose={…} />}   ← docked right, in the flex row

AiStudioShell (reusable presentational chrome)
├── header: sparkle + "AI Studio" title, external-link btn, close btn (onClose)
├── body slot: {children}  (scrollable)
└── composer pill: + , input placeholder, gradient-sparkle send

TopicSuggestionsPanel  (renders through AiStudioShell)
├── greeting: "Hello, Sunny 👋 / Here's 3 quick wins you can knock out today."
├── subline: "Each is a quick action with real dollars behind it."
└── SuggestionCard carousel (local index 0–2, wrapping)

AiStudioPanel (Organization) — refactored to render its STEPS through AiStudioShell
```

## Files

**New — `src/features/ai-studio/`**

- `AiStudioShell.tsx` — reusable shell. Props: `{ onClose?: () => void; children: ReactNode }`.
  Contains the `<aside>` frame (`w-[380px]`, rounded, white), the header (gradient
  sparkle + "AI Studio" title, external-link button, close button wired to
  `onClose`), a scrollable body rendering `children`, and the composer pill
  (presentational). Chrome extracted verbatim from the current `AiStudioPanel`.
- `TopicSuggestionsPanel.tsx` — Props: `{ onClose?: () => void }`. Renders greeting
  + subline + `SuggestionCard` carousel inside `AiStudioShell`. Owns `index` state.
  Root carries `data-testid="ai-studio-topics-panel"`.
- `SuggestionCard.tsx` — Props: `{ suggestion: TopicSuggestion; index: number;
  total: number; onPrev: () => void; onNext: () => void }`. Renders sparkle + pager
  row (‹ N of total ›), title, "What it is:" bullet list, full-width CTA button
  (no-op).
- `suggestions-data.ts` — exports `TopicSuggestion` type and
  `TOPIC_SUGGESTIONS: TopicSuggestion[]` (3 records).

**Modified**

- `src/features/organization/AiStudioPanel.tsx` — render `STEPS` body through
  `AiStudioShell` (drop duplicated chrome). Keep `onClose` prop. Keep
  `data-testid="ai-studio-panel"` on the shell for this instance.
- `src/app/layout/AppLayout.tsx` — add `const [showAiStudio, setShowAiStudio] =
  useState(false)`; pass `onToggleAiStudio` + `isAiStudioOpen` to `TopBar`; render
  `<TopicSuggestionsPanel onClose={() => setShowAiStudio(false)} />` in the flex row
  when open (both expanded and collapsed sidebar branches).
- `src/app/layout/TopBar.tsx` — accept `{ onToggleAiStudio?: () => void;
  isAiStudioOpen?: boolean }`; the AI-assistant button gets `onClick` and
  `aria-pressed`.

## Data model

```ts
export type TopicSuggestion = {
  id: string
  title: string
  bullets: string[]
  cta: string
}
```

Three records:

1. **`id: 'create-new-ticket-leak'`** — verbatim from Figma
   - title: `Fix "Create New Ticket" leak`
   - bullets: `3,653 unresolved conversations` · `only 7% resolutions` ·
     `~$54,795 in recoverable savings` · `CSAT at 3.91 (your lowest of the high-volume topics)`
   - cta: `Show me the tickets`
2. **`id: 'billing-deflection'`** — from the Billing topic (largest in treemap, 1,567 tickets)
   - title: `Deflect Billing questions`
   - bullets: illustrative (volume, self-serve %, recoverable savings, CSAT), internally consistent
   - cta: `Draft a macro`
3. **`id: 'account-coaching'`** — from the Account management topic
   - title: `Coach on Account management`
   - bullets: illustrative
   - cta: `Review conversations`

Cards 2–3 use clearly illustrative mock figures (no real backend). Exact numbers
fixed in the implementation plan.

## Behavior

- **Toggle:** TopBar AI button toggles `showAiStudio`. When open, `aria-pressed=true`
  and the panel is docked right of `<main>`. Panel close button (from the shell)
  sets `showAiStudio=false`.
- **Carousel:** `index` state (0-based). Prev/next step and **wrap** (0→2, 2→0).
  Pager shows `${index + 1} of ${total}`. Title + bullets + CTA swap with `index`.
- **Presentational:** composer input, `+`, send, external-link, and each card CTA
  are no-ops (consistent with the rest of this mock console).

## Testing (Vitest + RTL, jsdom)

- `AiStudioShell` — renders children; close button fires `onClose`.
- `TopicSuggestionsPanel` — shows greeting + first card title; clicking next
  advances pager to "2 of 3" and swaps the title; wraps 3→1.
- `SuggestionCard` — renders title, all bullets, CTA, and pager text.
- `AppLayout` / `TopBar` — AI button toggles the panel (`ai-studio-topics-panel`
  appears/disappears; `aria-pressed` flips).
- Organization panel — existing `OrganizationScreen.test.tsx` still passes after the
  shell refactor (`ai-studio-panel` testid preserved).

## Out of scope

- Any real suggestion logic, backend, or ticket navigation.
- Changing the Organization screen's toggle UX or onboarding step content.
- Per-screen contextual suggestion content (panel shows the same Topics content
  everywhere it's opened, per the global-scope decision).

## Conventions

- Path alias `@` → `src/`; semantic Tailwind tokens (`text-ink`, `text-ink-muted`,
  `border-surface-border`, `bg-white`); reuse the shell's existing hex values for
  chrome fidelity where no token exists (matching current `AiStudioPanel`).
- TypeScript strict; determinism (no `Date.now()`/`Math.random()`).
- Tests via `npx vitest run`; typecheck via `npx tsc --noEmit` (pnpm not on PATH;
  lint broken by TS7 toolchain gap — do not rely on it).
