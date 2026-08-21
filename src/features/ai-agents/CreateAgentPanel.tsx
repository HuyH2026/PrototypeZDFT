// Right-hand creation drawer for a new use case. The form follows the Explore
// Unification frame while keeping the existing create → editor handoff.
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import type { CallDirection, ChannelKey } from './agent-builder-data'
import type { CreateAgentFields } from './agent-store'

// Prefilled example content, matching the seeded Service cancellation use case.
// The trigger phrase is one word on purpose: phrases are matched as plain
// substrings (see preview-data.ts), so 'cancel' catches the sentences a real
// customer types where 'cancel my subscription' only catches itself.
const INITIAL_FORM = {
  allSegments: true,
  tags: ['Riders', 'One members'],
  name: '💔 Service cancellation',
  customerRequest:
    'Handle service or subscription cancellations. Guide the user through the process, follow company rules, and attempt retention only when appropriate by offering options like pausing, downgrading, or resolving issues. No unnecessary persuasion.',
  triggerPhrases: ['cancel'],
} satisfies Omit<CreateAgentFields, 'channel'>

// The call channels' frame (Explore-Voice-Unification 146:169720) seeds its own
// example: targeting off with four segment tags, a short "Add to cart" use
// case, and no trigger phrases yet.
const CALL_INITIAL_FORM = {
  allSegments: false,
  tags: ['Tag A', 'Tag B', 'Tag C', 'Tag D'],
  name: 'Add to cart',
  customerRequest: 'Guide user to add forgotten items to cart.',
  triggerPhrases: [],
} satisfies Omit<CreateAgentFields, 'channel'>

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function CreateAgentPanel({
  channel,
  direction,
  onClose,
  onCreate,
}: {
  channel: ChannelKey
  /** Voice only: which direction tab the drawer was opened from. */
  direction?: CallDirection
  onClose: () => void
  onCreate: (fields: CreateAgentFields) => void
}) {
  // Voice ▸ Outbound has its own pared-down drawer (frame 155:58932): a name,
  // an optional description, and a "Create subflow" action — no targeting or
  // trigger phrases, and its "Add to cart" is a placeholder, not a seed.
  const outbound = channel === 'voice' && direction === 'outbound'
  // Web Call creates the same way Voice does — same call, different earpiece.
  const initial =
    channel === 'voice' || channel === 'webcall'
      ? outbound
        ? { ...CALL_INITIAL_FORM, name: '', customerRequest: '' }
        : CALL_INITIAL_FORM
      : INITIAL_FORM
  const [allSegments, setAllSegments] = useState<boolean>(initial.allSegments)
  const [segments, setSegments] = useState<string[]>([...initial.tags])
  const [name, setName] = useState(initial.name)
  const [customerRequest, setCustomerRequest] = useState(initial.customerRequest)
  const [phrases, setPhrases] = useState<string[]>([...initial.triggerPhrases])
  const [draft, setDraft] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  // Keep the latest onClose without touching the ref during render.
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    closeButtonRef.current?.focus()

    const getFocusableElements = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (element) =>
          !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
      )

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      const focusableElements = getFocusableElements()
      const first = focusableElements[0]
      const last = focusableElements.at(-1)
      if (!dialog || !first || !last) return

      const focusIsOutside = !dialog.contains(document.activeElement)
      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (
        dialogRef.current &&
        event.target instanceof Node &&
        !dialogRef.current.contains(event.target)
      ) {
        closeButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [])

  const addPhrase = () => {
    const value = draft.trim()
    if (!value || phrases.includes(value)) return
    setPhrases((current) => [...current, value])
    setDraft('')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-[10px]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Create Use Case"
        aria-modal="true"
        className="relative flex h-full w-[480px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.20)]"
      >
        <div className="flex items-center justify-between px-10 pb-5 pt-5">
          <h1 className="text-[18px] leading-6 tracking-[-0.45px] text-ink">
            Create new Use Case
          </h1>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-lg text-ink transition-colors duration-instant ease-soft hover:bg-grey-100"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-6">
          {!outbound && (
          <section className="mb-5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={allSegments}
                aria-label="All-segment targeting"
                onClick={() => setAllSegments((value) => !value)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-instant ease-soft ${
                  allSegments ? 'bg-[#048c80]' : 'bg-[#8b8e89]'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] duration-instant ease-soft ${
                    allSegments ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>
              <span className="text-[14px] leading-5 text-ink">
                All-segment targeting is {allSegments ? 'on' : 'off'}.
              </span>
            </div>
          </section>
          )}

          {!outbound && !allSegments && (
            <section className="mb-5">
              <div id="use-case-segments-label" className="text-[14px] font-semibold text-ink">
                Segments
              </div>
              <p className="mb-2 mt-1 text-[12px] leading-4 text-ink-muted">
                Add tags to choose which customer segments this use case applies to. Without tags,
                it applies to all segments.
              </p>
              <div
                role="group"
                aria-labelledby="use-case-segments-label"
                className="flex min-h-[84px] flex-wrap content-start items-start gap-2 rounded-lg border border-[#b7b7b3] bg-white px-3 py-2.5"
              >
                {segments.map((segment) => (
                  <span
                    key={segment}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#eae9e8] px-2.5 py-1"
                  >
                    <GardenIcon name="tag-stroke" className="h-4 w-4 text-accent-blue" />
                    <span className="text-[12px] font-semibold leading-4 text-ink">{segment}</span>
                    <button
                      type="button"
                      aria-label={`Remove segment ${segment}`}
                      onClick={() =>
                        setSegments((current) => current.filter((item) => item !== segment))
                      }
                      className="text-ink"
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </span>
                ))}
                <ChevronDown size={20} className="ml-auto self-center text-ink" aria-hidden />
              </div>
            </section>
          )}

          <section className="mb-5">
            <label htmlFor="use-case-name" className="text-[14px] font-semibold text-ink">
              Use case name
            </label>
            <p className="mb-2 mt-1 text-[12px] leading-4 text-ink-muted">
              Use a clear, specific name that describes the customer&apos;s goal.
            </p>
            <input
              id="use-case-name"
              aria-label="Use case name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={outbound ? 'Add to cart' : undefined}
              className="h-10 w-full rounded-lg border border-[#b7b7b3] px-3 text-[14px] text-ink outline-none placeholder:text-grey-600 focus:border-blue-700"
            />
          </section>

          <section className="mb-5">
            <label htmlFor="customer-request" className="text-[14px] font-semibold text-ink">
              {outbound ? 'More information (optional)' : 'Customer request'}
            </label>
            <p className="mb-2 mt-1 text-[12px] leading-4 text-ink-muted">
              {outbound
                ? 'Briefly describe what you’d like this outbound call to achieve.'
                : 'Briefly describe the customer action or request that should trigger this use case.'}
            </p>
            <textarea
              id="customer-request"
              aria-label={outbound ? 'More information' : 'Customer request'}
              value={customerRequest}
              onChange={(event) => setCustomerRequest(event.target.value)}
              placeholder={
                outbound
                  ? 'Give a description to this outbound use case'
                  : 'e.g., The customer wants to cancel a service, subscription, or account.'
              }
              className="min-h-28 w-full resize-none rounded-lg border border-[#b7b7b3] px-3 py-3 text-[14px] leading-5 text-ink outline-none placeholder:text-grey-600 focus:border-blue-700"
            />
          </section>

          {!outbound && (
          <section>
            <label htmlFor="trigger-phrase" className="text-[14px] font-semibold text-ink">
              Trigger phrases (optional)
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="trigger-phrase"
                aria-label="Trigger phrases"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addPhrase()
                  }
                }}
                placeholder="Type a training phrase and press ‘Enter’"
                className="h-10 flex-1 rounded-lg border border-[#b7b7b3] px-3 text-[13px] text-ink outline-none placeholder:text-grey-600 focus:border-blue-700"
              />
              <button
                type="button"
                aria-label="Add trigger phrase"
                onClick={addPhrase}
                className="text-grey-600"
              >
                <Plus size={20} aria-hidden />
              </button>
            </div>
            {phrases.map((phrase, index) => (
              <div key={`${phrase}-${index}`} className="mt-2 flex items-center gap-3">
                <input
                  aria-label={`Trigger phrase ${index + 1}`}
                  value={phrase}
                  onChange={(event) =>
                    setPhrases((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  className="h-10 flex-1 rounded-lg border border-[#b7b7b3] px-3 text-[14px] text-ink outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  aria-label={`Remove trigger phrase ${index + 1}`}
                  onClick={() =>
                    setPhrases((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }
                  className="text-ink-muted"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            ))}
          </section>
          )}
        </div>

        <div className="border-t border-[#eae9e8] px-10 py-5">
          <button
            type="button"
            disabled={name.trim().length === 0}
            onClick={() =>
              onCreate({
                name: name.trim(),
                channel,
                // Outbound's drawer has no targeting UI: the subflow starts
                // unscoped, and the frame's button names what it creates.
                allSegments: outbound ? true : allSegments,
                tags: outbound || allSegments ? [] : segments,
                customerRequest,
                triggerPhrases: outbound
                  ? []
                  : phrases.filter((phrase) => phrase.trim().length > 0),
                ...(outbound && {
                  callDirection: 'outbound' as const,
                  isSubflow: true,
                  type: 'Subflow',
                }),
              })
            }
            className="h-10 w-full rounded-lg bg-ink px-4 text-[14px] font-semibold text-white transition-colors duration-instant ease-soft hover:bg-black disabled:cursor-not-allowed disabled:bg-grey-200 disabled:text-grey-700"
          >
            {outbound ? 'Create subflow' : 'Create Use Case'}
          </button>
        </div>
      </div>
    </div>
  )
}
