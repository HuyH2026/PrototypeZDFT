import { useState } from 'react'
import {
  Beaker,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  SlidersVertical,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/flora/Button'
import type { TestCaseDraft } from './CreateTestCaseFlow'

const PREVIEW_MESSAGES = [
  {
    from: 'agent',
    text: 'Hi there! Thanks for reaching out to Support Center. I see you’re on our Standard plan — how can I help today?',
  },
  {
    from: 'user',
    text: 'I downgraded my plan last week and now some features I used are missing. I don’t get why.',
  },
  {
    from: 'agent',
    text: 'That’s frustrating, especially if you weren’t expecting it. Let me pull up what changed.',
  },
  {
    from: 'agent',
    text: 'Your previous plan (Pro) included priority support, advanced analytics, and unlimited exports. Your current plan (Standard) covers the core features but not those three.',
  },
  {
    from: 'user',
    text: 'Ok, that explains it. Is it worth upgrading back?',
  },
  {
    from: 'agent',
    text: 'If advanced analytics or unlimited exports matter to your workflow, upgrading back to Pro would restore them. Here’s a quick side-by-side, and pricing if you’d like to compare — want me to walk you through it, or go ahead and upgrade now?',
  },
] as const

function Preview({ draft, onClose }: { draft: TestCaseDraft; onClose: () => void }) {
  return (
    <div
      data-testid="test-case-preview"
      className="fixed inset-0 z-[80] overflow-y-auto bg-[radial-gradient(circle_at_20%_100%,#22594f_0,#102735_38%,#0b1c2b_100%)] p-5 text-white"
    >
      <header className="flex h-14 items-center rounded-[18px] border border-white/15 bg-[#102231]/90 px-5">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#397b9a]">
          <Beaker size={17} aria-hidden />
        </span>
        <h1 className="ml-3 text-[18px] font-semibold">Preview</h1>
        <Button className="ml-auto bg-white text-ink" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>

      <div className="mx-auto mt-5 grid min-h-[calc(100vh-116px)] max-w-[1100px] grid-cols-[0.9fr_1.1fr] items-stretch gap-8">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-[16px] bg-white text-ink shadow-2xl">
          <div className="shrink-0 bg-black px-5 py-4 text-[13px] text-white">
            <span className="mr-3 text-[10px]">Uber</span> Uber Rider Support
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 p-5">
            {PREVIEW_MESSAGES.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-[18px] px-4 py-3 text-[12px] leading-[17px] ${
                    message.from === 'user' ? 'bg-[#171717] text-white' : 'bg-[#f0f1f5] text-ink'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="h-full rounded-[20px] bg-[#162536]/90 p-5 shadow-2xl">
          <div className="flex items-center text-[13px] font-semibold">
            Test Case Run: Apr 12, 2024, 11:25 AM
            <span className="ml-auto flex items-center gap-2 text-grey-400">
              <ChevronLeft size={17} aria-hidden /> 1 of 3 <ChevronRight size={17} aria-hidden />
            </span>
          </div>
          <div className="mt-5 rounded-[14px] bg-white/10 p-4">
            <div className="flex items-center">
              <h2 className="text-[16px] font-semibold">{draft.name}</h2>
              <span className="ml-auto rounded-full bg-[#3c948a] px-2 py-0.5 text-[11px]">
                Passed
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-[18px] text-grey-300">
              The bot identified the downgrade-related feature gap, explained the difference with
              empathy, and offered a comparison before asking the customer to decide.
            </p>
          </div>
          <div className="my-4 h-px bg-white/15" />
          <div className="rounded-[14px] bg-[#23605f] p-4 text-[12px] leading-[18px]">
            <p className="font-semibold">Reasoning Summary</p>
            <p className="mt-1">
              The user expressed confusion and mild frustration about missing features after a plan
              downgrade. The bot correctly identified the intent, retrieved plan history, explained
              the feature differences, and acknowledged the frustration before presenting facts.
            </p>
          </div>
          <div className="mt-4 whitespace-pre-wrap font-mono text-[12px] leading-[19px] text-[#d8e0ee]">
            <span className="text-grey-400">User Input:</span> I downgraded my plan last week and
            now some features I used are missing.
            {'\n\n'}
            <span className="text-grey-400">Bot Thinking:</span>
            {'\n'}✅ <strong>Scenario:</strong> The conversation followed the expected flow — the
            bot identified the plan downgrade, explained which features changed, acknowledged the
            customer’s frustration, and offered a comparison before asking the customer to decide.
            {'\n'}✅ <strong>Agent identifies downgrade-related intent:</strong> The assistant
            correctly classified the message as downgrade clarification with 0.89 confidence, well
            above threshold, with no competing intent close enough to cause ambiguity.
            {'\n'}✅ <strong>Agent acknowledges customer frustration:</strong> The assistant
            recognized the customer’s confusion and responded with empathy before presenting any
            facts.
            {'\n'}✅ <strong>Agent explains specific feature differences:</strong> The assistant
            clearly compared the Pro and Standard plans and offered a useful next step.
          </div>
        </section>
      </div>
    </div>
  )
}

export function TestCaseEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: TestCaseDraft
  onCancel: () => void
  onSave: (draft: TestCaseDraft) => void
}) {
  const [draft, setDraft] = useState(initial)
  const [preview, setPreview] = useState(false)

  if (preview) return <Preview draft={draft} onClose={() => setPreview(false)} />

  return (
    <div
      data-testid="test-case-editor"
      className="h-full overflow-y-auto rounded-[26px] bg-app-backdrop p-3"
    >
      <header className="sticky top-0 z-10 flex h-14 items-center rounded-[20px] border border-grey-300 bg-white px-5">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#397b9a] text-white">
          <Beaker size={17} aria-hidden />
        </span>
        <span className="ml-3 text-[18px] font-semibold text-ink">Test</span>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-ink">
          {draft.name}
        </h1>
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => setPreview(true)}>
            Preview
          </Button>
          <Button size="sm" variant="primary" onClick={() => onSave(draft)}>
            Save
          </Button>
        </div>
      </header>

      <main className="mt-3 min-h-[calc(100%-68px)] rounded-[24px] border border-grey-300 bg-white px-8 py-8">
        <div className="mx-auto max-w-[650px] space-y-7">
          <section>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#397b9a]" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Test name</h2>
            </div>
            <p className="mt-1 text-[11px] text-grey-700">
              A clear and concise title for the test — helps quickly identify what the test covers.
            </p>
            <input
              aria-label="Editor test name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="mt-3 h-9 w-full rounded-full border border-grey-400 px-3 text-[13px] outline-none focus:border-flora-blue"
            />
          </section>

          <section>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#c738d8]" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Use Cases</h2>
            </div>
            <p className="mt-1 text-[11px] text-grey-700">Select channels and use cases to test.</p>
            <label className="mt-3 block text-[12px] font-medium text-ink">
              Channels
              {/* `text-[12px]` is not inherited from the label: theme.css's base layer
                  sizes a bare `button` at 16px, which beats the inherited value. Same
                  size as this control's twin in CreateTestCaseFlow. */}
              <button
                type="button"
                className="mt-2 flex h-9 w-full items-center justify-between rounded-full border border-grey-400 px-3 text-[12px] font-normal"
              >
                <span className="rounded-full bg-grey-100 px-2 py-0.5">🟠 {draft.channel}</span>
                <ChevronDown size={15} aria-hidden />
              </button>
            </label>
            <label className="mt-3 block text-[12px] font-medium text-ink">
              Use Cases
              <button
                type="button"
                className="mt-2 flex h-9 w-full items-center justify-between rounded-full border border-grey-400 px-3 text-[12px] font-normal"
              >
                <span className="rounded-full bg-grey-100 px-2 py-0.5 text-grey-700">
                  ● {draft.useCase}
                </span>
                <ChevronDown size={15} aria-hidden />
              </button>
            </label>
          </section>

          <section>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <WandSparkles size={16} className="text-[#b04e63]" aria-hidden />
                <h2 className="text-[15px] font-semibold text-ink">Scenario</h2>
              </div>
              <button
                type="button"
                className="ml-auto flex h-8 items-center gap-2 rounded-full bg-[#397b9a] px-4 text-[12px] text-white"
              >
                <Sparkles size={14} aria-hidden /> Generate
              </button>
            </div>
            <p className="mt-1 text-[11px] leading-[16px] text-grey-700">
              A real-world scenario that defines the user’s goal and AI behavior to validate. Use
              Generate to pick from suggested scenarios and get started quickly.
            </p>
            <textarea
              aria-label="Scenario"
              value={draft.scenario}
              onChange={(event) => setDraft({ ...draft, scenario: event.target.value })}
              className="mt-3 min-h-[175px] w-full resize-none rounded-[14px] border border-grey-400 p-3 text-[13px] leading-[19px] outline-none focus:border-flora-blue"
            />
          </section>

          <section className="pb-10">
            <div className="flex items-center gap-2">
              <SlidersVertical size={16} className="text-[#566cb1]" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Fill in pre-defined Context</h2>
            </div>
            <p className="mt-1 text-[11px] text-grey-700">
              What needs to be true before the test starts — fill in pre-defined key variables that
              the AI relies on to run the test correctly.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-[12px] font-medium text-ink">
                Context variable
                <input
                  value="Current plan"
                  readOnly
                  className="mt-2 h-9 w-full rounded-full border border-grey-400 px-3 text-[13px] font-normal"
                />
              </label>
              <label className="text-[12px] font-medium text-ink">
                Value
                <input
                  value="Standard"
                  readOnly
                  className="mt-2 h-9 w-full rounded-full border border-grey-400 px-3 text-[13px] font-normal"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-grey-100 p-3 text-[12px] text-grey-700">
              <Zap size={15} aria-hidden /> Actions and assertions are evaluated automatically
              during preview.
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
