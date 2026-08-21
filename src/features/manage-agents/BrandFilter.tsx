// The in-page brand filter. It reads and writes the same brand state as the
// top-bar switcher — 'All brands' is `currentBrand === null` — so the two can
// never disagree about what the page is showing.
import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useBrands } from '@/app/brand-context'
import { BrandMarkChip } from '@/components/BrandMarkChip'

export function BrandFilter() {
  const { brands, currentBrand, setCurrentBrand } = useBrands()
  const [isOpen, setIsOpen] = useState(false)

  const pick = (id: string | null) => {
    setCurrentBrand(id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Filter by brand"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-9 items-center gap-2 rounded-full border border-surface-border bg-white px-3"
      >
        <span className="text-sm font-semibold leading-5 text-ink">
          {currentBrand?.name ?? 'All brands'}
        </span>
        <ChevronDown size={16} className="text-ink-muted" aria-hidden />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full left-0 z-20 mt-1 w-[240px] rounded-xl border border-surface-border bg-white p-1 shadow-[0px_16px_12px_rgba(10,13,14,0.16)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => pick(null)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-bg-subtle"
          >
            <span className="flex-1 text-sm leading-5 text-ink">All brands</span>
            {currentBrand === null && <Check size={16} className="text-blue-700" aria-hidden />}
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              role="menuitem"
              onClick={() => pick(brand.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-bg-subtle"
            >
              <BrandMarkChip mark={brand.mark} size={20} />
              <span className="flex-1 truncate text-sm leading-5 text-ink">{brand.name}</span>
              {currentBrand?.id === brand.id && (
                <Check size={16} className="text-blue-700" aria-hidden />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
