import { useCallback, useEffect, useRef, useState } from 'react'

import { useStudyVisibility } from '@contexts/StudyVisibilityContext'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'

const DEFAULT_QUESTION_AUDIO = {
  isInfinitePlay: true,
  enablePlayCount: 0,
  playback: 1 as const,
}

type UseQuestionAudioOptions = {
  augmentOptions?: AugmentOptions
  autoPlay?: boolean
  /**
   * 같은 `soundUrl` 이어도 값이 바뀌면 재생을 다시 트리거하는 키.
   * 예) 같은 quiz 안에서 오답 후 재시도 직전 음원 재생 트리거에 사용.
   */
  replayKey?: string | number
}

export type QuestionAudioController = {
  isPlaying: boolean
  canPlay: boolean
  play: () => void
  stop: () => void
}

/**
 * 질문 음원 재생 컨트롤러 hook.
 *
 * 책임 — 단일 audio 인스턴스 + 재생/정지 상태 + augment 정책 (재생 횟수/속도/enable).
 * 시각 표시(아이콘 토글)는 별도 atom(SoundPlayToggleIcon) 이 담당하며,
 * 본 hook 이 노출하는 `isPlaying` / `canPlay` 를 prop 으로 받아 합성한다.
 */
export function useQuestionAudio(
  soundUrl: string,
  options: UseQuestionAudioOptions = {},
): QuestionAudioController {
  const { augmentOptions, autoPlay = false, replayKey } = options
  const isStudyVisible = useStudyVisibility()

  const questionAudio = augmentOptions?.questionAudio ?? DEFAULT_QUESTION_AUDIO
  const { isInfinitePlay, enablePlayCount, playback } = questionAudio

  const [isPlaying, setIsPlaying] = useState(false)
  const [remainingPlayCount, setRemainingPlayCount] = useState(enablePlayCount)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 새 문제(soundUrl)로 진입할 때마다 남은 재생 횟수 초기화
  useEffect(() => {
    setRemainingPlayCount(enablePlayCount)
  }, [soundUrl, enablePlayCount])

  const canPlay = isInfinitePlay || remainingPlayCount > 0

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const play = useCallback(() => {
    if (!soundUrl) return
    if (!canPlay) return
    stop()
    const audio = new Audio(soundUrl)
    audioRef.current = audio
    audio.playbackRate = playback

    const clearPlaying = () => {
      if (audioRef.current === audio) {
        audioRef.current = null
        setIsPlaying(false)
      }
    }

    audio.addEventListener('play', () => {
      setIsPlaying(true)
      if (!isInfinitePlay) {
        setRemainingPlayCount((c) => c - 1)
      }
    })
    audio.addEventListener('ended', clearPlaying)
    audio.addEventListener('error', () => {
      console.error('Audio play failed')
      clearPlaying()
    })

    audio.play().catch((err) => {
      console.error('Audio play failed:', err)
      clearPlaying()
    })
  }, [soundUrl, stop, canPlay, isInfinitePlay, playback])

  // 자동 재생 — soundUrl 또는 replayKey 변경 시 트리거 (autoPlay 로만 제어)
  useEffect(() => {
    if (soundUrl && autoPlay) {
      play()
    }
  }, [autoPlay, soundUrl, play, replayKey])

  // Study 비가시 전환 시 즉시 정지
  useEffect(() => {
    if (isStudyVisible) return
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [isStudyVisible])

  // soundUrl / replayKey 변경 또는 언마운트 시 이전 audio cleanup
  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      audioRef.current = null
    }
  }, [soundUrl, replayKey])

  return { isPlaying, canPlay, play, stop }
}
