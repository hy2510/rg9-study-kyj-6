import { IQuizStudyRef } from '@interfaces/common/quizStudyRef'
import { IRecordAnswerType } from '@src/interfaces/study/legacy/legacyAnswers'

/**
 * 레거시 스터디 액티비티에 넘기는 props (7th QuizContainer `datas` 계열)
 *
 * Phase 2 마이그레이션 진행 중인 옵셔널 필드:
 * - `quizData` / `recordedData`: `useLegacyQuizManager` 의 prefetch 결과를
 *   컨테이너가 주입한다. 값이 있으면 활동 컴포넌트는 자체 fetch 를 생략하고
 *   props 를 사용한다. 값이 없으면(미마이그레이션 활동) 활동 컴포넌트는
 *   기존처럼 자체 fetch.
 *
 * 사이드바 즉시 갱신 흐름:
 * - 활동이 채점 직후 `onUpdateRecord(record)` 를 호출하면 컨테이너가
 *   `useLegacyQuizManager.patchStepRecord(currentStep, record)` 로 위임해
 *   `stepDataMap` 을 머지한다 (`stepProgressMap` 자동 재계산 → 사이드바 갱신).
 * - `saveUserAnswer` API 호출과 독립. 저장 실패 시 다음 문제 진입을 막는 가드는
 *   활동 컴포넌트가 보유.
 */
export interface ILegacyStudyData extends IQuizStudyRef {
  readonly currentStep: number
  readonly lastStep: number
  onFinishActivity: () => void
  changeStep: (step: number) => void

  /** prefetch 된 quizData (활동마다 타입 다름 — 활동 컴포넌트가 좁혀 사용) */
  quizData?: unknown
  /** prefetch 된 답안 기록 */
  recordedData?: IRecordAnswerType[]
  /**
   * 채점 직후 호출하는 사이드바 즉시 갱신 콜백.
   * 활동 컴포넌트가 만든 `IRecordAnswerType` 한 개를 컨테이너에 push 한다.
   * 같은 `QuizNo` 가 이미 있으면 교체된다.
   */
  onUpdateRecord?: (record: IRecordAnswerType) => void
  /**
   * 현재 화면에 표시되는 quiz(1-based)의 인덱스가 바뀔 때 호출.
   * 헤더 Q 번호를 화면과 정확히 동기화하기 위해 사용한다.
   * 활동 컴포넌트는 `currentQuizIndex` state 를 useEffect 로 이 콜백에 전달한다.
   */
  onActiveQuizChange?: (currentQuizIndex: number) => void
  /** 패널티 등 특정 구간에서 컨테이너 타이머를 일시정지/재개할 때 사용 */
  onPauseTimer?: () => void
  onResumeTimer?: () => void
  /**
   * 현재 스텝이 재시험(retest) 모드인지 여부.
   * RC4 에서만 사용 — 저장 시 `step='R'` 로 전송해 서버에서 재시험 결과로 마킹된다.
   */
  isRetest?: boolean
}
