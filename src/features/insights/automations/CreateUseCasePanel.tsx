// Right slide-over for a clicked Use case gaps row. Header (title + topic chip
// + close), secondary tabs (Overview / Generated policy / Ticket source), a
// scrollable body, and a sticky footer. Selection of similar-topic rows
// (Overview) remains owned by this panel, and opens with the first
// row checked as the design shows. Closes on X, scrim click, and Escape.
// Presentational — footer actions are no-ops.
import { useEffect, useRef, useState } from 'react'
import { X, Zap, ChevronDown } from 'lucide-react'
import { USE_CASE_DETAILS } from './automation-insights-data'
import { CreateUseCaseTab } from './CreateUseCaseTab'
import { GeneratedUseCaseTab } from './GeneratedUseCaseTab'
import { TicketSourcesTab } from './TicketSourcesTab'

type PanelTab = 'Overview' | 'Generated policy' | 'Ticket source'
const TABS: PanelTab[] = ['Overview', 'Generated policy', 'Ticket source']
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function CreateUseCasePanel({
  topic,
  opener,
  onClose,
}: {
  topic: string
  opener: HTMLTableRowElement | null
  onClose: () => void
}) {
  const detail = USE_CASE_DETAILS[topic]
  const [tab, setTab] = useState<PanelTab>('Overview')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set([0]))
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    closeButtonRef.current?.focus()

    const getFocusableElements = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        ) ?? [],
      ).filter(
        (element) =>
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true',
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
      if (
        event.shiftKey &&
        (document.activeElement === first || focusIsOutside)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || focusIsOutside)
      ) {
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
      if (opener?.isConnected) opener.focus()
    }
  }, [opener])

  const toggleRow = (i: number) =>
    setSelectedRows((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(i)) nextSet.delete(i)
      else nextSet.add(i)
      return nextSet
    })

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-[10px]">
      <div
        data-testid="create-use-case-scrim"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Create use case"
        aria-modal="true"
        className="relative flex h-full w-[628px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.20)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-6">
          <p className="text-[22px] text-black">Create use case</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2 py-1 text-[12px] font-semibold text-grey-800">
              <Zap size={16} className="text-grey-800" aria-hidden />
              {topic}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-md"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex items-center border-b border-grey-200 px-6 pt-4">
          {TABS.map((t) => {
            const active = t === tab
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={
                  'px-4 pb-4 pt-4 text-[14px] ' +
                  (active
                    ? '-mb-px border-b border-[#01567a] text-[#193d50]'
                    : 'text-grey-500')
                }
              >
                {t}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-10 py-6">
          {tab === 'Overview' && (
            <CreateUseCaseTab detail={detail} selectedRows={selectedRows} onToggleRow={toggleRow} />
          )}
          {tab === 'Generated policy' && <GeneratedUseCaseTab detail={detail} />}
          {tab === 'Ticket source' && <TicketSourcesTab detail={detail} />}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-grey-200 px-10 py-8">
          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-[20px] bg-black text-[14px] font-semibold text-white"
          >
            Create new use case
          </button>
          <button
            type="button"
            className="flex items-center justify-between rounded-[20px] border border-grey-400 bg-white py-2.5 pl-4 pr-2.5 text-[14px] text-grey-500"
          >
            Assign this topic to an existing use case
            <ChevronDown size={20} aria-hidden />
          </button>
          <button
            type="button"
            disabled
            className="h-[37px] cursor-not-allowed rounded-[20px] bg-grey-100 text-[14px] font-semibold text-[#a6a9b2]"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  )
}
