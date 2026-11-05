import { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'

/**
 * 사이드바가 한 step 카드를 그릴 때 필요한 진행 정보.
 *
 * 표시 모델:
 *   ┌──────┬───┬───┬───┐
 *   │  Q1  │ X │ O │   │   ← 시도 1=X, 2=O 정답 → 3은 빈 칸
 *   │  Q2  │ X │ X │ X │   ← 3번 모두 오답 후 강제 진행
 *   │  Q3  │   │   │   │   ← 미시도
 *   └──────┴───┴───┴───┘
 *
 * - `quizCount`        : `quizData.Quiz.length` (행 갯수)
 * - `quizAnswerCount`  : `quizData.QuizAnswerCount` (각 행의 칸 갯수 = 시도 가능 횟수)
 * - `attempts`         : `[quizIndex][attemptIndex]` 2차원 배열
 *                         - quizIndex 는 `Quiz` 배열의 순서
 *                         - attemptIndex 는 0-base 시도 차수
 *                         - 각 칸은 `recordedData` 의 (QuizNo, AnswerCount) 매칭으로 결정
 *                         - length: attempts.length === quizCount,
 *                                   attempts[i].length === quizAnswerCount
 */
export type LegacyStepProgress = {
  quizCount: number
  quizAnswerCount: number
  attempts: LegacyQuizMark[][]
}
