// The Autoflow policy editor: a formatting toolbar over a document of prose
// segments (editable) interleaved with static entity chips. A react-dnd drop
// zone at the end of the prose inserts a chip derived from the dragged step.
import { useState } from 'react'
import {
  Undo2, Redo2, Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Code2, Link2, Plus, Sparkles,
} from 'lucide-react'
import { useDrop } from 'react-dnd'
import {
  chipVariantForStep, nextId, insertChip, insertChipInProse, STEP_TITLE,
  type PolicyChip, type PolicyDoc, type PolicySegment,
} from '../agent-store'
import { PolicyChipView } from './PolicyChipView'
import { EDITOR_BODY_INDENT } from './editor-data'
import { EDITOR_DND_TYPE, type StepDragItem } from './StepsPalette'
import { SlashMenu } from './SlashMenu'
import type { SlashMenuItem } from './slash-menu-data'
import { Card } from '@/components/flora/Card'

const TOOLBAR = [Undo2, Redo2, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Code2, Link2]

// Counts the characters between the start of `root` and the current caret, so
// the '/' trigger works whether the prose span already has a text node or is
// still empty when the first character lands in it.
function caretOffsetWithin(root: Node): number {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return -1
  const preRange = selection.getRangeAt(0).cloneRange()
  preRange.selectNodeContents(root)
  preRange.setEnd(selection.getRangeAt(0).endContainer, selection.getRangeAt(0).endOffset)
  return preRange.toString().length
}

type SlashMenuState = { segmentId: string; caretOffset: number; left: number; top: number }

export function PolicyEditor({ doc, onChange }: { doc: PolicyDoc; onChange: (doc: PolicyDoc) => void }) {
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)

  const editProse = (id: string, text: string) =>
    onChange({ ...doc, segments: doc.segments.map((s) => (s.kind === 'prose' && s.id === id ? { ...s, text } : s)) })

  const handleProseInput = (segmentId: string) => (event: React.FormEvent<HTMLSpanElement>) => {
    const el = event.currentTarget
    const text = el.textContent ?? ''
    const caretOffset = caretOffsetWithin(el)

    if (caretOffset > 0 && text[caretOffset - 1] === '/') {
      const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect()
      setSlashMenu({
        segmentId,
        caretOffset,
        left: Math.min(rect?.left ?? 0, window.innerWidth - 316),
        top: (rect?.bottom ?? 0) + 6,
      })
    } else if (slashMenu?.segmentId === segmentId) {
      setSlashMenu(null)
    }
  }

  const handleChooseSlashItem = (item: SlashMenuItem) => {
    if (!slashMenu || item.variant === null) return
    const chip: PolicyChip = { kind: 'chip', id: nextId('c'), variant: item.variant, label: item.label }
    onChange(insertChipInProse(doc, slashMenu.segmentId, slashMenu.caretOffset, chip))
    setSlashMenu(null)
  }

  const [{ isOver }, drop] = useDrop<StepDragItem, void, { isOver: boolean }>({
    accept: EDITOR_DND_TYPE,
    collect: (m) => ({ isOver: m.isOver() }),
    drop: (item) => {
      const chip = { kind: 'chip' as const, id: nextId('c'), variant: chipVariantForStep(item.stepType), label: STEP_TITLE[item.stepType] }
      onChange(insertChip(doc, doc.segments.length, chip))
    },
  })

  return (
    <div className="flex flex-1 flex-col">
      {/* Formatting toolbar */}
      <Card flat className="mb-5 flex w-fit items-center gap-1 rounded-xl px-3 py-2">
        {TOOLBAR.map((Icon, i) => (
          <button key={i} type="button" className="rounded p-1.5 text-ink-muted hover:bg-[#f4f3f1]" tabIndex={-1}>
            <Icon size={18} aria-hidden />
          </button>
        ))}
        <button type="button" className="ml-2 flex items-center gap-1 rounded-lg border border-surface-border px-3 py-1.5 text-[14px] text-ink">
          <Plus size={16} aria-hidden /> Insert
        </button>
      </Card>

      <h2 className="mb-2 flex items-center gap-2 text-[18px] font-medium leading-6 text-ink">
        <span
          className="flex size-6 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg,#724be8,#1f73b7)' }}
        >
          <Sparkles size={14} aria-hidden />
        </span>
        {doc.title}
      </h2>

      {/* Document: prose segments (editable) + inline chips. Indented to the
          heading's text, and `whitespace-pre-wrap` so the policy keeps the line
          breaks the design gives it rather than running together as one
          paragraph. */}
      <div
        style={{ paddingInlineStart: EDITOR_BODY_INDENT }}
        className="whitespace-pre-wrap break-words text-[14px] leading-6 tracking-[-0.03px] text-ink"
      >
        {doc.segments.map((seg: PolicySegment) =>
          seg.kind === 'prose' ? (
            <span
              key={seg.id}
              data-testid={`policy-prose-${seg.id}`}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editProse(seg.id, e.currentTarget.textContent ?? '')}
              onInput={handleProseInput(seg.id)}
              className="whitespace-pre-wrap outline-none"
            >
              {seg.text}
            </span>
          ) : (
            <PolicyChipView key={seg.id} chip={seg} />
          ),
        )}
      </div>

      {/* Inline drop zone: a solid divider with a centered "Drop it here" pill. */}
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        style={{ marginInlineStart: EDITOR_BODY_INDENT }}
        className="relative mt-4 flex h-6 items-center justify-center"
      >
        <span
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-colors"
          style={{ backgroundColor: isOver ? '#1f73b7' : '#e2e0dd' }}
          aria-hidden
        />
        <span
          className="relative rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
          style={{
            backgroundColor: isOver ? '#1f73b7' : '#0d212d',
            color: '#fff',
          }}
        >
          Drop it here
        </span>
      </div>

      {slashMenu && (
        <SlashMenu
          position={{ left: slashMenu.left, top: slashMenu.top }}
          onChoose={handleChooseSlashItem}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  )
}
