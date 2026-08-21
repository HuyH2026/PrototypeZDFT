import { Database, Link2, ShoppingBag } from 'lucide-react'
import type { IntegrationLogoKey } from './integrations-data'

function JiraMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path d="M9.2 5.2 12 8l-4.7 4.7-3-3 4.9-4.5Z" fill="#0C66E4" />
      <path d="m14.8 18.8-2.8-2.8 4.7-4.7 3 3-4.9 4.5Z" fill="#0C66E4" />
      <path d="m8.7 13.3 4.6-4.6 2.9 2.9-4.6 4.6-2.9-2.9Z" fill="#2684FF" />
    </svg>
  )
}

function SalesforceMark() {
  return (
    <span
      className="relative flex h-5 w-8 items-center justify-center rounded-full bg-[#1aa7e8] text-[6px] font-bold tracking-[-0.2px] text-white before:absolute before:-left-1 before:bottom-0 before:size-4 before:rounded-full before:bg-[#1aa7e8] after:absolute after:-right-1 after:bottom-0 after:size-4 after:rounded-full after:bg-[#1aa7e8]"
      aria-hidden
    >
      <span className="relative z-10">salesforce</span>
    </span>
  )
}

export function IntegrationLogo({ logo }: { logo: IntegrationLogoKey }) {
  switch (logo) {
    case 's3':
      return (
        <span
          className="flex size-8 items-center justify-center rounded-full bg-[#4b8b2b] text-white"
          aria-hidden
        >
          <Database size={17} />
        </span>
      )
    case 'mcp':
      return (
        <span className="flex size-8 items-center justify-center text-ink" aria-hidden>
          <Link2 size={21} strokeWidth={2.4} />
        </span>
      )
    case 'shopify':
      return (
        <span
          className="relative flex size-8 items-center justify-center text-[#75a843]"
          aria-hidden
        >
          <ShoppingBag size={25} fill="currentColor" strokeWidth={1.5} />
          <span className="absolute text-[11px] font-bold text-white">S</span>
        </span>
      )
    case 'jira':
      return (
        <span className="flex size-8 items-center justify-center">
          <JiraMark />
        </span>
      )
    case 'sunshine':
      return (
        <span className="relative flex size-8 items-center justify-center" aria-hidden>
          <span className="absolute bottom-1 h-3 w-6 rounded-t-full bg-[#f5d548]" />
        </span>
      )
    case 'salesforce':
      return (
        <span className="flex size-8 items-center justify-center">
          <SalesforceMark />
        </span>
      )
  }
}
