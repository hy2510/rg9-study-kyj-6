import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'

/**
 * 시도 차수별 부분 점수 가중치 (사내 정책 — 최대 3번 기회).
 *
 * - 1차 정답: 1.0
 * - 2차 정답: 0.5
 * - 3차 정답: 0.25
 * - 4차 이상 / 정답 없음 / 미시도: 0
 *
 * 이 값은 `useStudentAnswer.getScore` 의 가중치와 동일하다.
 * `quizAnswerCount` 가 3 보다 큰 활동이라도 4차 이상 정답에는 점수가 붙지 않는다.
 */
const ATTEMPT_WEIGHTS = [1.0, 0.5, 0.25] as const

/**
 * 한 step 의 시도 행렬에서 평균(=총) 점수를 계산한다.
 *
 * 입력 `attempts` 는 `buildStepProgressMap` 의 산출물과 동일한 구조:
 *   - `attempts[i]` : 한 행 (문제 단위 또는 빈칸 단위)
 *   - `attempts[i][j]` : `'O' | 'X' | ''`
 *
 * 채점 규칙
 * - 행마다 처음 등장하는 `'O'` 의 시도 차수(j) 에 따라 `ATTEMPT_WEIGHTS[j]` 부여
 * - `'O'` 가 없거나 j 가 가중치 범위를 벗어나면 0
 * - 전체 행 평균 = sum(weight) * (100 / 행 수)
 *
 * @returns 0~100 정수. `attempts.length === 0` 인 경우 0.
 */
export function computeStepScore(attempts: LegacyQuizMark[][]): number {
  const total = attempts.length
  if (total === 0) return 0

  const point = 100 / total
  let score = 0

  for (const row of attempts) {
    const firstCorrectIdx = row.indexOf('O')
    if (firstCorrectIdx >= 0 && firstCorrectIdx < ATTEMPT_WEIGHTS.length) {
      score += point * ATTEMPT_WEIGHTS[firstCorrectIdx]
    }
  }

  return Math.round(score)
}

/**
 * 정답 행 수 — 행 안에 `'O'` 가 한 번이라도 등장한 행의 갯수.
 *
 * 한 행은 한 문제(또는 빈칸) 단위이며, 어느 시도 차수든 `'O'` 가 한 번 나오면
 * 그 행은 결과적으로 정답 처리된다. 4차 이상에서 정답이어도 행 단위로는 정답으로
 * 본다(가중치 0 점이지만 "맞춘 문제 수" 표시에는 포함).
 */
export function countCorrectRows(attempts: LegacyQuizMark[][]): number {
  let n = 0
  for (const row of attempts) {
    if (row.includes('O')) n++
  }
  return n
}
