import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  CircleCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/flora/Button'

export type TestCaseDraft = {
  name: string
  channel: string
  useCase: string
  scenario: string
}

export type GeneratedCase = {
  id: string
  eyebrow: string
  name: string
  scenario: string
  assertion?: string
}

const USE_CASES = [
  { name: 'Use case A', workflow: 'Workflow - Classic', status: 'Published' },
  { name: 'Use case B', workflow: 'Workflow - Classic', status: 'Draft' },
  { name: 'Use case C', workflow: 'Workflow - Autoflow', status: 'Published' },
  { name: 'Use case D', workflow: 'Workflow - Autoflow', status: 'Draft' },
  { name: 'Use case E', workflow: 'Workflow - Classic', status: 'Published' },
  { name: 'Use case F', workflow: 'Workflow - Autoflow', status: 'Draft' },
] as const

const GENERATED_CASES: GeneratedCase[] = [
  {
    id: 'generated-2',
    eyebrow: 'Test Case 02',
    name: 'Trial expired',
    scenario:
      'A customer’s free trial ended and they lost access to features. They want to understand what changed and whether upgrading will restore access.',
    assertion:
      'Identifies the customer’s current plan. Explains which features are no longer available and why.',
  },
  {
    id: 'generated-3',
    eyebrow: 'Test Case 03',
    name: 'Upgrade to unlock a feature',
    scenario:
      'A customer says a feature is locked, such as integrations, analytics, exports, and asks which plan they need to upgrade to.',
  },
]

function ModalShell({
  label,
  children,
  onClose,
}: {
  label: string
  children: React.ReactNode
  onClose?: () => void
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-[10px] backdrop-blur-[1px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative flex h-full w-[628px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-[24px] border border-grey-300 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.22)]"
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create test case"
            className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-grey-300 bg-white text-ink shadow-sm"
          >
            <X size={19} aria-hidden />
          </button>
        ) : null}
        {children}
      </section>
    </div>
  )
}

function UseCasePicker({
  selected,
  onApply,
  onCancel,
}: {
  selected: string
  onApply: (value: string) => void
  onCancel: () => void
}) {
  const [candidate, setCandidate] = useState(selected || 'Use case C')

  return (
    <ModalShell label="Select use cases">
      <div className="flex h-full min-h-0 flex-col p-6">
        <h2 className="text-[18px] font-semibold text-ink">Select use cases</h2>
        <div className="mt-4 flex gap-3">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-full bg-grey-100 px-4">
            <Search size={15} className="text-ink-muted" aria-hidden />
            <input
              aria-label="Search use cases"
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            />
          </label>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-full border border-grey-300 px-3 text-[12px]"
          >
            <SlidersHorizontal size={14} aria-hidden /> All <ChevronDown size={13} aria-hidden />
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {USE_CASES.map((item) => {
            const active = candidate === item.name
            return (
              <button
                key={item.name}
                type="button"
                aria-pressed={active}
                onClick={() => setCandidate(item.name)}
                className={`flex w-full items-center gap-3 rounded-[16px] border p-3 text-left ${
                  active ? 'border-ink' : 'border-grey-300'
                }`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#c738d8] text-white">
                  <Sparkles size={15} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-ink">{item.name}</span>
                  <span className="mt-1 inline-flex rounded-full bg-grey-100 px-2 py-0.5 text-[11px] text-grey-700">
                    {item.workflow}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] text-white ${
                    item.status === 'Published' ? 'bg-[#3c948a]' : 'bg-[#9194a0]'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-[12px] font-medium text-ink">Quick view</span>
                <span
                  className={`flex size-4 items-center justify-center rounded-full border ${
                    active ? 'border-[#3c948a] bg-[#3c948a] text-white' : 'border-grey-300'
                  }`}
                  aria-hidden
                >
                  {active ? <Check size={11} /> : null}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex gap-2 border-t border-grey-300 pt-4">
          <Button size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" className="flex-1" onClick={() => onApply(candidate)}>
            Apply
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}

function GeneratedCases({
  onCancel,
  onCreate,
}: {
  onCancel: () => void
  onCreate: (cases: GeneratedCase[]) => void
}) {
  const [selected, setSelected] = useState(() => new Set(GENERATED_CASES.map((item) => item.id)))
  const chosen = GENERATED_CASES.filter((item) => selected.has(item.id))

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <ModalShell label="Generated test cases">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-2 border-b border-grey-300 px-6 py-4">
          <WandSparkles size={18} className="text-[#397b9a]" aria-hidden />
          <h2 className="text-[14px] font-semibold text-ink">Generated test cases</h2>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-6 py-3">
          {GENERATED_CASES.map((item) => {
            const active = selected.has(item.id)
            return (
              <button
                type="button"
                key={item.id}
                aria-pressed={active}
                onClick={() => toggle(item.id)}
                className={`w-full rounded-[16px] border p-4 text-left ${active ? 'border-ink' : 'border-grey-300'}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[12px] text-grey-700">{item.eyebrow}</span>
                  <CircleCheck
                    size={18}
                    className={active ? 'text-[#3c948a]' : 'text-grey-400'}
                    aria-hidden
                  />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold text-ink">{item.name}</h3>
                <p className="mt-1 text-[13px] leading-[18px] text-ink">{item.scenario}</p>
                {item.assertion ? (
                  <>
                    <p className="mt-4 text-[11px] text-grey-700">AI Assertion</p>
                    <p className="mt-1 text-[12px] leading-[17px] text-ink">{item.assertion}</p>
                  </>
                ) : null}
                <p className="mt-4 text-[11px] text-grey-700">Action triggered</p>
                <div className="mt-1 flex gap-1.5">
                  <span className="rounded-full bg-grey-100 px-2 py-1 text-[11px] text-grey-700">
                    ✦ Action name 01
                  </span>
                  <span className="rounded-full bg-grey-100 px-2 py-1 text-[11px] text-grey-700">
                    ✦ Action name 02
                  </span>
                </div>
                <p className="mt-4 text-[11px] text-grey-700">Context Variable verified</p>
                <p className="mt-1 text-[11px] text-ink">#CV name&nbsp;&nbsp; CV value</p>
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 border-t border-grey-300 px-6 py-4">
          <Button size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
            disabled={chosen.length === 0}
            onClick={() => onCreate(chosen)}
          >
            Create Test Cases ({chosen.length})
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}

function Generating({ onCancel }: { onCancel: () => void }) {
  return (
    <ModalShell label="Generating test cases">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-2 border-b border-grey-300 px-6 py-4">
          <WandSparkles size={18} className="text-[#397b9a]" aria-hidden />
          <h2 className="text-[14px] font-semibold text-ink">Generated test cases</h2>
        </div>
        <div className="space-y-5 px-6 py-5" aria-label="Generating test cases">
          {[92, 70, 85, 92, 70, 85].map((width, index) => (
            <div
              key={index}
              className="h-3 animate-pulse rounded-full bg-grey-200"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-grey-300 px-6 py-4 text-[12px]">
          <span className="text-[#397b9a]">Generating test cases…</span>
          <button type="button" className="font-medium text-ink" onClick={onCancel}>
            Cancel to create my own
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export function CreateTestCaseFlow({
  onClose,
  onManualCreate,
}: {
  onClose: () => void
  onManualCreate: (draft: TestCaseDraft) => void
}) {
  const [stage, setStage] = useState<'form' | 'picker' | 'generating' | 'generated'>('form')
  const [name, setName] = useState('Plan upgrade')
  const [useCase, setUseCase] = useState('')

  useEffect(() => {
    if (stage !== 'generating') return
    const timer = window.setTimeout(() => setStage('generated'), 650)
    return () => window.clearTimeout(timer)
  }, [stage])

  const draft: TestCaseDraft = {
    name,
    channel: 'Widget',
    useCase,
    scenario:
      'A customer recently downgraded their plan and is frustrated because some features no longer work as expected.',
  }

  if (stage === 'picker') {
    return (
      <UseCasePicker
        selected={useCase}
        onCancel={() => setStage('form')}
        onApply={(value) => {
          setUseCase(value)
          setStage('form')
        }}
      />
    )
  }
  if (stage === 'generating') return <Generating onCancel={() => setStage('form')} />
  if (stage === 'generated') {
    return (
      <GeneratedCases
        onCancel={() => setStage('form')}
        onCreate={() => onManualCreate(draft)}
      />
    )
  }

  const ready = name.trim().length > 0 && useCase.length > 0

  return (
    <ModalShell label="Create Test Case" onClose={onClose}>
      <div className="flex h-full min-h-0 flex-col px-8 py-8">
        <h2 className="pr-12 text-[20px] font-semibold text-ink">Create Test Case</h2>
        <p className="mt-5 text-[12px] leading-[17px] text-ink">
          Validate your Use Case before and after it goes live.
          <br />
          Generate test cases to build coverage quickly, or create your own from scratch.
        </p>
        <div className="mt-4 border-t border-grey-300 pt-4">
          <h3 className="text-[15px] font-semibold text-ink">📝 Test name</h3>
          <p className="mt-1 text-[11px] text-grey-700">
            A clear and concise title for the test — helps quickly identify what the test covers.
          </p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Test name"
            className="mt-3 h-9 w-full rounded-full border border-grey-400 px-3 text-[13px] outline-none focus:border-flora-blue"
          />
        </div>

        <div className="mt-5">
          <h3 className="text-[15px] font-semibold text-ink">💜 Use Cases</h3>
          <p className="mt-1 text-[11px] text-grey-700">Select channels and use cases to test.</p>
          <label className="mt-3 block text-[12px] font-medium text-ink">
            Channels
            <button
              type="button"
              className="mt-2 flex h-9 w-full items-center justify-between rounded-full border border-grey-400 px-3 text-[12px] font-normal"
            >
              <span className="rounded-full bg-grey-100 px-2 py-0.5">🟠 Widget</span>
              <ChevronDown size={15} aria-hidden />
            </button>
          </label>
          <label className="mt-3 block text-[12px] font-medium text-ink">
            Use Cases
            <button
              type="button"
              role="combobox"
              aria-label="Use Cases"
              aria-expanded={false}
              onClick={() => setStage('picker')}
              className="mt-2 flex h-9 w-full items-center justify-between rounded-full border border-grey-400 px-3 text-[12px] font-normal"
            >
              {useCase ? (
                <span className="rounded-full bg-grey-100 px-2 py-0.5 text-grey-700">
                  ● {useCase}
                </span>
              ) : (
                <span className="text-grey-600">Select Use Case</span>
              )}
              <ChevronDown size={15} aria-hidden />
            </button>
          </label>
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            disabled={!ready}
            onClick={() => setStage('generating')}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f7695] to-[#7fc5df] text-[12px] font-semibold text-white disabled:opacity-35"
          >
            <WandSparkles size={15} aria-hidden /> Generate Test Cases
          </button>
          <Button
            size="sm"
            variant="primary"
            className="w-full"
            disabled={!ready}
            onClick={() => onManualCreate(draft)}
          >
            Create Test Cases
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
