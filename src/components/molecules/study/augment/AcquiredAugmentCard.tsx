import { styled } from 'styled-components'

import AugmentBadge from '@components/atoms/study/augment/AugmentBadge'
import AugmentCardContent from '@components/atoms/study/augment/AugmentCardContent'
import AugmentCardDescription from '@components/atoms/study/augment/AugmentCardDescription'
import { AugmentTier } from '@interfaces/study/remix/AugmentTier'
import {
  getTierBgColor,
  getTierBorderColor,
  PRISM_GRADIENT,
} from '@utils/study/remix/tierStyles'

type AcquiredAugmentCardProps = {
  id: string
  tier: AugmentTier
  descriptionKor: string
}

/**
 * AcquiredAugmentsModal 카드 — 획득한 증강을 단순 표시 (선택/hover 없음).
 * - tier별 background/border 색
 * - 상단 ID badge + tier 색의 설명 텍스트
 */
export default function AcquiredAugmentCard({
  id,
  tier,
  descriptionKor,
}: AcquiredAugmentCardProps) {
  return (
    <CardRoot tier={tier}>
      <AugmentCardContent $gap={8} $padding={16} $fullWidth>
        <AugmentBadge>{id}</AugmentBadge>
        <AugmentCardDescription tier={tier} $variant='acquired'>
          {descriptionKor}
        </AugmentCardDescription>
      </AugmentCardContent>
    </CardRoot>
  )
}

const CardRoot = styled.div<{ tier: AugmentTier }>`
  width: 120px;
  min-height: 140px;
  border-radius: 16px;
  background-color: ${({ tier }) => getTierBgColor(tier)};
  background-image: ${({ tier }) =>
    tier === 'titanium' ? PRISM_GRADIENT(false) : 'none'};
  border: 3px solid ${({ tier }) => getTierBorderColor(tier)};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`
