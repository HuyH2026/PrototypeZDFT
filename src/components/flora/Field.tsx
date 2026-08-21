// Text inputs, ported from the ft-unify prototype's `.form-input`: a hairline
// border with a soft lift instead of a hard grey outline.
import { cn } from '@/lib/cn'

const BASE =
  'w-full box-border bg-white px-5 py-2.5 text-[14px] leading-5 tracking-[-0.154px] text-fg-default ' +
  'rounded-field border border-field-border shadow-field ' +
  'outline-none transition-colors duration-instant ' +
  'placeholder:text-fg-placeholder focus:border-flora-blue ' +
  'disabled:opacity-50'

export function Field({ className, ...props }: React.ComponentProps<'input'>) {
  return <input data-slot="field" className={cn(BASE, className)} {...props} />
}

export function TextArea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="field" className={cn(BASE, className)} {...props} />
}
