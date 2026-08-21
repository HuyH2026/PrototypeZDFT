// A table shell for card-backed datasets whose rows need more flexible internal
// layout than native table cells allow. It shares the same warm header and
// flush white body treatment as the standard Flora Table.
import { cn } from '@/lib/cn'

export function CardListTable({ className, children, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="card-list-table"
      className={cn(
        'overflow-hidden rounded-[24px] border border-border-subtle bg-table-header-bg',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export function CardListTableHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-list-table-header" className={cn('bg-transparent', className)} {...props} />
}

export function CardListTableBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-list-table-body"
      data-testid="card-list-table-body"
      className={cn('overflow-hidden rounded-t-[24px] bg-white', className)}
      {...props}
    />
  )
}
