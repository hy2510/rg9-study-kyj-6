import { LegacyStepData } from '@interfaces/study/legacy/LegacyStepData'
import { IRecordAnswerType } from '@src/interfaces/common/Common'

/**
 * `useLegacyQuizManager` 가 노출하는 상태.
 */
export type LegacyQuizManagerState = {
  /** stepId(1-base) → 그 step 의 prefetch 결과 */
  stepDataMap: Record<number, LegacyStepData>
  isLoading: boolean
  error: Error | null
  /**
   * 한 step 의 `recordedData` 에 record 한 개를 upsert.
   * 활동이 채점 직후 호출하면 사이드바(stepProgressMap)가 다음 렌더에서 즉시 갱신된다.
   * 같은 `QuizNo` 의 기존 record 는 교체 (없으면 push).
   */
  patchStepRecord: (stepId: number, record: IRecordAnswerType) => void
  /**
   * 한 step 의 `recordedData` 를 비운다 (재시험 등 처음부터 다시 풀기용).
   * 로컬 상태만 초기화하며, 활동 재마운트 시 시작 위치가 첫 문제로 되돌아간다.
   */
  resetStepRecord: (stepId: number) => void
}
