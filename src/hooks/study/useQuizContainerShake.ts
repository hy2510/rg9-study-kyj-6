import { createContext, useContext } from 'react'

type QuizContainerShakeContextValue = {
  triggerShake: () => void
}

export const QuizContainerShakeContext = createContext<QuizContainerShakeContextValue | null>(null)

export function useQuizContainerShake() {
  const context = useContext(QuizContainerShakeContext)
  return {
    triggerShake: context?.triggerShake ?? (() => {}),
  }
}
