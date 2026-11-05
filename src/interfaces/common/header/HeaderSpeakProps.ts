import { HeaderBaseProps } from '@interfaces/common/header/HeaderBaseProps'

/**
 * Speak 화면 전용 헤더 props.
 */
export type HeaderSpeakProps = HeaderBaseProps & {
  variant: 'speak'
  progress?: number
  total?: number
  onBackToStory: () => void
  /** Speak 연습 카드(팝업) 다시 열기 — 사이드 메뉴 「말하기 시작」 */
  onOpenSpeakPractice?: () => void
}
