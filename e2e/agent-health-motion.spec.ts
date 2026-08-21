import { expect, test, type Page } from '@playwright/test'

const MIDPOINT_MS = 130

type HealthGeometry = {
  health: { height: number; top: number; bottom: number }
  lowestMetricBottom: number
  nextWidgetTop: number
  clearance: number
}

async function healthGeometry(page: Page): Promise<HealthGeometry> {
  return page.evaluate(() => {
    const health = document.querySelector<HTMLElement>('[data-testid="card-health"]')
    const widget = health?.parentElement?.parentElement
    const nextWidget = widget?.nextElementSibling
    const metrics = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="health-metric"]'),
    )

    if (!health || !nextWidget || metrics.length !== 4) {
      throw new Error('Agent health widget geometry is unavailable')
    }

    const healthRect = health.getBoundingClientRect()
    const nextWidgetTop = nextWidget.getBoundingClientRect().top
    const lowestMetricBottom = Math.max(
      ...metrics.map((metric) => metric.getBoundingClientRect().bottom),
    )

    return {
      health: {
        height: healthRect.height,
        top: healthRect.top,
        bottom: healthRect.bottom,
      },
      lowestMetricBottom,
      nextWidgetTop,
      clearance: nextWidgetTop - lowestMetricBottom,
    }
  })
}

async function finishActiveAnimations(page: Page) {
  await page.clock.runFor(200)
}

test('keeps the next dashboard widget clear at the layout-motion midpoint', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-08-12T12:00:00Z') })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.clock.pauseAt(await page.evaluate(() => Date.now()))

  const breakdown = page.getByRole('checkbox', { name: /channel breakdown/i })
  const expanded = await healthGeometry(page)

  await breakdown.evaluate((element: HTMLInputElement) => element.click())
  await page.clock.runFor(MIDPOINT_MS)
  const collapse = await healthGeometry(page)
  expect(
    collapse.clearance,
    `collapse midpoint geometry: ${JSON.stringify(collapse)}`,
  ).toBeGreaterThanOrEqual(0)

  await finishActiveAnimations(page)
  const compact = await healthGeometry(page)
  expect(collapse.health.height).toBeLessThan(expanded.health.height)
  expect(collapse.health.height).toBeGreaterThan(compact.health.height)

  await breakdown.evaluate((element: HTMLInputElement) => element.click())
  await page.clock.runFor(MIDPOINT_MS)
  const expansion = await healthGeometry(page)
  expect(
    expansion.clearance,
    `expansion midpoint geometry: ${JSON.stringify(expansion)}`,
  ).toBeGreaterThanOrEqual(0)
  expect(expansion.health.height).toBeGreaterThan(compact.health.height)
  expect(expansion.health.height).toBeLessThan(expanded.health.height)

  await finishActiveAnimations(page)
  const expandedAgain = await healthGeometry(page)
  expect(expandedAgain.health.height).toBeCloseTo(expanded.health.height, 0)
})
