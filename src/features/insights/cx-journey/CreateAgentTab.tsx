// Create Agent tab body for the Generated Agent panel. Summary gradient card
// (intro + Autoflow summary + 3 stats), a checkbox training-phrase table whose
// selection is owned by the parent, and an italic key-phrases box.
import type { GeneratedAgentDetail } from './automation-data'

export function CreateAgentTab({
  detail,
  selectedRows,
  onToggleRow,
}: {
  detail: GeneratedAgentDetail
  selectedRows: Set<number>
  onToggleRow: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <section className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold text-black">Summary</p>
        <div
          className="flex flex-col gap-2.5 rounded-[20px] border border-[#f2f4f7] p-4"
          style={{
            backgroundImage:
              'linear-gradient(145.9deg, rgba(255,179,147,0.15) 0%, rgba(171,213,250,0.15) 50%, rgba(18,166,180,0.15) 100%)',
          }}
        >
          <p className="text-[14px] leading-5 text-[#385075]">{detail.summary}</p>
          <div className="flex flex-col gap-1 text-[#385075]">
            <p className="text-[12px] font-semibold">Autoflow Summary</p>
            <p className="text-[14px] leading-5">{detail.autoflowSummary}</p>
          </div>
          <div className="flex flex-col gap-4">
            {detail.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <p className="text-[22px] font-semibold leading-7 text-[#385075]">{stat.value}</p>
                <p className="text-[12px] font-semibold text-[#385075]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training phrases table */}
      <section className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold text-black">
          Add more training phrases from the Topics below
        </p>
        <div className="overflow-hidden rounded-[20px] border border-[#e4e7f0]">
          <div className="flex items-center border-b border-[#e4e7f0] bg-[#fbfbfb] px-3 py-2 text-[14px] font-semibold text-[#545767]">
            <span className="w-8" />
            <span className="flex-1">Similar topic</span>
            <span className="w-[120px]">Coverage</span>
            <span className="w-[128px]">Savings</span>
          </div>
          {detail.trainingPhraseRows.map((row, i) => (
            <label
              key={row.topic}
              className="flex cursor-pointer items-center border-b border-[#e4e7f0] bg-[#fbfbfb] px-3 py-2 text-[14px] text-black last:border-b-0"
            >
              <span className="w-8">
                <input
                  type="checkbox"
                  aria-label={row.topic}
                  checked={selectedRows.has(i)}
                  onChange={() => onToggleRow(i)}
                  className="size-4"
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
          The workflow will include the following key phrases:
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
