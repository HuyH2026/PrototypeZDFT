// Serves /settings/security ("Security") — frame 1545:330959.
// One section, Data Redaction: intro copy over a two-column list of the areas
// Forethought redacts. The states are read-only text + dot in the design (no
// switch), so nothing here is interactive; the only live control is the AI
// trigger the sibling Settings screens carry. No backend.
import { REDACTION_AREAS, REDACTION_INTRO } from './security-data'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'

export function SecurityView() {
  return (
    <div data-testid="screen-security" className="h-full overflow-y-auto rounded-[26px] bg-white">
      <PageHeader title="Security" actions={<AiTriggerButton label="Ask AI about this page" />} />

      <div className="px-16 pb-16">
        <section aria-labelledby="data-redaction-heading">
          <h2 id="data-redaction-heading" className="text-[24px] leading-[32px] text-ink">
            Data Redaction
          </h2>
          <p className="mt-3 max-w-[860px] text-[13px] leading-[19px] text-ink">
            {REDACTION_INTRO.before}
            <a
              href={REDACTION_INTRO.linkHref}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline"
            >
              {REDACTION_INTRO.linkLabel}
            </a>
            {REDACTION_INTRO.after}
          </p>

          {/* Column labels + rows, laid out as flex rather than a table: the
              design has no table chrome, and the 86px state column is fixed
              while the area column takes the rest. */}
          <div className="mt-8 flex items-start text-[11px] leading-[17px] text-grey-700">
            <div className="w-[86px] shrink-0">Redaction</div>
            <div className="flex-1">Area of redaction</div>
          </div>
          <div className="mt-7 flex flex-col gap-9">
            {REDACTION_AREAS.map((area) => (
              <div
                key={area.id}
                data-testid={`redaction-row-${area.id}`}
                className="flex items-start"
              >
                {/* The state sits a line lower than the area title in the
                    design — between its two lines, not aligned to the top. */}
                <div className="flex w-[86px] shrink-0 items-center gap-2 pt-[22px] text-[14px] leading-[20px] text-ink">
                  <span
                    aria-hidden
                    className="size-[7px] shrink-0 rounded-full"
                    // Garden success green (#048c80) — no token in theme.css.
                    style={{ backgroundColor: '#048c80' }}
                  />
                  {area.state}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="text-[15px] leading-[24px] font-semibold text-ink">
                    {area.name}
                  </span>
                  <p className="max-w-[950px] text-[13px] leading-[19px] text-ink">
                    {area.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
