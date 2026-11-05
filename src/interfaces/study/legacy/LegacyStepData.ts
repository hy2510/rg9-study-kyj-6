import { IRecordAnswerType } from '@interfaces/common/Common'

/**
 * 한 step 의 prefetch 결과.
 *
 * - `quizData` 는 활동마다 응답 타입이 달라 `unknown` 으로 보관한다.
 *   활동 컴포넌트가 자신이 알고 있는 타입으로 좁혀 사용한다.
 *   사이드바는 컨테이너에서 `{ Quiz: { QuizNo }[] }` 로 좁혀 사용 (stepProgressMap).
 * - `recordedData` 는 모든 활동이 동일하게 사용하는 답안 기록 배열.
 *   사이드바의 시도별 정·오답 표시는 이 데이터를 (QuizNo, AnswerCount) 단위로
 *   매칭해 만든다.
 * - `quizAnswerCount` 는 응답의 `QuizAnswerCount` 추출 — 한 문제당 시도 가능
 *   횟수. 사이드바가 한 문제 행을 quizAnswerCount 칸으로 그릴 때 사용한다.
 */
export type LegacyStepData = {
  /** `studyInfo.mappedStepActivity[stepId - 1]` 값 (예: 'ListeningActivity2') */
  activity: string
  /** 활동별 raw quiz 데이터 (활동마다 타입 다름) */
  quizData: unknown
  /** 답안 기록 — 이어풀기 / 사이드바 정·오답 표시 등에 사용 */
  recordedData: IRecordAnswerType[]
  /** 한 문제당 시도 가능 횟수 (응답의 `QuizAnswerCount`) */
  quizAnswerCount: number
}
