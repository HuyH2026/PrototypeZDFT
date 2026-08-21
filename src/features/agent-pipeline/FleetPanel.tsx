// The agents the loop manages, read from agent-store so the org-wide claim names
// real things. Pure: the screen supplies the agents (agent-pipeline spec,
// Decision 8 — this feature reads down and never writes up).
import { Card } from '@/components/flora/Card'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'
import { CHANNELS } from '@/features/ai-agents/agent-builder-data'
import type { StoredAgent } from '@/features/ai-agents/agent-store'
import type { Change } from './pipeline-data'

export type FleetPanelProps = { agents: StoredAgent[]; changes: Change[] }

function channelLabel(key: StoredAgent['channel']): string {
  return CHANNELS.find((channel) => channel.key === key)?.label ?? key
}

export function FleetPanel({ agents, changes }: FleetPanelProps) {
  return (
    <Card data-testid="fleet-panel" className="px-6 py-5">
      <h3 className="text-[13px] text-ink-muted">{agents.length} agents under management</h3>
      <Table className="mt-3">
        <Thead>
          <tr>
            <Th>Agent</Th>
            <Th>Channel</Th>
            <Th>Resolution</Th>
            <Th>CSAT</Th>
            <Th>Last change by the loop</Th>
            <Th>Autonomy</Th>
          </tr>
        </Thead>
        <Tbody>
          {agents.map((agent) => {
            // First match wins: ALL_CHANGES is newest-first, plan changes ahead
            // of fleet changes.
            const last = changes.find((change) => change.agentId === agent.id)
            return (
              <tr key={agent.id} data-testid={`fleet-row-${agent.id}`}>
                <Td>{agent.name}</Td>
                <Td>{channelLabel(agent.channel)}</Td>
                <Td>{agent.resolutionRate}</Td>
                <Td>{agent.csat}</Td>
                <Td>{last === undefined ? 'No changes yet' : last.title}</Td>
                {/* An agent that is switched off is not being managed — the only
                    honest derivation available, since autonomy is not configurable
                    here (spec Scope: out). */}
                <Td>{agent.on ? 'Managed' : 'Excluded'}</Td>
              </tr>
            )
          })}
        </Tbody>
      </Table>
    </Card>
  )
}
