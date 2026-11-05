import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'

type SoundPlayToggleIconProps = {
  isPlaying: boolean
  disabled?: boolean
  onClick: () => void
  size?: number
  icon?: React.ReactNode
}

/**
 * 음원 재생/정지 시각 표시 + 클릭 콜백 atom.
 *
 * 책임 — 아이콘 토글(`isPlaying` → play/stop 아이콘) 과 클릭 이벤트 위임.
 * 실제 audio 재생/정지/정책 처리는 호출자(보통 `useQuestionAudio` hook) 가 책임진다.
 */
export function SoundPlayToggleIcon({
  isPlaying,
  disabled = false,
  onClick,
  size = 40,
  icon = <IconSoundPlay width={size} height={size} />,
}: SoundPlayToggleIconProps) {
  return (
    <ToggleButtonStyled
      onClick={() => {
        if (disabled) return
        onClick()
      }}
      $disabled={disabled}
      $size={size}
      role='button'
      aria-disabled={disabled}
      aria-pressed={isPlaying}
    >
      {isPlaying ? <IconSoundStop width={size} height={size} /> : icon}
    </ToggleButtonStyled>
  )
}

const ToggleButtonStyled = styled.div<{ $disabled?: boolean; $size: number }>`
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.05s ease;
  opacity: ${(props) => (props.$disabled ? 0.45 : 1)};

  &:active {
    transform: ${(props) =>
      props.$disabled ? 'none' : 'scale(0.98) translateY(1px)'};
  }

  img,
  svg {
    width: ${(props) => props.$size}px;
    height: ${(props) => props.$size}px;
  }

  ${media.mobile} {
    width: 32px;
    height: 32px;

    img,
    svg {
      width: 32px;
      height: 32px;
    }
  }
`
