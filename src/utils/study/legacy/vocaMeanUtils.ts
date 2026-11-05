import {
  IVocaQuestionBase,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

/** `MeanLanguage` (소문자) → `IVocaQuestionBase` 키 (PascalCase) 매핑 */
export function meanLangKey(
  lang: MeanLanguage,
):
  | 'Korean'
  | 'Chinese'
  | 'Japanese'
  | 'Vietnamese'
  | 'Indonesian'
  | 'English'
  | null {
  switch (lang) {
    case 'korean':
      return 'Korean'
    case 'chinese':
      return 'Chinese'
    case 'japanese':
      return 'Japanese'
    case 'vietnamese':
      return 'Vietnamese'
    case 'indonesian':
      return 'Indonesian'
    case 'english':
      return 'English'
    default:
      return null
  }
}

/**
 * 메인 의미 텍스트 반환.
 * `Question[mainLang]` 매핑 실패 시 Korean 디폴트.
 */
export function pickMainMean(
  question: IVocaQuestionBase,
  mainLang: MeanLanguage,
): string {
  const key = meanLangKey(mainLang)
  if (key) return question[key] ?? question.Korean
  return question.Korean
}

/**
 * 서브 의미 텍스트 반환.
 * `Question.Britannica` 가 있으면 우선, 없으면 `Question[subLang]`.
 */
export function pickSubMean(
  question: IVocaQuestionBase,
  subLang: MeanLanguage,
): string {
  if (question.Britannica) return question.Britannica
  const key = meanLangKey(subLang)
  if (key) return question[key] ?? ''
  return ''
}
