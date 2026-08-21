// The transcript body for the Conversation Details drawer, plus the turn-level
// audit UI layered over it for Widget conversations.
//
// Exchanges are DERIVED from the existing flat `TranscriptEntry[]` rather than
// stored — that keeps the A2A, MCP and generated transcripts untouched, so the
// three channels without an audit render exactly as they did before.
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, Bot, Check, ChevronDown, User, Wrench, Zap } from 'lucide-react'
import {
  type AuditEvent,
  type AuditEventKind,
  type ConvAudit,
  EVIDENCE_KINDS,
  KIND_CHIP,
  allEvents,
  countFor,
  errorCount,
  firstErrorExchange,
  formatLatency,
} from './audit-data'
import type { ConvDetail, TranscriptEntry } from './conversations-data'
import { CopyButton } from './CopyButton'

// A customer bubble opens an exchange; agent bubbles and step chips attach to
// the one in progress. A transcript that opens on an agent bubble (every Widget
// conversation does — the greeting comes first) starts exchange one with it.
// Nothing here numbers an exchange: the evidence sits under the exchange it
// explains, so an ordinal the reader has to count out adds chrome, not meaning.
export function groupIntoTurns(entries: TranscriptEntry[]): TranscriptEntry[][] {
  const turns: TranscriptEntry[][] = []
  for (const entry of entries) {
    const opensTurn = entry.kind === 'bubble' && entry.side === 'client'
    if (opensTurn || turns.length === 0) turns.push([entry])
    else turns[turns.length - 1].push(entry)
  }
  return turns
}

// One-offs: the status scale in theme.css has no error-red pairing at this
// weight, and these three values are shared by every audit surface.
const ERROR_FG = '#c92a2a'
const ERROR_BG = '#fdecec'
const ERROR_INK = '#8c1c1c'

// Request/response payloads get a code treatment that reads as a terminal, not
// as prose — the light-grey pre they had before was indistinguishable from the
// timeline around it. Request and response are labelled, separate blocks.
function PayloadBlocks({ payload }: { payload: NonNullable<AuditEvent['payload']> }) {
  const block = (label: string, body: unknown) => (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-grey-500">{label}</p>
      <pre className="max-h-[280px] overflow-auto rounded-[10px] bg-[#1e2a35] p-3 font-mono text-[11.5px] leading-[17px] text-[#d7e0ea] whitespace-pre-wrap break-words">
        {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
      </pre>
    </div>
  )
  return (
    <div data-testid="payload-details" className="mt-1 flex flex-col gap-2">
      {block('Request', payload.request)}
      {block('Response', payload.response)}
    </div>
  )
}

// Knowledge sources cite, never quote: the first article as a title + version
// link, and a count expander when the search retrieved more. Article content
// deliberately never renders in the drawer.
function SourceLinks({ sources }: { sources: NonNullable<AuditEvent['sources']> }) {
  const [open, setOpen] = useState(false)
  const [first, ...rest] = sources
  const link = (s: (typeof sources)[number]) => (
    <a
      key={s.href}
      href={s.href}
      target="_blank"
      rel="noreferrer"
      className="block w-fit text-[12px] leading-[18px] text-[#406cc4] underline"
    >
      {s.title} <span className="text-grey-500 no-underline">· {s.version}</span>
    </a>
  )
  return (
    <div className="flex flex-col gap-0.5">
      {link(first)}
      {rest.length > 0 && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="w-fit text-left text-[12px] leading-[18px] text-grey-700 underline"
        >
          {open ? 'Hide sources' : `+${rest.length} more source${rest.length === 1 ? '' : 's'}`}
        </button>
      )}
      {open && rest.map(link)}
    </div>
  )
}

// The remediation block an error carries: its preserved error ID, the "How to
// fix" guidance from the Log page, and a link that opens the Autoflow/policy
// the failed step belongs to.
function ErrorExtras({ event }: { event: AuditEvent }) {
  return (
    <div className="mt-1 flex flex-col gap-2">
      {event.errorId && (
        <p className="flex items-center gap-1 text-[12px] text-grey-700">
          Error ID: <span className="font-mono text-[11.5px] text-black">{event.errorId}</span>
          <CopyButton value={event.errorId} label={`Copy error ID ${event.errorId}`} />
        </p>
      )}
      {event.fix && (
        <div className="flex flex-col gap-2 rounded-[12px] border border-grey-200 bg-[#fbfbfb] p-3">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-black">
            <Wrench className="h-3.5 w-3.5 text-grey-700" aria-hidden />
            How to fix
          </p>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-[12.5px] leading-[19px] text-grey-800">
            {event.fix.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link
            to={`/insights/automations/${event.fix.flowId}`}
            className="w-fit text-[12.5px] font-medium text-[#406cc4] underline"
          >
            View failed step in {event.fix.flowName}
          </Link>
        </div>
      )}
    </div>
  )
}

// The same rail-dot-line vocabulary as the drawer's EventsTimeline, moved under
// the exchange it explains. Each row: kind chip + time + the step's own
// latency, the plain-language line, then the safe evidence summary beneath it
// in muted type.
export function EvidenceTimeline({ events }: { events: AuditEvent[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const togglePayload = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="flex flex-col pt-2">
      {events.map((e, i) => {
        const isError = e.kind === 'error'
        const hasPayload = e.payload !== undefined
        const isExpanded = expanded.has(i)
        return (
          <div key={i} className="flex gap-3">
            <div className="flex w-2 flex-col items-center">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${isError ? '' : 'bg-grey-700'}`}
                style={isError ? { background: ERROR_FG } : undefined}
              />
              {i < events.length - 1 && <span className="w-px flex-1 bg-grey-200" />}
            </div>
            <div className="flex flex-1 flex-col gap-1 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[11.5px] font-medium ${
                    isError ? '' : 'bg-grey-100 text-grey-800'
                  }`}
                  style={isError ? { color: ERROR_FG, background: ERROR_BG } : undefined}
                >
                  {isError && <AlertTriangle className="h-3 w-3" aria-hidden />}
                  {isError ? `${KIND_CHIP.error} · ${e.severity}` : KIND_CHIP[e.kind]}
                </span>
                <span className="text-[12px] text-grey-700">{e.time}</span>
                {/* Every turn and every tool/API call carries its own latency —
                    persistent, not derived from adjacent timestamps. */}
                <span className="text-[12px] text-grey-500">{formatLatency(e.latencyMs)}</span>
              </div>
              <p className="text-[12.5px] leading-[19px] text-black">
                {isError && (
                  <span className="font-semibold" style={{ color: ERROR_FG }}>
                    {e.category} —{' '}
                  </span>
                )}
                {e.detail}
              </p>
              {e.sources ? (
                <SourceLinks sources={e.sources} />
              ) : hasPayload ? (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => togglePayload(i)}
                  className="text-left text-[12px] leading-[18px] text-grey-700 underline"
                >
                  {e.evidence}
                </button>
              ) : (
                <p className="text-[12px] leading-[18px] text-grey-700">{e.evidence}</p>
              )}
              {hasPayload && isExpanded && <PayloadBlocks payload={e.payload!} />}
              {isError && <ErrorExtras event={e} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// One line beneath an exchange. Nothing at all where there are no events; a grey
// count where the exchange is healthy; a red-tinted count where it is not. No
// border, no header, no ordinal — the strip's whole job is to stay out of the way
// until the reader wants it.
export function ExchangeStrip({
  events,
  open,
  onToggle,
}: {
  events: AuditEvent[]
  open: boolean
  onToggle: () => void
}) {
  if (events.length === 0) return null
  const errors = events.filter((e) => e.kind === 'error').length
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
  return (
    <div
      className={errors > 0 ? 'flex flex-col rounded-[12px] px-3 py-2' : 'flex flex-col px-3 py-1'}
      style={errors > 0 ? { background: ERROR_BG } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex flex-wrap items-center gap-1.5 self-start text-[12px]"
      >
        {errors > 0 && (
          <>
            <span className="flex items-center gap-1 font-semibold" style={{ color: ERROR_FG }}>
              <AlertTriangle className="h-3 w-3" aria-hidden />
              {plural(errors, 'error')}
            </span>
            <span aria-hidden style={{ color: ERROR_INK }}>·</span>
          </>
        )}
        <span className={errors > 0 ? '' : 'text-grey-700'} style={errors > 0 ? { color: ERROR_INK } : undefined}>
          {plural(events.length, 'event')}
        </span>
        <span aria-hidden className={errors > 0 ? '' : 'text-grey-400'} style={errors > 0 ? { color: ERROR_INK } : undefined}>
          ·
        </span>
        <span className="underline" style={errors > 0 ? { color: ERROR_INK } : undefined}>
          {open ? 'Hide details' : 'Show details'}
        </span>
      </button>
      {open && <EvidenceTimeline events={events} />}
    </div>
  )
}

// null = no filter (every strip collapsed), 'all' = every strip expanded, a kind
// = only exchanges holding that kind, showing only those events.
export type EvidenceFilter = AuditEventKind | 'all' | null

// A one-press shortcut to the exchanges holding an error, sitting next to
// Details rather than buried inside it — in a long conversation that's the
// difference between jumping straight to the failing turns and opening the
// menu, finding Errors in the list, and picking it. Silent on a healthy
// conversation, matching every other error-only surface in this file.
export function ErrorsQuickFilter({
  audit,
  value,
  onChange,
}: {
  audit: ConvAudit
  value: EvidenceFilter
  onChange: (v: EvidenceFilter) => void
}) {
  const count = errorCount(audit)
  if (count === 0) return null
  const active = value === 'error'
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onChange(active ? null : 'error')}
      className="flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium"
      style={{ borderColor: ERROR_FG, color: ERROR_FG, background: active ? ERROR_BG : 'white' }}
    >
      <AlertTriangle className="h-3 w-3" aria-hidden />
      Errors · {count}
    </button>
  )
}

export function EvidenceMenu({
  audit,
  value,
  onChange,
}: {
  audit: ConvAudit
  value: EvidenceFilter
  onChange: (v: EvidenceFilter) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const total = allEvents(audit).length
  // Re-picking the active entry clears back to the default — the menu is the
  // only control, so it has to be able to undo itself.
  const pick = (next: EvidenceFilter) => {
    onChange(value === next ? null : next)
    setIsOpen(false)
  }
  const label =
    value === null ? 'Details' : value === 'all' ? 'All events' : EVIDENCE_KINDS.find((k) => k.kind === value)!.label

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 items-center gap-1.5 rounded-full border border-surface-border bg-white px-3 text-[12px] font-medium text-ink"
      >
        {label}
        <ChevronDown size={14} className="text-ink-muted" aria-hidden />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-[240px] rounded-xl border border-surface-border bg-white p-1 shadow-[0px_16px_12px_rgba(10,13,14,0.16)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => pick('all')}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-bg-subtle"
          >
            <span className="flex-1 text-[13px] leading-5 text-ink">All events</span>
            <span className="text-[13px] text-ink-muted">{total}</span>
            {value === 'all' && <Check size={16} className="text-blue-700" aria-hidden />}
          </button>
          {EVIDENCE_KINDS.map(({ kind, label: kindLabel }) => {
            const count = countFor(audit, kind)
            return (
              <button
                key={kind}
                type="button"
                role="menuitem"
                disabled={count === 0}
                onClick={() => pick(kind)}
                // Zero-count entries are disabled rather than hidden: "Tools 0"
                // is itself the answer to "did a tool run here?".
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-bg-subtle disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span className="flex-1 text-[13px] leading-5 text-ink">{kindLabel}</span>
                <span className="text-[13px] text-ink-muted">{count}</span>
                {value === kind && <Check size={16} className="text-blue-700" aria-hidden />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// The "— label —" hairline pattern shared by the transcript intro and the
// reassign heading.
export function HairlineLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="h-px flex-1 bg-grey-200" />
      <p className="whitespace-nowrap text-center text-[12px] text-black">{children}</p>
      <div className="h-px flex-1 bg-grey-200" />
    </div>
  )
}

function StepChip({ entry }: { entry: Extract<TranscriptEntry, { kind: 'step' }> }) {
  return (
    <div className="flex items-center gap-2 rounded-[5px] border border-grey-100 bg-white px-3 py-1.5 text-[12px] text-grey-700">
      <Zap className="h-3 w-3 shrink-0" aria-hidden />
      {entry.text}
      <span className="ml-auto pl-3 text-[11.5px] text-grey-400">{entry.time}</span>
    </div>
  )
}

function Bubble({ entry }: { entry: Extract<TranscriptEntry, { kind: 'bubble' }> }) {
  const isAgent = entry.side === 'solve'
  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] items-end gap-2 ${isAgent ? 'flex-row-reverse' : ''}`}>
        <div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${isAgent ? 'bg-black' : 'bg-grey-500'}`}>
          {isAgent ? <Bot className="h-3.5 w-3.5 text-white" aria-hidden /> : <User className="h-3.5 w-3.5 text-white" aria-hidden />}
        </div>
        <div className="flex flex-col gap-1">
          <p className={`text-[12px] ${isAgent ? 'text-right' : ''}`}>
            <span className="text-black">{entry.speaker}</span>
            {/* Separator merged into the role text (rather than an isolated span) so the
                role span's rendered text isn't a bare, ambiguous exact match on shared
                role strings like "Calling client" that repeat across bubbles. */}
            <span className="text-grey-700"> · {entry.role}</span>
            <span className="text-grey-400"> · {entry.time}</span>
          </p>
          <div
            className="whitespace-pre-line rounded-2xl px-4 py-3 text-[14px] text-black"
            style={{ background: isAgent ? '#d6eef5' : '#efefef' }}
          >
            {entry.text}
          </div>
        </div>
      </div>
    </div>
  )
}

// The transcript card, for every channel. Without an audit it is the flat list
// the drawer has always rendered. With one, the same entries are grouped into
// exchanges and each gets a strip; the card header gains the evidence menu.
export function TranscriptBody({
  detail,
  reveal,
  onRevealConsumed,
}: {
  detail: ConvDetail
  // nonce 0 is inert; a positive nonce is one reveal aimed at `exchange` (-1
  // falls back to the first exchange holding an error).
  reveal: { nonce: number; exchange: number }
  // Reported once per reveal so the owner can put the nonce back to 0. The
  // Conversation tab is unmounted while AI QA is showing, and a nonce left live
  // would replay the whole reveal on the next tab return.
  onRevealConsumed?: () => void
}) {
  const audit = detail.audit
  const [filter, setFilter] = useState<EvidenceFilter>(null)
  const [open, setOpen] = useState<Set<number>>(new Set())
  const [ring, setRing] = useState(-1)
  const [scrollTarget, setScrollTarget] = useState<number | null>(null)
  const groupRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const groups = useMemo(
    () => (audit ? groupIntoTurns(detail.transcript) : []),
    [audit, detail.transcript],
  )

  // Choosing a filter sets what is expanded; that is the point of it — R2 asks
  // for matching turns and events "without requiring every turn to be expanded".
  const applyFilter = (next: EvidenceFilter) => {
    setFilter(next)
    if (!audit || next === null) {
      setOpen(new Set())
      return
    }
    const matching = groups
      .map((_, i) => i)
      .filter((i) => {
        const events = audit.exchanges[i] ?? []
        return next === 'all' ? events.length > 0 : events.some((e) => e.kind === next)
      })
    setOpen(new Set(matching))
  }

  // A hand toggle never clears the filter: the filter chose what is visible, the
  // toggle chooses what is expanded, and they are allowed to disagree.
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  // An error-list jump. nonce 0 is inert — that keeps the drawer still on open,
  // and, because the reveal is reported consumed the moment it runs, on every
  // later remount too: this component is thrown away whenever the AI QA tab is
  // showing, and React runs a mount effect whether or not its deps changed.
  useEffect(() => {
    if (!audit || reveal.nonce === 0) return
    onRevealConsumed?.()
    const target = reveal.exchange >= 0 ? reveal.exchange : firstErrorExchange(audit)
    if (target < 0 || target >= audit.exchanges.length) return
    setFilter(null)
    setOpen(new Set([target]))
    setRing(target)
    // The scroll is deferred a pass rather than done here: clearing the filter
    // re-mounts an exchange the filter was hiding, and its ref is only
    // re-attached once that render has committed.
    setScrollTarget(target)
  }, [audit, reveal, onRevealConsumed])

  // One scroll per request, cleared as it is served — so a second `Go to it`
  // scrolls again even while the ring from the first is still on screen.
  // scrollIntoView is guarded because jsdom doesn't implement it (the same
  // guard the AI Studio shell uses).
  useEffect(() => {
    if (scrollTarget === null) return
    const el = groupRefs.current[scrollTarget]
    if (typeof el?.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setScrollTarget(null)
  }, [scrollTarget])

  const intro = (
    <HairlineLabel>
      {detail.transcriptIntro}, {detail.timeCreated}
    </HairlineLabel>
  )
  const entry = (e: TranscriptEntry, key: number) =>
    e.kind === 'step' ? <StepChip key={key} entry={e} /> : <Bubble key={key} entry={e} />

  if (!audit) {
    return (
      <div className="flex flex-col gap-4 rounded-[20px] border border-grey-300 p-5">
        {intro}
        {detail.transcript.map((e, i) => entry(e, i))}
      </div>
    )
  }

  const kindFilter = filter !== null && filter !== 'all' ? filter : null

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-grey-300 p-5">
      <div className="flex items-center justify-end gap-2">
        <ErrorsQuickFilter audit={audit} value={filter} onChange={applyFilter} />
        <EvidenceMenu audit={audit} value={filter} onChange={applyFilter} />
      </div>
      {intro}
      {groups.map((entries, i) => {
        const events = audit.exchanges[i] ?? []
        const shown = kindFilter ? events.filter((e) => e.kind === kindFilter) : events
        if (kindFilter && shown.length === 0) return null
        return (
          <div
            key={i}
            data-testid={`exchange-${i}`}
            ref={(el) => {
              groupRefs.current[i] = el
            }}
            // The ring class stays put under prefers-reduced-motion (no
            // animation, so no animationend) — harmless, since the rule that
            // paints it is what's switched off.
            className={`flex flex-col gap-4 rounded-[16px] ${ring === i ? 'animate-error-ring' : ''}`}
            // Animation events bubble, so only this wrapper's own animation
            // ending clears the ring — a descendant's would cut it short.
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) setRing(-1)
            }}
          >
            {entries.map((e, j) => entry(e, j))}
            <ExchangeStrip events={shown} open={open.has(i)} onToggle={() => toggle(i)} />
          </div>
        )
      })}
    </div>
  )
}
