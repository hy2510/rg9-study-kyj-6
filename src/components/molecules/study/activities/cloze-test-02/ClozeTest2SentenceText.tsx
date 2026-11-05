import { styled } from 'styled-components'

import BlankFilledText from '@components/atoms/study/blanks/BlankFilledText'
import BlankSlot from '@components/atoms/study/blanks/BlankSlot'

export const ClozeTest2SentenceText = styled.span`
  display: inline;
  font-size: 1.1em;
  font-weight: 500;
  color: #3c4b62;
  line-height: 2;
  text-align: left;

  ${BlankSlot} {
    gap: 0;
    margin-inline: 1px;
  }

  ${BlankSlot} > span {
    width: 0.72em;
    min-width: 0.72em;
  }

  ${BlankFilledText} {
    margin-inline: 1px;
  }
`
