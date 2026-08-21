import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { compile } from 'tailwindcss'
import { describe, expect, it, vi } from 'vitest'
import { PageHeader } from './PageHeader'

const TABS = ['Overview', 'Topics'] as const

describe('PageHeader', () => {
  it('groups the page identity, tabs, middle controls, and action in one semantic header', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    const { container } = render(
      <PageHeader
        title="Topics"
        titleMeta={<span>May 2 – Jun 1</span>}
        tabs={TABS}
        activeTab="Overview"
        onTabChange={onTabChange}
        tablistLabel="Topic analysis views"
        middle={<div>Channel controls</div>}
        actions={<button type="button">Ask AI about this page</button>}
      />,
    )

    const header = container.querySelector<HTMLElement>('[data-slot="page-header"]')!
    const scoped = within(header)
    expect(header.tagName).toBe('HEADER')
    expect(scoped.getByRole('heading', { level: 1, name: 'Topics' })).toBeVisible()
    expect(scoped.getByText('May 2 – Jun 1')).toBeVisible()
    expect(scoped.getByRole('tablist', { name: 'Topic analysis views' })).toBeVisible()
    expect(scoped.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(header.querySelector('[data-slot="page-header-middle"]')).toHaveTextContent(
      'Channel controls',
    )

    await user.click(scoped.getByRole('tab', { name: 'Topics' }))
    expect(onTabChange).toHaveBeenCalledWith('Topics')
  })

  it('owns the canonical sticky geometry and tab treatment', () => {
    const { container } = render(
      <PageHeader
        title="Topics"
        tabs={TABS}
        activeTab="Overview"
        onTabChange={() => undefined}
        tablistLabel="Topic analysis views"
        actions={<button type="button">Ask AI about this page</button>}
      />,
    )

    const header = container.querySelector<HTMLElement>('[data-slot="page-header"]')!
    const scoped = within(header)
    expect(header).toHaveClass(
      'sticky',
      'top-0',
      'z-10',
      'h-[92px]',
      'rounded-t-[26px]',
      'bg-white/95',
      'px-16',
      'pb-4',
      'pt-8',
      'backdrop-blur-md',
    )
    expect(scoped.getByRole('heading', { name: 'Topics' })).toHaveClass(
      'text-[20px]',
      'font-semibold',
      'text-ink',
    )
    expect(header.querySelector('[data-slot="page-header-divider"]')).toHaveClass(
      'bg-surface-border',
    )
    expect(scoped.getByRole('tab', { name: 'Overview' })).toHaveClass('border-ink', 'text-ink')
    expect(scoped.getByRole('tab', { name: 'Topics' })).toHaveClass(
      'border-transparent',
      'text-ink-muted',
    )
  })

  it('turns the title into the control for the untabbed home view', async () => {
    const user = userEvent.setup()
    const onTitleClick = vi.fn()
    render(
      <PageHeader
        title="Automations"
        tabs={TABS}
        activeTab={null}
        onTabChange={() => undefined}
        onTitleClick={onTitleClick}
        tablistLabel="Automation insights"
        actions={<button type="button">Ask AI about this page</button>}
      />,
    )

    const title = screen.getByRole('button', { name: 'Automations' })
    expect(screen.getByRole('heading', { level: 1, name: 'Automations' })).toBeVisible()
    expect(title).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('tab').every((tab) => tab.getAttribute('aria-selected') === 'false'))
      .toBe(true)

    await user.click(title)
    expect(onTitleClick).toHaveBeenCalledTimes(1)
  })

  it('releases the title control once a tab owns the view', () => {
    render(
      <PageHeader
        title="Automations"
        tabs={TABS}
        activeTab="Topics"
        onTabChange={() => undefined}
        onTitleClick={() => undefined}
        tablistLabel="Automation insights"
        actions={<button type="button">Ask AI about this page</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Automations' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('tab', { name: 'Topics' })).toHaveAttribute('aria-selected', 'true')
  })

  it('leaves the title as plain text when it is not a control', () => {
    render(
      <PageHeader
        title="Topics"
        tabs={TABS}
        activeTab="Overview"
        onTabChange={() => undefined}
        tablistLabel="Topic analysis views"
      />,
    )

    expect(screen.queryByRole('button', { name: 'Topics' })).not.toBeInTheDocument()
  })

  it('omits the divider and tab list when there is no tab contract', () => {
    render(<PageHeader title="AI QA" actions={<button>Ask AI about this page</button>} />)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="page-header-divider"]')).toBeNull()
  })

  it('renders a visible Flora-blue outline when each tab receives keyboard focus', async () => {
    const user = userEvent.setup()
    render(
      <PageHeader
        title="Topics"
        tabs={TABS}
        activeTab="Overview"
        onTabChange={() => undefined}
        tablistLabel="Topic analysis views"
        actions={<button type="button">Ask AI about this page</button>}
      />,
    )

    const tabs = screen.getAllByRole('tab')
    const compiler = await compile('@theme { --color-flora-blue: #406cc4; } @tailwind utilities;')
    const css = compiler.build(tabs.flatMap((tab) => tab.className.split(/\s+/)))
    const focusDeclarations = Array.from(
      css.matchAll(/&:focus-visible\s*\{([^}]*)\}/g),
      ([, declarations]) => declarations,
    ).join('\n')

    expect(focusDeclarations).toContain('outline-style: solid;')
    expect(focusDeclarations).toContain('outline-width: 2px;')
    expect(focusDeclarations).toContain('outline-offset: 2px;')
    expect(focusDeclarations).toContain('outline-color: var(--color-flora-blue);')

    for (const tab of tabs) {
      await user.tab()
      expect(tab).toHaveFocus()
    }
  })
})
