import { forwardRef, useEffect, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled, { css } from 'styled-components'

// Stage(뷰포트 - 40px)에서 상태 헤더와 테두리를 제외한 본문 높이.
export const QUIZ_BODY_MAX_HEIGHT_OFFSET_PX = 96
export const QUIZ_BODY_MAX_HEIGHT_OFFSET_MOBILE_PX = 96

function getViewportHeight(fallback = 800): number {
  if (typeof window === 'undefined') return fallback
  return window.visualViewport?.height ?? window.innerHeight
}

export function calcQuizBodyMaxHeightPx(
  viewportHeight: number,
  offsetPx = QUIZ_BODY_MAX_HEIGHT_OFFSET_PX,
): number {
  return Math.max(0, viewportHeight - offsetPx)
}

function useQuizBodyMaxHeightPx() {
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight)

  useEffect(() => {
    const update = () => {
      setViewportHeight(getViewportHeight())
    }

    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  return calcQuizBodyMaxHeightPx(viewportHeight)
}

type QuizBodyProps = React.ComponentPropsWithoutRef<'div'> & {
  $maxHeightPx?: number | null
  $flexWrap?: boolean
  $fillToMaxHeight?: boolean
  $fillToMaxHeightOnTablet?: boolean
}

const StyledQuizBody = styled.div<{
  $maxHeightPx?: number | null
  $flexWrap?: boolean
  $fillToMaxHeight?: boolean
  $fillToMaxHeightOnTablet?: boolean
}>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 50px;
  padding-top: 25px;
  box-sizing: border-box;

  ${media.tablet} {
    padding: 28px 24px;
  }

  ${media.mobile} {
    padding: 16px 12px;
    gap: 12px;
  }

  ${({ $flexWrap }) =>
    $flexWrap &&
    css`
      flex-wrap: wrap;
    `}

  ${({ $maxHeightPx, $fillToMaxHeight, $fillToMaxHeightOnTablet }) =>
    $maxHeightPx != null &&
    css`
      max-height: ${$maxHeightPx}px;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      -webkit-overflow-scrolling: touch;

      ${$fillToMaxHeight &&
      css`
        /* 자식이 max-height:% 기반 레이아웃(예: Summary2 SentencePanel 45%) 을 쓰기 위해
           부모에게도 명시적 height 를 부여. 부모가 height:auto 이면 % 는 none 으로 해석됨. */
        height: ${$maxHeightPx}px;
        overflow-y: auto;
      `}

      ${$fillToMaxHeightOnTablet &&
      css`
        ${media.tablet} {
          height: ${$maxHeightPx}px;
          overflow-y: auto;
        }

        ${media.touchTablet} {
          height: ${$maxHeightPx}px;
          overflow-y: auto;
        }
      `}
    `}
`

export const QuizBody = forwardRef<HTMLDivElement, QuizBodyProps>(
  function QuizBody(
    {
      $maxHeightPx,
      $flexWrap,
      $fillToMaxHeight,
      $fillToMaxHeightOnTablet,
      ...rest
    },
    ref,
  ) {
    const viewportMaxHeightPx = useQuizBodyMaxHeightPx()
    const cap =
      $maxHeightPx === null
        ? null
        : $maxHeightPx !== undefined
          ? $maxHeightPx
          : viewportMaxHeightPx

    return (
      <StyledQuizBody
        ref={ref}
        $flexWrap={$flexWrap}
        $maxHeightPx={cap}
        $fillToMaxHeight={$fillToMaxHeight}
        $fillToMaxHeightOnTablet={$fillToMaxHeightOnTablet}
        {...rest}
      />
    )
  },
)
