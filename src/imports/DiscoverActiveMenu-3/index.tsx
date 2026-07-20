function Frame() {
  return (
    <div className="absolute content-stretch flex items-center left-[11px] top-[11px] w-[202px]">
      <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0c0c0d] text-[14px] tracking-[-0.154px] w-[146px]">
        <p className="leading-[20px]">Orchestrator</p>
      </div>
    </div>
  );
}

export default function DiscoverActiveMenu() {
  return (
    <div className="bg-white border border-[#eae9e8] border-solid overflow-clip relative rounded-[8px] shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)] size-full" data-name="Discover  / Active / Menu">
      <Frame />
    </div>
  );
}