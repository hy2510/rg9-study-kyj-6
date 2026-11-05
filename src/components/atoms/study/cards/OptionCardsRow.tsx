import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

export const OptionCardsRow = styled.div<{
  $direction?: 'row' | 'column'
  $mobileDirection?: 'row' | 'column'
}>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
  gap: 12px;
  width: 100%;
  box-sizing: border-box;

  ${media.mobile} {
    gap: 8px;
    flex-direction: ${({ $mobileDirection, $direction = 'row' }) =>
      $mobileDirection ?? $direction};
  }
`
