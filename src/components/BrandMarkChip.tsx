import type { BrandMark } from '@/types'

// A brand's wordmark: white label on the brand colour, in a rounded rect that
// sizes to its text. Brands ship no logo assets, so this stands in for one
// everywhere a brand is named — the switcher, the roster table, the wizard.
//
// aria-hidden: the chip is always rendered beside the brand's name in text, so
// exposing its label only doubles the accessible name of the button or menu item
// that holds it ("Uber Eats Uber Eats"), which is both wrong for a screen reader
// and unaddressable by name in tests.
export function BrandMarkChip({ mark, size = 28 }: { mark: BrandMark; size?: 20 | 28 }) {
  return (
    <span
      aria-hidden="true"
      data-testid="brand-mark"
      className="inline-flex shrink-0 items-center justify-center truncate font-semibold text-white"
      style={{
        height: `${size}px`,
        maxWidth: '96px',
        padding: size === 28 ? '0 8px' : '0 6px',
        borderRadius: size === 28 ? '8px' : '6px',
        backgroundColor: mark.bg,
        fontSize: size === 28 ? '12px' : '11px',
        lineHeight: `${size}px`,
        letterSpacing: '-0.1px',
      }}
    >
      {mark.label}
    </span>
  )
}

// The top bar's mark: a circle, because frame 1785:64372 puts the brand's logo in
// one and a wordmark cannot fit. Initials stand in for the logo we don't ship —
// one letter per word, capped at two, so "Uber Eats" reads UE and "Freight" F.
function initialsOf(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function BrandAvatar({ mark, size = 20 }: { mark: BrandMark; size?: 20 | 24 }) {
  return (
    <span
      aria-hidden="true"
      data-testid="brand-avatar"
      className="inline-flex shrink-0 items-center justify-center font-semibold text-white"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '9999px',
        backgroundColor: mark.bg,
        fontSize: size === 20 ? '9px' : '10px',
        lineHeight: `${size}px`,
        letterSpacing: '0.2px',
      }}
    >
      {initialsOf(mark.label)}
    </span>
  )
}
