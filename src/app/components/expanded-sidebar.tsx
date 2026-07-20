import React, { useState } from "react";
import svgPaths from "../../imports/02InsightsExpanded-1/svg-pk7xawk9ds";

// Each icon reproduces the exact markup from the Figma import (02InsightsExpanded),
// wrapped in a 14px box to match the expanded-state icon size. Fill is dynamic so
// hover/active states can recolor the glyph.
function IconBox({ children, clip = false }: { children: React.ReactNode; clip?: boolean }) {
  return (
    <div className={`relative shrink-0 size-[14px]${clip ? " overflow-clip" : ""}`}>
      {children}
    </div>
  );
}

const icons: Record<string, (fill: string) => React.ReactNode> = {
  Home: (fill) => (
    <IconBox>
      <div className="absolute inset-[12.2%_12.5%_12.5%_12.5%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.542">
          <path clipRule="evenodd" d={svgPaths.pb9595f1} fill={fill} fillRule="evenodd" />
        </svg>
      </div>
    </IconBox>
  ),
  Insights: (fill) => (
    <IconBox>
      <div className="absolute inset-[12.5%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
          <path clipRule="evenodd" d={svgPaths.p19e5db00} fill={fill} fillRule="evenodd" />
        </svg>
      </div>
    </IconBox>
  ),
  "AI Agents": (fill) => (
    <IconBox>
      <div className="absolute inset-[5%_5%_10%_5%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6 11.9">
          <g>
            <path d={svgPaths.p379c3680} fill={fill} />
            <path d={svgPaths.p35cd3b00} fill={fill} />
            <path d={svgPaths.p133fe1c0} fill={fill} />
            <path d={svgPaths.p1b00e780} fill={fill} />
            <path d={svgPaths.p32dfb080} fill={fill} />
          </g>
        </svg>
      </div>
    </IconBox>
  ),
  Knowledge: (fill) => (
    <IconBox clip>
      <div className="absolute inset-[16.63%_8.33%_10.42%_8.33%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6662 10.213">
          <path clipRule="evenodd" d={svgPaths.p3644ca00} fill={fill} fillRule="evenodd" />
        </svg>
      </div>
    </IconBox>
  ),
  Tools: (fill) => (
    <IconBox>
      <div className="absolute inset-[8.94%_8.94%_8.05%_8.05%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.621 11.6215">
          <path clipRule="evenodd" d={svgPaths.p2f124b00} fill={fill} fillRule="evenodd" />
        </svg>
      </div>
    </IconBox>
  ),
  Experiments: (fill) => (
    <IconBox clip>
      <div className="absolute inset-[4.17%_12.47%_8.18%_8.17%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.1097 12.2711">
          <g>
            <path clipRule="evenodd" d={svgPaths.p16826000} fill={fill} fillRule="evenodd" />
            <path d={svgPaths.p2f926480} fill={fill} />
            <path d={svgPaths.p23daa230} fill={fill} />
          </g>
        </svg>
      </div>
    </IconBox>
  ),
  Orchestrator: (fill) => (
    <IconBox>
      <div className="absolute inset-[6.25%_6.58%_8.33%_6.55%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.1627 11.9581">
          <g>
            <path clipRule="evenodd" d={svgPaths.p1133e700} fill={fill} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p346c6e00} fill={fill} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p967d200} fill={fill} fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </IconBox>
  ),
  Integrations: (fill) => (
    <IconBox>
      <div className="absolute inset-[8.33%_16.67%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33379 11.6669">
          <path clipRule="evenodd" d={svgPaths.p3b1eff00} fill={fill} fillRule="evenodd" />
        </svg>
      </div>
    </IconBox>
  ),
  Log: (fill) => (
    <IconBox clip>
      <div className="absolute inset-[16.67%_12.5%_16.67%_14.58%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.2082 9.33304">
          <g>
            <path d={svgPaths.p3f4dc180} fill={fill} />
            <path d={svgPaths.p3e7587c0} fill={fill} />
            <path d={svgPaths.p1bcab300} fill={fill} />
            <path d={svgPaths.p12162700} fill={fill} />
            <path d={svgPaths.p13f2b600} fill={fill} />
            <path d={svgPaths.p3ecea200} fill={fill} />
          </g>
        </svg>
      </div>
    </IconBox>
  ),
  Settings: (fill) => (
    <IconBox>
      <div className="absolute inset-[8.33%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6662 11.6662">
          <g>
            <path clipRule="evenodd" d={svgPaths.p2e5fb280} fill={fill} fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3f41a500} fill={fill} fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </IconBox>
  ),
  Organization: (fill) => (
    <IconBox clip>
      <div className="absolute inset-[12.5%_8.33%]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6662 10.5">
          <g>
            <path d={svgPaths.p6995370} fill={fill} />
            <path d={svgPaths.p35054800} fill={fill} />
            <path d={svgPaths.p2a601880} fill={fill} />
            <path d={svgPaths.p17868000} fill={fill} />
            <path d={svgPaths.p367ec200} fill={fill} />
            <path d={svgPaths.p1186be00} fill={fill} />
            <path clipRule="evenodd" d={svgPaths.p12738280} fill={fill} fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </IconBox>
  ),
};

interface ExpandedSidebarProps {
  items: string[];
  activeItem: string;
  submenus: Record<string, string[]>;
  selectedSub: Record<string, string>;
  onSelect: (item: string) => void;
  onSelectSub: (item: string, sub: string) => void;
  onToggle: () => void;
}

export function ExpandedSidebar({
  items,
  activeItem,
  submenus,
  selectedSub,
  onSelect,
  onSelectSub,
  onToggle,
}: ExpandedSidebarProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);

  const activeIdx = items.indexOf(activeItem);
  const activeSub = activeIdx >= 0 ? submenus[activeItem] || [] : [];
  const hasSub = activeSub.length > 0;
  // Submenu block height: each child row is 34px tall with 4px gaps between.
  const submenuHeight = hasSub ? activeSub.length * 34 + (activeSub.length - 1) * 4 : 0;
  // Items after an active-with-submenu item shift down by this amount.
  const shift = hasSub ? submenuHeight - 2 : 0;

  // Base row top for each item: 22px start, 50px stride (34px row + 16px gap).
  const topFor = (i: number) => 22 + i * 50 + (hasSub && i > activeIdx ? shift : 0);

  return (
    <div className="absolute left-[8px] top-[55px] h-[837px] w-[234px] bg-[#f8f7f6] rounded-l-[26px] overflow-hidden z-50">
      {items.map((item, i) => {
        const top = topFor(i);
        const isActive = item === activeItem;
        const isHovered = hoveredRow === item && !isActive;
        const sub = submenus[item] || [];
        const activeWithSub = isActive && sub.length > 0;
        const activeNoSub = isActive && sub.length === 0;

        // Icon/text color: active-no-submenu is a dark pill (white glyph/text),
        // hovered non-active rows use #404241, everything else #2F3130/#0c0c0d.
        const iconFill = activeNoSub ? "#ffffff" : isHovered ? "#404241" : "#2F3130";
        const textColor = activeNoSub ? "#ffffff" : isHovered ? "#404241" : "#0c0c0d";

        return (
          <React.Fragment key={item}>
            {/* Active-with-submenu pill (light, rounded-8, wraps the submenu) */}
            {activeWithSub && (
              <div
                className="absolute left-[8px] w-[219px] bg-[#eae9e8] rounded-[8px] z-0"
                style={{ top: top - 7, height: 51 + submenuHeight }}
              />
            )}

            {/* Active-no-submenu pill (dark, rounded-4, wraps the 34px row) */}
            {activeNoSub && (
              <div
                className="absolute left-[8px] w-[219px] h-[34px] bg-[#2f3130] rounded-[4px] z-0"
                style={{ top }}
              />
            )}

            {/* Hover pill for non-active rows (rounded-4, exactly wraps the 34px row) */}
            {isHovered && (
              <div
                className="absolute left-[8px] w-[219px] h-[34px] bg-[#d9d9d9] rounded-[4px] z-0"
                style={{ top }}
              />
            )}

            {/* Header row */}
            <button
              onClick={() => onSelect(item)}
              onMouseEnter={() => setHoveredRow(item)}
              onMouseLeave={() => setHoveredRow((prev) => (prev === item ? null : prev))}
              className="absolute left-[16px] w-[210px] h-[34px] flex items-center gap-[8px] z-10 cursor-pointer outline-none text-left"
              style={{ top }}
              title={item}
            >
              {icons[item](iconFill)}
              <span
                className="font-['SF_Pro_Text:Semibold',sans-serif] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap w-[146px]"
                style={{ color: textColor }}
              >
                {item}
              </span>
            </button>

            {/* Inline submenu for the active item */}
            {activeWithSub && (
              <div
                className="absolute left-[16px] flex flex-col gap-[4px] z-10"
                style={{ top: top + 32 }}
              >
                {sub.map((subItem) => {
                  const selected = (selectedSub[item] || sub[0]) === subItem;
                  const subHovered = hoveredSub === `${item}:${subItem}` && !selected;
                  return (
                    <button
                      key={subItem}
                      onClick={() => onSelectSub(item, subItem)}
                      onMouseEnter={() => setHoveredSub(`${item}:${subItem}`)}
                      onMouseLeave={() =>
                        setHoveredSub((prev) => (prev === `${item}:${subItem}` ? null : prev))
                      }
                      className={`flex items-center pl-[24px] pr-[10px] py-[7px] rounded-[4px] w-[203px] text-left cursor-pointer outline-none transition-colors ${
                        selected
                          ? "bg-[#2f3130]"
                          : subHovered
                          ? "bg-[rgba(100,104,100,0.08)]"
                          : ""
                      }`}
                    >
                      <span
                        className="font-['SF_Pro_Text:Regular',sans-serif] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap"
                        style={{ color: selected ? "#ffffff" : subHovered ? "#404241" : "#2f3130" }}
                      >
                        {subItem}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Collapse toggle, bottom-right (rotated to point inward) */}
      <button
        onClick={onToggle}
        className="absolute right-[16px] bottom-[12px] size-[32px] bg-[#293239] rounded-[16px] flex items-center justify-center cursor-pointer outline-none"
        title="Collapse sidebar"
      >
        <div className="relative size-[20px] rotate-180">
          <div className="absolute inset-[12.5%]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <path clipRule="evenodd" d={svgPaths.p2d08f380} fill="#ffffff" fillRule="evenodd" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
