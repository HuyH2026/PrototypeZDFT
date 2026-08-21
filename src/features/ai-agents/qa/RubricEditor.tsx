import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { GardenIcon } from '@/components/garden-icon'
import { RowToggle, SegmentChip } from '@/features/ai-agents/list-parts'
import {
  TAKEOVER_PANEL,
  TakeoverHeader,
  TakeoverMark,
  TakeoverSurface,
} from '@/components/takeover-parts'
import { cn } from '@/lib/cn'
import {
  type Rubric,
  type RubricChannel,
  type RubricScoring,
  type RubricTestResult,
} from './rubrics-data'

export type RubricEditorChanges = Pick<
  Rubric,
  'name' | 'channels' | 'definition' | 'excludedFromAverage' | 'scoring'
>

function FieldLabel({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div>
      <p className="text-[14px] leading-5 font-semibold text-ink">{children}</p>
      {helper ? <p className="mt-0.5 text-[11px] leading-4 text-grey-700">{helper}</p> : null}
    </div>
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

function SelectionField({
  label,
  channels,
  segments,
}: {
  label: string
  channels?: string[]
  segments?: string[]
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex min-h-10 items-center gap-1 rounded-full border border-grey-500 bg-white px-3 py-1"
    >
      {channels?.map((channel) => (
        <SelectionChip key={channel} label={channel} />
      ))}
      {segments?.map((segment) => (
        <SegmentChip key={segment} label={segment} />
      ))}
      <GardenIcon name="chevron-down-stroke" className="ml-auto size-4 text-grey-700" />
    </div>
  )
}

function scopeSegments(channels: RubricChannel[], channel: string) {
  return channels.find((scope) => scope.channel === channel)?.segments ?? []
}

function TestResultCard({ result }: { result: RubricTestResult }) {
  return (
    <article className="rounded-[16px] border border-surface-border bg-white p-4">
      <p className="truncate text-[12px] leading-4 font-semibold text-[#5172ad]">
        {result.conversationId}
      </p>
      <dl className="mt-3 grid grid-cols-[72px_42px_minmax(0,1fr)] gap-2 border-t border-surface-border pt-3 text-[11px] leading-4">
        <div>
          <dt className="font-semibold text-ink">Label</dt>
          <dd className="mt-4 text-ink">{result.label}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Score</dt>
          <dd
            className={cn(
              'mt-4 font-semibold',
              result.score == null
                ? 'text-grey-700'
                : result.score >= 80
                  ? 'text-[#188b80]'
                  : 'text-[#a8641a]',
            )}
          >
            {result.score ?? 'n/a'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Prediction reasoning</dt>
          <dd className="mt-4 text-ink">{result.predictionReasoning}</dd>
        </div>
      </dl>
    </article>
  )
}

export function RubricEditor({
  rubric,
  enabled,
  isNew = false,
  onToggle,
  onClose,
  onSave,
}: {
  rubric: Rubric
  enabled: boolean
  isNew?: boolean
  onToggle: () => void
  onClose: () => void
  onSave: (changes: RubricEditorChanges) => void
}) {
  const [name, setName] = useState(rubric.name)
  const [definition, setDefinition] = useState(rubric.definition)
  const [excludedFromAverage, setExcludedFromAverage] = useState(
    Boolean(rubric.excludedFromAverage),
  )
  const [scoring, setScoring] = useState<RubricScoring>(rubric.scoring)
  const [testRun, setTestRun] = useState(false)

  const selectedChannels = rubric.channels.map((scope) => scope.channel)
  const widgetSegments = scopeSegments(rubric.channels, 'Widget')
  const voiceSegments = scopeSegments(rubric.channels, 'Voice')

  return (
    // Full-app takeover, like the Knowledge drill-ins — see takeover-parts.
    <TakeoverSurface data-testid="rubric-editor">
      <TakeoverHeader
        mark={
          <TakeoverMark className="bg-[#3d6f78]">
            <Sparkles size={16} aria-hidden />
          </TakeoverMark>
        }
        label="Rubric"
        title={isNew ? 'Create rubric' : name}
      >
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onSave({
              name: name.trim() || rubric.name,
              channels: rubric.channels,
              definition,
              excludedFromAverage,
              scoring,
            })
          }
        >
          Save
        </Button>
      </TakeoverHeader>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] gap-2">
        <section
          aria-label="Rubric settings"
          className={`min-h-0 overflow-y-auto p-6 ${TAKEOVER_PANEL}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <RowToggle label="Rubric enabled" on={enabled} onToggle={onToggle} />
            <span className="text-[13px] leading-4 text-ink">Rubric enabled</span>
            <label className="ml-2 inline-flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={excludedFromAverage}
                onChange={(event) => setExcludedFromAverage(event.target.checked)}
                className="size-4 accent-[#576cbb]"
              />
              Exclude in the average QA score
              <GardenIcon name="info-stroke" className="size-4 text-grey-700" />
            </label>
          </div>

          <p className="mt-5 max-w-[780px] text-[13px] leading-[19px] text-ink">
            Organizations can configure AI-driven QA criteria that analyze AI conversations and
            measure response quality, resolution efficiency, and customer satisfaction.
          </p>

          <div className="mt-6 space-y-5">
            <label className="block space-y-2">
              <FieldLabel>Name</FieldLabel>
              <input
                aria-label="Rubric name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 w-full rounded-full border border-grey-500 bg-white px-4 text-[13px] text-ink outline-none focus:border-flora-blue focus:ring-1 focus:ring-flora-blue"
              />
            </label>

            <div className="space-y-2">
              <FieldLabel helper="The AI Agent rubric can be shared across multiple channels or limited to specific ones. If no channels are assigned, it applies to all.">
                Channel (optional)
              </FieldLabel>
              <SelectionField label="Selected channels" channels={selectedChannels} />
            </div>

            {selectedChannels.includes('Widget') ? (
              <div className="space-y-2">
                <FieldLabel helper="The rubric can be shared across multiple segments or limited to one. If no segments are selected, it applies to all segments.">
                  Widget Segment (optional)
                </FieldLabel>
                <SelectionField label="Selected Widget segments" segments={widgetSegments} />
              </div>
            ) : null}

            {selectedChannels.includes('Voice') ? (
              <div className="space-y-2">
                <FieldLabel helper="The rubric can be shared across multiple segments or limited to one. If no segments are selected, it applies to all segments.">
                  Voice Segment (optional)
                </FieldLabel>
                <SelectionField label="Selected Voice segments" segments={voiceSegments} />
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-surface-border pt-6">
            <FieldLabel>Definition</FieldLabel>
            <p className="mt-1 text-[13px] leading-[19px] text-ink">
              Define AI QA criteria to evaluate response quality, resolution efficiency, and
              customer satisfaction.
            </p>
            <textarea
              aria-label="Rubric definition"
              value={definition}
              onChange={(event) => setDefinition(event.target.value)}
              className="mt-2 min-h-[194px] w-full resize-y rounded-[16px] border border-grey-500 bg-white px-4 py-3 text-[13px] leading-[19px] text-ink outline-none focus:border-flora-blue focus:ring-1 focus:ring-flora-blue"
            />
          </div>

          <div className="mt-6 border-t border-surface-border pt-6">
            <h2 className="text-[14px] leading-5 font-semibold text-ink">Scoring</h2>
            <div className="mt-4">
              <FieldLabel>Format</FieldLabel>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  aria-label="Scoring format"
                  value={scoring.format}
                  onChange={() => undefined}
                  className="h-10 min-w-[240px] rounded-full border border-grey-500 bg-white px-4 text-[13px] text-ink outline-none"
                >
                  <option>Numerical Scale</option>
                </select>
                <select
                  aria-label="Minimum score"
                  value={scoring.minimum}
                  onChange={(event) =>
                    setScoring((current) => ({
                      ...current,
                      minimum: Number(event.target.value),
                    }))
                  }
                  className="h-10 w-[100px] rounded-full border border-grey-500 bg-white px-4 text-[13px] text-ink outline-none"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                </select>
                <span className="text-[13px] text-ink">to</span>
                <select
                  aria-label="Maximum score"
                  value={scoring.maximum}
                  onChange={(event) =>
                    setScoring((current) => ({
                      ...current,
                      maximum: Number(event.target.value),
                    }))
                  }
                  className="h-10 w-[100px] rounded-full border border-grey-500 bg-white px-4 text-[13px] text-ink outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <label className="mt-5 block space-y-2">
              <FieldLabel>Definition</FieldLabel>
              <textarea
                aria-label="Scoring definition"
                value={scoring.definition}
                onChange={(event) =>
                  setScoring((current) => ({ ...current, definition: event.target.value }))
                }
                className="min-h-[132px] w-full resize-y rounded-[16px] border border-grey-500 bg-white px-4 py-3 text-[13px] leading-[19px] text-ink outline-none focus:border-flora-blue focus:ring-1 focus:ring-flora-blue"
              />
            </label>
            <p className="mt-1 text-[11px] leading-4 text-grey-700">
              An n/a value is automatically applied when there isn’t enough user response to
              generate a score.
            </p>

            <label className="mt-4 flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={scoring.performanceGoal != null}
                onChange={(event) =>
                  setScoring((current) => ({
                    ...current,
                    performanceGoal: event.target.checked ? 4 : null,
                  }))
                }
                className="size-4 accent-[#576cbb]"
              />
              Performance goal is applied
            </label>

            {scoring.performanceGoal != null ? (
              <div className="mt-3 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <input
                    type="range"
                    aria-label="Performance goal"
                    min={0}
                    max={5}
                    step={1}
                    value={scoring.performanceGoal}
                    onChange={(event) =>
                      setScoring((current) => ({
                        ...current,
                        performanceGoal: Number(event.target.value),
                      }))
                    }
                    className="w-full accent-black"
                  />
                  <div className="flex justify-between text-[11px] text-grey-700">
                    <span>0</span>
                    <span>3</span>
                    <span>5</span>
                  </div>
                </div>
                <output className="flex h-9 w-14 items-center justify-center rounded-full border border-grey-500 text-[13px] text-ink">
                  {scoring.performanceGoal}
                </output>
              </div>
            ) : null}
          </div>
        </section>

        <aside
          aria-label="Test conversation"
          className={`min-h-0 overflow-y-auto p-6 ${TAKEOVER_PANEL}`}
        >
          <h2 className="text-[18px] leading-6 font-semibold text-ink">Test conversation</h2>
          <label className="mt-7 block space-y-2">
            <FieldLabel>Select a test method</FieldLabel>
            <select
              aria-label="Test method"
              value={rubric.testMethod}
              onChange={() => undefined}
              className="h-10 w-full rounded-full border border-grey-500 bg-white px-4 text-[13px] text-ink outline-none"
            >
              <option>{rubric.testMethod}</option>
            </select>
          </label>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setTestRun(true)}
          >
            Test
          </Button>
          {testRun ? (
            <p role="status" className="mt-2 text-[11px] leading-4 text-[#188b80]">
              Test complete — 10 recent conversations scored.
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            {rubric.testResults.map((result) => (
              <TestResultCard key={result.conversationId} result={result} />
            ))}
          </div>
        </aside>
      </div>
    </TakeoverSurface>
  )
}
