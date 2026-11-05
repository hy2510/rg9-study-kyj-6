import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'

/**
 * Legacy 표준 채점 활동의 이어풀기 시작 위치 계산.
 *
 * 7th 의 `useCurrentQuizNo` 와 동일한 로직 (hook 형태였지만 실제로는 순수 계산).
 *
 * 규칙
 * - student 모드가 아니거나 record 가 없으면 `[1, 0]`
 * - 마지막 record 의 `AnswerCount === maxQuizCount` 또는 `OX === '1'` → 다음 문제부터
 * - 그 외 → 같은 문제, 시도 횟수 누적 상태로 재시작
 *
 * 빈칸 단위 채점 활동(`Summary2`)은 record 의 의미가 달라 이 함수를
 * 그대로 사용하지 않는다.
 *
 * @returns `[startQuizNo, startTryCount]` — 시작할 1-based quizNo / 누적 시도 횟수
 */
export function calcStartPosition(
  studyMode: Mode,
  recordedData: IRecordAnswerType[],
  maxQuizCount: number,
): [number, number] {
  let currentQuizNo = 1
  let tryCnt = 0

  if (studyMode === 'student' && recordedData && recordedData.length > 0) {
    const last = recordedData[recordedData.length - 1]

    if (last.AnswerCount === maxQuizCount) {
      currentQuizNo = last.CurrentQuizNo + 1
    } else if (last.OX === '1') {
      currentQuizNo = last.CurrentQuizNo + 1
    } else {
      currentQuizNo = last.CurrentQuizNo
      tryCnt = last.AnswerCount
    }
  }

  return [currentQuizNo, tryCnt]
}
