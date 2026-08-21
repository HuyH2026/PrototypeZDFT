import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AiAssistantProvider } from '@/app/ai-assistant-context'
import { BrandProvider } from '@/app/brand-context'
import { ConfigurationView } from './ConfigurationView'

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/agent-builder/configuration']}>
      <BrandProvider>
        <AiAssistantProvider>
          <ConfigurationView />
        </AiAssistantProvider>
      </BrandProvider>
    </MemoryRouter>,
  )
}

const view = () => within(screen.getByTestId('view-configuration'))
// The channel tabs and the section rail both label a button "Voice", so tab
// assertions are scoped to the strip.
const tabs = () => within(screen.getByTestId('channel-tabs'))

describe('ConfigurationView', () => {
  it('keeps the channel selector fluid at the desktop floor', () => {
    renderScreen()
    const selector = screen.getByTestId('channel-tabs')

    expect(selector).toHaveClass('w-full', 'max-w-[518px]')
    for (const button of within(selector).getAllByRole('button')) {
      expect(button).toHaveClass('whitespace-nowrap', 'gap-1.5', 'px-4')
    }
  })

  it('renders the title, all four tabs, three segments, and the panel', () => {
    renderScreen()
    const v = view()
    expect(v.getByText('Configuration')).toBeInTheDocument()
    for (const t of ['Widget', 'Voice', 'Web Call', 'Headless'])
      expect(v.getByText(t)).toBeInTheDocument()
    expect(v.getByText('Riders')).toBeInTheDocument()
    expect(v.getByText('One members')).toBeInTheDocument()
    expect(v.getByText('Business riders')).toBeInTheDocument()
    expect(v.getByText('Widget segment')).toBeInTheDocument()
  })

  it('updates the panel + preview when a different segment is selected', async () => {
    renderScreen()
    const v = view()
    expect(v.getByDisplayValue('Riders')).toBeInTheDocument()
    expect(v.getByText('Uber Rider Support')).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: /One members/ }))
    expect(v.getByDisplayValue('Uber One')).toBeInTheDocument()
    expect(v.getByText('Uber One Support')).toBeInTheDocument()
  })

  it('loads the Business riders content and presentation', async () => {
    renderScreen()
    const v = view()

    await userEvent.click(v.getByRole('button', { name: 'Business riders' }))

    expect(v.getByDisplayValue('Business riders')).toBeInTheDocument()
    expect(v.getByText('Uber Business Rider')).toBeInTheDocument()
    expect(v.getAllByText('business_profile')).toHaveLength(2)
    expect(v.getByRole('switch', { name: /Widget is visible/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(v.getByRole('checkbox', { name: 'Set as Default' })).not.toBeChecked()
  })

  it('builds the Web Call tab with its own panel, preview and rail', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))

    // Panel: toggle, title, and the segment + identity fields.
    expect(
      v.getByRole('switch', { name: 'Web Call is enabled for users in this segment' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(v.getByText('Web Call Segment')).toBeInTheDocument()
    expect(v.getByDisplayValue('Riders')).toBeInTheDocument()
    expect(v.getByLabelText('Company name')).toHaveValue('Uber')
    expect(v.getByLabelText('Web Call agent name')).toHaveValue('Uber')
    expect(v.getByRole('checkbox', { name: 'Set as default' })).not.toBeChecked()

    // Preview: the scope row summarizes the frame's tags, and the hint points
    // at the panel.
    expect(v.getByText(/'Riders'/)).toBeInTheDocument()
    expect(v.getByText('Tag A, Tag B, +2')).toBeInTheDocument()
    expect(
      v.getByText(/customize the appearance of your web call/),
    ).toBeInTheDocument()

    // The webcall rail adds Appearance and Share sections the Widget rail
    // doesn't have.
    expect(v.getByRole('button', { name: 'Appearance' })).toBeInTheDocument()
    expect(v.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('themes the web call from the Appearance section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Appearance' }))

    // The Theme tab of the panel: launch icon, header text, colors, tiles.
    expect(v.getByRole('tab', { name: 'Theme' })).toHaveAttribute('aria-selected', 'true')
    expect(v.getByText('Launch icon')).toBeInTheDocument()
    expect(v.getAllByText('Change image')).toHaveLength(2)
    expect(v.getByText('Reset to default')).toBeInTheDocument()
    expect(v.getByLabelText('Web call header')).toHaveValue('Rider support')
    expect(v.getByText('Colors')).toBeInTheDocument()
    expect(v.getByText('#000000')).toBeInTheDocument()
    expect(v.getByRole('button', { name: 'Standard' })).toHaveAttribute('aria-pressed', 'true')
    expect(v.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true')
    expect(v.getByRole('button', { name: 'Bottom right' })).toHaveAttribute('aria-pressed', 'true')
    // The refine frame renames the last group Placement (was Position).
    expect(v.getByText('Placement')).toBeInTheDocument()
    expect(v.queryByText('Position')).not.toBeInTheDocument()

    // The centre preview swaps the orb for the in-call card.
    const card = within(v.getByTestId('webcall-card'))
    expect(card.getByText('Rider support')).toBeInTheDocument()
    expect(card.getByText('Built with Zendesk')).toBeInTheDocument()

    // Editing the header text updates the card.
    const headerField = v.getByLabelText('Web call header')
    await userEvent.clear(headerField)
    await userEvent.type(headerField, 'Support desk')
    expect(card.getByText('Support desk')).toBeInTheDocument()

    // Tiles switch.
    await userEvent.click(v.getByRole('button', { name: 'Dark' }))
    expect(v.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true')
    expect(v.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false')

    // Back to Segments: the orb preview returns, and the segments panel.
    await userEvent.click(v.getByRole('button', { name: 'Segments' }))
    expect(v.queryByTestId('webcall-card')).not.toBeInTheDocument()
    expect(v.getByText('Web Call Segment')).toBeInTheDocument()
  })

  it('picks a voice visualization from the Appearance ▸ Avatar tab', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Appearance' }))
    await userEvent.click(v.getByRole('tab', { name: 'Avatar' }))

    expect(
      v.getByText('Customize the appearance of your web-based voice Agent.'),
    ).toBeInTheDocument()
    expect(v.getByText('Visualization')).toBeInTheDocument()

    // The frame opens with the animation on and the rainbow ring selected.
    const animation = v.getByRole('checkbox', { name: 'Show voice animation' })
    expect(animation).toBeChecked()
    expect(v.getByRole('button', { name: 'Rainbow ring' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(animation)
    expect(animation).not.toBeChecked()

    await userEvent.click(v.getByRole('button', { name: 'Waveform' }))
    expect(v.getByRole('button', { name: 'Waveform' })).toHaveAttribute('aria-pressed', 'true')
    expect(v.getByRole('button', { name: 'Rainbow ring' })).toHaveAttribute('aria-pressed', 'false')

    // Upload slot.
    expect(v.getByText('Upload web visual')).toBeInTheDocument()
    expect(v.getByText('120 × 120 px PNG')).toBeInTheDocument()
    expect(v.getByRole('button', { name: 'Upload visual' })).toBeInTheDocument()
  })

  it('configures the web call voice from the Voice section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    // "Voice" names both a channel tab and a rail section; the rail button is
    // the one with an explicit aria-label (the tab's name is its text).
    const voiceRailButton = v
      .getAllByRole('button', { name: 'Voice' })
      .find((b) => b.hasAttribute('aria-label'))!
    await userEvent.click(voiceRailButton)

    // Panel: greeting, language, auto-switching toggle, catalog, speed.
    expect(v.getByRole('heading', { name: 'Voice' })).toBeInTheDocument()
    expect(v.getByLabelText('Call greeting')).toHaveValue(
      "Hello, this is Uber's voice assistant. How can I help you today?",
    )
    expect(v.getByLabelText('Select default language')).toHaveValue('English')
    const autoSwitch = v.getByRole('switch', { name: 'Auto language switching is off' })
    expect(autoSwitch).toHaveAttribute('aria-checked', 'false')
    expect(v.getByRole('button', { name: 'Sarah Curious' })).toHaveAttribute('aria-pressed', 'true')
    expect(v.getAllByRole('button', { name: 'Tim' })).toHaveLength(3)
    expect(v.getByText('Voice speed')).toBeInTheDocument()
    expect(v.getByLabelText('Adjust the speaking speed')).toBeInTheDocument()
    expect(v.getByText('Slowest')).toBeInTheDocument()
    expect(v.getByText('Fastest')).toBeInTheDocument()

    // The preview card overlays the greeting on the ring.
    const card = within(v.getByTestId('webcall-card'))
    expect(
      card.getByText("Hello, this is Uber's voice assistant. How can I help you today?"),
    ).toBeInTheDocument()

    // The toggle label reads its own state. (On swaps the catalog for the
    // multilingual box, so switch back off for the catalog checks below.)
    await userEvent.click(autoSwitch)
    expect(
      v.getByRole('switch', { name: 'Auto language switching is on' }),
    ).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(v.getByRole('switch', { name: 'Auto language switching is on' }))

    // Picking Tim deselects Sarah Curious.
    const tims = () => v.getAllByRole('button', { name: 'Tim' })
    await userEvent.click(tims()[0])
    expect(tims()[0]).toHaveAttribute('aria-pressed', 'true')
    expect(v.getByRole('button', { name: 'Sarah Curious' })).toHaveAttribute('aria-pressed', 'false')

    // Search filters the catalog.
    await userEvent.type(v.getByLabelText('Search voices'), 'sarah')
    expect(v.queryByRole('button', { name: 'Tim' })).not.toBeInTheDocument()
    expect(v.getByRole('button', { name: 'Sarah Curious' })).toBeInTheDocument()

    // Editing the greeting updates the bubble.
    const greeting = v.getByLabelText('Call greeting')
    await userEvent.clear(greeting)
    await userEvent.type(greeting, 'Hi there')
    expect(card.getByText('Hi there')).toBeInTheDocument()
  })

  it('swaps the voice catalog for multilingual settings when auto switching is on', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(
      v.getAllByRole('button', { name: 'Voice' }).find((b) => b.hasAttribute('aria-label'))!,
    )

    await userEvent.click(v.getByRole('switch', { name: 'Auto language switching is off' }))

    // The catalog and search go away; the language→voice box appears.
    expect(v.queryByLabelText('Search voices')).not.toBeInTheDocument()
    expect(v.queryByRole('button', { name: 'Sarah Curious' })).not.toBeInTheDocument()
    const box = within(v.getByTestId('multilingual-box'))
    expect(box.getByText('English (default)')).toBeInTheDocument()
    expect(box.getByText('German')).toBeInTheDocument()
    expect(box.getByText('Korean')).toBeInTheDocument()
    expect(box.getByText('Sofía')).toBeInTheDocument()
    expect(box.getByText('Camille')).toBeInTheDocument()

    // Multilingual settings opens the dialog; Save closes it. (The dialog
    // portals to <body>, so it lives outside the view scope.)
    await userEvent.click(v.getByRole('button', { name: 'Multilingual settings' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Multilingual settings' }))
    expect(
      dialog.getByText(/Select your enabled languages and choose a voice for each/),
    ).toBeInTheDocument()
    expect(dialog.getByText('Enabled languages')).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: 'Sarah Curious' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // Add and remove languages locally.
    await userEvent.click(dialog.getByRole('button', { name: 'Add language' }))
    expect(dialog.getByText('Spanish')).toBeInTheDocument()
    await userEvent.click(dialog.getByRole('button', { name: 'Remove Spanish' }))
    expect(dialog.queryByText('Spanish')).not.toBeInTheDocument()

    await userEvent.click(dialog.getByRole('button', { name: 'Save' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the web call AI personality panel from the rail sentiment section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Sentiment' }))

    // The personality form: the on toggle, both context textareas, the tone
    // textarea, and the preview hint swap.
    expect(v.getByRole('switch', { name: 'AI Personality is on' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(v.getByLabelText('General Context')).toBeInTheDocument()
    expect(v.getByLabelText('Glossary')).toBeInTheDocument()
    expect(v.getByLabelText('Tone of Voice')).toBeInTheDocument()
    expect(
      v.getByText('Set the personality for your Web Call AI Agent.'),
    ).toBeInTheDocument()

    // Editing reports into the segment's webcall personality.
    await userEvent.type(v.getByLabelText('General Context'), 'B2C riders')
    expect(v.getByLabelText('General Context')).toHaveValue('B2C riders')

    // Suggestion pills stay inert until the checkbox enables them.
    const empathetic = v.getByRole('button', { name: 'Empathetic' })
    expect(empathetic).toBeDisabled()
    await userEvent.click(v.getByRole('checkbox', { name: 'Select suggestions' }))
    expect(empathetic).toBeEnabled()
    await userEvent.click(empathetic)
    expect(empathetic).toHaveAttribute('aria-pressed', 'true')

    // Toggling the personality off renames the switch.
    await userEvent.click(v.getByRole('switch', { name: 'AI Personality is on' }))
    expect(v.getByRole('switch', { name: 'AI Personality is off' })).toBeInTheDocument()
  })

  it('shows the web call privacy panel and binds its fields to the consent sheet', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Privacy' }))

    // The panel form: recording toggle on, the three placeholder fields.
    expect(
      v.getByRole('switch', { name: 'Enable automatic recording of all incoming calls' }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(v.getByLabelText('Prompt header')).toHaveValue('')
    expect(
      v.getByText(
        'Personalize your Privacy policy and consent for web calls by using the menu on the right.',
      ),
    ).toBeInTheDocument()

    // The consent sheet falls back to the placeholder copy until edited.
    const card = within(v.getByTestId('webcall-card'))
    expect(card.getByText('Accept Terms')).toBeInTheDocument()
    expect(
      card.getByText('This call may be recorded for quality assurance and training purposes.'),
    ).toBeInTheDocument()

    // Edits flow through to the sheet.
    await userEvent.type(v.getByLabelText('Call to action label'), 'I agree')
    expect(card.getByText('I agree')).toBeInTheDocument()
    await userEvent.type(v.getByLabelText('Prompt header'), 'Recording notice')
    expect(card.getByText('Recording notice')).toBeInTheDocument()

    // The recording toggle flips off.
    await userEvent.click(
      v.getByRole('switch', { name: 'Enable automatic recording of all incoming calls' }),
    )
    expect(
      v.getByRole('switch', { name: 'Enable automatic recording of all incoming calls' }),
    ).toHaveAttribute('aria-checked', 'false')
  })

  it('shows the web call API (embed) panel from the rail code section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Embed' }))

    // One embed for the site: the preview stops naming the segment.
    expect(v.getByText('Enabled for all segments')).toBeInTheDocument()
    expect(
      v.getByText('Configure your voice web call embed settings on the right.'),
    ).toBeInTheDocument()

    // The allowlist seeds forethought.ai and supports add/remove.
    expect(v.getByText('forethought.ai')).toBeInTheDocument()
    await userEvent.type(v.getByLabelText('Domain allowlist'), 'example.com')
    await userEvent.click(v.getByRole('button', { name: 'Add domain' }))
    expect(v.getByText('example.com')).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Remove example.com' }))
    expect(v.queryByText('example.com')).not.toBeInTheDocument()

    // The snippet masks the key until the checkbox reveals it.
    expect(v.getByText('“ENABLE TO REVEAL HERE”')).toBeInTheDocument()
    await userEvent.click(v.getByRole('checkbox', { name: 'Show API key in code snippet' }))
    expect(v.queryByText('“ENABLE TO REVEAL HERE”')).not.toBeInTheDocument()

    // Refresh rotates the deterministic mock key.
    const before = v.getByTestId('webcall-card') // card stays mounted
    expect(before).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Refresh API key' }))
    // (Key text is in the snippet <pre>; just assert the panel is stable.)
    expect(v.getByText('Auto-generated code snippet')).toBeInTheDocument()
  })

  it('shows the web call share (Caller API key) panel from the rail share section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Share' }))

    // Site-wide scope, gradient hint, masked key.
    expect(v.getByText('Enabled for all segments')).toBeInTheDocument()
    expect(
      v.getByText(
        'Set up the Caller API to securely pass information and support both inbound and outbound calls functionality.',
      ),
    ).toBeInTheDocument()
    expect(v.getByText('**************')).toBeInTheDocument()

    // Reveal swaps the mask for the key; refresh rotates it.
    await userEvent.click(v.getByRole('button', { name: 'Reveal API key' }))
    expect(v.queryByText('**************')).not.toBeInTheDocument()
    const revealedKey = v.getByText(/^ft_/).textContent
    await userEvent.click(v.getByRole('button', { name: 'Refresh API key' }))
    expect(v.getByText(/^ft_/).textContent).not.toBe(revealedKey)
  })

  it('shows the web call fallback panel from the rail install section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Install' }))

    // Site-wide scope; the three-paragraph gradient hint; no ring in the card.
    expect(v.getByText('Enabled for all segments')).toBeInTheDocument()
    expect(
      v.getByText(/default feature that activates when the Dynamic Article Suggestion component/),
    ).toBeInTheDocument()

    // The panel: connect + build actions and the seeded Salesforce connection.
    expect(v.getByRole('button', { name: 'Connect new integration' })).toBeInTheDocument()
    expect(v.getByRole('button', { name: 'Build Fallback in agent' })).toBeInTheDocument()
    expect(v.getByText('Current connections')).toBeInTheDocument()
    expect(v.getByText('Salesforce')).toBeInTheDocument()
  })

  it('shows the web call knowledge panel from the rail lightbulb section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Knowledge' }))

    // Site-wide scope; the two-paragraph gradient hint.
    expect(v.getByText('Enabled for all segments')).toBeInTheDocument()
    expect(
      v.getByText(/public URL of your organization's knowledge base/),
    ).toBeInTheDocument()

    // The panel: connect + build actions and the shared connections list.
    expect(v.getByRole('button', { name: 'Connect new integration' })).toBeInTheDocument()
    expect(
      v.getByRole('button', { name: 'Build Knowledge Retrieval in agent' }),
    ).toBeInTheDocument()
    expect(v.getByText('http://www.mytestknowledgebase.ai')).toBeInTheDocument()
    expect(v.getByText('Salesforce')).toBeInTheDocument()
    expect(v.getByText('Airtable')).toBeInTheDocument()

    // Per-source toggles flip (and share the cross-channel connections state).
    const toggle = v.getByRole('switch', { name: 'Salesforce enabled' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(toggle)
    expect(v.getByRole('switch', { name: 'Salesforce enabled' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('shows the web call CSAT panel from the rail smiley section', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    await userEvent.click(v.getByRole('button', { name: 'Mood' }))

    // The panel: tabs, the on toggle, availability checkboxes, question, scale.
    expect(v.getByRole('tab', { name: 'CSAT' })).toHaveAttribute('aria-selected', 'true')
    expect(v.getByRole('tab', { name: 'Emojis' })).toBeInTheDocument()
    expect(v.getByRole('switch', { name: 'CSAT is on' })).toHaveAttribute('aria-checked', 'true')
    // The "After N user interactions" row's checkbox has no accessible name
    // (CheckRow's children variant drops the <label>), so query it via the
    // count input's row.
    const afterInput = v.getByLabelText('User interactions before CSAT')
    expect(afterInput).toHaveValue('1')
    expect(
      afterInput.parentElement!.parentElement!.querySelector('input[type=checkbox]'),
    ).toBeChecked()
    expect(
      v.getByRole('checkbox', { name: 'Anytime the user accesses it via the header' }),
    ).not.toBeChecked()
    expect(
      v.getByRole('checkbox', { name: 'When CSAT Trigger is applied in the Policy' }),
    ).toBeDisabled()
    expect(v.getByLabelText('Rating question')).toHaveValue(
      'How would you rate your experience today?',
    )
    expect(v.getByRole('button', { name: 'Stars' })).toHaveAttribute('aria-pressed', 'true')

    // The per-rating rows carry their sentiment badges (and the reasons
    // section repeats the tags: low = Negative+Neutral, high = Positive, and
    // the low-ratings question header carries Negative).
    expect(v.getByLabelText('Rating 1 label')).toHaveValue('Terrible')
    expect(v.getAllByText('Negative')).toHaveLength(4)
    expect(v.getAllByText('Neutral')).toHaveLength(2)
    expect(v.getAllByText('Positive')).toHaveLength(3)

    // The full panel (frame 135-133944): reasons, resolution, feedback.
    expect(
      v.getByRole('checkbox', { name: 'Request feedback for low ratings (1-3)' }),
    ).toBeChecked()
    expect(
      v.getByRole('checkbox', { name: 'Request feedback for high ratings (4-5)' }),
    ).toBeChecked()
    expect(v.getByLabelText('Question for low ratings')).toHaveValue(
      "We're sorry to hear that. Could you share what didn't go well?",
    )
    expect(v.getByLabelText('Reason 1')).toHaveValue('Took too long')
    expect(v.getByLabelText('Reason 4')).toHaveValue('Unfriendly')

    // Add + remove a low-ratings reason.
    await userEvent.click(v.getByRole('button', { name: 'Add option' }))
    expect(v.getByLabelText('Reason 5')).toHaveValue('')
    await userEvent.click(v.getByRole('button', { name: 'Remove reason 5' }))
    expect(v.queryByLabelText('Reason 5')).not.toBeInTheDocument()

    // Resolution confirmation + additional feedback + confirmation message.
    expect(
      v.getByRole('checkbox', { name: 'Request to confirm the resolution of the issue' }),
    ).toBeChecked()
    expect(v.getByLabelText('Question to confirm')).toHaveValue(
      'Has your reported issue been resolved today?',
    )
    expect(v.getByLabelText('Resolution reason 1')).toHaveValue('Yes')
    expect(v.getByLabelText('Resolution reason 2')).toHaveValue('No, not really')
    expect(
      v.getByRole('checkbox', { name: 'Request open-ended feedback in free-form text' }),
    ).not.toBeChecked()
    expect(v.getByLabelText('Confirmation message')).toHaveValue(
      'We value and thank you for your feedback.',
    )

    // The preview draws the survey, bound to the config.
    const card = within(v.getByTestId('webcall-card'))
    expect(
      v.getByText('Personalize your CSAT and emojis using the menu on the right'),
    ).toBeInTheDocument()
    expect(card.getAllByText('How would you rate your experience today?').length).toBeGreaterThan(0)
    expect(card.getByText('Excellent')).toBeInTheDocument()
    expect(card.getByText('Irrelevant info')).toBeInTheDocument()

    // Editing the question flows into the survey.
    await userEvent.clear(v.getByLabelText('Rating question'))
    await userEvent.type(v.getByLabelText('Rating question'), 'Rate this call')
    expect(card.getByText('Rate this call')).toBeInTheDocument()

    // The Emojis tab (frame 135-154344): toggle, explainer, and the fixed
    // eight-emoji legend; the preview swaps the survey for the reaction sheet.
    await userEvent.click(v.getByRole('tab', { name: 'Emojis' }))
    expect(v.getByRole('switch', { name: 'Emojis are on' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(v.getByText(/express their emotions and provide feedback/)).toBeInTheDocument()
    expect(v.getByText('Suprise')).toBeInTheDocument() // sic
    expect(v.getByText('Thumbs down')).toBeInTheDocument()
    expect(v.queryByLabelText('Rating question')).not.toBeInTheDocument()

    // The survey leaves the card; the reaction sheet overlays it.
    expect(card.queryByText('Excellent')).not.toBeInTheDocument()
    // The card is aria-hidden (decorative), so role queries skip the emoji
    // glyphs — label queries still find them.
    const sheet = within(v.getByTestId('emoji-sheet'))
    expect(sheet.getByLabelText('Heart')).toBeInTheDocument()
    expect(sheet.getByLabelText('Suprise')).toBeInTheDocument()

    // Toggling the feature off removes the sheet.
    await userEvent.click(v.getByRole('switch', { name: 'Emojis are on' }))
    expect(v.queryByTestId('emoji-sheet')).not.toBeInTheDocument()
  })

  it('removes a web call tag pill from the panel', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    expect(v.getByText('Tag A, Tag B, +2')).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Remove Tag A' }))
    expect(v.queryByRole('button', { name: 'Remove Tag A' })).not.toBeInTheDocument()
    expect(v.getByText('Tag B, Tag C, +1')).toBeInTheDocument()
  })

  it('keeps web call segment edits independent of the widget tab', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Web Call'))
    const nameField = v.getByLabelText('Segment name')
    await userEvent.clear(nameField)
    await userEvent.type(nameField, 'Premium riders')

    await userEvent.click(tabs().getByText('Widget'))
    expect(v.getByLabelText('Segment name')).toHaveValue('Riders')

    await userEvent.click(tabs().getByText('Web Call'))
    expect(v.getByLabelText('Segment name')).toHaveValue('Premium riders')
  })

  it('marks the active tab with aria-current', async () => {
    renderScreen()
    expect(tabs().getByRole('button', { name: /Widget/ })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(tabs().getByText('Voice'))
    expect(tabs().getByRole('button', { name: /Voice/ })).toHaveAttribute('aria-current', 'page')
  })

  it('flips the enabled toggle when clicked', async () => {
    renderScreen()
    const v = view()
    const sw = v.getByRole('switch', { name: /Widget is visible to users in this segment/ })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('swaps panels as the rail is clicked, and back', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(v.getByRole('button', { name: 'Sentiment' }))
    expect(v.getByText('AI Personality')).toBeInTheDocument()
    expect(v.queryByText('Widget segment')).not.toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Mood' }))
    expect(v.getByRole('tab', { name: 'CSAT' })).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Knowledge' }))
    expect(v.getByRole('heading', { name: 'Knowledge Base' })).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Embed' }))
    expect(v.getByText('Domain allowlist')).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Segments' }))
    expect(v.getByText('Widget segment')).toBeInTheDocument()
  })

  it('re-scopes the preview when a site-wide section is selected', async () => {
    renderScreen()
    const v = view()
    expect(v.getByText(/'Riders'/)).toBeInTheDocument()
    await userEvent.click(v.getByRole('button', { name: 'Knowledge' }))
    expect(v.getByText('Enabled for all segments')).toBeInTheDocument()
  })

  it('shows per-segment personality values on the AI Personality panel', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(v.getByRole('button', { name: 'Sentiment' }))
    await userEvent.type(v.getByLabelText('General Context'), 'Riders context')
    expect(v.getByLabelText('General Context')).toHaveValue('Riders context')
    // Switch segment: their General Context is still empty.
    await userEvent.click(v.getByRole('button', { name: /One members/ }))
    expect(v.getByLabelText('General Context')).toHaveValue('')
  })

  it('keeps the widget and voice personalities apart for one segment', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(v.getByRole('button', { name: 'Sentiment' }))
    await userEvent.type(v.getByLabelText('General Context'), 'widget only')

    await userEvent.click(tabs().getByText('Voice'))
    await userEvent.click(v.getByRole('button', { name: 'Sentiment' }))
    expect(v.getByLabelText('General Context')).toHaveValue('')
  })

  it('builds the Voice tab with its own panel, preview and rail', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Voice'))
    expect(v.getByText('Voice segment')).toBeInTheDocument()
    expect(v.getByText('Riders English')).toBeInTheDocument()
    expect(v.getByText('Riders Japanese')).toBeInTheDocument()
    expect(v.getByText('+1 333-123-4567')).toBeInTheDocument()
    expect(v.getByText('+13331234567')).toBeInTheDocument()
    expect(v.getByRole('button', { name: 'Start a test call' })).toBeInTheDocument()
    // The voice rail has no Embed section.
    expect(v.queryByRole('button', { name: 'Embed' })).not.toBeInTheDocument()
  })

  it('swaps the voice panel as its rail sections are clicked', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(tabs().getByText('Voice'))
    expect(v.getByText('Voice segment')).toBeInTheDocument()

    // "Voice" names both the channel tab and the rail section; the rail
    // button is the one with aria-pressed (the tab uses aria-current).
    await userEvent.click(
      v.getAllByRole('button', { name: 'Voice' }).find((b) => b.hasAttribute('aria-pressed'))!,
    )
    expect(v.getByText('Inbound call greeting')).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Privacy' }))
    expect(v.getByText('Enable automatic recording of all calls')).toBeInTheDocument()
    // The disclosure shows twice, per the frame: the panel's textarea and the
    // bubble overlaid on the preview ring.
    expect(
      v.getAllByText(/This call may be recorded for quality assurance/).length,
    ).toBeGreaterThan(1)

    await userEvent.click(v.getByRole('button', { name: 'CSAT' }))
    // The SMS tab is the frame's default; its preview is the phone message.
    expect(v.getByRole('tab', { name: 'SMS Message' })).toHaveAttribute('aria-selected', 'true')
    expect(v.getByText('Test message • SMS')).toBeInTheDocument()
    expect(v.getByText('forethought.ai/feedback/123')).toBeInTheDocument()
    // Switching the panel tab swaps the preview to the survey mock.
    await userEvent.click(v.getByRole('tab', { name: 'CSAT survey' }))
    expect(v.queryByText('Test message • SMS')).not.toBeInTheDocument()
    expect(
      v.getAllByText('Personalize your CSAT survey using the menu on the right').length,
    ).toBeGreaterThan(0)

    await userEvent.click(v.getByRole('button', { name: 'Knowledge' }))
    expect(v.getByText('Current connections')).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Fallback' }))
    expect(v.getByText('Connect Help Desk')).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'API' }))
    expect(v.getByText('Context Variable')).toBeInTheDocument()

    await userEvent.click(v.getByRole('button', { name: 'Segments' }))
    expect(v.getByText('Voice segment')).toBeInTheDocument()
  })

  it('remembers each channel’s section independently', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(v.getByRole('button', { name: 'Embed' }))
    expect(v.getByText('Domain allowlist')).toBeInTheDocument()

    // Voice has no Embed section, so it opens on its own default…
    await userEvent.click(tabs().getByText('Voice'))
    expect(v.getByText('Voice segment')).toBeInTheDocument()

    // …and the Widget tab is still where it was left.
    await userEvent.click(tabs().getByText('Widget'))
    expect(v.getByText('Domain allowlist')).toBeInTheDocument()
  })

  it('toggles a knowledge connection off', async () => {
    renderScreen()
    const v = view()
    await userEvent.click(v.getByRole('button', { name: 'Knowledge' }))
    const sw = v.getByRole('switch', { name: /Salesforce enabled/ })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })
})
