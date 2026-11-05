import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

/**
 * 모달 배경 dim 오버레이.
 * - $clickable: true 면 cursor: pointer 로 클릭으로 닫을 수 있음을 시각적으로 안내.
 */
const AugmentOverlay = styled.div<{ $clickable?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  ${media.mobile} {
    padding: 0 16px;
    box-sizing: border-box;
  }
`

export default AugmentOverlay
