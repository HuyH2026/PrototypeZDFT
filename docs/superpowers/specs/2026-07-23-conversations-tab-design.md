# AI Performance — Conversations tab — design

**Date:** 2026-07-23
**Area:** Insights → AI Performance
**Figma:** [Conversations tab `215-8805`](https://www.figma.com/design/UUy67blU4SHOkM8EIlclSa/Hackathon-2026?node-id=215-8805)

## Goal

Fill in the **Conversations** page tab on the AI Performance screen
(`src/features/insights/AiPerformancesView.tsx`). Today only the **Overview**
page tab is built; `Conversations`, `Knowledge`, and `Intents` fall through to a
shared "Coming soon" body. This adds a full, interactive mock for
**Conversations**, following the sibling views' conventions (a self-contained
sub-feature folder, typed mock data, recharts charts, semantic tokens, local
`useState`). Frontend-only, no backend.

The Conversations tab is an operational drill-down: a grid of summary cards over
a scrollable table of individual conversations. It is **channel-scoped** — a tab
group (Widget / Voice / Web Call / Headless) switches both the card set and the
table columns. The reference frame `215-8805` shows the **Headless** channel,
whose cards and columns are A2A-specific (Agent-to-Agent protocol): conversation
source split across human / A2A / MCP callers, the top A2A solve agents and
calling clients, and per-row calling-client / detected-agent metadata.

## Scope

**In scope**
- A new `ConversationsView` rendered from `AiPerformancesView` when the page tab
  is `Conversations` (replacing that tab's "Coming soon" fallback).
- A **channel tab group** (Widget / Voice / Web Call / Headless) with Headless as
  the initial selection (matching the reference frame). Switching channels swaps
  the card set and the table.
- A **card grid** with three card archetypes:
  - **Stacked-bar card** — headline number, two-segment horizontal bar, 2-row
    legend (label + count + %). Used by Total conversations and Deflections.
  - **Donut card** — recharts donut (same pattern as `CustomInsights`'
    `DonutCard`) with a left-column legend (count + label per slice) and a
    centered value / caption. Used by Resolutions, Conversation source,
    Sentiment, Relevance, Engagement.
  - **Ranked-bar card** — "Total responses" figure + horizontal bars ranked by
    value with trailing counts. Headless-only: Top A2A solve agents, Top A2A
    calling clients.
- A **"Collapse cards"** toggle in the header that hides the whole card grid,
  leaving the table.
- A **conversation table**: toolbar (search box, date pill, "All filters",
  "Gaps only" checkbox, download / list / columns icon buttons) + rows. Columns
  are channel-dependent (see below).
- Interactivity: channel switching, "Collapse cards" toggle, and "Gaps only"
  row filter are client-side `useState`. Charts are real recharts.

**Out of scope**
- `Knowledge` and `Intents` page tabs — still render the existing "Coming soon"
  fallback.
- Real backend / network / persistence. All state is local to `ConversationsView`.
- Functional search, date picker, "All filters", download/columns buttons —
  decorative, matching the sibling views' interactivity bar.

## Per-channel content

Your decision: **shared cards, swap the A2A slots.** All four channels share six
generic cards and the table; the three A2A-specific slots and the A2A table
columns are Headless-only, and the other channels fill those slots with
channel-appropriate cards.

**Shared across all channels (6 cards):**
1. Total conversations (stacked-bar: Automated / Non automated)
2. Deflections (stacked-bar: deflected / not deflected)
3. Resolutions (donut: verified / contained)
4. Sentiment (donut: positive / neutral / negative)
5. Relevance (donut: relevant / somewhat relevant / irrelevant)
6. Engagement (donut: yes / no)

**Headless-only (3 cards, in grid slots 4–6 of a 3×3):**
- Conversation source (donut: human / agent (A2A) / MCP)
- Top A2A solve agents (ranked-bar)
- Top A2A calling clients (ranked-bar)

**Widget / Voice / Web Call (3 cards filling the same slots):**
- CSAT (donut)
- Top intents (ranked-bar)
- Avg. response time (stacked-bar or donut — channel-appropriate)

The card set for a channel is defined as data (a `channelCards` list per
channel), so the grid renders whatever the selected channel provides — no
per-channel branching in the component.

## Table columns (channel-dependent)

**Headless** (from the frame):
`Timestamp | Automated | Source | Calling client | Detected agents | Conversations`
- **Source** — a colored chip: Human (amber), A2A (pink), MCP (teal), each with
  a small leading icon.
- **Detected agents** — a status chip (e.g. "Fallback + 2", "Booking",
  "Knowledge") with a leading dot.
- **Conversations** — a 3-line-clamped transcript preview; the header reads
  "Conversations (10,000)".

**Widget / Voice / Web Call**: drop the A2A-only **Source** and **Calling client**
columns; keep `Timestamp | Automated | Detected agents | Conversations`. Column
sets are defined per channel in data.

## Layout

Under the existing sticky AiPerformances page header (title + page tabs), the
Conversations body is:

- **Header block** — `Conversations` heading + muted date-range text, a channel
  tab group (pill row), and a right-aligned "Collapse cards" chevron toggle.
- **Card grid** — `grid grid-cols-1 lg:grid-cols-3 gap-6`, one entry per card in
  the selected channel's card list. Hidden when "Collapse cards" is toggled off.
- **Table** — full-width card (`rounded-2xl border`), toolbar row, then the rows.

## Components & files

New sub-feature folder `src/features/insights/ai-performances/conversations/`:

- `ConversationsView.tsx` — owns state (`channel`, `cardsCollapsed`,
  `gapsOnly`); renders the header, the card grid (maps the channel's card list to
  the right archetype), and the table. Exported and rendered from
  `AiPerformancesView` for the `Conversations` tab.
- `ConversationCards.tsx` — the three card archetypes (`StackedBarCard`,
  `DonutCard`, `RankedBarCard`) + a `CardShell`. `DonutCard` follows the measured
  recharts pattern already used in `CustomInsights` (ResizeObserver → real size,
  guarded render).
- `ConversationTable.tsx` — the toolbar + table; takes the channel's column set
  and rows, applies the `gapsOnly` filter. `SourceChip` / `AgentChip` helpers.
- `conversations-data.ts` — mock data + types:
  - `ChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'` and a
    `CONV_CHANNEL_TABS` label/color list (reuse the config tab's channel colors
    where they match).
  - Card types: `StackedBarCard`, `DonutCardData`, `RankedBarCard`, unioned as
    `ConvCard` (a discriminated union on a `kind` field).
  - `ConvRow` (timestamp, automated, source, callingClient, detectedAgents,
    transcript lines, `hasGap` flag for the "Gaps only" filter) and a
    `ConvColumn` list per channel.
  - `CHANNELS: Record<ChannelKey, { cards: ConvCard[]; columns: ConvColumn[]; rows: ConvRow[] }>`.
  - Reuse `C1`–`C8`, `INK`, `GREY` from `../ai-performances-data` for the chart
    palette rather than redefining.

Modify `AiPerformancesView.tsx`: replace the `Conversations`-tab branch of the
`tab === 'Overview' ? … : 'Coming soon'` logic with a small switch so
`Conversations` renders `<ConversationsView />` and `Knowledge` / `Intents` keep
the "Coming soon" body.

## Interactivity

- **Channel tabs** — `useState<ChannelKey>('headless')`; selecting a tab swaps
  `CHANNELS[channel]`.
- **Collapse cards** — `useState(false)`; hides the card grid, chevron flips.
- **Gaps only** — `useState(false)`; when on, the table shows only rows with
  `hasGap === true`.

## Tokens & styling

Reuse the existing chart palette (`C1`–`C8`) and semantic tokens (`text-ink`,
`text-ink-muted`, `border-surface-border`, `bg-white`, `bg-nav-active`). Keep
genuine one-off hexes inline where they match Figma, consistent with the
neighboring AI Performances files (e.g. `#01567A`, the chip tints). Do not add
arbitrary `font-['…']` classes.

## Testing

Mirror the existing AI Performances tests (`AiPerformancesView.test.tsx`,
`ConversationComparison` patterns):

- `ConversationsView.test.tsx`:
  - Renders the Headless card titles (Total conversations, Deflections,
    Resolutions, Conversation source, Top A2A solve agents, Top A2A calling
    clients, Sentiment, Relevance, Engagement) and the table.
  - Switching to a non-Headless channel (e.g. Widget) removes the A2A card
    titles and shows the channel's substitute cards.
  - "Collapse cards" toggle hides the card grid (cards no longer in the DOM).
  - "Gaps only" checkbox reduces the visible table rows to gap rows.
- `conversations-data.test.ts`:
  - Every `ChannelKey` has an entry in `CHANNELS` with a non-empty `cards`,
    `columns`, and `rows`.
  - Headless includes the three A2A card kinds; Widget/Voice/Web Call do not
    include an A2A `Source` column.

**Gates:** `pnpm typecheck`, `pnpm test`, `pnpm build`. (`pnpm lint` is
known-broken on TS7 — see CLAUDE.md.) Run tests with
`--exclude '**/.claude/**'` to avoid the sibling-worktree crawl.
