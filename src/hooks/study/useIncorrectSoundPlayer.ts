import { useCallback, useEffect, useRef } from 'react'

import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'

/**
 * 오답 효과음(correction-incorrect) 재생/정리를 담당하는 훅.
 *
 * - `play()` 호출 시 기존 재생을 중단하고 새 Audio 인스턴스를 재생한다.
 * - `stop()` 은 재생을 중단하고 ref 를 비운다.
 * - 언마운트 시 자동으로 `stop()` 을 호출해 재생이 누적되지 않도록 한다.
 */
export function useIncorrectSoundPlayer() {
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    incorrectAudioRef.current?.pause()
    incorrectAudioRef.current = null
  }, [])

  const play = useCallback(() => {
    incorrectAudioRef.current?.pause()
    const audio = new Audio(correctionIncorrectSound)
    incorrectAudioRef.current = audio
    audio.play().catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      incorrectAudioRef.current?.pause()
      incorrectAudioRef.current = null
    }
  }, [])

  return { play, stop }
}
