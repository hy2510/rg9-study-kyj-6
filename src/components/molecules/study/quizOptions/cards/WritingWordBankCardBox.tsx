import { styled } from 'styled-components'

import {
  quizSelectablePressedStyle,
  resolveQuizSelectableFeedback,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

/** 쓰기 활동 단어 뱅크 칩 ($isEmpty 시 회색 고정) */
export const WritingWordBankCardBox = styled.button<{
  $isEmpty?: boolean
  $pressed?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
}>`
  min-width: 80px;
  padding: 12px 16px;
  border-radius: 15px;
  cursor: pointer;
  border: ${(props) =>
    props.$isEmpty
      ? '1.5px solid #e9edf3'
      : resolveQuizSelectableFeedback({
          $isCorrect: props.$isCorrect,
          $isIncorrect: props.$isIncorrect,
        }).border};
  background: ${(props) =>
    props.$isEmpty
      ? '#e9edf3'
      : resolveQuizSelectableFeedback({
          $isCorrect: props.$isCorrect,
          $isIncorrect: props.$isIncorrect,
        }).bg};
  box-shadow: ${(props) =>
    props.$isEmpty
      ? 'none'
      : resolveQuizSelectableFeedback({
          $isCorrect: props.$isCorrect,
          $isIncorrect: props.$isIncorrect,
        }).boxShadow};

  ${(props) => props.$pressed && !props.$isEmpty && quizSelectablePressedStyle}

  &:disabled {
    cursor: ${(props) => (props.$isEmpty ? 'default' : 'not-allowed')};
  }
`
