# CX Journey → Automation → Agent-gaps detail panel

**Date:** 2026-07-22
**Status:** Approved (brainstorm) — ready for implementation plan
**Figma:** file `LMPNsX1T3nwkueIRUCDktm` — Create Agent `727-94801`, Generate Policy `816-26321`, Ticket Sources `816-26139`, in-context `778-56431`

## Goal

When a user clicks a row in the **Agent gaps** table (CX Journey → Automation), a right-side slide-over panel ("Generated Agent") opens over a dark scrim. Inside, a secondary-tab bar toggles between **Create Agent**, **Generate Policy**, and **Ticket Sources**. All three tabs are fully designed in Figma and built here.

Frontend-only with **functional local state** — tab switching, checkbox toggles, the ticket pager, and collapsible sections all work; primary action buttons and the assign-dropdown are presentational no-ops, consistent with the repo's no-backend scope.

## Scope

- **In:** the slide-over container, all three tab bodies, per-topic mock data for the 3 existing Agent-gaps rows, row-click-to-open wiring, and tests.
- **Out:** any backend/agent creation, real ticket data, the AI Studio composer, and changes to the other Automation sub-tabs (Knowledge gaps / Realized impact stay "Coming soon").

## Component structure

All new files live under `src/features/insights/cx-journey/`.

- **`GeneratedAgentPanel.tsx`** — slide-over container. `fixed inset-0 z-50 flex justify-end`, scrim (`bg-black/40`) that closes on click, panel `role="dialog"` ~628px wide, full-height, rounded, white. Owns `activeTab` state and per-tab selection state. Closes on X button, scrim click, and Escape. Renders shared header + tab bar + body switch + sticky footer. Follows the existing `CreateAgentPanel` slide-over pattern (scrim + right panel + close affordances), widened to match this design.
  - **Header:** "Generated Agent" title, a topic chip (⚡ bolt + topic label, e.g. "Reactivate account") reflecting the clicked row, and a circular regenerate/avatar icon.
  - **Tab bar:** three secondary tabs; active tab has a teal (`#01567a`) bottom border and darker label, inactive tabs are grey (`#9194a0`). `role="tablist"` / `role="tab"` with `aria-selected`.
  - **Sticky footer:** black "Create with AutoFlow (recommended)" button, an "Assign this topic to an existing {Agent|Policy}" dropdown, and a disabled "{Create|Create new Policy}" button. Labels vary by active tab (see Footer variants). Presentational.
- **`CreateAgentTab.tsx`** — Summary gradient card (intro paragraph, "Autoflow Summary" text, 3 slate stats), the "Add more training phrases from the Topics below" checkbox table, and the italic-blue key-phrases box.
- **`GeneratePolicyTab.tsx`** — a collapsible "Generated Actions (in Tools):" list of tool cards (blue bolt icon, tool name, API badge, description, Input/Output rows in mono font) and a "Generated Autoflow policy" text card (title + multi-paragraph body).
- **`TicketSourcesTab.tsx`** — ticket header (underlined "Ticket ID: N" + external-link icon, date, channel chip), a status tag ("Closed") with a "1 of 10" prev/next pager, a 6-cell metrics grid (first contact resolution, first/full resolution time, sentiment, average reply time, agent replies), and a "Ticket details" scroll area with "Customer request" and "Agent response" blocks (subject, body, timestamps).

Each tab is its own file so `GeneratedAgentPanel` stays a thin coordinator (state + layout), matching the repo's small-focused-file convention.

## Data model

Extend `automation-data.ts` with a per-topic detail, keyed to each existing `AUTOMATION_ROWS` topic. Add an `AUTOMATION_DETAILS: Record<string, GeneratedAgentDetail>` map (keyed by `row.topic`) rather than bloating `AutomationRow`, so the table data stays lean:

```ts
export type TrainingPhraseRow = { topic: string; coverage: string; savings: string }

export type GeneratedTool = {
  name: string        // e.g. 'check_account_status'
  kind: string        // badge label, e.g. 'API'
  description: string
  input: string
  output: string
}

export type GeneratedPolicy = { title: string; body: string }   // body may contain \n paragraphs

export type TicketSource = {
  id: string                       // 'Ticket ID: 1274' → '1274'
  status: string                   // 'Closed'
  channel: string                  // 'Email' → channelMeta() drives the chip
  dateCreated: string
  metrics: { label: string; value: string }[]   // 6 cells; sentiment cell may render an emoji glyph
  subject: string
  customerRequest: { body: string; timestamp: string }
  agentResponse: { body: string; timestamp: string }
}

export type GeneratedAgentDetail = {
  channel: string
  summary: string
  autoflowSummary: string
  stats: { value: string; label: string }[]     // 3 slate stats
  trainingPhraseRows: TrainingPhraseRow[]
  keyPhrases: string[]
  tools: GeneratedTool[]
  policy: GeneratedPolicy
  tickets: TicketSource[]
}
```

- **Row 1 ("Reactivate account")** uses the exact Figma content: stats 3,144 / 5,588 / $83,820; training-phrase rows (Refund not received · 4538 tix · $24,780, Dispute on refund · 2345 tix · $10,370, Wants refund on one year… · 2100 tix · $8,230); key phrases ("I want my money back", etc.); tools `check_account_status` + `update_activation_status`; the Notion-style Autoflow policy; and one sample ticket (ID 1274, Email, Closed, the refund thread).
- **Rows 2 & 3** ("Account Lock Issues", "Account Linking and Updating") get plausible per-topic variants in the same shape.
- The sentiment metric renders a small emoji/glyph; keep it as text/emoji rather than importing the Figma raster asset (assets expire in ~7 days and this is mock data).

## Interactions (functional local state)

- **Open:** whole-row click in `AutomationView`'s `PolicyTable` opens the panel for that row. Rows get `cursor-pointer` + hover affordance, `role="button"`, `tabIndex=0`, and Enter/Space activation. The panel's header chip reflects the clicked topic; the body reads `AUTOMATION_DETAILS[topic]`.
- **Tabs:** clicking a tab swaps the body and updates the active underline.
- **Create Agent:** training-phrase checkboxes toggle in local state. The footer **Create** button is disabled by default and enables once ≥1 row is checked (matches the design's disabled default).
- **Generate Policy:** the "Generated Actions" section collapses/expands via the chevron button.
- **Ticket Sources:** the "1 of N" pager cycles through `tickets` with prev/next, wrapping at the ends. Disabled/no-op if a topic has a single ticket.
- **Footer buttons** and the **assign dropdown** are presentational no-ops.
- **Close:** X button, scrim click, and Escape all close the panel.

## Footer variants

Footer content is driven off the active tab:

| Tab | Dropdown placeholder | Trailing button |
|-----|----------------------|-----------------|
| Create Agent | "Assign this topic to an existing Agent" | "Create" |
| Generate Policy | "Assign this topic to an existing Policy" | "Create new Policy" |
| Ticket Sources | "Assign this topic to an existing Policy" | "Create new Policy" |

The black "Create with AutoFlow (recommended)" primary button is constant across tabs.

## Styling & tokens

- Reuse existing semantic tokens/classes where they map (`text-ink`, `text-ink-muted`, `border-surface-border`, `bg-app-backdrop`). The panel uses several one-off design values with no token (slate `#385075`, blue `#3489db`, the Insights gradient `rgba(255,179,147,.15)→rgba(171,213,250,.15)→rgba(18,166,180,.15)`, chip fills like `#eaf4fe`/`#fceae7`/`#e6f4f2`) — inline these, consistent with how the existing Automation `StatsBanner` inlines its gradient.
- Do **not** reintroduce `font-['SF_Pro_*']` arbitrary font-family classes (the project deliberately removed them; the system SF stack is the default `--font-sans`).
- Icons: `lucide-react` for chrome/glyphs (Zap for the bolt chip, ChevronUp/Down, ChevronLeft/Right pager, ExternalLink, Mail via `channelMeta`), matching the dashboard/chip convention. No Figma raster assets are committed.

## Testing (Vitest + RTL, jsdom)

- **`automation-data.test.ts`** (extend): every `AUTOMATION_ROWS` topic has an entry in `AUTOMATION_DETAILS`; each detail has 3 stats, ≥1 tool, ≥1 ticket, and non-empty key phrases.
- **`GeneratedAgentPanel.test.tsx`** (new): renders with a given topic; header chip shows that topic; tab switching swaps content (e.g. "Generated Autoflow policy" appears under Generate Policy, "Ticket details" under Ticket Sources); toggling a training-phrase checkbox enables the Create button; the pager advances the visible ticket; Escape / scrim click / X each call `onClose`.
- **`AutomationView.test.tsx`** (extend): clicking an Agent-gaps row opens the panel (assert the "Generated Agent" dialog appears); scope assertions with `within(getByTestId('view-automation'))`.

## Verification gates

`pnpm typecheck`, `pnpm test`, `pnpm build` (npx equivalents if pnpm is unavailable). Lint is a known-broken upstream gate (TS7) and is not run.
