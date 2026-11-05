import type {
  WordPracticeScorePayloadItem,
  WordPracticeScoreResult,
  WordPracticeScoreSourceItem,
  WordScoreRecord,
  WordScoreSummaryItem,
} from '@interfaces/study/word-practice/wordPracticeScore'
import type { WordPracticeDevStep } from '@src/constants/study/word-practice/wordPracticeDevEntry'

export function initWordScoreMap(
  items: WordPracticeScoreSourceItem[],
): Record<string, WordScoreRecord> {
  return Object.fromEntries(
    items.map((item) => [
      item.word,
      {
        wordId: item.wordId,
        word: item.word,
        meaning: item.meaning ?? '',
        correctPoints: 0,
        incorrectPoints: 0,
        events: [],
      },
    ]),
  )
}

export function computeWordScorePercent(
  correctPoints: number,
  incorrectPoints: number,
): number {
  const total = correctPoints + incorrectPoints
  if (total === 0) return 0
  return Math.round((correctPoints / total) * 100)
}

export function applyWordPracticeScoreEvent(
  record: WordScoreRecord,
  step: WordPracticeDevStep,
  result: WordPracticeScoreResult,
): void {
  record.events.push({ step, result })
  if (result === 'correct') {
    record.correctPoints += 1
    return
  }
  if (result === 'incorrect') {
    record.incorrectPoints += 1
  }
}

export function buildWordScoreSummaries(
  records: Record<string, WordScoreRecord>,
  items: WordPracticeScoreSourceItem[],
): WordScoreSummaryItem[] {
  return items.map((item) => {
    const record = records[item.word]
    return {
      wordId: item.wordId,
      word: item.word,
      meaning: item.meaning ?? record?.meaning ?? '',
      correctPoints: record?.correctPoints ?? 0,
      incorrectPoints: record?.incorrectPoints ?? 0,
      events: record?.events ?? [],
      score: computeWordScorePercent(
        record?.correctPoints ?? 0,
        record?.incorrectPoints ?? 0,
      ),
    }
  })
}

export function buildWordPracticeScorePayload(
  records: Record<string, WordScoreRecord>,
  items: WordPracticeScoreSourceItem[],
): WordPracticeScorePayloadItem[] {
  return buildWordScoreSummaries(records, items)
}
