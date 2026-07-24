// Right slide-over showing full details for a clicked conversation row.
// Reproduces Figma frames 145-77530 (A2A) and 145-77713 (MCP); content is
// driven by the row's `source`. Follows the GeneratedAgentPanel convention
// (scrim + dialog, closes on X / scrim / Escape). Presentational — the Events
// "Add…", "Define a New Intent", the intent dropdown, and "Assign" are no-ops.
import { useEffect } from 'react'
import { Check, ChevronDown, Plus, Repeat, X } from 'lucide-react'
import {
  type ConvDetail,
  type EventItem,
  type TranscriptEntry,
  SOURCE_META,
} from './conversations-data'

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[12px] text-[#727583]">
      <span>{label}</span>: <span className="text-black">{value}</span>
    </p>
  )
}

function Divider() {
  return <div className="h-px w-full bg-[#e4e7f0]" />
}

function SignalChip({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 text-[12px] text-black">
      <Check className="h-4 w-4 text-[#048c80]" aria-hidden />
      {label}
    </span>
  )
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded bg-[#f2f4f7] px-2 py-1 text-[12px] text-[#545767]">
          <Repeat className="h-3 w-3" aria-hidden />
          {event.label}
          <span className="inline-block h-1 w-1 rounded-full bg-[#727583]" />
          {event.client}
        </span>
        <span className="text-[12px] text-[#727583]">{event.duration}</span>
      </div>
      {event.sublink && (
        <span className="text-[12px] text-[#145ad0] underline">{event.sublink}</span>
      )}
    </div>
  )
}

function StepFrame({ text }: { text: string }) {
  return (
    <div className="rounded-[5px] border border-[#f2f4f7] bg-white px-3 py-1 text-[12px] text-[#727583]">
      {text}
    </div>
  )
}

function Bubble({
  entry,
  clientBg,
}: {
  entry: Extract<TranscriptEntry, { kind: 'bubble' }>
  clientBg: string
}) {
  const bg = entry.side === 'client' ? clientBg : '#f2f4f7'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[12px]">
        <span className="text-black">{entry.speaker}</span>
        {/* Separator merged into the role text (rather than an isolated span) so the
            role span's rendered text isn't a bare, ambiguous exact match on shared
            role strings like "Calling client" that repeat across bubbles. */}
        <span className="text-[#727583]">&middot; {entry.role}</span>
      </div>
      <div className="whitespace-pre-line rounded-lg px-4 py-3 text-[14px] text-black" style={{ background: bg }}>
        {entry.text}
      </div>
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const meta = SOURCE_META[detail.source]
  const clientBg = detail.source === 'a2a' ? '#fff7fc' : detail.source === 'mcp' ? '#ebf5f7' : '#f2f4f7'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        data-testid="conversation-detail-scrim"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Conversation Details"
        className="relative flex h-full w-[600px] flex-col overflow-y-auto bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-10">
          <h2 className="text-[24px] font-semibold text-black">Conversation Details</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-surface-border text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Source badge */}
        <div className="px-10 pt-3">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{ color: meta.fg, background: meta.bg }}
          >
            <Repeat className="h-3.5 w-3.5" aria-hidden />
            {meta.label}
          </span>
        </div>

        <div className="flex flex-col gap-8 px-10 py-8">
          {/* Meta rows */}
          <div className="flex flex-col gap-3">
            <MetaRow label="Conversation ID" value={detail.conversationId} />
            <MetaRow label="Automated" value={detail.automated} />
            <MetaRow label="Source" value={meta.label} />
            {detail.clientLabel && detail.clientValue && (
              <MetaRow label={detail.clientLabel} value={detail.clientValue} />
            )}
            <MetaRow label="Deflected" value={detail.deflected} />
            <MetaRow label="Resolved" value={detail.resolved} />
          </div>

          {/* Conversation card */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-black">Conversation</p>
            <div className="flex flex-col gap-4 rounded-lg border border-[#e4e7f0] p-4">
              <div className="flex flex-col gap-3 text-[12px] text-[#727583]">
                <MetaRow label="Time created" value={detail.timeCreated} />
                <MetaRow label="Time spent" value={detail.timeSpent} />
                <MetaRow label="Channel" value={detail.channel} />
                <MetaRow label="Automated" value={detail.automated} />
                <MetaRow label="Deflected" value={detail.deflected} />
                <MetaRow label="Resolved" value={detail.resolved} />
                <MetaRow label="# of interactions" value={detail.interactions} />
              </div>
              <Divider />
              <p className="text-[12px] text-[#727583]">
                Context Variables
                <br />
                <span className="text-black">{detail.contextVariables}</span>
              </p>
              <Divider />
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-[#727583]">Calling client query:</p>
                <p className="text-[14px] italic text-[#145ad0]">{detail.clientQuery}</p>
              </div>
              <Divider />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-[#727583]">Events:</p>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded bg-[#ebf5f7] py-1.5 pl-4 pr-2 text-[14px] font-semibold text-[#014968]"
                  >
                    Add…
                    <ChevronDown size={16} aria-hidden />
                  </button>
                </div>
                <div className="flex flex-col gap-3 border-l border-[#e4e7f0] pl-4">
                  {detail.events.map((e) => (
                    <EventRow key={e.label} event={e} />
                  ))}
                </div>
              </div>
              <Divider />
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-[#727583]">Resolution</p>
                <span className="w-fit rounded bg-[#055952] px-2 py-1 text-[11px] font-semibold text-white">
                  {detail.resolutionBadge}
                </span>
                <p className="text-[12px] text-[#727583]">{detail.resolutionText}</p>
                <div className="flex flex-wrap gap-5">
                  {detail.signals.map((s) => (
                    <SignalChip key={s} label={s} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[#e4e7f0]" />
                <p className="text-[12px] text-black">Reassign to new or existing intent</p>
                <div className="h-px flex-1 bg-[#e4e7f0]" />
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-0.5 rounded bg-[#ebf5f7] py-1.5 text-[14px] font-semibold text-[#193d50]"
              >
                <Plus size={20} aria-hidden />
                Define a New Intent
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded border border-[#bcbdc5] bg-white py-2.5 pl-4 pr-2.5 text-[14px] text-[#9194a0]"
              >
                Assign to an existing intent
                <ChevronDown size={20} aria-hidden />
              </button>
              <button
                type="button"
                className="w-full rounded bg-[#f2f4f7] px-4 py-1.5 text-[14px] font-semibold text-[#a6a9b2]"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Transcript card */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-black">Transcript</p>
            <div className="flex flex-col gap-4 rounded-lg border border-[#e4e7f0] p-4">
              <div className="flex items-center gap-2 py-3">
                <div className="h-px flex-1 bg-[#e4e7f0]" />
                <p className="text-center text-[14px] text-black">
                  {detail.transcriptIntro}
                  <span className="text-[#1d2033]">, {detail.timeCreated}</span>
                </p>
                <div className="h-px flex-1 bg-[#e4e7f0]" />
              </div>
              {detail.transcript.map((entry, i) =>
                entry.kind === 'step' ? (
                  <StepFrame key={i} text={entry.text} />
                ) : (
                  <Bubble key={i} entry={entry} clientBg={clientBg} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
