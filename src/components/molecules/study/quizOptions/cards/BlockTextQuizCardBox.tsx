import { styled } from 'styled-components'

import { QuizSelectableFeedbackBox } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

/** O/X·독해 등 블록형 텍스트 선택 행 */
export const BlockTextQuizCardBox = styled(QuizSelectableFeedbackBox)`
  cursor: pointer;
  width: calc(100% - 32px);
  min-height: 28px;
  height: fit-content;
  border-radius: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px;
  transition: all 0.05s ease;
`
