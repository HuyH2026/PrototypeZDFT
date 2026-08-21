import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BRANDS_STORAGE_KEY, BrandProvider, brandScopeKey, useBrands } from './brand-context'

function Probe() {
  const { brands, currentBrand, currentAgentId, setCurrentBrand, setCurrentAgent, addBrand } =
    useBrands()
  return (
    <div>
      <span data-testid="current">{currentBrand?.name ?? 'All brands'}</span>
      <span data-testid="agent">{currentAgentId ?? 'none'}</span>
      <span data-testid="scope">{brandScopeKey(currentBrand)}</span>
      <span data-testid="count">{brands.length}</span>
      <span data-testid="names">{brands.map((brand) => brand.name).join(',')}</span>
      <button type="button" onClick={() => setCurrentBrand('uber-eats')}>
        pick eats
      </button>
      <button type="button" onClick={() => setCurrentBrand(null)}>
        pick all
      </button>
      <button
        type="button"
        onClick={() => setCurrentAgent({ id: 'freight-shipper', brandId: 'uber-freight' })}
      >
        pick agent
      </button>
      <button type="button" onClick={() => addBrand('Careem', ['Email'])}>
        add
      </button>
    </div>
  )
}

// Takes the hook as a prop so it can be pointed at a freshly re-imported module
// instance (the module counter only restarts on a real page load).
function IdProbe({ useBrandsHook }: { useBrandsHook: typeof useBrands }) {
  const { brands, addBrand } = useBrandsHook()
  return (
    <div>
      <span data-testid="ids">{brands.map((brand) => brand.id).join(',')}</span>
      <button type="button" onClick={() => addBrand('Careem', ['Email'])}>
        add
      </button>
    </div>
  )
}

function renderProbe() {
  return render(
    <BrandProvider>
      <Probe />
    </BrandProvider>,
  )
}

describe('brand-context', () => {
  // jsdom gives this suite no localStorage at all (the provider's guarded access
  // just no-ops there), so persistence is exercised against the same in-memory
  // stub agent-roster-store.test.ts uses.
  function stubStorage() {
    const map = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
      clear: () => map.clear(),
      key: () => null,
      length: map.size,
    })
  }

  // A fresh stub per case: brands persist now, so a case that adds one would
  // otherwise leak its brand list into the next case's provider.
  beforeEach(() => {
    stubStorage()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts on All brands with the four seeded brands', () => {
    renderProbe()
    expect(screen.getByTestId('current')).toHaveTextContent('All brands')
    expect(screen.getByTestId('scope')).toHaveTextContent('all-brands')
    expect(screen.getByTestId('count')).toHaveTextContent('4')
  })

  it('selects a brand and returns to All brands', async () => {
    const user = userEvent.setup()
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'pick eats' }))
    expect(screen.getByTestId('current')).toHaveTextContent('Uber Eats')
    expect(screen.getByTestId('scope')).toHaveTextContent('uber-eats')
    await user.click(screen.getByRole('button', { name: 'pick all' }))
    expect(screen.getByTestId('current')).toHaveTextContent('All brands')
  })

  it('setCurrentAgent selects the agent and its brand together', async () => {
    const user = userEvent.setup()
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'pick agent' }))
    expect(screen.getByTestId('agent')).toHaveTextContent('freight-shipper')
    expect(screen.getByTestId('current')).toHaveTextContent('Uber Freight')
  })

  it('changing the brand clears the current agent', async () => {
    const user = userEvent.setup()
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'pick agent' }))
    await user.click(screen.getByRole('button', { name: 'pick eats' }))
    expect(screen.getByTestId('agent')).toHaveTextContent('none')
    expect(screen.getByTestId('current')).toHaveTextContent('Uber Eats')
  })

  it('addBrand mints a deterministic id and selects the new brand', async () => {
    const user = userEvent.setup()
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('count')).toHaveTextContent('5')
    expect(screen.getByTestId('current')).toHaveTextContent('Careem')
    expect(screen.getByTestId('scope').textContent).toMatch(/^careem-\d+$/)
  })

  // The roster store persists (emptying it is how the empty state is reached), so
  // brands have to persist too: otherwise one refresh leaves a created brand's
  // agent in the roster with a brandId no brand answers to.
  it('persists a created brand across a reload', async () => {
    const user = userEvent.setup()
    const first = renderProbe()
    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('count')).toHaveTextContent('5')

    // Unmounting and mounting a fresh provider is the reload: the brand list is
    // read once, lazily, when the provider initialises.
    first.unmount()
    renderProbe()
    expect(screen.getByTestId('count')).toHaveTextContent('5')
    expect(screen.getByTestId('names')).toHaveTextContent('Careem')
  })

  // A real refresh restarts the module counter while storage keeps the ids it
  // already handed out, so this one reloads the module rather than just the
  // provider. A counter that ignored the stored ids would re-mint 'careem-1'.
  it('resumes ids above the stored ones after a module reload', async () => {
    window.localStorage.setItem(
      BRANDS_STORAGE_KEY,
      JSON.stringify([
        { id: 'careem-1', name: 'Careem', mark: { label: 'Careem', bg: '#2f3130' }, channels: ['Email'] },
      ]),
    )
    vi.resetModules()
    const fresh = await import('./brand-context')
    const user = userEvent.setup()
    render(
      <fresh.BrandProvider>
        <IdProbe useBrandsHook={fresh.useBrands} />
      </fresh.BrandProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'add' }))

    const ids = screen.getByTestId('ids').textContent?.split(',') ?? []
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
