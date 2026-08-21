// The chat widget mock the centre column previews: a dark header carrying the
// segment's mark and title, whatever the active section is previewing, then the
// composer and the Zendesk footer.
//
// Static by default. The Use cases preview overlay passes its own `composer` (a
// real input) and a `className` to fill a taller column; Configuration's call
// sites pass neither and get the fixed panel the section studio was built for.
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { PREVIEW_COPY } from './config-data'

export function PreviewFrame({
  mark,
  title,
  accent,
  composer,
  className,
  children,
}: {
  /** Short brand mark shown in the header chip (the design shows "Uber"). */
  mark: string
  title: string
  accent: string
  /** Replaces the static composer pill. Omit for the inert preview. */
  composer?: ReactNode
  className?: string
  children: ReactNode
}) {
  const branded = accent !== '#000000'

  return (
    <div
      data-testid="widget-preview-frame"
      className={cn(
        'flex h-[640px] w-[382px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_11px_46px_0_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <div
        data-slot="widget-preview-header"
        className="flex items-center gap-2 px-4 py-5 text-white"
        style={{ backgroundColor: accent }}
      >
        <span
          className={`flex items-center justify-center text-[9px] font-semibold leading-3 tracking-[0.02em] ${branded ? 'size-6 rounded-full bg-black' : ''}`}
        >
          {mark}
        </span>
        <span className="text-[15px] font-medium">{title}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">{children}</div>
      {composer ?? (
        <div className="mx-4 mb-3 rounded-full border border-surface-border px-4 py-2 text-[13px] text-ink-muted">
          {PREVIEW_COPY.composer}
        </div>
      )}
      <div className="flex items-center justify-center gap-1 py-2 text-[12px] text-ink-muted">
        <ZendeskLogo size={13} color="#9194a0" />
        {PREVIEW_COPY.footer}
      </div>
    </div>
  )
}

/**
 * The italic line the frames use to point at the panel on the right. Shared by
 * every tab that has one — Widget, Voice, Web Call and Headless. Headless used
 * to hand-roll its own at a different size and colour, which is the drift this
 * owns. `className` exists for the one frame that tints the hint (Web Call's
 * purple); twMerge resolves the colour conflict with the default accent blue.
 */
export function PreviewHint({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-center text-[13px] italic leading-[18px] text-accent-blue', className)}>
      {children}
    </p>
  )
}
