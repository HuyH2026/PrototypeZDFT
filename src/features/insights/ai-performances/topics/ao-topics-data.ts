// Mock data for Insights → Agent Overview → Topics. Frontend-only; no backend.
// Transcribed from Figma "Explore Unification" 2014:96786
// (Agent Overview_Topics_01_conetnts).
//
// The `Ao` prefix on this folder keeps it distinguishable from cx-journey/topics/,
// which owns the /insights/topics destination — that screen is the org-wide topic
// analysis, this tab is the agent-scoped one. Two surfaces carry the name Topics,
// deliberately.
//
// This tab draws no channel pill group, so there is one card set and one row set.
import { C5 } from '../ai-performances-data'
import {
  csatCard,
  engagementCard,
  quickFeedbackCard,
  relevanceCard,
  sentimentCard,
} from '../cards/card-factories'
import type { InsightCardData, StackedBarCard } from '../cards/card-types'
import { pct } from '../metric-format'

export const AO_TOPICS_DATE_RANGE = 'May 2, 2026 – Jun 1, 2026'

export const AO_TOPICS_NOTE =
  'Topics created for 64% of chats. Chats need to contain sufficient dialogue length to be classified as a Topic category.'

/** Inclusive: a 4.0 rating is teal. The frame only draws 4.2/4.4 teal and 3.7 in ink, so the boundary is our call. */
export const AO_CSAT_TEAL_THRESHOLD = 4

export type AoTopicColumn = { id: string; label: string; width: string }

// Widths are the frame's own; the last column's body cells run wider than its
// header, so the header's 200px is the minimum.
export const AO_TOPIC_COLUMNS: AoTopicColumn[] = [
  { id: 'topic', label: 'Topics (115)', width: 'min-w-[300px]' },
  { id: 'chats', label: 'Chats', width: 'min-w-[120px]' },
  { id: 'resolutions', label: 'Resolutions', width: 'min-w-[160px]' },
  { id: 'nonResolutions', label: 'Non-resolutions', width: 'min-w-[170px]' },
  { id: 'csat', label: 'Avg. CSAT', width: 'min-w-[160px]' },
  { id: 'useCases', label: 'Top 3 surfaced use cases', width: 'min-w-[200px]' },
]

const conversationsWithTopicsCard: StackedBarCard = {
  kind: 'stacked',
  title: 'Conversations with Topics',
  value: '45,000',
  segments: [
    { label: 'Resolved', count: '36,000', pct: pct(36_000, 45_000), color: C5 },
    { label: 'Not resolved', count: '9,000', pct: pct(9_000, 45_000), color: '#b9bec7' },
  ],
}

export const AO_TOPIC_CARDS: InsightCardData[] = [
  conversationsWithTopicsCard,
  csatCard(1, '3.5'),
  quickFeedbackCard(1),
  sentimentCard(1),
  relevanceCard(1, 'Relevance for chats with Topics'),
  engagementCard(1, 'User engagement for chat with Topics'),
]

export type AoUseCaseChip = { label: string; more?: number }

export type AoTopicRow = {
  id: string
  label: string
  chats: number
  resolutions: number
  csat: string
  useCases: AoUseCaseChip
  hasGap: boolean
}

export type AoTopicGroup = {
  id: string
  label: string
  /** The category's topic count, as the frame's chip draws it — not the number of
   *  children listed below. An expansion shows a category's top topics, so the
   *  aggregate row is deliberately not the sum of the visible children. */
  count: number
  chats: number
  resolutions: number
  csat: string
  useCases: AoUseCaseChip
  children: AoTopicRow[]
}

/** Non-resolutions is always derived. The frame draws it in every group row, and
 *  two of the four contradict their own chats and resolutions; deriving reproduces
 *  the frame wherever the frame is self-consistent. */
export function nonResolutions(row: { chats: number; resolutions: number }): number {
  return row.chats - row.resolutions
}

export function groupHasGap(group: AoTopicGroup): boolean {
  return group.children.some((child) => child.hasGap)
}

export const AO_TOPIC_GROUPS: AoTopicGroup[] = [
  {
    id: 'accounts',
    label: 'Account Management',
    count: 20,
    chats: 20183,
    resolutions: 11783,
    csat: '4.2',
    useCases: { label: 'Knowledge Retrieval', more: 1 },
    children: [
      {
        id: 'accounts-update',
        label: 'Update account details',
        chats: 6120,
        resolutions: 3910,
        csat: '4.3',
        useCases: { label: 'Change Personal Info' },
        hasGap: false,
      },
      {
        id: 'accounts-close',
        label: 'Close account',
        chats: 4802,
        resolutions: 2655,
        csat: '4.0',
        useCases: { label: 'Service cancellation', more: 1 },
        hasGap: true,
      },
      {
        id: 'accounts-reopen',
        label: 'Reopen account',
        chats: 3140,
        resolutions: 1908,
        csat: '3.9',
        useCases: { label: 'Knowledge Retrieval' },
        hasGap: false,
      },
    ],
  },
  {
    id: 'financial',
    label: 'Financial Transactions',
    count: 21,
    chats: 17269,
    resolutions: 11817,
    csat: '4.4',
    useCases: { label: 'Knowledge Retrieval', more: 1 },
    children: [
      {
        id: 'financial-withdraw',
        label: 'Withdraw funds',
        chats: 5908,
        resolutions: 4412,
        csat: '4.5',
        useCases: { label: 'Knowledge Retrieval', more: 1 },
        hasGap: false,
      },
      {
        id: 'financial-failed',
        label: 'Transaction failed',
        chats: 4116,
        resolutions: 2704,
        csat: '3.8',
        useCases: { label: 'Fallback' },
        hasGap: true,
      },
      {
        id: 'financial-transfer',
        label: 'Transfer between accounts',
        chats: 3502,
        resolutions: 2506,
        csat: '4.4',
        useCases: { label: 'Knowledge Retrieval' },
        hasGap: false,
      },
    ],
  },
  {
    id: 'service',
    label: 'Customer Service',
    count: 9,
    chats: 5704,
    resolutions: 528,
    csat: '3.7',
    useCases: { label: 'Fallback', more: 1 },
    children: [
      {
        id: 'service-contact',
        label: 'Contact support',
        chats: 2410,
        resolutions: 240,
        csat: '3.6',
        useCases: { label: 'Fallback' },
        hasGap: true,
      },
      {
        id: 'service-complaint',
        label: 'Complaint handling',
        chats: 1806,
        resolutions: 162,
        csat: '3.4',
        useCases: { label: 'Fallback', more: 1 },
        hasGap: true,
      },
      {
        id: 'service-outage',
        label: 'Service outage',
        chats: 1102,
        resolutions: 98,
        csat: '3.9',
        useCases: { label: 'Knowledge Retrieval' },
        hasGap: false,
      },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscription Services',
    count: 11,
    chats: 4458,
    resolutions: 3548,
    csat: '4.2',
    useCases: { label: 'Service cancellation' },
    children: [
      {
        id: 'subscriptions-cancel',
        label: 'Cancel subscription',
        chats: 1940,
        resolutions: 1502,
        csat: '4.1',
        useCases: { label: 'Service cancellation' },
        hasGap: false,
      },
      {
        id: 'subscriptions-plan',
        label: 'Change plan',
        chats: 1308,
        resolutions: 1046,
        csat: '4.3',
        useCases: { label: 'With intent' },
        hasGap: false,
      },
      {
        id: 'subscriptions-billing',
        label: 'Billing cycle',
        chats: 902,
        resolutions: 704,
        csat: '4.2',
        useCases: { label: 'Knowledge Retrieval', more: 1 },
        hasGap: false,
      },
    ],
  },
]
