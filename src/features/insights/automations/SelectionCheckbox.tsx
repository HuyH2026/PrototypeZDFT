// Checkbox that can also sit in the mixed state the design draws as a minus in
// the header row. `indeterminate` is a DOM property with no HTML attribute, so
// it has to be written to the node rather than passed as a prop.
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

export function SelectionCheckbox({
  label,
  checked,
  indeterminate = false,
  onChange,
  className,
}: {
  label: string
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
      className={cn('size-4 accent-[#048c80]', className)}
    />
  )
}
