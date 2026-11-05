import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

/**
 * Augment 모달 박스. 카드/버튼이 세로로 쌓이는 column 컨테이너.
 * - $gap: 내부 섹션 간격 (Augment 32, Acquired 24)
 * - $scrollable: 세로 스크롤 허용 여부
 */
const AugmentModal = styled.div<{ $gap?: number; $scrollable?: boolean }>`
  background-color: #fff;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 32 }) => $gap}px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  ${({ $scrollable }) => ($scrollable ? 'overflow-y: auto;' : '')}
  cursor: default;

  ${media.mobile} {
    width: 100%;
    padding: 24px 16px;
    border-radius: 16px;
  }
`

export default AugmentModal
