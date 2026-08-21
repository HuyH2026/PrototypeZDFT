// Left column of the Headless tab: the A2A intro (gradient teal copy, robot
// glyphs, heading + description) and the 4 numbered onboarding steps, each with
// a copyable dark code block. Presentational; content from config-data.
import { CopyField } from './CopyField'
import { PreviewHint } from './PreviewFrame'
import {
  HEADLESS_HINT,
  HEADLESS_INTRO,
  A2A_HEADING,
  A2A_DESCRIPTION,
  HEADLESS_STEPS,
} from './config-data'
import chatBotTeal from '@/assets/headless/chat-bot-teal.svg'
import chatBotPink from '@/assets/headless/chat-bot-pink.svg'
import arrowsDiff from '@/assets/headless/arrows-diff.svg'

export function HeadlessInstructions() {
  return (
    <div className="w-full max-w-[640px]">
      <PreviewHint>{HEADLESS_HINT}</PreviewHint>

      <div className="mt-6 rounded-[24px] border border-[#f2f4f7] bg-white px-8 py-8 shadow-[0_0_15px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-center gap-3" aria-hidden>
          <img src={chatBotTeal} alt="" className="size-8" />
          <img src={arrowsDiff} alt="" className="size-10" />
          <img src={chatBotPink} alt="" className="size-8" />
        </div>

        <h2 className="mt-5 text-center text-[20px] font-semibold leading-7 tracking-[-0.3px] text-ink">
          {A2A_HEADING}
        </h2>
        <p className="mx-auto mt-3 max-w-[520px] text-center text-[14px] leading-5 text-grey-800">
          {A2A_DESCRIPTION}
        </p>
        <p className="mt-5 rounded-xl bg-grey-100 px-4 py-3 text-[13px] leading-5 text-grey-800">
          {HEADLESS_INTRO}
        </p>

        <div className="mt-8 flex flex-col">
          {HEADLESS_STEPS.map((step) => (
            <section
              key={step.n}
              className="border-t border-grey-200 py-6 first:border-t-0 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e4eaf6] text-[12px] font-semibold text-[#193d50]">
                  {step.n}
                </span>
                <h3 className="text-[14px] font-semibold leading-5 text-ink">{step.title}</h3>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-grey-800">{step.body}</p>
              <CopyField
                value={step.code}
                aria-label={`Copy code for step ${step.n}`}
                className="mt-3"
              >
                <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-5 tracking-[-0.1px] text-grey-200">
                  {step.code}
                </pre>
              </CopyField>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
