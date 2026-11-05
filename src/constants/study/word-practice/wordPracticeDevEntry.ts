import type { WordPracticeLevelCode } from '@src/constants/study/word-practice/wordPracticeLevels'
import { resolveWordPracticeLevel } from '@src/constants/study/word-practice/wordPracticeLevels'

export type WordPracticeADevStep =
  | 'practice1'
  | 'practice2'
  | 'practice3'
  | 'practice4'
  | 'practice5'
  | 'practice6'

export type WordPracticeBDevStep =
  | 'practiceB1'
  | 'practiceB2'
  | 'practiceB3'
  | 'practiceB4'

export type WordPracticeDevStep = WordPracticeADevStep | WordPracticeBDevStep
export type WordPracticeStepItemCounts = Record<WordPracticeDevStep, number>

export const WORD_PRACTICE_A_STEP_ORDER: WordPracticeADevStep[] = [
  'practice1',
  'practice2',
  'practice3',
  'practice4',
  'practice5',
  'practice6',
]

export const WORD_PRACTICE_B_STEP_ORDER: WordPracticeBDevStep[] = [
  'practiceB1',
  'practiceB2',
  'practiceB3',
  'practiceB4',
]

export const WORD_PRACTICE_DEV_ENTRY = {
  ENABLED: true,
  LEVEL: 'ka' satisfies WordPracticeLevelCode,
  START_STEP: 'practiceB1' satisfies WordPracticeDevStep,
  START_ITEM_INDEX: 0,
} as const

export type WordPracticeDevEntryState = {
  step: WordPracticeDevStep
  itemIndex: number
}

export function resolveActiveWordPracticeLevel(): WordPracticeLevelCode {
  if (import.meta.env.DEV && WORD_PRACTICE_DEV_ENTRY.ENABLED) {
    return resolveWordPracticeLevel(WORD_PRACTICE_DEV_ENTRY.LEVEL)
  }
  return 'ka'
}

export function getWordPracticeStepOffset(
  step: WordPracticeDevStep,
  stepOrder: readonly WordPracticeDevStep[],
  itemCounts: WordPracticeStepItemCounts,
): number {
  let offset = 0
  for (const currentStep of stepOrder) {
    if (currentStep === step) break
    offset += itemCounts[currentStep]
  }
  return offset
}

export function resolveWordPracticeDevEntry(
  stepOrder: readonly WordPracticeDevStep[],
  itemCounts: WordPracticeStepItemCounts,
): WordPracticeDevEntryState | null {
  if (!import.meta.env.DEV || !WORD_PRACTICE_DEV_ENTRY.ENABLED) return null

  const fallbackStep = stepOrder[0]
  const step = stepOrder.includes(WORD_PRACTICE_DEV_ENTRY.START_STEP)
    ? WORD_PRACTICE_DEV_ENTRY.START_STEP
    : fallbackStep
  const stepItemCount = itemCounts[step]
  const itemIndex = Math.min(
    Math.max(0, WORD_PRACTICE_DEV_ENTRY.START_ITEM_INDEX),
    Math.max(0, stepItemCount - 1),
  )
  return { step, itemIndex }
}

export function getWordPracticeDevInitialProgress(
  step: WordPracticeDevStep,
  totalQuestions: number,
  stepOrder: readonly WordPracticeDevStep[],
  itemCounts: WordPracticeStepItemCounts,
): { current: number; total: number } {
  const devEntry = resolveWordPracticeDevEntry(stepOrder, itemCounts)
  if (!devEntry || devEntry.step !== step) {
    return { current: 1, total: totalQuestions }
  }
  const stepOffset = getWordPracticeStepOffset(step, stepOrder, itemCounts)
  return {
    current: stepOffset + devEntry.itemIndex + 1,
    total: totalQuestions,
  }
}

export function getWordPracticeInitialItemIndex(
  step: WordPracticeDevStep,
  stepOrder: readonly WordPracticeDevStep[],
  itemCounts: WordPracticeStepItemCounts,
): number {
  const devEntry = resolveWordPracticeDevEntry(stepOrder, itemCounts)
  if (!devEntry || devEntry.step !== step) return 0
  return devEntry.itemIndex
}
