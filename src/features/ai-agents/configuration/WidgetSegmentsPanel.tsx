// Widget ▸ Widget segments: the segment's name, its tags, whether it is the
// default, and whether the widget is on for it. Presentational — every edit
// bubbles up via handlers.
import { GardenIcon } from '@/components/garden-icon'
import { WIDGET_SEGMENTS_COPY as COPY, type RailSection, type Segment } from './config-data'
import { GroupLabel, Helper, PanelShell, TextField, Toggle } from './panel-parts'

type WidgetSegmentsPanelProps = {
  segment: Segment
  sections: RailSection[]
  trailingStart?: string
  activeSection: string
  onSectionChange: (id: string) => void
  onNameChange: (name: string) => void
  onToggleEnabled: () => void
  onToggleDefault: () => void
}

export function WidgetSegmentsPanel({
  segment,
  sections,
  trailingStart,
  activeSection,
  onSectionChange,
  onNameChange,
  onToggleEnabled,
  onToggleDefault,
}: WidgetSegmentsPanelProps) {
  return (
    <PanelShell
      header={
        <div>
          <div className="flex items-center gap-2">
            <Toggle
              label={COPY.visibility}
              checked={segment.enabled}
              onChange={onToggleEnabled}
              showState
            />
            <span className="text-[12px] leading-[18px] text-grey-800">{COPY.visibility}</span>
          </div>
          <h2 className="mt-5 text-[18px] leading-6 tracking-[-0.45px] text-black">{COPY.title}</h2>
        </div>
      }
      sections={sections}
      trailingStart={trailingStart}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
    >
      <p className="mt-4 text-[14px] leading-5 text-grey-800">{COPY.intro}</p>

      {/* Segment name */}
      <div className="mt-6">
        <GroupLabel label={COPY.segmentName.label} />
        <Helper>{COPY.segmentName.helper}</Helper>
        <div className="mt-2">
          <TextField label={COPY.segmentName.label} value={segment.name} onChange={onNameChange} />
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6">
        <GroupLabel label={COPY.tags.label} />
        <Helper>
          {COPY.tags.helper} <span className="text-blue-700">{COPY.tags.link}</span>.
        </Helper>
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-grey-400 bg-white p-2.5">
          {segment.tags.length > 0 ? (
            <div className="grid flex-1 grid-cols-[repeat(2,max-content)] gap-2">
              {segment.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#d2d9e5] bg-grey-100 px-2.5 py-1 text-[12px] text-black"
                >
                  <GardenIcon name="tag-stroke" className="h-3.5 w-3.5 text-accent-blue" />
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="flex-1 py-1 text-[14px] text-grey-500">Assign tags</span>
          )}
          <GardenIcon name="chevron-down-stroke" className="mt-1 h-4 w-4 text-ink-muted" />
        </div>
      </div>

      {/* Set as Default */}
      <div className="mt-6">
        <label className="flex items-center gap-2 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={segment.isDefault}
            onChange={onToggleDefault}
            className="size-4 accent-accent-blue"
          />
          {COPY.default.label}
        </label>
        <Helper>
          {COPY.default.helper} <span className="text-blue-700">{COPY.default.link}</span>.
        </Helper>
      </div>
    </PanelShell>
  )
}
