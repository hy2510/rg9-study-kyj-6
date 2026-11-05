import { ClozeInputValue } from '@interfaces/study/legacy/legacyTypes'

/** `Quiz.Examples` 개수만큼 빈 입력값 배열 생성 */
export function buildEmptyInputs(examples: unknown[]): ClozeInputValue[] {
  return examples.map(() => ({ text: '', isCorrected: false }))
}

/**
 * iPhone 소프트 키보드에서 입력되는 곡선 따옴표를 직선 따옴표로 정규화.
 * onInputChange / onPenaltyInputChange 양쪽에서 공통으로 사용.
 */
export function normalizeInputText(text: string): string {
  const tail = text.slice(-1)
  if (tail === '\u2018' || tail === '\u2019') return text.slice(0, -1) + "'"
  if (tail === '\u201D') return text.slice(0, -1) + '"'
  return text
}

export type SentenceToken = {
  word: string
  /** 빈칸이면 0-based 빈칸 인덱스, 일반 단어이면 -1 */
  index: number
  /** 원본 split 배열의 위치 (key prop 용) */
  key: number
}

/**
 * 문장을 공백 단위로 분리하고 `┒` 위치에 빈칸 인덱스를 매핑.
 * ClozeTest2 / ClozeTest3 에서 공통으로 사용하는 로직.
 */
export function buildSentenceTokens(sentence: string): SentenceToken[] {
  let blankIdx = -1
  return sentence.split(' ').map((word, i) => {
    const hasBlank = word.includes('┒')
    if (hasBlank) blankIdx += 1
    return { word, index: hasBlank ? blankIdx : -1, key: i }
  })
}
