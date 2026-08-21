// Overview tab body for the Create use case panel. Summary gradient card
// (intro + suggested policy summary + 3 stats), a checkbox similar-topic table whose
// selection is owned by the parent, and an italic key-phrases box.
import { Info } from 'lucide-react'
import type { GeneratedUseCaseDetail } from './automation-insights-data'
import { SelectionCheckbox } from './SelectionCheckbox'

const SIMILAR_TOPIC_COLUMNS = [
  { label: 'Similar topic', className: 'flex-1' },
  { label: 'Coverage', className: 'w-[120px]' },
  { label: 'Savings', className: 'w-[128px]' },
]

export function CreateUseCaseTab({
  detail,
  selectedRows,
  onToggleRow,
}: {
  detail: GeneratedUseCaseDetail
  selectedRows: Set<number>
  onToggleRow: (index: number) => void
}) {
  const allSelected = selectedRows.size === detail.trainingPhraseRows.length

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <section className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold text-black">Summary</p>
        <div
          className="flex flex-col gap-2.5 rounded-[20px] border border-grey-100 p-4"
          style={{
            backgroundImage:
              'linear-gradient(145.9deg, rgba(255,179,147,0.15) 0%, rgba(171,213,250,0.15) 50%, rgba(18,166,180,0.15) 100%)',
          }}
        >
          <p className="text-[14px] leading-5 text-[#385075]">{detail.summary}</p>
          <div className="flex flex-col gap-1 text-[#385075]">
            <p className="text-[12px] font-semibold">Suggested policy summary</p>
            <p className="text-[14px] leading-5">{detail.suggestedPolicySummary}</p>
          </div>
          <div className="flex flex-col gap-4">
            {detail.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <p className="text-[22px] font-semibold leading-7 text-[#385075]">{stat.value}</p>
                <p className="flex items-center gap-1 text-[12px] font-semibold text-[#385075]">
                  {stat.label}
                  <Info size={12} aria-hidden />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Similar topics */}
      <section className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold text-black">
          Add more training phrases from the Topics below
        </p>
        <div className="overflow-hidden rounded-[20px] border border-grey-200">
          <div
            data-testid="similar-topics-header"
            className="flex items-center border-b border-grey-200 bg-[#fbfbfb] px-3 py-2 text-[14px] text-grey-800"
          >
            <span className="w-8">
              <SelectionCheckbox
                label="Select all similar topics"
                checked={allSelected}
                indeterminate={selectedRows.size > 0 && !allSelected}
                onChange={() =>
                  detail.trainingPhraseRows.forEach((_, index) => {
                    if (allSelected === selectedRows.has(index)) onToggleRow(index)
                  })
                }
              />
            </span>
            {SIMILAR_TOPIC_COLUMNS.map((column) => (
              <span key={column.label} className={`flex items-center gap-1 ${column.className}`}>
                {column.label}
                <button
                  type="button"
                  aria-label={`About ${column.label}`}
                  className="text-ink-muted"
                >
                  <Info size={12} aria-hidden />
                </button>
              </span>
            ))}
          </div>
          {detail.trainingPhraseRows.map((row, i) => (
            <label
              key={row.topic}
              className="flex cursor-pointer items-center border-b border-grey-200 bg-[#fbfbfb] px-3 py-2 text-[14px] text-black last:border-b-0"
            >
              <span className="w-8">
                <SelectionCheckbox
                  label={`Select ${row.topic}`}
                  checked={selectedRows.has(i)}
                  onChange={() => onToggleRow(i)}
                />
              </span>
              <span className="flex-1">{row.topic}</span>
              <span className="w-[120px]">{row.coverage}</span>
              <span className="w-[128px]">{row.savings}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Key phrases */}
      <section className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold text-black">
          The use case will include the following key phrases:
        </p>
        <div className="flex flex-col gap-2 rounded-[20px] bg-[#f9f8f7] p-4">
          {detail.keyPhrases.map((phrase) => (
            <p key={phrase} className="text-[14px] italic text-[#3489db]">
              "{phrase}"
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}
