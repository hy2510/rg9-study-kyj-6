import { keyframes, styled } from 'styled-components'

import { resolveQuizSelectableFeedback } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const SentenceAreaContainer = styled.div<{
  $isCompleted?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
}>`
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCompleted, $isCorrect }) =>
    $isCompleted && $isCorrect ? 'center' : 'flex-start'};
  padding: 14px 16px;
  border-radius: 25px;
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
  min-height: 120px;
  animation: ${slideDown} 0.2s ease;
`
