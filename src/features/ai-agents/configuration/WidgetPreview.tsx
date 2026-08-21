// Centre column of the Widget tab: a scope row saying what the preview reflects,
// above the widget mock. Which body the mock shows follows the active rail
// section — the Mood section previews the CSAT survey, Knowledge previews the
// source prompt, Embed previews quick replies, everything else the sample chat.
import { GardenIcon } from '@/components/garden-icon'
import {
  PREVIEW_COPY,
  isAllSegments,
  summarizeTags,
  type CsatConfig,
  type Segment,
} from './config-data'
import { PreviewFrame } from './PreviewFrame'
import {
  ChatPreviewBody,
  CsatPreviewBody,
  KnowledgePreviewBody,
  QuickRepliesPreviewBody,
} from './preview-bodies'

/** "'Riders ' for [chips]", or the all-segments note for site-wide sections. */
export function PreviewScope({
  label,
  chips,
  allSegments,
  icon = 'tag-stroke',
}: {
  label: string
  chips: string[]
  allSegments: boolean
  icon?: 'tag-stroke' | 'phone-stroke'
}) {
  if (allSegments) {
    return <p className="text-[14px] font-semibold text-ink">{PREVIEW_COPY.allSegments}</p>
  }
  if (chips.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 text-[14px]">
      <p className="font-semibold text-ink">
        {`'${label}' `}
        <span className="font-semibold text-grey-500">for</span>
      </p>
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 rounded bg-white px-2 py-[3px] text-[12px] text-ink"
        >
          <GardenIcon name={icon} className="h-4 w-4 text-accent-blue" />
          {chip}
        </span>
      ))}
    </div>
  )
}

export function WidgetPreview({
  segment,
  section,
  csat,
}: {
  segment: Segment
  section: string
  csat: CsatConfig
}) {
  const tagSummary = summarizeTags(segment.tags)
  return (
    <div className="flex flex-1 flex-col items-center gap-7">
      <PreviewScope
        label={segment.label}
        chips={tagSummary ? [tagSummary] : []}
        allSegments={isAllSegments(section)}
      />
      <PreviewFrame
        mark={segment.widgetMark}
        title={segment.widgetTitle}
        accent={segment.widgetAccent}
      >
        {section === 'mood' ? (
          <CsatPreviewBody csat={csat} />
        ) : section === 'knowledge' ? (
          <KnowledgePreviewBody />
        ) : section === 'code' ? (
          <QuickRepliesPreviewBody mark={segment.widgetMark} accent={segment.widgetAccent} />
        ) : (
          <ChatPreviewBody mark={segment.widgetMark} accent={segment.widgetAccent} />
        )}
      </PreviewFrame>
    </div>
  )
}
