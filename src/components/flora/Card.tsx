// The app's card surface, ported from the ft-unify prototype's `.card`, where
// the frosted-glass treatment is the default rather than an accent.
//
// The wash is the whole fill: `background-color` stays transparent and the
// purple gradient rides in as a `background-image`, so a card only resolves
// correctly over the page backdrop it was sampled against (--color-app-backdrop,
// #f7f7f7). Stroke and wash only — the design carries no drop shadow, and an
// inset highlight reads as a white gap between the two.
//
// `flat` opts out for dense surfaces (panel rows, table cells, nested shells),
// where a per-row wash would stack into a visible gradient staircase.
import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Card = forwardRef<HTMLDivElement, ComponentProps<'div'> & { flat?: boolean }>(function Card({
  className,
  flat = false,
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      data-slot="card"
      data-flat={flat ? 'true' : undefined}
      className={cn(
        'rounded-[20px] border border-flora-divider',
        flat
          ? 'bg-white'
          : 'bg-transparent bg-[image:var(--glass-card-sheen)] backdrop-blur-[16px] backdrop-saturate-180',
        className,
      )}
      {...props}
    />
  )
})
