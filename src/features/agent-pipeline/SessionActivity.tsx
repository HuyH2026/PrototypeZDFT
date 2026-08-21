import { Card } from '@/components/flora/Card'
import type { CockpitFinding, FindingState } from './cockpit-data'

export type SessionFindingActivity = {
  finding: CockpitFinding
  state: FindingState
  agentNames: string[]
}

const STATE_LABEL: Record<FindingState, string> = {
  observed: 'Finding',
  testing: 'Experiment running',
  'awaiting-approval': 'Winner ready',
  applied: 'Applied · measuring',
}

const STATE_TONE: Record<FindingState, string> = {
  observed: 'bg-grey-100 text-grey-800',
  testing: 'bg-[#e8effb] text-[#294b85]',
  'awaiting-approval': 'bg-[#fff3cc] text-[#6b5300]',
  applied: 'bg-[#e5f4dc] text-[#31591e]',
}

export function SessionActivity({ events }: { events: SessionFindingActivity[] }) {
  if (events.length === 0) return null

  return (
    <Card data-testid="session-activity" className="px-6 py-5">
      <h2 className="text-[14px] font-semibold text-ink">Outcome work this session</h2>
      <p className="mt-1 text-[12px] text-ink-muted">
        Actions taken in Outcomes stay visible here while measurement catches up.
      </p>
      <ul className="mt-3 flex flex-col">
        {events.map(({ finding, state, agentNames }) => (
          <li
            key={finding.id}
            data-testid={`session-activity-${finding.id}`}
            className="flex items-start gap-4 border-t border-surface-border py-3 first:border-t-0 first:pt-1"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">{finding.title}</p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {agentNames.join(' and ')} · +{finding.projectedResolutionDelta.toFixed(1)} pt
                projected resolution
              </p>
              {state === 'applied' ? (
                <p className="mt-1 text-[11px] text-grey-600">
                  Change applied; outcome measurement is still pending.
                </p>
              ) : null}
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATE_TONE[state]}`}
            >
              {STATE_LABEL[state]}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
