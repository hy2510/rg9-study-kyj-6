import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

export const OptionCardsArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 8px 0;
  overflow-y: auto;

  ${media.tablet} {
    justify-content: flex-start;
  }
`
