// The furniture the two Agent Directory takeovers share: the numbered
// accordion step, its marker, the text field, and the channel picker. Both
// CreateAgentFlow (Brand ▸ Name ▸ Channels) and EditAgentFlow (Name ▸ Channels)
// draw from frame 1844:116788, so the pieces live here rather than being
// retyped — the same reason list-parts.tsx owns the shared row furniture.
//
// What stays behind in CreateAgentFlow is ModeTile: only the create flow has
// brand modes to choose between.
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GardenIcon } from '@/components/garden-icon'
import { CHANNEL_META, CHANNEL_SECTIONS } from '@/lib/channel-meta'

export const FIELD =
  'mt-4 h-[42px] w-full rounded-lg border border-surface-border bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-ink'

// Frame 1844:116788: a 28px ring holding the 20px Garden check, in the frame's
// teal — an outline, not a filled disc. The frame only ever shows completed
// steps, so the pending ring keeps the step number rather than guessing: a check
// against an unfilled step would claim work the user hasn't done.
const STEP_TEAL = '#139387'

function StepIndicator({ index, done }: { index: number; done: boolean }) {
  if (done) {
    return (
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px]"
        style={{ borderColor: STEP_TEAL, color: STEP_TEAL }}
      >
        <GardenIcon name="check-lg-stroke" className="size-5" />
      </span>
    )
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-flora-border text-sm font-semibold text-ink-muted">
      {index}
    </span>
  )
}

export function Step({
  index,
  title,
  description,
  done,
  isOpen,
  onToggle,
  children,
}: {
  index: number
  title: string
  description: string
  done: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section className="border-b border-flora-divider py-6 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        // 58px: the frame sets the markers in their own gutter, well clear of the
        // titles, rather than tucked against them.
        className="flex w-full items-center gap-[58px] text-left outline-none"
      >
        <StepIndicator index={index} done={done} />
        <span className="flex-1">
          <span className="block text-lg font-semibold leading-6 tracking-[-0.45px] text-ink">
            {title}
          </span>
          <span className="mt-1 block text-sm leading-5 text-ink-muted">{description}</span>
        </span>
        {/* Down when there is more to open, up to collapse — the direction the
            frame draws on its expanded steps. */}
        <ChevronDown
          size={20}
          className={`text-grey-700 transition-transform duration-instant ease-soft ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {/* 86px = the 28px marker plus its gutter, so the step's content lines up
          under the title. */}
      {isOpen && <div className="mt-6 pl-[86px]">{children}</div>}
    </section>
  )
}

/**
 * The channel tiles, grouped by CHANNEL_SECTIONS and collapsible per section.
 * Which sections are collapsed is chrome, so it stays in here — neither flow
 * reads it, and neither should have to thread it through.
 */
export function ChannelPicker({
  selected,
  onToggle,
}: {
  selected: Set<string>
  onToggle: (label: string) => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleSection = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })

  return (
    <>
      {CHANNEL_SECTIONS.map((section) => {
        const isCollapsed = collapsed.has(section.title)
        return (
          <div key={section.title} className="mt-6 first:mt-0">
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center justify-between outline-none"
            >
              <span className="text-sm font-semibold leading-5 text-ink">{section.title}</span>
              <ChevronDown
                size={20}
                className={`text-grey-700 transition-transform duration-instant ease-soft ${isCollapsed ? '' : 'rotate-180'}`}
                aria-hidden
              />
            </button>
            {!isCollapsed && (
              <div className="mt-2 grid grid-cols-3 gap-4">
                {section.channels.map((label) => {
                  const { display, color, Icon } = CHANNEL_META[label]
                  const isSelected = selected.has(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => onToggle(label)}
                      aria-pressed={isSelected}
                      className="flex h-[120px] flex-col items-center justify-center gap-4 rounded-xl border border-flora-divider bg-white outline-none transition-shadow"
                      style={{ boxShadow: isSelected ? '0 0 0 2px #373a4d inset' : undefined }}
                    >
                      {/* Full strength, as the frame draws them — the 0.6
                          dimming inherited from the create-org flow washed every
                          channel mark out. */}
                      <span
                        className="flex size-11 items-center justify-center rounded-[22px]"
                        style={{ backgroundColor: color }}
                      >
                        <Icon size={22} className="text-white" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="text-sm leading-5 tracking-[-0.154px] text-ink">
                        {display}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
