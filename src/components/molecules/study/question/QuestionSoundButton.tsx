import { ButtonSoundPlay } from '@components/molecules/study/audio/ButtonSoundPlay'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'

type QuestionSoundButtonProps = {
  soundUrl?: string
  autoPlay?: boolean
  augmentOptions?: AugmentOptions
  forceEnable?: boolean
  /**
   * 같은 `soundUrl` 이어도 값이 바뀌면 재생을 다시 트리거하는 키.
   * 같은 quiz 내 재시도 시 음원 재생이 필요한 활동에서 사용.
   */
  replayKey?: string | number
}

export default function QuestionSoundButton({
  soundUrl,
  autoPlay = true,
  augmentOptions,
  forceEnable = true,
  replayKey,
}: QuestionSoundButtonProps) {
  const enabled = augmentOptions?.questionAudio?.enableSound ?? forceEnable
  if (!enabled) return null

  return (
    <ButtonSoundPlay
      position='left-top'
      soundUrl={soundUrl ?? ''}
      augmentOptions={augmentOptions}
      autoPlay={autoPlay}
      replayKey={replayKey}
    />
  )
}
