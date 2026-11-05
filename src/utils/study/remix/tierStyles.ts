import { css } from 'styled-components'

import { AugmentTier } from '@interfaces/study/remix/AugmentTier'

/** titanium 전용 프리즘 그라데이션 (선택 여부에 따라 alpha 조정) */
export const PRISM_GRADIENT = (selected: boolean) => `linear-gradient(135deg,
  rgba(138, 43, 226, ${selected ? 0.8 : 0.6}) 0%,
  rgba(75, 0, 130, ${selected ? 0.8 : 0.6}) 25%,
  rgba(0, 0, 255, ${selected ? 0.8 : 0.6}) 50%,
  rgba(0, 128, 128, ${selected ? 0.8 : 0.6}) 75%,
  rgba(138, 43, 226, ${selected ? 0.8 : 0.6}) 100%)`

/** tier별 카드 background-color (titanium 은 transparent + background-image 사용) */
export function getTierBgColor(tier: AugmentTier, selected = false): string {
  if (selected) {
    switch (tier) {
      case 'silver':
        return '#e8e8e8'
      case 'gold':
        return '#ffd700'
      case 'emerald':
        return '#50c878'
      case 'titanium':
        return 'transparent'
      default:
        return '#e3f2fd'
    }
  }
  switch (tier) {
    case 'silver':
      return '#c0c0c0'
    case 'gold':
      return '#ffb300'
    case 'emerald':
      return '#00a86b'
    case 'titanium':
      return 'transparent'
    default:
      return '#f5f5f5'
  }
}

/** tier별 카드 border 색 */
export function getTierBorderColor(
  tier: AugmentTier,
  selected = false,
): string {
  if (selected) {
    switch (tier) {
      case 'silver':
        return '#808080'
      case 'gold':
        return '#ff8c00'
      case 'emerald':
        return '#008b45'
      case 'titanium':
        return '#9370db'
      default:
        return '#2196f3'
    }
  }
  switch (tier) {
    case 'silver':
      return '#a0a0a0'
    case 'gold':
      return '#ffa500'
    case 'emerald':
      return '#00a86b'
    case 'titanium':
      return '#8a2be2'
    default:
      return '#e0e0e0'
  }
}

/** tier별 hover border 색 */
export function getTierHoverBorderColor(
  tier: AugmentTier,
  selected = false,
): string {
  if (selected) {
    switch (tier) {
      case 'silver':
        return '#606060'
      case 'gold':
        return '#ff8c00'
      case 'emerald':
        return '#008b45'
      case 'titanium':
        return '#9370db'
      default:
        return '#2196f3'
    }
  }
  switch (tier) {
    case 'silver':
      return '#808080'
    case 'gold':
      return '#ffa500'
    case 'emerald':
      return '#00a86b'
    case 'titanium':
      return '#9370db'
    default:
      return '#bdbdbd'
  }
}

/** tier별 카드 text 색 (Number/숫자) */
export function getTierNumberColor(tier: AugmentTier): string {
  switch (tier) {
    case 'silver':
      return '#333'
    case 'gold':
      return '#1a1a1a'
    case 'emerald':
    case 'titanium':
      return '#ffffff'
    default:
      return '#333'
  }
}

/** tier별 description 색 */
export function getTierDescriptionColor(tier: AugmentTier): string {
  switch (tier) {
    case 'silver':
      return '#555'
    case 'gold':
      return '#2a2a2a'
    case 'emerald':
    case 'titanium':
      return '#f0f0f0'
    default:
      return '#666'
  }
}

/** tier별 selected box-shadow */
export function getTierSelectedShadow(tier: AugmentTier): string {
  switch (tier) {
    case 'silver':
      return '0 4px 12px rgba(128, 128, 128, 0.4)'
    case 'gold':
      return '0 4px 12px rgba(255, 215, 0, 0.5)'
    case 'emerald':
      return '0 4px 12px rgba(0, 168, 107, 0.5)'
    case 'titanium':
      return '0 4px 12px rgba(138, 43, 226, 0.6), 0 0 20px rgba(138, 43, 226, 0.3)'
    default:
      return '0 4px 12px rgba(33, 150, 243, 0.3)'
  }
}

/** hover 시 box-shadow */
export function getTierHoverShadow(
  tier: AugmentTier,
  selected = false,
): string {
  if (tier === 'titanium') {
    return selected
      ? '0 6px 20px rgba(138, 43, 226, 0.7), 0 0 30px rgba(138, 43, 226, 0.4)'
      : '0 6px 20px rgba(138, 43, 226, 0.5), 0 0 25px rgba(138, 43, 226, 0.3)'
  }
  return '0 6px 16px rgba(0, 0, 0, 0.15)'
}

/** titanium 프리즘 애니메이션 keyframes (3s) */
export const prismShiftAnimation = css`
  @keyframes prismShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`
