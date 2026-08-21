// The hero band at the top of the agent-health card: the 💗 glyph with its
// sparkles beside a static prose read on agent health. Per the design there is
// no illustration asset — the heart and sparkles are text glyphs, so the decor
// is aria-hidden and the prose carries the meaning. The frame's three-stop
// peach→blue→teal wash was dropped at the user's request; the band is now just
// a hairline-bordered panel.

type HealthHeroBandProps = {
  digest: { verdict: string; narrative: string }
}

export function HealthHeroBand({ digest }: HealthHeroBandProps) {
  return (
    <div
      data-slot="health-hero"
      // col-span-full, not col-span-2: the metric grid drops to one column when
      // the card narrows, and a fixed 2-span would conjure an implicit second
      // column there instead of spanning the row.
      className="col-span-full overflow-clip rounded-[16px] border border-solid border-[#f2f4f7]"
    >
      {/* The frame sets the decor block at 43px and the prose at 196px; with a
          107px-wide decor block that leaves a 46px gutter between them. */}
      <div className="flex items-center gap-[46px] px-[43px] py-[19px]">
        <div
          data-slot="health-hero-decor"
          aria-hidden
          className="relative flex w-[107px] shrink-0 flex-col items-center"
        >
          <span className="pointer-events-none absolute right-[4px] top-0 text-[10px] text-[#f8d5e6]">
            ✦
          </span>
          <span className="pointer-events-none absolute left-[8px] top-[6px] text-[9px] text-[#f8d5e6]">
            ✦
          </span>
          <span className="pointer-events-none absolute bottom-[22px] left-0 text-[8px] text-[#f8d5e6]">
            ✦
          </span>
          <span className="text-[80px] leading-[88px]">💗</span>
          <span className="mt-1 text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-black">
            {digest.verdict}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-[20px] tracking-[-0.154px] text-[#313131]">
            Agent health
          </p>
          <p className="mt-[6px] max-w-[544px] text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#545767]">
            {digest.narrative}
          </p>
        </div>
      </div>
    </div>
  )
}
