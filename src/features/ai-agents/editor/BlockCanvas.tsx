// The block canvas below the policy prose. Accepts step drops (append a block
// card), supports reordering existing cards, removing them, and — for
// condition-type blocks — an expandable body of editable/removable rows.
import { useRef } from 'react'
import { X, GripVertical, ChevronDown, ChevronUp, CircleAlert, Plus } from 'lucide-react'
import { useDrag, useDrop } from 'react-dnd'
import {
  appendBlock, createCanvasBlock, moveBlock, nextBlockOrdinal, removeBlock, nextId,
  addConditionRow, editConditionRow, removeConditionRow, toggleBlockCollapse,
  type CanvasBlock, type ConditionRow,
} from '../agent-store'
import { STEP_ICON, STEP_BADGE, EDITOR_BODY_INDENT } from './editor-data'
import { EDITOR_DND_TYPE, type StepDragItem } from './StepsPalette'
import { Card } from '@/components/flora/Card'

const REORDER_TYPE = 'editor-block'
type ReorderItem = { index: number }

const isOtherwise = (label: string) => label.trim().toLowerCase().startsWith('otherwise')

function ConditionRowView({
  row, number, onEdit, onRemove,
}: {
  row: ConditionRow
  number: number | null
  onEdit: (label: string) => void
  onRemove: () => void
}) {
  return (
    <Card flat className="group/condition-row flex items-center gap-2 rounded-md border-grey-300 px-3 py-2 transition-colors duration-instant ease-soft focus-within:border-grey-500 hover:border-grey-400">
      {number !== null && (
        <span className="text-[14px] font-semibold text-ink">{number}.</span>
      )}
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onEdit(e.currentTarget.textContent ?? '')}
        className="flex-1 text-[14px] outline-none"
        style={{ color: number === null ? '#8b8e89' : '#2f3130' }}
      >
        {row.label}
      </span>
      <CircleAlert size={18} className="shrink-0" style={{ color: '#d99a00' }} aria-hidden />
      <button
        type="button"
        aria-label={`Remove ${row.label}`}
        onClick={onRemove}
        className="shrink-0 text-ink-muted opacity-0 transition-opacity duration-instant ease-soft group-hover/condition-row:opacity-100 focus-visible:opacity-100 hover:text-ink"
      >
        <X size={14} aria-hidden />
      </button>
    </Card>
  )
}

function ConditionBody({
  block, onEditRow, onRemoveRow, onAddRow,
}: {
  block: CanvasBlock
  onEditRow: (rowId: string, label: string) => void
  onRemoveRow: (rowId: string) => void
  onAddRow: () => void
}) {
  const rows = block.rows ?? []
  const HeaderIcon = STEP_ICON.condition
  const badge = STEP_BADGE.condition

  // Number only the non-"Otherwise…" rows, in order.
  let n = 0
  return (
    <Card flat className="rounded-lg border-grey-300">
      <div className="group/condition-header flex items-center gap-2 px-4 pt-4">
        <span className="flex size-8 items-center justify-center rounded-2xl" style={{ backgroundColor: badge.bg, color: badge.fg }}>
          <HeaderIcon size={16} aria-hidden />
        </span>
        <span className="text-[11px] font-semibold tracking-tight text-grey-700">{block.header ?? 'Conditions'}</span>
        <button
          type="button"
          aria-label="Add condition"
          onClick={onAddRow}
          className="ms-auto flex size-7 items-center justify-center rounded-md text-blue-700 opacity-0 transition-opacity duration-instant ease-soft group-hover/condition-header:opacity-100 focus-visible:opacity-100 hover:bg-control-hover"
        >
          <Plus size={14} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
        {block.subtitle && <p className="text-[14px] font-medium text-ink">{block.subtitle}</p>}
        {rows.map((row) => {
          const number = isOtherwise(row.label) ? null : ++n
          return (
            <ConditionRowView
              key={row.id}
              row={row}
              number={number}
              onEdit={(label) => onEditRow(row.id, label)}
              onRemove={() => onRemoveRow(row.id)}
            />
          )
        })}
      </div>
    </Card>
  )
}

function BlockCard({
  block, index, onMove, onRemove, onToggleCollapse, onEditRow, onRemoveRow, onAddRow,
}: {
  block: CanvasBlock; index: number
  onMove: (from: number, to: number) => void
  onRemove: (id: string) => void
  onToggleCollapse: (id: string) => void
  onEditRow: (blockId: string, rowId: string, label: string) => void
  onRemoveRow: (blockId: string, rowId: string) => void
  onAddRow: (blockId: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [, drag] = useDrag({ type: REORDER_TYPE, item: (): ReorderItem => ({ index }) })
  const [, drop] = useDrop<ReorderItem>({
    accept: REORDER_TYPE,
    hover: (item) => {
      if (item.index === index) return
      onMove(item.index, index)
      item.index = index
    },
  })
  drag(drop(ref))

  const expanded = !block.collapsed
  const Chevron = block.collapsed ? ChevronDown : ChevronUp
  // Only a condition block has a specced body; the rest are title-only in the
  // design, so expanding one reveals nothing beyond the header.
  const hasBody = block.stepType === 'condition'

  return (
    // Collapsed, the card is the design's "Collapsed card with title only"
    // (Figma 1886:75584): a warm beige panel with an 8px radius, a 24/16 pad, a
    // drag handle, the title, and a chevron. It drops the step badge the expanded
    // header carries, and the remove control only surfaces on hover so the
    // resting state stays as quiet as the design's.
    <Card
      ref={ref}
      flat
      className={`group ${block.collapsed ? 'rounded-lg border-grey-300 bg-grey-100' : 'rounded-xl border-grey-200 bg-grey-100'}`}
    >
      <div className="flex items-center gap-2.5 px-6 py-4">
        {block.collapsed && <GripVertical size={20} className="shrink-0 cursor-grab text-grey-400" aria-hidden />}
        <span className="flex-1 text-[14px] font-medium leading-5 tracking-[-0.1px] text-black">{block.title}</span>
        <button
          type="button"
          aria-label={`${block.collapsed ? 'Expand' : 'Collapse'} ${block.title}`}
          aria-expanded={expanded}
          onClick={() => onToggleCollapse(block.id)}
          className="flex size-8 shrink-0 items-center justify-center rounded text-ink hover:bg-control-hover"
        >
          <Chevron size={20} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Remove ${block.title}`}
          onClick={() => onRemove(block.id)}
          className="shrink-0 text-ink-muted opacity-0 transition-opacity duration-instant ease-soft group-hover:opacity-100 focus-visible:opacity-100 hover:text-ink"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      {expanded && hasBody && (
        <div className="px-6 pb-5">
          <ConditionBody
            block={block}
            onEditRow={(rowId, label) => onEditRow(block.id, rowId, label)}
            onRemoveRow={(rowId) => onRemoveRow(block.id, rowId)}
            onAddRow={() => onAddRow(block.id)}
          />
        </div>
      )}
    </Card>
  )
}

export function BlockCanvas({ blocks, onChange }: { blocks: CanvasBlock[]; onChange: (blocks: CanvasBlock[]) => void }) {
  const [{ isOver }, drop] = useDrop<StepDragItem, void, { isOver: boolean }>({
    accept: EDITOR_DND_TYPE,
    collect: (m) => ({ isOver: m.isOver({ shallow: true }) }),
    drop: (item) => {
      onChange(appendBlock(blocks, createCanvasBlock(item.stepType, nextBlockOrdinal(blocks))))
    },
  })

  return (
    // Indented to the policy heading's text, so the cards hang off the same line
    // as the prose above them (see editor-data's EDITOR_BODY_INDENT).
    <div style={{ marginInlineStart: EDITOR_BODY_INDENT }} className="mt-4 flex flex-col gap-3">
      {blocks.map((b, i) => (
        <BlockCard
          key={b.id}
          block={b}
          index={i}
          onMove={(from, to) => onChange(moveBlock(blocks, from, to))}
          onRemove={(id) => onChange(removeBlock(blocks, id))}
          onToggleCollapse={(id) => onChange(toggleBlockCollapse(blocks, id))}
          onEditRow={(blockId, rowId, label) => onChange(editConditionRow(blocks, blockId, rowId, label))}
          onRemoveRow={(blockId, rowId) => onChange(removeConditionRow(blocks, blockId, rowId))}
          onAddRow={(blockId) => onChange(addConditionRow(blocks, blockId, { id: nextId('r'), label: 'Condition description' }))}
        />
      ))}
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className="flex h-12 items-center justify-center rounded-xl border border-dashed text-[12px] transition-colors"
        style={{ borderColor: isOver ? '#1f73b7' : '#e2e0dd', color: '#8b8e89', backgroundColor: isOver ? '#1f73b70a' : 'transparent' }}
      >
        Drop a step here to add a block
      </div>
    </div>
  )
}
