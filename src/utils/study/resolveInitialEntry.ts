import type { IStudyInfo } from '@src/interfaces/study/IStudyInfo'
import type { ViewType } from '@interfaces/common/ViewType'

/**
 * 앱 초기 진입 시 활성화할 뷰(또는 특수 상태)를 서술한다.
 *
 * - `view`   : 곧바로 해당 `ViewType` 으로 setCurrentView.
 * - `guideReady` : guide 모드 전용 — `currentView` 는 그대로 두고
 *   부모(iframe embed)에게 `{ type: 'READY' }` postMessage 후 대기.
 */
export type InitialEntry =
  | { kind: 'view'; view: ViewType }
  | { kind: 'guideReady' }

/**
 * 초기 진입 시 활성화할 뷰를 결정한다.
 *
 * 결정 순서:
 * 1. 일회성 진입 플래그 — `isStartWordPractice`, `isStartSpeak` 가 있으면 최우선.
 * 2. `mode` 축(guide / preview / staff / review / student) — `switch` 로 각 모드별로 처리.
 *    `mode` 는 항상 한 값이므로 case 사이에 순서 의존이 존재하지 않는다.
 *    새 모드 추가 시 `switch` 가 exhaustive 하지 않으면 컴파일 에러로 잡힌다.
 * 3. `student / staff / review` 는 학습 게이트(별점·완독) 및 도서 타입으로 뷰를 정한다.
 *
 * 이 함수는 순수하며(사이드 이펙트 없음) — postMessage 등은 호출자가 결과를 보고 수행.
 */
export function resolveInitialEntry(studyInfo: IStudyInfo): InitialEntry {
  // (1) 진입 플래그 — 모드보다 상위
  if (studyInfo.isStartWordPractice) {
    return { kind: 'view', view: 'WordPractice' }
  }
  if (studyInfo.isStartSpeak) {
    return { kind: 'view', view: 'Speak' }
  }

  // (2) 모드 축 — switch 로 각 모드별 로직을 격리
  switch (studyInfo.mode) {
    case 'guide':
      // 대기 상태 유지 — GO_STEP / GO_STORY 수신 후 뷰 전환
      return { kind: 'guideReady' }

    case 'preview':
      return { kind: 'view', view: 'Story' }

    case 'student':
    case 'trial':
    case 'staff':
    case 'review':
      return resolveDefaultEntry(studyInfo)
  }
}

/**
 * student / staff / review 공통 진입 규칙.
 *
 * - 리뷰 모드는 완료된 학습을 다시 열람하는 용도 → Story/별점 게이트를 건너뛰고 바로 Study.
 * - 별점을 이미 제출한 회귀 유저는 Story 인트로를 다시 볼 필요 없이 Study.
 * - EB 도서(그림책 유형)는 Story 부터 시작.
 * - 그 외(주로 PB) 는 Study 부터 시작.
 */
function resolveDefaultEntry(studyInfo: IStudyInfo): InitialEntry {
  if (studyInfo.isReview) return { kind: 'view', view: 'Study' }
  if (studyInfo.isSubmitPreference) return { kind: 'view', view: 'Study' }
  if (studyInfo.bookType === 'EB') return { kind: 'view', view: 'Story' }
  return { kind: 'view', view: 'Study' }
}
