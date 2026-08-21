// The '/' command menu opened from the policy prose (Figma 94:90785): a
// "Suggested" row above a "Components" list, each inserting an inline policy
// chip. Escape or a click outside dismisses it and leaves the '/' as plain
// text — the design's own footer hint ("Type '/' on the policy" / "esc").
import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CHIP_ICON } from './editor-data'
import { SLASH_MENU_SECTIONS, type SlashMenuItem } from './slash-menu-data'
import type { ChipVariant } from '../agent-store'

function SlashMenuRow({
  item,
  onChoose,
}: {
  item: SlashMenuItem
  onChoose: (item: SlashMenuItem) => void
}) {
  const disabled = item.variant === null
  const Icon = item.icon ?? CHIP_ICON[item.variant as ChipVariant]

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={() => onChoose(item)}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-1.5 text-left transition-colors duration-instant',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-control-hover',
      )}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: item.badgeColor }}
      >
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
        {item.label}
      </span>
      <ChevronRight size={20} className="shrink-0 text-ink-muted" aria-hidden />
    </button>
  )
}

export function SlashMenu({
  position,
  onChoose,
  onClose,
}: {
  position: { left: number; top: number }
  onChoose: (item: SlashMenuItem) => void
  onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [onClose])

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label="Insert into policy"
      // Keeps focus (and the caret) in the prose span that opened this menu,
      // so choosing an item doesn't race the prose's own onBlur sync.
      onMouseDown={(event) => event.preventDefault()}
      className="fixed z-50 flex w-[300px] flex-col gap-1.5 overflow-hidden rounded-[30px] border border-surface-border bg-white py-3 shadow-menu"
      style={{ left: position.left, top: position.top }}
    >
      {SLASH_MENU_SECTIONS.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p className="px-4 py-1.5 text-[14px] leading-5 text-[#9194a0]">{section.label}</p>
          {section.items.map((item) => (
            <SlashMenuRow key={item.id} item={item} onChoose={onChoose} />
          ))}
        </div>
      ))}

      <div className="mt-1 flex items-center justify-between border-t border-surface-border px-4 py-3 text-[14px] leading-5">
        <p className="text-[#9194a0]">
          Type ‘<span className="text-ink">/</span>’ on the policy
        </p>
        <p className="text-ink-muted">esc</p>
      </div>
    </div>
  )
}
