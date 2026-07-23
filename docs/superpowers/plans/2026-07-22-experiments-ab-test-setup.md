# A/B Test Setup Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Experiments "Create new" button to a full-page, presentational A/B Test Setup screen at `/experiments/new`.

**Architecture:** A new `src/features/experiments/setup/` folder holds the screen shell and its parts. The screen mirrors `AutomationDetailScreen` (full-height rounded card, top bar with back arrow + tabs + action, scrollable body). All inputs are local React state; every action navigates back to `/experiments`. No backend, no shared store — the experiments list stays the static mock. New route added to `routes.tsx`; existing `ExperimentsScreen` "Create new" button wired to navigate.

**Tech Stack:** React 19, TypeScript (strict), React Router v7 (`react-router`), Tailwind v4 (semantic token classes + inline hex for brand one-offs), lucide-react, Vitest + React Testing Library (jsdom). No new dependencies.

## Global Constraints

- Import routing from `react-router`, never `react-router-dom`.
- Path alias `@` → `src/`. Do NOT add `baseUrl` to tsconfig.
- Do NOT add `: JSX.Element` (or any) return-type annotations to components — the global JSX namespace is not in scope under React 19; it breaks `tsc`. Match the codebase: components have no explicit return type.
- Run tests with `npx vitest run --exclude '**/.claude/**'` (sibling worktrees cause spurious failures otherwise).
- pnpm/npx: use `npx vitest`, `npx tsc --noEmit`.
- Prefer semantic token classes (`text-ink`, `text-ink-muted`, `border-surface-border`, `bg-ink`) for chrome. Use inline `style={{ ... }}` hex only for the per-brand/accent one-offs listed in the spec (this matches existing `StatusBadge` / `TrafficSplitBar`).
- Presentational only: dropdown/date fields are static styled divs (no `<select>`, no menu, no date picker). Traffic slider is a static track+highlight (not draggable). "Add variant", "Apply", "View version", overflow `⋯` are inert. Save / Run A/B Test / Close / back all `navigate('/experiments')`.
- Commit footer on every commit:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: Setup data model

**Files:**
- Modify: `src/features/experiments/experiments-data.ts` (append new types + constants; do not change existing exports)
- Test: `src/features/experiments/experiments-data.test.ts` (append cases)

**Interfaces:**
- Consumes: nothing new.
- Produces (later tasks rely on these exact names/types):
  - `type SetupVariant = { key: string; badge: string; badgeColor: string; description: string; agent: string; traffic: number }`
  - `type SummaryVariant = { badge: string; badgeColor: string; title: string; body: string }`
  - `type Recommendation = { title: string; body: string }`
  - `const SETUP_VARIANTS: SetupVariant[]`
  - `const WINNER_METRICS: string[]`
  - `const CHANNEL_OPTIONS: string[]`
  - `const TIME_ZONE: string`
  - `const SUMMARY_VARIANTS: SummaryVariant[]`
  - `const RECOMMENDATION: Recommendation`
  - `const DEFAULT_TEST_NAME: string`
  - `const DEFAULT_TEST_DESCRIPTION: string`

- [ ] **Step 1: Write the failing test** — append to `experiments-data.test.ts`:

```ts
import {
  SETUP_VARIANTS,
  SUMMARY_VARIANTS,
  RECOMMENDATION,
  WINNER_METRICS,
  CHANNEL_OPTIONS,
  TIME_ZONE,
  DEFAULT_TEST_NAME,
  DEFAULT_TEST_DESCRIPTION,
} from './experiments-data'

describe('A/B Test Setup data', () => {
  it('seeds Control and Variant A with correct badge colors and traffic', () => {
    expect(SETUP_VARIANTS).toHaveLength(2)
    const [control, variantA] = SETUP_VARIANTS
    expect(control.badge).toBe('Control')
    expect(control.badgeColor).toBe('#01567a')
    expect(control.traffic).toBe(50)
    expect(variantA.badge).toBe('Variant A')
    expect(variantA.badgeColor).toBe('#e05c34')
    expect(variantA.traffic).toBe(50)
  })

  it('provides summary variants and a recommendation', () => {
    expect(SUMMARY_VARIANTS.map((v) => v.title)).toEqual([
      'Manual login',
      'Fully automated login assistance',
    ])
    expect(RECOMMENDATION.title).toBe('Test duration: 2 weeks')
  })

  it('provides winner metrics, channel options, timezone, and defaults', () => {
    expect(WINNER_METRICS).toEqual(['Deflection', 'Sentiment'])
    expect(CHANNEL_OPTIONS).toContain('Widget')
    expect(TIME_ZONE).toBe('Pacific time GTM -8, Los Angeles')
    expect(DEFAULT_TEST_NAME).toBe('Login fix method comparison')
    expect(DEFAULT_TEST_DESCRIPTION.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/experiments-data.test.ts`
Expected: FAIL (imports undefined).

- [ ] **Step 3: Append implementation** to `experiments-data.ts` (after the existing exports):

```ts
// ── A/B Test Setup screen (presentational, exact copy from Figma 756:86465) ──

export type SetupVariant = {
  key: string
  badge: string
  badgeColor: string
  description: string
  agent: string
  traffic: number
}

export type SummaryVariant = {
  badge: string
  badgeColor: string
  title: string
  body: string
}

export type Recommendation = {
  title: string
  body: string
}

export const DEFAULT_TEST_NAME = 'Login fix method comparison'
export const DEFAULT_TEST_DESCRIPTION =
  'Explore which login troubleshooting experience leads to the highest user satisfaction.'

export const CHANNEL_OPTIONS = ['Widget', 'Email', 'Voice', 'Messaging']

export const WINNER_METRICS = ['Deflection', 'Sentiment']

export const TIME_ZONE = 'Pacific time GTM -8, Los Angeles'

export const SETUP_VARIANTS: SetupVariant[] = [
  {
    key: 'control',
    badge: 'Control',
    badgeColor: '#01567a',
    description: 'The current live agent that acts as the baseline.',
    agent: 'Login troubleshooting',
    traffic: 50,
  },
  {
    key: 'variant-a',
    badge: 'Variant A',
    badgeColor: '#e05c34',
    description: 'The new agent you want to test against the control.',
    agent: 'Auto Reset Password',
    traffic: 50,
  },
]

export const SUMMARY_VARIANTS: SummaryVariant[] = [
  {
    badge: 'Control',
    badgeColor: '#01567a',
    title: 'Manual login',
    body: 'All login-related tickets are routed to the Authentication Support queue and handled entirely by human agents. They manually verify user identities, reset passwords, and resolve access issues. Automation is limited to basic confirmation messages.',
  },
  {
    badge: 'Variant A',
    badgeColor: '#e05c34',
    title: 'Fully automated login assistance',
    body: 'An AI-driven system identifies and resolves most login issues automatically through chat or self-service. Users can reset passwords, unlock accounts, or recover credentials without agent help. Only complex or security-sensitive cases are escalated to support.',
  },
]

export const RECOMMENDATION: Recommendation = {
  title: 'Test duration: 2 weeks',
  body: 'This duration captures both weekday and weekend user behavior, ensuring enough data to reach statistically meaningful results for deflection and CSAT metrics.',
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/experiments-data.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` (expect clean)
```bash
git add src/features/experiments/experiments-data.ts src/features/experiments/experiments-data.test.ts
git commit -m "feat(experiments): add A/B Test Setup mock data

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Field primitives

**Files:**
- Create: `src/features/experiments/setup/Field.tsx`
- Test: `src/features/experiments/setup/Field.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `function TextField(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string })`
  - `function TextArea(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string })`
  - `function SelectField(props: { label?: string; value: string; muted?: boolean })` — static dropdown-styled div showing `value` + a chevron; when `muted`, value text uses `text-ink-muted`. No menu.

- [ ] **Step 1: Write the failing test** — `Field.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextField, TextArea, SelectField } from './Field'

describe('Field primitives', () => {
  it('TextField shows label and value, fires onChange', () => {
    const onChange = vi.fn()
    render(<TextField label="Test name" value="Hello" onChange={onChange} />)
    expect(screen.getByText('Test name')).toBeInTheDocument()
    const input = screen.getByDisplayValue('Hello')
    fireEvent.change(input, { target: { value: 'World' } })
    expect(onChange).toHaveBeenCalledWith('World')
  })

  it('TextArea shows label and value, fires onChange', () => {
    const onChange = vi.fn()
    render(<TextArea label="Description" value="Body" onChange={onChange} />)
    expect(screen.getByText('Description')).toBeInTheDocument()
    fireEvent.change(screen.getByDisplayValue('Body'), { target: { value: 'New' } })
    expect(onChange).toHaveBeenCalledWith('New')
  })

  it('SelectField renders label and value text', () => {
    render(<SelectField label="Channel" value="Widget" />)
    expect(screen.getByText('Channel')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/Field.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `Field.tsx`:

```tsx
// Shared presentational form primitives for the A/B Test Setup screen.
// TextField/TextArea are controlled; SelectField is a static dropdown-styled
// div (no menu — consistent with the mock).
import { ChevronDown } from 'lucide-react'

const LABEL = 'block text-[12px] font-medium text-ink'
const BOX = 'w-full rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px] text-ink outline-none placeholder:text-ink-muted'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <input
        className={`mt-1.5 ${BOX}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <textarea
        className={`mt-1.5 min-h-[88px] resize-none ${BOX}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function SelectField({
  label,
  value,
  muted = false,
}: {
  label?: string
  value: string
  muted?: boolean
}) {
  return (
    <label className="block">
      {label && <span className={LABEL}>{label}</span>}
      <div
        className={`${label ? 'mt-1.5 ' : ''}flex items-center justify-between rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px]`}
      >
        <span className={muted ? 'text-ink-muted' : 'text-ink'}>{value}</span>
        <ChevronDown size={16} className="text-ink-muted" aria-hidden />
      </div>
    </label>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/Field.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit`
```bash
git add src/features/experiments/setup/Field.tsx src/features/experiments/setup/Field.test.tsx
git commit -m "feat(experiments): add Setup form field primitives

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: SetupSection wrapper

**Files:**
- Create: `src/features/experiments/setup/SetupSection.tsx`
- Test: `src/features/experiments/setup/SetupSection.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `function SetupSection(props: { icon: ReactNode; title: string; subtitle: string; children: ReactNode; defaultOpen?: boolean })`

- [ ] **Step 1: Write the failing test** — `SetupSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SetupSection } from './SetupSection'

describe('SetupSection', () => {
  it('renders title, subtitle, and children by default', () => {
    render(
      <SetupSection icon={<span>i</span>} title="A/B Test detail" subtitle="Define it.">
        <p>Body content</p>
      </SetupSection>,
    )
    expect(screen.getByText('A/B Test detail')).toBeInTheDocument()
    expect(screen.getByText('Define it.')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('collapses and expands children via the toggle', () => {
    render(
      <SetupSection icon={<span>i</span>} title="Section" subtitle="Sub">
        <p>Body content</p>
      </SetupSection>,
    )
    const toggle = screen.getByRole('button', { name: /section/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Body content')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/SetupSection.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `SetupSection.tsx`:

```tsx
// A collapsible section for the A/B Test Setup form: icon + title + subtitle
// with a chevron toggle. Local open state; open by default.
import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function SetupSection({
  icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="py-6">
      <button
        type="button"
        aria-expanded={open}
        aria-label={title}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 text-left outline-none"
      >
        <span className="flex size-[18px] items-center justify-center text-ink">{icon}</span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold text-ink">{title}</span>
          <span className="block text-[12px] text-ink-muted">{subtitle}</span>
        </span>
        <ChevronDown
          size={20}
          className={`text-ink-muted transition-transform ${open ? '' : '-rotate-90'}`}
          aria-hidden
        />
      </button>
      {open && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/SetupSection.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit`
```bash
git add src/features/experiments/setup/SetupSection.tsx src/features/experiments/setup/SetupSection.test.tsx
git commit -m "feat(experiments): add collapsible SetupSection wrapper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: VariantRow

**Files:**
- Create: `src/features/experiments/setup/VariantRow.tsx`
- Test: `src/features/experiments/setup/VariantRow.test.tsx`

**Interfaces:**
- Consumes: `SetupVariant` from `../experiments-data`; `SelectField` from `./Field`.
- Produces:
  - `function VariantRow(props: { variant: SetupVariant })`

- [ ] **Step 1: Write the failing test** — `VariantRow.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VariantRow } from './VariantRow'
import { SETUP_VARIANTS } from '../experiments-data'

describe('VariantRow', () => {
  it('renders the badge, description, agent, and traffic', () => {
    render(<VariantRow variant={SETUP_VARIANTS[0]} />)
    expect(screen.getByText('Control')).toBeInTheDocument()
    expect(screen.getByText('The current live agent that acts as the baseline.')).toBeInTheDocument()
    expect(screen.getByText('Login troubleshooting')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/VariantRow.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `VariantRow.tsx`:

```tsx
// One variant row in the Agent-and-variants section: a colored badge + helper
// text, the agent dropdown (static), and a small Traffic % field. Presentational.
import { type SetupVariant } from '../experiments-data'
import { SelectField } from './Field'

export function VariantRow({ variant }: { variant: SetupVariant }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: variant.badgeColor }}
          >
            {variant.badge}
          </span>
          <span className="text-[12px] text-ink-muted">{variant.description}</span>
        </div>
        <div className="mt-1.5">
          <SelectField value={variant.agent} />
        </div>
      </div>
      <div className="w-[110px]">
        <span className="block text-[12px] font-medium text-ink">Traffic</span>
        <div className="mt-1.5 flex items-center justify-between rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px] text-ink">
          <span>{variant.traffic}</span>
          <span className="text-ink-muted">%</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/VariantRow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit`
```bash
git add src/features/experiments/setup/VariantRow.tsx src/features/experiments/setup/VariantRow.test.tsx
git commit -m "feat(experiments): add VariantRow for Setup variants

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: SummaryPanel

**Files:**
- Create: `src/features/experiments/setup/SummaryPanel.tsx`
- Test: `src/features/experiments/setup/SummaryPanel.test.tsx`

**Interfaces:**
- Consumes: `SUMMARY_VARIANTS`, `RECOMMENDATION` from `../experiments-data`.
- Produces:
  - `function SummaryPanel()`

- [ ] **Step 1: Write the failing test** — `SummaryPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryPanel } from './SummaryPanel'

describe('SummaryPanel', () => {
  it('renders summary heading, both variant titles, recommendation, and Apply', () => {
    render(<SummaryPanel />)
    expect(screen.getByRole('heading', { name: 'Summary' })).toBeInTheDocument()
    expect(screen.getByText('Manual login')).toBeInTheDocument()
    expect(screen.getByText('Fully automated login assistance')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Test duration: 2 weeks')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/SummaryPanel.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `SummaryPanel.tsx`:

```tsx
// The right-side Summary + Recommendations panel on the A/B Test Setup screen.
// Fully static/presentational; "View version" and "Apply" are inert.
import { SUMMARY_VARIANTS, RECOMMENDATION } from '../experiments-data'

const GRADIENT =
  'linear-gradient(137deg, rgba(255,179,147,0.15) 0%, rgba(171,213,250,0.15) 50%, rgba(18,166,180,0.15) 100%)'

export function SummaryPanel() {
  return (
    <aside className="rounded-[24px] border border-surface-border bg-white/80 p-5 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.04)]">
      <h2 className="text-[18px] text-ink">Summary</h2>

      <div
        className="mt-4 flex flex-col gap-4 rounded-[16px] border border-surface-border p-3.5"
        style={{ backgroundImage: GRADIENT }}
      >
        {SUMMARY_VARIANTS.map((v) => (
          <div key={v.badge} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: v.badgeColor }}
              >
                {v.badge}
              </span>
              <span className="text-[12px] font-medium text-ink">{v.title}</span>
            </div>
            <p className="text-[12px] leading-[17px] text-[#162040]">
              {v.body}{' '}
              <button type="button" className="font-semibold text-[#01567a] underline">
                View version
              </button>
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[14px] text-ink">Recommendations</p>
      <div className="mt-2 rounded-[16px] border border-[#ffb393] p-3.5">
        <p className="text-[13px] font-semibold text-ink">{RECOMMENDATION.title}</p>
        <p className="mt-1.5 text-[12px] leading-[17px] text-[#162040]">{RECOMMENDATION.body}</p>
        <button
          type="button"
          className="mt-3 rounded-full border border-[#9c9a99] px-3 py-1 text-[11px] font-semibold text-ink"
        >
          Apply
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/SummaryPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit`
```bash
git add src/features/experiments/setup/SummaryPanel.tsx src/features/experiments/setup/SummaryPanel.test.tsx
git commit -m "feat(experiments): add SummaryPanel for Setup screen

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: ExperimentSetupScreen shell

**Files:**
- Create: `src/features/experiments/setup/ExperimentSetupScreen.tsx`
- Test: `src/features/experiments/setup/ExperimentSetupScreen.test.tsx`

**Interfaces:**
- Consumes: `SETUP_VARIANTS`, `WINNER_METRICS`, `CHANNEL_OPTIONS`, `TIME_ZONE`, `DEFAULT_TEST_NAME`, `DEFAULT_TEST_DESCRIPTION` from `../experiments-data`; `SetupSection`, `VariantRow`, `SummaryPanel`, `TextField`, `TextArea`, `SelectField` from siblings; `useNavigate` from `react-router`.
- Produces:
  - `function ExperimentSetupScreen()` (default-open sections; `data-testid="screen-experiment-setup"`)

**Notes for implementer:**
- Must be rendered inside a router in tests (uses `useNavigate`). Use `createMemoryRouter`.
- Editing the Test name field updates the top-bar title (single `name` state drives both).
- End condition is a local `'fixed' | 'count'` toggle, default `'fixed'`.
- Icons: use lucide `FlaskConical` (A/B Test detail), `Users` (Agent and variants), `Trophy` (Winner & Test end), `ArrowLeft`, `MoreHorizontal`, `Plus`, `Timer`, `MessageSquare`, `Calendar`. (Any close lucide glyph is fine — these are decorative.)

- [ ] **Step 1: Write the failing test** — `ExperimentSetupScreen.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ExperimentSetupScreen } from './ExperimentSetupScreen'

function renderScreen() {
  const router = createMemoryRouter(
    [{ path: '/experiments/new', element: <ExperimentSetupScreen /> }],
    { initialEntries: ['/experiments/new'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('ExperimentSetupScreen', () => {
  it('renders the shell: tabs, section titles, and Run action', () => {
    renderScreen()
    const el = screen.getByTestId('screen-experiment-setup')
    expect(within(el).getByText('Setup')).toBeInTheDocument()
    expect(within(el).getByText('Results')).toBeInTheDocument()
    expect(within(el).getByText('Agents')).toBeInTheDocument()
    expect(within(el).getByText('Conversations')).toBeInTheDocument()
    expect(within(el).getByText('A/B Test detail')).toBeInTheDocument()
    expect(within(el).getByText('Agent and variants')).toBeInTheDocument()
    expect(within(el).getByText('Winner & Test end')).toBeInTheDocument()
    expect(within(el).getByRole('button', { name: 'Run A/B Test' })).toBeInTheDocument()
  })

  it('reflects the Test name in the top-bar title', () => {
    renderScreen()
    const el = screen.getByTestId('screen-experiment-setup')
    const input = within(el).getByDisplayValue('Login fix method comparison')
    fireEvent.change(input, { target: { value: 'My new test' } })
    // top-bar title node also shows the new name
    expect(within(el).getAllByText('My new test').length).toBeGreaterThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/ExperimentSetupScreen.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `ExperimentSetupScreen.tsx`:

```tsx
// Full-page A/B Test Setup screen (route /experiments/new). Presentational:
// controlled local inputs, every action navigates back to /experiments.
// Mirrors AutomationDetailScreen's shell (rounded card + top bar + body).
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  MoreHorizontal,
  FlaskConical,
  Users,
  Trophy,
  Plus,
  Timer,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import {
  SETUP_VARIANTS,
  WINNER_METRICS,
  TIME_ZONE,
  DEFAULT_TEST_NAME,
  DEFAULT_TEST_DESCRIPTION,
} from '../experiments-data'
import { SetupSection } from './SetupSection'
import { VariantRow } from './VariantRow'
import { SummaryPanel } from './SummaryPanel'
import { TextField, TextArea, SelectField } from './Field'

const TABS = ['Setup', 'Results', 'Agents', 'Conversations']

export function ExperimentSetupScreen() {
  const navigate = useNavigate()
  const back = () => navigate('/experiments')

  const [name, setName] = useState(DEFAULT_TEST_NAME)
  const [description, setDescription] = useState(DEFAULT_TEST_DESCRIPTION)
  const [endCondition, setEndCondition] = useState<'fixed' | 'count'>('fixed')

  return (
    <div
      data-testid="screen-experiment-setup"
      className="flex h-full flex-col overflow-hidden rounded-[26px] bg-white"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-surface-border px-6 py-3">
        <button type="button" aria-label="Back to Experiments" onClick={back}>
          <ArrowLeft size={18} className="text-ink" aria-hidden />
        </button>
        <span className="text-[15px] font-semibold text-ink">{name || DEFAULT_TEST_NAME}</span>
        <button type="button" aria-label="Test options">
          <MoreHorizontal size={18} className="text-ink-muted" aria-hidden />
        </button>

        <div role="tablist" className="mx-auto flex items-center gap-1 rounded-full bg-[#f5f6f7] p-1">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={t === 'Setup'}
              disabled={t !== 'Setup'}
              className={
                'rounded-full px-4 py-1.5 text-[14px] ' +
                (t === 'Setup' ? 'bg-white font-medium text-ink shadow-sm' : 'text-ink-muted')
              }
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={back}
          className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white"
        >
          Run A/B Test
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex gap-6 px-8 py-6">
          {/* Form column */}
          <div className="max-w-[620px] flex-1 divide-y divide-surface-border">
            <SetupSection
              icon={<FlaskConical size={16} aria-hidden />}
              title="A/B Test detail"
              subtitle="Define the test's purpose and context."
            >
              <TextField label="Test name" value={name} onChange={setName} />
              <TextArea label="Description" value={description} onChange={setDescription} />
              <SelectField label="Channel" value="Widget" muted />
            </SetupSection>

            <SetupSection
              icon={<Users size={16} aria-hidden />}
              title="Agent and variants"
              subtitle="Set up your control and test variants."
            >
              {/* Total traffic + static slider */}
              <div className="flex items-end gap-4">
                <div className="w-[110px]">
                  <span className="block text-[12px] font-medium text-ink">Total Traffic</span>
                  <div className="mt-1.5 flex items-center justify-between rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px] text-ink">
                    <span>100</span>
                    <span className="text-ink-muted">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative h-[3px] rounded-full bg-[#9abaca]">
                    <div className="absolute inset-y-0 left-0 w-full rounded-full bg-[#01567a]" />
                    <div className="absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-[#01567a] bg-white" />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[12px] text-ink-muted">
                    <span>0 %</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {SETUP_VARIANTS.map((v) => (
                <VariantRow key={v.key} variant={v} />
              ))}

              <button
                type="button"
                className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#ebf5f7] px-3.5 py-1.5 text-[12px] font-semibold text-[#193d50]"
              >
                <Plus size={14} aria-hidden />
                Add variant
              </button>
            </SetupSection>

            <SetupSection
              icon={<Trophy size={16} aria-hidden />}
              title="Winner & Test end"
              subtitle="Define how success is measured and when the test ends."
            >
              <SelectField label="Choose the metric used to determine the winner" value="" muted />
              <div className="flex gap-2">
                {WINNER_METRICS.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-[#d2d9e5] bg-[#f2f4f7] px-2.5 py-1 text-[12px] text-ink"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="w-[100px] text-[12px] font-medium text-ink">Time zone</span>
                <div className="flex-1">
                  <SelectField value={TIME_ZONE} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-[100px] text-[12px] font-medium text-ink">End condition</span>
                <div className="flex flex-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setEndCondition('fixed')}
                    className={
                      'flex flex-1 items-center justify-center gap-1.5 rounded-[20px] border px-3.5 py-2 text-[12px] ' +
                      (endCondition === 'fixed'
                        ? 'border-[#01567a] bg-[#ebf5f7] text-ink'
                        : 'border-[#bcbdc5] text-ink-muted')
                    }
                  >
                    <Timer size={16} aria-hidden />
                    Fixed duration
                  </button>
                  <button
                    type="button"
                    onClick={() => setEndCondition('count')}
                    className={
                      'flex flex-1 items-center justify-center gap-1.5 rounded-[20px] border px-3.5 py-2 text-[12px] ' +
                      (endCondition === 'count'
                        ? 'border-[#01567a] bg-[#ebf5f7] text-ink'
                        : 'border-[#bcbdc5] text-ink-muted')
                    }
                  >
                    <MessageSquare size={16} aria-hidden />
                    Conversation count
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-[100px] text-[12px] font-medium text-ink">Start date</span>
                <div className="flex flex-1 gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px] text-ink">
                    <Calendar size={16} className="text-ink-muted" aria-hidden />
                    Sep 25, 2025
                  </div>
                  <div className="flex-1">
                    <SelectField value="6:00 AM" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-[100px] text-[12px] font-medium text-ink">End date</span>
                <div className="flex flex-1 gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px] text-ink">
                    <Calendar size={16} className="text-ink-muted" aria-hidden />
                    Oct 23, 2025
                  </div>
                  <div className="flex-1">
                    <SelectField value="12:00 AM" />
                  </div>
                </div>
              </div>
            </SetupSection>
          </div>

          {/* Summary column */}
          <div className="w-[360px] shrink-0">
            <SummaryPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/setup/ExperimentSetupScreen.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit`
```bash
git add src/features/experiments/setup/ExperimentSetupScreen.tsx src/features/experiments/setup/ExperimentSetupScreen.test.tsx
git commit -m "feat(experiments): add A/B Test Setup screen shell

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Route + wire "Create new"

**Files:**
- Modify: `src/routes.tsx`
- Modify: `src/features/experiments/ExperimentsScreen.tsx`
- Modify: `src/features/experiments/experiments.routes.test.tsx` (append cases)

**Interfaces:**
- Consumes: `ExperimentSetupScreen` from `@/features/experiments/setup/ExperimentSetupScreen`.
- Produces: route `/experiments/new`; wired "Create new" button.

- [ ] **Step 1: Write the failing test** — append to `experiments.routes.test.tsx`:

```tsx
import { fireEvent } from '@testing-library/react'

describe('A/B Test Setup routing', () => {
  it('renders the Setup screen at /experiments/new', () => {
    renderAt('/experiments/new')
    expect(screen.getByTestId('screen-experiment-setup')).toBeInTheDocument()
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('navigates from Create new to the Setup screen', () => {
    renderAt('/experiments')
    fireEvent.click(screen.getByRole('button', { name: 'Create new' }))
    expect(screen.getByTestId('screen-experiment-setup')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/experiments.routes.test.tsx`
Expected: FAIL (route not found / button inert).

- [ ] **Step 3a: Wire routes.tsx**

Add the import near the other feature imports:
```tsx
import { ExperimentSetupScreen } from '@/features/experiments/setup/ExperimentSetupScreen'
```
Add `'/experiments/new'` to the `BUILT` set:
```tsx
const BUILT = new Set(['/', '/insights', '/organization', '/ai-agents', '/orchestrator', '/tools', '/log', '/experiments', '/experiments/new'])
```
Add the route immediately after the existing `{ path: 'experiments', element: <ExperimentsScreen /> }` line:
```tsx
          { path: 'experiments/new', element: <ExperimentSetupScreen /> },
```

- [ ] **Step 3b: Wire ExperimentsScreen.tsx**

Add the import:
```tsx
import { useNavigate } from 'react-router'
```
Inside the component, add `const navigate = useNavigate()` at the top of the function body, and change the "Create new" button to:
```tsx
          <button type="button" onClick={() => navigate('/experiments/new')} className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white">
            Create new
          </button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --exclude '**/.claude/**' src/features/experiments/experiments.routes.test.tsx`
Expected: PASS.

- [ ] **Step 5: Full gate + commit**

Run: `npx tsc --noEmit` (clean)
Run: `npx vitest run --exclude '**/.claude/**'` (all pass)
```bash
git add src/routes.tsx src/features/experiments/ExperimentsScreen.tsx src/features/experiments/experiments.routes.test.tsx
git commit -m "feat(experiments): wire Create new to A/B Test Setup route

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (done during planning)

- **Spec coverage:** route + entry (T7), Setup form sections (T6), fields (T2), section wrapper (T3), variants (T4), summary panel (T5), data (T1). All spec sections covered.
- **Placeholder scan:** none — every step has concrete code.
- **Type consistency:** `SetupVariant` / `SummaryVariant` / `Recommendation` and all const names are consistent across T1 (defined) and T4/T5/T6 (consumed). `SelectField`/`TextField`/`TextArea` signatures match between T2 (defined) and T6 (used). `ExperimentSetupScreen` name consistent T6↔T7.
- **JSX.Element guard:** Global Constraints explicitly forbid return-type annotations (the defect from the previous Experiments build).
