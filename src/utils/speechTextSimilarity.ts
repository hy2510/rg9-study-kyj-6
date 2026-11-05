/**
 * 음성 인식 결과(transcript) 와 타겟 텍스트 간 유사도 계산용 공통 유틸.
 *
 * - `useSpeakRecordingAnalysis`, `useVocaRecordingAnalysis`, `evaluateWordRecording`
 *   에서 공유되는 Levenshtein 기반 텍스트 유사도 계산.
 * - 입출력/임계값은 호출부에서 결정하고, 이 모듈은 순수 함수만 제공한다.
 */

export function normalizeSpeechText(text: string): string {
  return text
    .toLowerCase()
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getLevenshteinDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let row = 1; row <= a.length; row += 1) {
    const current = [row]

    for (let col = 1; col <= b.length; col += 1) {
      const substitutionCost = a[row - 1] === b[col - 1] ? 0 : 1
      current[col] = Math.min(
        (previous[col] ?? 0) + 1,
        (current[col - 1] ?? 0) + 1,
        (previous[col - 1] ?? 0) + substitutionCost,
      )
    }

    previous = current
  }

  return previous[b.length] ?? 0
}

export function getTextSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1

  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 0

  return (maxLength - getLevenshteinDistance(a, b)) / maxLength
}
