import { HeaderBaseProps } from '@interfaces/common/header/HeaderBaseProps'

/**
 * Study variant 의 공통(공유) 필드.
 * - Legacy / Remix 두 학습 엔진이 모두 헤더에 표시해야 하는 항목만 포함
 * - 엔진별 고유 항목(증강, Review 카운트, Act1 skip, Quiz mode 등)은
 *   각 엔진별 props 에서 확장
 */
export type HeaderStudyBaseProps = HeaderBaseProps & {
  variant: 'study'
  shouldShowCenterInfo: boolean
  currentHeart: number
  maxHeart: number
  time: { timeMin: number; timeSec: number }
  formatTime: (timeMin: number, timeSec: number) => string
  progress: number
  total: number
  /** 현재 Test 문제 번호. Practice/인트로에서는 전달하지 않는다. */
  questionNumber?: number
  isBookTypePB: boolean
  /**
   * 설정 시 좌측 상태 pill 에서 시계/하트 대신 이 텍스트를 표시한다.
   * (예: WritingActivity2 의 "Writing Activity", Review Pass 의 "Review Mode")
   */
  statusLabel?: string
  /**
   * 리뷰 모드 배지 텍스트 — 시계/하트와 나란히 좌측에 서브틀 라벨로 표시된다.
   * `statusLabel` 이 있는 경우(라벨만 노출) 에는 사용되지 않으며,
   * Review Fail(다시 풀기) 상황에서만 지정한다.
   */
  reviewBadge?: string
}
