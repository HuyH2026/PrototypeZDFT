import { Fragment, useCallback, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useAiAssistant } from '@/app/ai-assistant-context'
import { AiStudioConversation } from './AiStudioConversation'
import { AiStudioLanding } from './AiStudioLanding'
import { AiStudioShell } from './AiStudioShell'
import {
  DashboardBuilderBody,
  type DashboardSelection,
  type DashboardTurn,
} from './bodies/DashboardBuilderBody'
import { DefaultAssistantBody } from './bodies/DefaultAssistantBody'
import { TopicSuggestionsBody } from './bodies/TopicSuggestionsBody'
import { ManageAgentsStepsBody } from './bodies/ManageAgentsStepsBody'
import { KnowledgeEmergingTopicBody } from './bodies/KnowledgeEmergingTopicBody'
import { PolicyRewriteBody } from './bodies/PolicyRewriteBody'
import { AgentPlanFlow } from './agent-plan/AgentPlanFlow'
import { wantsAgentPlan } from './agent-plan/agent-plan-data'
import { SelfImprovingFlow } from './self-improving/SelfImprovingFlow'
import { wantsSelfImprovingPlan } from './self-improving/self-improving-data'
import {
  applyDashboard,
  clearDashboardRequest,
  previewDashboard,
} from '@/features/home/dashboard-request-store'
import {
  composeDashboardPrompt,
  DEFAULT_PM_LAYOUT,
  focusesFromPrompt,
  generateLayout,
  roleFromPrompt,
  ROLES,
  wantsExecutiveDashboard,
  wantsPmDashboard,
} from '@/features/home/generate-layout'
import { DEFAULT_EXECUTIVE_LAYOUT } from '@/features/home/executive-data'
import type { AiContext } from './ai-context-registry'
import { requestPolicyReview } from '@/features/ai-agents/editor/policy-ai-request-store'

// Side-panel geometry and motion, ported from the prototype's copilot panel
// (`v1/index.html`, `.copilot-panel`). The panel is 360px wide with a 6px right
// inset, and the gap it opens in the row is the sum of the two. The slide runs
// 520ms on --ease-out; the inner card trails it at 620ms.
const PANEL_W = 360
const PANEL_INSET = 6
const PANEL_GAP = PANEL_W + PANEL_INSET
const EASE_OUT = [0.22, 1, 0.36, 1] as const
const SLIDE = { duration: 0.52, ease: EASE_OUT } as const

// A dashboard turn is read out of free text; the guided picker skips the reading
// and states its answers directly. Either way the turn lives in the host, because
// it belongs to this panel's conversation: closing the panel ends it.
function buildRequest(prompt: string): DashboardTurn {
  return { prompt, role: roleFromPrompt(prompt), focuses: focusesFromPrompt(prompt) }
}

// Turn a request into a view for Home. Asking for the product lifecycle (by role
// or by focus) gets the bespoke PM dashboard; every other request scores the
// shared widgets (see generate-layout).
function viewFor(turn: DashboardTurn) {
  if (wantsPmDashboard(turn)) {
    return {
      name: 'Product lifecycle',
      kind: 'pm' as const,
      role: 'pm' as const,
      pmLayout: [...DEFAULT_PM_LAYOUT],
    }
  }
  if (wantsExecutiveDashboard(turn)) {
    return {
      name: 'Executive dashboard',
      kind: 'executive' as const,
      role: 'exec' as const,
      executiveLayout: [...DEFAULT_EXECUTIVE_LAYOUT],
    }
  }
  // Named role → its label; otherwise the view is named for the request itself.
  const name = turn.role
    ? (ROLES.find((r) => r.key === turn.role)?.label ?? 'Generated')
    : 'Custom Home'
  return {
    name,
    kind: 'grid' as const,
    role: turn.role,
    layout: generateLayout({ role: turn.role, focuses: turn.focuses, prompt: turn.prompt }),
  }
}

function ScopedBody({
  context,
  onSuggestion,
}: {
  context: AiContext
  onSuggestion: (text: string) => void
}) {
  if (context.scope === 'default') return <TopicSuggestionsBody />
  if (context.scope === 'manage-agents') return <ManageAgentsStepsBody />
  if (context.scope === 'knowledge-emerging-topic') return <KnowledgeEmergingTopicBody />
  return <DefaultAssistantBody context={context} onSuggestion={onSuggestion} />
}

type HostSession = {
  contextVersion: number
  draft: string | null
  dashboardTurn: DashboardTurn | null
  policyTurn: string | null
}

function emptySession(contextVersion: number): HostSession {
  return { contextVersion, draft: null, dashboardTurn: null, policyTurn: null }
}

// The single mounted assistant surface. Reads the provider and renders either
// the inline AiStudioShell panel or the full-page takeover. Body content is chosen
// by scope. Most scopes are presentational (no backend this phase); the
// `build-dashboard` scope is live — sending the composer publishes a dashboard
// request that Home previews (see dashboard-request-store).
export function AiAssistantHost() {
  const { isOpen, mode, context, contextVersion, open, close, expand, collapse } = useAiAssistant()
  // null means "untouched, still showing the scope's prefill". It must be distinct
  // from '': an empty string is a real edit (the user cleared the field), and
  // conflating the two would silently restore the prefill on every clear, making
  // the composer impossible to empty or to retype from scratch.
  const [storedSession, setStoredSession] = useState<HostSession>(() =>
    emptySession(contextVersion),
  )
  // A new context reads as a fresh session immediately. The first edit/turn
  // promotes that derived session into state, avoiding a reset effect and its
  // extra render while preserving state across ordinary rerenders and resizing.
  const session =
    storedSession.contextVersion === contextVersion ? storedSession : emptySession(contextVersion)
  const { draft, dashboardTurn, policyTurn } = session
  const patchSession = useCallback(
    (patch: Partial<Omit<HostSession, 'contextVersion'>>) => {
      setStoredSession((current) => ({
        ...(current.contextVersion === contextVersion ? current : emptySession(contextVersion)),
        ...patch,
      }))
    },
    [contextVersion],
  )
  const setDraft = useCallback(
    (nextDraft: string | null) => patchSession({ draft: nextDraft }),
    [patchSession],
  )
  const setDashboardTurn = useCallback(
    (turn: DashboardTurn | null) => patchSession({ dashboardTurn: turn }),
    [patchSession],
  )
  const setPolicyTurn = useCallback(
    (turn: string | null) => patchSession({ policyTurn: turn }),
    [patchSession],
  )

  const buildingDashboard = context.scope === 'build-dashboard'
  const rewritingPolicy = context.scope === 'service-cancellation-policy'

  // The user's edits once they've made any, else the scope's prefill.
  const composerValue = draft ?? context.prompt ?? ''

  // Home shows the dashboard as soon as the request lands, and saves it once the
  // assistant reports back (see applyBuiltDashboard) — so the panel's trace runs
  // over the dashboard it is describing.
  const startTurn = useCallback(
    (turn: DashboardTurn) => {
      setDashboardTurn(turn)
      previewDashboard({ prompt: turn.prompt, view: viewFor(turn) })
    },
    [setDashboardTurn],
  )

  const submitDashboard = useCallback(() => {
    const prompt = composerValue.trim()
    if (!prompt) return
    // Sending consumes the text, so the composer clears — and stays clear, since
    // '' is a real value rather than a fall-through to the prefill.
    setDraft('')
    startTurn(buildRequest(prompt))
  }, [composerValue, setDraft, startTurn])

  const submitPolicyRewrite = useCallback(() => {
    const prompt = composerValue.trim()
    if (!prompt) return
    setDraft('')
    setPolicyTurn(prompt)
  }, [composerValue, setDraft, setPolicyTurn])

  // "How are our agents doing — is anything struggling?" is answered by the
  // survey wherever it is asked, so the matcher runs on every live composer and
  // every suggestion chip rather than only on the landing's. Returns whether it
  // took the ask, so callers can fall back to their own behaviour.
  //
  // Only this matcher is promoted out of the landing. `wantsAgentPlan`'s
  // vocabulary (draft/create + agent) is the ordinary phrasing of scoped prefills
  // that mean something else on their own screens — "Draft test cases for this
  // agent" on AI QA, "Draft a new agent for this channel" on Agent Builder — so
  // running it here would hijack them. The landing's blank slate has no competing
  // meaning, which is why both still run there.
  const askedAboutHealth = useCallback(
    (text: string) => {
      if (!wantsSelfImprovingPlan(text)) return false
      open('self-improving', 'full', {})
      return true
    },
    [open],
  )

  // The panel composer for every scope that has no submit of its own. A health
  // ask escalates into the full survey; anything else stays the inert mock it has
  // always been.
  const submitPanelAsk = useCallback(() => {
    askedAboutHealth(composerValue.trim())
  }, [askedAboutHealth, composerValue])

  // A chip is a sentence the user did not have to type: it starts the flow it
  // names, or lands in the composer, which is what a suggestion is for.
  const pickSuggestion = useCallback(
    (text: string) => {
      if (!askedAboutHealth(text)) setDraft(text)
    },
    [askedAboutHealth, setDraft],
  )

  // The guided picker states its answers rather than being read out of prose, but
  // it still sends the sentence it stands for, so the transcript shows the request
  // the user made.
  const submitSelection = useCallback(
    (selection: DashboardSelection) => {
      startTurn({
        role: selection.role,
        focuses: selection.focuses,
        prompt: selection.prompt ?? composeDashboardPrompt(selection),
      })
    },
    [startTurn],
  )

  // Closing abandons an unapplied preview — the request belongs to the
  // conversation, so it must not outlive it and reappear behind the user's back.
  const closePanel = useCallback(() => {
    clearDashboardRequest()
    close()
  }, [close])

  // The panel asks Home to keep the dashboard once it has finished building it.
  // applyDashboard is a no-op with nothing pending, so a rerun of the effect
  // behind it cannot mint a second view.
  const applyBuiltDashboard = useCallback(() => {
    applyDashboard()
  }, [])

  // Both surfaces animate out as well as in, so each stays mounted through its
  // exit (see the shared AnimatePresence below) and neither can be
  // short-circuited with an early return.
  const panelOpen = isOpen && mode === 'panel'
  const fullOpen = isOpen && mode === 'full'

  // Starting a flow from the Studio's sidebar is the same launch a contextual
  // trigger makes, so it goes through `open` and bumps the context version —
  // which is what remounts the view below and gives the flow a fresh transcript.
  const startFlow = useCallback(
    (scope: 'build-agent' | 'self-improving') => open(scope, 'full', {}),
    [open],
  )

  // Each plan flow owns its own transcript and panel, so both are checked
  // before the generic conversation view. Every full-mode transcript is keyed
  // on the context version, so launching a context mounts a fresh one. Without
  // it React reconciles the new conversation onto the old component and its
  // `messages` state survives — which was always wrong (a branch opened
  // showing the transcript it branched from) and is louder now that a
  // transcript plays in: it would arrive already finished. That key lives on
  // the flow itself, not on the AnimatePresence slot below — a scope switch
  // while full-open should remount the transcript, not replay the studio's
  // own open/close animation.
  let fullView: ReactNode = null
  if (fullOpen) {
    if (context.scope === 'self-improving') {
      fullView = (
        <SelfImprovingFlow
          key={contextVersion}
          onClose={collapse}
          onNewConversation={() => open('self-improving', 'full')}
          onBranch={(seed) => open('default', 'full', { conversation: seed })}
          onStartFlow={startFlow}
        />
      )
    } else if (context.scope === 'build-agent') {
      fullView = (
        <AgentPlanFlow
          key={contextVersion}
          onClose={collapse}
          onNewConversation={() => open('build-agent', 'full')}
          // Branching leaves the flow: a branched message is an ordinary
          // conversation, not a second plan.
          onBranch={(seed) => open('default', 'full', { conversation: seed })}
          onStartFlow={startFlow}
        />
      )
    } else if (context.conversation) {
      fullView = (
        <AiStudioConversation
          key={contextVersion}
          onClose={collapse}
          onNewConversation={() => open(context.scope, 'full')}
          onBranch={(seed) => open(context.scope, 'full', { conversation: seed })}
          conversation={context.conversation}
          onStartFlow={startFlow}
          // A health ask inside a transcript is still a health ask. Returning
          // undefined leaves the canned reply for everything else — and for the
          // ask itself the reply never paints, because opening the survey
          // remounts this view in the same commit.
          onUserMessage={(text) => {
            askedAboutHealth(text)
            return undefined
          }}
        />
      )
    } else {
      fullView = (
        <AiStudioLanding
          onClose={collapse}
          initialComposer={composerValue}
          contextLabel={rewritingPolicy ? 'Service cancellation' : undefined}
          contextType={rewritingPolicy ? 'Policy' : undefined}
          onSubmit={(text) => {
            // The more specific matcher first: "create a self-improving plan for
            // my agent" matches both, and it is unambiguously the self-improving
            // flow (spec Decision 10). Anything matching neither stays a mock —
            // there is one canned plan each, so a request that fits neither
            // would get a plan that does not match what was asked.
            if (wantsSelfImprovingPlan(text)) open('self-improving', 'full', {})
            else if (wantsAgentPlan(text)) open('build-agent', 'full', {})
          }}
          onStartAgentPlan={() => open('build-agent', 'full', {})}
          onStartSelfImprovingPlan={() => open('self-improving', 'full', {})}
        />
      )
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      {/* `wait`: expanding/collapsing swaps which surface is mounted while
          `isOpen` stays true the whole time, so without `wait` the panel's
          exit and the full studio's entrance (or the reverse) would overlap —
          and both draw a composer with the same placeholder, so for a moment
          there'd be two of it in the DOM at once. */}
      <AnimatePresence mode="wait">
        {fullOpen && <Fragment key="full-studio">{fullView}</Fragment>}
        {panelOpen && (
          <Fragment key="panel">
            {/* The gap the panel opens beside the content, animated on the panel's own
              clock so `main` gives way exactly as fast as the panel arrives — and
              reclaims the space exactly as fast as it leaves (the prototype animates
              `.body`'s padding-right for this). */}
            <motion.div
              aria-hidden
              className="shrink-0"
              initial={{ width: 0 }}
              animate={{ width: PANEL_GAP }}
              exit={{ width: 0 }}
              transition={SLIDE}
            />

            {/* The panel itself is positioned against the app row rather than laid out
              in it, so it can travel in from beyond the right edge. Its insets line
              its card up with the content card beside it, as in the prototype, where
              the panel's top and bottom edges meet `.main`'s exactly (6px right, 8px
              bottom — `.main`'s own margin). */}
            <motion.div
              // z-90 clears the full-app takeovers (z-80: the Knowledge and AI QA
              // drill-ins, the Use cases preview). The Content snippet editor opens
              // this panel from its own selection menu, so a panel that ranked below
              // the takeover would arrive invisible.
              className="absolute top-0 right-1.5 bottom-2 z-[90] rounded-3xl shadow-xs-flora"
              style={{ width: PANEL_W }}
              // x travels the panel's width plus its right inset: the offset that
              // parks it fully off-screen. The fade is shorter than the slide and
              // starts late, so the panel is solid before it lands.
              initial={{ x: PANEL_W + PANEL_INSET, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: PANEL_W + PANEL_INSET, opacity: 0 }}
              transition={{ ...SLIDE, opacity: { duration: 0.36, delay: 0.06, ease: 'easeOut' } }}
            >
              {/* The inner card trails the panel by 48px on a slower curve, so the
                panel reads as sliding out from under the content rather than as one
                rigid block crossing the screen. */}
              <motion.div
                className="h-full w-full overflow-hidden rounded-3xl"
                initial={{ x: 48 }}
                animate={{ x: 0 }}
                exit={{ x: 48 }}
                transition={{ duration: 0.62, ease: EASE_OUT }}
              >
                <AiStudioShell
                  onClose={closePanel}
                  onExpand={expand}
                  composerValue={composerValue}
                  onComposerChange={setDraft}
                  // The dashboard and policy scopes each act on a sent message
                  // their own way; every other scope answers a health ask and is
                  // otherwise the inert mock it was.
                  onComposerSubmit={
                    buildingDashboard
                      ? submitDashboard
                      : rewritingPolicy
                        ? submitPolicyRewrite
                        : submitPanelAsk
                  }
                >
                  {buildingDashboard ? (
                    <DashboardBuilderBody
                      request={dashboardTurn}
                      onSubmitSelection={submitSelection}
                      onBuilt={applyBuiltDashboard}
                    />
                  ) : rewritingPolicy ? (
                    <PolicyRewriteBody
                      request={policyTurn}
                      onSuggestion={setDraft}
                      onReview={requestPolicyReview}
                    />
                  ) : (
                    <ScopedBody context={context} onSuggestion={pickSuggestion} />
                  )}
                </AiStudioShell>
              </motion.div>
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
