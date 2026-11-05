import { styled } from 'styled-components'

export const AnswerAreaScroll = styled.div<{ $isCompleted?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`
