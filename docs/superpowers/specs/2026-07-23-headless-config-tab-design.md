# Headless configuration tab — design

**Date:** 2026-07-23
**Area:** AI Agents → Configuration
**Figma:** [Headless tab `225-6282`](https://www.figma.com/design/UUy67blU4SHOkM8EIlclSa/Hackathon-2026?node-id=225-6282), [instruction content `145-75243`](https://www.figma.com/design/UUy67blU4SHOkM8EIlclSa/Hackathon-2026?node-id=145-75243)

## Goal

Build the **Headless** channel tab on the Configuration screen (`src/features/ai-agents/configuration/`). Today only the **Widget** tab is built; Voice / Web Call / Headless fall through to a shared "Coming soon" body. This adds a full, interactive mock for Headless, following the Widget tab's conventions (separate components, typed mock data in `config-data.ts`, local state, semantic tokens). Frontend-only, no backend.

The Headless tab lets a customer run their Solve agent headlessly: with a direct **API key**, and/or by layering on the **A2A (Agent to Agent) protocol** so other agents can discover and call it. Both modes share the same key; A2A adds a public agent card and a message endpoint.

## Scope

**In scope**
- New `activeTab === 'headless'` branch in `ConfigurationView.tsx`, rendering a new `HeadlessView`.
- Left **instruction panel**: A2A intro (gradient teal intro copy, two robot glyphs + arrows-diff icon, "A2A (Agent to Agent)" heading + description) and **4 numbered steps**, each with a copyable dark code block. Content per frame `145-75243`.
- Right **config card**: **API key** section (masked key, eye reveal/mask toggle, copy, "Refresh API key") and **A2A connection** section (Agent Card URL + Message endpoint fields, each copyable). Slim right rail with Headless / Knowledge / Personality icons — only Headless active; the others are decorative (deferred), matching the Widget rail's deferred-section pattern.
- Interactive mock: copy-to-clipboard with transient "Copied" feedback, eye toggle, deterministic key refresh.

**Out of scope**
- Voice and Web Call tabs — still render the existing "Coming soon" fallback.
- Any real backend / network / persistence. State is local to `HeadlessView`.
- Knowledge / Personality rail panels (decorative only, like the Widget rail's deferred sections).

## Layout

Under the existing sticky top strip (title + channel tabs + Preview/Publish), the Headless body is a two-column region:

- **Left — `HeadlessInstructions`**: scrollable instructional panel on the beige app surface. Intro block → "A2A (Agent to Agent)" heading + description → 4 numbered steps. Each step: a blue step number (IBM Plex Sans) + mono title (IBM Plex Mono), a support-text description, and a dark (`#0d212d`) code block with a copy button.
- **Right — `HeadlessConfigPanel`**: a white elevated card (~480px wide) with two sections separated by a divider — **API key** and **A2A connection** — plus a slim ~80px icon rail on its right edge (Headless active; Knowledge, Personality decorative).

Refactor the current `activeTab === 'widget' ? <widget body> : <coming-soon>` ternary in `ConfigurationView.tsx` into a small branch so `headless` renders `HeadlessView` and `voice`/`webcall` keep the "Coming soon" body.

## The 4 steps (from `145-75243`)

1. **Add Forethought as an A2A agent** — "In your A2A client, register a new agent using your Agent Card URL. The client reads the card and discovers the skill, endpoint, and auth automatically, no manual config." Code: `# Agent Card URL` + the agent-card.json URL.
2. **Authenticate with your API key** — "Send your A2A API key as a Bearer token on every request." Code: `Authorization: Bearer ft_a2a_live_…`.
3. **Pass the end-user's identity** — "Include the customer's signed token so Solve treats the conversation as authenticated and can act on their account." Code: `Authorization: Bearer ft_a2a_live_…` (per Figma).
4. **Send a message** — "POST a JSON-RPC message/send to your message endpoint. Forethought replies with a task and the agent's answer; reuse the returned task id for follow-up turns." Code: the multi-line JSON-RPC `message/send` body.

## Components & files

- `configuration/HeadlessView.tsx` — owns local state (masked vs revealed key, current key value, active rail section); lays out the two columns. Rendered from `ConfigurationView` when `activeTab === 'headless'`.
- `configuration/HeadlessInstructions.tsx` — left panel; renders intro + `HEADLESS_STEPS` (map).
- `configuration/HeadlessConfigPanel.tsx` — right card (API key + A2A connection) + slim rail.
- `configuration/CopyField.tsx` — reusable field with a copy button + transient "Copied" state. Two visual variants used across the tab: a **dark code block** (steps + intro-side) and a **bordered light field** (A2A endpoints inside the card). One clipboard helper, one component.
- `config-data.ts` additions:
  - `HEADLESS_STEPS: HeadlessStep[]` where `HeadlessStep = { n: string; title: string; body: string; code: string; codeCaption?: string }`.
  - Seed constants: initial masked API key display, the real mock key value, `A2A_AGENT_CARD_URL`, `A2A_MESSAGE_ENDPOINT`, and the copy strings shown in the card (Agent Card / Message endpoint labels + captions).
  - `nextApiKey()` — deterministic mock-key generator from a module `seq` counter (matches the repo's `Date.now()`/`Math.random()`-free convention, per `org-context`'s `seq`). Returns e.g. `ft_a2a_live_<hex-ish deterministic suffix>`.

## Interactivity

- **Copy** — `navigator.clipboard?.writeText(...)`, guarded so it degrades gracefully in jsdom. On success the button shows a check / "Copied" for ~1.5s via `setTimeout`, then reverts. Timer cleared on unmount.
- **Eye toggle** — swaps the displayed API key between a masked string (`••••••••••••`) and the real mock value held in state.
- **Refresh API key** — replaces the key in state with `nextApiKey()`; resets to masked. Deterministic, no randomness.

## Icons & assets

- **Download & commit** the exact SVGs for the two robot glyphs and the arrows-diff icon from Figma into `src/assets/headless/` and import via `@/assets/headless/…` (matches the `org-logos` asset convention).
- The **API-app**, **eye**, **copy**, **id**, and **message-plus** glyphs map to existing Garden (`garden-icon.tsx`) or Lucide icons where the glyph clearly matches; extend `garden-icon.tsx` if a needed Garden glyph isn't yet registered. Do not hand-author SVG paths.

## Tokens & styling

Use existing semantic token classes and the exposed Garden palette where a hex maps to a token; keep genuine one-offs inline (consistent with the Widget tab). Relevant values from the design: teal `#01567a`/`#193d50`/`#ebf5f7`, dark code surface `#0d212d`, slate `#7b91b1`/`#e4e7f0`/`#44c2ee`, grey `#545767`/`#9194a0`, beige `#f9f8f7`/`#fbfbfb`. Fonts: Plus Jakarta Sans (headings/body), IBM Plex Sans (step numbers), IBM Plex Mono (code + step titles). Follow the repo rule against reintroducing arbitrary `font-['…']` classes where the system font stack applies — code blocks legitimately use a mono family; confirm the mono font is available or fall back to the CSS mono stack.

## Testing

Mirror the existing config tests (`ConfigurationView.test.tsx`, `WidgetPreview.test.tsx`):

- `HeadlessView.test.tsx`:
  - Selecting the Headless tab renders the 4 step titles, the API key section, and both A2A endpoints.
  - Copy invokes a mocked `navigator.clipboard.writeText` with the expected string and shows "Copied".
  - Eye toggle reveals then re-masks the key.
  - Refresh changes the displayed key value.
- `config-data.test.ts` addition: assert `HEADLESS_STEPS` has 4 entries with the expected titles, and that `nextApiKey()` returns distinct deterministic values on successive calls.

**Gates:** `pnpm typecheck`, `pnpm test`, `pnpm build`. (`pnpm lint` is known-broken on TS7 — see CLAUDE.md.)
