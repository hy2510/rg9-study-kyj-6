import { styled } from 'styled-components'

import {
  quizSelectablePressedStyle,
  resolveQuizSelectableFeedback,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

/** 요약 유형 전체 너비 보기 선택 버튼 */
export const StudySummaryOptionCardButton = styled.button<{
  $pressed?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
}>`
  cursor: pointer;
  width: 100%;
  border-radius: 20px;
  padding: 16px;
  transition: all 0.05s ease;
  border: ${(props) =>
    resolveQuizSelectableFeedback({
      $isCorrect: props.$isCorrect,
      $isIncorrect: props.$isIncorrect,
    }).border};
  background: ${(props) =>
    resolveQuizSelectableFeedback({
      $isCorrect: props.$isCorrect,
      $isIncorrect: props.$isIncorrect,
    }).bg};
  box-shadow: ${(props) =>
    resolveQuizSelectableFeedback({
      $isCorrect: props.$isCorrect,
      $isIncorrect: props.$isIncorrect,
    }).boxShadow};

  ${(props) => props.$pressed && quizSelectablePressedStyle}

  &:disabled {
    cursor: not-allowed;
  }

`
