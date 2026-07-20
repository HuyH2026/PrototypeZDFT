import svgPaths from "./svg-0rjdh8cljl";

function Frame() {
  return (
    <div className="absolute bg-[#eae9e8] content-stretch flex gap-[8px] items-center left-0 rounded-[8px] top-0 w-[211px]">
      <div className="relative shrink-0 size-[14px]" data-name="Line graph square">
        <div className="absolute inset-[12.5%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path clipRule="evenodd" d={svgPaths.p19e5db00} fill="var(--fill-0, #2F3130)" fillRule="evenodd" id="Icon" />
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0c0c0d] text-[14px] tracking-[-0.154px] w-[146px]">
        <p className="leading-[20px]">Insights</p>
      </div>
    </div>
  );
}

function NavItems() {
  return (
    <div className="absolute bg-[#eae9e8] content-stretch flex flex-col gap-[4px] items-start left-0 rounded-[8px] top-0 w-[203px]" data-name="nav items">
      <div className="bg-[#2f3130] content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[203px]" data-name="List">
        <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.154px] whitespace-nowrap">
          <p className="leading-[20px]">CX Journey</p>
        </div>
      </div>
      <div className="content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[210px]" data-name="List">
        <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2f3130] text-[14px] tracking-[-0.154px] whitespace-nowrap">
          <p className="leading-[20px]">AI Performances</p>
        </div>
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="contents relative size-full">
      <div className="absolute bg-[#eae9e8] h-[128px] left-0 rounded-[8px] top-0 w-[219px]" />
      <Frame />
      <NavItems />
    </div>
  );
}