// A field with a copy-to-clipboard button and transient "Copied" feedback.
// Variants: 'dark' (code block, button top-right), 'light' (bordered read-only
// field, button right-center), and 'bare' (icon-only button, no container
// chrome — for inline copy affordances). Presentational + local timer only.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

type CopyFieldProps = {
  value: string
  children?: ReactNode
  variant?: 'dark' | 'light' | 'bare'
  'aria-label'?: string
  className?: string
}

export function CopyField({ value, children, variant = 'dark', className, ...rest }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const onCopy = () => {
    void navigator.clipboard?.writeText(value)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  const rootClass =
    variant === 'dark'
      ? 'relative flex w-full items-start gap-2 rounded-md bg-[#0d212d] px-4 py-2.5'
      : variant === 'light'
        ? 'relative flex w-full items-start gap-2 overflow-hidden rounded-[10px] border border-[#ffb393] bg-white'
        : 'relative inline-flex items-center'

  const buttonClass =
    variant === 'dark'
      ? 'flex shrink-0 items-center gap-1 rounded p-1.5 text-[#e4e7f0]'
      : variant === 'light'
        ? 'absolute right-2 top-1/2 flex shrink-0 -translate-y-1/2 items-center gap-1 rounded p-1.5 text-ink-muted'
        : 'flex shrink-0 items-center gap-1 rounded p-1.5 text-ink-muted'

  const iconSize = variant === 'dark' ? 17 : 20

  return (
    <div className={`${rootClass} ${className ?? ''}`}>
      {children ? <div className="min-w-0 flex-1">{children}</div> : null}
      <button type="button" aria-label={rest['aria-label'] ?? 'Copy'} onClick={onCopy} className={buttonClass}>
        {copied ? <Check size={iconSize} aria-hidden /> : <Copy size={iconSize} aria-hidden />}
        {copied ? <span className="text-[12px]">Copied</span> : null}
      </button>
    </div>
  )
}
