// Knowledge coaching drill-in editor, based on the Business trip expense
// eligibility frame 1:5121. Every coaching rule supplies its own mock insights,
// use cases, and channel scope; edits live for the current mounted session.
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { GardenIcon } from '@/components/garden-icon'
import { RowActionsButton, RowToggle, SegmentChip } from '@/features/ai-agents/list-parts'
import {
  TAKEOVER_PANEL,
  TakeoverHeader,
  TakeoverMark,
  TakeoverSurface,
} from '@/components/takeover-parts'
import { type KnowledgeCoachingEditorContent, type KnowledgeEntry } from './knowledge-data'
import { KnowledgePreview } from './KnowledgePreview'

type EditorChanges = Pick<KnowledgeEntry, 'name' | 'body'>

function UseCaseChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#f6f7f9] px-2 py-1 text-[11px] leading-4 text-[#525465]">
      <span className="size-1.5 rounded-full bg-[#56bca8]" aria-hidden />
      {label}
    </span>
  )
}

function SelectionChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#e1e2e5] bg-[#f7f7f8] py-1 pr-1.5 pl-2 text-[12px] leading-4 text-[#373a4d]">
      {label}
      <X size={12} className="text-grey-700" aria-hidden />
    </span>
  )
}

function FieldLabel({ label, helper }: { label: string; helper?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[12px] leading-4 font-semibold text-ink">{label}</p>
      {helper ? <p className="text-[10px] leading-[14px] text-grey-700">{helper}</p> : null}
    </div>
  )
}

export function KnowledgeCoachingEditor({
  entry,
  editor,
  enabled,
  onToggle,
  onClose,
  onSave,
}: {
  entry: KnowledgeEntry
  editor: KnowledgeCoachingEditorContent
  enabled: boolean
  onToggle: () => void
  onClose: () => void
  onSave: (changes: EditorChanges) => void
}) {
  const [name, setName] = useState(entry.name)
  const [body, setBody] = useState(entry.body)
  const [previewing, setPreviewing] = useState(false)

  // Preview replaces the editor rather than layering over it, as it does for a
  // content snippet: the two are the same surface at the same z, and the editor's
  // state survives underneath because this component stays mounted.
  if (previewing) {
    return (
      <KnowledgePreview
        kind="coaching"
        name={name.trim() || entry.name}
        scene={editor.preview}
        instruction={body}
        onClose={() => setPreviewing(false)}
      />
    )
  }

  return (
    // A full-app takeover, not a page inside the content card (frame 64:50936 is
    // the whole 1440 window on the backdrop, with no rail or pages column). See
    // takeover-parts for the shell.
    <TakeoverSurface data-testid="knowledge-coaching-editor">
      <TakeoverHeader
        mark={
          <TakeoverMark className="bg-[#f5a623]">
            <GardenIcon name="lightbulb-stroke" className="size-4" />
          </TakeoverMark>
        }
        label="Knowledge coaching"
        title={name}
      >
        <RowActionsButton label="More coaching actions" className="mr-1" />
        <Button variant="outline" onClick={() => setPreviewing(true)}>
          Preview
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={() => onSave({ name: name.trim() || entry.name, body })}>
          Save
        </Button>
      </TakeoverHeader>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(300px,35%)] gap-2">
        <section
          aria-labelledby="coaching-instructions-heading"
          className={`min-h-0 overflow-y-auto p-6 ${TAKEOVER_PANEL}`}
        >
          <h2
            id="coaching-instructions-heading"
            className="text-[14px] leading-5 font-semibold text-ink"
          >
            Instructions
          </h2>
          <p className="mt-1 text-[11px] leading-[15px] text-grey-700">
            Write instructions for how your agent should use help center content, including when to
            show articles, what to include or skip, and how to handle outdated content or edge
            cases.
          </p>
          <textarea
            aria-label="Coaching instructions"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 min-h-[118px] w-full resize-none rounded-[14px] border border-grey-500 bg-white px-3 py-2 text-[12px] leading-[17px] text-ink outline-none focus:border-flora-blue focus:ring-1 focus:ring-flora-blue"
          />
          <p className="mt-1 text-[10px] leading-[14px] text-grey-500">Keep it under 100 words</p>
        </section>

        <aside className={`min-h-0 overflow-y-auto p-6 ${TAKEOVER_PANEL}`}>
          <div className="flex items-center gap-2">
            <RowToggle label="Knowledge coaching is on" on={enabled} onToggle={onToggle} />
            <span className="text-[12px] leading-4 text-ink">Knowledge coaching is on</span>
          </div>

          <section
            aria-labelledby="coaching-insights-heading"
            className="mt-5 border-b border-surface-border pb-5"
          >
            <h2
              id="coaching-insights-heading"
              className="text-[14px] leading-5 font-semibold text-ink"
            >
              Insights
            </h2>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <dt className="text-[10px] leading-[14px] text-grey-700">Times applied</dt>
                <dd className="mt-1 text-[18px] leading-6 text-ink">
                  {editor.insights.timesApplied}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] leading-[14px] text-grey-700">Conversations</dt>
                <dd className="mt-1 text-[18px] leading-6 text-ink">
                  {editor.insights.conversations}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] leading-[14px] text-grey-700">Resolutions</dt>
                <dd className="mt-1 whitespace-nowrap text-[18px] leading-6 text-ink">
                  {editor.insights.resolutions}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[10px] leading-[14px] font-semibold text-ink">
              Applied to use cases
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {editor.appliedUseCases.map((useCase) => (
                <UseCaseChip key={useCase} label={useCase} />
              ))}
            </div>
          </section>

          <div className="mt-5 space-y-5">
            <label className="block space-y-2">
              <FieldLabel
                label="Name"
                helper="This name is used to generate and surface relevant insights."
              />
              <input
                aria-label="Coaching name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-9 w-full rounded-full border border-grey-500 bg-white px-3 text-[12px] text-ink outline-none focus:border-flora-blue focus:ring-1 focus:ring-flora-blue"
              />
            </label>

            <div className="space-y-2">
              <FieldLabel
                label="Channel (optional)"
                helper="Applies to selected channels, or all channels if none are selected."
              />
              <div
                aria-label="Selected channels"
                className="flex min-h-10 items-center gap-1 rounded-full border border-grey-500 px-2 py-1"
              >
                {editor.channels.map((channel) => (
                  <SelectionChip key={channel} label={channel} />
                ))}
                <GardenIcon name="chevron-down-stroke" className="ml-auto size-4 text-grey-700" />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel
                label="Segment (optional)"
                helper="Applies to selected segments, or all segments if none are selected."
              />
              <div
                aria-label="Selected segments"
                className="flex min-h-10 items-center gap-1 rounded-full border border-grey-500 px-2 py-1"
              >
                {entry.segments.map((segment) => (
                  <SegmentChip key={segment} label={segment} />
                ))}
                <GardenIcon name="chevron-down-stroke" className="ml-auto size-4 text-grey-700" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </TakeoverSurface>
  )
}
