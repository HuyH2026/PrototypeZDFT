import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  AlertTriangle, Bell, BookOpen, Check, ChevronDown, ChevronRight,
  CircleAlert, Clock, CreditCard, FileText, GripVertical, LayoutGrid,
  ListChecks, Pencil, Play, Plus, Sparkles, TestTubeDiagonal, TrendingDown, TrendingUp,
  Trophy, X, Zap, type LucideIcon,
} from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button as FloraButton } from '@/components/flora/Button'
import { Card as FloraCard } from '@/components/flora/Card'
import {
  type LevelData, type BrandKey,
  type WidgetId, type ColumnKey, type Layout,
  DATA, DEFAULT_LAYOUT,
} from './dashboard-data'
import { AgentHealthCard } from './health/AgentHealthCard'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { isAgentPlanTopic } from '@/features/ai-studio/agent-plan/agent-plan-data'
import {
  clearDashboardRequest,
  getDashboardRequest,
  subscribeDashboardRequest,
} from './dashboard-request-store'
import { deriveRoleData } from './role-data'
import { ViewSwitcher } from './ViewSwitcher'
import {
  type ViewsState, type NewView,
  loadViewsState, persistViewsState, getActiveView,
  addView, renameView, deleteView, setActiveView, updateActiveLayout,
  movePmWidget, removePmWidget, addPmWidget, resetPmLayout,
  moveExecutiveSection, removeExecutiveSection, addExecutiveSection, resetExecutiveLayout,
} from './views-store'
import { PmDashboard } from './PmDashboard'
import { DEFAULT_PM_LAYOUT, PM_WIDGET_ID_LIST, type PmWidgetId } from './generate-layout'
import { ExecutiveDashboard } from './ExecutiveDashboard'
import {
  DEFAULT_EXECUTIVE_LAYOUT,
  EXECUTIVE_SECTION_ID_LIST,
  EXECUTIVE_SECTION_TITLE,
  type ExecutiveSectionId,
} from './executive-data'

// Palette — one-off dashboard hues that have no design token yet (kept inline,
// matching the prototype). Ink/muted map to the shared token values.
const INK = '#2f3130'
const INK_SOFT = '#2f3941'
const MUTED = '#8b8e89'
const BORDER = '#e2e0dd'
const BLUE = '#1f73b7'
const GREEN = '#0f8a5f'
const AMBER = '#c8792b'
const RED = '#c8402f'
const PURPLE = '#724be8'
// Approvals-panel hues taken from the frame: the success teal it tints its lift
// pills with (a step cooler than GREEN above), the ink used on amber fills, and
// the slate the A/B variant rows are set in.
const TEAL = '#048c80'
const TEAL_SOFT = '#e6f4f2'
const AMBER_INK = '#312819'
const SLATE_INK = '#373a4d'
// Badge + row hues from the redesigned widgets. The two greys are Flora's text
// scale (secondary 1 and 2); the tints are the Garden 100/200 steps the frame
// fills its status badges with.
const META = '#9194a0'
const CHIP_INK = '#545767'
const HAIRLINE = '#eee'
const TRACK = '#d2d3d8'
const STAT_INK = '#313131'
const BEIGE = '#f9f8f7'
const CHIP_BG = '#f5f5f7'
// The magenta the frame strokes the Test coverage glyphs with (Chart/Color 11).
const WINE = '#7c1d79'
// The doc-avatar blue on New knowledge content's items.
const DOC_BLUE = '#487ade'

// The AI gradient the frame strokes its sparkle glyphs with. Declared once and
// referenced by id, because a gradient cannot travel through lucide's flat
// `color` prop.
const AI_GRADIENT = 'home-ai-sparkle'
const AI_STROKE = `url(#${AI_GRADIENT})`

function AiGradientDefs() {
  return (
    <svg aria-hidden width={0} height={0} className="absolute">
      <defs>
        <linearGradient id={AI_GRADIENT} x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#01567a" />
          <stop offset="1" stopColor="#6dbbd7" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// --- Building blocks --------------------------------------------------------
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <FloraCard className={`p-5 ${className}`} style={{ borderColor: BORDER }}>
      {children}
    </FloraCard>
  )
}

// One header treatment for every widget: a 20px glyph and the frame's 18px
// regular title, with the card's own action on the right.
function CardHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-[18px] font-normal leading-6 tracking-[-0.45px] text-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}

// The small outline pill the redesigned widgets carry in their header.
function ReviewButton({ label = 'Review' }: { label?: string }) {
  return (
    <FloraButton variant="outline" size="sm" className="h-7 shrink-0 px-2.5 text-[11px] font-semibold">
      {label}
    </FloraButton>
  )
}

// Teal metric pill — coverage counts and per-policy impact both use it, so the
// glyph is the caller's choice.
function TealPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="flex h-6 shrink-0 items-center gap-1 rounded-[20px] px-2" style={{ backgroundColor: TEAL_SOFT }}>
      <Icon size={16} color={TEAL} />
      <span className="whitespace-nowrap text-[12px] font-medium leading-[18px] tracking-[-0.1px]" style={{ color: TEAL }}>
        {label}
      </span>
    </span>
  )
}

// Status badge, in the frame's four tints.
const BADGE_TONES = {
  success: { bg: TEAL_SOFT, fg: '#055952' },
  warning: { bg: '#fff5e3', fg: '#73551e' },
  danger: { bg: '#fceae7', fg: '#a3230d' },
  neutral: { bg: '#f0f0f0', fg: CHIP_INK },
} as const

function StatusBadge({
  tone, icon: Icon, label,
}: { tone: keyof typeof BADGE_TONES; icon: LucideIcon; label: string }) {
  const { bg, fg } = BADGE_TONES[tone]
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-2xl px-2 py-1" style={{ backgroundColor: bg }}>
      <Icon size={12} color={fg} />
      <span className="whitespace-nowrap text-[11px] font-semibold leading-[14px] tracking-[-0.1px]" style={{ color: fg }}>
        {label}
      </span>
    </span>
  )
}

// The count-plus-caption block that opens Self-improving and New knowledge
// content: one 36px number, what it counts, and over what period.
function StatBlock({ value, label, period }: { value: number | string; label: string; period: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[36px] font-normal leading-[44px] tracking-[0.396px]" style={{ color: STAT_INK }}>
        {value}
      </p>
      <div>
        <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">{label}</p>
        <p className="text-[12px] font-normal leading-4" style={{ color: META }}>{period}</p>
      </div>
    </div>
  )
}

// The frame separates list rows with a hairline and leaves the last one open.
function rowDivider(index: number, total: number): React.CSSProperties | undefined {
  return index === total - 1 ? undefined : { borderBottom: `1px solid ${HAIRLINE}` }
}

function LinkButton({ label }: { label: string }) {
  return (
    <button className="group flex items-center gap-0.5 outline-none">
      <span className="text-[13px] font-semibold" style={{ color: BLUE }}>{label}</span>
      <ChevronRight size={14} color={BLUE} className="transition-transform duration-instant ease-soft group-hover:translate-x-0.5" />
    </button>
  )
}

// --- Cards ------------------------------------------------------------------
const NOTIF_META = {
  studio: { Icon: Sparkles, color: PURPLE },
  billing: { Icon: CreditCard, color: BLUE },
  error: { Icon: CircleAlert, color: RED },
} as const

function NotificationsCard({ data }: { data: LevelData }) {
  return (
    <Card>
      <CardHeader icon={<Bell size={18} color={INK} strokeWidth={2} />} title="Notifications" action={<LinkButton label="View all" />} />
      <div className="flex flex-col gap-2.5">
        {data.notifications.map((n) => {
          const meta = NOTIF_META[n.kind]
          return (
            <div key={n.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${meta.color}16` }}>
                <meta.Icon size={16} color={meta.color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold" style={{ color: INK }}>{n.title}</p>
                  <span className="shrink-0 text-[11px] font-normal" style={{ color: MUTED }}>{n.time}</span>
                </div>
                <p className="mt-0.5 text-[12px] font-normal leading-4" style={{ color: MUTED }}>{n.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Slack logomark — lucide has no Slack icon, so this is a local inline SVG
// (matching the codebase's inline-SVG convention). Rendered in Slack aubergine.
function SlackGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 122.8 122.8" aria-hidden="true">
      <path fill="#611f69" d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9zM32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9z"/>
      <path fill="#611f69" d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9zM45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9z"/>
      <path fill="#611f69" d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97zM90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9z"/>
      <path fill="#611f69" d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97zM77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9z"/>
    </svg>
  )
}

function ApprovalsCard({ data }: { data: LevelData }) {
  return (
    <Card>
      <CardHeader
        icon={<Sparkles size={20} color={AI_STROKE} strokeWidth={1.7} />}
        title="Needs your approval"
        action={
          // Beige count disc, per the frame — not the purple pill the rest of
          // this card used to lean on.
          <span className="flex size-7 items-center justify-center rounded-full" style={{ backgroundColor: '#f6f5f3' }}>
            <span className="text-[14px] font-semibold tracking-[-0.154px]" style={{ color: INK }}>
              {data.approvals.length}
            </span>
          </span>
        }
      />
      {/* Items are unboxed and separated by a hairline rule — the frame has no
          per-item container, so the card's own surface carries them. */}
      <div className="flex flex-col">
        {data.approvals.map((a, i) => (
          <div
            key={a.id}
            className={i > 0 ? 'mt-[22px] border-t border-solid pt-[22px]' : ''}
            style={i > 0 ? { borderTopColor: BORDER } : undefined}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-semibold leading-[20px] tracking-[-0.154px]" style={{ color: INK }}>
                {a.title}
              </p>
              <button
                className="-mr-1 flex size-6 shrink-0 items-center justify-center rounded-full outline-none"
                aria-label={`Dismiss “${a.title}”`}
              >
                <X size={16} color={MUTED} />
              </button>
            </div>
            <div className="mt-3">
              <span className="inline-flex h-[26px] items-center gap-1 rounded-[20px] px-2" style={{ backgroundColor: TEAL_SOFT }}>
                <span className="text-[12px] font-medium leading-[18px] tracking-[-0.1px]" style={{ color: TEAL }}>
                  {a.impact}
                </span>
                <TrendingUp size={16} color={TEAL} />
              </span>
            </div>
            <p className="mt-3 text-[14px] font-normal leading-[20px] tracking-[-0.1px]" style={{ color: INK_SOFT }}>
              {a.body}
            </p>
            {a.abTest && (
              // Confirmation gradient panel: the winner crest sits centered above
              // the variant rows, and only the winning row gets a white fill.
              <div
                className="mt-4 rounded-[16px] border-[0.721px] border-solid px-[11px] pb-[10px] pt-[14px]"
                style={{
                  borderColor: '#ffb393',
                  backgroundImage:
                    'linear-gradient(142.7deg, rgba(255,179,147,0.15) 0%, rgba(171,213,250,0.15) 50%, rgba(18,166,180,0.15) 100%)',
                }}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span className="flex size-[29px] items-center justify-center rounded-[14px]" style={{ backgroundColor: '#ffbc42' }}>
                    <Trophy size={18} color={AMBER_INK} />
                  </span>
                  <p className="text-[11.5px] font-normal leading-[16px] tracking-[-0.072px] text-black">
                    Winner: <span className="font-semibold">{a.abTest.winner}</span>
                  </p>
                </div>
                <div className="mt-3.5 flex flex-col gap-1.5">
                  {a.abTest.variants.map((v) => (
                    <div
                      key={v.key}
                      className="rounded-[11px] border-[0.759px] border-solid px-[9px] py-1.5"
                      style={{ borderColor: '#d2d9e5', backgroundColor: v.winner ? '#fff' : 'transparent' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="shrink-0 rounded-[12px] px-1.5 py-[3px] text-[8.35px] font-semibold leading-[11px] tracking-[-0.1px] text-white"
                          style={{ backgroundColor: v.badgeColor }}
                        >
                          {v.badge}
                        </span>
                        <p
                          className="min-w-0 flex-1 truncate text-[10.6px] font-bold leading-[15px] tracking-[-0.076px]"
                          style={{ color: SLATE_INK }}
                        >
                          {v.label}
                        </p>
                        {v.winner && (
                          <span className="flex shrink-0 items-center gap-0.5 rounded-[3px] px-1.5 py-[3px]" style={{ backgroundColor: '#ffd483' }}>
                            <Trophy size={11} color={AMBER_INK} />
                            <span className="text-[8.35px] font-semibold leading-[11px] tracking-[-0.076px]" style={{ color: AMBER_INK }}>
                              Winner
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="mt-[3px] text-[9.1px] font-normal leading-[14px] tracking-[-0.076px]" style={{ color: SLATE_INK }}>
                        Conversation count (split %): <span className="text-black">{v.conversations}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {a.slack && (
              // Forwarded Slack message, rendered on the frame's beige tint with
              // no border. The avatar is initials — there is no photo asset.
              <div className="mt-4 rounded-[16px] p-[13px]" style={{ backgroundColor: '#f9f8f7' }}>
                <div className="flex items-center gap-3.5">
                  <SlackGlyph size={20} />
                  <span className="text-[12px] font-normal leading-[18px]" style={{ color: '#545767' }}>
                    Slack {a.slack.channel}
                  </span>
                </div>
                <div className="mt-2.5 flex items-start gap-3">
                  <span
                    className="relative flex size-[26px] shrink-0 items-center justify-center rounded-[4px] text-[10px] font-semibold text-white"
                    style={{ backgroundColor: '#611f69' }}
                  >
                    {a.slack.author.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    {/* Presence dot, ringed in the panel's tint so it reads as a
                        cutout the way Slack draws it. */}
                    <span
                      aria-hidden
                      className="absolute -bottom-px -right-px size-[7px] rounded-full"
                      style={{ backgroundColor: GREEN, boxShadow: '0 0 0 1.5px #f9f8f7' }}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-bold leading-[17px]" style={{ color: '#1d1c1d' }}>
                        {a.slack.author}
                      </span>
                      <span className="text-[10px] font-normal leading-[15px]" style={{ color: '#616061' }}>
                        {a.slack.time}
                      </span>
                    </div>
                    <p className="text-[10.7px] font-normal leading-[16px] tracking-[-0.077px] text-black">
                      {a.slack.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Review is the fixed-width secondary; the primary takes the rest. */}
            <div className="mt-[19px] flex items-center gap-3">
              <button
                className="flex h-8 w-[96px] shrink-0 items-center justify-center rounded-full border border-solid bg-white outline-none"
                style={{ borderColor: '#999b97' }}
              >
                <span className="text-[12px] font-semibold leading-4" style={{ color: INK }}>Review</span>
              </button>
              <button className="flex h-8 flex-1 items-center justify-center rounded-full outline-none" style={{ backgroundColor: INK }}>
                <span className="text-[12px] font-semibold leading-4 text-white">
                  {a.abTest ? a.abTest.cta : 'Approve'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function KnowledgeGapsCard({ data }: { data: LevelData }) {
  const { summary, items } = data.gaps
  const { open } = useAiAssistant()
  return (
    <Card>
      <CardHeader icon={<BookOpen size={18} color={INK} strokeWidth={2} />} title="Knowledge gaps" action={<LinkButton label="Open Knowledge" />} />
      {/* Gradient hero: articles generated + potential ticket coverage */}
      <div
        className="mb-4 rounded-xl p-4"
        style={{ background: 'linear-gradient(105deg, #fbe9e0 0%, #eef0f6 48%, #e2edf0 100%)' }}
      >
        <p className="text-[12px] font-medium leading-4" style={{ color: INK_SOFT }}>
          We generated these articles by identifying gaps in your knowledge base:
        </p>
        <div className="mt-3 flex gap-8">
          <div>
            <p className="text-[30px] font-medium leading-[32px]" style={{ color: INK }}>{summary.articlesGenerated}</p>
            <p className="mt-0.5 text-[12px] font-normal" style={{ color: INK_SOFT }}>Articles generated for identified gaps</p>
          </div>
          <div>
            <p className="text-[30px] font-medium leading-[32px]" style={{ color: INK }}>{summary.potentialCoverage}</p>
            <p className="mt-0.5 text-[12px] font-normal" style={{ color: INK_SOFT }}>Potential ticket coverage</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {items.map((g, idx) => (
          <div key={g.id} className="group/gap-row flex items-center justify-between py-2.5" style={{ borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}` }}>
            <div className="flex min-w-0 items-center gap-2.5">
              <AlertTriangle size={15} color={AMBER} className="shrink-0" />
              <p className="truncate text-[13px] font-normal" style={{ color: INK }}>{g.topic}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isAgentPlanTopic(g.topic) && (
                <button
                  type="button"
                  onClick={() => open('build-agent', 'full')}
                  className="rounded-full border border-grey-200 px-2.5 py-1 text-[12px] font-medium text-blue-700 opacity-0 transition-opacity duration-instant ease-soft focus-visible:opacity-100 group-hover/gap-row:opacity-100 hover:bg-[rgba(92,105,112,0.08)]"
                >
                  Build an agent
                </button>
              )}
              <span className="text-[13px] font-semibold" style={{ color: INK }}>{g.misses}</span>
              <span className="text-[11px] font-normal" style={{ color: MUTED }}>misses</span>
              {g.trend === 'up' ? <TrendingUp size={13} color={RED} /> : <TrendingDown size={13} color={GREEN} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function QaCoverageCard({ data }: { data: LevelData }) {
  const { passRate, suites, generated } = data.qa
  return (
    <Card>
      <CardHeader
        icon={<TestTubeDiagonal size={20} color={WINE} strokeWidth={1.7} />}
        title="Test coverage"
        action={
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="flex items-baseline gap-1" style={{ color: META }}>
              <span className="text-[18px] font-semibold leading-6 tracking-[-0.45px]">{passRate}%</span>
              <span className="text-[12px] font-semibold leading-4">pass rate</span>
            </span>
            <ReviewButton />
          </div>
        }
      />
      {/* Suites: pass/fail as badges over a two-tone bar — teal for the share
          that passed, the grey track for what did not. */}
      <div className="flex flex-col gap-6">
        {suites.map((q) => {
          const passPct = (q.pass / (q.pass + q.fail)) * 100
          return (
            <div key={q.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-normal leading-5 tracking-[-0.154px] text-black">{q.suite}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge tone="success" icon={Check} label={`${q.pass} pass`} />
                  <StatusBadge tone="danger" icon={X} label={`${q.fail} fail`} />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-[2px]" style={{ backgroundColor: TRACK }}>
                <div className="h-full rounded-[2px]" style={{ width: `${passPct}%`, backgroundColor: TEAL }} />
              </div>
            </div>
          )
        })}
      </div>
      {generated.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Play size={20} color={WINE} strokeWidth={1.7} />
            <p className="text-[14px] font-normal leading-5 tracking-[-0.154px] text-black">
              Newly generated playlists
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {generated.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-2xl p-3"
                style={{ backgroundColor: BEIGE }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: PURPLE }}>
                    <ListChecks size={14} color="#fff" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">{g.name}</p>
                    <p className="text-[12px] font-semibold leading-4" style={{ color: META }}>
                      {g.tests} tests • ready to run
                    </p>
                  </div>
                </div>
                <FloraButton variant="primary" size="sm" className="h-8 shrink-0 px-3 text-[12px] font-semibold">
                  Run
                </FloraButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function CostCard({ data }: { data: LevelData }) {
  const pct = Math.round((data.cost.spend / data.cost.limit) * 100)
  const fmt = (n: number) => `${data.cost.unit}${n.toLocaleString()}`
  return (
    <Card>
      <CardHeader icon={<CreditCard size={18} color={INK} strokeWidth={2} />} title="Cost & usage" action={<LinkButton label="Billing" />} />
      <div className="flex items-end gap-1.5">
        <span className="text-[30px] font-medium" style={{ color: INK }}>{fmt(data.cost.spend)}</span>
        <span className="mb-1.5 text-[13px] font-normal" style={{ color: MUTED }}>of {fmt(data.cost.limit)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${BLUE}1f` }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLUE }} />
      </div>
      <p className="mt-2.5 text-[12px] font-normal" style={{ color: MUTED }}>{data.cost.note}</p>
    </Card>
  )
}

function ActivityCard({ data }: { data: LevelData }) {
  return (
    <Card>
      <CardHeader icon={<Clock size={18} color={INK} strokeWidth={2} />} title="Recent activity" action={<LinkButton label="Open Log" />} />
      <div className="flex flex-col">
        {data.activity.map((a, idx) => (
          <div key={a.id} className="flex items-start gap-2.5 py-2.5" style={{ borderTop: idx === 0 ? 'none' : `1px solid ${BORDER}` }}>
            <div className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: BLUE }} />
            <p className="flex-1 text-[13px] font-normal" style={{ color: INK }}>{a.text}</p>
            <span className="shrink-0 text-[11px] font-normal" style={{ color: MUTED }}>{a.time}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

const INTENT_COLORS = [BLUE, PURPLE, GREEN, AMBER]

// Per-tier fill colors for the intent brand breakdown (VIP / Premium / Vendor).
const BRAND_COLORS: Record<BrandKey, string> = {
  vip: PURPLE,
  premium: BLUE,
  vendor: AMBER,
}

function IntentsCard({ data }: { data: LevelData }) {
  // Accordion: at most one intent expanded at a time (its id, or null).
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <Card>
      <CardHeader icon={<ListChecks size={18} color={INK} strokeWidth={2} />} title="Top intents" action={<LinkButton label="Insights" />} />
      <div className="flex flex-col gap-3">
        {data.intents.map((it, idx) => {
          const open = openId === it.id
          const panelId = `intent-brands-${it.id}`
          return (
            <div key={it.id}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : it.id)}
                className="w-full text-left outline-none"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <p className="text-[13px] font-normal" style={{ color: INK }}>{it.name}</p>
                    <ChevronDown
                      size={13}
                      color={MUTED}
                      className="transition-transform duration-instant ease-soft"
                      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                      aria-hidden
                    />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: INK }}>{it.share}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: '#efeeec' }}>
                  <div className="h-full rounded-full" style={{ width: `${it.share}%`, backgroundColor: INTENT_COLORS[idx % INTENT_COLORS.length] }} />
                </div>
              </button>
              {open && (
                <div
                  id={panelId}
                  role="region"
                  aria-label={`${it.name} by brand`}
                  className="mt-2.5 flex flex-col gap-2.5 rounded-xl border border-solid p-3 pt-2.5"
                  style={{ borderColor: BORDER, backgroundColor: '#faf9f8' }}
                >
                  {it.byBrand.map((b) => (
                    <div key={b.key}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[b.key] }} />
                          <span className="text-[12px] font-normal" style={{ color: INK }}>{b.label}</span>
                        </div>
                        <span className="text-[11px] font-normal" style={{ color: MUTED }}>
                          {b.share}% · {b.tickets.toLocaleString('en-US')} tickets
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: '#efeeec' }}>
                        <div className="h-full rounded-full" style={{ width: `${b.share}%`, backgroundColor: BRAND_COLORS[b.key] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SelfImprovingCard({ data }: { data: LevelData }) {
  const { summary, items } = data.policies
  return (
    <Card>
      <CardHeader
        icon={<Sparkles size={20} color={AI_STROKE} strokeWidth={1.7} />}
        title="Self-improving"
        action={
          <div className="flex shrink-0 items-center gap-2.5">
            <TealPill icon={TrendingUp} label={summary.coverage} />
            <ReviewButton />
          </div>
        }
      />
      <StatBlock value={summary.improved} label="Policies improved" period={summary.period} />
      <div className="mt-2 flex flex-col">
        {items.map((p, idx) => (
          <div key={p.id} className="flex flex-col gap-3 py-3" style={rowDivider(idx, items.length)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundImage: 'linear-gradient(90deg,#01567a,#6dbbd7)' }}
                >
                  <Sparkles size={14} color="#fff" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-black">{p.title}</p>
                  <p className="text-[14px] font-normal leading-5 tracking-[-0.154px] text-black">{p.change}</p>
                </div>
              </div>
              {p.status === 'applied' ? (
                <StatusBadge tone="success" icon={Check} label="Applied" />
              ) : (
                <StatusBadge tone="warning" icon={Clock} label="Pending approval" />
              )}
            </div>
            {/* Indented to sit under the title, not the avatar. The arrow follows
                the impact's sign, so "-32% escalations" reads as a fall. */}
            <div className="flex items-center gap-2 pl-8">
              <TealPill icon={p.impact.startsWith('-') ? TrendingDown : TrendingUp} label={p.impact} />
              <span className="text-[12px] font-semibold leading-4" style={{ color: META }}>
                {p.scope} • {p.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function KnowledgeContentCard({ data }: { data: LevelData }) {
  const { summary, items } = data.knowledge
  return (
    <Card>
      <CardHeader
        icon={<BookOpen size={20} color={INK} strokeWidth={1.7} />}
        title="New knowledge content"
        action={<ReviewButton />}
      />
      <StatBlock value={summary.created} label="Content snippets created" period={summary.period} />
      <div className="mt-3">
        <TealPill icon={Check} label={summary.coverage} />
      </div>
      <div className="mt-2 flex flex-col">
        {items.map((c, idx) => (
          <div key={c.id} className="flex flex-col gap-2 py-3" style={rowDivider(idx, items.length)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: DOC_BLUE }}>
                  <FileText size={14} color="#fff" strokeWidth={1.7} />
                </span>
                <p className="line-clamp-2 min-w-0 text-[14px] font-normal leading-5 tracking-[-0.154px] text-black">
                  {c.title}
                </p>
              </div>
              {c.status === 'saved' ? (
                <StatusBadge tone="success" icon={Check} label="Saved" />
              ) : (
                <StatusBadge tone="neutral" icon={Pencil} label="Draft" />
              )}
            </div>
            <div className="flex items-center gap-2 pl-8">
              <span className="flex min-w-0 items-center gap-0.5 rounded-[30px] px-2 py-1" style={{ backgroundColor: CHIP_BG }}>
                <Zap size={16} color={TEAL} />
                <span className="truncate text-[12px] font-semibold leading-4" style={{ color: CHIP_INK }}>
                  {c.topic}
                </span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold leading-4" style={{ color: META }}>
                {c.articles} related articles
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// --- Widget registry --------------------------------------------------------
const WIDGETS: Record<WidgetId, { title: string; render: (data: LevelData) => React.ReactNode }> = {
  health: { title: 'Overall agent health', render: (d) => <AgentHealthCard data={d} /> },
  qa: { title: 'Test coverage', render: (d) => <QaCoverageCard data={d} /> },
  gaps: { title: 'Knowledge gaps', render: (d) => <KnowledgeGapsCard data={d} /> },
  approvals: { title: 'Needs your approval', render: (d) => <ApprovalsCard data={d} /> },
  notifications: { title: 'Notifications', render: (d) => <NotificationsCard data={d} /> },
  cost: { title: 'Cost & usage', render: (d) => <CostCard data={d} /> },
  activity: { title: 'Recent activity', render: (d) => <ActivityCard data={d} /> },
  intents: { title: 'Top intents', render: (d) => <IntentsCard data={d} /> },
  policies: { title: 'Self-improving', render: (d) => <SelfImprovingCard data={d} /> },
  knowledge: { title: 'New knowledge content', render: (d) => <KnowledgeContentCard data={d} /> },
}

const PM_WIDGET_TITLE: Record<PmWidgetId, string> = {
  'pm-kpis': 'KPI summary',
  'pm-spotlight': 'Spotlight',
  'pm-lifecycle': 'Lifecycle',
  'pm-feed': 'Opportunity feed',
}


// --- Drag & drop wrapper ----------------------------------------------------
const DND_TYPE = 'dashboard-widget'
type DragItem = { id: WidgetId; column: ColumnKey; index: number }

function DraggableWidget({
  id, column, index, editing, onMove, onRemove, children,
}: {
  id: WidgetId; column: ColumnKey; index: number; editing: boolean
  onMove: (from: DragItem, toColumn: ColumnKey, toIndex: number) => void
  onRemove: (column: ColumnKey, index: number) => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_TYPE,
    canDrag: editing,
    item: (): DragItem => ({ id, column, index }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  })
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: DND_TYPE,
    collect: (m) => ({ isOver: m.isOver({ shallow: true }) }),
    hover: (item, monitor) => {
      if (!ref.current) return
      if (item.column === column && item.index === index) return
      const rect = ref.current.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const pointer = monitor.getClientOffset()
      if (!pointer) return
      let toIndex = pointer.y < midY ? index : index + 1
      if (item.column === column && item.index < toIndex) toIndex -= 1
      onMove(item, column, toIndex)
      item.column = column
      item.index = toIndex
    },
  })
  // Connect via a callback ref rather than `drop(preview(ref))` during render:
  // the connectors need the node, and `ref` stays for `hover`'s geometry read,
  // which runs from a drag event rather than a render. Memoized because
  // react-dnd's connectors are referentially stable — a fresh identity each
  // render would make React detach and reattach them mid-drag.
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node
      drop(preview(node))
    },
    [drop, preview],
  )

  return (
    <div ref={attach} style={{ opacity: isDragging ? 0.4 : 1 }} className="relative">
      {editing && (
        <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl border-2 border-dashed transition-colors" style={{ borderColor: isOver ? BLUE : 'transparent' }} />
      )}
      {editing && (
        <div className="absolute -top-2.5 left-3 right-3 z-30 flex items-center justify-between">
          <div ref={(node) => { drag(node) }} className="flex h-6 cursor-grab items-center gap-1 rounded-full border border-solid bg-white px-2 shadow-sm active:cursor-grabbing" style={{ borderColor: BORDER }}>
            <GripVertical size={13} color={MUTED} />
            <span className="text-[11px] font-semibold" style={{ color: MUTED }}>Drag</span>
          </div>
          <button onClick={() => onRemove(column, index)} className="flex size-6 items-center justify-center rounded-full border border-solid bg-white shadow-sm outline-none" style={{ borderColor: BORDER }} title="Remove widget">
            <X size={13} color={RED} />
          </button>
        </div>
      )}
      <div className={editing ? 'pointer-events-none select-none' : ''}>{children}</div>
    </div>
  )
}

function ColumnDropZone({ column, count, onMove }: { column: ColumnKey; count: number; onMove: (from: DragItem, toColumn: ColumnKey, toIndex: number) => void }) {
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: DND_TYPE,
    collect: (m) => ({ isOver: m.isOver({ shallow: true }) }),
    drop: (item) => onMove(item, column, count),
  })
  return (
    <div ref={(node) => { drop(node) }} className="flex h-[72px] items-center justify-center rounded-2xl border-2 border-dashed transition-colors" style={{ borderColor: isOver ? BLUE : BORDER, backgroundColor: isOver ? `${BLUE}0a` : 'transparent' }}>
      <span className="text-[13px] font-normal" style={{ color: MUTED }}>Drop widgets here</span>
    </div>
  )
}

// One popover for both dashboards — the support grid and the PM view differ only
// in which ids they offer and where the titles come from, so `titleOf` carries
// that and the keyboard handling is written once.
//
// Escape closes it and hands focus back to the trigger. The click-catching
// overlay below only ever served the mouse: without this, a keyboard user could
// open the popover and have no way back out of it.
function AddWidgetMenu<T extends string>({
  available,
  titleOf,
  onAdd,
  label = 'Add widget',
}: {
  available: T[]
  titleOf: (id: T) => string
  onAdd: (id: T) => void
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverId = useId()
  const showing = open && available.length > 0

  useEffect(() => {
    if (!showing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showing])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        disabled={available.length === 0}
        aria-expanded={showing}
        aria-controls={showing ? popoverId : undefined}
        className="flex h-9 items-center gap-1.5 rounded-full px-3.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flora-blue disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: INK }}
      >
        <Plus size={15} color="#fff" />
        <span className="text-[13px] font-semibold text-white">{label}</span>
      </button>
      {showing && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <FloraCard flat id={popoverId} data-testid="add-widget-popover" className="absolute right-0 top-[42px] z-[61] w-60 rounded-xl py-1.5 shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)]" style={{ borderColor: BORDER }}>
            {available.map((id) => (
              <button key={id} onClick={() => { onAdd(id); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-2 text-left outline-none hover:bg-[#f5f5f4] focus-visible:bg-[#f5f5f4]">
                <LayoutGrid size={14} color={MUTED} />
                <span className="text-[13px] font-normal" style={{ color: INK }}>{titleOf(id)}</span>
              </button>
            ))}
          </FloraCard>
        </>
      )}
    </div>
  )
}

// --- Root -------------------------------------------------------------------
export function HomeScreen() {
  // Home is always the platform-level view; the org-level toggle was removed.
  const [editing, setEditing] = useState(false)
  const [viewsState, setViewsState] = useState<ViewsState>(() => loadViewsState())
  const { open: openAssistant, isOpen: assistantOpen, context: assistantContext } = useAiAssistant()
  // The builder conversation is already open, so Generate New has nothing left to
  // ask for — the frame shows it disabled in this state.
  const buildingDashboard = assistantOpen && assistantContext.scope === 'build-dashboard'

  // Dashboard generation is driven by the AI Studio assistant, not by Home: the
  // Generate action opens the assistant on its build-dashboard scope, and the
  // request comes back through this store. Home stays the only writer of its saved
  // views — it previews what the assistant asks for, and commits on 'apply'.
  const request = useSyncExternalStore(subscribeDashboardRequest, getDashboardRequest)
  const previewView: NewView | null = request?.intent === 'preview' ? request.view : null

  const activeView = getActiveView(viewsState)

  // Compute the active kind and layout (preview overrides active).
  const activeKind = previewView ? (previewView.kind ?? 'grid') : activeView.kind
  const activeRole = previewView ? previewView.role : activeView.role
  const activeLayout =
    previewView && previewView.kind !== 'pm' && previewView.kind !== 'executive'
      ? previewView.layout
      : activeView.kind === 'grid'
      ? activeView.layout
      : DEFAULT_LAYOUT
  const activePmLayout =
    previewView?.kind === 'pm'
      ? previewView.pmLayout
      : activeView.kind === 'pm'
      ? activeView.pmLayout
      : DEFAULT_PM_LAYOUT
  const activeExecutiveLayout =
    previewView?.kind === 'executive'
      ? previewView.executiveLayout
      : activeView.kind === 'executive'
      ? activeView.executiveLayout
      : DEFAULT_EXECUTIVE_LAYOUT

  const data = useMemo(() => deriveRoleData(DATA.platform, activeRole), [activeRole])

  // Commit the assistant's layout once it asks us to, then clear the request so a
  // remount can't re-apply it. This is the only place a generated view is saved.
  useEffect(() => {
    if (request?.intent !== 'apply') return
    setViewsState((prev) => addView(prev, request.view))
    clearDashboardRequest()
  }, [request])

  useEffect(() => {
    persistViewsState(viewsState)
  }, [viewsState])

  // Grid-only computations — only run when a grid view is active.
  const used = activeKind === 'grid' ? [...activeLayout.left, ...activeLayout.right] : []
  const available = activeKind === 'grid' ? (Object.keys(WIDGETS) as WidgetId[]).filter((id) => !used.includes(id)) : []

  // PM handlers
  const movePm = (fromIndex: number, toIndex: number) =>
    setViewsState((prev) => movePmWidget(prev, fromIndex, toIndex))
  const removePm = (id: PmWidgetId) =>
    setViewsState((prev) => removePmWidget(prev, id))
  const addPm = (id: PmWidgetId) =>
    setViewsState((prev) => addPmWidget(prev, id))
  const resetPm = () => setViewsState((prev) => resetPmLayout(prev))

  // Executive handlers
  const moveExecutive = (fromIndex: number, toIndex: number) =>
    setViewsState((prev) => moveExecutiveSection(prev, fromIndex, toIndex))
  const removeExecutive = (id: ExecutiveSectionId) =>
    setViewsState((prev) => removeExecutiveSection(prev, id))
  const addExecutive = (id: ExecutiveSectionId) =>
    setViewsState((prev) => addExecutiveSection(prev, id))
  const resetExecutive = () => setViewsState((prev) => resetExecutiveLayout(prev))

  const moveWidget = (from: DragItem, toColumn: ColumnKey, toIndex: number) => {
    setViewsState((prev) => {
      const view = getActiveView(prev)
      if (view.kind !== 'grid') return prev
      const cur = view.layout
      const next: Layout = { left: [...cur.left], right: [...cur.right] }
      const srcArr = next[from.column]
      const realIdx = srcArr.indexOf(from.id)
      if (realIdx === -1) return prev
      srcArr.splice(realIdx, 1)
      const destArr = next[toColumn]
      const clamped = Math.max(0, Math.min(toIndex, destArr.length))
      destArr.splice(clamped, 0, from.id)
      return updateActiveLayout(prev, next)
    })
  }

  const removeWidget = (column: ColumnKey, index: number) => {
    setViewsState((prev) => {
      const view = getActiveView(prev)
      if (view.kind !== 'grid') return prev
      const cur = view.layout
      const next: Layout = { left: [...cur.left], right: [...cur.right] }
      next[column].splice(index, 1)
      return updateActiveLayout(prev, next)
    })
  }

  const addWidget = (id: WidgetId) => {
    setViewsState((prev) => {
      const view = getActiveView(prev)
      if (view.kind !== 'grid') return prev
      const cur = view.layout
      const target: ColumnKey = cur.left.length <= cur.right.length ? 'left' : 'right'
      const next: Layout = { left: [...cur.left], right: [...cur.right] }
      next[target].push(id)
      return updateActiveLayout(prev, next)
    })
  }

  const resetLayout = () => setViewsState((prev) => updateActiveLayout(prev, DEFAULT_LAYOUT))

  const renderColumn = (column: ColumnKey) => (
    <div className="flex flex-col gap-4">
      {activeLayout[column].map((id, index) => (
        <DraggableWidget key={id} id={id} column={column} index={index} editing={editing} onMove={moveWidget} onRemove={removeWidget}>
          {WIDGETS[id].render(data)}
        </DraggableWidget>
      ))}
      {editing && <ColumnDropZone column={column} count={activeLayout[column].length} onMove={moveWidget} />}
    </div>
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
      <div data-testid="screen-home" className="h-full flex-1 overflow-y-auto rounded-[26px] bg-white">
        <AiGradientDefs />
        <div className="min-w-[900px] px-16 pt-8 pb-16">
          {/* Greeting header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-[26px] font-normal leading-8 tracking-[0.35px]" style={{ color: INK_SOFT }}>
                  {editing ? 'Customize your dashboard' : 'Good morning, Sunny'}
                </p>
                {!editing && !previewView && (
                  <ViewSwitcher
                    views={viewsState.views}
                    activeId={viewsState.activeId}
                    onSelect={(id) => setViewsState((p) => setActiveView(p, id))}
                    onRename={(id, name) => setViewsState((p) => renameView(p, id, name))}
                    onDelete={(id) => setViewsState((p) => deleteView(p, id))}
                    onNew={() => openAssistant('build-dashboard')}
                  />
                )}
              </div>
              <p className="mt-1 text-[14px] font-normal tracking-[-0.154px]" style={{ color: MUTED }}>
                {editing
                  ? activeKind === 'executive'
                    ? 'Drag sections to reorder, remove them, or add new ones.'
                    : 'Drag widgets to reorder, remove them, or add new ones.'
                  : activeKind === 'executive'
                    ? "Here's what your executive outcome summary shows."
                    : "Here's what your agents need from you today."}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {editing ? (
                <>
                  {activeKind === 'grid' ? (
                    <AddWidgetMenu available={available} titleOf={(id) => WIDGETS[id].title} onAdd={addWidget} />
                  ) : activeKind === 'pm' ? (
                    <AddWidgetMenu
                      available={PM_WIDGET_ID_LIST.filter((id) => !activePmLayout.includes(id))}
                      titleOf={(id) => PM_WIDGET_TITLE[id]}
                      onAdd={addPm}
                    />
                  ) : (
                    <AddWidgetMenu
                      available={EXECUTIVE_SECTION_ID_LIST.filter((id) => !activeExecutiveLayout.includes(id))}
                      titleOf={(id) => EXECUTIVE_SECTION_TITLE[id]}
                      onAdd={addExecutive}
                      label="Add section"
                    />
                  )}
                  <button onClick={activeKind === 'pm' ? resetPm : activeKind === 'executive' ? resetExecutive : resetLayout} className="flex h-9 items-center rounded-full border border-solid bg-white px-3.5 outline-none" style={{ borderColor: BORDER }}>
                    <span className="text-[13px] font-semibold" style={{ color: INK }}>Reset</span>
                  </button>
                  <button onClick={() => setEditing(false)} className="flex h-9 items-center gap-1.5 rounded-full px-4 outline-none" style={{ backgroundColor: INK }}>
                    <Check size={15} color="#fff" />
                    <span className="text-[13px] font-semibold text-white">Done</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Customize is withheld under a preview: editing a layout that
                      is not the saved one would write the wrong view. */}
                  {!previewView && (
                    <FloraButton
                      variant="outline"
                      className="bg-white font-semibold"
                      onClick={() => setEditing(true)}
                      title="Customize dashboard"
                    >
                      Customize
                    </FloraButton>
                  )}
                  {/* Generation lives in AI Studio: this hands off to the assistant
                      rather than opening a form of its own, and goes quiet while
                      that conversation is open. */}
                  <FloraButton
                    variant="primary"
                    className="font-semibold disabled:bg-[#eeedeb] disabled:border-[#eeedeb] disabled:text-[#8b8e89] disabled:opacity-100"
                    onClick={() => openAssistant('build-dashboard')}
                    disabled={buildingDashboard}
                    title="Generate a new dashboard"
                  >
                    Generate New
                  </FloraButton>
                </>
              )}
            </div>
          </div>

          {/* Dashboard body: generated specialist view or shared grid */}
          {activeKind === 'pm' ? (
            <PmDashboard
              pmLayout={activePmLayout}
              editing={editing}
              onMove={movePm}
              onRemove={removePm}
            />
          ) : activeKind === 'executive' ? (
            <ExecutiveDashboard
              layout={activeExecutiveLayout}
              editing={editing}
              onMove={moveExecutive}
              onRemove={removeExecutive}
            />
          ) : (
            <div className="grid grid-cols-[1fr_360px] items-start gap-4">
              {renderColumn('left')}
              {renderColumn('right')}
            </div>
          )}
        </div>
      </div>
      </div>
    </DndProvider>
  )
}
