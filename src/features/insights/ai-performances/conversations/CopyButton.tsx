// A one-tap copy affordance for the IDs the drawer preserves (Chat ID, Trace
// ID, error IDs). Shows a transient check on success. navigator.clipboard is
// guarded — jsdom and non-secure contexts don't provide it, and a copy button
// that throws is worse than one that quietly no-ops.
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(value)
    } catch {
      // Clipboard denied (permissions, insecure context) — leave the icon as-is.
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={copy}
      className="inline-flex size-5 shrink-0 items-center justify-center rounded text-grey-500 hover:bg-grey-100 hover:text-grey-800"
    >
      {copied ? <Check className="h-3 w-3 text-[#2f8a4f]" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
    </button>
  )
}
