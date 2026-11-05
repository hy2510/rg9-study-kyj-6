import { type ReactNode } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

import { QuestionSoundPlacement } from '@contexts/QuestionSoundSlotContext'

/** 좌측 상단 오버레이 버튼 컨테이너 (사운드 버튼 등) */
export function SoundPlayButtonWrap({ children }: { children: ReactNode }) {
  return (
    <QuestionSoundPlacement
      fallback={
        <SoundPlayButtonWrapFallback>{children}</SoundPlayButtonWrapFallback>
      }
    >
      {children}
    </QuestionSoundPlacement>
  )
}

const SoundPlayButtonWrapFallback = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
  z-index: 2;

  ${media.mobile} {
    top: 8px;
    left: 8px;
  }
`

/** 우측 상단 오버레이 버튼 컨테이너 (다음 단계 이동 버튼 등) */
export const AugmentNextButtonWrap = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  z-index: 2;

  ${media.mobile} {
    top: 8px;
    right: 8px;
  }
`

/** 원형 투명 버튼 — 사운드 토글 / 다음 단계 이동 공통 사용 */
export const ActivityRoundButton = styled.button<{ $size?: number }>`
  cursor: pointer;
  width: ${(p) => p.$size ?? 60}px;
  height: ${(p) => p.$size ?? 60}px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.05s ease;

  &:active {
    transform: scale(0.98) translateY(1px);
  }

  img,
  svg {
    width: ${(p) => p.$size ?? 60}px;
    height: ${(p) => p.$size ?? 60}px;
  }

  ${media.mobile} {
    width: ${(p) => (p.$size != null ? 32 : 44)}px;
    height: ${(p) => (p.$size != null ? 32 : 44)}px;

    img,
    svg {
      width: ${(p) => (p.$size != null ? 32 : 44)}px;
      height: ${(p) => (p.$size != null ? 32 : 44)}px;
    }
  }
`

/** 퀴즈 본문 flex 컨테이너 */
export const MainContentBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0;
`
