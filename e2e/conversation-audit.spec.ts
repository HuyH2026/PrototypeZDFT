import { expect, test } from '@playwright/test'

// Insights → Agent Overview → Conversations → Widget. Covers the four drawer
// states the audit trail introduces plus one filtered view; the unit tests cover
// the logic, so this is here to prove it survives a real browser and a real
// scroll container.
const openWidgetConversations = async (page: import('@playwright/test').Page) => {
  await page.goto('/insights/agent-overview')
  await page.getByRole('tab', { name: 'Conversations' }).click()
  await page.getByRole('tab', { name: 'Widget' }).click()
}

const openRow = async (page: import('@playwright/test').Page, query: string) => {
  await page.getByRole('button').filter({ hasText: query }).first().click()
}

test('a failing conversation explains itself and Go to it lands on the evidence', async ({ page }) => {
  await openWidgetConversations(page)
  await openRow(page, 'Abnormal bank statement')

  const drawer = page.getByRole('dialog', { name: 'Conversation Details' })
  await expect(drawer.getByText('Partial failure')).toBeVisible()
  await expect(drawer.getByText('1 error').first()).toBeVisible()
  await expect(drawer.getByText('Fallback delivered').first()).toBeVisible()
  await expect(drawer.getByText('Configuration').first()).toBeVisible()

  await drawer.getByRole('button', { name: 'Go to it' }).click()
  const evidence = drawer.getByText('the account identifier was unavailable', { exact: false })
  await expect(evidence).toBeVisible()
  await expect(drawer.getByText('Events:')).toHaveCount(0)
})

test('an unresolved conversation names the triage owner', async ({ page }) => {
  await openWidgetConversations(page)
  await openRow(page, 'How do I withdraw my investments')
  const drawer = page.getByRole('dialog', { name: 'Conversation Details' })
  await expect(drawer.getByText('Unresolved')).toBeVisible()
  await expect(drawer.getByText('Unassigned / needs triage').first()).toBeVisible()
  await expect(drawer.getByText('Delivery unknown').first()).toBeVisible()
})

test('a healthy conversation stays quiet but still reports its impact', async ({ page }) => {
  await openWidgetConversations(page)
  await openRow(page, 'Withdraw funds')
  const drawer = page.getByRole('dialog', { name: 'Conversation Details' })
  await expect(drawer.getByRole('button', { name: 'Go to it' })).toHaveCount(0)
  await expect(drawer.getByText('Answer delivered')).toBeVisible()
  await expect(drawer.getByRole('button', { name: /Show evidence/ }).first()).toBeVisible()
})

test('the evidence filter narrows to the failing exchange and clears again', async ({ page }) => {
  await openWidgetConversations(page)
  await openRow(page, 'Abnormal bank statement')
  const drawer = page.getByRole('dialog', { name: 'Conversation Details' })

  await drawer.getByRole('button', { name: /^Evidence/ }).click()
  const menu = drawer.getByRole('menu')
  await expect(menu.getByRole('menuitem', { name: /Tools/ })).toBeDisabled()
  await menu.getByRole('menuitem', { name: /Errors/ }).click()
  await expect(drawer.getByTestId('exchange-1')).toBeVisible()
  await expect(drawer.getByTestId('exchange-0')).toHaveCount(0)

  await drawer.getByRole('button', { name: /^Errors/ }).click()
  await drawer.getByRole('menu').getByRole('menuitem', { name: /Errors/ }).click()
  await expect(drawer.getByTestId('exchange-0')).toBeVisible()
})

test('Voice is untouched: no State column, no Errors only, and it keeps its Events list', async ({ page }) => {
  await page.goto('/insights/agent-overview')
  await page.getByRole('tab', { name: 'Conversations' }).click()
  await page.getByRole('tab', { name: 'Voice' }).click()
  await expect(page.getByRole('columnheader', { name: 'State' })).toHaveCount(0)
  await expect(page.getByRole('checkbox', { name: 'Errors only' })).toHaveCount(0)
  await openRow(page, 'Abnormal bank statement')
  const drawer = page.getByRole('dialog', { name: 'Conversation Details' })
  await expect(drawer.getByText('Events:')).toBeVisible()
  await expect(drawer.getByRole('button', { name: /Show evidence/ })).toHaveCount(0)
})
