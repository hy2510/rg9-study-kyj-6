import type { WordMeaningPracticeItem } from '@interfaces/study/word-practice/wordMeaningPractice'
import type {
  WordPracticeContentItem,
  WordPracticeQuizItem,
} from '@interfaces/study/word-practice/wordPractice'
import { type WordPracticeTrack } from '@src/constants/study/word-practice/wordPracticeLevels'

import { getWordPracticeMeaning } from './getWordPracticeMeaning'

/**
 * 선택된 트랙에 해당하는 item 배열만 채워 반환한다.
 * - 트랙 'a' (저레벨, PracticeA1~6) → `trackAItems` 만 채움
 * - 트랙 'b' (고레벨, PracticeB1~4) → `trackBItems` 만 채움
 * - 반대편 트랙은 빈 배열.
 */
export function buildWordPracticeTrackItems(
  quizItems: WordPracticeQuizItem[],
  track: WordPracticeTrack,
  language: string,
): {
  trackAItems: WordPracticeContentItem[]
  trackBItems: WordMeaningPracticeItem[]
} {
  if (track === 'a') {
    return {
      trackAItems: quizItems.map((item) => ({
        wordId: item.WordId,
        image: item.ImagePath,
        word: item.Word,
        sound: item.SoundPath,
        meaning: getWordPracticeMeaning(item, language),
      })),
      trackBItems: [],
    }
  }
  return {
    trackAItems: [],
    trackBItems: quizItems.map((item) => ({
      wordId: item.WordId,
      word: item.Word,
      meaning: getWordPracticeMeaning(item, language),
      sound: item.SoundPath,
    })),
  }
}
