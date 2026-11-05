import { HeaderVariant } from '@interfaces/common/header/HeaderVariant'
import { ViewType } from '@interfaces/common/ViewType'

/**
 * 모든 헤더 변형이 공유하는 최소 props.
 * - `variant` : discriminator
 * - `bookCode`, `changeCurrentView` : 어떤 화면이든 필요한 라우팅/식별 정보
 */
export type HeaderBaseProps = {
  variant: HeaderVariant
  bookCode: string
  bookTitle?: string
  keywords?: string
  changeCurrentView: (view: ViewType) => void
  closeMenuSignal?: unknown
  /** true 이면 우상단 메뉴 버튼과 사이드 메뉴를 숨긴다 (guide 모드 등) */
  hideMenu?: boolean
}
