import type { BookInfo } from '@src/interfaces/common/IBookInfo'
import type { IStudyInfo } from '@src/interfaces/study/IStudyInfo'

/**
 * "Story/MovieBook 화면에서 학습(Study)으로 진입할 수 있는가?" 정책 판정.
 *
 * 이 정책은 원래 `StoryContainer` / `MovieBookContainer` 두 곳에 동일 표현식으로
 * 복붙되어 있었다. 정책 변경 시 한쪽만 수정하는 사고를 방지하기 위해 헬퍼로 통일한다.
 *
 * 규칙(원본 로직과 완전 동치):
 * - `preview` 모드는 학습 미리보기 용도이므로 진입 불가.
 * - `staff` 모드는 학생 게이트와 무관하게 항상 진입 가능.
 * - 그 외(student / review / guide 등)는 별점 제출 or EB 완독 중 하나가 만족되어야 진입 가능.
 */
export function canEnterQuiz(
  studyInfo: Pick<IStudyInfo, 'mode' | 'isSubmitPreference'>,
  bookInfo: Pick<BookInfo, 'ReadingCompletedEB'> | undefined,
): boolean {
  if (studyInfo.mode === 'preview') return false
  if (studyInfo.mode === 'staff') return true
  return Boolean(
    studyInfo.isSubmitPreference || bookInfo?.ReadingCompletedEB === 'Y',
  )
}

/**
 * "학습(Study) 진입 불가" 상태일 때 사용자에게 보여줄 얼럿 메시지의 i18n 키.
 * 사유별로 문구가 다르므로 컨테이너 → 헤더/사이드메뉴/완독팝업에 전달해 사용한다.
 *
 * - `preview` 모드: "Preview 모드에서는 학습을 진행할 수 없습니다."
 * - 그 외(완독 미충족): "스토리를 끝까지 읽은 후 퀴즈를 풀 수 있습니다."
 */
export function getGoQuizDisabledMessageKey(
  studyInfo: Pick<IStudyInfo, 'mode'>,
): string {
  if (studyInfo.mode === 'preview') return 'story.previewCannotStudy'
  return 'story.quizRequiresFullReading'
}
