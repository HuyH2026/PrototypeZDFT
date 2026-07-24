// A field with a copy-to-clipboard button and transient "Copied" feedback.
// Two variants: 'dark' (a code block, button top-right) and 'light' (a bordered
// read-only field, button right-center). Presentational + local timer only.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

type CopyFieldProps = {
  value: string
  children: ReactNode
  variant?: 'dark' | 'light'
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

  const dark = variant === 'dark'
  return (
    <div
      className={`relative flex w-full items-start gap-2 rounded-md ${
        dark ? 'bg-[#0d212d] px-4 py-2.5' : 'overflow-hidden rounded-[10px] border border-[#ffb393] bg-white'
      } ${className ?? ''}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        aria-label={rest['aria-label'] ?? 'Copy'}
        onClick={onCopy}
        className={`flex shrink-0 items-center gap-1 rounded p-1.5 ${
          dark ? 'text-[#e4e7f0]' : 'absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted'
        }`}
      >
        {copied ? <Check size={dark ? 17 : 20} aria-hidden /> : <Copy size={dark ? 17 : 20} aria-hidden />}
        {copied ? <span className="text-[12px]">Copied</span> : null}
      </button>
    </div>
  )
}
