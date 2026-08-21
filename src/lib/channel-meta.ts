import {
  MessageSquare,
  Hash,
  MessageCircle,
  Camera,
  Smartphone,
  Mail,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneCall,
  Code,
  Phone,
  type LucideIcon,
} from "lucide-react";

// Maps a create-flow channel label to its chip display name, brand color, and icon.
export const CHANNEL_META: Record<
  string,
  { display: string; color: string; Icon: LucideIcon }
> = {
  "Web Widget": { display: "Widget", color: "#e05c34", Icon: MessageSquare },
  Slack: { display: "Slack", color: "#724be8", Icon: Hash },
  "Facebook Messenger": { display: "Messenger", color: "#3489db", Icon: MessageCircle },
  WhatsApp: { display: "WhatsApp", color: "#109081", Icon: MessageCircle },
  "Instagram Direct": { display: "Instagram", color: "#d62976", Icon: Camera },
  Android: { display: "Android", color: "#8a9a5b", Icon: Smartphone },
  iOS: { display: "iOS", color: "#4b4b4b", Icon: Smartphone },
  LINE: { display: "LINE", color: "#23831b", Icon: MessageCircle },
  Email: { display: "Email", color: "#2f69c7", Icon: Mail },
  "Inbound Voice": { display: "Inbound Voice", color: "#ac2a34", Icon: PhoneIncoming },
  "Outbound Voice": { display: "Outbound Voice", color: "#be297b", Icon: PhoneOutgoing },
  "Web Call": { display: "Web Call", color: "#7c1d79", Icon: PhoneCall },
  API: { display: "API", color: "#2f99b3", Icon: Code },
};

export function channelMeta(label: string) {
  const agentChannel = AGENT_CHANNELS.find((channel) => channel.label === label)
  if (agentChannel) {
    return {
      display: agentChannel.label,
      color: agentChannel.color,
      Icon: agentChannel.Icon,
    }
  }
  return (
    CHANNEL_META[label] ?? {
      display: label,
      color: "#646864",
      Icon: MessageSquare,
    }
  );
}

export type ChannelSection = {
  title: string
  channels: string[]
}

// Ordered channel groups shown in the create-agent flow, mirroring the Figma
// "Full page" frame. Every entry is a key of CHANNEL_META; together the
// sections cover all channels exactly once.
export const CHANNEL_SECTIONS: ChannelSection[] = [
  {
    title: 'Messaging',
    channels: [
      'Web Widget',
      'Slack',
      'Facebook Messenger',
      'WhatsApp',
      'Instagram Direct',
      'Android',
      'iOS',
      'LINE',
    ],
  },
  { title: 'Email', channels: ['Email'] },
  { title: 'Voice', channels: ['Inbound Voice', 'Outbound Voice', 'Web Call'] },
  { title: 'Headless', channels: ['API'] },
]

// The four agent channels the product ships, in canonical display order. This is
// the taxonomy the dashboard breaks its health metrics down by — distinct from
// CHANNEL_SECTIONS above, which groups the *integration* channels offered in the
// create-agent flow (CreateAgentFlow.tsx).
export type AgentChannelKey = 'widget' | 'voice' | 'webcall' | 'headless'

export const AGENT_CHANNELS: {
  key: AgentChannelKey
  label: string
  color: string
  Icon: LucideIcon
}[] = [
  { key: 'widget', label: 'Widget', color: '#e05c34', Icon: MessageSquare },
  { key: 'voice', label: 'Voice', color: '#be297b', Icon: Phone },
  { key: 'webcall', label: 'Web Call', color: '#7c1d79', Icon: PhoneCall },
  { key: 'headless', label: 'Headless', color: '#2f99b3', Icon: Code },
]
