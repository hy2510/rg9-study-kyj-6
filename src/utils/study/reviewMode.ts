import { BookInfo } from '@src/interfaces/common/IBookInfo'
import { IStudyInfo } from '@src/interfaces/study/IStudyInfo'

/**
 * 정답을 미리 노출하거나 보기를 섞지 않는 "관찰 모드" 여부.
 * staff(선생님) 모드만 해당한다. guide 모드는 저장만 안 하는 student 모드이므로 제외.
 */
export function isObserverMode(
  studyInfo: Pick<IStudyInfo, 'mode'> | undefined,
): boolean {
  return studyInfo?.mode === 'staff'
}

/**
 * 리뷰 모드에서 이미 학습을 통과(Average >= 70)한 상태인지 여부.
 * true 인 경우 각 활동은 정답을 미리 노출하거나 자동 채움 등의 "학습 완료 상태" UI 를 노출한다.
 */
export function isReviewPassMode(
  studyInfo: Pick<IStudyInfo, 'mode'> | undefined,
  bookInfo: Pick<BookInfo, 'Average'> | undefined,
): boolean {
  if (!studyInfo || !bookInfo) return false
  if (studyInfo.mode !== 'review') return false
  return Number(bookInfo.Average) >= 70
}

/**
 * 리뷰 모드에서 학습을 실패(Average < 70)한 상태인지 여부.
 * true 인 경우 각 활동은 리뷰이지만 다시 풀도록 진행한다.
 */
export function isReviewFailMode(
  studyInfo: Pick<IStudyInfo, 'mode'> | undefined,
  bookInfo: Pick<BookInfo, 'Average'> | undefined,
): boolean {
  if (!studyInfo || !bookInfo) return false
  if (studyInfo.mode !== 'review') return false
  return Number(bookInfo.Average) < 70
}
