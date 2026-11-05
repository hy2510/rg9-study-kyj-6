import { type ReactNode } from 'react'

import styled from 'styled-components'

import HeaderBody from '@components/molecules/common/HeaderBody'
import Header, { type HeaderProps } from '@components/organisms/common/Header'
import { QuizFeedbackProvider } from '@contexts/QuizFeedbackContext'
import { StudyStatusProvider } from '@contexts/StudyStatusContext'
import { StudyVisibilityContext } from '@contexts/StudyVisibilityContext'

type StudyShellProps = {
  /** Header organism 에 그대로 전달되는 props (variant 별 union) */
  headerProps: HeaderProps
  /** QuizFeedbackProvider 가 사용할 캐릭터 슬러그 */
  character: string
  /** Header / HeaderBody 사이 본문 영역에 렌더링될 활동 콘텐츠 */
  children: ReactNode
  /**
   * StudyWrapper 안, HeaderBody 바깥에 띄울 모달/오버레이 슬롯.
   * Remix: Augment / AcquiredAugmentsModal / IntroScreen.
   * Legacy: 일반적으로 미사용.
   */
  modals?: ReactNode
  /**
   * 현재 컨테이너가 사용자에게 보이는 상태인지.
   * Story ↔ Study 전환 시 활동은 마운트 유지, 오디오 등 부수 효과만 정지시키기
   * 위해 자식 훅에서 `useStudyVisibility()` 로 구독.
   */
  isVisible?: boolean
}

/**
 * Remix / Legacy 공통 학습 셸.
 *
 * Header(상단 + 사이드 메뉴 + ProgressBar) + HeaderBody 레이아웃 +
 * QuizFeedbackProvider 를 한곳에서 책임지므로, 두 컨테이너 모두 동일한
 * UI 환경 위에서 활동 콘텐츠를 렌더링한다.
 */
export default function StudyShell({
  headerProps,
  character,
  children,
  modals,
  isVisible = true,
}: StudyShellProps) {
  return (
    <StudyVisibilityContext.Provider value={isVisible}>
      <StudyWrapper>
        <StudyStatusProvider headerProps={headerProps}>
          <Header {...headerProps} />

          <HeaderBody $headerExpanded>
            <QuizFeedbackProvider character={character}>
              {children}
            </QuizFeedbackProvider>
          </HeaderBody>

          {modals}
        </StudyStatusProvider>
      </StudyWrapper>
    </StudyVisibilityContext.Provider>
  )
}

const StudyWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`
