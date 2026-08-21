import { Search } from 'lucide-react'
import { AVAILABLE_INTEGRATIONS, type AvailableIntegration } from './collections-data'
import { IntegrationMark } from './IntegrationMark'

const GRID = 'grid grid-cols-2 gap-5 xl:grid-cols-4'

function IntegrationCard({ integration }: { integration: AvailableIntegration }) {
  return (
    <article
      data-testid={`collection-card-${integration.id}`}
      className="group flex min-h-[174px] flex-col rounded-[18px] border border-surface-border bg-white transition-shadow hover:shadow-[0_6px_18px_rgba(20,20,20,0.08)]"
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <IntegrationMark integration={integration} />
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[13px] font-semibold text-ink">{integration.name}</h3>
          <p className="line-clamp-3 text-[12px] leading-[1.45] text-ink-muted">
            {integration.description}
          </p>
        </div>
      </div>
      <div className="flex justify-end border-t border-surface-border px-4 py-2.5">
        <button
          type="button"
          aria-label={`Connect ${integration.name}`}
          className="text-[12px] text-ink transition-colors group-hover:text-flora-blue-fg"
        >
          Connect Integration
        </button>
      </div>
    </article>
  )
}

function HeroMark({
  integration,
  className,
}: {
  integration: AvailableIntegration
  className: string
}) {
  return (
    <span
      className={`absolute flex size-10 items-center justify-center rounded-full bg-white shadow-[0_3px_12px_rgba(20,20,20,0.09)] ${className}`}
      aria-hidden
    >
      <IntegrationMark integration={integration} className="size-7" />
    </span>
  )
}

export function CollectionsView() {
  return (
    <div className="flex flex-col gap-5">
      <section
        className="relative flex h-[150px] items-center justify-center overflow-hidden"
        aria-labelledby="collections-heading"
      >
        <HeroMark integration={AVAILABLE_INTEGRATIONS[0]!} className="left-[12%] top-3" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[1]!} className="left-[22%] top-[52%]" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[2]!} className="right-[18%] top-[54%]" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[3]!} className="right-[9%] top-10" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[4]!} className="left-[7%] bottom-2" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[5]!} className="right-[15%] bottom-0" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[6]!} className="right-[24%] top-1" />
        <HeroMark integration={AVAILABLE_INTEGRATIONS[7]!} className="left-[18%] top-1" />

        <div className="relative z-[1] flex max-w-[430px] flex-col items-center gap-3 text-center">
          <h2
            id="collections-heading"
            className="text-[20px] font-semibold leading-[1.25] text-ink"
          >
            Connect your tools to make the best
            <br />
            out of Zendesk
          </h2>
          <p className="max-w-[410px] text-[12px] leading-[1.45] text-ink-muted">
            Find the products your company uses, and integrate them to make your Zendesk platform
            smarter and better for your entire company!
          </p>
        </div>
      </section>

      <div className="flex w-[220px] items-center gap-2 rounded-[18px] border border-surface-border bg-white px-3 py-2">
        <Search size={15} className="shrink-0 text-ink-muted" aria-hidden />
        <input
          type="text"
          placeholder="Search"
          aria-label="Search available integrations"
          className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-grey-500"
        />
      </div>

      <section className="flex flex-col gap-5" aria-labelledby="available-integrations-heading">
        <h2
          id="available-integrations-heading"
          className="border-b border-surface-border pb-3 text-[14px] font-semibold text-ink"
        >
          Available
        </h2>
        <div className={GRID}>
          {AVAILABLE_INTEGRATIONS.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </section>
    </div>
  )
}
