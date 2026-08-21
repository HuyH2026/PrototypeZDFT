import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AGENT_PLAN, blockAnswerField, blockPromptField } from './agent-plan-data'
import { PlanRefChip } from './PlanRefChip'
import { PlanPolicyBlockCard } from './PlanPolicyBlockCard'

const FORM_BLOCK = AGENT_PLAN.agent.policy.flatMap((n) => (n.kind === 'block' ? [n] : []))[0]
const OPTIONS_BLOCK = AGENT_PLAN.agent.policy.flatMap((n) => (n.kind === 'block' ? [n] : []))[1]

const noEdits = { resolve: (_id: string, original: string) => original, onEdit: vi.fn() }

describe('PlanRefChip', () => {
  it('renders a linked action as a button and reports the action id', async () => {
    const onOpenAction = vi.fn()
    render(<PlanRefChip refKind="action" label="getAccountProfile" actionId="get-account-profile" onOpenAction={onOpenAction} />)
    await userEvent.click(screen.getByRole('button', { name: 'getAccountProfile' }))
    expect(onOpenAction).toHaveBeenCalledWith('get-account-profile')
  })

  it('says an unlinked reference will be created, as a row', () => {
    render(<PlanRefChip refKind="action" label="Process Cancellation" variant="row" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('will be created')).toBeInTheDocument()
  })

  it('keeps an inline reference to plain text with the promise in its title', () => {
    render(<PlanRefChip refKind="variable" label="$is_vip" />)
    expect(screen.queryByText('will be created')).not.toBeInTheDocument()
    expect(screen.getByText('$is_vip')).toHaveAttribute(
      'title',
      '$is_vip will be created when the plan is approved',
    )
  })

  it('does not link an action when the panel gave it no handler', () => {
    render(<PlanRefChip refKind="action" label="getAccountProfile" actionId="get-account-profile" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('PlanPolicyBlockCard', () => {
  it('renders the Form preview: kind, badge, heading, prompt and its form fields', () => {
    render(<PlanPolicyBlockCard nodeId={FORM_BLOCK.id} block={FORM_BLOCK.block} edit={noEdits} />)
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.getByText('Reason for cancellation')).toBeInTheDocument()
    expect(screen.getByText('Forms')).toBeInTheDocument()
    expect(screen.getByText('Cancellation reason')).toBeInTheDocument()
    expect(screen.getByText('Please fill out the fields to select your cancellation reason.')).toBeInTheDocument()
    expect(screen.getByText('Form fields:')).toBeInTheDocument()
    expect(screen.getByText('$Email, $BillingZipCode, $SelectedReason')).toBeInTheDocument()
  })

  it('renders the Options preview: numbered answers, each with a check', () => {
    render(<PlanPolicyBlockCard nodeId={OPTIONS_BLOCK.id} block={OPTIONS_BLOCK.block} edit={noEdits} />)
    expect(screen.getByText('Options')).toBeInTheDocument()
    expect(screen.getByText('Do you want a 30 day free trial?')).toBeInTheDocument()
    const answers = screen.getAllByTestId('plan-block-answer')
    expect(answers.map((a) => a.textContent)).toEqual(['1.Yes', '2.No'])
    expect(screen.getAllByTestId('plan-answer-check')).toHaveLength(2)
  })

  it('shows no Form fields line on an options block, and no answers on a form block', () => {
    const { unmount } = render(<PlanPolicyBlockCard nodeId={OPTIONS_BLOCK.id} block={OPTIONS_BLOCK.block} edit={noEdits} />)
    expect(screen.queryByText('Form fields:')).not.toBeInTheDocument()
    unmount()
    render(<PlanPolicyBlockCard nodeId={FORM_BLOCK.id} block={FORM_BLOCK.block} edit={noEdits} />)
    expect(screen.queryAllByTestId('plan-block-answer')).toHaveLength(0)
  })

  it('commits an edited options prompt on blur, with its original for comparison', async () => {
    const onEdit = vi.fn()
    render(
      <PlanPolicyBlockCard
        nodeId={OPTIONS_BLOCK.id}
        block={OPTIONS_BLOCK.block}
        edit={{ resolve: (_id, original) => original, onEdit }}
      />,
    )
    const prompt = screen.getByText('Do you want a 30 day free trial?')
    await userEvent.click(prompt)
    await userEvent.tab()
    expect(onEdit).toHaveBeenCalledWith(
      blockPromptField(OPTIONS_BLOCK.id),
      'Do you want a 30 day free trial?',
      'Do you want a 30 day free trial?',
    )
  })

  it('shows an edited answer instead of the authored one', () => {
    render(
      <PlanPolicyBlockCard
        nodeId={OPTIONS_BLOCK.id}
        block={OPTIONS_BLOCK.block}
        edit={{
          resolve: (id, original) => (id === blockAnswerField(OPTIONS_BLOCK.id, 1) ? 'No thanks' : original),
          onEdit: vi.fn(),
        }}
      />,
    )
    expect(screen.getByText('No thanks')).toBeInTheDocument()
    expect(screen.queryByText('No')).not.toBeInTheDocument()
  })

  it('leaves the form card read-only — its prompt is not editable', () => {
    render(<PlanPolicyBlockCard nodeId={FORM_BLOCK.id} block={FORM_BLOCK.block} edit={noEdits} />)
    const prompt = screen.getByText('Please fill out the fields to select your cancellation reason.')
    expect(prompt).not.toHaveAttribute('contenteditable', 'true')
  })
})
