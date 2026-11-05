import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

export const KeyboardWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: center;
  padding: 16px 0;

  ${media.tablet} {
    margin-top: auto;
    padding: 8px 0 0;
  }

  ${media.touchTablet} {
    margin-top: auto;
    padding: 8px 0 0;
  }
`
