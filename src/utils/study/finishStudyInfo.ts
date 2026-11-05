import { IResultType } from '@src/interfaces/common/Common'

const FINISH_STUDY_INFO_KEY = 'finishStudyInfo'

/**
 * 답안 저장/패널티 삭제 등 학습 API 응답에 종료 메시지(`resultMessage`)가 담긴 경우
 * sessionStorage 에 캡처해 마지막 스텝 종료 시 `onFinishStudyResult` 로 전달되게 한다.
 *
 * - 응답 실패(`result !== '0'`) 또는 빈 메시지인 경우 no-op
 * - 7th `handler.finishStudy` 직접 mutation + Summary1 의 sessionStorage 저장 파이프를
 *   9th 아키텍처(단일 sessionStorage) 로 통일한 형태
 */
export function captureFinishStudyInfoFromResult(res: IResultType): void {
  if (Number(res.result) !== 0) return
  if (!res.resultMessage) return
  window.sessionStorage.setItem(
    FINISH_STUDY_INFO_KEY,
    JSON.stringify({
      id: Number(res.result),
      cause: res.resultMessage,
    }),
  )
}
