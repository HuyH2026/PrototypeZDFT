# Headless configuration tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive Headless channel tab on the AI Agents → Configuration screen (A2A instructions + API-key / A2A-connection config card).

**Architecture:** A new `HeadlessView` renders when `activeTab === 'headless'` in `ConfigurationView.tsx`, replacing the "Coming soon" fallback for that tab only. `HeadlessView` owns local state (masked/revealed key, current key, active rail section) and lays out two columns: `HeadlessInstructions` (left, A2A intro + 4 numbered steps with copyable code blocks) and `HeadlessConfigPanel` (right, API key + A2A connection card + slim rail). A shared `CopyField` component provides copy-to-clipboard with transient "Copied" feedback. All data is typed & mocked in `config-data.ts`.

**Tech Stack:** React + Vite + TypeScript, Tailwind v4, Vitest + React Testing Library, `lucide-react` icons, downloaded Figma SVG assets.

## Global Constraints

- **No backend.** All state local to `HeadlessView`; data mocked in `config-data.ts`.
- **No `Date.now()` / `Math.random()`** for id/key generation — use a module `seq` counter (per `src/app/org-context.tsx:18`).
- **TypeScript strict**; keep new code fully typed. Path alias `@` → `src/`.
- **Guard browser APIs**: `navigator.clipboard?.writeText(...)` so tests/jsdom degrade gracefully.
- **Tokens:** prefer semantic token / exposed-palette classes; genuine one-off hexes inline (consistent with the Widget tab). Do not reintroduce arbitrary `font-['SF_Pro_*']` classes; code blocks use `font-mono`.
- **Gates:** `pnpm typecheck`, `pnpm test`, `pnpm build`. (`pnpm lint` is known-broken on TS7 — do not rely on it.)
- **Voice / Web Call tabs stay "Coming soon"** — only `headless` gets the new view.
- Run tests scoped to avoid sibling-worktree crawl: `npx vitest run src/features/ai-agents/configuration --exclude '**/.claude/**'`.

---

### Task 1: Headless mock data in config-data.ts

**Files:**
- Modify: `src/features/ai-agents/configuration/config-data.ts`
- Test: `src/features/ai-agents/configuration/config-data.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `type HeadlessStep = { n: string; title: string; body: string; code: string; codeCaption?: string }`
  - `const HEADLESS_STEPS: HeadlessStep[]` (4 entries)
  - `const A2A_AGENT_CARD_URL: string`, `const A2A_MESSAGE_ENDPOINT: string`
  - `const HEADLESS_INTRO: string`, `const A2A_HEADING: string`, `const A2A_DESCRIPTION: string`
  - `const API_KEY_MASK: string` (the masked display string)
  - `function seedApiKey(): string` and `function nextApiKey(): string` — deterministic mock keys.

- [ ] **Step 1: Write the failing test**

Add to `src/features/ai-agents/configuration/config-data.test.ts` (extend the existing import from `./config-data`):

```ts
import {
  HEADLESS_STEPS, A2A_AGENT_CARD_URL, A2A_MESSAGE_ENDPOINT, nextApiKey, seedApiKey,
} from './config-data'

describe('config-data — headless', () => {
  it('has four headless steps with the expected titles in order', () => {
    expect(HEADLESS_STEPS.map((s) => s.title)).toEqual([
      'Add Forethought as an A2A agent',
      'Authenticate with your API key',
      "Pass the end-user's identity",
      'Send a message',
    ])
    expect(HEADLESS_STEPS.map((s) => s.n)).toEqual(['01', '02', '03', '04'])
    expect(HEADLESS_STEPS.every((s) => s.code.length > 0 && s.body.length > 0)).toBe(true)
  })

  it('exposes the A2A endpoint URLs', () => {
    expect(A2A_AGENT_CARD_URL).toMatch(/agent-card\.json$/)
    expect(A2A_MESSAGE_ENDPOINT).toMatch(/\/v1\/message$/)
  })

  it('nextApiKey returns distinct ft_a2a_live_ keys on successive calls', () => {
    const a = nextApiKey()
    const b = nextApiKey()
    expect(a).toMatch(/^ft_a2a_live_/)
    expect(b).toMatch(/^ft_a2a_live_/)
    expect(a).not.toBe(b)
  })

  it('seedApiKey is a stable ft_a2a_live_ key', () => {
    expect(seedApiKey()).toBe(seedApiKey())
    expect(seedApiKey()).toMatch(/^ft_a2a_live_/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/configuration/config-data.test.ts --exclude '**/.claude/**'`
Expected: FAIL — `HEADLESS_STEPS` / `nextApiKey` / `seedApiKey` / `A2A_*` are not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `src/features/ai-agents/configuration/config-data.ts`:

```ts
// ── Headless tab ────────────────────────────────────────────────────────────
// Frontend-only mock content for the AI Agents → Configuration → Headless tab.
// Mirrors Figma frames 225-6282 (tab) and 145-75243 (instruction content).

export const HEADLESS_INTRO =
  'Run your agent with a direct API key, or layer on the A2A protocol so other agents can discover and call it. Both modes use the same key. A2A adds a public agent card and a message endpoint on top.'

export const A2A_HEADING = 'A2A ( Agent to Agent)'

export const A2A_DESCRIPTION =
  'An open standard that lets AI agents from any vendor talk to your headless agent. Forethought publishes an agent card and message endpoint for you. Point any A2A client at them to start an authenticated support conversation. Your CX team stays in full control of the policies and Autoflows behind it.'

export const A2A_AGENT_CARD_URL =
  'https://app.forethought.ai/solve/a2a/acme/.well-known/agent-card.json'
export const A2A_MESSAGE_ENDPOINT = 'https://app.forethought.ai/solve/a2a/acme/v1/message'

// The masked API-key display (shown until the eye toggle reveals the real value).
export const API_KEY_MASK = '••••••••••••••'

export type HeadlessStep = {
  n: string
  title: string
  body: string
  code: string
  codeCaption?: string
}

const BEARER = 'Authorization: Bearer ft_a2a_live_9b3f7c21d8a64e05'

export const HEADLESS_STEPS: HeadlessStep[] = [
  {
    n: '01',
    title: 'Add Forethought as an A2A agent',
    body: 'In your A2A client, register a new agent using your Agent Card URL. The client reads the card and discovers the skill, endpoint, and auth automatically, no manual config.',
    code: `# Agent Card URL\n${A2A_AGENT_CARD_URL}`,
  },
  {
    n: '02',
    title: 'Authenticate with your API key',
    body: 'Send your A2A API key as a Bearer token on every request.',
    code: BEARER,
  },
  {
    n: '03',
    title: "Pass the end-user's identity",
    body: "Include the customer's signed token so Solve treats the conversation as authenticated and can act on their account.",
    code: BEARER,
  },
  {
    n: '04',
    title: 'Send a message',
    body: "POST a JSON-RPC message/send to your message endpoint. Forethought replies with a task and the agent's answer; reuse the returned task id for follow-up turns.",
    code: `POST ${A2A_MESSAGE_ENDPOINT}
{
  "jsonrpc": "2.0", "id": "1", "method": "message/send",
  "params": { "message": {
    "role": "user", "messageId": "m-1",
    "parts": [{ "kind": "text", "text": "Where is my refund for order 12345?" }]
  }}
}`,
  },
]

// Deterministic mock API keys (no Date.now/Math.random — see org-context seq).
let keySeq = 0
function keyFrom(n: number): string {
  // Pad a counter-derived hex to a stable, key-looking suffix.
  const suffix = (0x9b3f7c21d8a64e05n + BigInt(n) * 0x1_0000_1111n).toString(16).slice(0, 16)
  return `ft_a2a_live_${suffix}`
}
export function seedApiKey(): string {
  return keyFrom(0)
}
export function nextApiKey(): string {
  return keyFrom(++keySeq)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-agents/configuration/config-data.test.ts --exclude '**/.claude/**'`
Expected: PASS (all config-data tests, old and new).

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-agents/configuration/config-data.ts src/features/ai-agents/configuration/config-data.test.ts
git commit -m "feat(ai-agents): seed Headless tab mock data & keys

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: CopyField reusable component

**Files:**
- Create: `src/features/ai-agents/configuration/CopyField.tsx`
- Test: `src/features/ai-agents/configuration/CopyField.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  ```ts
  type CopyFieldProps = {
    value: string            // text copied to clipboard
    children: React.ReactNode // rendered field body (code / label markup)
    variant?: 'dark' | 'light'
    'aria-label'?: string
    className?: string
  }
  export function CopyField(props: CopyFieldProps): JSX.Element
  ```
  A container with a copy button (top-right for `dark`, right-center for `light`). On click: `navigator.clipboard?.writeText(value)`, then the button shows a check + "Copied" for ~1500ms, then reverts. Timer cleared on unmount.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-agents/configuration/CopyField.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyField } from './CopyField'

describe('CopyField', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  it('copies its value and shows Copied feedback', async () => {
    render(<CopyField value="hello-value" aria-label="Copy hello">code body</CopyField>)
    const btn = screen.getByRole('button', { name: 'Copy hello' })
    await userEvent.click(btn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello-value')
    expect(await screen.findByText('Copied')).toBeInTheDocument()
  })

  it('renders its children', () => {
    render(<CopyField value="x">the body text</CopyField>)
    expect(screen.getByText('the body text')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/configuration/CopyField.test.tsx --exclude '**/.claude/**'`
Expected: FAIL — cannot find `./CopyField`.

- [ ] **Step 3: Write minimal implementation**

Create `src/features/ai-agents/configuration/CopyField.tsx`:

```tsx
// A field with a copy-to-clipboard button and transient "Copied" feedback.
// Two variants: 'dark' (a code block, button top-right) and 'light' (a bordered
// read-only field, button right-center). Presentational + local timer only.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

type CopyFieldProps = {
  value: string
  children: ReactNode
  variant?: 'dark' | 'light'
  'aria-label'?: string
  className?: string
}

export function CopyField({ value, children, variant = 'dark', className, ...rest }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const onCopy = () => {
    void navigator.clipboard?.writeText(value)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  const dark = variant === 'dark'
  return (
    <div
      className={`relative flex w-full items-start gap-2 rounded-md ${
        dark ? 'bg-[#0d212d] px-4 py-2.5' : 'overflow-hidden rounded-[10px] border border-[#ffb393] bg-white'
      } ${className ?? ''}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        aria-label={rest['aria-label'] ?? 'Copy'}
        onClick={onCopy}
        className={`flex shrink-0 items-center gap-1 rounded p-1.5 ${
          dark ? 'text-[#e4e7f0]' : 'absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted'
        }`}
      >
        {copied ? <Check size={dark ? 17 : 20} aria-hidden /> : <Copy size={dark ? 17 : 20} aria-hidden />}
        {copied ? <span className="text-[12px]">Copied</span> : null}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/ai-agents/configuration/CopyField.test.tsx --exclude '**/.claude/**'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-agents/configuration/CopyField.tsx src/features/ai-agents/configuration/CopyField.test.tsx
git commit -m "feat(ai-agents): add CopyField with copy feedback

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: HeadlessInstructions (left panel) + intro assets

**Files:**
- Create: `src/features/ai-agents/configuration/HeadlessInstructions.tsx`
- Create (download): `src/assets/headless/chat-bot-teal.svg`, `src/assets/headless/chat-bot-pink.svg`, `src/assets/headless/arrows-diff.svg`
- Test: covered by Task 5's `HeadlessView.test.tsx` (this panel has no standalone behavior).

**Interfaces:**
- Consumes: `HEADLESS_STEPS`, `HEADLESS_INTRO`, `A2A_HEADING`, `A2A_DESCRIPTION` from `config-data.ts`; `CopyField`.
- Produces: `export function HeadlessInstructions(): JSX.Element` — no props.

- [ ] **Step 1: Download the three intro SVG assets**

The Figma asset URLs (from frame 145-75243) expire ~7 days after they were fetched; if any curl returns an error/expired response, re-run `get_design_context` on node `145-75243` to refresh them.

```bash
mkdir -p src/assets/headless
curl -sSfL "https://www.figma.com/api/mcp/asset/0ec1d30e-9bd0-4554-9869-3aae1020b397" -o src/assets/headless/chat-bot-teal.svg
curl -sSfL "https://www.figma.com/api/mcp/asset/2bff4f50-95e1-4a64-8aa5-da41848661b5" -o src/assets/headless/chat-bot-pink.svg
curl -sSfL "https://www.figma.com/api/mcp/asset/f005826a-5dab-416c-87f0-987cdc6c2967" -o src/assets/headless/arrows-diff.svg
```

Verify each file is non-empty and is SVG:

```bash
head -c 80 src/assets/headless/chat-bot-teal.svg; echo
wc -c src/assets/headless/*.svg
```

Expected: each `wc -c` > 0 and the head shows `<svg` (or an `<?xml` prolog). If a file is empty or HTML, the URL expired — refresh via `get_design_context` on `145-75243` and retry.

- [ ] **Step 2: Write the component**

Create `src/features/ai-agents/configuration/HeadlessInstructions.tsx`:

```tsx
// Left column of the Headless tab: the A2A intro (gradient teal copy, robot
// glyphs, heading + description) and the 4 numbered onboarding steps, each with
// a copyable dark code block. Presentational; content from config-data.
import { CopyField } from './CopyField'
import { HEADLESS_INTRO, A2A_HEADING, A2A_DESCRIPTION, HEADLESS_STEPS } from './config-data'
import chatBotTeal from '@/assets/headless/chat-bot-teal.svg'
import chatBotPink from '@/assets/headless/chat-bot-pink.svg'
import arrowsDiff from '@/assets/headless/arrows-diff.svg'

export function HeadlessInstructions() {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-8">
      <div className="mx-auto w-full max-w-[560px]">
        {/* Intro */}
        <p className="text-center text-[16px] italic leading-[22px] tracking-[-0.1px] text-[#01567a]">
          Configure Solve Headless using the menu on the right.
        </p>
        <p className="mt-4 text-center text-[16px] italic leading-[22px] tracking-[-0.1px] text-[#01567a]">
          {HEADLESS_INTRO}
        </p>

        {/* Robot glyphs */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <img src={chatBotTeal} alt="" className="size-[35px]" />
          <img src={arrowsDiff} alt="" className="size-[46px]" />
          <img src={chatBotPink} alt="" className="size-[35px]" />
        </div>

        {/* A2A heading + description */}
        <h2 className="mt-8 text-center text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-black">
          {A2A_HEADING}
        </h2>
        <p className="mt-4 text-[16px] leading-[22px] tracking-[-0.1px] text-[#01567a]">{A2A_DESCRIPTION}</p>

        {/* Steps */}
        <div className="mt-8 flex flex-col gap-8">
          {HEADLESS_STEPS.map((step) => (
            <div key={step.n}>
              <div className="flex items-center gap-3">
                <span className="text-[20px] leading-[30px] tracking-[-0.1px] text-[#1b5996]">{step.n}</span>
                <span className="font-mono text-[16px] tracking-[-0.3px] text-black">{step.title}</span>
              </div>
              <p className="mt-2 text-[14px] leading-5 tracking-[-0.1px] text-grey-800">{step.body}</p>
              <CopyField value={step.code} aria-label={`Copy code for step ${step.n}`} className="mt-3">
                <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-5 tracking-[-0.1px] text-[#e4e7f0]">
                  {step.code}
                </pre>
              </CopyField>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Typecheck (asset imports resolve)**

Run: `pnpm typecheck`
Expected: PASS. If SVG imports error with "Cannot find module", confirm `src/vite-env.d.ts` (or equivalent) includes Vite's `/// <reference types="vite/client" />` — it already does for the `org-logos` PNG/WebP imports, and `.svg` is covered by the same client types. Do not add a new declaration if `org-logo.ts` already imports images without one.

- [ ] **Step 4: Commit**

```bash
git add src/assets/headless src/features/ai-agents/configuration/HeadlessInstructions.tsx
git commit -m "feat(ai-agents): add Headless instructions panel + intro assets

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: HeadlessConfigPanel (right card + rail)

**Files:**
- Create: `src/features/ai-agents/configuration/HeadlessConfigPanel.tsx`
- Test: covered by Task 5's `HeadlessView.test.tsx`.

**Interfaces:**
- Consumes: `CopyField`; `A2A_AGENT_CARD_URL`, `A2A_MESSAGE_ENDPOINT`, `API_KEY_MASK` from `config-data.ts`; `lucide-react` icons.
- Produces:
  ```ts
  type HeadlessConfigPanelProps = {
    apiKey: string          // the real (unmasked) mock key
    revealed: boolean       // whether to show apiKey vs API_KEY_MASK
    onToggleReveal: () => void
    onRefreshKey: () => void
    activeSection: string   // 'headless' | 'knowledge' | 'personality'
    onSectionChange: (id: string) => void
  }
  export function HeadlessConfigPanel(props: HeadlessConfigPanelProps): JSX.Element
  ```

- [ ] **Step 1: Write the component**

Create `src/features/ai-agents/configuration/HeadlessConfigPanel.tsx`:

```tsx
// Right column of the Headless tab: a white elevated card with the API-key and
// A2A-connection sections, plus a slim rail (Headless active; Knowledge &
// Personality are decorative/deferred, mirroring the Widget rail pattern).
// Presentational — reveal/refresh bubble up via handlers.
import { Blocks, BookOpen, Copy, Eye, EyeOff, Heart, IdCard, MessageSquarePlus, type LucideIcon } from 'lucide-react'
import { CopyField } from './CopyField'
import { A2A_AGENT_CARD_URL, A2A_MESSAGE_ENDPOINT, API_KEY_MASK } from './config-data'

type Section = { id: string; label: string; Icon: LucideIcon }
const SECTIONS: Section[] = [
  { id: 'headless', label: 'Headless', Icon: Blocks },
  { id: 'knowledge', label: 'Knowledge', Icon: BookOpen },
  { id: 'personality', label: 'Personality', Icon: Heart },
]

type HeadlessConfigPanelProps = {
  apiKey: string
  revealed: boolean
  onToggleReveal: () => void
  onRefreshKey: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}

function A2ARow({ icon: Icon, label, value, caption }: { icon: LucideIcon; label: string; value: string; caption: string }) {
  return (
    <div>
      <CopyField value={value} variant="light" aria-label={`Copy ${label}`}>
        <div className="w-[360px] max-w-full border-r border-[#f1efed] bg-[#fbfbfb] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Icon size={16} className="text-ink-muted" aria-hidden />
            <span className="text-[12px] font-medium text-black">{label}</span>
          </div>
          <p className="mt-2 break-all font-mono text-[12px] leading-[18px] tracking-[-0.1px] text-grey-800">{value}</p>
        </div>
      </CopyField>
      <p className="mt-2 text-[12px] leading-[18px] tracking-[-0.1px] text-grey-800">{caption}</p>
    </div>
  )
}

export function HeadlessConfigPanel({
  apiKey, revealed, onToggleReveal, onRefreshKey, activeSection, onSectionChange,
}: HeadlessConfigPanelProps) {
  return (
    <div className="flex h-full shrink-0">
      {/* Card */}
      <div className="w-[480px] overflow-y-auto bg-white px-6 py-6 shadow-[0px_0px_1px_0px_rgba(0,12,32,0.02),2px_8px_16px_0px_rgba(3,17,38,0.11)]">
        <h2 className="text-[24px] font-semibold leading-[28px] tracking-[-0.1px] text-black">Headless</h2>

        {/* API key */}
        <div className="mt-6">
          <p className="text-[16px] font-semibold leading-[22px] text-black">API key</p>
          <p className="mt-3 text-[14px] leading-5 text-black">
            This API key is a unique identifier used for authenticating and authorizing access to an API.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[16px] leading-[22px] tracking-[-0.1px] text-black">
              {revealed ? apiKey : API_KEY_MASK}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={revealed ? 'Hide API key' : 'Show API key'}
                onClick={onToggleReveal}
                className="rounded p-1.5 text-ink-muted"
              >
                {revealed ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
              <CopyField value={apiKey} variant="dark" aria-label="Copy API key" className="w-auto bg-transparent px-0 py-0 text-ink-muted">
                <span className="sr-only">API key</span>
              </CopyField>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshKey}
            className="mt-4 w-full rounded bg-[#ebf5f7] px-4 py-1.5 text-[14px] font-semibold text-[#193d50]"
          >
            Refresh API key
          </button>
          <p className="mt-4 text-[12px] leading-[18px] tracking-[-0.1px] text-grey-800">
            Clicking on ‘Refresh’ wil make the system generate a new API token for setting up connection. Once
            regenerated, the previous token will be inaccessible.
          </p>
        </div>

        <hr className="my-6 border-t border-surface-border" />

        {/* A2A connection */}
        <div>
          <p className="text-[16px] font-semibold leading-[22px] text-black">A2A connection</p>
          <p className="mt-4 text-[14px] leading-5 text-black">
            Adds an agent card and message endpoint so other agents can discover, authenticate, and call yours
            automatically. Copy these into your A2A client.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <A2ARow icon={IdCard} label="Agent Card" value={A2A_AGENT_CARD_URL} caption="What your client reads to discover this agent." />
            <A2ARow icon={MessageSquarePlus} label="Message endpoint" value={A2A_MESSAGE_ENDPOINT} caption="Where the agent sends and streams messages." />
          </div>
        </div>
      </div>

      {/* Slim rail */}
      <div className="flex w-[80px] shrink-0 flex-col items-center gap-3 bg-white px-2 pt-5 shadow-[-0.5px_0px_0px_#e4e7f0]">
        {SECTIONS.map(({ id, label, Icon }) => {
          const active = id === activeSection
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <button
                type="button"
                aria-label={label}
                aria-pressed={active}
                onClick={() => onSectionChange(id)}
                className={`flex size-10 items-center justify-center rounded ${active ? 'bg-[#ebf5f7] text-[#193d50]' : 'text-ink-muted'}`}
              >
                <Icon size={24} aria-hidden />
              </button>
              <span className="text-[11px] font-semibold tracking-[-0.1px] text-grey-800">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

Note: the `Copy` import is used indirectly via `CopyField`; remove it from this file's imports (it is not referenced here — only `Blocks, BookOpen, Eye, EyeOff, Heart, IdCard, MessageSquarePlus, LucideIcon` are). Ensure no unused import remains so `tsc` stays clean.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS with no unused-import / type errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/ai-agents/configuration/HeadlessConfigPanel.tsx
git commit -m "feat(ai-agents): add Headless config panel (API key + A2A)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: HeadlessView + wire into ConfigurationView

**Files:**
- Create: `src/features/ai-agents/configuration/HeadlessView.tsx`
- Modify: `src/features/ai-agents/configuration/ConfigurationView.tsx`
- Test: `src/features/ai-agents/configuration/HeadlessView.test.tsx`

**Interfaces:**
- Consumes: `HeadlessInstructions`, `HeadlessConfigPanel`, `seedApiKey`, `nextApiKey` from earlier tasks.
- Produces: `export function HeadlessView(): JSX.Element` — no props; owns all Headless state.

- [ ] **Step 1: Write the failing test**

Create `src/features/ai-agents/configuration/HeadlessView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigurationView } from './ConfigurationView'

const view = () => within(screen.getByTestId('view-configuration'))

describe('Headless tab', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  it('renders the 4 steps, API key section, and A2A endpoints when Headless is selected', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    expect(v.getByText('Add Forethought as an A2A agent')).toBeInTheDocument()
    expect(v.getByText("Pass the end-user's identity")).toBeInTheDocument()
    expect(v.getByText('Send a message')).toBeInTheDocument()
    expect(v.getByText('API key')).toBeInTheDocument()
    expect(v.getByText('Agent Card')).toBeInTheDocument()
    expect(v.getByText('Message endpoint')).toBeInTheDocument()
    expect(v.queryByText('Coming soon')).not.toBeInTheDocument()
  })

  it('reveals and re-masks the API key with the eye toggle', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    expect(v.getByText('••••••••••••••')).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Show API key' }))
    expect(v.queryByText('••••••••••••••')).not.toBeInTheDocument()
    expect(v.getByText(/^ft_a2a_live_/)).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Hide API key' }))
    expect(v.getByText('••••••••••••••')).toBeInTheDocument()
  })

  it('changes the key when Refresh is clicked', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    await userEvent.click(v.getByRole('button', { name: 'Show API key' }))
    const first = v.getByText(/^ft_a2a_live_/).textContent
    await userEvent.click(v.getByRole('button', { name: 'Refresh API key' }))
    await userEvent.click(v.getByRole('button', { name: 'Show API key' }))
    expect(v.getByText(/^ft_a2a_live_/).textContent).not.toBe(first)
  })

  it('copies a step code block to the clipboard', async () => {
    render(<ConfigurationView />)
    const v = view()
    await userEvent.click(v.getByText('Headless'))
    await userEvent.click(v.getByRole('button', { name: 'Copy code for step 01' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('agent-card.json'),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/ai-agents/configuration/HeadlessView.test.tsx --exclude '**/.claude/**'`
Expected: FAIL — Headless tab still renders "Coming soon"; step titles/API key not found.

- [ ] **Step 3: Write HeadlessView**

Create `src/features/ai-agents/configuration/HeadlessView.tsx`:

```tsx
// The Headless tab body: instructions (left) + config card & rail (right).
// Owns local, mocked state — masked/revealed API key, current key value, and
// which rail section is active (only 'headless' has content this phase).
import { useState } from 'react'
import { HeadlessInstructions } from './HeadlessInstructions'
import { HeadlessConfigPanel } from './HeadlessConfigPanel'
import { seedApiKey, nextApiKey } from './config-data'

export function HeadlessView() {
  const [apiKey, setApiKey] = useState(seedApiKey)
  const [revealed, setRevealed] = useState(false)
  const [activeSection, setActiveSection] = useState('headless')

  return (
    <div className="flex flex-1 overflow-hidden">
      <HeadlessInstructions />
      <HeadlessConfigPanel
        apiKey={apiKey}
        revealed={revealed}
        onToggleReveal={() => setRevealed((r) => !r)}
        onRefreshKey={() => {
          setApiKey(nextApiKey())
          setRevealed(false)
        }}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  )
}
```

- [ ] **Step 4: Wire into ConfigurationView**

In `src/features/ai-agents/configuration/ConfigurationView.tsx`:

Add the import near the other panel imports (after line 12):

```tsx
import { HeadlessView } from './HeadlessView'
```

Replace the body ternary (the block starting `{activeTab === 'widget' ? (` through its matching close, currently ending with the coming-soon `</div>` before the outer `</div>`) with a three-way branch:

```tsx
      {/* Body */}
      {activeTab === 'widget' ? (
        <div className="flex flex-1 overflow-hidden">
          <BrandList brands={brands} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="flex flex-1 justify-center overflow-y-auto px-6 py-8">
            <WidgetPreview
              brandName={selected.name}
              brandLabel={BRAND_LIST_LABELS[selected.id] ?? selected.name}
              tagSummary={summarizeTags(selected.tags)}
            />
          </div>
          <div className="flex shrink-0 py-2 pr-2">
            {activeSection === 'sentiment' ? (
              <AiPersonalityPanel
                brand={selected}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onPersonalityChange={updatePersonality}
              />
            ) : (
              <BrandedWidgetPanel
                brand={selected}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onNameChange={(name) => updateSelected({ name })}
                onToggleEnabled={() => updateSelected({ enabled: !selected.enabled })}
                onToggleDefault={() => updateSelected({ isDefault: !selected.isDefault })}
              />
            )}
          </div>
        </div>
      ) : activeTab === 'headless' ? (
        <HeadlessView />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-ink-muted">
          <div className="text-xl font-medium text-ink">{CHANNEL_TABS.find((t) => t.id === activeTab)?.label}</div>
          <div className="mt-2 text-sm opacity-70">Coming soon</div>
        </div>
      )}
```

(This preserves the exact Widget branch already in the file; only the `: (` coming-soon tail becomes `: activeTab === 'headless' ? (<HeadlessView />) : (`.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/ai-agents/configuration --exclude '**/.claude/**'`
Expected: PASS — new HeadlessView tests + all existing configuration tests (the "coming-soon for non-Widget tabs" test still clicks **Voice**, which stays coming-soon).

- [ ] **Step 6: Full gates**

Run: `pnpm typecheck && npx vitest run --exclude '**/.claude/**' && pnpm build`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/ai-agents/configuration/HeadlessView.tsx src/features/ai-agents/configuration/HeadlessView.test.tsx src/features/ai-agents/configuration/ConfigurationView.tsx
git commit -m "feat(ai-agents): render Headless tab in Configuration

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review notes

- **Spec coverage:** layout (Task 5), instructions + 4 steps + assets (Task 3), config card API key + A2A + rail (Task 4), CopyField/clipboard/eye/refresh interactivity (Tasks 2, 4, 5), data + deterministic keys (Task 1), Voice/Web Call stay coming-soon (Task 5 branch + preserved test), tests + gates (each task). All covered.
- **Determinism:** `nextApiKey`/`seedApiKey` use a module counter, no `Date.now`/`Math.random`.
- **Type consistency:** `HeadlessConfigPanelProps`, `CopyFieldProps`, `HeadlessStep` names/fields consistent across tasks; `activeSection` is `string` throughout.
- **Known caveat:** the API-key section renders `CopyField` with a `sr-only` label and no visible body for the copy affordance next to the eye; if visual QA wants the copy glyph exactly per Figma, the `variant="dark"` override styling in Task 4 keeps it icon-only. Adjust spacing during review if needed — behavior (copy + feedback) is covered by tests.
