import type { WordMeaningPracticeItem } from '@interfaces/study/word-practice/wordMeaningPractice'

export const WORD_PRACTICE_B_QUESTIONS_PER_STEP = 5
export const WORD_PRACTICE_B_SESSION_CYCLE_COUNT = 2
export const WORD_PRACTICE_B_STEP_COUNT = 4
export const WORD_PRACTICE_B_QUESTIONS_PER_SESSION_CYCLE =
  WORD_PRACTICE_B_QUESTIONS_PER_STEP * WORD_PRACTICE_B_STEP_COUNT
export const WORD_PRACTICE_B_SESSION_TOTAL =
  WORD_PRACTICE_B_QUESTIONS_PER_SESSION_CYCLE * WORD_PRACTICE_B_SESSION_CYCLE_COUNT

export function buildWordPracticeBStepItems(
  items: WordMeaningPracticeItem[],
  sessionCycleIndex = 0,
): WordMeaningPracticeItem[] {
  const cycleOffset = sessionCycleIndex * WORD_PRACTICE_B_QUESTIONS_PER_STEP
  return Array.from({ length: WORD_PRACTICE_B_QUESTIONS_PER_STEP }, (_, i) => {
    const index = (cycleOffset + i) % items.length
    return items[index]
  })
}
