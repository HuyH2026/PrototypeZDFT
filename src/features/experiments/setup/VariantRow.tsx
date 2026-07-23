// One variant row in the Agent-and-variants section: a colored badge + helper
// text, the agent dropdown (static), and a small Traffic % field. Presentational.
import { type SetupVariant } from '../experiments-data'
import { SelectField } from './Field'

export function VariantRow({ variant }: { variant: SetupVariant }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: variant.badgeColor }}
          >
            {variant.badge}
          </span>
          <span className="text-[12px] text-ink-muted">{variant.description}</span>
        </div>
        <div className="mt-1.5">
          <SelectField value={variant.agent} />
        </div>
      </div>
      <div className="w-[110px]">
        <span className="block text-[12px] font-medium text-ink">Traffic</span>
        <div className="mt-1.5 flex items-center justify-between rounded-[20px] border border-[#bcbdc5] bg-white px-3.5 py-2 text-[14px] text-ink">
          <span>{variant.traffic}</span>
          <span className="text-ink-muted">%</span>
        </div>
      </div>
    </div>
  )
}
