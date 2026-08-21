import { Headphones, PhoneCall } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { AvailableIntegration } from './collections-data'

type IntegrationMarkProps = {
  integration: AvailableIntegration
  className?: string
}

function AirtableMark() {
  return (
    <svg viewBox="0 0 32 28" className="h-7 w-8" aria-hidden>
      <path d="m2 8 13-6 6 3-13 6-6-3Z" fill="#F9C642" />
      <path d="m2 10 13 6v10L2 20V10Z" fill="#E84F54" />
      <path d="m17 15 13-6v11l-13 6V15Z" fill="#4AA8D8" />
    </svg>
  )
}

function DriveMark() {
  return (
    <svg viewBox="0 0 32 28" className="h-7 w-8" aria-hidden>
      <path d="M11 2h10l9 16H20L11 2Z" fill="#FABC04" />
      <path d="M11 2 2 18l5 8 9-16-5-8Z" fill="#34A853" />
      <path d="M7 26h18l5-8H12l-5 8Z" fill="#4285F4" />
    </svg>
  )
}

function ConfluenceMark() {
  return (
    <svg viewBox="0 0 32 28" className="h-7 w-8" aria-hidden>
      <path d="M5 5.5c5 3 9.8 3.5 15.5 1L24 12c-7.6 3.5-14.1 2.2-21-2.2l2-4.3Z" fill="#2684FF" />
      <path d="M27 22.5c-5-3-9.8-3.5-15.5-1L8 16c7.6-3.5 14.1-2.2 21 2.2l-2 4.3Z" fill="#0C66E4" />
    </svg>
  )
}

function AbsorbMark() {
  return (
    <svg viewBox="0 0 28 30" className="h-7 w-7" aria-hidden>
      <path d="M14 1 27 28h-9L8 8l6-7Z" fill="#F35D64" />
      <path d="M8 8 1 28h9l5-12-7-8Z" fill="#58A9E1" />
      <path d="m15 16 3 12h-8l5-12Z" fill="#F6C64D" />
    </svg>
  )
}

function IntercomMark() {
  return (
    <span
      className="flex size-7 items-center justify-center rounded-[4px] bg-[#181818]"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5 text-white">
        {[4, 7.2, 10.4, 13.6, 16.8].map((x) => (
          <rect key={x} x={x} y="5" width="1.7" height="10" rx="0.85" fill="currentColor" />
        ))}
        <path
          d="M4 17c5.3 2.2 10.7 2.2 16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function IntegrationMark({ integration, className }: IntegrationMarkProps) {
  let mark

  switch (integration.id) {
    case 'absorb-lms':
      mark = <AbsorbMark />
      break
    case 'airtable':
      mark = <AirtableMark />
      break
    case 'amazon-connect':
      mark = (
        <span className="flex size-7 items-center justify-center rounded-full bg-[#66bfc1] text-white">
          <PhoneCall size={15} strokeWidth={2.2} />
        </span>
      )
      break
    case 'canny':
      mark = <span className="text-[28px] font-semibold leading-none text-[#635bff]">C</span>
      break
    case 'confluence':
      mark = <ConfluenceMark />
      break
    case 'freshdesk':
      mark = (
        <span className="flex size-7 items-center justify-center rounded-[7px] bg-[#4fc37b] text-white">
          <Headphones size={16} strokeWidth={2.2} />
        </span>
      )
      break
    case 'google-drive':
      mark = <DriveMark />
      break
    case 'intercom':
      mark = <IntercomMark />
      break
  }

  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center', className)} aria-hidden>
      {mark}
    </span>
  )
}
