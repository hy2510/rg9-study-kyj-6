import { styled } from 'styled-components'

/**
 * 카드 내부 세로 스택 layout.
 * - $gap: column gap (Augment 12, Acquired 8)
 * - $padding: 내부 padding (Augment 20, Acquired 16)
 * - $fullWidth: width 100% (Acquired 카드만 사용)
 */
const AugmentCardContent = styled.div<{
  $gap?: number
  $padding?: number
  $fullWidth?: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ $gap = 12 }) => $gap}px;
  padding: ${({ $padding = 20 }) => $padding}px;
  ${({ $fullWidth }) => ($fullWidth ? 'width: 100%;' : '')}
`

export default AugmentCardContent
