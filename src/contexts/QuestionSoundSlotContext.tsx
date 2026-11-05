import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type QuestionSoundSlotContextValue = {
  slotEl: HTMLElement | null
  setSlotEl: (el: HTMLElement | null) => void
}

const QuestionSoundSlotContext =
  createContext<QuestionSoundSlotContextValue | null>(null)

export function QuestionSoundSlotProvider({
  children,
}: {
  children: ReactNode
}) {
  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ slotEl, setSlotEl }), [slotEl])
  return (
    <QuestionSoundSlotContext.Provider value={value}>
      {children}
    </QuestionSoundSlotContext.Provider>
  )
}

export function useQuestionSoundSlot() {
  return useContext(QuestionSoundSlotContext)
}

export function useQuestionSoundSlotRef() {
  const slot = useQuestionSoundSlot()
  const setSlotEl = slot?.setSlotEl
  return useCallback(
    (node: HTMLSpanElement | null) => {
      setSlotEl?.(node)
    },
    [setSlotEl],
  )
}

export function useQuestionSoundPlacement() {
  const slot = useQuestionSoundSlot()
  const [allowOverlayFallback, setAllowOverlayFallback] = useState(false)

  useEffect(() => {
    if (!slot || slot.slotEl) {
      setAllowOverlayFallback(false)
      return
    }
    const id = window.requestAnimationFrame(() => {
      setAllowOverlayFallback(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [slot, slot?.slotEl])

  return {
    inlineEl: slot?.slotEl ?? null,
    hideOverlay: slot != null && !slot.slotEl && !allowOverlayFallback,
  }
}

export function QuestionSoundPlacement({
  children,
  fallback,
}: {
  children: ReactNode
  fallback: ReactNode
}): JSX.Element | null {
  const { inlineEl, hideOverlay } = useQuestionSoundPlacement()

  if (inlineEl) return createPortal(children, inlineEl)
  if (hideOverlay) return null
  return <>{fallback}</>
}
