import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TabbedPageHeaderProps<T extends string> = {
  tabs: readonly T[]
  /** `null` means no tab owns the view — the title does (see `onTitleClick`). */
  activeTab: T | null
  onTabChange: (tab: T) => void
  tablistLabel: string
}

type UntabbedPageHeaderProps = {
  tabs?: undefined
  activeTab?: never
  onTabChange?: never
  tablistLabel?: never
}

export type PageHeaderProps<T extends string = string> = {
  title: string
  titleMeta?: ReactNode
  /**
   * Makes the title a control for the screen's home view, for screens whose
   * default view would otherwise need a tab repeating the title.
   */
  onTitleClick?: () => void
  middle?: ReactNode
  actions?: ReactNode
  className?: string
} & (TabbedPageHeaderProps<T> | UntabbedPageHeaderProps)

export function PageHeader<T extends string = string>(props: PageHeaderProps<T>) {
  const { title, titleMeta, onTitleClick, middle, actions, className } = props
  const tabbed = props.tabs !== undefined

  return (
    <header
      data-slot="page-header"
      className={cn(
        'sticky top-0 z-10 flex h-[92px] items-center gap-6 rounded-t-[26px] bg-white/95 px-16 pb-4 pt-8 backdrop-blur-md',
        className,
      )}
    >
      <div data-slot="page-header-title" className="flex shrink-0 items-baseline gap-3 pb-3">
        <h1 className="text-[20px] font-semibold text-ink">
          {onTitleClick ? (
            <button
              type="button"
              aria-pressed={props.activeTab == null}
              onClick={onTitleClick}
              className="outline-none transition-colors duration-instant ease-soft focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-flora-blue"
            >
              {title}
            </button>
          ) : (
            title
          )}
        </h1>
        {titleMeta ? <div className="text-[14px] text-ink-muted">{titleMeta}</div> : null}
      </div>

      {tabbed ? (
        <>
          <span
            data-slot="page-header-divider"
            aria-hidden
            className="mb-3 h-5 w-px shrink-0 bg-surface-border"
          />
          <div role="tablist" aria-label={props.tablistLabel} className="flex items-center gap-6">
            {props.tabs.map((tab) => {
              const active = tab === props.activeTab
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => props.onTabChange(tab)}
                  className={cn(
                    'whitespace-nowrap border-b-2 pb-3 text-[14px] font-medium outline-none transition-colors duration-instant ease-soft focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-flora-blue',
                    active
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink-muted hover:text-ink',
                  )}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {middle ? (
        <div
          data-slot="page-header-middle"
          className="flex min-w-0 flex-1 items-center justify-center pb-3"
        >
          {middle}
        </div>
      ) : null}

      {actions ? (
        <div data-slot="page-header-actions" className="ml-auto shrink-0 pb-3">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
