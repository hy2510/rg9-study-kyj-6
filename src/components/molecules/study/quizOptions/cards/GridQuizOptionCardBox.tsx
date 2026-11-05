import { media } from '@styles/tokens/breakpoints'
import styled, { css } from 'styled-components'

import {
  QuizSelectableFeedbackBox,
  quizSelectablePressedStyle,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

/** 단일 열 전체 너비 선택 카드 — box-shadow(3px) 여유 */
export const QUIZ_OPTION_CARD_WIDTH_FULL = 'calc(100% - 32px)'

/** 2열 그리드 셀 내부 선택 카드 — box-shadow(3px) 여유 */
export const QUIZ_OPTION_CARD_WIDTH_GRID = 'calc(100% - 34px)'

/** 2열 그리드 등에 쓰는 텍스트 선택 카드 (어휘·클로즈 공통 레이아웃) */
export const GridQuizOptionCardBox = styled(QuizSelectableFeedbackBox)<{
  /** 2열 grid 셀 안 (B1·B3·클로즈 등) */
  $isInGrid?: boolean
  /** OptionCardsRow flex 행 안 (A2·A3·A4 등) */
  $inRow?: boolean
}>`
  cursor: pointer;
  box-sizing: border-box;
  max-width: 100%;
  width: ${({ $isInGrid, $inRow }) => {
    if ($isInGrid) return QUIZ_OPTION_CARD_WIDTH_GRID
    if ($inRow) return '100%'
    return QUIZ_OPTION_CARD_WIDTH_FULL
  }};
  min-height: 36px;
  height: fit-content;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  transition: all 0.05s ease;

  ${({ $inRow }) =>
    $inRow &&
    css`
      flex: 1;
      min-width: 0;
    `}

  ${media.mobile} {
    width: 100%;
    padding: 12px;
    min-height: 44px;
  }

  ${({ $isCorrect }) => $isCorrect && quizSelectablePressedStyle}
`
