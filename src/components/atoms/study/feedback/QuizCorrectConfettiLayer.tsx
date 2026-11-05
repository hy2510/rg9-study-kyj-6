/** 정답 confetti burst 오버레이 (애니메이션 종료 직후 DOM에서 제거) */
import { type ReactNode,useEffect, useState } from 'react'

import { confettiExplosion } from '@styles/tokens/animations'
import styled from 'styled-components'

import ASSETS from '@utils/Assets'

type QuizCorrectConfettiLayerProps = {
  burstKey?: number | null
  onBurstEnd?: () => void
  children: ReactNode
  className?: string
}

export default function QuizCorrectConfettiLayer({
  burstKey = null,
  onBurstEnd,
  children,
  className,
}: QuizCorrectConfettiLayerProps) {
  const [visibleBurstKey, setVisibleBurstKey] = useState<number | null>(null)

  useEffect(() => {
    if (burstKey == null) {
      setVisibleBurstKey(null)
      return
    }
    setVisibleBurstKey(burstKey)
  }, [burstKey])

  const handleBurstAnimationEnd = () => {
    setVisibleBurstKey(null)
    onBurstEnd?.()
  }

  return (
    <Layer className={className}>
      {visibleBurstKey != null && (
        <ConfettiViewport aria-hidden>
          <ConfettiBurst
            key={visibleBurstKey}
            onAnimationEnd={handleBurstAnimationEnd}
          />
        </ConfettiViewport>
      )}
      {children}
    </Layer>
  )
}

const Layer = styled.div`
  position: relative;
  width: 100%;
`

const ConfettiViewport = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
  pointer-events: none;
  z-index: 100;
`

const ConfettiBurst = styled.div`
  width: min(900px, 100vw);
  height: min(520px, 70vh);
  background-image: url(${ASSETS.Common.correctionConfetti});
  background-size: 100%;
  background-position: top center;
  background-repeat: no-repeat;
  transform-origin: center top;
  will-change: transform, opacity;
  animation: ${confettiExplosion} 2.5s ease-out forwards;
`
