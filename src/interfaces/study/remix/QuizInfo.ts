import { ShuffledQuizItem } from '@hooks/study/remix/useQuizManager'
import { StudyMode } from '@interfaces/common/Types'

/**
 * Remix 학습 진행 정보 — Act1 / Act2 컴포넌트에 전달되는 현재 라운드 컨텍스트.
 *
 * NOTE: `incorrectQuizzes` 의 요소 타입(`ShuffledQuizItem`) 은 `useQuizManager`
 *  내부 정의를 그대로 차용한다. 이상적으로는 `ShuffledQuizItem` 도 interfaces 로
 *  분리해야 하지만, `ActivityType` / `BaseQuiz` 등 useQuizManager 의 내부 데이터
 *  표현이 다수 따라오므로 이번 atomic 정리에서는 보류한다.
 */
export type QuizInfo = {
  mode: StudyMode
  stage: number
  round: number
  isAct1: boolean
  /** 틀린 문제들 */
  incorrectQuizzes: ShuffledQuizItem[]
}
