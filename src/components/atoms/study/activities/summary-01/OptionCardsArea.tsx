import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

export const OptionCardsArea = styled.div`
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 360px);
  max-height: calc(100dvh - 360px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-bottom: 4px;

  ${media.mobile} {
    max-height: calc(100vh - 300px);
    max-height: calc(100dvh - 300px);
  }
`
