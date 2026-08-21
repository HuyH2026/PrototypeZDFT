// Shared AI Studio full-page chrome: the frosted-glass dialog + left
// conversation-history sidebar. Used by both the blank AiStudioLanding and
// AiStudioConversation (populated conversation) full-mode views. Right pane
// content is passed as children.
import { useState, type ComponentType, type ReactNode } from 'react'
import { Heart, Menu, MessagesSquare, Plus, Sparkles, X, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import {
  CONVERSATION_HISTORY,
  FLASHBACKS,
  STUDIO_FLOWS,
  type StudioFlowScope,
} from './ai-studio-landing-data'
import { ZendeskLogo } from '@/components/ZendeskLogo'

// --ease-soft (theme.css) as a literal curve — motion's `ease` option needs the
// array form, not the CSS custom property.
const EASE_SOFT = [0.33, 0.85, 0.4, 1] as const

// The app's "insights" gradient (peach → sky → teal), already used by the Home
// spotlight and the experiment summary cards. It draws the 1px edge of every AI
// Studio composer, which the frames paint as a horizontal gradient rather than
// the flat peach the rest of the app uses.
export const COMPOSER_EDGE = 'linear-gradient(90deg,#ffb393 0%,#abd5fa 50%,#12a6b4 100%)'

export function GradientSparkle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient
          id="aiStudioLandingSparkle"
          x1="3"
          y1="12"
          x2="20"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#01567A" />
          <stop offset="1" stopColor="#6DBBD7" />
        </linearGradient>
      </defs>
      <path
        d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3zM19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"
        stroke="url(#aiStudioLandingSparkle)"
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Every icon control in the studio chrome. The warm translucent control hover at
// --radius-btn, as AiStudioShell's header already does, and a box wider than the
// glyph: the 24px buttons this replaces drew the hover square right on the X's
// edges. Exported so the plan panel's close X is *this* control rather than a
// lookalike. Call sites add the box size (size-8 in the roomy headers, size-6 in
// the sidebar's 22px title row) and size the glyph, since the frames draw a 16px
// close X in the studio header but a 14px one in the plan panel's.
export const STUDIO_ICON_BUTTON =
  'flex shrink-0 items-center justify-center rounded-[8px] text-fg-default transition-colors duration-instant ease-soft hover:bg-control-hover'

// The "AI Studio" lockup. One component because it appears twice — in the
// sidebar header and, once the sidebar is collapsed, in the content header —
// and the frames draw the same muted lockup in both places.
function StudioWordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <ZendeskLogo size={size} className="text-[#01567a]" />
      <span className="text-[18px] font-semibold leading-[26px] tracking-[-0.1px] text-[#545767]">
        AI Studio
      </span>
      <GradientSparkle size={19} />
    </span>
  )
}

// A labelled sidebar group: micro heading (12px semibold grey, with its glyph)
// over a tight list. Both groups in the frame are drawn identically
// (Figma 1194:120089 Conversations / 1194:120108 Flashbacks).
function SidebarSection({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ size?: number }>
  label: string
  children: ReactNode
}) {
  return (
    <div className="mt-[26px] flex flex-col">
      <span className="flex items-center gap-1 text-[12px] font-semibold leading-5 tracking-[-0.1px] text-[#727583]">
        <Icon size={16} aria-hidden />
        {label}
      </span>
      <ul
        data-testid={`ai-studio-sidebar-${label.toLowerCase()}`}
        className="mt-2 flex flex-col gap-[2px]"
      >
        {children}
      </ul>
    </div>
  )
}

// One row in either sidebar group. Inert this phase — there is no stored
// conversation to restore — so it stays a span rather than a button that would
// promise navigation it cannot deliver. Titles are held in full and clipped
// here, which is why the frame shows them ellipsised.
function SidebarItem({ title, tone }: { title: string; tone: 'saved' | 'history' }) {
  return (
    <li>
      <span
        title={title}
        className={`block w-full truncate p-2 text-[14px] leading-5 tracking-[-0.1px] ${
          tone === 'saved' ? 'text-[#01567a]' : 'text-black'
        }`}
      >
        {title}
      </span>
    </li>
  )
}

// A live sidebar row, as against SidebarItem's inert span: these start a flow, so
// they are buttons, and they hover like the landing's suggestion rows do. The
// glyph carries the flow's colour — it is the only thing distinguishing two rows
// of the same size in a column of grey.
function SidebarAction({
  icon: Icon,
  color,
  title,
  onClick,
}: {
  icon: LucideIcon
  color: string
  title: string
  onClick: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded-md p-2 text-left text-[14px] leading-5 tracking-[-0.1px] text-black transition-colors hover:bg-white/70"
      >
        <Icon size={16} color={color} aria-hidden />
        <span className="truncate">{title}</span>
      </button>
    </li>
  )
}

export function AiStudioFrame({
  onClose,
  onNewConversation,
  onStartFlow,
  activeHistoryTitle,
  panel,
  children,
}: {
  onClose: () => void
  onNewConversation: () => void
  // Starts one of the Studio's flows. Given, the sidebar offers them under New
  // conversation, which is what makes a flow reachable from every view rather
  // than only from the blank-slate landing's suggestions. Omitted, the group is
  // not drawn — a row that cannot start anything is worse than no row.
  onStartFlow?: (scope: StudioFlowScope) => void
  activeHistoryTitle?: string
  // The optional right-hand column (the agent plan). Its presence collapses the
  // history sidebar and narrows the content column, as the frames draw it.
  panel?: ReactNode
  children: ReactNode
}) {
  // null = "follow the panel". Once the user has an opinion, it sticks — so a
  // sidebar they opened over a plan does not slam shut on the next render.
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null)
  const sidebarOpen = sidebarOverride ?? !panel
  const history =
    activeHistoryTitle && !CONVERSATION_HISTORY.includes(activeHistoryTitle)
      ? [activeHistoryTitle, ...CONVERSATION_HISTORY]
      : CONVERSATION_HISTORY

  return (
    // The fixed wrapper itself never animates: a fade here (or on any other
    // ancestor of the dialog) makes it a backdrop root, so the dialog's
    // backdrop-filter samples an empty group instead of the page and the glass
    // stops blurring — measured, and the fill-mode doesn't save it either,
    // since the finished animation keeps the isolation. The dim layer and the
    // dialog below animate themselves instead — a sibling and the glass
    // element itself, neither of which is an ancestor of the glass.
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 flex items-stretch p-2">
        {/* Dim backdrop: a sibling of the glass dialog below, not an ancestor of
            it — its own opacity transition can't make the dialog's
            backdrop-filter sample an empty group the way an ancestor's would
            (see the dialog's own comment). */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-black/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26, ease: EASE_SOFT }}
        />
        <motion.div
          data-testid="ai-studio-landing"
          role="dialog"
          aria-modal="true"
          aria-label="AI Studio"
          className="relative flex flex-1 overflow-hidden rounded-[30px] border border-white/80 bg-white/65 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.32, ease: EASE_SOFT }}
        >
          {/* Left: saved flashbacks + conversation history. 330px with a hairline
            right edge, and 24px gutters that leave the 282px content column the
            frame draws (Figma 1194:120075). The width animates on an outer
            `overflow-hidden` shell; the hairline lives on the fixed-width inner
            content rather than the shell so it's clipped away as the shell
            narrows instead of lingering as a 1px sliver at width 0.
            `initial={false}` skips the grow-in on first mount — the sidebar
            starts open together with the dialog's own fade, and animating both
            at once would read as two things happening rather than one. */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.aside
                key="studio-sidebar"
                className="flex shrink-0 flex-col overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 330, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.26, ease: EASE_SOFT }}
              >
                <div className="flex h-full w-[330px] flex-col overflow-y-auto border-r border-[#d2d9e5] px-6 py-5">
                  {/* Icon before the wordmark, same order as the re-open hamburger below —
                    so the control sits in the same place in both states instead of
                    hopping from beside the wordmark to the sidebar's far edge. */}
                  <div className="flex h-[22px] items-center gap-2">
                    <button
                      type="button"
                      aria-label="Hide conversation history"
                      onClick={() => setSidebarOverride(false)}
                      className={`size-6 ${STUDIO_ICON_BUTTON}`}
                    >
                      <Menu size={24} aria-hidden />
                    </button>
                    <StudioWordmark />
                  </div>

                  {/* The one filled control in the sidebar: teal-tinted, full width. */}
                  <button
                    type="button"
                    onClick={onNewConversation}
                    className="mt-[30px] flex h-8 items-center justify-center gap-0.5 rounded-full bg-[#ebf5f7] pr-4 pl-3 text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#01567a] transition-colors hover:bg-[#dceef3]"
                  >
                    <Plus size={20} aria-hidden />
                    New conversation
                  </button>

                  {/* Above Flashbacks and Conversations, which are both things already
                    said: this group is the two things the Studio can still do. */}
                  {onStartFlow && (
                    <SidebarSection icon={Sparkles} label="Start">
                      {STUDIO_FLOWS.map((flow) => (
                        <SidebarAction
                          key={flow.scope}
                          icon={flow.icon}
                          color={flow.color}
                          title={flow.title}
                          onClick={() => onStartFlow(flow.scope)}
                        />
                      ))}
                    </SidebarSection>
                  )}

                  <SidebarSection icon={Heart} label="Flashbacks">
                    {FLASHBACKS.map((flashback) => (
                      <SidebarItem key={flashback.title} title={flashback.title} tone="saved" />
                    ))}
                  </SidebarSection>

                  <SidebarSection icon={MessagesSquare} label="Conversations">
                    {history.map((title) => (
                      <SidebarItem key={title} title={title} tone="history" />
                    ))}
                  </SidebarSection>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Right: caller-provided content, with the plan panel beside it */}
          <div className="flex min-w-0 flex-1">
            {/* Bounded, not scrolling: this column used to be `overflow-y-auto`,
              which left its children free to grow past the dialog. A populated
              conversation then pushed its own composer and the shortcut hint below
              the fold — measured at 960px in a 900px viewport, so the hint was
              never visible even though a test asserts it. Each view scrolls in its
              own box instead (the transcript, or the landing's column). */}
            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden pb-8">
              {/* Sticky, and deliberately with no surface of its own. It used to
                carry its own backdrop-blur so a bubble scrolling under it would
                blur through, as the frame draws — but Chrome composites the
                dialog's white/65 a second time inside a nested backdrop-filter,
                so the band came out at #fbfbfb against the transcript's #f5f5f5:
                a white strip with a hard seam where it ended. (Measured: the
                doubling is exact — 0.65·255 + 0.35·245.5 = 251.7.) Nothing is
                lost by dropping it, because in this app the transcript scrolls
                in its own box below this row and never passes under it.
                Fixed 64px so the row does not change height with its contents —
                with a panel open it can be empty. */}
              <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 px-6">
                {!sidebarOpen && (
                  <>
                    {/* The frame's own glyph here is a hamburger, not a mirrored
                      PanelLeftClose: that one renders near-solid at this size and
                      read as a black blob beside the wordmark. */}
                    <button
                      type="button"
                      aria-label="Show conversation history"
                      onClick={() => setSidebarOverride(true)}
                      className={`size-8 ${STUDIO_ICON_BUTTON}`}
                    >
                      <Menu size={24} aria-hidden />
                    </button>
                    <StudioWordmark />
                  </>
                )}
                {/* One close X per view. With a panel open the panel's header owns
                  the dialog's right edge, as the frame draws it — two identical
                  X's 40px apart read as a pair of controls doing the same thing.
                  Esc still closes the plan and then the studio. */}
                {!panel && (
                  <button
                    type="button"
                    aria-label="Close AI Studio"
                    onClick={onClose}
                    className={`ms-auto size-8 ${STUDIO_ICON_BUTTON}`}
                  >
                    <X size={32} strokeWidth={1.5} aria-hidden />
                  </button>
                )}
              </div>
              {/* min-h-0 so `flex-1` can shrink below its content: without it a flex
                item's `min-height: auto` wins and the column overflows again. */}
              <div
                className={`mx-auto flex min-h-0 w-full flex-1 flex-col px-8 ${
                  panel ? 'max-w-[860px]' : 'max-w-[1080px] pt-[11vh]'
                }`}
              >
                {children}
              </div>
            </div>

            {/* The plan is a third column of the same window, not a card floating
              inside it: flush to the dialog's edges — whose 30px radius clips
              it — and divided from the transcript by the sidebar's hairline, so
              history | transcript | plan read as one surface. The 12px moat
              this replaces (the frame does draw one) left a strip of the
              transcript's grey above and around the panel that read as a seam,
              and nested the panel's 20px corner inside the dialog's 30px one.
              One translucency step, not three: white/65 on the slot over the
              dialog's own white/65 over the canvas's third came out 96% opaque,
              which is what made the panel read as a separate sheet rather than
              a lit region of this one. It re-blurs its own backdrop instead —
              the dialog's glass alone leaves page text legible under the plan,
              and a document you can read the app through reads as a hole. */}
            {panel && (
              <div className="w-[590px] shrink-0 overflow-hidden border-l border-[#d2d9e5] bg-white/70 backdrop-blur-2xl">
                {panel}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  )
}
