// Inline policy preview (Figma 768-44545). After approving the AI Studio plan,
// the editor's policy area is replaced by the AI-suggested rewrite rendered as
// accept/reject diff blocks: a header with a change counter + bulk actions, then
// per-block colored rails (teal = added, red = removed, neutral = context) each
// with per-block ✕/✓ controls. Presentational mock — resolving a block just
// updates local state; nothing is persisted.
import { useState } from 'react'
import { ArrowUp, ArrowDown, X, Check, Sparkles } from 'lucide-react'
import { AI_STUDIO_PREVIEW, type PreviewBlock } from './ai-studio-data'

type Resolution = 'pending' | 'accepted' | 'rejected'

const RAIL: Record<PreviewBlock['kind'], string> = {
  context: 'transparent',
  add: '#12a6b4',
  remove: '#e34935',
}
const TINT: Record<PreviewBlock['kind'], string> = {
  context: 'transparent',
  add: '#effcfb',
  remove: '#fdf0ee',
}

function DiffBlock({
  block, resolution, onResolve,
}: {
  block: PreviewBlock
  resolution: Resolution
  onResolve: (id: string, r: Resolution) => void
}) {
  const changed = block.kind !== 'context'
  const resolved = resolution !== 'pending'
  return (
    <div className="relative flex gap-3">
      <div
        className="mt-1 flex-1 rounded-r-lg py-2 pl-4 pr-3"
        style={{
          borderLeft: changed ? `3px solid ${RAIL[block.kind]}` : '3px solid transparent',
          backgroundColor: changed && !resolved ? TINT[block.kind] : 'transparent',
          opacity: resolution === 'rejected' ? 0.45 : 1,
        }}
      >
        {block.heading && (
          <p className="text-[15px] font-medium text-ink">
            {block.number ? `${block.number}. ${block.heading}` : block.heading}
          </p>
        )}
        <ul className="mt-1 flex flex-col gap-1">
          {block.lines.map((line, i) => (
            <li key={i} className="text-[14px] leading-6 text-ink">{line}</li>
          ))}
        </ul>
      </div>

      {/* Per-block accept/reject controls (changed blocks only, while pending) */}
      {changed && !resolved && (
        <div className="mt-1 flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-label={`Reject change: ${block.heading ?? block.lines[0]}`}
            onClick={() => onResolve(block.id, 'rejected')}
            className="flex size-8 items-center justify-center rounded-lg bg-[#fdecec] text-[#c0392b]"
          >
            <X size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Accept change: ${block.heading ?? block.lines[0]}`}
            onClick={() => onResolve(block.id, 'accepted')}
            className="flex size-8 items-center justify-center rounded-lg bg-[#dbf3ea] text-[#0f8a5f]"
          >
            <Check size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}

export function InlinePolicyPreview() {
  const pv = AI_STUDIO_PREVIEW
  const changedIds = pv.blocks.filter((b) => b.kind !== 'context').map((b) => b.id)
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({})

  const resolve = (id: string, r: Resolution) =>
    setResolutions((prev) => ({ ...prev, [id]: r }))
  const resolveAll = (r: Resolution) =>
    setResolutions(Object.fromEntries(changedIds.map((id) => [id, r])))

  const resolvedCount = changedIds.filter((id) => resolutions[id] && resolutions[id] !== 'pending').length
  const pending = pv.changes - resolvedCount

  return (
    <div data-testid="inline-policy-preview" className="flex flex-1 flex-col">
      {/* Header card: title + change counter + bulk actions */}
      <div className="mb-6 rounded-xl border border-surface-border bg-white px-6 py-5">
        <h2 className="text-[18px] font-medium text-ink">{pv.title}</h2>
        <p className="mt-1 text-[14px] text-ink-muted">{pv.subtitle}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[14px]">
            <span><span className="font-semibold text-ink">{pv.changes}</span> <span className="text-ink-muted">Changes</span></span>
            <span><span className="font-semibold text-[#0f8a5f]">{resolvedCount}</span> <span className="text-ink-muted">Resolved</span></span>
            <span><span className="font-semibold text-[#c0392b]">{pending}</span> <span className="text-ink-muted">Pending</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Previous change" className="text-ink-muted hover:text-ink">
              <ArrowUp size={16} aria-hidden />
            </button>
            <button type="button" aria-label="Next change" className="text-ink-muted hover:text-ink">
              <ArrowDown size={16} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => resolveAll('rejected')}
              className="flex items-center gap-1.5 text-[14px] font-medium text-ink"
            >
              <X size={16} aria-hidden /> Reject all
            </button>
            <button
              type="button"
              onClick={() => resolveAll('accepted')}
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#0f8a5f]"
            >
              <Check size={16} aria-hidden /> Accept all
            </button>
          </div>
        </div>
      </div>

      {/* Autoflow policy title */}
      <h3 className="mb-4 flex items-center gap-2 text-[20px] font-medium text-ink">
        <span
          className="flex size-6 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg,#724be8,#1f73b7)' }}
        >
          <Sparkles size={14} aria-hidden />
        </span>
        {pv.policyTitle}
      </h3>

      {/* Diff blocks */}
      <div className="flex flex-col gap-3">
        {pv.blocks.map((block) => (
          <DiffBlock
            key={block.id}
            block={block}
            resolution={resolutions[block.id] ?? 'pending'}
            onResolve={resolve}
          />
        ))}
      </div>
    </div>
  )
}
