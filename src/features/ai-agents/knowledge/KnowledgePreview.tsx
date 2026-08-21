// The full-screen preview both Knowledge drill-ins open: a simulated live
// conversation beside the debug panel that explains how the agent answered it.
//
// One component serves coaching rules and content snippets because the surface is
// the same in both cases — only the mark, the label and the scene differ. The
// scene itself is authored per entry (see KnowledgePreviewContent), so previewing
// a rule shows a conversation that rule would actually shape.
import { FileText, Languages, Lightbulb, SlidersHorizontal, Sparkles, Tag } from 'lucide-react'
import { Button } from '@/components/flora/Button'
import { TakeoverHeader, TakeoverMark, TakeoverSurface } from '@/components/takeover-parts'
import { type KnowledgePreviewContent } from './knowledge-data'

export type KnowledgePreviewKind = 'snippet' | 'coaching'

const KINDS: Record<KnowledgePreviewKind, { label: string; testId: string; mark: string }> = {
  snippet: {
    label: 'Content snippet',
    testId: 'content-snippet-preview',
    mark: 'bg-[#3c91a6]',
  },
  coaching: {
    label: 'Knowledge coaching',
    testId: 'knowledge-coaching-preview',
    mark: 'bg-[#f5a623]',
  },
}

function PreviewControl({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-[#20465d] px-3 text-[12px] leading-4 text-[#85bed4] hover:bg-[#28536b]"
    >
      {icon}
      {children}
    </button>
  )
}

function PreviewSelect({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#61717e] px-3 text-left text-[12px] text-[#f2f5f7] hover:bg-white/5"
    >
      {icon}
      <span className="truncate">{children}</span>
      <span className="ml-auto text-[11px] text-[#aab5be]" aria-hidden>
        ⌄
      </span>
    </button>
  )
}

function SupportWidget({ label, scene }: { label: string; scene: KnowledgePreviewContent }) {
  return (
    <section
      aria-label={`${label} conversation preview`}
      className="flex h-[min(620px,calc(100vh-230px))] min-h-[470px] w-full max-w-[440px] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.28)]"
    >
      <header className="flex h-[62px] shrink-0 items-center gap-3 bg-black px-5 text-white">
        <span className="text-[10px] font-semibold tracking-tight">Uber</span>
        <span className="text-[14px]">Uber Rider Support</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-4 overflow-y-auto px-4 pt-8 pb-3 text-[12px] leading-4 text-[#171923]">
        <div className="mr-auto max-w-[72%] rounded-[18px] bg-[#f4f4f5] px-4 py-3">
          Hi there, how may I help you?
        </div>
        <div className="ml-auto max-w-[72%] rounded-[18px] bg-black px-4 py-3 text-white">
          {scene.ask}
        </div>
        <div className="flex items-end gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black text-[8px] font-semibold text-white">
            Uber
          </span>
          <div className="max-w-[78%] whitespace-pre-line rounded-[18px] rounded-bl-[4px] bg-[#f1f1f3] px-4 py-3">
            {scene.reply.join('\n')}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4">
        <div className="flex h-10 items-center rounded-full border border-[#c8cbd0] px-4 text-[12px] text-[#a1a4aa]">
          Ask a question…
        </div>
        <div className="mt-3 text-center text-[10px] text-[#8a8d92]">⌁ Built with Zendesk</div>
      </div>
    </section>
  )
}

function DebugCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#536071] bg-[#1d1d33]/90 p-4 font-mono text-[11px] leading-[18px] text-[#d8dbe4]">
      {children}
    </div>
  )
}

export function KnowledgePreview({
  kind,
  name,
  scene,
  instruction,
  onClose,
}: {
  kind: KnowledgePreviewKind
  name: string
  scene: KnowledgePreviewContent
  /**
   * The coaching editor's live instruction, quoted above the content the agent
   * drew on — previewing after an edit should show the rule as it now reads.
   */
  instruction?: string
  onClose: () => void
}) {
  const { label, testId, mark } = KINDS[kind]

  return (
    <TakeoverSurface
      data-testid={testId}
      // The preview's own backdrop, in place of the editors' light one.
      className="bg-[radial-gradient(circle_at_24%_96%,rgba(55,174,153,0.48),transparent_29%),radial-gradient(circle_at_91%_2%,rgba(103,71,109,0.42),transparent_31%),linear-gradient(135deg,#061c27_0%,#102837_55%,#10212c_100%)]"
    >
      <TakeoverHeader
        dark
        mark={
          <TakeoverMark className={mark}>
            {kind === 'coaching' ? (
              <Lightbulb size={16} aria-hidden />
            ) : (
              <FileText size={16} aria-hidden />
            )}
          </TakeoverMark>
        }
        label={label}
        center={
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-full border border-[#65717c] px-4 text-[13px] text-white hover:bg-white/5"
          >
            Channel: Widget{' '}
            <span className="text-[#aab5be]" aria-hidden>
              ⌄
            </span>
          </button>
        }
      >
        <Button
          variant="outline"
          className="border-white/25 bg-[#f6f6f4] text-ink hover:bg-white"
          onClick={onClose}
        >
          Close
        </Button>
      </TakeoverHeader>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,1fr)_minmax(390px,0.86fr)] gap-[clamp(28px,5vw,88px)] overflow-hidden px-[clamp(28px,6vw,92px)] py-4">
        <div className="flex min-h-0 items-center justify-center">
          <SupportWidget label={label} scene={scene} />
        </div>

        <aside
          aria-label="Preview settings"
          className="min-h-0 overflow-y-auto rounded-[20px] bg-[#182631]/90 p-6 text-white shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
        >
          <h2 className="text-[16px] leading-6 font-semibold">Preview settings</h2>
          <p className="mt-4 text-[12px] leading-4 text-[#94a1ab]">
            Currently previewing all “Live” traffic.
          </p>

          <div className="mt-3 space-y-2">
            <PreviewControl icon={<SlidersHorizontal size={13} aria-hidden />}>
              Select custom filters
            </PreviewControl>
            <PreviewControl icon={<Sparkles size={13} aria-hidden />}>
              Fill in Pre-defined context
            </PreviewControl>
          </div>

          <div className="mt-4 flex gap-2">
            <PreviewSelect icon={<Languages size={14} aria-hidden />}>English</PreviewSelect>
            <PreviewSelect icon={<Tag size={14} aria-hidden />}>All tags</PreviewSelect>
          </div>

          <div className="my-4 border-t border-[#61717e]/60" />

          <div className="space-y-3">
            <DebugCard>
              <p>
                Conversation ID:{' '}
                <span className="text-[#63b2cf]">5471e2cb-0347-41d6-85de-4ff6461f1642</span>
              </p>
              <p>
                Language: <span className="text-[#63b2cf]">English</span>
              </p>
            </DebugCard>

            <DebugCard>
              <p>Agent detection:</p>
              <p className="text-[#e4e6ec]">
                <span className="text-[#5bd08e]">{scene.useCase}</span> [Confidence score: High]
              </p>
              <p className="mt-3">Policy Description:</p>
              <p className="text-[#63b2cf]">{scene.policy}</p>

              <div className="mt-3 rounded-[10px] border border-[#536071] bg-[#1a1a2d] p-3">
                <p className="flex items-center gap-1.5 text-[#e5e7ed]">
                  <span className="size-3 rounded-full bg-[#70c63b]" aria-hidden />
                  {label} - {name}
                </p>
                {instruction ? <p className="mt-4 text-[#9fd6ad]">{instruction}</p> : null}
                {scene.source.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-[#63b2cf]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </DebugCard>
          </div>
        </aside>
      </div>
    </TakeoverSurface>
  )
}
