import React, { useRef, useState } from "react";
import FullPage from "../../imports/FullPage/index";

// Channel card geometry within the FullPage frame's own coordinate space.
// (x, y) is the card's top-left; all cards are 216 x 120.
const CARD_W = 216;
const CARD_H = 120;
const CHANNELS: { label: string; x: number; y: number }[] = [
  { label: "Web Widget", x: 355, y: 303 },
  { label: "Slack", x: 587, y: 303 },
  { label: "Facebook Messenger", x: 819, y: 303 },
  { label: "WhatsApp", x: 355, y: 439 },
  { label: "Instagram Direct", x: 587, y: 439 },
  { label: "Android", x: 819, y: 439 },
  { label: "iOS", x: 355, y: 575 },
  { label: "LINE", x: 587, y: 575 },
  { label: "Email", x: 355, y: 775 },
  { label: "Inbound Voice", x: 355, y: 975 },
  { label: "Outbound Voice", x: 587, y: 975 },
  { label: "Web Call", x: 819, y: 975 },
  { label: "API", x: 355, y: 1175 },
];

const FRAME_W = 1440;
const FRAME_H = 1360;

export function CreateOrgFlow({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string, channels: string[]) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const count = selected.size;
  const hasSelection = count > 0;
  const canSave = hasSelection && name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(name.trim(), Array.from(selected));
  };

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
      className="absolute inset-0 overflow-y-auto bg-[#f1efed]"
    >
      <div className="mx-auto pt-[13px] pb-[40px]" style={{ width: FRAME_W }}>
        {/* Sticky, opaque header that sits flush on the white form card */}
        <div
          className={`sticky top-0 z-20 h-[73px] w-full bg-white rounded-t-[20px] transition-shadow duration-300 ${
            scrolled ? "shadow-[0px_8px_16px_0px_rgba(10,13,14,0.06)]" : ""
          }`}
        >
          <p className="absolute left-[25px] top-[35px] -translate-y-1/2 font-['SF_Pro_Display:Semibold',sans-serif] text-[#2f3941] text-[22px] tracking-[0.352px] leading-[28px] whitespace-nowrap">
            Organization Setup
          </p>

          {/* Selected channels count */}
          {hasSelection && (
            <p className="absolute left-[1054px] top-[36px] -translate-y-1/2 w-[136px] font-['SF_Pro_Text:Semibold',sans-serif] text-[#2f3941] text-[14px] tracking-[-0.154px] leading-[20px]">
              <span>{count} </span>
              <span className="font-['SF_Pro_Text:Regular',sans-serif] text-[#545767]">
                {count === 1 ? "channel selected" : "channels selected"}
              </span>
            </p>
          )}

          {/* Close / Save */}
          <div className="absolute left-[1211px] top-[15px] flex gap-[10px] items-center">
            <button
              onClick={onClose}
              className="h-[40px] px-[16px] py-[10px] rounded-[99px] border border-[#999b97] border-solid flex items-center justify-center cursor-pointer outline-none"
            >
              <span className="font-['SF_Pro_Text:Semibold',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] leading-[20px]">
                Close
              </span>
            </button>
            <button
              disabled={!canSave}
              onClick={handleSave}
              className="h-[40px] px-[16px] py-[10px] rounded-[99px] flex items-center justify-center outline-none transition-colors"
              style={{
                backgroundColor: canSave ? "#2f3130" : "rgba(100,104,100,0.08)",
                cursor: canSave ? "pointer" : "not-allowed",
              }}
            >
              <span
                className="font-['SF_Pro_Text:Semibold',sans-serif] text-[14px] tracking-[-0.154px] leading-[20px]"
                style={{ color: canSave ? "#ffffff" : "#8b8e89" }}
              >
                Save
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable full-page form (tucked under the header) */}
        <div className="relative -mt-[20px]" style={{ width: FRAME_W, height: FRAME_H }}>
          <FullPage />

          {/* Controlled company-name input over the imported input box */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Give your AI Org a name"
            className="absolute left-[355px] top-[111px] w-[680px] h-[42px] px-[12px] bg-white rounded-[8px] border border-[#b7b7b3] border-solid outline-none focus:border-[#2f3130] font-['SF_Pro_Text:Regular',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] placeholder:text-[#a0a0a0]"
          />

          {/* Interactive selection overlays over each channel card */}
          {CHANNELS.map((c) => {
            const isSelected = selected.has(c.label);
            return (
              <button
                key={c.label}
                onClick={() => toggle(c.label)}
                title={c.label}
                className="absolute rounded-[12px] cursor-pointer outline-none transition-colors"
                style={{
                  left: c.x,
                  top: c.y,
                  width: CARD_W,
                  height: CARD_H,
                  boxShadow: isSelected ? "0 0 0 2px #373a4d inset" : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
