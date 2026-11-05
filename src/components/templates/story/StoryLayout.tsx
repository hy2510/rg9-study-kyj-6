/** 전체 화면 Story 레이아웃 wrapper (헤더·본문 absolute 배치) */
import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

export const StoryViewWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
  box-sizing: border-box;
`

export const StoryBodyWrapper = styled.div`
  position: absolute;
  padding-top: 0;
  padding-bottom: 0;
  left: 0;
  right: 0;
  top: 8px;
  bottom: 0;
  overflow: hidden;

  ${media.mobile} {
    top: 0;
  }
`
