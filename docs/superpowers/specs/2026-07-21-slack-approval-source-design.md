# Slack-sourced approval — embedded message

**Date:** 2026-07-21
**Scope:** Home dashboard, "Needs your approval" widget

## Goal

The "Sunny created a self-improving plan" approval on the Home dashboard should read
as though it originated from a Slack message. Render the original Slack message as a
quoted block inside that approval card, so it looks like it was forwarded from Slack.

This is a mock-data + presentational change only. No backend, no Slack integration.

## Data model (`src/features/home/dashboard-data.ts`)

Add an optional `slack` field to the approval item type, following the existing
optional-discriminator pattern (`person?`, `abTest?`):

```ts
approvals: {
  id: string
  title: string
  body: string
  impact: string
  author: string
  person?: { name: string; role: string }
  abTest?: { ... }  // unchanged
  // Present when the approval originated from a Slack message; renders the
  // original message as an embedded, forwarded-from-Slack quote block.
  slack?: {
    channel: string   // e.g. "#support-ai"
    author: string    // "Sunny Kong"
    role?: string      // "Support Lead"
    time: string       // "10:24 AM"
    message: string    // the quoted message text
  }
}[]
```

Populate `slack` on the existing `a2` approval (the Sunny item). `Level` is a single
value (`'platform'`), so there is exactly one approval to update. Keep the existing
`person` and `impact` fields on `a2` (they are still valid metadata); rendering
decides what to show.

Message content (mock): channel `#support-ai`, author `Sunny Kong`, role
`Support Lead`, time `10:24 AM`, message drawn from the plan intent, e.g.
_"Can we add a few macros and reroute refund intents to the billing skill? Resolution
keeps stalling there."_

## Rendering (`src/features/home/HomeScreen.tsx`, `ApprovalsCard`)

When `a.slack` is present, render a quoted block between the `body` paragraph and the
impact/actions section (in the same slot the `abTest` block occupies — an approval
won't have both):

- Container: neutral bordered card matching the existing `abTest` block
  (`bg-white`, `borderColor: BORDER`, rounded, small padding) — NOT Slack-brand
  background. Consistency with the design system first.
- Header row: a small Slack glyph + `via Slack {channel}` in muted 11px text.
- Message row: a small circular avatar (author initials, Slack aubergine `#611f69`
  accent), author name (12px semibold ink), timestamp (11px muted).
- Message text: 12px, `INK_SOFT`, slightly indented under the author.

Suppress the redundant `person` attribution footer (`Sunny Kong · Support Lead`) when
`slack` is present — that identity is already shown inside the Slack block. The impact
chip (`+4% resolution`) still renders. Approve/Review/Dismiss buttons unchanged.

## Slack glyph

`lucide-react` has no Slack logo. Add a small inline SVG Slack mark as a local
component in `HomeScreen.tsx` (the codebase already uses inline SVGs — `nav-icons.tsx`,
`ZendeskLogo.tsx`). Monochrome aubergine (`#611f69`) at ~13–14px to match the
`FlaskConical` glyph used in the `abTest` block. No new dependency.

## Tests (`src/features/home/HomeScreen.test.tsx`)

Extend the existing "attributes a self-improving plan approval to a named co-worker"
test (or add a sibling test) to assert the Slack block renders: the channel
(`#support-ai`) and the quoted message text are present in the document.

## Out of scope

- Real Slack integration / OAuth / message fetching.
- Slack source treatment on any other approval or widget.
- Multi-level data (there is only `platform`).
