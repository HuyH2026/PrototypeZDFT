import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiStudioConversation } from './AiStudioConversation'
import type { AiConversationSeed } from './ai-context-registry'
import type { ThinkingPace } from './thinking-pace'

const SEED: AiConversationSeed = {
  title: 'Tickets reopened',
  messages: [
    {
      id: 'seed-assistant',
      role: 'assistant',
      text: 'Reopened tickets increased 18%, with the rise beginning the week after Policy v2.4 was published.',
      attachments: [
        {
          type: 'chart',
          title: 'Tickets reopened',
          series: [
            { x: 'Jul 1', value: 10 },
            { x: 'Jul 28', value: 47 },
          ],
          annotation: 'Policy v2.4 published Jul 21',
          peak: '47 reopened tickets on Jul 28',
        },
        {
          type: 'list',
          title: 'What we found',
          items: ['61% of the increase came from Billing conversations.'],
          footnote: 'Evidence: 842 conversations',
        },
      ],
      recommendations: ['Explain this change', 'Break down by intent', 'Compare agents'],
    },
  ],
  responses: {
    'Explain this change': {
      text: 'It started after Policy v2.4 shipped.',
      recommendations: ['What should I fix first?'],
    },
    'Break down by intent': {
      text: "Here's the breakdown by intent.",
      attachments: [
        {
          type: 'breakdown',
          title: 'By intent',
          rows: [{ label: 'Subscription cancellation eligibility', value: '61%' }],
        },
      ],
    },
    'What should I fix first?': {
      text: "This is a preview build, so I can't recommend a fix path yet.",
    },
  },
}

const SEED_WITH_ACTIONS: AiConversationSeed = {
  title: 'Tickets reopened',
  messages: [
    {
      id: 'seed-assistant',
      role: 'assistant',
      text: 'Here are the recommended fixes.',
      attachments: [
        {
          type: 'actions',
          title: 'Recommended fixes',
          items: [
            { text: 'Update the subscription-cancellation answer to reflect Policy v2.4', tag: 'High impact' },
            { text: 'Add a fallback for edge-case renewal-date questions', tag: 'Quick fix' },
          ],
        },
      ],
    },
  ],
}

function composer() {
  return screen.getByPlaceholderText('What can I help you with today?') as HTMLInputElement
}

function body() {
  return screen.getByTestId('ai-studio-conversation-body')
}

describe('AiStudioConversation', () => {
  it('renders the seeded assistant message, its chart, and its list attachment', () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    expect(body()).toBeInTheDocument()
    expect(screen.getByText(/Reopened tickets increased 18%/)).toBeInTheDocument()
    expect(screen.getByText('Policy v2.4 published Jul 21')).toBeInTheDocument()
    expect(screen.getByText('47 reopened tickets on Jul 28')).toBeInTheDocument()
    expect(screen.getByText('What we found')).toBeInTheDocument()
    expect(screen.getByText('61% of the increase came from Billing conversations.')).toBeInTheDocument()
    expect(screen.getByText('Evidence: 842 conversations')).toBeInTheDocument()
    expect(document.querySelector('.recharts-responsive-container')).toBeTruthy()
  })

  it('renders recommendation chips from the seed message', () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    expect(screen.getByRole('button', { name: 'Explain this change' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Break down by intent' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compare agents' })).toBeInTheDocument()
  })

  it('clicking a chip with a scripted response appends that reply and its attachment, and replaces the chip row', async () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.click(screen.getByRole('button', { name: 'Break down by intent' }))
    expect(body()).toHaveTextContent('Break down by intent')
    expect(body()).toHaveTextContent("Here's the breakdown by intent.")
    expect(body()).toHaveTextContent('By intent')
    expect(body()).toHaveTextContent('Subscription cancellation eligibility')
    // round-1 chips are gone (the reply carried no recommendations)
    expect(within(body()).queryByRole('button', { name: 'Explain this change' })).not.toBeInTheDocument()
    expect(within(body()).queryByRole('button', { name: 'Compare agents' })).not.toBeInTheDocument()
  })

  it('clicking a chip whose response defines further recommendations shows the next round of chips', async () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.click(screen.getByRole('button', { name: 'Explain this change' }))
    expect(body()).toHaveTextContent('It started after Policy v2.4 shipped.')
    expect(within(body()).getByRole('button', { name: 'What should I fix first?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'What should I fix first?' }))
    expect(body()).toHaveTextContent("This is a preview build, so I can't recommend a fix path yet.")
    expect(within(body()).queryAllByRole('button', { name: /./ }).filter((b) => !b.getAttribute('aria-label'))).toEqual([])
  })

  it('clicking a chip with no scripted response falls back to the generic canned reply with no new chips', async () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.click(screen.getByRole('button', { name: 'Compare agents' }))
    expect(body()).toHaveTextContent(
      "Thanks — I'll factor that in. This is a preview build, so I can't go deeper yet.",
    )
  })

  it('typing in the composer and sending always appends the generic canned reply with no attachments or chips', async () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.type(composer(), 'what about voice channel?{Enter}')
    expect(body()).toHaveTextContent('what about voice channel?')
    expect(body()).toHaveTextContent(
      "Thanks — I'll factor that in. This is a preview build, so I can't go deeper yet.",
    )
    expect(composer().value).toBe('')
  })

  it('does not send an empty composer value', async () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.type(composer(), '   {Enter}')
    expect(body()).not.toHaveTextContent(
      "Thanks — I'll factor that in. This is a preview build, so I can't go deeper yet.",
    )
  })

  it('renders an actions attachment with each item text and tag, and no chips afterward', () => {
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={SEED_WITH_ACTIONS}
      />,
    )
    expect(screen.getByText('Recommended fixes')).toBeInTheDocument()
    expect(
      screen.getByText('Update the subscription-cancellation answer to reflect Policy v2.4'),
    ).toBeInTheDocument()
    expect(screen.getByText('High impact')).toBeInTheDocument()
    expect(screen.getByText('Add a fallback for edge-case renewal-date questions')).toBeInTheDocument()
    expect(screen.getByText('Quick fix')).toBeInTheDocument()
    // seed message carries no recommendations, so no chips render
    expect(within(body()).queryAllByRole('button', { name: /./ }).filter((b) => !b.getAttribute('aria-label'))).toEqual([])
  })

  it('calls onNewConversation when "New conversation" is clicked', async () => {
    const onNewConversation = vi.fn()
    render(
      <AiStudioConversation onClose={() => {}} onNewConversation={onNewConversation} onBranch={() => {}} conversation={SEED} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /New conversation/i }))
    expect(onNewConversation).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<AiStudioConversation onClose={onClose} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.click(screen.getByLabelText('Close AI Studio'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders a branch-off icon on the assistant bubble but not on user bubbles', async () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} />)
    await userEvent.type(composer(), 'a follow-up{Enter}')
    // one assistant message initially + the runtime canned reply = 2 assistant branch icons, 1 user message with none
    expect(screen.getAllByRole('button', { name: 'Branch off in new chat' })).toHaveLength(2)
  })

  it('clicking the branch icon calls onBranch with a seed built from that message', async () => {
    const onBranch = vi.fn()
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={onBranch} conversation={SEED} />)
    const [firstBranchButton] = screen.getAllByRole('button', { name: 'Branch off in new chat' })
    await userEvent.click(firstBranchButton)
    expect(onBranch).toHaveBeenCalledTimes(1)
    const seed = onBranch.mock.calls[0][0]
    expect(seed.title).toBe('Branch: Tickets reopened')
    expect(seed.messages).toEqual([{ ...SEED.messages[0], id: 'seed-assistant' }])
    expect(seed.responses).toBe(SEED.responses)
  })
})

const planSeed: AiConversationSeed = {
  title: 'Build a Service Cancellation agent',
  messages: [
    {
      id: 'a1',
      role: 'assistant',
      text: 'Got it — here is the proposal.',
      thinking: ['Read 30 days of tickets.', 'Ranked intents by volume.'],
      attachments: [
        { type: 'plan', title: 'Service cancellation', subtitle: 'New agent plan', actionLabel: 'Review plan' },
      ],
    },
  ],
}

describe('AiStudioConversation — plan flow additions', () => {
  it('hides scripted reasoning behind a disclosure and reveals it on click', async () => {
    const user = userEvent.setup()
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={planSeed} />)
    expect(screen.queryByText('Read 30 days of tickets.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Thinking complete/ }))
    expect(screen.getByText('Read 30 days of tickets.')).toBeInTheDocument()
    expect(screen.getByText('Ranked intents by volume.')).toBeInTheDocument()
  })

  it('reports a click on the plan card as a review-plan action', async () => {
    const user = userEvent.setup()
    const onAttachmentAction = vi.fn()
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={planSeed}
        onAttachmentAction={onAttachmentAction}
      />,
    )
    expect(screen.getByText('Service cancellation')).toBeInTheDocument()
    expect(screen.getByText('New agent plan')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Review plan' }))
    expect(onAttachmentAction).toHaveBeenCalledWith({ kind: 'review-plan' })
  })

  it('renders an owner-appended created-agent card and reports both of its routes', async () => {
    const user = userEvent.setup()
    const onAttachmentAction = vi.fn()
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={planSeed}
        onAttachmentAction={onAttachmentAction}
        extraMessages={[
          {
            id: 'created',
            role: 'assistant',
            text: 'Done — Service Cancellation exists as a draft.',
            attachments: [
              {
                type: 'agent-created',
                agentName: 'Service Cancellation',
                agentId: 'agent-7',
                status: 'Draft — not taking traffic',
                openLabel: 'Open in Agent Builder',
                testLabel: 'Run a test',
              },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText('Draft — not taking traffic')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open in Agent Builder' }))
    expect(onAttachmentAction).toHaveBeenCalledWith({ kind: 'open-agent', agentId: 'agent-7' })
    await user.click(screen.getByRole('button', { name: 'Run a test' }))
    expect(onAttachmentAction).toHaveBeenCalledWith({ kind: 'run-test' })
  })

  it('lets its owner control the composer and script the reply to a sent message', async () => {
    const user = userEvent.setup()
    const onComposerChange = vi.fn()
    const onUserMessage = vi.fn(() => ({ text: 'Updated the plan — read it again.' }))
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={planSeed}
        composerValue="Change the retention offer to…"
        onComposerChange={onComposerChange}
        onUserMessage={onUserMessage}
      />,
    )
    expect(composer().value).toBe('Change the retention offer to…')
    await user.click(screen.getByLabelText('Send message'))
    expect(onUserMessage).toHaveBeenCalledWith('Change the retention offer to…')
    expect(body()).toHaveTextContent('Updated the plan — read it again.')
    expect(onComposerChange).toHaveBeenLastCalledWith('')
  })

  it('still falls back to the canned reply when the owner scripts nothing', async () => {
    const user = userEvent.setup()
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={planSeed}
        onUserMessage={() => undefined}
      />,
    )
    await user.type(composer(), 'anything else?')
    await user.keyboard('{Enter}')
    expect(body()).toHaveTextContent('This is a preview build')
  })

  it('shows the new footer hint', () => {
    render(<AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={planSeed} />)
    expect(
      screen.getByText(
        "Press '/' to open AI Studio or 'Esc' to close anytime. You'll be notified when a conversation finishes.",
      ),
    ).toBeInTheDocument()
  })

  it('renders an owner-appended improvement-active card and reports both of its routes', async () => {
    const user = userEvent.setup()
    const onAttachmentAction = vi.fn()
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={planSeed}
        onAttachmentAction={onAttachmentAction}
        extraMessages={[
          {
            id: 'active',
            role: 'assistant',
            text: 'Done — Password Reset is on a self-improving plan.',
            attachments: [
              {
                type: 'improvement-active',
                agentName: 'Password Reset',
                agentId: 'w8',
                status: 'Week 1 of 4 · 4 auto-fixes live · 2 changes awaiting approval',
                viewLabel: 'View plan',
                openLabel: 'Open in Agent Builder',
              },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText('Password Reset')).toBeInTheDocument()
    expect(
      screen.getByText('Week 1 of 4 · 4 auto-fixes live · 2 changes awaiting approval'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View plan' }))
    expect(onAttachmentAction).toHaveBeenCalledWith({ kind: 'view-improvement-plan' })
    await user.click(screen.getByRole('button', { name: 'Open in Agent Builder' }))
    expect(onAttachmentAction).toHaveBeenCalledWith({ kind: 'open-agent', agentId: 'w8' })
  })
})

// Everything above runs on DEFAULT_PACE, which is the instant pace under test —
// so those assertions describe a transcript that is simply present. These pass a
// pace of their own to watch it arrive.
const PACED: ThinkingPace = { lineMs: 40, tailMs: 40, quietMs: 200, userTurnMs: 300 }
// Slow enough that nothing can arrive while a test interacts.
const HELD: ThinkingPace = { lineMs: 9000, tailMs: 9000, quietMs: 9000, userTurnMs: 9000 }

const twoTurnSeed: AiConversationSeed = {
  title: 'Two turns',
  messages: [
    { id: 'u1', role: 'user', text: 'Analyze my tickets' },
    { id: 'a1', role: 'assistant', text: 'Here is what stands out.', thinking: ['Read the tickets.'] },
    { id: 'u2', role: 'user', text: 'Yes, go ahead.' },
  ],
}

describe('AiStudioConversation — playing the transcript in', () => {
  it('thinks before it answers, then leaves the reasoning behind the disclosure', async () => {
    render(
      <AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={planSeed} pace={PACED} />,
    )
    expect(screen.getByTestId('assistant-thinking')).toBeInTheDocument()
    expect(body()).not.toHaveTextContent('Got it — here is the proposal.')

    expect(await screen.findByText(/Got it — here is the proposal/)).toBeInTheDocument()
    expect(screen.queryByTestId('assistant-thinking')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thinking complete/ })).toBeInTheDocument()
  })

  it('opens on the user’s own request, then paces the rest of the script', async () => {
    render(
      <AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={twoTurnSeed} pace={PACED} />,
    )
    // The opening request stands for what the user asked, so it is never paced.
    expect(body()).toHaveTextContent('Analyze my tickets')
    expect(body()).not.toHaveTextContent('Here is what stands out.')

    expect(await screen.findByText('Here is what stands out.')).toBeInTheDocument()
    // The scripted user turn waits its typing beat rather than landing with the reply.
    expect(body()).not.toHaveTextContent('Yes, go ahead.')
    expect(await screen.findByText('Yes, go ahead.')).toBeInTheDocument()
  })

  it('holds the recommendation chips back until the answer has landed', async () => {
    render(
      <AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={SEED} pace={PACED} />,
    )
    expect(screen.queryByRole('button', { name: 'Explain this change' })).not.toBeInTheDocument()
    expect(await screen.findByText(/Reopened tickets increased 18%/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Explain this change' })).toBeInTheDocument()
  })

  it('echoes a sent message at once and pauses only over the reply', async () => {
    const user = userEvent.setup()
    render(
      <AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={planSeed} pace={PACED} />,
    )
    await screen.findByText(/Got it — here is the proposal/)

    await user.type(composer(), 'what about voice?{Enter}')
    expect(body()).toHaveTextContent('what about voice?')
    expect(body()).not.toHaveTextContent('This is a preview build')

    expect(await screen.findByText(/This is a preview build/)).toBeInTheDocument()
  })

  it('shows a reply that is still arriving at once when the user sends again', async () => {
    const user = userEvent.setup()
    render(
      <AiStudioConversation onClose={() => {}} onNewConversation={() => {}} onBranch={() => {}} conversation={planSeed} pace={HELD} />,
    )
    expect(screen.getByTestId('assistant-thinking')).toBeInTheDocument()

    await user.type(composer(), 'hurry up{Enter}')
    expect(body()).toHaveTextContent('Got it — here is the proposal.')
    expect(body()).toHaveTextContent('hurry up')
  })

  it('runs a reply’s side effects when it lands, not when it was asked for', async () => {
    const user = userEvent.setup()
    const onReveal = vi.fn()
    render(
      <AiStudioConversation
        onClose={() => {}}
        onNewConversation={() => {}}
        onBranch={() => {}}
        conversation={planSeed}
        pace={PACED}
        onUserMessage={() => ({ text: 'Updated the plan.', onReveal })}
      />,
    )
    await screen.findByText(/Got it — here is the proposal/)

    await user.type(composer(), 'change the offer{Enter}')
    expect(onReveal).not.toHaveBeenCalled()

    expect(await screen.findByText('Updated the plan.')).toBeInTheDocument()
    expect(onReveal).toHaveBeenCalledTimes(1)
  })
})
