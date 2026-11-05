import styled, { keyframes } from 'styled-components'

const skeletonShimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

/**
 * 카드 이미지 영역 로딩용 스켈레톤 (부모에 `position: relative` 필요).
 * 기존 `.card-image-skeleton` 스타일과 동일한 shimmer 시각.
 */
export const CardImageSkeleton = styled.div.attrs({
  'aria-hidden': true,
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #e9edf3 0%, #f5f7fa 50%, #e9edf3 100%);
  background-size: 200% 100%;
  animation: ${skeletonShimmer} 1.5s ease-in-out infinite;
`
