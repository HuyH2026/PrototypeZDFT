// Web Call ▸ Web Call segment: the segment's name, its routing tags (as
// removable pills, not the Widget tab's bordered chips), whether it is the
// default, and the names the web call introduces itself with. Presentational —
// every edit bubbles up via handlers.
import { X } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import {
  WEBCALL_SEGMENT_COPY as COPY,
  type RailSection,
  type Segment,
  type WebCallConfig,
} from './config-data'
import { Footnote, GroupLabel, Helper, PanelShell, TextField, ToggleRow } from './panel-parts'

type WebCallSegmentPanelProps = {
  segment: Segment
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onNameChange: (name: string) => void
  onToggleEnabled: () => void
  onToggleDefault: () => void
  onRemoveTag: (tag: string) => void
  onWebCallChange: (patch: Partial<WebCallConfig>) => void
}

export function WebCallSegmentPanel({
  segment,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onNameChange,
  onToggleEnabled,
  onToggleDefault,
  onRemoveTag,
  onWebCallChange,
}: WebCallSegmentPanelProps) {
  return (
    <PanelShell
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <ToggleRow
        label={COPY.enabledLabel}
        checked={segment.enabled}
        onChange={onToggleEnabled}
        tone="teal"
      />
      <h2 className="mt-7 text-[18px] font-semibold leading-6 tracking-[-0.45px] text-black">
        {COPY.title}
      </h2>
      <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-grey-800">{COPY.intro}</p>

      {/* Segment name */}
      <div className="mt-6">
        <GroupLabel label={COPY.segmentName.label} />
        <Helper>{COPY.segmentName.helper}</Helper>
        <div className="mt-2">
          <TextField label={COPY.segmentName.label} value={segment.name} onChange={onNameChange} />
        </div>
        <Footnote>{COPY.segmentName.footnote}</Footnote>
      </div>

      {/* Tags — the frame's taller, textarea-like box of removable pills. */}
      <div className="mt-6">
        <GroupLabel label={COPY.tags.label} />
        <Helper>
          {COPY.tags.helper} <span className="text-blue-700">{COPY.tags.link}</span>.
        </Helper>
        <div className="mt-2 flex min-h-[84px] content-start flex-wrap items-start gap-2 rounded-lg border border-[#bcbdc5] bg-white p-2.5">
          {segment.tags.length > 0 ? (
            segment.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-grey-200 py-1 pl-2.5 pr-1 text-[12px] font-semibold text-black"
              >
                <GardenIcon name="tag-stroke" className="h-3.5 w-3.5 text-accent-blue" />
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onRemoveTag(tag)}
                  className="flex size-5 items-center justify-center rounded-full text-ink transition-colors duration-instant ease-soft hover:bg-grey-400"
                >
                  <X size={12} aria-hidden />
                </button>
              </span>
            ))
          ) : (
            <span className="py-1 text-[14px] text-grey-500">{COPY.tags.placeholder}</span>
          )}
        </div>
      </div>

      {/* Set as default — the helper sits indented under the label. */}
      <div className="mt-6">
        <label className="flex items-center gap-2 text-[14px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={segment.isDefault}
            onChange={onToggleDefault}
            className="size-4 accent-accent-blue"
          />
          {COPY.default.label}
        </label>
        <div className="pl-6">
          <Helper>
            {COPY.default.helper} <span className="text-blue-700">{COPY.default.link}</span>.
          </Helper>
        </div>
      </div>

      {/* Company name */}
      <div className="mt-6">
        <GroupLabel label={COPY.companyName} />
        <div className="mt-3">
          <TextField
            label={COPY.companyName}
            value={segment.webcall.companyName}
            onChange={(companyName) => onWebCallChange({ companyName })}
          />
        </div>
      </div>

      {/* Web Call agent name */}
      <div className="mt-6">
        <GroupLabel label={COPY.agentName} />
        <div className="mt-3">
          <TextField
            label={COPY.agentName}
            value={segment.webcall.agentName}
            onChange={(agentName) => onWebCallChange({ agentName })}
          />
        </div>
      </div>
    </PanelShell>
  )
}
