import { TEXT_SHADOW_SOFT } from '@styles/tokens/textShadow'
import { styled } from 'styled-components'

import { AugmentTier } from '@interfaces/study/remix/AugmentTier'
import { getTierDescriptionColor } from '@utils/study/remix/tierStyles'

/**
 * tier별 색상이 적용된 카드 설명 텍스트.
 * - $variant: 'selectable'(Augment) | 'acquired'(Acquired) - 폰트 사이즈/스타일 차이
 */
const AugmentCardDescription = styled.div<{
  tier: AugmentTier
  $variant?: 'selectable' | 'acquired'
}>`
  font-size: ${({ $variant }) => ($variant === 'acquired' ? '1em' : '14px')};
  color: ${({ tier }) => getTierDescriptionColor(tier)};
  text-align: center;
  ${({ $variant }) =>
    $variant === 'acquired'
      ? 'line-height: 1.3;'
      : `text-shadow: ${TEXT_SHADOW_SOFT};`}
`

export default AugmentCardDescription
