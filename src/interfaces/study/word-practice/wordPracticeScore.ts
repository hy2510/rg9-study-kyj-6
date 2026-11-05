import type { WordPracticeDevStep } from '@src/constants/study/word-practice/wordPracticeDevEntry'

export type WordPracticeScoreResult = 'correct' | 'incorrect' | 'neutral'

export type WordPracticeScoreEvent = {
  step: WordPracticeDevStep
  result: WordPracticeScoreResult
}

export type WordPracticeScoreSourceItem = {
  wordId: string
  word: string
  meaning?: string
}

export type WordScoreRecord = {
  wordId: string
  word: string
  meaning: string
  correctPoints: number
  incorrectPoints: number
  events: WordPracticeScoreEvent[]
}

export type WordScoreSummaryItem = WordScoreRecord & {
  score: number
}

export type WordPracticeScorePayloadItem = WordScoreSummaryItem

export type WordPracticeScoreItem = {
  wordId: string
  correctCount: number
  wrongCount: number
}
