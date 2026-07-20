import svgPaths from "./svg-3rboflj4ge";

function Fields() {
  return <div className="absolute bg-white inset-0 rounded-[26px]" data-name="fields" />;
}

function GradientFlora() {
  return (
    <div className="-translate-x-1/2 absolute bottom-[-317px] left-1/2 opacity-70 size-[676px]" data-name="Gradient [Flora]">
      <div className="absolute inset-[-4.73%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 740 740">
          <g id="Gradient [Flora]">
            <g filter="url(#filter0_f_20_10606)" id="AI/Glow" opacity="0.5">
              <circle cx="370" cy="370" fill="url(#paint0_radial_20_10606)" r="338" />
            </g>
            <g filter="url(#filter1_f_20_10606)" id="Neutral" opacity="0.72">
              <circle cx="307.227" cy="321.715" fill="var(--fill-0, white)" r="217.286" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="740" id="filter0_f_20_10606" width="740" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_20_10606" stdDeviation="16" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="594.571" id="filter1_f_20_10606" width="594.571" x="9.94141" y="24.4297">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_20_10606" stdDeviation="40" />
            </filter>
            <radialGradient cx="0" cy="0" gradientTransform="translate(370 370) rotate(-90) scale(303.596)" gradientUnits="userSpaceOnUse" id="paint0_radial_20_10606" r="1">
              <stop offset="0.134615" stopColor="#38B2C6" />
              <stop offset="0.712208" stopColor="#FBB497" stopOpacity="0.6" />
              <stop offset="0.948014" stopColor="#FFF6F3" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Gradient() {
  return (
    <div className="-translate-x-1/2 absolute bottom-[-318px] contents left-1/2" data-name="Gradient">
      <GradientFlora />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex items-center left-[7px] p-[8px] top-[4px]">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons/P/plus">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector" />
        </svg>
        <div className="absolute bottom-[20.83%] left-1/2 right-1/2 top-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-6.43%_-0.6px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.2 10.5333">
              <path d="M0.6 0.6V9.93333" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/2 left-[20.83%] right-[20.84%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-0.6px_-6.43%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5333 1.2">
              <path d="M0.6 0.6H9.93333" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Send() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="send (1) 1">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_20_10499)" id="send (1) 1">
          <g id="Vector" />
          <path d="M6.66602 9.33333L13.9993 2" id="Vector_2" stroke="var(--stroke-0, #A6A9B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p38d46300} id="Vector_3" stroke="var(--stroke-0, #A6A9B2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_20_10499">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Star() {
  return (
    <div className="content-stretch flex items-start justify-end p-[6px] relative rounded-[4px] shrink-0" data-name="Star">
      <Send />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex items-center left-[303px] top-[5px]">
      <Star />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-white border border-[#ffb393] border-solid h-[42px] left-[19px] overflow-clip right-[19px] rounded-[100px] shadow-[0px_0px_1px_0px_rgba(0,12,32,0.04),0px_2px_6px_0px_rgba(3,17,38,0.11)] top-[771px]">
      <p className="[word-break:break-word] absolute font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[20px] left-[47px] text-[#727583] text-[14px] top-[9px] tracking-[-0.1px] whitespace-nowrap">What can I help you with today?</p>
      <Frame7 />
      <Frame3 />
    </div>
  );
}

function TablerIconSparkles() {
  return (
    <div className="relative shrink-0 size-[16.077px]" data-name="tabler-icon-sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.0769 16.0769">
        <g id="tabler-icon-sparkles">
          <path d={svgPaths.p25168080} id="Vector" stroke="url(#paint0_linear_20_10624)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.11839" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_20_10624" x1="2.00977" x2="13.3976" y1="9.94067" y2="9.94067">
            <stop stopColor="#01567A" />
            <stop offset="1" stopColor="#6DBBD7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[1.692px] items-center relative shrink-0">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#545767] text-[15.231px] tracking-[-0.0846px] w-[66.846px]">
        <p className="leading-[22px]">AI Studio</p>
      </div>
      <TablerIconSparkles />
    </div>
  );
}

function FtStudioLogo() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="FT Studio logo">
      <Frame2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <FtStudioLogo />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex h-[22px] items-center relative shrink-0">
      <Frame1 />
    </div>
  );
}

function MainButton() {
  return (
    <div className="content-stretch flex items-center justify-center p-[5.25px] relative rounded-[3.5px] shrink-0" data-name="Main Button">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons/E/external-link">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector" />
        </svg>
        <div className="absolute bottom-[16.67%] left-[16.67%] right-1/4 top-1/4" data-name="Vector">
          <div className="absolute inset-[-7.14%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
              <path d={svgPaths.p2f353c80} id="Vector" stroke="var(--stroke-0, #646864)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[16.67%_16.67%_45.83%_45.83%]" data-name="Vector">
          <div className="absolute inset-[-11.11%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.33333 7.33333">
              <path d={svgPaths.p2c600f80} id="Vector" stroke="var(--stroke-0, #646864)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[16.67%_16.67%_62.5%_62.5%]" data-name="Vector">
          <div className="absolute inset-[-20%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.66667 4.66667">
              <path d="M0.666667 0.666667H4V4" id="Vector" stroke="var(--stroke-0, #646864)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainButton1() {
  return (
    <div className="content-stretch flex items-center justify-center p-[5.25px] relative rounded-[3.5px] shrink-0" data-name="Main Button">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icons/W/x">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector" />
        </svg>
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-8.33%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3333 9.3333">
              <path d={svgPaths.p3fd88300} id="Vector" stroke="var(--stroke-0, #646864)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-8.33%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3333 9.3333">
              <path d={svgPaths.p2c12c00} id="Vector" stroke="var(--stroke-0, #646864)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <MainButton />
      <MainButton1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-between left-[-1px] pb-[10px] pt-[20px] px-[20px] top-[-1px] w-[380px]">
      <Frame8 />
      <Frame4 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Building">
        <div className="absolute inset-[12.5%_8.33%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.666 15">
            <g id="Icon">
              <path d={svgPaths.p2fbb1b00} fill="var(--fill-0, #247ACB)" />
              <path d={svgPaths.p198d1f80} fill="var(--fill-0, #247ACB)" />
              <path d={svgPaths.p24b2cb00} fill="var(--fill-0, #247ACB)" />
              <path d={svgPaths.p16608d00} fill="var(--fill-0, #247ACB)" />
              <path d={svgPaths.p23a4b240} fill="var(--fill-0, #247ACB)" />
              <path d={svgPaths.p1f9c4000} fill="var(--fill-0, #247ACB)" />
              <path clipRule="evenodd" d={svgPaths.p829b800} fill="var(--fill-0, #247ACB)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['SF_Pro_Text:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#3d4040] text-[14px] tracking-[-0.154px] whitespace-nowrap">Organization Setup</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[243px]">
      <Frame11 />
      <p className="[word-break:break-word] font-['SF_Pro_Text:Regular',sans-serif] leading-[16px] min-w-full not-italic relative shrink-0 text-[#373a4d] text-[12px] tracking-[-0.0004px] w-[min-content]">Set your Organization name and select customer support channels.</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex h-[76px] items-center justify-between pb-[8px] relative shrink-0 w-full">
      <div aria-hidden className="absolute border-[#e8e9eb] border-b border-solid inset-0 pointer-events-none" />
      <Frame12 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Book open">
        <div className="absolute inset-[16.63%_8.33%_10.42%_8.33%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.666 14.5901">
            <path clipRule="evenodd" d={svgPaths.p1e656300} fill="var(--fill-0, #BE297B)" fillRule="evenodd" id="Icon" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['SF_Pro_Text:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#3d4040] text-[14px] tracking-[-0.154px] whitespace-nowrap">Connect Knowledge</p>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[308px]">
      <Frame18 />
      <p className="[word-break:break-word] font-['SF_Pro_Text:Regular',sans-serif] leading-[16px] min-w-full not-italic relative shrink-0 text-[#373a4d] text-[12px] tracking-[-0.0004px] w-[min-content]">Connect a knowledge base so your Agents have source information to work with.</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[8px] relative shrink-0 w-full">
      <div aria-hidden className="absolute border-[#e8e9eb] border-b border-solid inset-0 pointer-events-none" />
      <Frame17 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[20px]" data-name="Bubble">
        <div className="absolute inset-[12.5%_8.33%_8.33%_8.34%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.667 15.8335">
            <path clipRule="evenodd" d={svgPaths.p98dffc0} fill="var(--fill-0, #2F99B3)" fillRule="evenodd" id="Icon" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['SF_Pro_Text:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#3d4040] text-[14px] tracking-[-0.154px] whitespace-nowrap">Channel Configuration</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[243px]">
      <Frame21 />
      <p className="[word-break:break-word] font-['SF_Pro_Text:Regular',sans-serif] leading-[16px] min-w-full not-italic relative shrink-0 text-[#373a4d] text-[12px] tracking-[-0.0004px] w-[min-content]">Set up your channels based on your brand specifications.</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[8px] relative shrink-0 w-full">
      <div aria-hidden className="absolute border-[#e8e9eb] border-b border-solid inset-0 pointer-events-none" />
      <Frame20 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[20px]" data-name="Bot sparkle">
        <div className="absolute inset-[5%_5%_10%_5%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17">
            <g id="Icon">
              <path d={svgPaths.p3d4f5d00} fill="var(--fill-0, #E05C34)" />
              <path d={svgPaths.p7838000} fill="var(--fill-0, #E05C34)" />
              <path d={svgPaths.p3ee41800} fill="var(--fill-0, #E05C34)" />
              <path d={svgPaths.p28cdd100} fill="var(--fill-0, #E05C34)" />
              <path d={svgPaths.pf01800} fill="var(--fill-0, #E05C34)" />
            </g>
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['SF_Pro_Text:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#3d4040] text-[14px] tracking-[-0.154px] whitespace-nowrap">Build Agent</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[243px]">
      <Frame24 />
      <p className="[word-break:break-word] font-['SF_Pro_Text:Regular',sans-serif] leading-[16px] min-w-full not-italic relative shrink-0 text-[#373a4d] text-[12px] tracking-[-0.0004px] w-[min-content]">Build your AI agent using natural language.</p>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[8px] relative shrink-0 w-full">
      <Frame23 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-[15px] top-[45px] w-[308px]">
      <Frame13 />
      <Frame15 />
      <Frame19 />
      <Frame22 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute backdrop-blur-[50px] bg-[rgba(255,255,255,0.3)] border border-[rgba(255,255,255,0.8)] border-solid h-[375px] left-[19px] overflow-clip rounded-[20px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.06)] top-[381px] w-[340px]">
      <Frame16 />
      <p className="[word-break:break-word] absolute font-['SF_Pro_Text:Medium',sans-serif] leading-[20px] left-[15px] not-italic text-[12px] text-black top-[12px] tracking-[-0.154px] whitespace-nowrap">AI Agent set up</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute bg-white border border-[#f8f8f8] border-solid h-[837px] left-[988px] overflow-clip rounded-[24px] top-0 w-[380px]">
      <Gradient />
      <div className="[word-break:break-word] absolute font-['SF_Pro_Display:Regular',sans-serif] leading-[0] left-[21px] not-italic text-[22px] text-black top-[136px] tracking-[0.352px] w-[290px]">
        <p className="leading-[30px] mb-0">Welcome, Sunny 👋</p>
        <p className="leading-[30px]">{`Let's set up your first AI organization.`}</p>
      </div>
      <Frame6 />
      <Frame5 />
      <div className="absolute content-stretch flex flex-col items-start left-[21px] top-[251px] w-[320px]" data-name="Copilot message">
        <p className="[word-break:break-word] font-['SF_Pro_Text:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#2f3130] text-[14px] tracking-[-0.154px] w-full">Here are the next steps to get your AI Agent up and running.</p>
      </div>
      <Frame10 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[837px] right-0 top-0 w-[983px]">
      <Fields />
      <Frame14 />
    </div>
  );
}

function Content() {
  return (
    <div className="bg-[#2f3130] content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[99px] shrink-0" data-name="Content">
      <p className="[word-break:break-word] font-['SF_Pro_Text:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-center text-white tracking-[-0.154px] whitespace-nowrap">Create New AI Org</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[24px] items-center left-0 top-0 w-[736px]">
      <div className="[word-break:break-word] font-['SF_Pro_Text:Regular',sans-serif] h-[48px] leading-[0] min-w-full not-italic relative shrink-0 text-[#404241] text-[0px] text-center tracking-[-0.45px] w-[min-content] whitespace-pre-wrap">
        <p className="leading-[24px] mb-0 text-[18px]">{`Create your organization and pick the channels where you want your AI to show up. `}</p>
        <p className="text-[18px]">
          <span className="leading-[24px]">{`You can set up how it behaves on each one later, in `}</span>
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] [word-break:break-word] decoration-from-font decoration-solid font-['SF_Pro_Text:Regular',sans-serif] leading-[24px] not-italic tracking-[-0.45px] underline">Configuration</span>
          <span className="leading-[24px]">.</span>
        </p>
      </div>
      <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="🌸 Button">
        <Content />
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute left-0 size-[327.122px] top-0">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327.122 327.122">
        <g id="Group 1707481744">
          <circle cx="162.292" cy="165.668" id="Ellipse 70918" r="85.9447" stroke="url(#paint0_linear_20_10892)" strokeWidth="0.945438" />
          <circle cx="162.299" cy="165.668" id="Ellipse 70919" opacity="0.75" r="122.198" stroke="url(#paint1_linear_20_10892)" strokeOpacity="0.3" strokeWidth="0.945438" />
          <circle cx="163.561" cy="163.561" id="Ellipse 70920" opacity="0.5" r="163.088" stroke="url(#paint2_linear_20_10892)" strokeOpacity="0.3" strokeWidth="0.945438" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_20_10892" x1="75.875" x2="248.71" y1="196.403" y2="196.403">
            <stop stopColor="#FFB393" />
            <stop offset="0.5" stopColor="#ABD5FA" />
            <stop offset="1" stopColor="#12A6B4" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_20_10892" x1="162.721" x2="64.0787" y1="42.9971" y2="230.165">
            <stop stopColor="#FFB393" />
            <stop offset="0.5" stopColor="#ABD5FA" />
            <stop offset="1" stopColor="#12A6B4" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_20_10892" x1="-2.10231e-06" x2="327.122" y1="221.731" y2="221.731">
            <stop stopColor="#FFB393" />
            <stop offset="0.5" stopColor="#ABD5FA" />
            <stop offset="1" stopColor="#12A6B4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconWidget() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[65.977px] top-0">
      <div className="flex-none rotate-[14.55deg]">
        <div className="bg-[#e05c34] content-stretch flex items-center justify-center p-[10.147px] relative rounded-[27.06px] shadow-[0px_0px_0.873px_0px_rgba(0,12,32,0.04),1.746px_4.364px_6.983px_0px_rgba(3,17,38,0.11)] size-[54.119px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[33.824px]" data-name="Icon">
            <div className="absolute inset-[23.75%_13.75%_8.75%_13.75%]" data-name="Vector">
              <div className="absolute inset-[-5.56%_-5.17%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.0595 25.3686">
                  <path d={svgPaths.p1e210100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.53683" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[43.75%_38.75%_56.25%_38.75%]" data-name="Vector">
              <div className="absolute inset-[-1.27px_-16.67%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1473 2.53683">
                  <path d="M1.26842 1.26842H8.87892" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2.53683" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[56.25%_38.75%_43.75%_38.75%]" data-name="Vector">
              <div className="absolute inset-[-1.27px_-16.67%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1473 2.53683">
                  <path d="M1.26842 1.26842H8.87892" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2.53683" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TablerIconBrandSlack() {
  return (
    <div className="relative shrink-0 size-[20.681px]" data-name="tabler-icon-brand-slack">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.6815 20.6815">
        <g id="tabler-icon-brand-slack">
          <path d={svgPaths.p2594a700} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55111" />
        </g>
      </svg>
    </div>
  );
}

function IconWidget1() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[65.579px] top-0">
      <div className="flex-none rotate-[8.52deg]">
        <div className="bg-[#2f99b3] content-stretch flex items-center justify-center p-[10.813px] relative rounded-[28.836px] shadow-[0px_0px_0.945px_0px_rgba(0,12,32,0.04),1.891px_4.727px_7.564px_0px_rgba(3,17,38,0.11)] size-[57.672px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[36.045px]" data-name="Icons/C/code">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[33.33%_70.83%_33.33%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-11.25%_-22.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.71083 14.7183">
                  <path d={svgPaths.p1fa1c100} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.70336" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[33.33%_12.5%_33.33%_70.83%]" data-name="Vector">
              <div className="absolute inset-[-11.25%_-22.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.71083 14.7183">
                  <path d={svgPaths.p3452f800} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.70336" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[16.67%_41.67%]" data-name="Vector">
              <div className="absolute inset-[-6.16%_-24.63%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.9664 26.9888">
                  <path d={svgPaths.p15af3b80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.95822" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconWidget2() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-0 p-[17.763px] rounded-[47.369px] shadow-[0px_0px_1.553px_0px_rgba(0,12,32,0.04),3.106px_7.765px_12.425px_0px_rgba(3,17,38,0.11)] size-[94.544px] top-0" style={{ backgroundImage: "linear-gradient(135deg, rgb(141, 89, 177) 20%, rgb(64, 108, 196) 125%)" }} data-name="Icon / Widget">
      <div className="overflow-clip relative shrink-0 size-[59.017px]" data-name="Building">
        <div className="absolute inset-[12.5%_8.33%]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49.179 44.2628">
            <g id="Icon">
              <path d={svgPaths.p4b17ff2} fill="var(--fill-0, white)" />
              <path d={svgPaths.p39efc8c0} fill="var(--fill-0, white)" />
              <path d={svgPaths.p1000} fill="var(--fill-0, white)" />
              <path d={svgPaths.p6737f80} fill="var(--fill-0, white)" />
              <path d={svgPaths.p207cdb00} fill="var(--fill-0, white)" />
              <path d={svgPaths.p16a971c0} fill="var(--fill-0, white)" />
              <path clipRule="evenodd" d={svgPaths.p3a70e480} fill="var(--fill-0, white)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function IconWidget3() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[42.55px] top-0">
      <div className="flex-none rotate-[-11.87deg]">
        <div className="bg-[#2f69c7] content-stretch flex items-center justify-center opacity-60 p-[6.736px] relative rounded-[17.963px] shadow-[0px_0px_0.945px_0px_rgba(0,12,32,0.04),1.891px_4.727px_7.564px_0px_rgba(3,17,38,0.11)] size-[35.927px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[22.454px]" data-name="Icons/M/mail">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[20.83%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-6.43%_-5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.5247 14.7823">
                  <path d={svgPaths.p59a4c00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.68406" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[29.17%_12.5%_45.83%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-15%_-5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.5249 7.29769">
                  <path d={svgPaths.p278cca60} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.68406" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconWidget4() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[36.318px] top-0">
      <div className="flex-none rotate-[13.09deg]">
        <div className="bg-[#109081] content-stretch flex items-center justify-center p-[5.673px] relative rounded-[15.127px] shadow-[0px_0px_0.945px_0px_rgba(0,12,32,0.04),1.891px_4.727px_7.564px_0px_rgba(3,17,38,0.11)] size-[30.254px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[18.909px]" data-name="Icons/B/brand-whatsapp">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[12.57%_12.47%_12.43%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.6058 15.5997">
                  <path d={svgPaths.p39b5a7f0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.41816" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[35.42%_35.42%_37.5%_37.5%]" data-name="Vector">
              <div className="absolute inset-[-13.85%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.53928 6.53928">
                  <path d={svgPaths.p224e8e00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.41816" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconWidget5() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[53.509px] top-0">
      <div className="flex-none rotate-[-16.82deg]">
        <div className="bg-[#3489db] content-stretch flex items-center justify-center opacity-50 p-[8.048px] relative rounded-[21.462px] shadow-[0px_0px_0.81px_0px_rgba(0,12,32,0.04),1.62px_4.049px_6.479px_0px_rgba(3,17,38,0.11)] size-[42.923px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[26.827px]" data-name="Icons/B/brand-messenger">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[16.58%_12.44%_16.67%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-5.62%_-5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.148 19.9203">
                  <path d={svgPaths.p163ee500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.01203" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[45.83%_33.33%]" data-name="Vector">
              <div className="absolute inset-[-45%_-11.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.9546 4.24783">
                  <path d={svgPaths.p109c0200} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.01203" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconWidget6() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[34.487px] top-0">
      <div className="flex-none rotate-[14.29deg]">
        <div className="bg-[#23831b] content-stretch flex items-center justify-center opacity-40 p-[5.318px] relative rounded-[14.182px] shadow-[0px_0px_0.945px_0px_rgba(0,12,32,0.04),1.891px_4.727px_7.564px_0px_rgba(3,17,38,0.11)] size-[28.363px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[17.727px]" data-name="Icons/B/brand-line">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[12.5%]" data-name="Vector">
              <div className="absolute inset-[-5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6248 14.6249">
                  <path d={svgPaths.p2b2bdda0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32952" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconWidget7() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[36.268px] top-0">
      <div className="flex-none rotate-[7.92deg]">
        <div className="bg-[#ac2a34] content-stretch flex items-center justify-center opacity-30 p-[6.027px] relative rounded-[16.072px] shadow-[0px_0px_0.731px_0px_rgba(0,12,32,0.04),1.461px_3.653px_5.845px_0px_rgba(3,17,38,0.11)] size-[32.145px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[20.091px]" data-name="Icons/P/phone-incoming">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[16.67%_16.67%_12.5%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-5.29%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.7376 15.7376">
                  <path d={svgPaths.p14d22e00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50679" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[16.67%_16.67%_62.5%_62.5%]" data-name="Vector">
              <div className="absolute inset-[-18%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.69232 5.69232">
                  <path d={svgPaths.p2f65e62c} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50679" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[20.83%_20.83%_62.5%_62.5%]" data-name="Vector">
              <div className="absolute inset-[-24.62%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.99727 4.99727">
                  <path d={svgPaths.p241d4280} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.64885" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconWidget8() {
  return (
    <div className="absolute flex items-center justify-center left-0 size-[50.751px] top-0">
      <div className="flex-none rotate-[-4.76deg]">
        <div className="bg-[#7c1d79] content-stretch flex items-center justify-center p-[8.814px] relative rounded-[23.505px] shadow-[0px_0px_0.797px_0px_rgba(0,12,32,0.04),1.594px_3.984px_6.374px_0px_rgba(3,17,38,0.11)] size-[47.009px]" data-name="Icon / Widget">
          <div className="overflow-clip relative shrink-0 size-[29.381px]" data-name="Icons/P/phone">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Vector" />
            </svg>
            <div className="absolute inset-[16.67%_16.67%_12.5%_12.5%]" data-name="Vector">
              <div className="absolute inset-[-5.29%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.0151 23.0151">
                  <path d={svgPaths.p3a79af00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.20357" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group />
      <IconWidget />
      <div className="absolute flex items-center justify-center left-0 size-[37.82px] top-0">
        <div className="flex-none rotate-[-8.92deg]">
          <div className="bg-[#724be8] content-stretch flex items-center justify-center p-[6.204px] relative rounded-[16px] shadow-[0px_0px_1.034px_0px_rgba(0,12,32,0.04),2.068px_5.17px_8.273px_0px_rgba(3,17,38,0.11)] size-[33.09px]" data-name="Icon / Slack">
            <TablerIconBrandSlack />
          </div>
        </div>
      </div>
      <IconWidget1 />
      <IconWidget2 />
      <IconWidget3 />
      <IconWidget4 />
      <IconWidget5 />
      <IconWidget6 />
      <IconWidget7 />
      <IconWidget8 />
    </div>
  );
}

export default function Group2() {
  return (
    <div className="contents relative size-full">
      <Frame />
      <Frame9 />
      <Group1 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[#2f3941] text-[26px] top-[16px] tracking-[0.3536px] whitespace-nowrap">
        <p className="leading-[32px]">Organization</p>
      </div>
    </div>
  );
}