import type { AiContext } from '../ai-context-registry'

// Generic scoped body: a greeting plus optional suggestion chips. Used for any
// scope without a dedicated rich body (e.g. brand-setup, configuration).
//
// The chips used to be spans, on the reasoning that nothing could answer them.
// Something can now: `onSuggestion` sends the chip's text where a typed one goes
// — into the composer, or straight into a flow when the text asks for one (see
// AiAssistantHost) — so they are buttons, and a chip is a click rather than a
// sentence to retype.
export function DefaultAssistantBody({
  context,
  onSuggestion,
}: {
  context: AiContext
  onSuggestion: (text: string) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="mt-6 text-[22px] leading-[30px] tracking-[0.352px] text-black">
        {context.greeting}
      </p>
      {context.suggestions && context.suggestions.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          {context.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              className="rounded-2xl border border-surface-border px-3 py-2 text-left text-[14px] leading-5 text-ink transition-colors hover:bg-[rgba(92,105,112,0.08)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
