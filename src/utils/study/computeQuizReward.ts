import type { BookInfo } from '@src/interfaces/common/IBookInfo'

export type QuizReward = {
  tier: 'none' | 'half' | 'full'
  point: number
}

/**
 * 책 완료 횟수와 모드에 따라 Study 인트로에 표시할 포인트 보상을 산정한다.
 * - 2회 이상 완료: 보상 없음(none)
 * - 1회 완료 또는 Easy 모드: half (`SecondRgPoint` 우선, 없으면 `RgPoint / 2`)
 * - 그 외 (최초 완료, Full 모드): full (`RgPoint`)
 *
 * 반환되는 point 는 소수 둘째 자리로 반올림된다.
 */
export function computeQuizReward(bookInfo: BookInfo): QuizReward {
  const completedCount = Number(bookInfo.PassCount) || 0
  const currentMode = `${bookInfo.StudyMode ?? ''} ${
    bookInfo.FullEasyCode ?? ''
  }`
    .trim()
    .toLowerCase()
  const isEasyMode =
    currentMode.includes('easy') ||
    currentMode.split(/\s+/).some((value) => value === 'e')

  if (completedCount >= 2) {
    return { tier: 'none', point: 0 }
  }

  if (completedCount === 1 || isEasyMode) {
    const configuredSecondPoint = Number(bookInfo.SecondRgPoint) || 0
    const halfPoint =
      configuredSecondPoint > 0
        ? configuredSecondPoint
        : (Number(bookInfo.RgPoint) || 0) / 2
    return {
      tier: 'half',
      point: Number(halfPoint.toFixed(2)),
    }
  }

  return {
    tier: 'full',
    point: Number((Number(bookInfo.RgPoint) || 0).toFixed(2)),
  }
}
