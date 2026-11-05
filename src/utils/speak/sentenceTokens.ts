export type SentenceDisplayToken = {
  text: string
  /** 공백이 아닌 실제 단어 인덱스(0-based). 공백 토큰이면 undefined. */
  wordIndex?: number
}

/**
 * 문장을 공백/단어 토큰 배열로 분리한다.
 *
 * - 공백 자체도 유지되므로 렌더러가 원문의 간격/개행을 그대로 재현 가능.
 * - 각 단어 토큰에는 `wordIndex` (0-based) 가 부여되어 speech recognition 의
 *   `matchedWordIndexes` 와 매칭할 수 있다.
 */
export function getSentenceDisplayTokens(
  sentence: string,
): SentenceDisplayToken[] {
  let wordIndex = -1

  return sentence.split(/(\s+)/).map((text) => {
    if (/^\s+$/.test(text)) return { text }
    wordIndex += 1
    return { text, wordIndex }
  })
}
