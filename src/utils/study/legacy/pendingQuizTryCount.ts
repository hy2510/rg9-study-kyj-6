import type { IRecordAnswerType } from '@src/interfaces/common/Common'

/**
 * 이어풀기 진입 시점에서 "현재 진행 중인 quiz" 의 미해결 시도 횟수를 계산.
 *
 * 학생은 step / quiz 를 **항상 순서대로** 풀기 때문에, 하트 차감 동기화는
 * 활동 첫 진입 시점에서 마지막 quiz 의 진행 상태만 반영하면 충분하다.
 *
 * 동작
 * - record 가 없음           → `0`
 * - 마지막 record `OX === '1'` (정답 처리) → `0`  (그 quiz 는 이미 끝남)
 * - 마지막 record `AnswerCount >= maxQuizCount` (시도 소진) → `0`  (이미 다음 quiz 로 진행됨)
 * - 그 외 (같은 quiz 안에서 시도 중) → `last.AnswerCount`
 *
 * 호출 패턴
 * ```ts
 * heart.setMax(quizAnswerCount)
 * heart.setCurrent(
 *   quizAnswerCount - pendingQuizTryCount(recordedData, quizAnswerCount),
 * )
 * ```
 *
 * 빈칸 단위 채점 활동 (CT3 / Summary2) 은 record 의 단위가 빈칸 단위라
 * 이 헬퍼를 그대로 사용하지 않는다.
 */
export function pendingQuizTryCount(
  recordedData: IRecordAnswerType[] | undefined,
  maxQuizCount: number,
): number {
  if (!recordedData || recordedData.length === 0) return 0

  const last = recordedData[recordedData.length - 1]
  if (!last) return 0
  if (last.OX === '1') return 0

  const cnt = last.AnswerCount ?? 0
  if (cnt >= maxQuizCount) return 0

  return cnt
}
