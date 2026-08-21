// Serves /experiment/simulation ("Simulation") — frame 1545:329684.
//
// The frame specifies exactly one state: the zero-simulations empty state. It
// carries no populated list, create flow or results view, so this screen is the
// empty state alone and "Create simulation" is deliberately inert.
//
// In the design the heading, body copy and button are flattened into a single
// bitmap (the frame's `image 577`), so only the illustration is used as an
// asset; the text and pill are rebuilt as real DOM. Because that bitmap is a
// pasted screenshot, its type sizes can't be read back reliably — the heading
// and copy use the app's own scale (16/14) rather than the bitmap's measured
// ~14/11, matching the sibling empty state in Manage agents. No backend.
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/flora/PageHeader'
import { AiTriggerButton } from '@/features/ai-studio/AiTriggerButton'
import simulationEmpty from '@/assets/simulation/empty-state.png'

export function SimulationView() {
  return (
    <div data-testid="view-simulation" className="h-full overflow-y-auto">
      <PageHeader title="Simulation" actions={<AiTriggerButton label="Ask AI about this page" />} />

      {/* The frame sits the block about a third of the way down rather than
          centering it in the content card, hence the fixed top offset. */}
      <div data-testid="simulation-empty" className="flex flex-col items-center pt-[148px] pb-12">
        <img
          data-testid="simulation-illustration"
          src={simulationEmpty}
          alt=""
          className="size-[124px]"
        />
        <h2 className="mt-6 text-[16px] leading-6 font-semibold text-ink">No simulations yet</h2>
        {/* Width is set so the copy breaks after "handles", as in the frame. */}
        <p className="mt-2 max-w-[430px] text-center text-[14px] leading-5 text-ink-muted">
          Create a simulation test to evaluate how your agent handles common scenarios
        </p>
        <button
          type="button"
          className="mt-6 flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[14px] leading-5 font-semibold whitespace-nowrap text-white"
        >
          Create simulation
          <Plus size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
