import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

import type {
  WordPracticeScorePayloadItem,
  WordPracticeScoreResult,
  WordPracticeScoreSourceItem,
  WordScoreSummaryItem,
} from '@interfaces/study/word-practice/wordPracticeScore'
import type { WordPracticeDevStep } from '@src/constants/study/word-practice/wordPracticeDevEntry'
import {
  applyWordPracticeScoreEvent,
  buildWordPracticeScorePayload,
  buildWordScoreSummaries,
  initWordScoreMap,
} from '@utils/wordPracticeScore'

type WordPracticeScoreContextValue = {
  recordStepResult: (
    word: string,
    step: WordPracticeDevStep,
    result: WordPracticeScoreResult,
  ) => void
  recordMatchFirstAttempt: (words: string[], isCorrect: boolean) => void
  getScoreSummaries: () => WordScoreSummaryItem[]
  getScorePayload: () => WordPracticeScorePayloadItem[]
}

const WordPracticeScoreContext =
  createContext<WordPracticeScoreContextValue | null>(null)

type WordPracticeScoreProviderProps = {
  items: WordPracticeScoreSourceItem[]
  children: ReactNode
}

export function WordPracticeScoreProvider({
  items,
  children,
}: WordPracticeScoreProviderProps) {
  const recordsRef = useRef(initWordScoreMap(items))
  const matchFirstAttemptRef = useRef(new Set<string>())

  const recordStepResult = useCallback(
    (
      word: string,
      step: WordPracticeDevStep,
      result: WordPracticeScoreResult,
    ) => {
      const record = recordsRef.current[word]
      if (!record) return
      applyWordPracticeScoreEvent(record, step, result)
    },
    [],
  )

  const recordMatchFirstAttempt = useCallback(
    (words: string[], isCorrect: boolean) => {
      const result: WordPracticeScoreResult = isCorrect
        ? 'correct'
        : 'incorrect'
      words.forEach((word) => {
        if (matchFirstAttemptRef.current.has(word)) return
        matchFirstAttemptRef.current.add(word)
        recordStepResult(word, 'practiceB3', result)
      })
    },
    [recordStepResult],
  )

  const getScoreSummaries = useCallback(
    () => buildWordScoreSummaries(recordsRef.current, items),
    [items],
  )

  const getScorePayload = useCallback(
    () => buildWordPracticeScorePayload(recordsRef.current, items),
    [items],
  )

  const value = useMemo(
    () => ({
      recordStepResult,
      recordMatchFirstAttempt,
      getScoreSummaries,
      getScorePayload,
    }),
    [
      getScorePayload,
      getScoreSummaries,
      recordMatchFirstAttempt,
      recordStepResult,
    ],
  )

  return (
    <WordPracticeScoreContext.Provider value={value}>
      {children}
    </WordPracticeScoreContext.Provider>
  )
}

export function useWordPracticeScore() {
  const context = useContext(WordPracticeScoreContext)
  if (!context)
    throw new Error(
      'useWordPracticeScore must be used within WordPracticeScoreProvider',
    )
  return context
}

export function useWordPracticeScoreOptional() {
  return useContext(WordPracticeScoreContext)
}
