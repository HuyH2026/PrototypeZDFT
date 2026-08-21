import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAiAssistant } from '@/app/ai-assistant-context'
import type { AiScope } from './ai-context-registry'

// The single reusable "open AI" trigger used by every AI Anywhere placement.
// Passing a `scope` primes the shared assistant with that context; omit it for
// the global blank-slate assistant. `mode` chooses how it opens: the default
// `panel` is the inline side panel; `full` launches the full-suite takeover
// (used by the sidebar's global trigger). `variant` sets the look: `solid` is
// the larger subtle trigger used in page headers; `ghost` is the same
// treatment at a smaller size for inline affordances; `nav` is a bare icon
// matching the sidebar rail (no resting background, so it sits consistently
// among the other nav glyphs); and `inline` is a labeled action for
// evidence-backed in-context investigations.
export function AiTriggerButton({
  scope,
  mode = 'panel',
  variant = 'solid',
  label = 'AI assistant',
  className,
}: {
  scope?: AiScope
  mode?: 'panel' | 'full'
  variant?: 'solid' | 'ghost' | 'nav' | 'inline'
  label?: string
  className?: string
}) {
  const { open } = useAiAssistant()
  const styles = {
    solid: 'size-8 rounded-full text-blue-700 hover:bg-[rgba(92,105,112,0.08)]',
    ghost: 'size-6 rounded-full text-blue-700 hover:bg-[rgba(92,105,112,0.08)]',
    // Sits in the nav rail among the other 32px glyph pills, so it hovers exactly
    // as they do: the warm opaque nav grey at --radius-btn (8px, not Tailwind's
    // rounded-lg 10px). The old cool blue-grey tint read green over the warm rail.
    nav: 'size-8 rounded-[8px] text-flora-fg-body hover:bg-nav-hover',
    inline:
      'h-8 gap-1.5 rounded-full bg-nav-active px-3 text-[13px] font-medium text-white hover:bg-ink',
  }[variant]
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => open(scope, mode)}
      className={cn('flex items-center justify-center transition-colors', styles, className)}
    >
      <Sparkles
        size={variant === 'ghost' || variant === 'inline' ? 16 : 20}
        className={variant === 'inline' ? 'text-white' : undefined}
      />
      {variant === 'inline' ? <span>{label}</span> : null}
    </button>
  )
}
