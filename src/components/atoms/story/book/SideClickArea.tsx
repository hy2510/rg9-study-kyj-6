import { styled } from 'styled-components'

/**
 * 좌우 전체 클릭 영역: flex: 1로 책 영역 제외한 나머지 공간 전체를 차지.
 * position: relative → 내부 BottomButton(PlayButton)의 absolute 기준점.
 */
const SideClickArea = styled.button<{
  $side: 'left' | 'right'
  $visible: boolean
}>`
  position: relative;
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: ${({ $visible }) => ($visible ? 'pointer' : 'default')};
  display: flex;
  align-items: center;
  justify-content: ${({ $side }) =>
    $side === 'left' ? 'flex-start' : 'flex-end'};
  pointer-events: auto;
  z-index: 10;
`

export default SideClickArea
