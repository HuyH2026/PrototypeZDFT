// Mock data + types for the Integrations screen (/settings/integrations).
// Values are transcribed from the design content; there is no backend.

export type IntegrationsTab = 'Connections' | 'Document index' | 'Collections'
export const INTEGRATIONS_TABS: IntegrationsTab[] = ['Connections', 'Document index', 'Collections']

// Which mark the row shows. Kept as a key rather than a component reference so
// the data module stays free of JSX (see IntegrationLogo for the mapping).
export type IntegrationLogoKey = 's3' | 'mcp' | 'shopify' | 'jira' | 'sunshine' | 'salesforce'

export type ConnectStatus = 'In use' | 'Not used'

export type Connection = {
  id: string
  name: string
  logo: IntegrationLogoKey
  // Verbatim from the design: some rows carry a timestamp, others just read
  // "Connected" (no sync has run). Not a date — do not reformat.
  lastSync: string
  status: ConnectStatus
}

export type DocStatus = 'Public' | 'Private'

export type IndexedDocument = {
  id: string
  integration: string // the connection that indexed it — display text, not an id
  sourceType: string // "Webpage", "Shopify product", "Amazon s3 file", "Article"
  title: string
  status: DocStatus
  lastEdit: string // pre-formatted display string, sorted descending
  sourceId: string // vendor-native identifier, shown verbatim
}

// Sorted by last edit date descending, matching the header's active sort caret.
export const INDEXED_DOCUMENTS: IndexedDocument[] = [
  {
    id: 'd1',
    integration: 'Sitemap',
    sourceType: 'Webpage',
    title: 'Card Machines for Quick & Easy Payments | Teya',
    status: 'Public',
    lastEdit: 'Aug 4, 2026, 2:00 pm',
    sourceId: 'e2d35ff6a84592ac',
  },
  {
    id: 'd2',
    integration: 'Amazon_s3',
    sourceType: 'Amazon s3 file',
    title: 'AOE Notes',
    status: 'Private',
    lastEdit: 'Jul 29, 2026, 2:03 pm',
    sourceId: 'saga-my-bucket/AOE Notes.pdf',
  },
  {
    id: 'd3',
    integration: 'Shopify',
    sourceType: 'Shopify product',
    title: 'Jordan Spizike Low Shoes',
    status: 'Public',
    lastEdit: 'Jul 23, 2026, 6:59 am',
    sourceId: 'gid://shopify/Product/10434286846269',
  },
  {
    id: 'd4',
    integration: 'Shopify',
    sourceType: 'Shopify product',
    title: "Bobbies 'Vadim' Leather Loafers",
    status: 'Public',
    lastEdit: 'Jul 23, 2026, 6:59 am',
    sourceId: 'gid://shopify/Product/10352836280637',
  },
  {
    id: 'd5',
    integration: 'Shopify',
    sourceType: 'Shopify product',
    title: "Paul Smith 'Jason' Leather Derby Shoes",
    status: 'Public',
    lastEdit: 'Jul 23, 2026, 6:59 am',
    sourceId: 'gid://shopify/Product/10352836313405',
  },
  {
    id: 'd6',
    integration: 'Shopify',
    sourceType: 'Shopify product',
    title: "Saison 1865 'Derbyg' Calfskin Leather Derby Shoes",
    status: 'Public',
    lastEdit: 'Jul 23, 2026, 6:59 am',
    sourceId: 'gid://shopify/Product/10352836215101',
  },
  {
    id: 'd7',
    integration: 'Shopify',
    sourceType: 'Shopify product',
    title: "Prada 'Chocolate' Brushed Leather Loafers",
    status: 'Public',
    lastEdit: 'Jul 23, 2026, 6:59 am',
    sourceId: 'gid://shopify/Product/10352836247869',
  },
  {
    id: 'd8',
    integration: 'Shopify',
    sourceType: 'Shopify product',
    title: 'Jordan Retro 4 Sneaker',
    status: 'Public',
    lastEdit: 'Jul 23, 2026, 6:34 am',
    sourceId: 'gid://shopify/Product/10434288582973',
  },
]

// Options for the Document index filter row. Every control is inert; these are
// the labels the design shows, not a derived list.
export const DOC_SEARCH_FIELDS = ['Title', 'Source ID'] as const
export const DOC_SOURCE_TYPES = ['Article', 'Webpage', 'Shopify product', 'Amazon s3 file'] as const

// Sorted by display name ascending, matching the header's active sort caret.
export const CONNECTIONS: Connection[] = [
  {
    id: 'amazon-s3',
    name: 'Amazon S3',
    logo: 's3',
    lastSync: 'Aug 08, 2026 3:30:26 pm',
    status: 'In use',
  },
  {
    id: 'mcp-shopify',
    name: 'MCP - Shopify',
    logo: 'mcp',
    lastSync: 'Connected',
    status: 'In use',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: 'shopify',
    lastSync: 'Aug 08, 2026 4:21:01 pm',
    status: 'In use',
  },
  { id: 'jira', name: 'Jira', logo: 'jira', lastSync: 'Aug 07, 2026 9:30:17 pm', status: 'In use' },
  {
    id: 'sunshine-conversations',
    name: 'Sunshine Conversations',
    logo: 'sunshine',
    lastSync: 'Connected',
    status: 'In use',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: 'salesforce',
    lastSync: 'Feb 25, 2026 12:10:26 pm',
    status: 'Not used',
  },
]
