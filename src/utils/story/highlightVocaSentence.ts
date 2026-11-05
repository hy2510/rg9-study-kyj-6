import {
  VOCA_HIGHLIGHT_COLOR,
  WORD_HIGHLIGHT_MAP,
} from '@src/constants/study/vocabulary/wordHighlightMap'

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function wrapRed(text: string): string {
  return `<span style="color: ${VOCA_HIGHLIGHT_COLOR}">${text}</span>`
}

/**
 * 문장에서 `text` 매치 영역을 수집해 placeholder 로 치환한다.
 * 이후 일괄 치환 단계에서 placeholder 를 실제 하이라이트 HTML 로 바꾸어
 * **이미 wrap 된 영역 안쪽이 다른 target 에 재매치되는 리스크** 를 차단한다.
 */
function applyTarget(
  sentence: string,
  text: string,
  baseOnly: string | undefined,
  placeholderMap: Map<string, string>,
  targetIdx: number,
): string {
  const pattern = new RegExp(`(${escapeRegExp(text)})`, 'gi')
  let matchIdx = 0
  return sentence.replace(pattern, (match) => {
    const key = `__HLIT_${targetIdx}_${matchIdx++}__`
    let html: string
    if (!baseOnly) {
      html = wrapRed(match)
    } else {
      const idx = match.toLowerCase().indexOf(baseOnly.toLowerCase())
      if (idx < 0) {
        html = wrapRed(match)
      } else {
        const before = match.slice(0, idx)
        const red = match.slice(idx, idx + baseOnly.length)
        const after = match.slice(idx + baseOnly.length)
        html = `${before}${wrapRed(red)}${after}`
      }
    }
    placeholderMap.set(key, html)
    return key
  })
}

/**
 * Vocabulary Practice 2 문장을 BookCode 매칭 config 로 하이라이트한다.
 *
 * - config 매치: `targets` 를 순회해 각 regex 매치를 빨강 처리 (`baseOnly` 는 어근만)
 * - config 미매치: `fallbackWord` (문제 단어) 를 regex 매치해 빨강 처리
 */
export function highlightVocaSentence(
  sentence: string,
  bookCode: string | undefined,
  fallbackWord: string,
): string {
  if (!sentence) return sentence

  const placeholderMap = new Map<string, string>()
  let result = sentence

  const configs = bookCode ? WORD_HIGHLIGHT_MAP[bookCode] : undefined
  const config = configs?.find(
    (c) => c.sentence.toLowerCase() === sentence.toLowerCase(),
  )

  if (config) {
    config.targets.forEach(({ text, baseOnly }, targetIdx) => {
      result = applyTarget(result, text, baseOnly, placeholderMap, targetIdx)
    })
  } else if (fallbackWord) {
    result = applyTarget(result, fallbackWord, undefined, placeholderMap, 0)
  }

  placeholderMap.forEach((html, key) => {
    result = result.split(key).join(html)
  })

  return result
}
