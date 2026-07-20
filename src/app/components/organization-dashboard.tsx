import React, { useState } from "react";
import Org06, { OrgIllustration } from "../../imports/Org06-1/index";
import OrgExpanded from "../../imports/11OrgManagementExpanded-1/index";
import { channelMeta } from "./channel-meta";

export type Org = {
  id: string;
  name: string;
  channels: string[];
};

function ChannelChip({ label }: { label: string }) {
  const { display, color, Icon } = channelMeta(label);
  return (
    <div
      className="flex gap-[4px] h-[20px] items-center px-[8px] py-[2px] rounded-[99px] shrink-0"
      style={{ backgroundColor: `${color}22` }}
    >
      <Icon size={12} color={color} strokeWidth={2} />
      <span
        className="font-['SF_Pro_Text:Semibold',sans-serif] text-[12px] tracking-[-0.0004px] leading-[16px] whitespace-nowrap"
        style={{ color }}
      >
        {display}
      </span>
    </div>
  );
}

function OrgRow({ org, width }: { org: Org; width: number }) {
  const visible = org.channels.slice(0, 3);
  const overflow = org.channels.length - visible.length;
  const initial = org.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="bg-white h-[72px] relative rounded-[16px] border border-[#d8dcde] border-solid transition-[width] duration-300"
      style={{ width }}
    >
      {/* Name */}
      <div className="absolute left-[12px] top-[20px] flex gap-[8px] items-center">
        <div className="size-[32px] rounded-full bg-[#2f3130] flex items-center justify-center shrink-0">
          <span className="font-['SF_Pro_Text:Semibold',sans-serif] text-white text-[14px]">
            {initial}
          </span>
        </div>
        <p className="font-['SF_Pro_Display:Medium',sans-serif] text-[#2f3130] text-[16px] tracking-[0.352px] leading-[28px] whitespace-nowrap">
          {org.name}
        </p>
      </div>

      {/* Channels */}
      <div className="absolute left-[211px] top-[26px] flex gap-[6px] items-center">
        {visible.map((c) => (
          <ChannelChip key={c} label={c} />
        ))}
        {overflow > 0 && (
          <span className="font-['SF_Pro_Text:Regular',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap">
            +{overflow}
          </span>
        )}
      </div>

      {/* Resolution rate */}
      <p
        className="absolute top-[24px] font-['SF_Pro_Text:Regular',sans-serif] text-[#8b8e89] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap"
        style={{ left: width - 184 }}
      >
        n/a
      </p>

      {/* Overflow menu */}
      <div className="absolute right-[42px] top-[24px] text-[#646864] text-[20px] leading-[20px]">
        ⋮
      </div>
    </div>
  );
}

// Column offsets shared by the table header and every org row, so the "Name",
// "Channels" and "Resolution rate" headers always line up with the cells below.
const COL_NAME = 12;
const COL_CHANNELS = 211;
const RESOLUTION_INSET = 184; // measured from the right edge of the row

// Layout coordinates differ between the collapsed (56px) and expanded (234px)
// sidebar states. Each set matches the corresponding Figma import so the
// dynamic overlays land exactly on top of the baked design. `surfaceRightOpen`
// is where the white content surface ends while the AI Studio panel is visible;
// when it's hidden the surface extends to the navbar's right edge.
const NAVBAR_RIGHT = 1424;

// Bounding box of the exported channel illustration (in its own coordinate
// space). We render it inside a fixed-size wrapper and shift it to the origin so
// it can be centered horizontally on the content surface, above the intro copy.
const ILLO_LEFT = 328.2;
const ILLO_TOP = 36.2;
const ILLO_W = 401;
const ILLO_H = 179;
const ILLO_PAGE_TOP = 88; // vertical position so the artwork sits above the copy

const COLLAPSED_LAYOUT = {
  surfaceLeft: 64,
  surfaceRightOpen: 1006,
  titleLeft: 104,
  rowsLeft: 104,
  rowsTop: 432,
  headerTop: 388,
  createTop: 82,
  descTop: 268,
  rowWidthOpen: 880,
  rowWidthFull: 1272,
  panelMaskLeft: 983,
  panelMaskW: 449,
} as const;

const EXPANDED_LAYOUT = {
  surfaceLeft: 242,
  surfaceRightOpen: 1046,
  titleLeft: 266,
  rowsLeft: 255,
  rowsTop: 430,
  headerTop: 386,
  createTop: 81,
  descTop: 267,
  rowWidthOpen: 750,
  rowWidthFull: 1121,
  panelMaskLeft: 1046,
  panelMaskW: 390,
} as const;

function TableHeader({ left, top, width }: { left: number; top: number; width: number }) {
  return (
    <div
      className="absolute z-30 transition-[left,width] duration-300 pointer-events-none"
      style={{ left, top, width }}
    >
      <span
        className="absolute font-['SF_Pro_Text:Semibold',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap"
        style={{ left: COL_NAME }}
      >
        Name
      </span>
      <span
        className="absolute font-['SF_Pro_Text:Semibold',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap"
        style={{ left: COL_CHANNELS }}
      >
        Channels
      </span>
      <span
        className="absolute font-['SF_Pro_Text:Semibold',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap"
        style={{ left: width - RESOLUTION_INSET }}
      >
        Resolution rate
      </span>
    </div>
  );
}

export function OrganizationDashboard({
  orgs,
  onCreate,
  isExpanded,
}: {
  orgs: Org[];
  onCreate: () => void;
  isExpanded: boolean;
}) {
  const [showStudio, setShowStudio] = useState(true);

  const L = isExpanded ? EXPANDED_LAYOUT : COLLAPSED_LAYOUT;
  const surfaceRight = showStudio ? L.surfaceRightOpen : NAVBAR_RIGHT;
  const surfaceWidth = surfaceRight - L.surfaceLeft;
  // Rows sit beside the panel when it's open, and fill the width when it's hidden.
  const rowWidth = showStudio ? L.rowWidthOpen : L.rowWidthFull;

  return (
    <div className="absolute inset-0">
      {isExpanded ? <OrgExpanded /> : <Org06 />}

      {/* When hidden, extend the white content surface over the AI Studio panel */}
      <div
        className="absolute top-[55px] h-[838px] bg-white rounded-r-[26px] transition-opacity duration-300 z-20"
        style={{
          left: L.panelMaskLeft,
          width: L.panelMaskW,
          opacity: showStudio ? 0 : 1,
          pointerEvents: showStudio ? "none" : "auto",
        }}
      />

      {/* Toggle the AI Studio panel via the header icon next to the profile avatar */}
      <button
        onClick={() => setShowStudio((s) => !s)}
        title={showStudio ? "Hide AI Studio" : "Show AI Studio"}
        className="absolute left-[1334px] top-[9px] w-[36px] h-[36px] rounded-full z-50 cursor-pointer outline-none transition-colors"
        style={{ backgroundColor: showStudio ? "rgba(12,12,13,0.08)" : "transparent" }}
      />

      {/* Page title (left) */}
      <div
        className="absolute z-40 transition-[left] duration-300"
        style={{ left: L.titleLeft, top: L.createTop + 4 }}
      >
        <p className="font-['SF_Pro_Display:Regular',sans-serif] text-[#2f3941] text-[26px] tracking-[0.3536px] leading-[32px] whitespace-nowrap">
          Organization
        </p>
      </div>

      {/* "Create new" button, right-aligned to the visible content surface */}
      <div
        className="absolute z-40 flex justify-end transition-[left,width] duration-300"
        style={{ left: L.surfaceLeft, top: L.createTop, width: surfaceWidth - 18 }}
      >
        <button
          onClick={onCreate}
          className="h-[40px] px-[16px] rounded-[99px] bg-[#2f3130] flex items-center justify-center cursor-pointer outline-none"
          title="Create new"
        >
          <span className="font-['SF_Pro_Text:Semibold',sans-serif] text-white text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap">
            Create new
          </span>
        </button>
      </div>

      {/* Channel illustration, centered on the content surface above the copy */}
      <div
        className="absolute z-30 transition-[left] duration-300 pointer-events-none"
        style={{
          left: (L.surfaceLeft + surfaceRight) / 2 - ILLO_W / 2,
          top: ILLO_PAGE_TOP,
          width: ILLO_W,
          height: ILLO_H,
        }}
      >
        <div className="absolute" style={{ left: -ILLO_LEFT, top: -ILLO_TOP }}>
          <OrgIllustration />
        </div>
      </div>

      {/* Intro copy, centered in the visible content surface */}
      <div
        className="absolute z-40 flex justify-center transition-[left,width] duration-300"
        style={{ left: L.surfaceLeft, top: L.descTop, width: surfaceWidth }}
      >
        <p className="w-[680px] text-center font-['SF_Pro_Text:Regular',sans-serif] text-[#2f3941] text-[14px] tracking-[-0.154px] leading-[20px]">
          Create your organization and pick the channels where you want your AI to show up.{" "}
          You can set up how it behaves on each one later, in{" "}
          <span className="underline">Configuration</span>.
        </p>
      </div>

      {/* Table headers aligned to the rows */}
      <TableHeader left={L.rowsLeft} top={L.headerTop} width={rowWidth} />

      {/* Dynamic org rows */}
      <div
        className="absolute z-30 transition-[left] duration-300"
        style={{ left: L.rowsLeft, top: L.rowsTop }}
      >
        <div className="relative flex flex-col gap-[12px]">
          {orgs.map((org) => (
            <OrgRow key={org.id} org={org} width={rowWidth} />
          ))}
        </div>
      </div>
    </div>
  );
}
