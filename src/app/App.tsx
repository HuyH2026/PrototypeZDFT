import React, { useEffect, useRef, useState } from "react";
import HomeDefault from "../imports/01HomeDefault/index";
import Insights from "../imports/02Insights/index";
import orgSvgPaths from "../imports/01Home/svg-1ib2n6ww5r";
import { CreateOrgFlow } from "./components/create-org-flow";
import { OrganizationDashboard, type Org } from "./components/organization-dashboard";
import { ExpandedSidebar } from "./components/expanded-sidebar";

// The design is authored at a fixed 1440×920 canvas. ScaledStage places it in a
// centered container on a black backdrop and scales it uniformly to fit whatever
// viewport it's published to, so it always looks framed and never clips.
const DESIGN_W = 1440;
const DESIGN_H = 920;

function ScaledStage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div
        className="shrink-0"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<Record<string, string>>({
    Insights: "AI Performances",
  });

  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState("SpaceX");
  const [orgList, setOrgList] = useState<Org[]>([
    { id: "spacex", name: "SpaceX", channels: ["Web Widget", "Inbound Voice", "Web Call", "Slack"] },
    { id: "tesla", name: "Tesla", channels: ["Web Widget", "Email"] },
  ]);
  const orgs = orgList.map((o) => o.name);

  // Create a new org from the setup flow, then land on the Organization dashboard.
  const handleCreateOrg = (name: string, channels: string[]) => {
    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    setOrgList((prev) => [...prev, { id, name, channels }]);
    setCurrentOrg(name);
    setCurrentScreen("Organization");
  };

  const navItems = [
    "Home", // index 0 -> child 1
    "Insights", // index 1 -> child 2
    "AI Agents", // index 2 -> child 3
    "Knowledge", // index 3 -> child 4
    "Tools", // index 4 -> child 5
    "Experiments", // index 5 -> child 6
    "Orchestrator", // index 6 -> child 7
    "Integrations", // index 7 -> child 8
    "Log", // index 8 -> child 9
    "Settings", // index 9 -> child 10
    "Organization", // index 10 -> child 12 (due to separator at 11)
  ];

  const hoverMenus: Record<string, string[]> = {
    Insights: ["CX Journey", "AI Performances"],
    "AI Agents": ["Agent Builder", "Configuration", "QA"],
    Knowledge: ["Insights", "Contents", "Coaching"],
    Experiments: ["A/B Test", "Test Suite", "Simulations"],
    Tools: [],
    Orchestrator: [],
    Integrations: [],
    Log: [],
    Settings: ["Account", "Security"],
    Organization: [],
  };

  const activeIndex = navItems.indexOf(currentScreen);
  const activeChildIndex = activeIndex < 10 ? activeIndex + 1 : 12;

  const hoverIndex = hoveredItem ? navItems.indexOf(hoveredItem) : -1;
  const hoverChildIndex = hoverIndex !== -1 ? (hoverIndex < 10 ? hoverIndex + 1 : 12) : -1;

  const knownScreens = ["Home", "Insights", "Organization"];
  const isUnknownScreen = !knownScreens.includes(currentScreen);
  const currentHoverMenu = hoveredItem ? hoverMenus[hoveredItem] : null;

  // Hover-intent: keep the flyover open while moving between the rail and the popup.
  const closeTimer = useRef<number | null>(null);
  const openMenu = (item: string) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHoveredItem(item);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setHoveredItem(null), 140);
  };

  // Hover-intent for the organization switcher: open on hover, and keep it open
  // while the pointer travels between the trigger and the dropdown.
  const orgCloseTimer = useRef<number | null>(null);
  const openOrgMenu = () => {
    if (orgCloseTimer.current) {
      window.clearTimeout(orgCloseTimer.current);
      orgCloseTimer.current = null;
    }
    setOrgMenuOpen(true);
  };
  const scheduleCloseOrgMenu = () => {
    if (orgCloseTimer.current) window.clearTimeout(orgCloseTimer.current);
    orgCloseTimer.current = window.setTimeout(() => setOrgMenuOpen(false), 160);
  };

  // Selecting from the collapsed flyover navigates but keeps the rail collapsed.
  const selectFromFlyover = (item: string, sub?: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (sub) setSelectedSub((prev) => ({ ...prev, [item]: sub }));
    setCurrentScreen(item);
    setHoveredItem(null);
  };

  // Full-screen Org creation flow (takes over the whole screen, no sidebar).
  if (currentScreen === "CreateOrg") {
    return (
      <ScaledStage>
        <div className="w-full h-full relative bg-[#f1efed] overflow-hidden rounded-[8px]">
          <CreateOrgFlow
            onClose={() => setCurrentScreen("Organization")}
            onSave={handleCreateOrg}
          />
        </div>
      </ScaledStage>
    );
  }

  return (
    <ScaledStage>
    <div className={`w-full h-full relative bg-[#f1efed] overflow-hidden rounded-[8px] dynamic-nav-active ${isExpanded ? "expanded-mode" : ""}`}>
      {/* Dynamic CSS to force active/hover states on the imported collapsed Nav */}
      <style>{`
        .dynamic-nav-active [data-name="🧭 Nav item"] > [data-name="Container"] {
          background-color: transparent !important;
          transition: background-color 0.15s ease, fill 0.15s ease;
        }
        .dynamic-nav-active [data-name="🧭 Nav item"] path[fill] {
          fill: var(--fill-0, #293239) !important;
          transition: fill 0.15s ease;
        }

        ${hoverChildIndex !== -1 && hoverChildIndex !== activeChildIndex ? `
        .dynamic-nav-active [data-name="🧭 Nav item"]:nth-child(${hoverChildIndex}) > [data-name="Container"] {
          background-color: rgba(92,105,112,0.08) !important;
        }
        .dynamic-nav-active [data-name="🧭 Nav item"]:nth-child(${hoverChildIndex}) path[fill],
        .dynamic-nav-active [data-name="🧭 Nav item"]:nth-child(${hoverChildIndex}) g > path {
          fill: #39434B !important;
        }
        ` : ""}

        .dynamic-nav-active [data-name="🧭 Nav item"]:nth-child(${activeChildIndex}) > [data-name="Container"] {
          background-color: #293239 !important;
        }
        .dynamic-nav-active [data-name="🧭 Nav item"]:nth-child(${activeChildIndex}) path[fill],
        .dynamic-nav-active [data-name="🧭 Nav item"]:nth-child(${activeChildIndex}) g > path {
          fill: white !important;
        }

        /* Content area shift when the sidebar expands */
        [data-name="Top Navbar"] > div:first-child {
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .expanded-mode [data-name="Top Navbar"] > div:first-child {
          left: 234.2px !important;
          width: 1189px !important;
        }
      `}</style>

      <div key={currentScreen} className="absolute inset-0">
        {currentScreen === "Insights" ? (
          <Insights />
        ) : currentScreen === "Organization" ? (
          <OrganizationDashboard
            orgs={orgList}
            onCreate={() => setCurrentScreen("CreateOrg")}
            isExpanded={isExpanded}
          />
        ) : (
          <HomeDefault />
        )}

        {isUnknownScreen && (
          <div
            className="absolute top-[55px] right-[8px] bottom-[26px] bg-white rounded-[26px] flex flex-col items-center justify-center text-gray-500 z-40 border border-white"
            style={{
              left: isExpanded ? "242.2px" : "64px",
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="text-4xl mb-4">🚧</div>
            <div className="text-xl font-medium text-gray-800">{currentScreen}</div>
            <div className="text-sm opacity-70 mt-2">Coming soon</div>
          </div>
        )}
      </div>

      {/* Org switcher: cover the imported org name and render the current org */}
      <div className="absolute top-[18px] left-[229px] h-[20px] bg-[#f1efed] z-[56] pointer-events-none flex items-center pr-[6px]">
        <span className="font-['SF_Pro_Text:Semibold',sans-serif] text-[#2f3130] text-[14px] tracking-[-0.154px] leading-[20px] whitespace-nowrap">
          {currentOrg}
        </span>
      </div>

      {/* Org switcher: hover trigger over the combobox. */}
      <button
        className="absolute top-[9px] left-[190px] w-[95px] h-[38px] z-[57] cursor-pointer outline-none"
        onMouseEnter={openOrgMenu}
        onMouseLeave={scheduleCloseOrgMenu}
        onClick={() => setOrgMenuOpen((o) => !o)}
      />

      {/* Org switcher: dropdown */}
      {orgMenuOpen && (
        <div
          className="absolute left-[192px] top-[45px] w-[200px] bg-white rounded-[4px] py-[4px] px-px z-[58] drop-shadow-[0px_16px_12px_rgba(10,13,14,0.16)]"
          onMouseEnter={openOrgMenu}
          onMouseLeave={scheduleCloseOrgMenu}
        >
          <div aria-hidden className="absolute border border-[#d8dcde] border-solid inset-0 pointer-events-none rounded-[4px]" />

          {/* Header label */}
          <div className="flex gap-[8px] items-start pl-[12px] pr-[36px] py-[8px] w-full">
            <div className="h-[20px] w-[16px] shrink-0" />
            <div className="font-['SF_Pro_Text:Semibold',sans-serif] text-[#293239] text-[14px] tracking-[-0.154px] leading-[20px]">
              Organization
            </div>
          </div>

          {/* Selectable orgs */}
          {orgs.map((org) => (
            <button
              key={org}
              onClick={() => {
                setCurrentOrg(org);
                setOrgMenuOpen(false);
              }}
              className="flex gap-[8px] items-start pl-[12px] pr-[36px] py-[8px] w-full text-left rounded-[4px] transition-colors hover:bg-[#f5f6f7] cursor-pointer outline-none"
            >
              <div className="h-[20px] w-[16px] flex items-center justify-center py-[2px] shrink-0">
                {currentOrg === org && (
                  <div className="relative size-[16px]">
                    <div className="absolute inset-[15.63%_3.13%]">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 11">
                        <path clipRule="evenodd" d={orgSvgPaths.p2276ee40} fill="#1F73B7" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="font-['SF_Pro_Text:Regular',sans-serif] text-[#293239] text-[14px] tracking-[-0.154px] leading-[20px]">
                {org}
              </div>
            </button>
          ))}

          {/* Divider */}
          <div className="py-[4px] w-full">
            <div className="bg-[#e8eaec] h-px w-full" />
          </div>

          {/* Add organization -> Org creation flow */}
          <button
            onClick={() => {
              setCurrentScreen("CreateOrg");
              setOrgMenuOpen(false);
            }}
            className="flex gap-[8px] items-start pl-[12px] pr-[36px] py-[8px] w-full text-left rounded-[4px] transition-colors hover:bg-[#f5f6f7] cursor-pointer outline-none"
          >
            <div className="h-[20px] flex items-center justify-center py-[2px] shrink-0">
              <div className="relative size-[16px]">
                <div className="absolute inset-[12.5%_12.5%_6.25%_6.25%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                    <path d={orgSvgPaths.p26acb540} fill="#1F73B7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="font-['SF_Pro_Text:Regular',sans-serif] text-[#1f73b7] text-[14px] tracking-[-0.154px] leading-[20px]">
              Add organization
            </div>
          </button>
        </div>
      )}

      {/* Expanded sidebar drawn to Figma spec */}
      {isExpanded && (
        <ExpandedSidebar
          items={navItems}
          activeItem={currentScreen}
          submenus={hoverMenus}
          selectedSub={selectedSub}
          onSelect={setCurrentScreen}
          onSelectSub={(item, sub) => setSelectedSub((prev) => ({ ...prev, [item]: sub }))}
          onToggle={() => setIsExpanded(false)}
        />
      )}

      {/* Collapsed-only: interactive hover flyover menu */}
      {!isExpanded && hoveredItem && currentHoverMenu && (
        <div
          className={`absolute bg-white border border-[#eae9e8] border-solid left-[63.2px] overflow-clip rounded-[8px] shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)] w-[226px] z-50 pt-[11px] ${currentHoverMenu.length > 0 ? "pb-[12px]" : "pb-[11px]"}`}
          style={{
            top: `${64.2 + (navItems.indexOf(hoveredItem) * 48) + (navItems.indexOf(hoveredItem) >= 10 ? 16 : 0)}px`,
          }}
          onMouseEnter={() => openMenu(hoveredItem)}
          onMouseLeave={scheduleClose}
        >
          <button
            onClick={() => selectFromFlyover(hoveredItem)}
            className={`content-stretch flex items-center pl-[11px] w-[202px] text-left cursor-pointer outline-none ${currentHoverMenu.length > 0 ? "mb-[12px]" : "mb-0"}`}
          >
            <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0c0c0d] text-[14px] tracking-[-0.154px] w-[146px]">
              <p className="leading-[20px] font-semibold">{hoveredItem}</p>
            </div>
          </button>
          {currentHoverMenu.length > 0 && (
            <div className="content-stretch flex flex-col gap-[4px] items-start pl-[7px] w-[210px]">
              {currentHoverMenu.map((subItem) => (
                <button
                  key={subItem}
                  onClick={() => selectFromFlyover(hoveredItem, subItem)}
                  className="content-stretch flex items-center pl-[24px] pr-[10px] py-[7px] relative rounded-[4px] shrink-0 w-[203px] text-left cursor-pointer outline-none transition-colors hover:bg-[rgba(100,104,100,0.08)]"
                >
                  <div className="[word-break:break-word] flex flex-col font-['SF_Pro_Text:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2f3130] text-[14px] tracking-[-0.154px] whitespace-nowrap">
                    <p className="leading-[20px]">{subItem}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsed-only: invisible interactive overlay for clicks, hover, and expand toggle */}
      {!isExpanded && (
        <div className="absolute left-[8px] top-[55px] h-[837px] w-[56px] flex flex-col items-center py-[12px] z-40">
          {navItems.slice(0, 10).map((item) => (
            <div
              key={item}
              className="w-full h-[48px] shrink-0 relative"
              onMouseEnter={() => openMenu(item)}
              onMouseLeave={scheduleClose}
            >
              <button
                onClick={() => setCurrentScreen(item)}
                className="w-full h-full cursor-pointer outline-none"
              />
            </div>
          ))}

          {/* Separator spacing (py-[8px] + 0px line = 16px) */}
          <div className="w-full h-[16px] shrink-0" />

          {navItems.slice(10, 11).map((item) => (
            <div
              key={item}
              className="w-full h-[48px] shrink-0 relative"
              onMouseEnter={() => openMenu(item)}
              onMouseLeave={scheduleClose}
            >
              <button
                onClick={() => setCurrentScreen(item)}
                className="w-full h-full cursor-pointer outline-none"
              />
            </div>
          ))}

          <div className="flex-[1_0_0] w-full min-h-px flex items-end justify-center">
            <button
              className="w-full h-[48px] cursor-pointer outline-none"
              onClick={() => setIsExpanded(true)}
            />
          </div>
        </div>
      )}
    </div>
    </ScaledStage>
  );
}
