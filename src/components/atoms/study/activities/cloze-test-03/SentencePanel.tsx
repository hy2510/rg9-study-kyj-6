import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

export const SentencePanel = styled.div`
  flex: 1;
  padding: 24px;
  background: #fff;
  border-radius: 24px;
  border: 1.5px solid #e9edf3;
  line-height: 2;

  /* 긴 지문은 이 영역 안에서 스크롤하고 하단 키보드는 항상 노출한다. */
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
