// The Agent Overview's conversation flow (Total → Channels → Resolutions →
// Savings). The chart itself is the shared `SankeyFlow`; this file supplies the
// data set, the column titles and the card it sits in.
import { AGGREGATE_FLOW, FLOW } from './ai-performances-data'
import { Card } from '@/components/flora/Card'
import { SankeyFlow } from '@/components/sankey/SankeyFlow'

// Column titles across the top of the flow.
const BREAKDOWN_TITLES = ['Total conversations', 'Channels', 'Resolutions', 'Savings']
const AGGREGATE_TITLES = ['Total conversations', 'Resolutions', 'Savings']

export function FlowSankey({ channelBreakdown = true }: { channelBreakdown?: boolean }) {
  const flow = channelBreakdown ? FLOW : AGGREGATE_FLOW
  const titles = channelBreakdown ? BREAKDOWN_TITLES : AGGREGATE_TITLES
  return (
    <Card
      className="p-6"
      data-testid="conversation-flow"
      data-channel-breakdown={channelBreakdown ? 'true' : 'false'}
    >
      <SankeyFlow
        flow={flow}
        titles={titles}
        ariaLabel="Conversation flow by channel and resolution"
        replayKey={channelBreakdown ? 'breakdown' : 'aggregate'}
      />
    </Card>
  )
}
