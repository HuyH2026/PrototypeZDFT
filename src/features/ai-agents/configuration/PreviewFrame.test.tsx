import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewFrame } from './PreviewFrame'

function renderFrame(props: Partial<Parameters<typeof PreviewFrame>[0]> = {}) {
  return render(
    <PreviewFrame mark="Uber" title="Uber Rider Support" accent="#000000" {...props}>
      <p>conversation</p>
    </PreviewFrame>,
  )
}

describe('PreviewFrame', () => {
  it('shows the static composer pill by default', () => {
    renderFrame()
    expect(screen.getByText('Ask a question…')).toBeInTheDocument()
  })

  it('renders a caller-supplied composer in place of the static pill', () => {
    renderFrame({ composer: <input aria-label="Ask a question" /> })
    expect(screen.getByLabelText('Ask a question')).toBeInTheDocument()
    expect(screen.queryByText('Ask a question…')).not.toBeInTheDocument()
  })

  it('keeps its fixed panel size by default', () => {
    renderFrame()
    // jsdom cannot resolve Tailwind sizing; assert the class contract instead.
    const frame = screen.getByTestId('widget-preview-frame')
    expect(frame.className).toContain('h-[640px]')
    expect(frame.className).toContain('w-[382px]')
  })

  it('lets a caller override the size through className', () => {
    renderFrame({ className: 'h-full w-[436px]' })
    const frame = screen.getByTestId('widget-preview-frame')
    expect(frame.className).toContain('w-[436px]')
    expect(frame.className).not.toContain('w-[382px]')
  })
})
