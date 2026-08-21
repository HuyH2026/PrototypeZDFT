import { expect, test } from '@playwright/test'

test('contains both realized impact tables within their shells', async ({ page }) => {
  await page.goto('/insights/automations')
  await page.getByRole('tab', { name: 'Realized impact' }).click()

  const tableWrap = page.locator('[data-testid="view-realized-impact"] [data-slot="table-wrap"]')
  const agentWidths = await tableWrap.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(agentWidths.scrollWidth).toBeLessThanOrEqual(agentWidths.clientWidth)

  await page.getByRole('tab', { name: 'Content snippets' }).click()
  await expect(page.getByRole('tab', { name: 'Content snippets' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByText('Refund Processing Ti...')).toBeVisible()
  const contentSnippetWidths = await tableWrap.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(contentSnippetWidths.scrollWidth).toBeLessThanOrEqual(contentSnippetWidths.clientWidth)
})
