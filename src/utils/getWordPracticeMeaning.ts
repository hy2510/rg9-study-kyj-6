import type { WordPracticeQuizItem } from '@interfaces/study/word-practice/wordPractice'

type WordPracticeLanguage = 'ko' | 'zh' | 'ja' | 'vi' | 'id' | 'en'

const LANGUAGE_FIELD_MAP: Record<WordPracticeLanguage, keyof WordPracticeQuizItem> = {
  ko: 'Korean',
  zh: 'Chinese',
  ja: 'Japanese',
  vi: 'Vietnamese',
  id: 'Indonesian',
  en: 'English',
}

/**
 * `WordPracticeQuizItem` 에서 사용자 언어에 맞는 뜻 문자열을 꺼낸다.
 * - 지원 언어 코드가 아니면 Korean 으로 fallback.
 * - `en` 의 경우 Britannica 를 우선 사용하고, 비어있으면 English 로 fallback 한다.
 *   (trim 후 비어있는 Britannica 는 미존재로 간주)
 */
export function getWordPracticeMeaning(
  item: WordPracticeQuizItem,
  language: string,
): string {
  if (language === 'en') {
    const britannica = String(item.Britannica ?? '').trim()
    if (britannica) return item.Britannica
    return String(item.English ?? '')
  }

  const field = LANGUAGE_FIELD_MAP[language as WordPracticeLanguage]
  return field ? String(item[field] ?? '') : item.Korean
}
