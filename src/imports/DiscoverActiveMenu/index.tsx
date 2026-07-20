function Frame() {
  return (
    <div className="absolute content-stretch flex items-center left-[11px] top-[11px] w-[202px]">
      <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0c0c0d] text-[14px] tracking-[-0.154px] w-[146px]">
        <p className="leading-[20px]">Insights</p>
      </div>
    </div>
  );
}

function NavItems() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-[7px] top-[43px] w-[210px]" data-name="nav items">
      <div className="content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[210px]" data-name="List">
        <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2f3130] text-[14px] tracking-[-0.154px] whitespace-nowrap">
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

export default function DiscoverActiveMenu() {
  return (
    <div className="bg-white border border-[#eae9e8] border-solid overflow-clip relative rounded-[8px] shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)] size-full" data-name="Discover  / Active / Menu">
      <Frame />
      <NavItems />
    </div>
  );
}