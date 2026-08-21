// Content snippet drill-in editor — Figma frame 21:2847 (How Ride Pricing Works).
// The rich-text controls and AI suggestion affordances are presentational; the
// article, name, activation state, and scope are local mock content.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bold,
  Braces,
  Check,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  Redo2,
  Sparkles,
  Underline,
  Undo2,
  X,
} from 'lucide-react'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { getAiContext, type AiScope } from '@/features/ai-studio/ai-context-registry'
import { AiStudioShell } from '@/features/ai-studio/AiStudioShell'
import { DefaultAssistantBody } from '@/features/ai-studio/bodies/DefaultAssistantBody'
import { KnowledgeEmergingTopicBody } from '@/features/ai-studio/bodies/KnowledgeEmergingTopicBody'
import { wantsSelfImprovingPlan } from '@/features/ai-studio/self-improving/self-improving-data'
import { Button } from '@/components/flora/Button'
import { GardenIcon } from '@/components/garden-icon'
import { RowActionsButton, RowToggle, SegmentChip } from '@/features/ai-agents/list-parts'
import {
  TAKEOVER_PANEL,
  TakeoverHeader,
  TakeoverMark,
  TakeoverSurface,
} from '@/components/takeover-parts'
import { type ContentSnippetEditorContent, type KnowledgeEntry } from './knowledge-data'
import {
  acceptCancellationSection,
  clearKnowledgeSectionRequest,
  discardCancellationSection,
  type KnowledgeSectionStatus,
  useKnowledgeSectionStatus,
} from './knowledge-section-request-store'
import { KnowledgePreview } from './KnowledgePreview'

type EditorChanges = Pick<KnowledgeEntry, 'name' | 'body'>
type SuggestionId = 'contradiction' | 'rewrite'
type EditorPanel = 'settings' | 'suggestions' | 'rewrite' | 'ai'
type RewriteState = 'idle' | 'pending' | 'accepted'
type SelectionMenu = { text: string; left: number; top: number }
type AiPanelRequest = { scope: AiScope; prompt?: string }

const SELECTION_ACTIONS = [
  {
    label: 'Tighten scope',
    scope: 'agent-builder',
    prompt: (text: string) => `Tighten the scope of this content snippet: “${text}”`,
  },
  {
    label: 'Flag agent behavior drift',
    scope: 'agent-builder',
    prompt: (text: string) => `Check this content for agent behavior drift: “${text}”`,
  },
  {
    label: 'Emerging topic detected',
    scope: 'knowledge-emerging-topic',
    prompt: (text: string) =>
      `Investigate whether this content reflects an emerging topic: “${text}”`,
  },
] as const

const APPLIED_REWRITE =
  'If your final price differs, it’s usually due to a route or time change during the trip. You’ll see a breakdown in your receipt.'

const FORMAT_CONTROLS = [
  { label: 'Undo', Icon: Undo2 },
  { label: 'Redo', Icon: Redo2 },
  { label: 'Bold', Icon: Bold },
  { label: 'Italic', Icon: Italic },
  { label: 'Underline', Icon: Underline },
  { label: 'Bulleted list', Icon: List },
  { label: 'Numbered list', Icon: ListOrdered },
  { label: 'Heading 1', Icon: Heading1 },
  { label: 'Heading 2', Icon: Heading2 },
  { label: 'Heading 3', Icon: Heading3 },
  { label: 'Quote', Icon: Quote },
  { label: 'Code', Icon: Braces },
  { label: 'Link', Icon: Link2 },
] as const

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

function RichTextToolbar() {
  return (
    <div
      role="toolbar"
      aria-label="Content formatting"
      className="inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-[8px] border border-surface-border bg-white px-2 py-1 shadow-sm"
    >
      {FORMAT_CONTROLS.map(({ label, Icon }, index) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          className={`rounded p-1.5 text-grey-700 hover:bg-table-row-hover ${
            index === 2 || index === 5 || index === 7 || index === 10
              ? 'ml-1 border-l border-grey-400 pl-2.5'
              : ''
          }`}
        >
          <Icon size={15} aria-hidden />
        </button>
      ))}
      <button
        type="button"
        className="ml-1 flex items-center gap-1 border-l border-grey-400 py-1 pr-1 pl-2.5 text-[12px] text-ink"
      >
        <Plus size={14} aria-hidden />
        Insert
      </button>
    </div>
  )
}

function SelectionAiMenu({
  selection,
  onChoose,
}: {
  selection: SelectionMenu
  onChoose: (prompt: string, scope?: AiScope) => void
}) {
  return (
    <div
      role="toolbar"
      aria-label="AI Studio suggestions for selected text"
      className="fixed z-50 flex max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-full items-center overflow-hidden rounded-full border border-[#e1e4e8] bg-white p-1 shadow-[0_4px_16px_rgba(31,35,48,0.16)]"
      style={{ left: selection.left, top: selection.top - 8 }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        aria-label="Ask AI Studio about selected text"
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-[#4d73a8] hover:bg-[#eef3f8]"
        onClick={() => onChoose(`Help me improve this selected content: “${selection.text}”`)}
      >
        <Sparkles size={12} aria-hidden />
      </button>
      {SELECTION_ACTIONS.map((action, index) => (
        <button
          key={action.label}
          type="button"
          className={`whitespace-nowrap px-2.5 py-1 text-[10px] leading-4 font-medium text-[#4b4e5d] hover:bg-[#f5f6f7] ${
            index > 0 ? 'border-l border-[#e7e8ea]' : ''
          }`}
          onClick={() => onChoose(action.prompt(selection.text), action.scope)}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

function PricingArticle({
  bodyRef,
  suggestionCount,
  panel,
  rewriteState,
  sectionStatus,
  onDiscardRewrite,
  onAcceptRewrite,
}: {
  bodyRef: React.RefObject<HTMLDivElement | null>
  suggestionCount: number
  panel: EditorPanel
  rewriteState: RewriteState
  sectionStatus: KnowledgeSectionStatus
  onDiscardRewrite: () => void
  onAcceptRewrite: () => void
}) {
  const showSuggestions = panel === 'suggestions'

  return (
    <div
      ref={bodyRef}
      role="textbox"
      aria-label="Content snippet body"
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      className="mt-5 max-w-[680px] outline-none selection:bg-[#bedaf3] [&_h2]:text-[18px] [&_h2]:leading-6 [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-[15px] [&_h3]:leading-5 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_p]:text-[13px] [&_p]:leading-[18px]"
    >
      <h2>How Ride Pricing Works</h2>

      <h3>How are prices calculated?</h3>
      <p>Prices are estimated using data from completed trips, based on:</p>
      <ul className="mt-2 text-[13px] leading-[18px]">
        <li>Ride demand volume</li>
        <li>Traffic</li>
        <li>Tolls</li>
      </ul>
      <p>Business products with add-ons (like priority pick-up) may cost more.</p>

      <h3>Upfront pricing</h3>
      <p>
        In most cities, you’ll see an upfront price when booking. It’s based on estimated trip
        length and may include:
      </p>
      <ul className="mt-2 text-[13px] leading-[18px]">
        <li>Base rate</li>
        <li>Tolls and surcharges</li>
        <li>High-demand pricing</li>
        <li>Booking fee</li>
        <li>Route-based adjustments</li>
      </ul>
      <div className="mt-2">
        <div className="flex items-start gap-3">
          <p className="mt-0 flex-1">
            <span className={showSuggestions ? 'bg-[#fff8df]' : undefined}>
              You’re charged the upfront price when the trip ends.
            </span>
            {rewriteState === 'idle' ? (
              <>
                {' '}
                <span className={showSuggestions ? 'bg-[#eef0f2]' : undefined}>
                  In rare cases, the final price may differ.
                </span>
              </>
            ) : rewriteState === 'accepted' ? (
              <> {APPLIED_REWRITE}</>
            ) : null}
          </p>
          {panel === 'settings' && rewriteState === 'idle' ? (
            <span
              contentEditable={false}
              className="mt-0.5 shrink-0 rounded-full bg-[#f6f4ee] px-2 py-1 text-[10px] leading-3 font-medium text-ink"
            >
              ✦ {suggestionCount} suggestions
            </span>
          ) : null}
        </div>

        {rewriteState === 'pending' ? (
          <div contentEditable={false} className="mt-2 flex items-center gap-2">
            <p className="mt-0 flex-1 rounded-r-[8px] border-l-2 border-[#3a9a91] bg-[#f4f7f7] px-2 py-1.5 text-[12px] leading-4 text-ink">
              {APPLIED_REWRITE}
            </p>
            <button
              type="button"
              aria-label="Discard applied rewrite"
              className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[#fff3f1] text-[#c64a3d] hover:bg-[#ffe7e3]"
              onClick={onDiscardRewrite}
            >
              <X size={14} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Confirm applied rewrite"
              className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[#ecf8f2] text-[#1b7f65] hover:bg-[#ddf2e8]"
              onClick={onAcceptRewrite}
            >
              <Check size={14} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
      <p className="italic">
        Note: On Uber Health and Central, upfront pricing applies to scheduled and immediate rides;
        flexible rides show price estimates only. Some cities don’t support upfront pricing, or only
        offer it for real-time rides.
      </p>

      <h3>Will I pay tolls or surcharges?</h3>
      <p>Estimated tolls and surcharges may apply to:</p>
      <ul className="mt-2 text-[13px] leading-[18px]">
        <li>Trips to/from airports, events, seaports, stadiums, and other venues</li>
        <li>Government fees on rideshare services</li>
      </ul>
      <p>
        If your upfront price already factored in an estimated toll/surcharge, it&apos;s included
        automatically.
      </p>
      <p>Surcharges may be:</p>
      <ul className="mt-2 text-[13px] leading-[18px]">
        <li>Kept by the driver</li>
        <li>Paid by the driver to Uber or related entities</li>
        <li>Passed through (in full or part) to a government agency or third party</li>
      </ul>
      <p>
        Tolls/surcharges can also apply after the trip, which may cause your final price to differ
        from the <u>upfront price</u> shown at booking.
      </p>

      {sectionStatus !== 'idle' ? (
        <div className={sectionStatus === 'draft' ? 'mt-5 flex items-center gap-2' : 'mt-5'}>
          <div
            className={
              sectionStatus === 'draft'
                ? 'min-w-0 flex-1 rounded-r-[8px] border-l-2 border-[#3a9a91] bg-[#f1f8f7] px-3 py-2'
                : undefined
            }
          >
            <h3 className="mt-0!">Will I pay tolls if I cancel my ride?</h3>
            <p>
              If you cancel a ride after it&apos;s already underway, any tolls or surcharges
              incurred up to that point may still appear on your final charge — they&apos;re
              calculated the same way as they would be for a completed trip. If no toll was incurred
              before you canceled, you won&apos;t be charged one.
            </p>
            <p>
              If you believe a toll was charged in error after a cancellation, you can request a
              correction using the same process as a completed trip.
            </p>
          </div>

          {sectionStatus === 'draft' ? (
            <div contentEditable={false} className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label="Discard added section"
                className="flex size-7 items-center justify-center rounded-[8px] bg-[#fff3f1] text-[#c64a3d] hover:bg-[#ffe7e3]"
                onClick={discardCancellationSection}
              >
                <X size={14} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Confirm added section"
                className="flex size-7 items-center justify-center rounded-[8px] bg-[#ecf8f2] text-[#1b7f65] hover:bg-[#ddf2e8]"
                onClick={acceptCancellationSection}
              >
                <Check size={14} aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function SuggestionCard({
  id,
  kind,
  title,
  description,
  detail,
  evidence,
  primaryAction,
  onDismiss,
  onPrimary,
}: {
  id: SuggestionId
  kind: string
  title: string
  description: string
  detail: string
  evidence: string
  primaryAction: string
  onDismiss: (id: SuggestionId) => void
  onPrimary: (id: SuggestionId) => void
}) {
  const isContradiction = id === 'contradiction'

  return (
    <article
      data-testid={`content-suggestion-${id}`}
      className="overflow-hidden rounded-[14px] border border-surface-border bg-white shadow-sm"
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 text-[11px] leading-4 font-semibold text-ink ${
          isContradiction ? 'bg-[#fff7df]' : 'bg-[#edf1fb]'
        }`}
      >
        {isContradiction ? (
          <AlertTriangle size={13} className="text-[#8b6b18]" aria-hidden />
        ) : (
          <Sparkles size={13} className="text-[#4d649d]" aria-hidden />
        )}
        {kind}
      </div>

      <div className="space-y-3 px-4 py-3 text-[10px] leading-[14px] text-[#4b4e5d]">
        <h3 className="text-[11px] leading-4 font-semibold text-ink">{title}</h3>
        <p>{description}</p>
        {detail ? <p>{detail}</p> : null}
        {evidence ? (
          <p className="rounded-[8px] bg-[#f7f7f6] p-2 text-[9px] leading-3 text-grey-700">
            {evidence}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="min-w-0 px-2 text-[10px]"
            onClick={() => onDismiss(id)}
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="min-w-0 px-2 text-[10px]"
            onClick={() => onPrimary(id)}
          >
            {primaryAction}
          </Button>
        </div>
      </div>
    </article>
  )
}

function ContentSuggestions({
  dismissed,
  onDismiss,
  onApplyRewrite,
}: {
  dismissed: Set<SuggestionId>
  onDismiss: (id: SuggestionId) => void
  onApplyRewrite: () => void
}) {
  return (
    <aside aria-label="Content suggestions" className="mt-20 space-y-3">
      {!dismissed.has('contradiction') ? (
        <SuggestionCard
          id="contradiction"
          kind="Contradiction"
          title={'Conflicts with “Fare Adjustments” article'}
          description="This article says you’re charged when the trip ends. The Fare Adjustments article states the upfront price is charged at booking confirmation, with adjustments processed after."
          detail=""
          evidence={'Conflicting source: /articles/fare-adjustments, section “Payment timing”'}
          primaryAction="Reconcile"
          onDismiss={onDismiss}
          onPrimary={onDismiss}
        />
      ) : null}

      {!dismissed.has('rewrite') ? (
        <SuggestionCard
          id="rewrite"
          kind="Rewrite"
          title="Vague phrasing lowers resolution confidence"
          description={
            '“In rare cases” doesn’t tell the customer what to expect or when to escalate.'
          }
          detail={
            'Suggestion: “If your final price differs, it’s usually due to a route or time change during the trip. You’ll see a breakdown in your receipt.”'
          }
          evidence={
            '5 flagged interactions this month where the bot repeated this line without resolving the follow-up “why did my price change”.'
          }
          primaryAction="Apply rewrite"
          onDismiss={onDismiss}
          onPrimary={onApplyRewrite}
        />
      ) : null}
    </aside>
  )
}

export function ContentSnippetEditor({
  entry,
  editor,
  enabled,
  onToggle,
  onClose,
  onSave,
}: {
  entry: KnowledgeEntry
  editor: ContentSnippetEditorContent
  enabled: boolean
  onToggle: () => void
  onClose: () => void
  onSave: (changes: EditorChanges) => void
}) {
  const { open } = useAiAssistant()
  const articleTitle = entry.body.split('\n')[0] || entry.name
  const [name, setName] = useState(editor.settingsName)
  const [panel, setPanel] = useState<EditorPanel>('settings')
  const [previewing, setPreviewing] = useState(false)
  const [rewriteState, setRewriteState] = useState<RewriteState>('idle')
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<SuggestionId>>(
    () => new Set(),
  )
  const bodyRef = useRef<HTMLDivElement>(null)
  const editorScrollRef = useRef<HTMLElement>(null)
  const [selectionMenu, setSelectionMenu] = useState<SelectionMenu | null>(null)
  const [aiRequest, setAiRequest] = useState<AiPanelRequest>({ scope: 'knowledge-emerging-topic' })
  const [aiDraft, setAiDraft] = useState<string | null>(null)
  const sectionStatus = useKnowledgeSectionStatus()
  const hasSuggestions = dismissedSuggestions.size < 2
  const aiComposerValue = aiDraft ?? aiRequest.prompt ?? ''

  const updateSelectionMenu = useCallback(() => {
    const selection = window.getSelection()
    const body = bodyRef.current
    if (!selection || !body || selection.isCollapsed || selection.rangeCount === 0) {
      setSelectionMenu(null)
      return
    }

    const range = selection.getRangeAt(0)
    const selectedNode =
      range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentNode
        : range.commonAncestorContainer
    const text = selection.toString().replace(/\s+/g, ' ').trim()
    if (!selectedNode || !body.contains(selectedNode) || !text) {
      setSelectionMenu(null)
      return
    }

    const rect = range.getBoundingClientRect()
    if (!rect.width && !rect.height) return
    setSelectionMenu({
      text,
      left: Math.min(Math.max(rect.left + rect.width / 2, 220), window.innerWidth - 220),
      top: Math.max(rect.top, 44),
    })
  }, [])

  useEffect(() => {
    const editorScroll = editorScrollRef.current
    document.addEventListener('selectionchange', updateSelectionMenu)
    window.addEventListener('resize', updateSelectionMenu)
    editorScroll?.addEventListener('scroll', updateSelectionMenu)
    return () => {
      document.removeEventListener('selectionchange', updateSelectionMenu)
      window.removeEventListener('resize', updateSelectionMenu)
      editorScroll?.removeEventListener('scroll', updateSelectionMenu)
    }
  }, [updateSelectionMenu])

  useEffect(() => () => clearKnowledgeSectionRequest(), [])

  const openAiPanel = (request: AiPanelRequest) => {
    setAiRequest(request)
    setAiDraft(null)
    setPanel('ai')
  }

  const openSelectionSuggestion = (prompt: string, scope: AiScope = 'agent-builder') => {
    openAiPanel(scope === 'knowledge-emerging-topic' ? { scope } : { scope, prompt })
    setSelectionMenu(null)
    window.getSelection()?.removeAllRanges()
  }

  const openContentAssistant = () => openAiPanel({ scope: 'knowledge-emerging-topic' })

  // A health ask escalates into the real full-screen survey, same as every
  // other AI Studio entry point; anything else stays the inert mock it is
  // everywhere the panel has no scope-specific submit of its own.
  const escalateToHealthSurvey = (text: string) => {
    if (!wantsSelfImprovingPlan(text)) return false
    open('self-improving', 'full', {})
    return true
  }

  const submitAiPanelAsk = () => {
    escalateToHealthSurvey(aiComposerValue.trim())
  }

  const pickAiSuggestion = (text: string) => {
    if (!escalateToHealthSurvey(text)) setAiDraft(text)
  }

  const showSuggestions = () => {
    setPanel(hasSuggestions ? 'suggestions' : 'rewrite')
  }

  const dismissSuggestion = (id: SuggestionId) => {
    const next = new Set([...dismissedSuggestions, id])
    setDismissedSuggestions(next)
    if (next.size === 2) {
      setPanel('rewrite')
      if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0
    }
  }

  if (previewing) {
    return (
      <KnowledgePreview
        kind="snippet"
        name={name.trim() || entry.name}
        scene={editor.preview}
        onClose={() => setPreviewing(false)}
      />
    )
  }

  return (
    <TakeoverSurface data-testid="content-snippet-editor">
      <TakeoverHeader
        mark={
          <TakeoverMark className="bg-[#3c91a6]">
            <FileText size={16} aria-hidden />
          </TakeoverMark>
        }
        label="Content Snippet"
        title={articleTitle}
      >
        <RowActionsButton label="More content snippet actions" className="mr-1" />
        <Button variant="outline" onClick={() => setPreviewing(true)}>
          Preview
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onSave({
              name: name.trim() || entry.name,
              body:
                bodyRef.current?.innerText
                  .replace(`✦ ${editor.suggestionCount} suggestions`, '')
                  .replace(/\n{3,}/g, '\n\n')
                  .trim() ?? entry.body,
            })
          }
        >
          Save
        </Button>
      </TakeoverHeader>

      <div
        className={`grid min-h-0 flex-1 gap-2 ${
          panel === 'settings' || panel === 'ai'
            ? 'grid-cols-[minmax(0,1fr)_minmax(320px,35%)]'
            : 'grid-cols-1'
        }`}
      >
        <section
          ref={editorScrollRef}
          className={`relative min-h-0 overflow-y-auto px-8 py-5 pr-[68px] ${TAKEOVER_PANEL}`}
        >
          <div
            className={`mx-auto w-full ${
              panel === 'suggestions' ? 'max-w-[760px]' : 'max-w-[680px]'
            }`}
          >
            <RichTextToolbar />
            <div
              className={
                panel === 'suggestions'
                  ? 'grid grid-cols-[minmax(0,1fr)_minmax(220px,260px)] items-start gap-8'
                  : undefined
              }
            >
              <PricingArticle
                bodyRef={bodyRef}
                suggestionCount={editor.suggestionCount}
                panel={panel}
                rewriteState={rewriteState}
                sectionStatus={sectionStatus}
                onDiscardRewrite={() => {
                  setRewriteState('idle')
                  setPanel('suggestions')
                  if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0
                }}
                onAcceptRewrite={() => {
                  setRewriteState('accepted')
                  setDismissedSuggestions((current) => new Set([...current, 'rewrite']))
                  setPanel('suggestions')
                  if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0
                }}
              />
              {panel === 'suggestions' ? (
                <ContentSuggestions
                  dismissed={dismissedSuggestions}
                  onDismiss={dismissSuggestion}
                  onApplyRewrite={() => {
                    setRewriteState('pending')
                    setPanel('rewrite')
                    if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0
                  }}
                />
              ) : null}
            </div>
          </div>

          {panel !== 'settings' && panel !== 'ai' ? (
            <div className="absolute top-5 right-4 flex flex-col items-center gap-3 text-grey-700">
              <button
                type="button"
                aria-label="Open settings panel"
                className="flex size-7 items-center justify-center rounded-full border border-surface-border bg-white hover:bg-table-row-hover"
                onClick={() => setPanel('settings')}
              >
                <FileText size={14} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Open AI Studio for this content"
                className="flex size-7 items-center justify-center rounded-full border border-surface-border bg-white text-[#4d649d] hover:bg-[#edf1fb]"
                onClick={openContentAssistant}
              >
                <Sparkles size={14} aria-hidden />
              </button>
            </div>
          ) : null}
        </section>

        {panel === 'settings' || panel === 'ai' ? (
          <aside
            className={`grid min-h-0 grid-cols-[minmax(0,1fr)_44px] overflow-hidden ${TAKEOVER_PANEL}`}
          >
            {panel === 'ai' ? (
              <AiStudioShell
                onClose={() => setPanel('settings')}
                onExpand={() =>
                  open(
                    aiRequest.scope,
                    'full',
                    aiRequest.prompt ? { prompt: aiRequest.prompt } : undefined,
                  )
                }
                composerValue={aiComposerValue}
                onComposerChange={setAiDraft}
                onComposerSubmit={submitAiPanelAsk}
              >
                {aiRequest.scope === 'knowledge-emerging-topic' ? (
                  <KnowledgeEmergingTopicBody />
                ) : (
                  <DefaultAssistantBody
                    context={getAiContext(aiRequest.scope)}
                    onSuggestion={pickAiSuggestion}
                  />
                )}
              </AiStudioShell>
            ) : (
              <div className="min-h-0 overflow-y-auto p-6">
                <div className="flex items-center gap-2">
                  <RowToggle label="Content snippet is on" on={enabled} onToggle={onToggle} />
                  <span className="text-[12px] leading-4 text-ink">Content snippet is on</span>
                  <button
                    type="button"
                    aria-label="Close settings panel"
                    className="ml-auto rounded p-1 text-grey-700 hover:bg-table-row-hover"
                    onClick={showSuggestions}
                  >
                    <X size={14} aria-hidden />
                  </button>
                </div>

                <section
                  aria-labelledby="snippet-insights-heading"
                  className="mt-5 border-b border-surface-border pb-5"
                >
                  <h2
                    id="snippet-insights-heading"
                    className="text-[14px] leading-5 font-semibold text-ink"
                  >
                    Insights
                  </h2>
                  <dl className="mt-4 grid grid-cols-3 gap-3">
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
                    Targeted article
                  </p>
                  <a
                    href="#targeted-article"
                    className="mt-1.5 inline-block text-[11px] leading-4 text-[#2f83d7] underline"
                  >
                    {editor.targetedArticle}
                  </a>
                </section>

                <div className="mt-5 space-y-5">
                  <label className="block space-y-2">
                    <FieldLabel
                      label="Name"
                      helper="This name is used to generate and surface relevant insights."
                    />
                    <input
                      aria-label="Content snippet name"
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
                      <GardenIcon
                        name="chevron-down-stroke"
                        className="ml-auto size-4 text-grey-700"
                      />
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
                      <GardenIcon
                        name="chevron-down-stroke"
                        className="ml-auto size-4 text-grey-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-3 border-l border-surface-border pt-5 text-grey-700">
              <button
                type="button"
                aria-label="Open settings panel"
                aria-pressed={panel === 'settings'}
                className={`flex size-7 items-center justify-center rounded-full ${
                  panel === 'settings' ? 'bg-[#eef0f2] text-ink' : 'hover:bg-table-row-hover'
                }`}
                onClick={() => setPanel('settings')}
              >
                <FileText size={14} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Open AI Studio for this content"
                aria-pressed={panel === 'ai'}
                className={`flex size-7 items-center justify-center rounded-full text-[#4d649d] ${
                  panel === 'ai' ? 'bg-[#eef0f2]' : 'hover:bg-[#edf1fb]'
                }`}
                onClick={openContentAssistant}
              >
                <Sparkles size={14} aria-hidden />
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      {/* Outside the panels: `fixed` positioning needs a root with no backdrop
          filter of its own, or the menu would be laid against the panel instead
          of the viewport it measures the selection in. */}
      {selectionMenu ? (
        <SelectionAiMenu selection={selectionMenu} onChoose={openSelectionSuggestion} />
      ) : null}
    </TakeoverSurface>
  )
}
