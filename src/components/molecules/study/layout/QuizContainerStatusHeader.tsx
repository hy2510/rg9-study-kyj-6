import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { IconClockBasic } from '@components/atoms/common/icons/IconClockBasic'
import { IconHeartBasic } from '@components/atoms/common/icons/IconHeartBasic'
import { IconQuizQuestion } from '@components/atoms/common/icons/IconQuizQuestion'
import { useStudyStatus } from '@contexts/StudyStatusContext'

export default function QuizContainerStatusHeader() {
  const status = useStudyStatus()
  if (!status?.show) return null

  return (
    <HeaderRow>
      {status.questionNumber != null ? (
        <Item>
          <IconQuizQuestion width={20} height={20} aria-hidden />
          <span>{status.questionNumber}</span>
        </Item>
      ) : null}
      {status.statusLabel ? (
        <Label>{status.statusLabel}</Label>
      ) : status.isReviewMode &&
        status.reviewCurrent != null &&
        status.reviewTotal != null ? (
        <Label>
          Review {status.reviewCurrent}/{status.reviewTotal}
        </Label>
      ) : (
        <>
          {status.reviewBadge ? <Label>{status.reviewBadge}</Label> : null}
          {status.questionNumber != null ? (
            <Item>
              <IconHeartBasic width={20} height={20} alt='' aria-hidden />
              <span>{status.currentHeart}</span>
            </Item>
          ) : null}
          <Item>
            <IconClockBasic width={20} height={20} alt='' aria-hidden />
            <span>{status.timeText}</span>
          </Item>
        </>
      )}
    </HeaderRow>
  )
}

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  flex-shrink: 0;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 40px 40px 0 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.1);
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);

  ${media.tablet} {
    border-radius: 28px 28px 0 0;
  }

  ${media.mobile} {
    border-radius: 24px 24px 0 0;
  }
`

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1;
  color: #3c4b62;

  img,
  svg {
    display: block;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`

const Label = styled.span`
  font-family: 'Rg-B', sans-serif;
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1;
  color: #3c4b62;
`
