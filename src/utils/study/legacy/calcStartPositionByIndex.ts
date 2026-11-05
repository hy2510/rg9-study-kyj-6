import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { Mode } from '@src/interfaces/common/Types'

/**
 * `calcStartPosition` 의 quizArr 인덱스 변환 변형.
 *
 * RC/LA/VT 등 단발 채점 활동의 어댑터에서 `quizMetaMap` 키를 quizArr 의
 * 1-based 인덱스로 사용할 때, 시작 위치도 인덱스로 반환해 셔플된 quizArr
 * (서버에서 비연속 QuizNo 로 내려옴) 에서도 안전하게 진행하도록 한다.
 *
 * record 의 `CurrentQuizNo` 는 진짜 QuizNo (서버 식별자) 라는 가정 — 이를
 * `quizArr` 안에서 찾아 1-based 인덱스로 변환한다.
 *
 * 규칙 (`calcStartPosition` 과 동일)
 * - student 모드가 아니거나 record 가 없으면 `[1, 0]`
 * - 마지막 record 의 `AnswerCount === maxQuizCount` 또는 `OX === '1'` → 다음 인덱스
 * - 그 외 → 같은 인덱스, 시도 횟수 누적 상태로 재시작
 *
 * 이미 마지막 quiz 까지 다 푼 상태라면 `quizArr.length` 로 cap 해 마지막
 * 인덱스에 머물게 한다 (재진입 시 무한 Loading 방지).
 *
 * @returns `[startIndex (1-based), startTryCount]`
 */
export function calcStartPositionByIndex(
  studyMode: Mode,
  recordedData: IRecordAnswerType[],
  quizArr: ReadonlyArray<{ QuizNo: number }>,
  maxQuizCount: number,
): [number, number] {
  if (
    studyMode !== 'student' ||
    recordedData.length === 0 ||
    quizArr.length === 0
  ) {
    return [1, 0]
  }

  const last = recordedData[recordedData.length - 1]
  const lastIdx = quizArr.findIndex((q) => q.QuizNo === last.CurrentQuizNo)
  if (lastIdx < 0) return [1, 0]

  const isCleared = last.AnswerCount === maxQuizCount || last.OX === '1'

  if (isCleared) {
    const next = lastIdx + 2
    return [Math.min(next, quizArr.length), 0]
  }

  return [lastIdx + 1, last.AnswerCount]
}
