// A meta row for a contract-gated outcome term ("Deflected"/"Resolved").
// Renders nothing when the org's contracted model doesn't include the term,
// and otherwise pairs the label with a hover/focus tooltip carrying the
// term's plain-language definition and a help-center link.
import { useId } from 'react'
import { Info } from 'lucide-react'
import { OUTCOME_TERM_META, type OutcomeTerm } from './outcome-model'

export function OutcomeMetaRow({ term, value, model }: { term: OutcomeTerm; value: string; model: OutcomeTerm[] }) {
  const tooltipId = useId()
  if (!model.includes(term)) return null
  const meta = OUTCOME_TERM_META[term]
  return (
    <p className="text-[12px] text-grey-700">
      <span className="group relative inline-flex items-center">
        <button
          type="button"
          aria-describedby={tooltipId}
          className="inline-flex items-center gap-1 text-[12px] font-normal text-grey-700"
        >
          <span>{meta.label}</span>
          <Info className="h-3 w-3 text-grey-500" aria-hidden />
        </button>
        <span
          id={tooltipId}
          role="tooltip"
          className="invisible absolute left-0 top-full z-10 mt-1 w-[220px] rounded-[10px] bg-[#2f3b48] p-2.5 text-[11.5px] leading-[16px] text-white opacity-0 transition-opacity duration-instant ease-soft group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        >
          {meta.definition}{' '}
          <a href={meta.helpHref} target="_blank" rel="noreferrer" className="underline">
            Learn more
          </a>
        </span>
      </span>
      : <span className="text-black">{value}</span>
    </p>
  )
}
