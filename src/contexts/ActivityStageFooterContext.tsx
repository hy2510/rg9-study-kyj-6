import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'

type ActivityStageFooterContextValue = {
  footer: ReactNode | null
  setFooter: (node: ReactNode | null) => void
}

const ActivityStageFooterContext = createContext<ActivityStageFooterContextValue | null>(null)

export function ActivityStageFooterProvider({ children }: { children: ReactNode }) {
  const [footer, setFooter] = useState<ReactNode | null>(null)
  const value = useMemo(() => ({ footer, setFooter }), [footer])
  return (
    <ActivityStageFooterContext.Provider value={value}>
      {children}
    </ActivityStageFooterContext.Provider>
  )
}

export function useActivityStageFooter() {
  const context = useContext(ActivityStageFooterContext)
  if (!context) throw new Error('useActivityStageFooter must be used within ActivityStageFooterProvider')
  return context
}

export function useActivityStageFooterOptional() {
  return useContext(ActivityStageFooterContext)
}
