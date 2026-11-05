import { useLayoutEffect, useRef, useState } from 'react'

import { coverSkeletonShimmer, floatBob } from '@styles/tokens/animations'
import styled from 'styled-components'

type IntroCoverBookProps = {
  coverSrc: string
}

export default function IntroCoverBook({ coverSrc }: IntroCoverBookProps) {
  const [coverImageLoaded, setCoverImageLoaded] = useState(false)
  const coverImgRef = useRef<HTMLImageElement | null>(null)

  useLayoutEffect(() => {
    const img = coverImgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setCoverImageLoaded(true)
    } else {
      setCoverImageLoaded(false)
    }
  }, [coverSrc])

  return (
    <CoverWrap>
      {coverSrc ? (
        <CoverBookSlot>
          <CoverImage
            ref={coverImgRef}
            src={coverSrc}
            alt=''
            decoding='async'
            $loaded={coverImageLoaded}
            onLoad={() => setCoverImageLoaded(true)}
            onError={() => setCoverImageLoaded(true)}
          />
          {!coverImageLoaded && <CoverSkeleton aria-hidden />}
        </CoverBookSlot>
      ) : (
        <CoverFallback aria-hidden />
      )}
    </CoverWrap>
  )
}

const CoverWrap = styled.div`
  width: 180px;
  overflow: visible;
  /* animation: ${floatBob} 2.8s ease-in-out infinite; */
`

const CoverBookSlot = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 20px;
  border: 2px solid #ffffff;
  overflow: hidden;
  background: #e2e8f0;
`

const CoverSkeleton = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 17px;
  pointer-events: none;
  background: linear-gradient(110deg, #e2e8f0 0%, #f8fafc 42%, #e2e8f0 84%);
  background-size: 200% 100%;
  animation: ${coverSkeletonShimmer} 1.35s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: #e2e8f0;
  }
`

const CoverImage = styled.img<{ $loaded: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.4s ease;
`

const CoverFallback = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: linear-gradient(145deg, #8ba8c8 0%, #5a7088 100%);
`
