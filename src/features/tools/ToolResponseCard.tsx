// Bottom card on the Tool Detail screen: static Responses guidance text and
// an Output Parameters empty state. No live behavior — no request has been
// sent (this is a mock UI, no backend).
import { ChevronUp } from 'lucide-react'

export function ToolResponseCard() {
  return (
    <div className="grid grid-cols-2 gap-6 rounded-[20px] border border-surface-border bg-white p-5">
      <div>
        <div className="text-[14px] font-semibold text-black">Responses</div>
        <p className="mt-4 text-center text-[12px] text-blue-700">
          Select an array [] to generate a Dynamic list of CV&apos;s or select an individual entity for a single CV.
          Utilize &apos;Advanced Filter&apos; with JMESPath for precise filtering.
        </p>
        <p className="mt-3 text-center text-[12px] text-ink-muted">
          Enter the URL and click Send to get a response
        </p>
      </div>
      <div className="border-l border-surface-border pl-6">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-black">Output Parameters</span>
          <button type="button" aria-label="Collapse output parameters panel">
            <ChevronUp size={16} className="text-ink-muted" aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-center text-[12px] text-ink-muted">
          Click on Response to add Output parameters
        </p>
      </div>
    </div>
  )
}
