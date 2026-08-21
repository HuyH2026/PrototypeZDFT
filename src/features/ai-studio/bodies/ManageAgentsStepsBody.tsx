// manage-agents assistant body: the setup checklist. It reads the roster store
// directly, so a created agent flips the first item without any request-store
// hand-off — nothing has to travel from the assistant back into a screen.
import { BookOpen, Bot, Building2, CheckCircle, MessageSquare } from 'lucide-react'
import { useAgentRoster } from '@/features/manage-agents/agent-roster-store'
import { useAiAssistant } from '@/app/ai-assistant-context'

type StepCard = { Icon: typeof BookOpen; color: string; title: string; body: string }

const STEPS: StepCard[] = [
  {
    Icon: Building2,
    color: '#247acb',
    title: 'Create Agent',
    body: 'Create your first agent, select or create a brand, and choose the channels where it will appear.',
  },
  {
    Icon: BookOpen,
    color: '#be297b',
    title: 'Connect Knowledge',
    body: 'Connect trusted knowledge sources so your agent can provide accurate answers.',
  },
  {
    Icon: MessageSquare,
    color: '#2f99b3',
    title: 'Channel Configuration',
    body: "Tailor your agent's experience and behavior for each channel.",
  },
  {
    Icon: Bot,
    color: '#e05c34',
    title: 'Build Agent',
    body: "Use natural language to define your agent's behavior, tone, and workflows.",
  },
]

const AGENT_CREATED: StepCard = {
  Icon: CheckCircle,
  color: '#0f8a5f',
  title: 'Agent created',
  body: 'Congrats, great start! Your agent is ready to configure. 👍',
}

export function ManageAgentsStepsBody() {
  const { agents } = useAgentRoster()
  const { open } = useAiAssistant()
  const steps = agents.length > 0 ? [AGENT_CREATED, ...STEPS.slice(1)] : STEPS

  return (
    <>
      <p className="mt-6 text-[22px] leading-[30px] tracking-[0.352px] text-black">
        Welcome, Sunny 👋
        <br />
        Let&apos;s set up your first agent.
      </p>
      <p className="mt-4 text-[14px] leading-5 tracking-[-0.154px] text-ink">
        Complete these steps to get your agent ready.
      </p>
      <div className="mt-4 rounded-[20px] border border-white/80 bg-white/30 p-4 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <p className="mb-1 text-[12px] font-medium leading-5 tracking-[-0.154px] text-black">
          Setup checklist
        </p>
        <div className="flex flex-col">
          {steps.map((step, index) => {
            const buildsAgent = step.title === 'Build Agent'
            return (
              <div
                key={step.title}
                className={`flex flex-col items-start gap-2 py-3 text-left ${index < steps.length - 1 ? 'border-b border-[#e8e9eb]' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <step.Icon size={18} color={step.color} strokeWidth={2} aria-hidden />
                  <span className="text-[14px] font-medium leading-5 tracking-[-0.154px] text-[#3d4040]">
                    {step.title}
                  </span>
                </div>
                <p className="text-[12px] leading-4 text-[#373a4d]">{step.body}</p>
                {buildsAgent && (
                  <button
                    type="button"
                    onClick={() => open('build-agent', 'full')}
                    className="rounded-full border border-grey-200 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-[#01567a] transition-colors hover:bg-white"
                  >
                    Build with AI
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
