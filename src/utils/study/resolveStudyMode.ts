import { Mode } from '@src/interfaces/common/Types'

/**
 * `REF.User` 로 허용되는 부모 계약 값.
 * 부모는 `'student' | 'staff'` 두 값만 전달한다. `'preview'` / `'trial'` / `'guide'` 는 `REF.User` 가 아니라
 * 각각 `REF.Mode` / `REF.Mode` / `REF.isGuide` 로 진입한다.
 */
export type UserRole = 'student' | 'staff'

/**
 * `studyInfo.mode` 를 결정하기 위한 입력 신호들.
 *
 * - `isGuide`        : `REF.isGuide === true` (iframe 가이드 세션)
 * - `isPreviewMode`  : `REF.Mode === 'preview'` (도서 미리보기 세션)
 * - `isTrialMode`    : `REF.Mode === 'trial'` (체험하기 세션 — student 처럼 진행하되 저장하지 않음)
 * - `userRole`       : `REF.User` 를 화이트리스트로 좁힌 값
 * - `isReview`       : 서버 응답 `responseStudyInfo.isReview` (완주 후 재열람)
 */
export interface ResolveStudyModeParams {
  isGuide: boolean
  isPreviewMode: boolean
  isTrialMode: boolean
  userRole: UserRole
  isReview: boolean
}

/**
 * `REF` / 서버 응답 신호를 단일 `Mode` enum 으로 collapse 한다.
 *
 * 우선순위:
 *   1. `guide`   — iframe 가이드
 *   2. `preview` — 도서 미리보기
 *   3. `trial`   — 체험하기
 *   4. `staff`   — 관리자
 *   5. `review`  — 완주 후 재열람
 *   6. `student` — 기본
 *
 * 각 축은 실전에서 상호배타적이지만, 이론상 조합이 들어와도 위 순서로 결정적으로 매핑된다.
 */
export function resolveStudyMode(params: ResolveStudyModeParams): Mode {
  if (params.isGuide) return 'guide'
  if (params.isPreviewMode) return 'preview'
  if (params.isTrialMode) return 'trial'
  if (params.userRole === 'staff') return 'staff'
  if (params.isReview) return 'review'
  return 'student'
}

/**
 * `REF.User` 값을 화이트리스트(`'student' | 'staff'`) 로 좁힌다.
 * 그 외/누락은 `'student'` 로 폴백해 방어적으로 처리한다.
 */
export function normalizeUserRole(rawUser: unknown): UserRole {
  return rawUser === 'staff' ? 'staff' : 'student'
}
