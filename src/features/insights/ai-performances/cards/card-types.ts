// The three card archetypes the Agent Overview's channel-scoped tabs share,
// discriminated on `kind`. Data only — the renderer is ./InsightCard.tsx and the
// figures are built by ./card-factories.ts and each tab's own *-data.ts.
export type BarSegment = { label: string; count: string; pct: string; color: string }

export type StackedBarCard = {
  kind: 'stacked'
  title: string
  value: string
  segments: BarSegment[]
}

export type DonutSlice = {
  name: string
  count: string
  /** Arc weight for recharts. Callers should pass the count so the ring matches
   *  its legend. The three card factories (resolutionsCard, sentimentCard,
   *  quickFeedbackCard) currently pass a percentage carried from the frames,
   *  which is why some rings do not match their legends (known follow-up). */
  value: number
  color: string
}

export type DonutCardData = {
  kind: 'donut'
  title: string
  center: string
  centerLabel: string
  /** An undotted count above the legend, for a donut whose slices are a
   *  breakdown of a stated whole ("41,536 conversations"). Absent on the cards
   *  whose slices are the whole story. */
  total?: { count: string; label: string }
  slices: DonutSlice[]
}

export type RankRow = { label: string; value: number; count: string; color?: string }

export type RankedBarCard = {
  kind: 'ranked'
  title: string
  total: string
  totalLabel: string
  secondaryLabel?: string
  secondaryValue?: string
  color: string
  rows: RankRow[]
}

export type InsightCardData = StackedBarCard | DonutCardData | RankedBarCard
