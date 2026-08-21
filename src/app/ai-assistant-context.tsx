import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router'
import {
  getAiContext,
  routeToScope,
  type AiContext,
  type AiConversationSeed,
  type AiScope,
} from '@/features/ai-studio/ai-context-registry'

type AiAssistantValue = {
  isOpen: boolean
  mode: 'panel' | 'full'
  context: AiContext
  contextVersion: number
  open: (
    scope?: AiScope,
    mode?: 'panel' | 'full',
    seed?: { prompt?: string; conversation?: AiConversationSeed },
  ) => void
  close: () => void
  toggle: (scope?: AiScope) => void
  expand: () => void
  collapse: () => void
}

const AiAssistantContext = createContext<AiAssistantValue | null>(null)

export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'panel' | 'full'>('panel')
  const [context, setContext] = useState<AiContext>(getAiContext())
  // Changes only when a trigger explicitly launches a context. Consumers can
  // use it to reset ephemeral UI (such as a draft composer) without resetting
  // during ordinary rerenders or panel resizing.
  const [contextVersion, setContextVersion] = useState(0)
  // Whether a side panel sits "behind" the full view — i.e. full mode was
  // reached by expanding an open panel, so collapsing should return to it.
  // When the assistant is opened directly into full mode (e.g. the sidebar
  // trigger), there is no panel behind it, so collapsing closes entirely.
  const [panelBacked, setPanelBacked] = useState(false)

  const location = useLocation()

  const open = useCallback(
    (
      scope?: AiScope,
      openMode: 'panel' | 'full' = 'panel',
      seed?: { prompt?: string; conversation?: AiConversationSeed },
    ) => {
      const base = getAiContext(scope ?? routeToScope(location.pathname))
      setContext({
        ...base,
        ...(seed?.prompt ? { prompt: seed.prompt } : {}),
        ...(seed?.conversation ? { conversation: seed.conversation } : {}),
      })
      setContextVersion((version) => version + 1)
      setMode(openMode)
      setPanelBacked(openMode === 'panel')
      setIsOpen(true)
    },
    [location.pathname],
  )

  const close = useCallback(() => {
    setIsOpen(false)
    setMode('panel')
    setPanelBacked(false)
  }, [])

  const toggle = useCallback(
    (scope?: AiScope) => {
      setIsOpen((wasOpen) => {
        if (wasOpen) {
          setMode('panel')
          setPanelBacked(false)
          return false
        }
        setContext(getAiContext(scope ?? routeToScope(location.pathname)))
        setContextVersion((version) => version + 1)
        setMode('panel')
        setPanelBacked(true)
        return true
      })
    },
    [location.pathname],
  )

  // Expanding always comes from an open panel, so that panel now backs the
  // full view and collapsing returns to it.
  const expand = useCallback(
    () => setIsOpen((o) => (o ? (setMode('full'), setPanelBacked(true), true) : o)),
    [],
  )
  // Collapse returns to the backing panel; with none behind it, it closes.
  const collapse = useCallback(
    () =>
      setIsOpen((o) => {
        if (!o) return o
        if (panelBacked) {
          setMode('panel')
          return true
        }
        setMode('panel')
        return false
      }),
    [panelBacked],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        const el = e.target as HTMLElement | null
        const tag = el?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  const value = useMemo<AiAssistantValue>(
    () => ({ isOpen, mode, context, contextVersion, open, close, toggle, expand, collapse }),
    [isOpen, mode, context, contextVersion, open, close, toggle, expand, collapse],
  )

  return <AiAssistantContext.Provider value={value}>{children}</AiAssistantContext.Provider>
}

export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext)
  if (!ctx) throw new Error('useAiAssistant must be used within AiAssistantProvider')
  return ctx
}
