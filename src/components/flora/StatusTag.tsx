// Status pill, ported from the ft-unify prototype's `.status-tag`. Each state
// pairs a -100 surface with a -700 foreground, and the dot takes the
// foreground colour. `indexing` swaps the dot for a spinner.
//
// These use the global --royal-* values. The prototype re-points --royal-* at
// the Flora blue surface inside `.ob-list`, but that override is scoped to one
// onboarding list, not global.
import { cn } from '@/lib/cn'

export type StatusTagState =
  | 'active'
  | 'good'
  | 'ready'
  | 'insights'
  | 'incomplete'
  | 'indexing'
  | 'attention'
  | 'neutral'

const STATES: Record<StatusTagState, { pill: string; dot: string }> = {
  active: { pill: 'bg-green-100 text-green-700', dot: 'bg-green-700' },
  good: { pill: 'bg-green-100 text-green-700', dot: 'bg-green-700' },
  ready: { pill: 'bg-royal-100 text-royal-700', dot: 'bg-royal-700' },
  insights: { pill: 'bg-royal-100 text-royal-700', dot: 'bg-royal-700' },
  incomplete: { pill: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-700' },
  indexing: { pill: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-700' },
  attention: { pill: 'bg-red-100 text-red-700', dot: 'bg-red-700' },
  neutral: { pill: 'bg-tag-neutral text-fg-default', dot: 'bg-fg-default' },
}

export function StatusTag({
  state,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> & { state: StatusTagState }) {
  const tone = STATES[state]
  return (
    <span
      data-slot="status-tag"
      data-state={state}
      className={cn(
        'inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full py-0.5 pl-2 pr-3 align-middle text-[12px] font-semibold leading-4',
        tone.pill,
        className,
      )}
      {...props}
    >
      {state === 'indexing' ? (
        <span
          data-slot="status-spinner"
          aria-hidden="true"
          className="size-3 shrink-0 animate-spin rounded-full border-[1.5px] border-[#f5d79e] border-t-[#ad5e18]"
        />
      ) : (
        <span
          data-slot="status-dot"
          aria-hidden="true"
          className={cn('size-1.5 shrink-0 rounded-full', tone.dot)}
        />
      )}
      {children}
    </span>
  )
}
