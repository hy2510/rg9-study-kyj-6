import { TEXT_SHADOW_DEFAULT } from '@styles/tokens/textShadow'
import { styled } from 'styled-components'

import AugmentCardContent from '@components/atoms/study/augment/AugmentCardContent'
import AugmentCardDescription from '@components/atoms/study/augment/AugmentCardDescription'
import { AugmentTier } from '@interfaces/study/remix/AugmentTier'
import {
  getTierBgColor,
  getTierBorderColor,
  getTierHoverBorderColor,
  getTierHoverShadow,
  getTierNumberColor,
  getTierSelectedShadow,
  PRISM_GRADIENT,
  prismShiftAnimation,
} from '@utils/study/remix/tierStyles'

type SelectableAugmentCardProps = {
  id: string
  tier: AugmentTier
  descriptionKor: string
  isSelected: boolean
  onClick: () => void
}

/**
 * Augment 모달의 선택 가능한 카드.
 * - tier별 background/border/text 색
 * - selected/hover/active 인터랙션
 * - titanium 은 프리즘 그라데이션 + shift 애니메이션
 */
export default function SelectableAugmentCard({
  id,
  tier,
  descriptionKor,
  isSelected,
  onClick,
}: SelectableAugmentCardProps) {
  return (
    <CardRoot tier={tier} isSelected={isSelected} onClick={onClick}>
      <AugmentCardContent>
        <CardNumber tier={tier}>{id}</CardNumber>
        <AugmentCardDescription tier={tier} $variant='selectable'>
          {descriptionKor}
        </AugmentCardDescription>
      </AugmentCardContent>
    </CardRoot>
  )
}

const CardRoot = styled.div<{ isSelected?: boolean; tier: AugmentTier }>`
  width: 120px;
  height: 180px;
  border-radius: 16px;
  background-color: ${({ tier, isSelected }) =>
    getTierBgColor(tier, isSelected)};
  background-image: ${({ tier, isSelected }) =>
    tier === 'titanium' ? PRISM_GRADIENT(!!isSelected) : 'none'};
  background-size: ${({ tier }) =>
    tier === 'titanium' ? '200% 200%' : 'auto'};
  animation: ${({ tier }) =>
    tier === 'titanium' ? 'prismShift 3s ease infinite' : 'none'};
  border: 3px solid
    ${({ tier, isSelected }) => getTierBorderColor(tier, isSelected)};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ tier, isSelected }) =>
    isSelected ? getTierSelectedShadow(tier) : 'none'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ tier, isSelected }) =>
      getTierHoverShadow(tier, !!isSelected)};
    border-color: ${({ tier, isSelected }) =>
      getTierHoverBorderColor(tier, !!isSelected)};
  }

  &:active {
    transform: translateY(-2px);
  }

  ${prismShiftAnimation}
`

const CardNumber = styled.div<{ tier: AugmentTier }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ tier }) => getTierNumberColor(tier)};
  text-align: center;
  word-break: break-word;
  text-shadow: ${TEXT_SHADOW_DEFAULT};
`
