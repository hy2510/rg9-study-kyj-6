import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { SoundPlayToggleIcon } from '@components/atoms/study/audio/SoundPlayToggleIcon'
import { QuestionSoundPlacement } from '@contexts/QuestionSoundSlotContext'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { useQuestionAudio } from '@src/hooks/study/audio/useQuestionAudio'

type ButtonSoundPlayProps = {
  position: 'left-top' | 'none'
  soundUrl: string
  augmentOptions?: AugmentOptions
  autoPlay?: boolean
  /**
   * 같은 `soundUrl` 이어도 값이 바뀌면 재생을 다시 트리거하는 키.
   * 예) 같은 quiz 안에서 오답 후 재시도 직전 음원 재생 트리거에 사용.
   */
  replayKey?: string | number
}

/**
 * 음원 재생 버튼.
 *
 * 책임 — 위치(레이아웃) 조합 + `useQuestionAudio` 로직과 `SoundPlayToggleIcon` 시각의 결합.
 * 재생/정지/정책 처리는 hook, 아이콘 토글은 atom 이 담당한다.
 */
export function ButtonSoundPlay({
  position,
  soundUrl,
  augmentOptions,
  autoPlay = false,
  replayKey,
}: ButtonSoundPlayProps) {
  const { isPlaying, canPlay, play, stop } = useQuestionAudio(soundUrl, {
    augmentOptions,
    autoPlay,
    replayKey,
  })

  const handleClick = () => {
    if (!soundUrl) return
    if (!canPlay) return
    if (isPlaying) {
      stop()
      return
    }
    play()
  }

  const soundButton = (
    <SoundPlayToggleIcon
      isPlaying={Boolean(soundUrl) && isPlaying}
      disabled={!soundUrl || !canPlay}
      onClick={handleClick}
    />
  )

  if (position !== 'left-top') return soundButton

  return (
    <QuestionSoundPlacement
      fallback={
        <SoundPlayButtonWrapper>{soundButton}</SoundPlayButtonWrapper>
      }
    >
      {soundButton}
    </QuestionSoundPlacement>
  )
}

const SoundPlayButtonWrapper = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;

  ${media.tablet} {
    top: -24px;
    left: -4px;
  }
`
