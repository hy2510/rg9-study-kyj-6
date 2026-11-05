import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

export const SentencePanel = styled.div<{ $isCompleted?: boolean }>`
  flex: 0 1 auto;
  min-height: 0;
  max-height: ${(props) => (props.$isCompleted ? 'none' : '45%')};
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border-radius: 24px;
  border: 1.5px solid #e9edf3;
  background: #fff;
  overflow-y: auto;

  ${media.mobile} {
    flex: 1 1 0;
    max-height: none;
  }
`
