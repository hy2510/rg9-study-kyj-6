import { type ReactNode } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import QuizContainerStatusHeader from '@components/molecules/study/layout/QuizContainerStatusHeader'

type ActivityStageProps = {
  /** stage 안에 그릴 활동 콘텐츠 */
  children: ReactNode
  /**
   * Content/Body 바깥에 띄우고 싶은
   * 부수 요소(Remix 의 ActivityTypeBadge 등). Legacy 는 미전달.
   */
  extras?: ReactNode
}

/**
 * Remix / Legacy 학습 활동 공통 무대.
 *
 * - 반투명 검정 + blur + 둥근 테두리 패널 (배경판)
 * - 내부 flex column + gap 24px (활동 안의 섹션들 사이 간격)
 *
 * 이 셸 위에 `QuizBody`/`QuizComment`/카드 섹션 등이 그려진다.
 */
export default function ActivityStage({
  children,
  extras,
}: ActivityStageProps) {
  return (
    <StageWrapper>
      <StageContent>
        <QuizContainerStatusHeader />
        <StageBodySlot>
          <StageBody>{children}</StageBody>
        </StageBodySlot>
      </StageContent>
      {extras}
    </StageWrapper>
  )
}

const StageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  ${media.mobile} {
    padding: 0 8px;
  }
`

const StageContent = styled.div`
  width: 100%;
  max-width: 900px;
  max-height: calc(100vh - 40px);
  max-height: calc(100dvh - 40px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 900px;
  min-height: 100px;
  background-color: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 40px;
  box-sizing: border-box;

  ${media.tablet} {
    min-width: 0;
    border-width: 2px;
    border-radius: 28px;
  }

  ${media.mobile} {
    border-radius: 24px;
  }
`

const StageBodySlot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  min-height: 0;
`

const StageBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;

  ${media.mobile} {
    gap: 16px;
  }
`
