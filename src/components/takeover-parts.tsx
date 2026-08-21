// Chrome for the drill-ins that take over the whole app: the Agent Builder's
// Knowledge coaching and Content snippet editors, their previews, the AI QA
// rubric editor, and the Agent Directory's create-agent wizard.
//
// Frame 64:50936 draws these as the entire 1440 window sitting on the app
// backdrop — no nav rail, no pages column — so they are `fixed` rather than laid
// out inside the content card. The frame's geometry: 24px side gutters, 13px top,
// a 1392×73 glass header pill at 20px radius, an 8px gap, then the panels.
//
// Every one of those headers is the same three-cell grid (mark + label / centred
// title / actions), which is why it lives here rather than being retyped in each
// screen — the same reason list-parts.tsx owns the shared row furniture. It sits
// in components/ rather than under one feature because the screens sharing it now
// span two sections.
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The fill and radius of a panel below the header. Panels stay opaque where the
 * frame has them at 80% white: over the flat backdrop that computes to #fbfbfa,
 * a difference of four levels from white, and staying opaque keeps the cards
 * nested inside them (the rubric's test results) from reading as brighter than
 * their own container.
 */
export const TAKEOVER_PANEL = 'rounded-[20px] bg-white'

/** The takeover root: fixed to the viewport, above the chrome it replaces. */
export function TakeoverSurface({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] flex flex-col gap-2 overflow-hidden bg-[#f1efed] px-6 py-[13px]',
        className,
      )}
      {...props}
    />
  )
}

/** The 32px circular glyph opening the header, coloured per surface. */
export function TakeoverMark({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * The header pill. It is laid out rather than sticky: the surface itself never
 * scrolls (each panel below does), and a sticky header would ride up over the
 * takeover's top gutter.
 */
export function TakeoverHeader({
  mark,
  label,
  title,
  center,
  dark = false,
  children,
}: {
  mark: ReactNode
  label: string
  /** The centred page title. Pass `center` instead for a control. */
  title?: string
  center?: ReactNode
  /** The previews invert the glass and the text over their dark backdrop. */
  dark?: boolean
  /** The right-hand actions. */
  children: ReactNode
}) {
  return (
    <header
      className={cn(
        'grid min-h-[73px] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[20px] border px-6 shadow-[0_0_20px_rgba(0,0,0,0.04)] backdrop-blur-[50px]',
        dark ? 'border-white/10 bg-[#111e2b]/70 text-white' : 'border-white/80 bg-white/20',
      )}
    >
      <div className={cn('flex min-w-0 items-center gap-2.5', dark ? undefined : 'text-ink')}>
        {mark}
        <span className="truncate text-[22px] leading-7 font-semibold">{label}</span>
      </div>

      {title ? (
        <h1
          className={cn(
            'max-w-[440px] truncate text-center text-[22px] leading-7 font-semibold',
            dark ? undefined : 'text-ink',
          )}
        >
          {title}
        </h1>
      ) : (
        (center ?? <span />)
      )}

      <div className="ml-auto flex items-center gap-2.5">{children}</div>
    </header>
  )
}
