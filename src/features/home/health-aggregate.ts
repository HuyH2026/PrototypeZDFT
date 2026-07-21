import type { ChannelKey, HealthMetric, HealthState, LevelData } from './dashboard-data'

// The four channel families in canonical display order.
export const CHANNEL_ORDER: ChannelKey[] = ['messaging', 'email', 'voice', 'headless']
export const CHANNEL_LABEL: Record<ChannelKey, string> = {
  messaging: 'Messaging',
  email: 'Email',
  voice: 'Voice',
  headless: 'Headless',
}

export type MetricUnit = 'percent' | 'score' | 'duration'

// The aggregated card view for the currently-selected channels.
export type HealthView = {
  score: number
  healthState: HealthState
  trend: number[]
  metrics: HealthMetric[]
  aiSummary: string
}

// A metric's byChannel values share one unit; infer it from the value shape.
export function metricUnit(value: string): MetricUnit {
  if (value.includes('%')) return 'percent'
  if (value.includes('m') || value.trim().endsWith('s')) return 'duration'
  return 'score'
}

// "82%" -> 82, "4.6" -> 4.6, "1m 48s" -> 108 (seconds).
export function parseMetricValue(value: string, unit: MetricUnit): number {
  if (unit === 'duration') {
    const m = /(?:(\d+)m)?\s*(?:(\d+)s)?/.exec(value.trim())
    const mins = m?.[1] ? Number(m[1]) : 0
    const secs = m?.[2] ? Number(m[2]) : 0
    return mins * 60 + secs
  }
  return parseFloat(value)
}

export function formatMetricValue(n: number, unit: MetricUnit): string {
  if (unit === 'percent') return `${Math.round(n)}%`
  // Round to one decimal before toFixed: binary floats make e.g. 4.55.toFixed(1)
  // return "4.5" instead of the expected "4.6".
  if (unit === 'score') return (Math.round(n * 10) / 10).toFixed(1)
  const total = Math.round(n)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}m ${String(secs).padStart(2, '0')}s`
}

// Delta strings: "+3.1%", "+0.2", "-9s". Parse to a signed number in the
// metric's unit (percent points, score points, or seconds).
export function parseMetricDelta(delta: string, unit: MetricUnit): number {
  if (unit === 'duration') return parseFloat(delta) // "-9s" -> -9
  return parseFloat(delta)
}

export function formatMetricDelta(n: number, unit: MetricUnit): string {
  const sign = n >= 0 ? '+' : '-'
  const abs = Math.abs(n)
  if (unit === 'percent') return `${sign}${abs.toFixed(1)}%`
  if (unit === 'score') return `${sign}${abs.toFixed(1)}`
  return `${sign}${Math.round(abs)}s`
}

export function scoreToState(score: number): HealthState {
  if (score >= 90) return 'good'
  if (score >= 75) return 'attention'
  return 'critical'
}

// Normalized volume weights over the selected channels (sum to 1).
function weightsFor(data: LevelData, selected: Set<ChannelKey>): Map<ChannelKey, number> {
  const keys = CHANNEL_ORDER.filter((k) => selected.has(k))
  const total = keys.reduce((s, k) => s + data.channelHealth[k].share, 0)
  return new Map(keys.map((k) => [k, data.channelHealth[k].share / total]))
}

function aggregateMetric(metric: HealthMetric, weights: Map<ChannelKey, number>): HealthMetric {
  const unit = metricUnit(metric.value)
  const byKey = new Map(metric.byChannel.map((c) => [c.key, c]))
  let valueSum = 0
  // NOTE: delta aggregation is a volume-weighted approximation — deltas are not
  // strictly additive, but this reads honestly for a mock dashboard.
  let deltaSum = 0
  for (const [k, w] of weights) {
    const c = byKey.get(k)
    if (!c) continue
    valueSum += w * parseMetricValue(c.value, unit)
    deltaSum += w * parseMetricDelta(c.delta, unit)
  }
  const up = deltaSum > 0
  const good = metric.goodWhenUp ? up : !up
  return {
    ...metric,
    value: formatMetricValue(valueSum, unit),
    delta: formatMetricDelta(deltaSum, unit),
    up,
    good,
  }
}

// Deterministic one-line summary for a filtered subset (no hand-written prose).
function summarize(selected: Set<ChannelKey>, metrics: HealthMetric[]): string {
  const labels = CHANNEL_ORDER.filter((k) => selected.has(k)).map((k) => CHANNEL_LABEL[k])
  const laggard = metrics.find((m) => !m.good)
  if (laggard) {
    return `Filtered to ${labels.join(', ')} — ${laggard.label.toLowerCase()} is the weak spot at ${laggard.value}.`
  }
  return `Filtered to ${labels.join(', ')} — all tracked metrics are healthy.`
}

// Returns the card view for the selected channels. When all four are selected,
// returns the top-level (hand-authored) values verbatim so the default view
// never drifts from today's card.
export function computeHealthView(data: LevelData, selected: Set<ChannelKey>): HealthView {
  if (selected.size >= CHANNEL_ORDER.length) {
    return {
      score: data.score,
      healthState: data.healthState,
      trend: data.trend,
      metrics: data.metrics,
      aiSummary: data.aiSummary,
    }
  }
  const weights = weightsFor(data, selected)
  const score = Math.round(
    [...weights].reduce((s, [k, w]) => s + w * data.channelHealth[k].score, 0),
  )
  const trend = data.trend.map((_, i) =>
    Math.round([...weights].reduce((s, [k, w]) => s + w * data.channelHealth[k].trend[i], 0)),
  )
  const metrics = data.metrics.map((m) => aggregateMetric(m, weights))
  return { score, healthState: scoreToState(score), trend, metrics, aiSummary: summarize(selected, metrics) }
}
