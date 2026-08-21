// Right slide-over showing full details for a clicked conversation row. Also
// the drawer's entry point from the Logs pages, which deep-link in by
// conversation ID. Reproduces Figma frame 1941-88348 ("Conversation
// detail_01" / "_02" — the same drawer's two tab states) with the Fetch
// requirements layered on: an identity grid preserving conversation/trace/
// error IDs, a per-error jump list, persistent latencies, and request/response
// payloads in the transcript's Details timelines. Follows the
// CreateIntentPanel convention (scrim + dialog, closes on X / scrim / Escape).
// Presentational — the Events "Add…" control is a no-op.
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, ChevronDown, ChevronRight, Repeat, X } from 'lucide-react'
import type { ConvDetail, CriteriaRow, EventItem } from './conversations-data'
import { TranscriptBody } from './TurnAudit'
import { STATE_META, errorEvents, type ConvAudit } from './audit-data'
import { CopyButton } from './CopyButton'
import { OutcomeMetaRow } from './OutcomeMetaRow'
import { CONTRACTED_OUTCOME_MODEL } from './outcome-model'

type Tab = 'conversation' | 'ai-qa'

function Divider() {
  return <div className="h-px w-full bg-grey-200" />
}

function sentimentEmoji(score: number) {
  if (score >= 70) return '🙂'
  if (score >= 40) return '😐'
  return '😞'
}

function TabStrip({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabClass = (active: boolean) =>
    active
      ? '-mb-px border-b-2 border-[#01567a] px-4 pb-4 pt-[17px] text-[14px] text-[#193d50]'
      : '-mb-px px-4 pb-4 pt-[17px] text-[14px] text-[#9194a0]'
  return (
    <div className="flex items-center border-b border-grey-100">
      <button type="button" role="tab" aria-selected={tab === 'conversation'} onClick={() => onChange('conversation')} className={tabClass(tab === 'conversation')}>
        Conversation
      </button>
      <button type="button" role="tab" aria-selected={tab === 'ai-qa'} onClick={() => onChange('ai-qa')} className={tabClass(tab === 'ai-qa')}>
        AI QA
      </button>
    </div>
  )
}

function SummaryCard({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-semibold text-black">Summary</p>
      <div
        className="rounded-[20px] border border-grey-100 p-4"
        style={{ background: 'linear-gradient(90deg, rgba(255,179,147,0.15), rgba(171,213,250,0.15), rgba(18,166,180,0.15))' }}
      >
        <p className="text-[12.5px] leading-[19px] text-[#385075]">{text}</p>
      </div>
    </div>
  )
}

// The drawer's identity block: the IDs a support engineer copies into a ticket
// or a logs query, plus the outcome terms the org's contract entitles it to
// see. Two compact columns — this used to be a vertical stack of one-line rows
// and was the first thing that had to stop pushing the transcript down.
function IdentityGrid({ detail }: { detail: ConvDetail }) {
  const audit = detail.audit
  return (
    <dl data-testid="conversation-identity" className="grid grid-cols-[max-content_1fr] items-center gap-x-3 gap-y-1.5 text-[12px]">
      <dt className="text-grey-700">Chat ID</dt>
      <dd className="flex min-w-0 items-center gap-1 text-black">
        <span className="truncate font-mono text-[11.5px]">{detail.conversationId}</span>
        <CopyButton value={detail.conversationId} label="Copy Chat ID" />
      </dd>
      {audit && (
        <>
          <dt className="text-grey-700">Trace ID</dt>
          <dd className="flex min-w-0 items-center gap-1 text-black">
            <span className="truncate font-mono text-[11.5px]">{audit.traceId}</span>
            <CopyButton value={audit.traceId} label="Copy Trace ID" />
          </dd>
        </>
      )}
      <dt className="text-grey-700">Channel</dt>
      <dd className="text-black">{detail.channel}</dd>
      <dt className="text-grey-700">Time created</dt>
      <dd className="text-black">{detail.timeCreated}</dd>
      {/* Contract-gated: OutcomeMetaRow renders nothing for a term the org's
          outcome model doesn't include (FT → Deflected only, ZD → both). */}
      <dt className="sr-only">Outcomes</dt>
      <dd className="col-span-2 flex flex-col gap-1.5">
        <OutcomeMetaRow term="deflection" value={detail.deflected} model={CONTRACTED_OUTCOME_MODEL} />
        <OutcomeMetaRow term="resolution" value={detail.resolved} model={CONTRACTED_OUTCOME_MODEL} />
      </dd>
    </dl>
  )
}

// One row per error in the conversation: ID, category, where it failed, and a
// jump to that turn in the transcript. The old single "Go to it" button only
// ever reached the first error — with more than one, that left the rest
// unaddressable.
function ErrorListRow({
  event,
  exchange,
  onJump,
}: {
  event: ConvAudit['exchanges'][number][number]
  exchange: number
  onJump: (exchange: number) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-[12px] bg-white px-3 py-2">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: '#c92a2a' }} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[12.5px] font-medium text-black">{event.category}</span>
        <span className="flex items-center gap-1 text-[11.5px] text-grey-700">
          <span className="font-mono">{event.errorId}</span>
          <CopyButton value={event.errorId ?? ''} label={`Copy error ID ${event.errorId}`} />
          <span aria-hidden>·</span>
          <span>{event.severity} · turn {exchange + 1}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => onJump(exchange)}
        aria-label={`Jump to ${event.category} in the transcript`}
        className="flex shrink-0 items-center gap-0.5 rounded-full border border-grey-300 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-grey-800"
      >
        Turn {exchange + 1}
        <ChevronRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  )
}

// The investigation hand-off in one band: what state the conversation is in,
// every error it holds (as jump links), and who owns the next step. The
// generated error-summary sentence was dropped — the conversation's own
// Summary card is the one summary the drawer keeps.
function ErrorCard({ detail, onJump }: { detail: ConvDetail; onJump: (exchange: number) => void }) {
  const audit = detail.audit
  if (!audit || audit.state === 'healthy') return null
  const meta = STATE_META[audit.state]
  const errors = errorEvents(audit)
  return (
    <div
      data-testid="conversation-error-card"
      className="flex flex-col gap-3 rounded-[20px] border p-4"
      style={{ borderColor: '#f2c9c9', background: '#fdf7f7' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold"
          style={{ color: meta.fg, background: meta.bg }}
        >
          <AlertTriangle className="h-3 w-3" aria-hidden />
          {meta.label}
        </span>
        <span className="text-[12px] text-grey-700">
          {errors.length} error{errors.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {errors.map(({ event, exchange }) => (
          <ErrorListRow key={event.errorId ?? exchange} event={event} exchange={exchange} onJump={onJump} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-2 pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11.5px] text-grey-700">Customer impact</span>
          <span className="text-[12.5px] font-medium text-black">{audit.impact}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11.5px] text-grey-700">Investigation owner</span>
          <span className="text-[12.5px] font-medium text-black">{audit.owner ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}

// The conversation section's metadata as a compact 4-across grid. It used to
// be one row per field; on a 628px drawer that was half a screen of scroll
// before the transcript.
function MetaGrid({ detail }: { detail: ConvDetail }) {
  const fields: { label: string; value: string }[] = [
    { label: 'Time spent', value: detail.timeSpent },
    { label: 'Channel', value: detail.channel },
    ...(detail.clientLabel && detail.clientValue ? [{ label: detail.clientLabel, value: detail.clientValue }] : []),
    { label: 'User interactions', value: detail.interactions },
    { label: 'Sentiment', value: `${sentimentEmoji(detail.sentimentScore)} ${detail.sentimentScore}` },
    { label: 'CSAT', value: detail.csat },
    // On every Widget conversation, healthy included: impact and owner fields
    // that only showed up on failures couldn't be read as "this one was fine".
    ...(detail.audit
      ? [
          { label: 'Customer impact', value: detail.audit.impact },
          { label: 'Investigation owner', value: detail.audit.owner ?? '—' },
        ]
      : []),
  ]
  return (
    <dl data-testid="conversation-meta-grid" className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      {fields.map((f) => (
        <div key={f.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-[11.5px] text-grey-700">{f.label}</dt>
          <dd className="truncate text-[12.5px] font-medium text-black">{f.value}</dd>
        </div>
      ))}
      {detail.audit?.ownerEvidence && (
        <p className="col-span-full text-[11.5px] text-grey-500">Classified from: {detail.audit.ownerEvidence}</p>
      )}
    </dl>
  )
}

type TimelineRow = ({ kind: 'event' } & EventItem) | { kind: 'outcome'; label: string }

// A dot-and-line timeline: each `EventItem` is either a duration chip or a
// bare inline link, ending in the row's own outcome line. Headless-only now —
// where an audit exists, the per-exchange Details timelines carry this.
function EventsTimeline({ events, outcome }: { events: EventItem[]; outcome: string }) {
  const rows: TimelineRow[] = [
    ...events.map((e): TimelineRow => ({ ...e, kind: 'event' })),
    { kind: 'outcome', label: outcome },
  ]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-grey-700">Events:</p>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-grey-300 px-4 py-1.5 text-[13px] font-medium text-grey-800"
        >
          Add…
          <ChevronDown size={16} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col">
        {rows.map((row, i, all) => (
          <div key={i} className="flex gap-3">
            <div className="flex w-2 flex-col items-center">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-grey-700" />
              {i < all.length - 1 && <span className="w-px flex-1 bg-grey-200" />}
            </div>
            <div className="flex-1 pb-3">
              {row.kind === 'outcome' ? (
                <p className="text-[12px] font-medium text-black">{row.label}</p>
              ) : row.link ? (
                <span className="inline-flex items-center gap-1 text-[12px] text-[#406cc4] underline">
                  <Repeat className="h-3 w-3" aria-hidden />
                  {row.label}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded bg-grey-100 px-2 py-1 text-[12px] text-grey-800">
                    <Repeat className="h-3 w-3" aria-hidden />
                    {row.label}
                  </span>
                  {row.duration && <span className="text-[12px] text-grey-700">{row.duration}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CriteriaBar({ row }: { row: CriteriaRow }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-black">{row.label}</p>
        <span className="rounded-[6px] bg-[#2f3b48] px-3 py-1 text-[12.5px] font-semibold text-white">{row.threshold}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative h-[10px] flex-1 rounded-full bg-[#e5e7e9]">
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${row.fillPct}%`, background: row.color }} />
          <div
            className="absolute top-1/2 h-6 w-[1.5px] -translate-y-1/2"
            style={{ left: `${row.threshold}%`, background: row.tickColor }}
          />
        </div>
        <span className="w-4 text-right text-[13px] text-black">{row.score}</span>
      </div>
      <p className="text-[12.5px] leading-[19px] text-[#646864]">{row.reasoning}</p>
    </div>
  )
}

export function ConversationDetailPanel({
  detail,
  onClose,
}: {
  detail: ConvDetail
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('conversation')
  // nonce 0 is inert; each bump is one reveal, aimed at `exchange`.
  const [reveal, setReveal] = useState<{ nonce: number; exchange: number }>({ nonce: 0, exchange: -1 })

  // Jump to an error: the evidence is on the Conversation tab, so switch first,
  // then let TranscriptBody's effect open, scroll to and ring that exchange.
  const jumpToExchange = (exchange: number) => {
    setTab('conversation')
    setReveal((r) => ({ nonce: r.nonce + 1, exchange }))
  }

  // The reveal is single-use. Switching to AI QA unmounts the transcript, so a
  // nonce left live would fire the reveal again — jumping the drawer — the next
  // time the Conversation tab is chosen. This panel outlives the tab switch, so
  // it is the one that can put the nonce back to inert. Stable identity: it is
  // a dependency of the effect that calls it.
  const consumeReveal = useCallback(() => setReveal({ nonce: 0, exchange: -1 }), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end p-[10px]">
      <div
        data-testid="conversation-detail-scrim"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Conversation Details"
        aria-modal="true"
        className="relative flex h-full w-[628px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.20)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-6">
          <h2 className="text-[22px] text-black">Conversation Details</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-md"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-10 py-6">
          <IdentityGrid detail={detail} />
          <ErrorCard detail={detail} onJump={jumpToExchange} />
          <SummaryCard text={detail.summary} />

          <TabStrip tab={tab} onChange={setTab} />

          {tab === 'conversation' ? (
            <div className="flex flex-col gap-6">
              {/* Conversation card */}
              <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 p-5">
                <MetaGrid detail={detail} />
                {/* One timeline per drawer: where an audit exists, the evidence
                    lives under the exchange it explains instead. Headless has
                    no audit and keeps this section. */}
                {!detail.audit && (
                  <>
                    <Divider />
                    <EventsTimeline events={detail.events} outcome={detail.eventsOutcome} />
                  </>
                )}
              </div>

              <TranscriptBody detail={detail} reveal={reveal} onRevealConsumed={consumeReveal} />
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {detail.criteria.map((c) => (
                <CriteriaBar key={c.label} row={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
