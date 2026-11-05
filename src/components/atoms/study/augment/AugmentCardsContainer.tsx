import { styled } from 'styled-components'

/**
 * 카드 그리드.
 * - $gap: 카드 사이 간격 (Augment 24, Acquired 16)
 */
const AugmentCardsContainer = styled.div<{ $gap?: number }>`
  display: flex;
  justify-content: center;
  gap: ${({ $gap = 24 }) => $gap}px;
  flex-wrap: wrap;
`

export default AugmentCardsContainer
