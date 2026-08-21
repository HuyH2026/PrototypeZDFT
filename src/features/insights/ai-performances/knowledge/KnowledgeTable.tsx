// Insights → Agent Overview → Knowledge: the article table and the Knowledge gap
// sub-tab's table. Thirteen columns cannot be fluid at the app's 1024px floor, so
// each header carries a minimum width and the flora Table's wrap scrolls — the
// one place this screen departs from the fluid-table convention Settings ▸
// Document index follows.
//
// `showChange` adds each numeric cell's period-over-period change beneath the
// figure. The values are carried per row, not computed.
import { NEG, POS } from '../ai-performances-data'
import {
  KNOWLEDGE_COLUMNS,
  KNOWLEDGE_GAP_COLUMNS,
  type KnowledgeGapRow,
  type KnowledgeRow,
} from './knowledge-data'
import { Table, Tbody, Td, Th, Thead } from '@/components/flora/Table'

// The frame draws an explicit `n/a` in every empty cell; a blank one would read as
// a rendering fault.
function Muted() {
  return <span className="text-ink-muted">n/a</span>
}

function Value({ value }: { value: string | null }) {
  return value === null ? <Muted /> : <span className="text-ink">{value}</span>
}

// The sign is authored into the label, so direction is read off it rather than
// stored a second time.
function Change({ label }: { label: string | null }) {
  if (!label) return null
  return (
    <span className="mt-0.5 block text-[12px]" style={{ color: label.startsWith('-') ? NEG : POS }}>
      {label}
    </span>
  )
}

function AgentChip({ chip }: { chip: { label: string; more?: number } | null }) {
  if (!chip) return <Muted />
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-surface-border px-2 py-0.5 text-[12px] text-ink">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#048c80]" />
      {chip.label}
      {chip.more ? <span className="text-ink-muted">+{chip.more}</span> : null}
    </span>
  )
}

// Article titles and related articles are links in the frame's accent blue. They
// click nowhere — no detail route is added by this work.
function ArticleLink({ title, size = 13 }: { title: string; size?: 13 | 14 }) {
  return (
    <button
      type="button"
      className={
        size === 14
          ? 'text-left text-[14px] text-[#145ad0] underline'
          : 'text-left text-[13px] text-[#145ad0] underline'
      }
    >
      {title}
    </button>
  )
}

function RelatedArticles({ related }: { related: string[] }) {
  if (related.length === 0) return <Muted />
  return (
    <div className="flex flex-col gap-1">
      {related.map((title) => (
        <ArticleLink key={title} title={title} />
      ))}
    </div>
  )
}

export function KnowledgeTable({
  rows,
  showChange,
}: {
  rows: KnowledgeRow[]
  showChange: boolean
}) {
  return (
    <Table>
      <Thead>
        <tr>
          {KNOWLEDGE_COLUMNS.map((c) => (
            <Th key={c.id} className={`whitespace-nowrap ${c.width}`}>
              {c.label}
            </Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <tr key={row.id} className="align-top">
            <Td>
              <ArticleLink title={row.title} size={14} />
            </Td>
            <Td>
              <span className="text-ink">{row.conversations}</span>
              {showChange && <Change label={row.change.conversations} />}
            </Td>
            <Td>
              <span className="text-ink">{row.resolutions}</span>{' '}
              <span className="text-ink-muted">({row.resolutionsPct})</span>
              {showChange && <Change label={row.change.resolutions} />}
            </Td>
            <Td>
              <div className="flex flex-col gap-0.5 text-[13px] leading-snug">
                <span className="text-ink">{row.surfaced}</span>
                {row.clicked === null ? <Muted /> : <span className="text-ink-muted">{row.clicked}</span>}
              </div>
            </Td>
            <Td>
              <Value value={row.csat} />
              {showChange && <Change label={row.change.csat} />}
            </Td>
            <Td>
              <Value value={row.integration} />
            </Td>
            <Td>
              <span className="text-ink">{row.channel}</span>
            </Td>
            <Td>
              <Value value={row.quickFeedback} />
            </Td>
            <Td>
              <Value value={row.relevance} />
            </Td>
            <Td>
              <Value value={row.engagement} />
            </Td>
            <Td>
              <Value value={row.engagementRate} />
            </Td>
            <Td>
              <AgentChip chip={row.topAgents} />
            </Td>
            <Td>
              <RelatedArticles related={row.related} />
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}

export function KnowledgeGapTable({ rows }: { rows: KnowledgeGapRow[] }) {
  return (
    <Table>
      <Thead>
        <tr>
          {KNOWLEDGE_GAP_COLUMNS.map((c) => (
            <Th key={c.id} className={`whitespace-nowrap ${c.width}`}>
              {c.label}
            </Th>
          ))}
        </tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <tr key={row.id} className="align-top">
            <Td>
              <span className="text-ink">{row.topic}</span>
            </Td>
            <Td>
              <span className="text-ink">{row.conversations}</span>
            </Td>
            <Td>
              <span className="text-ink">{row.nonResolutions}</span>
            </Td>
            <Td>
              {row.suggestedArticle === null ? <Muted /> : <ArticleLink title={row.suggestedArticle} />}
            </Td>
          </tr>
        ))}
      </Tbody>
    </Table>
  )
}
