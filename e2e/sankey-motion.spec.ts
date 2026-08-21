import { expect, test } from '@playwright/test'

type SankeyMotionState = {
  ribbonAnimation: string
  nodeAnimation: string
  labelAnimation: string
  sheenDisplay: string
}

test('orchestrates the Sankey entrance and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/insights/agent-overview')

  const chart = page.locator('[data-testid="conversation-flow"] .sankey-chart')
  await expect(chart).toBeVisible()

  const active = await chart.evaluate<SankeyMotionState>((svg) => ({
    ribbonAnimation: getComputedStyle(svg.querySelector('.sankey-ribbon') as SVGPathElement)
      .animationName,
    nodeAnimation: getComputedStyle(svg.querySelector('.sankey-node') as SVGRectElement)
      .animationName,
    labelAnimation: getComputedStyle(svg.querySelector('.sankey-label') as SVGGElement)
      .animationName,
    sheenDisplay: getComputedStyle(svg.querySelector('.sankey-sheen-layer') as SVGGElement).display,
  }))

  expect(active.ribbonAnimation).toContain('sankeyRibbonIn')
  expect(active.nodeAnimation).toContain('sankeyNodeIn')
  expect(active.labelAnimation).toContain('sankeyLabelIn')
  expect(active.sheenDisplay).not.toBe('none')

  await page.emulateMedia({ reducedMotion: 'reduce' })

  const reduced = await chart.evaluate<SankeyMotionState>((svg) => ({
    ribbonAnimation: getComputedStyle(svg.querySelector('.sankey-ribbon') as SVGPathElement)
      .animationName,
    nodeAnimation: getComputedStyle(svg.querySelector('.sankey-node') as SVGRectElement)
      .animationName,
    labelAnimation: getComputedStyle(svg.querySelector('.sankey-label') as SVGGElement)
      .animationName,
    sheenDisplay: getComputedStyle(svg.querySelector('.sankey-sheen-layer') as SVGGElement).display,
  }))

  expect(reduced.ribbonAnimation).toBe('none')
  expect(reduced.nodeAnimation).toBe('none')
  expect(reduced.labelAnimation).toBe('none')
  expect(reduced.sheenDisplay).toBe('none')
})
