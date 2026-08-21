// The zero-agent state. The CTA lives here rather than in the header — on this
// state the header's Create new pill is hidden, per the frame.
import { Link } from 'react-router'
import { ChannelOrbit } from './ChannelOrbit'

export function ManageAgentsEmpty() {
  return (
    <div data-testid="manage-agents-empty" className="flex flex-col items-center">
      <div className="flex w-full justify-center overflow-hidden">
        <ChannelOrbit />
      </div>

      <p className="mt-4 max-w-[680px] text-center text-sm leading-5 text-ink">
        Create your first agent, select or create a brand, and choose the channels where it will
        appear. You can configure its behavior for each channel later in{' '}
        <span className="underline">Configuration</span>.
      </p>

      <Link
        to="/agent-setup/new"
        className="mt-6 flex h-10 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold leading-5 whitespace-nowrap text-white"
      >
        Create new agent
      </Link>
    </div>
  )
}
