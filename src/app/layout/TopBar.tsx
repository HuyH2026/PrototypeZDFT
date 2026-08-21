import { ChevronDown, Users, Braces, ChartPie, Globe, CircleHelp } from 'lucide-react'
import { ZendeskLogo } from '@/components/ZendeskLogo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AgentSwitcher } from './AgentSwitcher'

const ICON_BUTTONS: { Icon: typeof Users; label: string }[] = [
  { Icon: Users, label: 'Team' },
  { Icon: Braces, label: 'Developer tools' },
  { Icon: ChartPie, label: 'Reports' },
  { Icon: Globe, label: 'Language & region' },
  { Icon: CircleHelp, label: 'Help' },
]

export function TopBar() {
  return (
    // Transparent so the layout's warm chrome wash reads through unbroken; a fill
    // here would cut a flat band across the top of the ramp.
    <div className="flex shrink-0 items-center justify-between h-[55px] px-5">
      {/* Left: logo, product switcher, agent switcher */}
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center">
          <ZendeskLogo size={20} className="text-ink" />
        </div>

        {/* Header controls hover on the translucent warm neutral at radius 12, per the
            prototype's .header-product — not the nav rows' opaque #eae9e8. */}
        <button className="flex items-center gap-2 rounded-[12px] px-3 py-1.5 transition-colors duration-instant ease-soft hover:bg-control-hover">
          <span className="text-[14px] font-semibold leading-5 tracking-[-0.154px] text-ink">
            AI Agent
          </span>
          <ChevronDown size={16} className="text-ink" />
        </button>

        <div aria-hidden className="mx-1 h-[27px] w-px bg-flora-divider" />

        <AgentSwitcher />
      </div>

      {/* Right: icon cluster + avatar */}
      <div className="flex items-center gap-2">
        {ICON_BUTTONS.map(({ Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="flex size-8 items-center justify-center rounded-[12px] transition-colors duration-instant ease-soft hover:bg-control-hover"
          >
            <Icon size={20} className="text-ink" />
          </button>
        ))}
        <Avatar className="size-6">
          <AvatarImage src="https://i.pravatar.cc/64?img=47" alt="User avatar" />
          <AvatarFallback className="bg-[#d9d7d5]" />
        </Avatar>
      </div>
    </div>
  )
}
