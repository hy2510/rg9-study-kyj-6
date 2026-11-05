import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

import { MainContentBox } from '@components/atoms/study/layout/ActivityLayout'

export const Summary2Root = styled.div`
  position: relative;
  width: 100%;

  ${media.mobile} {
    ${MainContentBox} {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
  }
`
