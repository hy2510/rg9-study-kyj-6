import { styled } from 'styled-components'

/** 모바일·태블릿: 스와프로 책장 넘김 — 터치 제스처 처리 영역 */
const BookSwipePane = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  touch-action: none;
`

export default BookSwipePane
