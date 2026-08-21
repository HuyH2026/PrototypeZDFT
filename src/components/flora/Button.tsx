// Pill button, ported from the ft-unify prototype's `.btn` family.
//
// Flora leads with its dark neutral rather than a blue: `primary` is #2f3130
// and the blue is reserved for focus and selection. Sizes follow Flora's
// Small=32 / Default=40 / Large=48.
import { cn } from '@/lib/cn'

export type FloraButtonVariant = 'primary' | 'outline' | 'basic' | 'danger'
export type FloraButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<FloraButtonVariant, string> = {
  primary:
    'bg-flora-fg text-white border-flora-fg hover:bg-[#1a1c1b] hover:border-[#1a1c1b] active:bg-[#0d0e0d] active:border-[#0d0e0d]',
  outline:
    'bg-transparent text-flora-fg border-grey-500 hover:bg-black/5 hover:border-flora-fg active:bg-black/10',
  basic:
    'bg-transparent text-flora-fg border-transparent hover:bg-black/5 active:bg-black/10',
  danger:
    'bg-red-700 text-white border-red-700 hover:bg-[#b32d38] hover:border-[#b32d38] active:bg-[#a02832] active:border-[#a02832]',
}

const SIZES: Record<FloraButtonSize, string> = {
  sm: 'min-h-8 px-3 py-1.5 text-[12px] leading-4',
  md: 'min-h-10 px-4 py-2.5 text-[14px] leading-5 tracking-[-0.154px]',
  lg: 'min-h-12 px-5 py-3.5 text-[14px] leading-5',
}

export function Button({
  className,
  variant = 'outline',
  size = 'md',
  type = 'button',
  ...props
}: React.ComponentProps<'button'> & {
  variant?: FloraButtonVariant
  size?: FloraButtonSize
}) {
  return (
    <button
      type={type}
      data-slot="button"
      data-variant={variant}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border font-normal',
        'transition-[background-color,border-color,color,box-shadow,transform] duration-instant ease-soft',
        'active:scale-[0.985]',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flora-blue',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
