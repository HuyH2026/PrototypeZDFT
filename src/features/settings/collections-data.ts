// Mock catalogue shown on Settings ▸ Integrations ▸ Collections. The content
// matches the eight cards in the design frame; there is no backend.

export type AvailableIntegration = {
  id: string
  name: string
  description: string
  brand: string
}

export const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  {
    id: 'absorb-lms',
    name: 'Absorb LMS',
    description:
      'Absorb LMS is a flexible learning platform that makes it easy to build and manage training programs for internal and external teams.',
    brand: '#ef5b45',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description:
      'Spreadsheet-database hybrid, with the features of a database but applied to a spreadsheet.',
    brand: '#fcb400',
  },
  {
    id: 'amazon-connect',
    name: 'Amazon Connect',
    description:
      'Deliver fast, personalized service with every customer interaction using an AI-native contact center from AWS.',
    brand: '#58b5b9',
  },
  {
    id: 'canny',
    name: 'Canny',
    description:
      'Canny helps you collect and organize feature requests to better understand customer needs and prioritize your roadmap.',
    brand: '#635bff',
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description:
      'Team workspace where knowledge and collaboration meet — connect spaces so answers stay in sync with your documentation.',
    brand: '#1868db',
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description:
      'Omnichannel helpdesk software that lets teams track, prioritize, and resolve customer tickets.',
    brand: '#25c16f',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description:
      'Bring in documents, spreadsheets, and slides so Forethought can answer from files your team already keeps up to date.',
    brand: '#1a73e8',
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description:
      'Customer messaging platform for support, engagement, and onboarding conversations across web, mobile, and email.',
    brand: '#1f1f1f',
  },
]
