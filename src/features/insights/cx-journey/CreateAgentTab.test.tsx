import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CreateAgentTab } from './CreateAgentTab'
import { AUTOMATION_DETAILS } from './automation-data'

describe('CreateAgentTab', () => {
  it('renders summary stats, training-phrase rows, and key phrases', () => {
    render(
      <CreateAgentTab
        detail={AUTOMATION_DETAILS['Reactivate account']}
        selectedRows={new Set()}
        onToggleRow={() => {}}
      />,
    )
    expect(screen.getByText('3,144')).toBeInTheDocument()
    expect(screen.getByText('Refund not received')).toBeInTheDocument()
    expect(screen.getByText('"I want my money back"')).toBeInTheDocument()
  })
})
