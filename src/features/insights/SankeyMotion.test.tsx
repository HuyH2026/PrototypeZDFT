import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FlowSankey } from './ai-performances/FlowSankey'
import { ConversationFlowSection } from './cx-journey/ConversationFlowSection'

class ImmediateResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(element: Element) {
    this.callback(
      [
        {
          target: element,
          contentRect: { width: 900, height: 260 },
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

function expectOrchestratedSankey(svg: SVGSVGElement) {
  const ribbons = svg.querySelectorAll('[data-sankey-ribbon]')
  const sheen = svg.querySelectorAll('[data-sankey-sheen]')
  const nodes = svg.querySelectorAll('[data-sankey-node]')
  const labels = svg.querySelectorAll('[data-sankey-label]')

  expect(ribbons.length).toBeGreaterThan(0)
  expect(sheen).toHaveLength(ribbons.length)
  expect(nodes.length).toBeGreaterThan(0)
  expect(labels.length).toBeGreaterThan(0)
  expect(
    Array.from(ribbons).every((ribbon) => ribbon.getAttribute('style')?.includes('--sankey-order')),
  ).toBe(true)
}

function numericAttribute(element: Element, name: string) {
  const value = element.getAttribute(name)
  expect(value).not.toBeNull()
  return Number(value)
}

describe('Sankey motion treatment', () => {
  beforeEach(() => {
    globalThis.ResizeObserver = ImmediateResizeObserver as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('orchestrates the Agent Overview conversation flow', () => {
    render(<FlowSankey />)

    const svg = screen.getByRole('img', {
      name: 'Conversation flow by channel and resolution',
    }) as unknown as SVGSVGElement
    expectOrchestratedSankey(svg)
  })

  it('orchestrates the legacy conversation handling flow consistently', () => {
    render(<ConversationFlowSection />)

    const svg = screen.getByRole('img', {
      name: 'Conversation handling flow',
    }) as unknown as SVGSVGElement
    expectOrchestratedSankey(svg)
  })

  it('keeps the Agent Overview pills compact and anchored to each node center', () => {
    render(<FlowSankey />)

    const svg = screen.getByRole('img', {
      name: 'Conversation flow by channel and resolution',
    }) as unknown as SVGSVGElement
    const nodes = Array.from(svg.querySelectorAll('[data-sankey-node]'))
    const labels = Array.from(svg.querySelectorAll('[data-sankey-label]'))

    expect(labels).toHaveLength(nodes.length)
    nodes.forEach((node, index) => {
      const label = labels[index]
      const background = label.querySelector('rect')
      const text = label.querySelector('text')
      expect(background).not.toBeNull()
      expect(text).not.toBeNull()

      const nodeX = numericAttribute(node, 'x')
      const nodeY = numericAttribute(node, 'y')
      const nodeWidth = numericAttribute(node, 'width')
      const nodeHeight = numericAttribute(node, 'height')
      const labelX = numericAttribute(background as SVGRectElement, 'x')
      const labelY = numericAttribute(background as SVGRectElement, 'y')
      const labelWidth = numericAttribute(background as SVGRectElement, 'width')
      const labelHeight = numericAttribute(background as SVGRectElement, 'height')

      expect(labelY + labelHeight / 2).toBeCloseTo(nodeY + nodeHeight / 2, 5)
      if (index === nodes.length - 1) {
        expect(labelX + labelWidth).toBeCloseTo(nodeX - 6, 5)
      } else {
        expect(labelX).toBeCloseTo(nodeX + nodeWidth + 6, 5)
      }
      expect(numericAttribute(text as SVGTextElement, 'font-size')).toBe(10)
    })
  })

  it('centers the legacy name and value stack beside each node', () => {
    render(<ConversationFlowSection />)

    const svg = screen.getByRole('img', {
      name: 'Conversation handling flow',
    }) as unknown as SVGSVGElement
    const nodes = Array.from(svg.querySelectorAll('[data-sankey-node]'))
    const labels = Array.from(svg.querySelectorAll('[data-sankey-label]'))

    expect(labels).toHaveLength(nodes.length)
    nodes.forEach((node, index) => {
      const [name, value] = Array.from(labels[index].querySelectorAll('text'))
      const nodeX = numericAttribute(node, 'x')
      const nodeY = numericAttribute(node, 'y')
      const nodeWidth = numericAttribute(node, 'width')
      const nodeHeight = numericAttribute(node, 'height')
      const centerY = nodeY + nodeHeight / 2

      expect(numericAttribute(name, 'y')).toBeCloseTo(centerY - 3, 5)
      expect(numericAttribute(value, 'y')).toBeCloseTo(centerY + 11, 5)
      expect(numericAttribute(name, 'font-size')).toBe(10)
      expect(numericAttribute(value, 'font-size')).toBe(12)
      if (index === nodes.length - 1) {
        expect(numericAttribute(name, 'x')).toBeCloseTo(nodeX - 6, 5)
        expect(name.getAttribute('text-anchor')).toBe('end')
      } else {
        expect(numericAttribute(name, 'x')).toBeCloseTo(nodeX + nodeWidth + 6, 5)
        expect(name.getAttribute('text-anchor')).toBe('start')
      }
    })
  })
})
