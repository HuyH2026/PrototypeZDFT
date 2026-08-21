// Mock data for the full-page AI Studio landing (empty state). Presentational
// only — no backend. Rows seed the composer when clicked.
import { BarChart3, HeartPulse, Sparkles, Wrench, type LucideIcon } from 'lucide-react'

export type SuggestionRow = {
  title: string
  description: string
  prompt: string
  // The New rows on the Suggested tab (Figma 1194:120035+). `tone` picks the
  // badge tint; `startsAgentPlan` and `startsSelfImprovingPlan` mark the two rows
  // that open a plan flow instead of seeding the composer.
  badge?: 'new'
  tone?: 'pink' | 'blue' | 'green' | 'purple'
  icon?: LucideIcon
  startsAgentPlan?: true
  startsSelfImprovingPlan?: true
}

// The two flows the Studio can actually run, as against the rows that only seed
// the composer. They are listed in the frame's sidebar as well as on the landing
// because the landing is a blank slate: the moment a transcript is on screen its
// suggestion rows are gone, and starting a flow meant leaving the conversation
// through "New conversation" first. Titles match the landing's rows — one flow
// must not be named two things.
export type StudioFlowScope = 'build-agent' | 'self-improving'

export const STUDIO_FLOWS: ReadonlyArray<{
  scope: StudioFlowScope
  title: string
  icon: LucideIcon
  // The landing badge's foreground for the same row, so a flow keeps its colour
  // across both surfaces. Purple is the one this app already uses for
  // self-improvement (Home's health heart, the plan's own check-ins chip).
  color: string
}> = [
  { scope: 'build-agent', title: 'Build an agent', icon: Wrench, color: '#1b5996' },
  { scope: 'self-improving', title: 'Self-improving agent', icon: HeartPulse, color: '#724be8' },
]

// Left-sidebar conversation history titles (mock). Held in full — the sidebar
// clips each to one line, which is why the frame shows them ellipsised.
export const CONVERSATION_HISTORY: string[] = [
  'How can we improve deflection rates on billing questions?',
  'CSAT best performers',
  'Give me a comprehensive report on last week',
  'Give me a comprehensive report on Voice',
  'Are there any knowledge gap that need filling?',
]

// Saved, reusable prompts. Backs both the "Flashbacks" tab and the sidebar's
// Flashbacks list, so a saved prompt is named the same in both places.
export const FLASHBACKS: SuggestionRow[] = [
  {
    title: 'Knowledge gaps report',
    description: 'Topics where answers are missing, week over week',
    prompt: 'Give me the knowledge gaps report',
  },
  {
    title: 'Email volume surge report',
    description: 'What drove the spike in email volume',
    prompt: 'Give me the email volume surge report',
  },
]

export const SUGGESTION_TABS: {
  suggested: SuggestionRow[]
  common: SuggestionRow[]
  flashbacks: SuggestionRow[]
} = {
  suggested: [
    {
      title: 'Plan mode',
      description: 'Create a plan for my lowest-performing workflow',
      prompt: 'Create a plan for my lowest-performing workflow',
      badge: 'new',
      tone: 'pink',
      icon: Sparkles,
    },
    {
      title: 'Build an agent',
      description: 'Build an Autoflow using plain language',
      prompt: 'Build an Autoflow using plain language',
      badge: 'new',
      tone: 'blue',
      icon: Wrench,
      startsAgentPlan: true,
    },
    {
      title: 'Self-improving agent',
      description: 'Check agent health and plan an improvement cycle',
      prompt: 'Check agent health and plan an improvement cycle',
      badge: 'new',
      // The purple this app uses for the Home health heart, and the tint the
      // plan's own Active check-ins chip carries.
      tone: 'purple',
      icon: HeartPulse,
      startsSelfImprovingPlan: true,
    },
    {
      title: 'Deflection diagnosis',
      description: 'Diagnose my deflection rate and provide recommendations',
      prompt: 'Diagnose my deflection rate and provide recommendations',
      badge: 'new',
      tone: 'green',
      icon: BarChart3,
    },
    {
      title: 'Voice conversations surge',
      description: 'Voice conversations increased significantly',
      prompt: 'Why did voice conversations surge?',
    },
    {
      title: 'Trouble with Integration',
      description: 'Workflow performance needs improvement',
      prompt: 'Why is the Integration workflow underperforming?',
    },
    {
      title: 'Recent Workflow Changes',
      description: 'Modified workflow performance impact',
      prompt: 'What impact did recent workflow changes have?',
    },
  ],
  common: [
    {
      title: 'Catch me up on Solve',
      description: 'Overall performance metrics and volume',
      prompt: 'Catch me up on Solve performance',
    },
    {
      title: 'Triage Accuracy',
      description: 'How well models are predicting and routing',
      prompt: 'How accurate is triage right now?',
    },
    {
      title: 'Ticket Complexity Insights',
      description: 'Actionable findings from ticket analysis',
      prompt: 'Show me ticket complexity insights',
    },
    {
      title: 'Top Handoff Drivers',
      description: 'Unresolved topics escalating to agents',
      prompt: 'What are the top handoff drivers?',
    },
    {
      title: 'Triage Model Issues',
      description: 'Queues with the most routing problems',
      prompt: 'Which queues have the most triage model issues?',
    },
    {
      title: 'Discover Knowledge Gaps',
      description: 'Topics where lack of knowledge base articles',
      prompt: 'Where are my biggest knowledge gaps?',
    },
  ],
  flashbacks: FLASHBACKS,
}

export type SuggestionTabKey = keyof typeof SUGGESTION_TABS
