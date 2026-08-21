import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { TestSuiteView } from './TestSuiteView'
import { TEST_CASES, TEST_RUNS } from './test-suite-data'

function renderView() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <BrandProvider>
            <AiAssistantProvider>
              <TestSuiteView />
            </AiAssistantProvider>
          </BrandProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('TestSuiteView', () => {
  it('renders the header, tabs, stat cards, and toolbar', () => {
    renderView()
    const view = within(screen.getByTestId('view-test-suite'))
    expect(view.getByRole('heading', { name: 'Test suite' })).toBeInTheDocument()
    // Test cases is the open tab; Runs is available but not selected.
    expect(view.getByRole('tab', { name: 'Test cases' })).toHaveAttribute('aria-selected', 'true')
    expect(view.getByRole('tab', { name: 'Runs' })).toHaveAttribute('aria-selected', 'false')
    // Stat cards — scoped, since "Pass Rate" is also a table column header.
    const stats = within(screen.getByTestId('test-suite-stats'))
    expect(stats.getByText('Pass Rate')).toBeInTheDocument()
    expect(stats.getByText('63%')).toBeInTheDocument()
    expect(stats.getByText('49')).toBeInTheDocument()
    expect(stats.getByText('/ 78')).toBeInTheDocument()
    expect(stats.getByText('Agent Coverage')).toBeInTheDocument()
    // Toolbar.
    expect(view.getByRole('button', { name: 'New Test Case' })).toBeInTheDocument()
    expect(view.getByText('Select tests to run or delete')).toBeInTheDocument()
  })

  it('renders every test case with its use case, last run, and pass rate', () => {
    renderView()
    const view = within(screen.getByTestId('view-test-suite'))
    const testCasesHeader = screen.getByRole('columnheader', { name: /Test Cases/ })
    expect(testCasesHeader).toHaveClass('px-3.5', 'py-3.5')
    expect(testCasesHeader).not.toHaveClass('py-2.5')
    expect(screen.getByRole('columnheader', { name: 'Select all test cases' })).not.toHaveClass(
      'py-2.5',
    )
    expect(view.getByText(`Test Cases (${TEST_CASES.length})`)).toBeInTheDocument()
    for (const t of TEST_CASES) expect(view.getByText(t.name)).toBeInTheDocument()
    expect(view.getByText('Airline processing')).toBeInTheDocument()
    expect(view.getByText('Withdrawals')).toBeInTheDocument()
    // Two cases failed their last run, three passed.
    expect(view.getAllByText('Failed')).toHaveLength(2)
    expect(view.getAllByText('Passed')).toHaveLength(3)
    expect(view.getByText('78%')).toBeInTheDocument()
    expect(view.getByText('0%')).toBeInTheDocument()
  })

  it('reports the selection count as rows are checked', async () => {
    const user = userEvent.setup()
    renderView()
    const view = within(screen.getByTestId('view-test-suite'))
    await user.click(view.getByRole('checkbox', { name: `Select ${TEST_CASES[0].name}` }))
    expect(view.getByText('1 test selected')).toBeInTheDocument()
    await user.click(view.getByRole('checkbox', { name: `Select ${TEST_CASES[1].name}` }))
    expect(view.getByText('2 tests selected')).toBeInTheDocument()
    // Unchecking the last one returns the hint to its resting copy.
    await user.click(view.getByRole('checkbox', { name: `Select ${TEST_CASES[1].name}` }))
    await user.click(view.getByRole('checkbox', { name: `Select ${TEST_CASES[0].name}` }))
    expect(view.getByText('Select tests to run or delete')).toBeInTheDocument()
  })

  it('select-all checks every row, and clicking it again clears them', async () => {
    const user = userEvent.setup()
    renderView()
    const view = within(screen.getByTestId('view-test-suite'))
    const selectAll = view.getByRole('checkbox', { name: 'Select all test cases' })
    await user.click(selectAll)
    expect(view.getByText(`${TEST_CASES.length} tests selected`)).toBeInTheDocument()
    for (const t of TEST_CASES) {
      expect(view.getByRole('checkbox', { name: `Select ${t.name}` })).toBeChecked()
    }
    await user.click(selectAll)
    expect(view.getByText('Select tests to run or delete')).toBeInTheDocument()
  })

  it('marks select-all indeterminate while only some rows are checked', async () => {
    const user = userEvent.setup()
    renderView()
    const view = within(screen.getByTestId('view-test-suite'))
    await user.click(view.getByRole('checkbox', { name: `Select ${TEST_CASES[0].name}` }))
    const selectAll = view.getByRole('checkbox', {
      name: 'Select all test cases',
    }) as HTMLInputElement
    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll.checked).toBe(false)
  })

  it('switches to the populated Runs tab', async () => {
    const user = userEvent.setup()
    renderView()
    const view = within(screen.getByTestId('view-test-suite'))
    await user.click(view.getByRole('tab', { name: 'Runs' }))
    expect(view.getByRole('tab', { name: 'Runs' })).toHaveAttribute('aria-selected', 'true')
    const stats = within(screen.getByTestId('run-stats'))
    expect(stats.getByText('Total Runs')).toBeInTheDocument()
    expect(stats.getByText('114')).toBeInTheDocument()
    expect(stats.getByText('72')).toBeInTheDocument()
    expect(stats.getByText('(63%)')).toBeInTheDocument()
    expect(stats.getByText('42')).toBeInTheDocument()
    expect(view.getByText('Select to rerun or delete')).toBeInTheDocument()
    for (const run of TEST_RUNS) expect(view.getByText(run.testCase)).toBeInTheDocument()
    expect(view.getByText('In progress')).toBeInTheDocument()
    expect(view.getAllByText('Passed')).toHaveLength(3)
    expect(view.getAllByText('Failed')).toHaveLength(2)
    // The test-cases content is gone, not merely hidden.
    expect(view.queryByText(TEST_CASES[0].name)).not.toBeInTheDocument()
    expect(screen.queryByTestId('test-suite-stats')).not.toBeInTheDocument()
  })

  it('opens the create flow and requires a use case before continuing', async () => {
    const user = userEvent.setup()
    renderView()

    await user.click(screen.getByRole('button', { name: 'New Test Case' }))
    const dialog = screen.getByRole('dialog', { name: 'Create Test Case' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Generate Test Cases' })).toBeDisabled()

    await user.click(within(dialog).getByRole('combobox', { name: 'Use Cases' }))
    const picker = screen.getByRole('dialog', { name: 'Select use cases' })
    expect(within(picker).getByRole('button', { name: /Use case C/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(within(picker).getByRole('button', { name: 'Apply' }))

    const updatedDialog = screen.getByRole('dialog', { name: 'Create Test Case' })
    expect(within(updatedDialog).getByRole('combobox', { name: 'Use Cases' })).toHaveTextContent(
      'Use case C',
    )
    expect(within(updatedDialog).getByRole('button', { name: 'Generate Test Cases' })).toBeEnabled()
  })

  it('supports manual creation, preview, and local save', async () => {
    const user = userEvent.setup()
    renderView()

    await user.click(screen.getByRole('button', { name: 'New Test Case' }))
    await user.click(screen.getByRole('combobox', { name: 'Use Cases' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Create Test Cases' }))

    expect(screen.getByTestId('test-case-editor')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plan upgrade' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByTestId('test-case-preview')).toBeInTheDocument()
    expect(screen.getByText(/Test Case Run: Apr 12, 2024/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const view = within(screen.getByTestId('view-test-suite'))
    expect(view.getByText('Test Cases (6)')).toBeInTheDocument()
    expect(view.getByText('Plan upgrade')).toBeInTheDocument()
    expect(view.getByText('Not run')).toBeInTheDocument()
  })

  it('continues generated suggestions into the editor before saving', async () => {
    const user = userEvent.setup()
    renderView()

    await user.click(screen.getByRole('button', { name: 'New Test Case' }))
    await user.click(screen.getByRole('combobox', { name: 'Use Cases' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Generate Test Cases' }))

    expect(screen.getByRole('dialog', { name: 'Generating test cases' })).toBeInTheDocument()
    const generated = await screen.findByRole(
      'dialog',
      { name: 'Generated test cases' },
      { timeout: 2_000 },
    )
    expect(within(generated).getByText('Trial expired')).toBeInTheDocument()
    expect(within(generated).getByText('Upgrade to unlock a feature')).toBeInTheDocument()
    await user.click(within(generated).getByRole('button', { name: 'Create Test Cases (2)' }))

    expect(screen.getByTestId('test-case-editor')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plan upgrade' })).toBeInTheDocument()
    expect(screen.queryByTestId('view-test-suite')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    const view = within(screen.getByTestId('view-test-suite'))
    expect(view.getByText('Test Cases (6)')).toBeInTheDocument()
    expect(view.getByText('Plan upgrade')).toBeInTheDocument()
  })
})
