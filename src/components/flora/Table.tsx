// Data table, ported from the ft-unify prototype's `.table-wrap`. The prototype
// treats its table styling as a binding rule (.cursor/rules/table-styling.md),
// and three parts of it are load-bearing:
//
//   1. The shell border is --border-subtle (#e8eaec), never --border-default.
//   2. `thead th` has NO fill — the shell's warm grey shows through the header
//      strip. A solid header fill breaks the effect.
//   3. `tbody` starts flush beneath `thead`; no lifted edge or seam divides
//      the white body from the warm shell header.
import { cn } from '@/lib/cn'

export function Table({
  className,
  clickableRows = false,
  children,
  ...props
}: React.ComponentProps<'table'> & { clickableRows?: boolean }) {
  return (
    <div
      data-slot="table-wrap"
      data-clickable-rows={clickableRows ? 'true' : undefined}
      // overflow-y-hidden clips vertical overflow (e.g. dropdowns/tooltips inside cells)
      className="overflow-x-auto overflow-y-hidden rounded-[24px] border border-border-subtle bg-table-header-bg"
    >
      <table
        className={cn(
          'w-full min-w-max border-separate border-spacing-0 text-[14px] leading-5 tracking-[-0.154px]',
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function Thead({ className, ...props }: React.ComponentProps<'thead'>) {
  // No fill or shadow — the shell's warm grey shows through the header strip.
  return <thead className={cn('relative z-[2] bg-transparent', className)} {...props} />
}

export function Tbody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn(
        'bg-white',
        '[&_tr:last-child>td]:border-b-0',
        // The wrap's overflow-x-auto / overflow-y-hidden pairing doesn't clip
        // to its own border-radius in every browser, so outer row corners round
        // themselves rather than depend on that clip.
        '[&_tr:first-child>td:first-child]:rounded-tl-[24px]',
        '[&_tr:first-child>td:last-child]:rounded-tr-[24px]',
        '[&_tr:last-child>td:first-child]:rounded-bl-[24px]',
        '[&_tr:last-child>td:last-child]:rounded-br-[24px]',
        // Row hover and selection live on tbody so they apply once per row rather
        // than per cell — a cell background would otherwise paint over a row's.
        '[&_tr:hover>td]:bg-table-row-hover',
        '[&_tr[data-selected=true]>td]:bg-[#f0f7f4]',
        className,
      )}
      {...props}
    />
  )
}

export function Th({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'bg-transparent px-3.5 py-3.5 text-left align-middle text-[14px] font-semibold leading-5 tracking-[-0.154px] text-table-header-color first:pl-5',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'border-b border-table-divider bg-white px-3.5 py-3.5 align-middle transition-colors duration-instant first:pl-5',
        className,
      )}
      {...props}
    />
  )
}
