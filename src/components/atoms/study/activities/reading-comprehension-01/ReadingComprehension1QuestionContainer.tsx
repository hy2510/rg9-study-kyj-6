import styled from 'styled-components'

import { media } from '@src/styles/tokens/breakpoints'

export const ReadingComprehension1QuestionContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 50px;
  padding: 0 8px;

  ${media.mobile} {
    min-height: 0;
  }
`
