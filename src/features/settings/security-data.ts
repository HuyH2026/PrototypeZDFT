// Mock data + types for the Security screen (/settings/security).
// Copy is transcribed verbatim from the design frame (vendor copy, including
// its "Forethought" product names and support addresses); there is no backend,
// and the states are read-only — the design offers no toggle.

export type RedactionState = 'On' | 'Off'

export type RedactionArea = {
  id: string
  // Column 2's heading: which area of the product the rule covers.
  name: string
  state: RedactionState
  description: string
}

export const REDACTION_AREAS: RedactionArea[] = [
  {
    id: 'help-desk-data',
    name: 'Help Desk Data',
    state: 'On',
    description:
      'Forethought will redact any data retrieved from your Help Desk for analytical purposes.',
  },
  {
    id: 'solve-conversation-storage',
    name: 'Solve Conversation Storage',
    state: 'On',
    description:
      "After a conversation has completed, transcripts of interactions are stored in Forethought's database in either redacted or unredacted format. Unredacted data provides more visibility into interactions with your customers; however, Forethought recommends keeping redaction enabled for data security purposes.",
  },
]

// The intro paragraph carries one link mid-sentence, so it is split into the
// text either side of it rather than held as a single string.
export const REDACTION_INTRO = {
  before:
    'Redaction involves selectively editing or obscuring parts of text to protect sensitive information. Forethought provides configuration of precise control over the management of sensitive data across your product set. Learn more at ',
  linkLabel: 'trust.forethought.ai',
  linkHref: 'https://trust.forethought.ai',
  after:
    '. For custom redaction rules, please email your requirements to support@forethought.ai and security@forethought.ai.',
} as const
