import { useState } from 'react'
import { Check, ChevronDown, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { DashboardView } from './views-store'

// Local palette to match the HomeScreen widget cards.
const INK = '#2f3130'
const MUTED = '#8b8e89'
const BORDER = '#e2e0dd'
const PURPLE = '#724be8'

export function ViewSwitcher({
  views, activeId, onSelect, onRename, onDelete, onNew,
}: {
  views: DashboardView[]
  activeId: string
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const active = views.find((v) => v.id === activeId) ?? views[0]

  const startRename = (v: DashboardView) => {
    setEditingId(v.id)
    setDraft(v.name)
  }
  const commitRename = () => {
    if (editingId) onRename(editingId, draft)
    setEditingId(null)
  }

  return (
    <div className="relative" data-testid="view-switcher">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded-full border border-solid bg-white px-3 outline-none"
        style={{ borderColor: BORDER }}
      >
        <span className="text-[13px] font-semibold" style={{ color: INK }}>{active?.name}</span>
        <ChevronDown size={14} color={MUTED} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => { setOpen(false); setEditingId(null) }} />
          <div
            className="absolute left-0 top-[38px] z-[61] w-64 rounded-xl border border-solid bg-white py-1.5 shadow-[0px_16px_24px_0px_rgba(10,13,14,0.16)]"
            style={{ borderColor: BORDER }}
          >
            {views.map((v) => {
              const isActive = v.id === activeId
              if (editingId === v.id) {
                return (
                  <div key={v.id} className="px-2 py-1.5">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={commitRename}
                      aria-label={`Rename ${v.name}`}
                      className="w-full rounded-md border px-2 py-1 text-[13px] outline-none"
                      style={{ borderColor: PURPLE, color: INK }}
                    />
                  </div>
                )
              }
              return (
                <div key={v.id} className="group flex items-center gap-1 pr-2 hover:bg-[#f5f5f4]">
                  <button
                    onClick={() => { onSelect(v.id); setOpen(false) }}
                    className="flex flex-1 items-center gap-2 px-3 py-2 text-left outline-none"
                  >
                    <Check size={14} color={isActive ? INK : 'transparent'} />
                    <span className="text-[13px] font-normal" style={{ color: INK }}>{v.name}</span>
                  </button>
                  <button
                    onClick={() => startRename(v)}
                    aria-label={`Rename ${v.name}`}
                    className="flex size-6 items-center justify-center rounded outline-none hover:bg-[#ecebe9]"
                  >
                    <Pencil size={13} color={MUTED} />
                  </button>
                  {!v.builtIn && (
                    <button
                      onClick={() => onDelete(v.id)}
                      aria-label={`Delete ${v.name}`}
                      className="flex size-6 items-center justify-center rounded outline-none hover:bg-[#ecebe9]"
                    >
                      <Trash2 size={13} color={MUTED} />
                    </button>
                  )}
                </div>
              )
            })}
            <div className="my-1 border-t" style={{ borderColor: BORDER }} />
            <button
              onClick={() => { onNew(); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left outline-none hover:bg-[#f5f5f4]"
            >
              <span className="flex size-4 items-center justify-center">
                <Plus size={14} color={PURPLE} />
              </span>
              <span className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: PURPLE }}>
                <Sparkles size={12} color={PURPLE} /> New from…
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
