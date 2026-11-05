import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

export const SentencePanel = styled.div`
  flex: 1;
  padding: 24px;
  background: #fff;
  border-radius: 24px;
  border: 1.5px solid #e9edf3;
  line-height: 3;

  /* 타이핑형 Cloze에서는 문장 영역이 먼저 줄어들고 키보드 공간은 보존한다. */
  ${media.tablet} {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }

  ${media.touchTablet} {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }
`
