import svgPaths from "./svg-15ztswzyr3";

function NavItems() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-0 top-0 w-[210px]" data-name="nav items">
      <div className="bg-[#2f3130] content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[203px]" data-name="List">
        <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.154px] whitespace-nowrap">
          <p className="leading-[20px]">A/B Test</p>
        </div>
      </div>
      <div className="content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[203px]" data-name="List">
        <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2f3130] text-[14px] tracking-[-0.154px] whitespace-nowrap">
          <p className="leading-[20px]">Test Suite</p>
        </div>
      </div>
      <div className="content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[203px]" data-name="List">
        <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2f3130] text-[14px] tracking-[-0.154px] whitespace-nowrap">
          <p className="leading-[20px]">Simulations</p>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[34px] items-center left-0 top-0 w-[210px]">
      <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Test tube">
        <div className="absolute inset-[4.17%_12.47%_8.18%_8.17%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1097 12.2711">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p16826000} fill="var(--fill-0, #2F3130)" fillRule="evenodd" />
              <path d={svgPaths.p2f926480} fill="var(--fill-0, #2F3130)" />
              <path d={svgPaths.p23daa230} fill="var(--fill-0, #2F3130)" />
            </g>
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0c0c0d] text-[14px] tracking-[-0.154px] w-[146px]">
        <p className="leading-[20px]">Experiments</p>
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="contents relative size-full">
      <div className="absolute bg-[#eae9e8] h-[162px] left-0 rounded-[8px] top-0 w-[219px]" />
      <NavItems />
      <Frame />
    </div>
  );
}