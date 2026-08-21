// Which changes the agent may apply to itself, and what stops it. The four
// glyphs are tinted by meaning — allowed green, approval amber, rollback blue,
// cadence teal — all four colours the app already uses elsewhere.
import { CalendarDays, Check, TriangleAlert, Undo2, type LucideIcon } from 'lucide-react'
import type { Guardrail, GuardrailGlyph } from './self-improving-data'

const GUARDRAIL_ICON: Record<GuardrailGlyph, { Icon: LucideIcon; color: string }> = {
  allowed: { Icon: Check, color: '#0f8a5f' },
  approval: { Icon: TriangleAlert, color: '#b8710a' },
  rollback: { Icon: Undo2, color: '#1b5996' },
  cadence: { Icon: CalendarDays, color: '#048c80' },
}

export function GuardrailsSection({ guardrails }: { guardrails: Guardrail[] }) {
  return (
    <ul className="flex flex-col">
      {guardrails.map((guardrail, index) => {
        const { Icon, color } = GUARDRAIL_ICON[guardrail.glyph]
        return (
          <li
            key={guardrail.id}
            className={`flex gap-3 py-3 ${index === 0 ? 'pt-0' : 'border-t border-[#d2d9e5]'}`}
          >
            <Icon size={18} color={color} className="mt-0.5 shrink-0" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[14px] font-semibold leading-5 text-ink">
                {guardrail.title}
              </span>
              <span className="text-[13px] leading-5 text-grey-700">{guardrail.body}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
